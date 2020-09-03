/**
 * Определят, нужно ли pop-up окно и отрисовывает при необходимости
 */
$(function () {
    
    $(document).ready(function() {
        $('.unsubscribeEmailLink').on('click', function() {
            var appId = $('.app_id b').html();
            if (appId) {
                var emailUnsubscribed = '1';
                updateUnsubscriveEmail(appId, emailUnsubscribed);
                
                return false;
            }
        });
    });
    
    function updateUnsubscriveEmail(appId, emailUnsubscribed) {
        var link = $('.unsubscribeEmailLink');
        if (link.attr('disabled'))
            return false;
        link.attr('disabled', 'disabled');
        var defaultMessage = 'Извините, сервис подписки сейчас недоступен.';
        
        $.ajax({
            url: cfgMainHost + '/common/ajax/index.php',
            type: 'POST',
            dataType: 'json',
            data: {
                ajaxModule: 'UnsubscribeEmail',
                ajaxAction: 'setUnsubscribeEmail',
                appId: appId,
                emailUnsubscribed: emailUnsubscribed
            },
        }).done(function (data) {
            link.removeAttr('disabled');
            $('.unsubscribeEmailMessage').hide();
            
            if (parseInt(data.error)) {
                if (data.errorMessage) {
                    $('.unsubscribeEmailMessage').text(data.errorMessage).show('fast');
                } else {
                    $('#unsubscribeEmailDefaultMessage').text(defaultMessage).show('fast');
                }
            } else {
                $('.unsubscribeEmailMessage').text(data.data).show('fast');
            }
        }).fail(function (jqXHR, textStatus) {
            link.removeAttr('disabled');
            $('#unsubscribeEmailDefaultMessage').text(defaultMessage).show('fast');
        });
    }
    
});

