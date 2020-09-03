function messagebox(title, body, width, closeCallback, removeCloseLink, onShowCallback) {

    /**
     * Возвращает возможную ширину всплывающего окна.
     * Всегда возвращает положительное число.
     * 
     * @param  mixed|undefined width Желательная ширина.
     * @return int
     */
    function getNormalizedWidth(width) {
        var normalizedWidth;
        var minWidth = 50;
        var defaultWidth = 700;
        
        if (! width) {
            normalizedWidth = defaultWidth;
        } else {
            normalizedWidth = parseInt(width);
            if (! normalizedWidth || normalizedWidth <= minWidth) {
                normalizedWidth = defaultWidth;
            }
        }
        
        return normalizedWidth;
    }
    
	if (removeCloseLink === undefined)
		removeCloseLink = false;
    
    var normalizedWidth = getNormalizedWidth(width);
    //на старых картах используется контейнер popup, удалять нельзя
    $.each($('.popup'), function () {
        if ($(this).hasClass('popup_messagebox_map'))
            $(this).hide();
        else
            $(this).remove();
    });
    $('.popup_messagebox_shadow').hide();

    var messagebox = $('body').append(OPR.templater('messageboxTemplate', {title: title, body: body}));
	

    // Нужно устанавливать свойство backgroundColor. Это позволяет избежать ошибки в IE 11.2,
    // возникающей при прокрутке страницы во время отображения messagebox.
    var backgroundColor = $('.popup_messagebox_shadow').css('backgroundColor');
    if (! backgroundColor) {
        backgroundColor = 'transparent';
    }
	$('.popup_messagebox_shadow').css({"width": "100%", "height":$('body').height(),"position": "absolute","z-index":"9999","backgroundColor":backgroundColor});

	$('.popup_messagebox_shadow').show();
		
	
	//$(body).appendTo(messagebox.find('.messagebox-body').html(''));
	var top = $('.popup_messagebox').offset().top + 70;
    
    // Вначале установим желательную ширину. Может отличаться от фактической,
    // например, из-за свойства max-width.
	$('.popup_messagebox').css('width', normalizedWidth + 'px');
    var actualWidth = $('.popup_messagebox').width();
    var leftOffset = -(actualWidth / 2);
    
	$('.popup_messagebox').css({'position': 'absolute', 'top': top, 'margin-left': leftOffset});
    
	if (removeCloseLink) $('.popup_messagebox').find('.btn-blue').remove();
	$('.popup_messagebox').fadeIn('fast', function () {
		if (onShowCallback)
			onShowCallback();
		var saveWindowInput=$('.popup_messagebox').find('.elk-field');
        var closeWindow=$('.popup_messagebox').find('.btn-close-pop');
        if (saveWindowInput.length) {
            saveWindowInput[0].focus();
        }
        else if (closeWindow.length) {
            closeWindow[0].focus();
        }
		$('.popup_messagebox .cross, .btn-close-pop,.popup_messagebox_shadow').off('click').on('click', function () {
            $.fn.colorbox.close(closeCallback);
            return true;
		});

	});
	return false; // for <a> links
}

$.colorbox = $.fn.colorbox = $.fn.messagebox = function (options) {
	if (options.inline) {

		if (options.href==undefined) var html = options.html;
		else var html = $(options.href).html();
		var r = messagebox('', html, options.width || undefined, options.onClosed || undefined, options.overlayClose || undefined, options.onShow || undefined);
		//$(options.href).remove();
		
	} else if (options.html) {
		body = options.html;
		var r = messagebox('', body, options.width || undefined);
	} else {
		var r = messagebox('', $(options.href).html(), options.width || undefined);
	}
	return r;
};

$(window).keydown(function(event){
    if (event.ctrlKey) {
        switch (event.keyCode ? event.keyCode : event.which ? event.which : null) {
            case 0x51: //ctrl+q закрываем
                var closeWindow=$('.popup_messagebox').find('.btn-close-pop');
                if (closeWindow.length) {
                    closeWindow[0].click();
                }
                break;
            case 0x12: //ctrl+alt сохраняем или принимаем
                if ($('#elk-save-button').length) {
                    $('#elk-save-button').click();
                }
                else if ($('#agree-popup-button').length) {
                    $('#agree-popup-button').click();
                }
                else if ($('#elk-subscription-button').length) {
                    $('#elk-subscription-button').click();
                }
                else if ($('#find_counters').length) {
                    $('#find_counters').click();
                }
                else {
                var showBttn=$('.popup_messagebox').find('.get-archive-button');
                    if (showBttn.length) {
                        showBttn[0].click();
                    }
                }
                break;
            case 0x10: //ctrl+shift тыкаем согласие
                if ($('#popup_check_agreement').length) {
                    $('#popup_check_agreement').click();
                }
                break;
        }
    }
});

$.fn.colorbox.close = $.fn.messagebox.close = function (callback) {
	$('.popup_messagebox_shadow').fadeOut('fast');
	$('.popup_messagebox').fadeOut('fast', function () {
		clearMessageboxes(callback);
	});
	return true;
};

function clearMessageboxes(callback) {
    if (callback) {
        callback();
    } else {
        //на старых картах используется контейнер popup, удалять нельзя
        $.each($('.popup'), function () {
            if ($(this).hasClass('popup_messagebox_map'))
                $(this).hide();
            else
                $(this).remove();
        });
        $('.popup_messagebox_shadow,.nicescroll-rails').hide();
    }
}

$(document).ready(function () {
	$('body').on('click', '.btn-close-pop, .popup_messagebox_shadow', function () {
		$('.popup_messagebox').fadeOut('fast', clearMessageboxes);
		return false;
	});
    
    /**
     * Центрирует попап при изменении размера окна.
     */
    $(window).resize(function() {
        $('.popup_messagebox').each(function() {
            var width = $(this).width();
            
            var mar = parseInt(width) / 2;
            $(this).css('margin-left', '-' + mar + 'px');
        });
    });
});
