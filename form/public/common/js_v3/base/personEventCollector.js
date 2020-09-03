var PersonEventCollector = (function () {
	"use strict";

	var orgId,
		formId,
		mostimer,hittimer,
		hitstopper,mosstopper,
		remoteAjaxPersonEvent;

	function debug() {
		if (MPGU.personEventCollector.debug !== undefined &&
			MPGU.personEventCollector.debug &&
			console !== undefined &&
			arguments.length > 0
		) {
			console.log(arguments);
		}
	}
	//возвращает имя очереди от типа
	function get_queue(type){
		switch (type){
			case 'mos':
				return 'MosQueue';
			break;
			default:
				return 'offlineSaveQueue';	
			break;
		}
	}
	//переинициализация отправителя
	function restartSender(type){
		switch (type){
			case 'mos':
				if (!mostimer&&!mosstopper) startMosQueue();
			break;
			default:
				if (!hittimer&&!hitstopper) startSaveQueue();
			break;
		}
	}
	//переинициализация отправителя
	function locker(type){
		switch (type){
			case 'mos':
				mosstopper = 10;
			break;
			default:
				hitstopper = 10;
			break;
		}
	}
	
	//функция сохранения объектов хиткаунтеров
	function saveObjectEvent(eventObject,type) {
		debug("saveObjectEvent|"+type, eventObject);
		var offlineSaveQueueArray;
		//выбираем из нужной очереди
		
		
		var offlineSaveQueue = window.localStorage.getItem(get_queue(type));	
		
		//конвертим в массив
		if (offlineSaveQueue) {
			offlineSaveQueueArray = JSON.parse(offlineSaveQueue);
		}
		else 
			offlineSaveQueueArray = [];
		
		//добавляем в очередь
		offlineSaveQueueArray.push(eventObject);
		//пишем в очередь
		if(offlineSaveQueueArray.length > 0){
			// If the offlineSaveQueueArray is not empty, stringify it and store the value to offlineSaveQueue in Local Storage
			window.localStorage[get_queue(type)] = JSON.stringify(offlineSaveQueueArray);
			//есть сообщения переподнимем доставку
			restartSender(type);
		}
		else{
			// If the offlineSaveQueueArray is empty, remove offlineSaveQueue from Local Storage
			window.localStorage.removeItem(get_queue(type));
		}
		
		debug(get_queue(type)+".count()", offlineSaveQueueArray.length);
	}
	
	//функция сохранения объектов хиткаунтеров
	function getObjectEvent(type) {
		var offlineSaveQueueArray;
		//выбираем из нужной очереди
		var offlineSaveQueue = window.localStorage.getItem(get_queue(type));	
		
		//конвертим в массив
		if (offlineSaveQueue) {
			offlineSaveQueueArray = JSON.parse(offlineSaveQueue);
		}
		else 
			offlineSaveQueueArray = [];
		
		return offlineSaveQueueArray;
	}
	//функция записи массива объектов хиткаунтеров
	function setObjectsEvent(offlineSaveQueueArray,type) {
		//выбираем из нужной очереди
		if(offlineSaveQueueArray.length > 0){
			// If the offlineSaveQueueArray is not empty, stringify it and store the value to offlineSaveQueue in Local Storage
			window.localStorage[get_queue(type)] = JSON.stringify(offlineSaveQueueArray);
			//есть сообщения переподнимем доставку
			restartSender(type);
		}
		else{
			// If the offlineSaveQueueArray is empty, remove offlineSaveQueue from Local Storage
			window.localStorage.removeItem(get_queue(type));
		}
		
		return true;
	}
	
	//функция объединения ошибочных и новых данных хиткаунтеров
	function saveErrorArr(offlineSaveQueueArray,type) {
		debug("saveErrorArr|"+type);
		//выбираем из нужной очереди
		if(offlineSaveQueueArray.length > 0){
			offlineSaveQueueArray.concat(getObjectEvent(type));
			// If the offlineSaveQueueArray is not empty, stringify it and store the value to offlineSaveQueue in Local Storage
			window.localStorage[get_queue(type)] = JSON.stringify(offlineSaveQueueArray);
			//есть сообщения переподнимем доставку
			locker(type);
		}
		
		
		return true;
	}

	//инициализация очереди москаунтеров
	function startMosQueue(){

		clearInterval(mostimer);
		mostimer = setInterval(function(){
			if (!mosstopper) {
				var QueueArray = getObjectEvent('mos');
				setObjectsEvent([],'mos');
				if (QueueArray.length>0) {
					try {
						process_moscounter(QueueArray)
					}
					catch(ex){
						console.log(ex);
					}

				}
				else {
					//в простое не будем работать
					clearInterval(mostimer);
					mostimer = 0;
				}
			}
			else mosstopper--;
			
			
			
		},MPGU.personEventCollector.Mosinterval || 10000);
	}
	//инициализация очереди хиткаунтеры
	function startSaveQueue() {
	
		clearInterval(hittimer);
		hittimer = setInterval(function(){
			if (!hitstopper) {
				var QueueArray = getObjectEvent();
				setObjectsEvent([]);
				if (QueueArray.length>0) {
					try {

						process_hitcounter(QueueArray);
					}
					catch(ex){
						console.log(ex);
					}

				}
				else {
					//в простое не будем работать
					clearInterval(hittimer);
					hittimer = 0;
				}
			}
			else hitstopper--;
			
			
			
		},MPGU.personEventCollector.interval || 10000);
		
		


	}
	
	function process_hitcounter(QueueArray){
		
		if (QueueArray.length>0) {
			var message = {
				payload: JSON.stringify(QueueArray[0])
			};

			if (remoteAjaxPersonEvent !== undefined) {

				remoteAjaxPersonEvent.request(
					{
						method: 'POST',
						url: MPGU.personEventCollector.xdm.server,
						data: message
					},
					function(response) {
						debug("remoteAjaxPersonEvent", "success function", response);

						if (response.status === 200) {
							var result;

							try {
								result = JSON.parse(response.data);
							} catch(e) {
								// сбой либо анонимный режим
								result = { error: { code: 403, message: "403" } };
							}

							if (result.error || result.status === undefined || result.status !== "ok") {
								debug("error send remoteAjaxPersonEvent");
								saveErrorArr(QueueArray)

							}
							else {
								debug("success send");
								QueueArray.shift();
								process_hitcounter(QueueArray);
							}
						}
						else {
							debug(response.status !== undefined ? response.status : "", "status remoteAjaxPersonEvent");
							saveErrorArr(QueueArray)
						}
					},
					function(message, data) {
						saveErrorArr(QueueArray)
						debug("remoteAjaxPersonEvent", "error function");
						debug(message);
	

					}
				);
			}
			else {
				debug("remoteAjaxPersonEvent", "undefined");
				saveErrorArr(QueueArray);
			}
		}
		
	}
	
	function process_moscounter(QueueArray){
		
		if (QueueArray.length>0) {
				$.ajax( {
					url : MPGU.personEventCollector.MosUrl , //|| 'https://stats.mos.ru/metric/event/push/pgu.mos.ru'
					dataType : 'html',
					type : 'GET',
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
					data : {'o':JSON.stringify(QueueArray[0])}
				} ).done( function ( data ) {
					if (data) {
						QueueArray.shift();
						process_moscounter(QueueArray);
					}
				}).error(function (data) {
					debug('Error send to MOS',data);
					saveErrorArr(QueueArray,'mos');
				});
			
		}

	}

	function getOrgId() {
		return $("#form_element").find("[name='org_id']").val() || "";
	}

	function getFormId() {
		return $("#form_element").find("[name='form_id']").val() || "";
	}

	function checkRequiredEventPart(eventPart) {
		return $.isArray(eventPart) && eventPart.length >= 2 && eventPart.length <= 3 && eventPart[0] && eventPart[1];
	}

	function createSendObject(eventGroup, eventType, eventSubtype, eventData) {
		var eventObject,MoseventObject,
			code = MPGU.personEventCollector.code || 'MPGU',
			data,
			url = window.location.href,
			timestamp = parseInt((new Date()).getTime() / 1000, 10);

		if (eventGroup === undefined || !eventGroup) {
			throw new Error("Не задана группа события!");
		}

		if (eventType === undefined || !eventType) {
			throw new Error("Не задан тип события!");
		}

		eventSubtype = eventSubtype || "";

		if (eventData !== undefined) {
			if( typeof eventData === "function" ) {
				data = eventData();
			} else {
				data = eventData;
			}
		}
		else{
			data = "";
		}

		eventObject = {
			//"SSOID" : "", //строка, необязательный для браузерных событий (если пусто, обогатить по http-заголовку/токену на стороне metrika.mos.ru);
			"timestamp": timestamp, // дата, обязательный, дата фиксирования события
			"group": eventGroup, // строка, обязательный, код группы событий
			"type": eventType, // строка, обязательный, код типа события
			"subtype": eventSubtype, // строка, необязательный, код подтипа события
			"origin": { // json-объект, необязательный, источник события, поля
				"url": url, // строка, необязательный, адрес страницы-источника
				"org_id": orgId, // строка, необязательный, код ведомства
				"form_id": formId, // строка, необязательный, код формы
				"code": code // строка, необязательный, код источника события
			},
			"data": data // строка/json-обьект, необязательный, дополнительные данные по событию
		};
		MoseventObject = {
            "eventTime": timestamp,
            "eventType": (MPGU.personEventCollector.MosType || "urn:stats:events:mpgu:")+ eventGroup + '/' + eventType + '/' + eventSubtype,
            "eventObject": {
                "orgId": orgId,
                "formId": formId,
                "src": url, 
                
            }
        };

		//сохраним хиткаунтеры
		if (MPGU.personEventCollector.on) saveObjectEvent(eventObject);
		//сохраним москаунтеры
		if (MPGU.personEventCollector.MosOn) saveObjectEvent(MoseventObject,'mos');

	}

	function createSendObjectFromString(eventName, eventData) {
		var eventPart,
			eventGroup,
			eventType,
			eventSubtype;

		if (eventName !== undefined) {
			eventPart = eventName.split(":");

			if ( checkRequiredEventPart(eventPart) ) {
				eventGroup = eventPart[0];
				eventType = eventPart[1];
				eventSubtype = ( eventPart.length === 3 ? eventPart[2] : "" );
			} else {
				throw new Error("Для события не заданы обязательные параметры!");
			}

			createSendObject(eventGroup, eventType, eventSubtype, eventData);

		} else {
			throw new Error("Для события не заданы обязательные параметры!");
		}
	}

	function getNewEvent() {
		$(document).on("click.event_collector", "[data-event-name]" , function() {
			var eventName = $(this).data("event-name"),
				eventData = $(this).data("event-data") || "";

			createSendObjectFromString(eventName, eventData);
		});
	}

	$(document).ready(function () {
		
		orgId = getOrgId();
		formId = getFormId();
		
		if (MPGU.personEventCollector.on) {
		
		

			getNewEvent();


			if (MPGU !== undefined &&
				MPGU.personEventCollector !== undefined &&
				MPGU.personEventCollector.xdm !== undefined &&
				MPGU.personEventCollector.xdm.script !== undefined
			) {
				var script = $("<script>").prop({
					async: true,
					src: MPGU.personEventCollector.xdm.script
				}).on("load error", function (event) {
					debug("event.type", event.type);

					if ("error" !== event.type) {
						var pecXDM = { easyXDM: easyXDM.noConflict("pecXDM") };

						if (pecXDM.easyXDM !== undefined && pecXDM.easyXDM.Rpc !== undefined) {
							remoteAjaxPersonEvent = new pecXDM.easyXDM.Rpc( // объект для кросс-доменного обмена данными
								{
									channel: 'pec-channel-mpgu',
									remote: MPGU.personEventCollector.xdm.init,
									onReady: function(success) {

										debug("onReady", "success", success);
										if (success !== undefined && success) {
											debug("onReady success");
											try {
												startSaveQueue();

											}
											catch(e){
												console.log(e);
											}
										} else {
											debug("onReady not success");
										}
									}
								},
								{
									remote: { request: {} },
									serializer: {
										parse: function(string) {
											return JSON.parse(string);
										},
										stringify: function(object) {
											return JSON.stringify(object);
										}
									}
								}
							);
						} else {
							debug("Not correct xdm object");
						}
					} else {
						debug("Error load js xdm");
					}
				});
				document.head.appendChild(script[ 0 ]);


			} else {
				debug("Error config xmd script");
			}

		}
		
		if (MPGU.personEventCollector.MosOn) {
			console.log('Мос активейтед');
			startMosQueue();
		}
		
	});

	return {
		newEvent : function ( eventGroup, eventType, eventSubtype, eventData ) {
			debug( eventGroup, eventType, eventSubtype, eventData );
			createSendObject(eventGroup, eventType, eventSubtype, eventData);
		}
	};
}($));