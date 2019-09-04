$(document).ready(function () {

    $.checkBrowser({target: '#form_element'});

    var confirmPopupContent = OPR.templater('vote_start_confirm', []);
    var sendingPopupContent = OPR.templater('sending_popup', []);

    var formController = new FormController(0, {
        skipAgreement: true,
        useSendingPopup: false,
        useHitcounter: true
    });

    ELK.ready(function () {
        ELK.fill($('#form_element'));
    });

    $('.js-get-code').on('click', function() {
        var $button = $(this);
        var $target = $('.needConfirm');

        $button.fadeOut('fast');

        $target.data({
            oldValue: '',
            confirmText: 'Телефон успешно подтвержден.',
            confirmCallback: function () {
                $('.vote-block').fadeIn('fast');
            }
        });

        $target.trigger('keyup.delay');

        return false;
    });

    $('.js-show-vote-popup').on('click', function() {
        var $isAgree = $('#is_agree');

        if (! $isAgree.valid()) {
            return false;
        }

        messagebox('Приступить к голосованию', confirmPopupContent, null);
        
        return false;
    });
    
    $(document).on('click', '.js-start-vote', function() {
        messagebox('Подождите, пожалуйста', sendingPopupContent, null, null, true, function () {
            formController.advanceNext();

            setTimeout(function() {
                var $popup = $('.popup');

                $('.popup_loader', $popup).hide();
                $('.popup_error', $popup).show();
            }, 360000);
        });

        return false;
    });

    $(document).on('click', '.js-cancel-vote', function() {
        $('.popup_messagebox_shadow').fadeOut('fast');
        $('.popup_messagebox').fadeOut('fast');
        
        return false;
    });
    
});
