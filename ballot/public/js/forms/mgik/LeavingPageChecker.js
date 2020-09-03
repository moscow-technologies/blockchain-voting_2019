/**
 * When user leaves the page, LeavingPageChecker shows standart confirm message
 * and addititional shows custom message.
 */
 
/**
 * Class constructor.
 * 
 * @param  object callbacksList Assoc array of 4 callbacks:
 *                callbacksList.showMessage
 *                callbacksList.hideMessage
 *                callbacksList.isMessageVisible
 *                callbacksList.resizeMessageBox
 *                callbacksList.checkLeavingAllowed
 * @param  string message Standart browser confirm message.
 * @param  object params Assoc array of 2 paramethers:
 *                params.showOnKeydown
 *                params.showOnMouseout
 */
function LeavingPageChecker(callbacksList, message, params) {
    
    if (callbacksList && typeof callbacksList.showMessage === 'function') {
        this.outerShowMessage = callbacksList.showMessage;
    } else {
        this.outerShowMessage = function() {
            return false;
        }
    }
    
    if (callbacksList && typeof callbacksList.hideMessage === 'function') {
        this.outerHideMessage = callbacksList.hideMessage;
    } else {
        this.outerHideMessage = function() {
            return false;
        }
    }
    
    if (callbacksList && typeof callbacksList.resizeMessageBox === 'function') {
        this.outerResizeMessageBox = callbacksList.resizeMessageBox;
    } else {
        this.outerResizeMessageBox = null;
    }
    
    if (callbacksList && typeof callbacksList.isMessageVisible === 'function') {
        this.outerIsMessageVisible = callbacksList.isMessageVisible;
    } else {
        this.outerIsMessageVisible = function() {
            return true;
        }
    }
    
    if (callbacksList && typeof callbacksList.checkLeavingAllowed === 'function') {
        this.outerCheckLeavingAllowed = callbacksList.checkLeavingAllowed;
    } else {
        this.outerCheckLeavingAllowed = function() {
            return false;
        }
    }
    
    this.message = message;
    
    this.params = {};
    if (params && typeof params.showOnKeydown !== 'undefined') {
        this.params.showOnKeydown = params.showOnKeydown;
    } else {
        this.params.showOnKeydown = true;
    }
    if (params && typeof params.showOnMouseout !== 'undefined') {
        this.params.showOnMouseout = params.showOnMouseout;
    } else {
        this.params.showOnMouseout = true;
    }
    
    this.hideTime = 0;
    this.showMessageTimeout = 3000;
    this.reasonCtrl = false;
    this.reasonAlt = false;
    this.reasonMouse = false;
    this.reasonTimer = 0;

}

LeavingPageChecker.prototype.addEvent =  function(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}

LeavingPageChecker.prototype.noReason = function() {
    return ! this.reasonCtrl && ! this.reasonAlt && ! this.reasonMouse && (this.reasonTimer < +(new Date()));
}

LeavingPageChecker.prototype.showMessage = function() {
    this.outerShowMessage();
    this.hideTime = +(new Date) + this.showMessageTimeout;
}

LeavingPageChecker.prototype.hideMessage = function() {
    var self = this;
    
    if (this.outerIsMessageVisible()) {
        if (this.hideTime < +(new Date) || this.noReason()) {
            this.outerHideMessage();
        }
    }
    setTimeout(function(){self.hideMessage();}, 100);
}

LeavingPageChecker.prototype.run = function() {
    
    self = this;
    
    if (self.params.showOnMouseout) {
        self.addEvent(document, "mouseout", function(e) {
            e = e ? e : window.event;
            var from = e.relatedTarget || e.toElement;
            if (! from || from.nodeName == "HTML") {
                self.reasonMouse = true;
                self.showMessage();
            }
        });
        
        self.addEvent(document.body, "mouseenter", function(e) {
            self.reasonMouse = false;
        });
    }
    
    if (self.params.showOnKeydown) {
        self.addEvent(document, "keydown", function(e) {
            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'F5' ) {
                if (e.key === 'Alt') {
                    self.reasonAlt = true;
                } else if (e.key === 'Control') {
                    self.reasonCtrl = true;
                } else if (e.key === 'F5') {
                    self.reasonTimer = +(new Date()) + self.showMessageTimeout;
                }
                self.showMessage();
            }
        });
        
        self.addEvent(document, "keyup", function(e) {
            if (e.key === 'Alt' || e.key === 'Control') {
                if (e.key === 'Alt') {
                    self.reasonAlt = false;
                } else if (e.key === 'Control') {
                    self.reasonCtrl = false;
                }
            }
        });
    }
    
    self.addEvent(window, "beforeunload", function (e) {
        if (self.outerCheckLeavingAllowed())
            return null;
        
        (e || window.event).returnValue = self.message;
        return self.message;
    });
    
    if (self.outerResizeMessageBox) {
        self.addEvent(window, "resize", function (e) {
            self.outerResizeMessageBox();
        });
        this.outerResizeMessageBox();
    }
    
    setTimeout(function(){self.hideMessage();}, 100);
}
