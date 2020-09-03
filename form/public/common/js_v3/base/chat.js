function iframeChatObject() {

    var iframeContainer = $('.mpgu_chat_iframe');
    var iframeTitle     = $('.about_mpgu_chat');

    this.init = function() {

        if (window.addEventListener){
            addEventListener("message", listener, false);
        } else {
            attachEvent("onmessage", listener);
        }

        iframeTitle.on('click', click);

        setSrc();
    }

    function setSrc() {
        var iframe = document.getElementById('iframeChat');
        iframe.src = iframe.getAttribute('datasrc');
    }

    function listener(event) {
        if ( event.data == 'rollin' ) {
            hide();
        }
    }

    function click() {
        if (iframeContainer.css('display')==='none') {
            iframeContainer.slideUp("slow", show);
        } else {
            hide();
        }
    }

    function show() {
        iframeContainer.show();
        iframeTitle.hide();
    }

    function hide() {
        iframeContainer.hide();
        iframeTitle.show();
        // setSrc();
    }
}

var ifarmeChat = new iframeChatObject();

$(document).ready(ifarmeChat.init);