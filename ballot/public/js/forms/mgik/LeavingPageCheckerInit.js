var allowLeaving = (function() {
    var leavingPageAllowed = false;

    var message = 'Если Вы покинете страницу, Вы не сможете проголосовать.';
    var messageTwoLines = 'Если Вы покинете страницу,<br /> Вы не сможете проголосовать.';

    var allowLeaving = function() {
        leavingPageAllowed = true;
    }

    var checkLeavingAllowed = function() {
        return leavingPageAllowed;
    }

    function showMessage() {
        $('.leavingMessage').show();
    }

    function hideMessage() {
        $('.leavingMessage').fadeOut('fast');
    }

    function isMessageVisible() {
        return $('.leavingMessage').is(':visible');
    }

    function resizeMessageBox() {
        var twoLinesWidth = 600;
        if ($(window).width() > 600) {
            $('.leavingMessageInner').html(message);
        } else {
            $('.leavingMessageInner').html(messageTwoLines);
        }
        var actualWidth = $('.leavingMessage').width();
        var leftOffset = -(actualWidth / 2);
        $('.leavingMessage').css({'margin-left': leftOffset});
    }

    var leavingPageChecker = new LeavingPageChecker(
        {
            showMessage: showMessage,
            hideMessage: hideMessage,
            isMessageVisible: isMessageVisible,
            resizeMessageBox: resizeMessageBox,
            checkLeavingAllowed: checkLeavingAllowed,
        },
        message,
        {
            showOnKeydown: true,
            showOnMouseout: false,
        }
    );

    $(document).ready(function() {
        leavingPageChecker.run();
    });

    return allowLeaving;
})();