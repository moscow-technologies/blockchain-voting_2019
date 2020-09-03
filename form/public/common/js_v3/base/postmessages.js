
/**
 * @author Sergey Kashirin 
 */

/**
* iframeId, isParent - only for parent html-page must be setted
*/
function IFrameMessage(originName, channelName, iframeId, isParent){

	iframeId = typeof iframeId !== 'undefined' ?  iframeId : channelName;
	
	isParent = typeof isParent !== 'undefined' ?  isParent : false;
	
	var channel = channelName;
	
	var origin = originName;
	
	function _makeid(){
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 5; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
	
	var msgIdPrefix = _makeid(5);
	
	var msgId = 0;

	if(isParent){
		var Win = document.getElementById(iframeId).contentWindow;
	}else{
		var Win = parent;
	}
	
	function _getNextMessageId(){
		msgId++;
		return msgIdPrefix+'_'+msgId;
	}
	
	function _getCurrentMessageId(){
		return msgIdPrefix+'_'+msgId;
	}
	
	
	
	function _prepareTransferObject(channel, objMsg){
		return JSON.stringify({'channel':channel, 'text':JSON.stringify(objMsg), 'id':_getNextMessageId()});
	}
	
	/**
	* Make request and handle response in callback
	*/
	function request(objMsg, callback){
		
		var objMsgJSON = _prepareTransferObject(channel, objMsg);
		
		(function(currentMsgId){
		
			// prepare listener before send
			
			if (window.addEventListener) {
				window.addEventListener("message", _callbackWrapper(callback, currentMsgId), false);
			}
			else {
				window.attachEvent("onmessage", _callbackWrapper(callback, currentMsgId));
			}
			
			//send message
			
			Win.postMessage(objMsgJSON, origin);
			
		})(_getCurrentMessageId());
		
		
	}
	
	/**
	* callback(message, response)
	* Receive incoming message, processing and call response method
	*/
	function receive(callback){
		
		if (window.addEventListener) {
			window.addEventListener("message", _callbackResponseWrapper(callback), false);
		}
		else {
			window.attachEvent("onmessage", _callbackResponseWrapper(callback));
		}
		
		
		
	}
	
	
	var _onreadyCallable = function(){
		// do nothing by default on ready event
	};
	
	/**
	* event that triggered when object received ready signal from other side
	*/
	function ready(callable){
		_onreadyCallable = callable;
	}
	
	
	// ping-pong routine
	(function(){
	
		var needToPing = true;
	
		function ping(){
			return Win.postMessage('ping_'+channel, origin);
		}
		
		function receivePing(evt){
			if(typeof evt.data != 'undefined'){
				if(evt.data == 'ping_'+channel){
					Win.postMessage('ping_complete_'+channel, origin);
				}
			}
		}
		
		function receivePingComplete(evt){
			if(typeof evt.data != 'undefined'){
				if(evt.data == 'ping_complete_'+channel){
					needToPing = false;
					_onreadyCallable();
				}
			}
		}
		
		
		if (window.addEventListener) {
			window.addEventListener("message", receivePing, false);
			window.addEventListener("message", receivePingComplete, false);
		}
		else {
			window.attachEvent("onmessage", receivePing);
			window.attachEvent("onmessage", receivePingComplete);
		}
		
		/////
		
		
		var pingProcess = setInterval(function(){
			if(needToPing){
				ping();
			}else{
				clearInterval(pingProcess);
			}
		}, 200);
		
		
		
	})();
	
	
	/**
	* Send any js object to channel that IFrameMessage binded in constructor
	*/
	function send(objMsg){
		
		var objMsgJSON = _prepareTransferObject(channel, objMsg);
		
		return Win.postMessage(objMsgJSON, origin);
	}
	
	function _callbackResponseWrapper(callback){
		
		return function(evt){
			if(typeof evt.data != 'undefined'){
				try{
					var objMsg = JSON.parse(evt.data);
					if(typeof objMsg.channel != 'undefined' && typeof objMsg.text != 'undefined'){
						if(objMsg.channel == channel){
							callback(JSON.parse(objMsg.text), function(result){
			
								var objMsgJSON = JSON.stringify({'channel':channel, 'text':JSON.stringify(result), 'id':objMsg.id});
								
								return Win.postMessage(objMsgJSON, origin);
							});
						}
					}
				}catch(err){
				
				}
			}
		}
		
	}
	
	function _callbackWrapper(callback, bindToMessageId){
	
		bindToMessageId = typeof bindToMessageId !== 'undefined' ?  bindToMessageId : false;
		
		return function(evt){
			if(typeof evt.data != 'undefined'){
				try{
					var objMsg = JSON.parse(evt.data);
					if(typeof objMsg.channel != 'undefined' && typeof objMsg.text != 'undefined'){
						if(objMsg.channel == channel){
							if(!bindToMessageId){
								callback(JSON.parse(objMsg.text));
							}else{
								if(bindToMessageId == objMsg.id){
									callback(JSON.parse(objMsg.text));
								}
							}
						}
					}
				}catch(err){
				
				}
			}
		}
		
	}

	/**
	* add callback function for channel
	*/
	function onreceive(callback){
		if (window.addEventListener) {
			window.addEventListener("message", _callbackWrapper(callback), false);
		}
		else {
			window.attachEvent("onmessage", _callbackWrapper(callback));
		}
	}
	
	
	return {
		'send':send,
		'onreceive':onreceive,
		'request':request,
		'receive':receive,
		'ready':ready
	};
	
}

/*

example of usage in event-handler model:
///////////////////////
// for parent html-page
///////////////////////

// bind instance of IFrameMessage to iframe with specific channel name

var XD = IFrameMessage('ch','ifrId', true);

// send something, and prepare receiver callback

XD.send('some text or object to iframe');

XD.onreceive(function(mes){
	console.log('received from child',mes);
});

///////////////////////
// for iframe page
///////////////////////

// bind instance of IFrameMessage to parent window with specific channel name

var XD = IFrameMessage('ch');

// send something, and prepare receiver callback

XD.send('some text or object to parent window');

XD.onreceive(function(mes){
	console.log('received from parent',mes);
});

example of usage in request-response-binded model:
///////////////////////
// for parent html-page
///////////////////////

var XD = IFrameMessage('ch','ifr', true);
			
XD.receive(function(inputMessage, response){

	if(inputMessage == 1){
		
		setTimeout(function(){
			// send delayed response related to request message
			response('one');

		},3000);

	}
	
	if(inputMessage == 10){
		// send response related to request message
		response('ten');
	}
	
	if(inputMessage == 5){
		// send response related to request message
		response('five');
	}
	
	

});

///////////////////////
// for iframe page
///////////////////////

var XD = IFrameMessage('ch');

// bind request and response handler
XD.request(1,function(response){
	console.log('request=1, response='+response);
});
// bind request and response handler
XD.request(10,function(response){
	console.log('request=10, response='+response);
});
// bind request and response handler
XD.request(5,function(response){
	console.log('request=5, response='+response);
});

*/