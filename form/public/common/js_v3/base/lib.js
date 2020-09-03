var ELK = {
	data: {},
	requestToken: function() {},
	ready: function() {}
};
var draft_in_process = false; //флаг процесса загрузки черновика
if ( draft_loading === undefined )
	var draft_loading = false;
function rgb2hex(rgb) {
	try {
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "#" +
			("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
			("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
			("0" + parseInt(rgb[3], 10).toString(16)).slice(-2);
	}
	catch(e){};
}

//$(document).ready(function(){
//	(function (d, w, c) {
//		var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function () {
//			n.parentNode.insertBefore(s, n);
//		}, protocol = MPGU.dev?"http:":'https:';
//		current_domain = window.location.hostname;
//		s.type = "text/javascript";
//		s.charset = "utf-8";
//		s.async = true;
//		s.src = protocol + "//pevp.mos.ru/frame/v3/all.php?cur_domain=" + current_domain + "&async=1&set_lang=ru&langs=ru&site_id=2248&show_blind=0";
//		if (w.opera == "[object Opera]") {
//			d.addEventListener("DOMContentLoaded", f, false);
//		} else {
//			f();
//		}
//	})(document, window, "evp_header_callbacks");
//});






// Пространство имен для библиотек CMS
OPR = {};

/**
 * Диспетчер событий EventDispatcher для диспетчеризации событий между различными блоками страницы и внутри них.
 * Схема работы:
 *	- диспетчер обеспечивает подписку на события неограниченного количества обработчиков.
 *	- диспетчер обеспечивает прием информации о событиях и их рассылку заинтересованным обработчикам (в порядке их регистрации).
 * Методы:
 *	- handlerID addHandler(string eventID, function callback);
 *	- removeHandler(handlerID);
 *	- dispatchEvent(string eventID, object eventData);
 *		eventData - произвольный набор данных, специфичный для события

 * Обработчик:
 * boolean eventHandler(string eventID, object eventData);
 * обработчик возвращает признак "прекратить дальнейшую обработку события" - не 0, '', nil, undefined и т.п.
 */
OPR.EventDispatcher = (function() {
	// private
	var EventHandlers = {}, RegisteredHandlers = {}, RegisteredHandlersCounter = 0;
	// public
	return {
		addHandler: function(eventID, callBack) {
			if (typeof(EventHandlers[eventID]) == 'undefined') EventHandlers[eventID] = {};
			var handlerID = ++RegisteredHandlersCounter;
			EventHandlers[eventID][handlerID] = callBack;
			RegisteredHandlers[handlerID] = eventID;
			return handlerID;
		},
		removeHandler: function(handlerID) {
			var eventID = RegisteredHandlers[handlerID];
			if (!eventID) return 0;
			delete EventHandlers[eventID][handlerID];
			delete RegisteredHandlers[handlerID];
			return 1;
		},
		// returns 0 on success, 1 if the sequence was terminated
		dispatchEvent: function(eventID, eventData) {
			if (typeof(EventHandlers[eventID]) == 'undefined') return 0;
			var res, handlers = EventHandlers[eventID];
			for (var i in handlers) {
				try {
					res = handlers[i](eventData);
				}
				catch (e) {
					return 1;
				}
				// не 0, '', nil, undefined - выходим
				if (typeof(res) != 'undefined' && res) return 1;
			}
			return 0;
		},
		clearHandlers: function(eventID){
			if (typeof(EventHandlers[eventID]) == 'undefined') return 0;
			var res, handlers = EventHandlers[eventID];
			
			for (var i in handlers) {
				delete RegisteredHandlers[i];
			}
			delete EventHandlers[eventID];
			return 1;
		}
	}
})();

// загрузчик сложных блоков данных для форм
OPR.FormLoader = (function() {
	// private
	var Listeners = {}, SkippedFields = [],
		/**
		 * классы для функицонала подачи заявления группой пользователей
		 * extUser	- для 2го пользователя
		 * final	- после подтверждения приглашения
		 */
        inviteConfig = {
        	extUser: {
                disabled: '.invite_ext_disabled',
                hide_element: '.invite_ext_hide',
                show_element: '.invite_ext_show'
            },
			final: {
                disabled: '.invite_final_disabled',
                hide_element: '.invite_final_hide',
                show_element: '.invite_final_show'
            }
        }
	;

	function extUserListner (config) {
        var $parentBlock = $(config.disabled);

        $.each($parentBlock.find('input:not([type="hidden"]), textarea, select'), function() {
            var $elem = $(this);

            switch(this.nodeName.toLowerCase()) {
                case 'input':
                case 'textarea':
                    if(this.type == 'radio' && !this.checked)
                        this.disabled = true;

                    if(['text', 'textarea'].indexOf(this.type) != -1){
                        this.readOnly = true;
                        $elem.closest('.field').addClass('disabled');
                    }

                    if (this.type == 'file') {
                        var $p = $elem.parent();
                        $p.find('.file-process.empty').css({"margin-left": '0px'}).html('Не загружен');
                        $p.find('.file-process.done').find('.file-remove').remove();
                    }
                    break;
                case 'select':
                    $elem.find('option:not(:selected)').attr('disabled', true).end().trigger('chosen:updated');
                    break;
            }
        });

		$(config.hide_element).hide();
		$(config.show_element).show();

		return true;
	}

	function runListeners(fields) {
		if (typeof(fields['internal.staff']) == 'undefined')
			return true;
		var staffLength = fields['internal.staff'].value.length;
		if (staffLength) {
			var counter = staffLength;
			for (var object in fields['internal.staff'].value) {
				if (object == 'indexOf' || typeof(fields['internal.staff'].value) == 'undefined')
					continue;
				if (fields['internal.staff'].value[object] != undefined) {
					var obj = fields['internal.staff'].value[object].split('$');
					if (typeof(Listeners[obj[0]]) != 'undefined' && typeof(Listeners[obj[0]]) == 'function') {
						var skf = Listeners[obj[0]](obj, fields);
						if (skf !== false) {
							counter--;
							SkippedFields = SkippedFields.concat(skf);
							fields['internal.staff'].value[object] = null;
						}
					}
					else{
						counter--;
						fields['internal.staff'].value[object] = null;
					}
				}
			}
			if (counter && staffLength != counter)
				runListeners(fields);
		}
		return true;
	}

	function in_array(needle, haystack) {
		for (var key in haystack)
			if (haystack[key] == needle)
				return true;
		return false;
	}

    function updateMultipleInputs(keysList, value, element, callback) {
        if (keysList && typeof keysList.slice === 'function' && typeof callback === 'function') {
            if (typeof value === 'object') {
                for (var key in value) {
                    var keysLisParam = keysList.slice();
                    keysLisParam.push(key);
                    updateMultipleInputs(keysLisParam, value[key], null, callback);
                }
            } else {
                if (! element) {
                    var fieldName = 'field[' + keysList.join('][') + ']';
                    element = $('[name="' + fieldName + '"]');
                }
                callback(element, value);
            }
        }
    }
    
	// public
	return {
		inviteConfigure: function (object) {
			if (typeof(object) != 'object')
				return false;
			for (var i in object)
				inviteConfig[i] = object[i];
			return true;
		},
		addListener: function(type, callBack) {
			Listeners[type] = callBack;
			return true;
		},
		load: function(fields, step, ext_user, final) {
			var estimate = +new Date();
			draft_in_process = true;
			if (typeof(fields['internal.staff']) != 'undefined' && fields['internal.staff'].value != undefined) {
				runListeners(fields);
			}
			console.log('Переходим к восстановлению полей, прошло '+(+new Date() - estimate)/1000+' cек');
			var count_field = 0;
			var skip_change = false;
			for (var fname in fields) {
				if ($.inArray(fname,['internal.staff','internal.external_upload','internal.dynamic_upload','internal.guid','indexOf','TypeDocument11'])>=0   || fields[fname] == null || in_array(fname, SkippedFields))
					continue;
				var multi_field = ((typeof(fields[fname].value) == 'object' || typeof(fields[fname].value) == 'array') && typeof(fields[fname].value.IS_FILE) == "undefined") ? true : false;
				var element = multi_field ?$('[name*="field[' + fname + ']' + '["]'):$('[name="field[' + fname + ']"]');
				
				skip_change = false;
				count_field++;
				// input [radio, checkbox, text, password, file, hidden], select[multiple, SIMPLE], textarea
				if (fields[fname].value) {
					if (element.is('input')) {
						// input:file - skip, wait for serverside based templates
						if (element.attr('type') === 'file') {
							skip_change = true;
							if (element.attr('upload_method')!='external_storage') {
								if (!FormController.attachDraftUpload(element, fields[fname].value)) {
									var id = element.attr('id'), name = element.attr('name');
									if (!id) {
										id = 'upload_file_' + name.replace(/[\[\]\.]/g, '_');
										element.attr('id', id);
									}
									name = name.replace(/field\[(.+?)\]/, '$1');

									element.prop('disabled', true); // не даем сабмитить файл
									element.after(
										// поле для связки с уже загруженными файлами при отправке формы
										'<input type="hidden" id="helper_' + id + '" name="field[internal.dynamic_upload][files][' + id + ']" value="' + name + '"/>'
									);
									element.change(function() {
										element.prop('disabled', false);
										$('input#helper_' + id).remove();
									});
								}
							}
						}
						// input:radio - убрать checked, поставить checked у нужного
						else if (element.attr('type') == 'radio') {
							element.removeAttr('checked');
							element.each(function() {
								if ($(this).val() == fields[fname].value) {
									var $slider = $(this).closest('.slider');
									if ($slider.length !== 0 && $slider.hasClass('draft_trigger')) {
										$slider.find('[name="' + fields[fname].value + '"]').trigger('click');
									} else {
										$(this).attr('checked', 'checked');
										$(this).trigger('change');
									}
									skip_change = true;
								}
							});
						}
						// input:checkbox - убрать checked, поставить checked у нужного
						else if (element.attr('type') == 'checkbox') {
							element.removeAttr('checked');
							element.each(function() {
								if (multi_field) {
									if (in_array($(this).val(),fields[fname].value)){
										$(this).attr('checked', 'checked');
										$(this).trigger('change');
										skip_change = true;
									}
								}
								else {
									if ($(this).val() == fields[fname].value){
										$(this).attr('checked', 'checked');
										$(this).trigger('change');
										skip_change = true;
									}
								}
							});
						}
						// input:text,password,hidden - val()
						else {
                            updateMultipleInputs([fname], fields[fname].value, element, function(element, value) {
                                if (value) {
                                    element.val(value);
                                    if (element.data('mask')) {
                                        element.trigger('paste');
                                    }
                                }
                            });
						}
					}
					else if (element.is('select')) {
						var s_options = $('select[name="field[' + fname + ']' + (multi_field ? '[]' : '') + '"] option');
						// select:multiple - for (проверка на значение, установка) attr('selected', 'selected');
						if (fields[fname].value) element.data('prevalue',fields[fname].value).attr('data-prevalue',fields[fname].value);
						if (element.attr('multiple') != undefined && element.attr('multiple')) {
							s_options.removeAttr('selected');
							s_options.each(function() {
								if (multi_field) {
									if (in_array($(this).val(),fields[fname].value))
										$(this).attr('selected', 'selected');
								}
								else {
									if ($(this).attr('value') == fields[fname].value)
										$(this).attr('selected', 'selected');
								}
							});
						}
						// select - val()
						else {
							element.val(fields[fname].value);
						}
                                                element.trigger("chosen:updated");

					}
					// textarea: val()
					else if (element.is('textarea')) {
						element.val(fields[fname].value);
					}
					else {
						element.val(fields[fname].value);
					}
                    
                    if (element.is('input') && multi_field) {
                        updateMultipleInputs([fname], fields[fname].value, element, function(element, value) {
                            if (value) {
                                element.data('draft_value', value);
                                
                                if (! skip_change && ! element.hasClass('no_draft_trigger')) {
                                    element.trigger('change');
                                }
                            }
                        });
                    } else {
                        element.data('draft_value',fields[fname].value);
                        
                        if (! skip_change && ! element.hasClass('no_draft_trigger')) {
                            element.trigger('change');
                        }
                    }
				}


			}
			console.log('Восстановлено '+count_field+' полей, прошло '+(+new Date() - estimate)/1000+' cек');
			
			if (typeof(step) != 'undefined' && step) {
					FormController.controller.changeStep('step_'+step)
					//$('#step_' + step).show();
					window.location.hash = 'step_'+step;
					console.log('Восстановили номер шага, прошло  '+(+new Date() - estimate)/1000+' cек');
				}
				
			if (typeof(ext_user) != 'undefined' && ext_user) {
				if (typeof(Listeners['ext_user']) == 'function')
					Listeners['ext_user'](inviteConfig.extUser);
				else extUserListner(inviteConfig.extUser);
			}

			if (typeof(final) != 'undefined') {
				if (typeof(Listeners['final']) == 'function')
					Listeners['final'](inviteConfig.final);
				else extUserListner(inviteConfig.final);
			}

			if (typeof(Listeners['end_load']) != 'undefined' && typeof(Listeners['end_load']) == 'function')
					Listeners['end_load'](fields);

			console.log('Черновик загружен за '+(+new Date() - estimate)/1000+' cек');
			setTimeout(function() {LockFields.unlock( $( '#form_element' )); draft_in_process = false;},1000);
		}
	}
})();

// форма для ошибок
OPR.Feedback = (function() {
	// private
	function GetSelected() {
		return window.getSelection ? window.getSelection() :
			(document.getSelection ? document.getSelection() :
			(document.selection ? document.selection.createRange().text : ''));
	}
	// public
	return {
		open: function() {
			var sel = GetSelected().toString();
			$.post(cfgMainHost + '/common/set_error_text.php', {txt:sel, title:document.title}, function(data) {});
			$.fn.colorbox({href:cfgMainHost + '/ru/bugreport/?title=', open:true, width:'600px', height:'600px', krClose:true, iframe:true});
		}
	}
})();

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
OPR.templater = (function () {
 var cache = { };
 return function f( str, data ) {
  try {
   var fn = !/\W/.test( str ) ?
    cache[str] = cache[str] || f( document.getElementById( str ).innerHTML ) :
    /*jslint evil: true*/
    new Function( 'obj',
     'var p=[],print=function(){p.push.apply(p,arguments)};' +
     "with(obj){p.push('" +
     str
     .replace( /[\r\t\n]/g, ' ' )
     .split( '<%' ).join( '\t' )
     .replace( /((^|%>)[^\t]*)'/g, '$1\r' ) //'
     .replace( /\t=(.*?)%>/g, "',$1,'" )
     .split( '\t' ).join( "');" )
     .split( '%>' ).join( "p.push('" )
     .split( '\r' ).join( "\\'" ) +
     "')}return p.join('')" );
   return data ? fn( data ) : fn;
  }
  catch ( e ) {
   console.log(e,str);
  }
 };
})();

function Ajax( params ) {
	this.params = params || {};

	var doRequest = function ( params ) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		$.ajax( {
			url : params.url || window.location,
			type : 'POST',
			dataType : 'json',
			data : $.extend({
				ajaxAction : params.action || null,
				ajaxModule : params.module || null
			},params.data||{}),

			cache : false
		} ).done( function ( data ) {
			if ( data.error ) {
				deferred.reject( data.error );
			}
			else {
				deferred.resolve( data );
			}
		} ).fail( function ( jqXHR, textStatus, errorThrown ) {
			deferred.reject( {
				code : jqXHR.status,
				message : 'Произошла ошибка при обращении к серверу (' + jqXHR.status + ' ' + jqXHR.statusText +
				'). Рекомендуем повторить попытку позже.'
			} );
		} );

		return promise;
	};

	this.request = function () {
		var self = this;
		if ( self.params.before && 'function' === typeof self.params.before )
			self.params.before();

		$.when(
				doRequest( this.params )
		).done( function ( result ) {
					if ( self.params.after && 'function' === typeof self.params.after )
						self.params.after( result );

				} ).
				fail( function ( err ) {
					if ( self.params.fail && 'function' === typeof self.params.fail )
						params.fail( err );
				} ).always( function () {
					if ( self.params.always && 'function' === typeof self.params.always )
						self.params.always();
				} );
	};
	this.request();
}

$(document).ready(function() {

	/**
	 * Опредяем режим совместимости ИЕ
	 */

	// Create new ieUserAgent object
	var ieUserAgent = {
		init : function () {
			var ua = navigator.userAgent;
			this.compatibilityMode = false;
			var ieRegex = new RegExp( "MSIE ([0-9]{1,}[\.0-9]{0,})" );
			if ( ieRegex.exec( ua ) == null )
				this.exception = "The user agent detected does not contain Internet Explorer.";


			if ( ua.indexOf( "Trident/6.0" ) > -1 && ua.indexOf("MSIE 7.0") > -1) {
					this.compatibilityMode = true;
			}
			else if ( ua.indexOf( "Trident/5.0" ) > -1 && ua.indexOf("MSIE 7.0") > -1) {
					this.compatibilityMode = true;
			}
			else if ( ua.indexOf( "Trident/4.0" && ua.indexOf("MSIE 7.0") > -1) > -1 ) {
					this.compatibilityMode = true;
			}
			else if ( ua.indexOf( "Trident/7.0" ) > -1  && document.documentMode && document.documentMode !== 11) {
				this.compatibilityMode = true;
			}
		}
	};

	ieUserAgent.init();

	if (ieUserAgent.compatibilityMode) {
		messagebox('Внимание!', '<b>Уважаемый пользователь, вы используете свой браузер в режиме совместимости. Мы рекомендуем отключить данный режим для дальнейшей работы с Порталом.</b>');
	}


	if (window.opera && window.opera.buildNumber) {
		var operaVer = opera.version();
		operaVer = parseInt(operaVer.substring(0,2 ), 10);
		if (operaVer <= 12) {
			messagebox('Внимание!', '<b>Уважаемый пользователь, вы используете старую версию браузера. Для корректной работы функционала портала, просьба установить последнюю версию вашего браузера!</b>');
		}
	}

	$('.urgent-global').click(function() {
		setCookie('close-urgent', 1, 1);
		$('.urgent-global').slideUp('fast');
		return false;
	});
	if (getCookie('close-urgent') != null) {
		$('.urgent-global').hide();
	}
	$('.urgent-targeted').click(function() {
		$('.urgent-targeted').slideUp('fast');
		return false;
	});
	// инициализация плагина history для работы через диспетчер событий.
	$.history.init(function(hash) {
            if (OPR.EventDispatcher!=undefined) {
		OPR.EventDispatcher.dispatchEvent('History:onMove', hash);
            }
	});

	// поддержка глобальных реакций на нажатия клавиш
	document.onkeypress = function(event) {
		event = (event) ? event : window.event;
		if (event.keyCode == 27)
			$.fn.colorbox.close();
		if (event.ctrlKey == true && (event.keyCode == 13 || event.keyCode == 10))
			OPR.Feedback.open();
	}

	$(".accContent, .accordeon-inner").hide();
    $(".accordeon > li > a").click(function(e){
        e.preventDefault();
        if($(this).hasClass("active")){
            $(this).removeClass("active");
            $(".accContent").slideUp();
            return false;
        }
        $(".accContent").slideUp();
        $(".accordeon > li > a.active").removeClass("active");
        $(this).addClass("active");
        $(this).siblings(".accContent").slideDown(300, function(){
        	$("ul.categorySparNav").css({
		        height: $(".leftRegPage").outerHeight(true)
		    });
        });


    });

    $(".content-accordeon > li > a").click(function(e){
        e.preventDefault();
        if($(this).hasClass("active")){
            $(this).removeClass("active");
            $(".accordeon-inner").slideUp();
            return false;
        }
        $(".accordeon-inner").slideUp();
        $(".content-accordeon > li > a.active").removeClass("active");
        $(this).addClass("active");
        $(this).siblings(".accordeon-inner").slideDown();
    });

	//проверим нет ли каких-либо сообщений для пользователя
	//Делаем запрос в аякс точку входа

	$( 'body' ).on( 'userLegalMessages', function ( e ) {
		e.preventDefault();

		if ( typeof globalLegalCookieKey !== 'undefined' && -1 != globalLegalCookieKey ) {

			var cookieLegalMessage = getCookie( 'userLegalMessages|hash|' + globalLegalCookieKey );
			if ( !cookieLegalMessage ) {
				var ajaxUserMessages = new Ajax( {
					url : cfgMainHost + '/common/ajax/index.php',
					module : 'client',
					action : 'userLegalMessages',
					fail : function ( err ) {
						console.error( err );
					},
					after : function ( res ) {
						var html = '<h3>Причина:</h3><p>%message%</p>';
						if ( !res.error && res.data && res.data.hasOwnProperty( 'errorCode' ) && 200 != res.data.errorCode ) {
							messagebox( 'Невозможно авторизоваться в качестве юридического лица', html.replace( '%message%', res.data.message ) );
						}
						else if ( res.error && res.errorMessage.length > 0 )
							console.error( res.errorMessage );

						setCookie( 'userLegalMessages|hash|' + globalLegalCookieKey, 1 );
					}
				} );

				ajaxUserMessages.request();
			}

		}
	} );

	$( 'body' ).trigger( 'userLegalMessages' );

//	if ( MPGU.hasOwnProperty( 'personal_license' ) && MPGU.personal_license.result && !MPGU.personal_license.confirm ) {
//
//		var notConfirmPersonalDataLicense = function ( ) {
//			window.location.href = MPGU.personal_license.link || document.location;
//		};
//
//		var buttonDiv = '<div style="float: left;"><a class="button" id="confirmButton"  href="#">Принять</a>&nbsp;&nbsp;<a id="notConfirmButton" class="button" href="#">Отклонить</a></div>';
//
//		messagebox( 'Согласие на обработку персональных данных', MPGU.personal_license.license_text + buttonDiv, false, notConfirmPersonalDataLicense, true );
//
//		$( 'a#confirmButton' ).off('click').on( 'click', function ( event ) {
//			event.preventDefault();
//
//			var ajaxUserConfirmPersonalDataLicense = new Ajax( {
//				url : cfgMainHost + '/common/ajax/index.php',
//				module : 'client',
//				action : 'confirmPersonalDataLicense',
//				fail : function ( err ) {
//					console.error( err );
//				},
//				after : function ( res ) {
//					if ( res.error )
//						console.error( 'Ошибка установки флага согласия на обработку ПД' );
//					else {
//						$.fn.colorbox.close();
//						MPGU.personal_license.confirm = true;
//					}
//				}
//			} );
//
//			ajaxUserConfirmPersonalDataLicense.request();
//
//		} );
//
//		$( 'a#notConfirmButton' ).off('click').on( 'click', function ( event ) {
//			event.preventDefault();
//			notConfirmPersonalDataLicense();
//		} );
//
//		$('.popup_messagebox_shadow' ).on('click', function ( event ) {
//			event.preventDefault();
//			return false;
//		});
//	}


});

function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}


function getCookie(name) {
	var cookie = ' ' + document.cookie, setStr = null;
	if (cookie.length > 0) {
		var search = ' ' + name + '=';
		var offset = cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			var end = cookie.indexOf(';', offset);
			if (end == -1)
				end = cookie.length;
			setStr = unescape(cookie.substring(offset, end));
		}
	}
	return setStr;
}


function expireAllCookies(name, paths) {
    var expires = new Date(0).toUTCString();

    // expire null-path cookies as well
    document.cookie = name + '=; expires=' + expires;

    for (var i = 0, l = paths.length; i < l; i++) {
        document.cookie = name + '=; path=' + paths[i] + '; expires=' + expires;
    }
}

function expireActiveCookies(name) {
    var pathname = location.pathname.replace(/\/$/, ''),
        segments = pathname.split('/'),
        paths = [];

    for (var i = 0, l = segments.length, path; i < l; i++) {
        path = segments.slice(0, i + 1).join('/');

        paths.push(path);       // as file
        paths.push(path + '/'); // as directory
    }

    expireAllCookies(name, paths);
}

/**
 * Заменяет текст в строковом поле ввода и восстанавливает положение курсора.
 * Применяется для коррекции текста после ввода или вставки (события keyup, paste)
 */
function replaceTextAndRestoreCaret(input, str) {
	if ($(input).is(':focus')) {
		if (input.setSelectionRange) {
			var start = input.selectionStart, end = input.selectionEnd;
			input.value = str;
			input.setSelectionRange(start, end);
			return;
		}
		else if (document.selection) {
			// несомненно, авторы IE - альтернативно мыслящие
			var range = document.selection.createRange(), unit = 'character', shift = -str.length;
			// фиксируем конец текущего выбора
			range.moveStart(unit, shift);
			var start = range.text.length;
			input.value = str;
			// после замены выбран весь текст
			range.moveStart(unit, start); range.moveEnd(unit, shift + start);
			range.select();
			return;
		}
	}
	input.value = str;
}

/*deprecated*/
OPR.validateDate=(function(str){
	var dateRegexp = /^([0-3]\d)\.([01]\d)\.((?:19|20)\d\d)$/;
	return function validateDate(str) {
		var dateParts = dateRegexp.exec(str);
		if (dateParts) {
			var day = parseInt(dateParts[1], 10), month = parseInt(dateParts[2], 10), year = parseInt(dateParts[3]);
			var date = new Date(year, month-1, day);
			//сравниваем переданные номера дня, месяца, года с получившимися в объекте даты
			//если не совпали, значит были некорректные числа, вроде 42 марта или 13 месяца
			if (date.getFullYear() == year && date.getMonth() == month-1 && date.getDate() == day)
				return date;
		}
		return false;
	}
})();

function toHtml(str) {
	return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/**
 * Функция возвращает окончание для множественного числа слова на основании числа и массива окончаний
 * @param  iNumber Integer Число на основе которого нужно сформировать окончание
 * @param  aEndings Array Массив слов или окончаний для чисел (1, 4, 5),
 *         например ['яблоко', 'яблока', 'яблок']
 * @return String
 */
function getNumEnding(iNumber, aEndings)
{
    var sEnding, i;
    if ( !aEndings ) aEndings = ['','а','ов'];
    iNumber = iNumber % 100;
    if (iNumber>=11 && iNumber<=19) {
        sEnding=aEndings[2];
    }
    else {
        i = iNumber % 10;
        switch (i)
        {
        	case (0):
            case (1): sEnding = aEndings[0]; break;
            case (2):
            case (3):
            case (4): sEnding = aEndings[1]; break;
            default: sEnding = aEndings[2];
        }
    }
    return sEnding;
}

/**
 * Convert number of bytes into human readable format
 *
 * @param integer bytes     Number of bytes to convert
 * @param integer precision Number of digits after the decimal separator
 * @return string
 */
function bytesToSize(bytes, precision) {
	var kilobyte = 1024, megabyte = 1048576, gigabyte = 1073741824, terabyte = 1099511627776;
	if (bytes < kilobyte)
		return bytes + ' Б';
	else if (bytes < megabyte)
		return (bytes / kilobyte).toFixed(precision) + ' КБ';
	else if (bytes < gigabyte)
		return (bytes / megabyte).toFixed(precision) + ' МБ';
	else if (bytes < terabyte)
		return (bytes / gigabyte).toFixed(precision) + ' ГБ';
	else if (bytes >= terabyte)
		return (bytes / terabyte).toFixed(precision) + ' ТБ';
}

function districtOpen(block_id) {
    messagebox('Выбор округа',OPR.templater(block_id,{ }),800);
	var checked = $('#'+block_id+'_inputs input');
	checked.each(function() {
		var elem = $('.checklist input[value="'+$(this).val()+'"]');
		if(elem.length > 0) {
			elem.prop('checked',true);
		}
	})
    $('.checklist').find('.button.green').click(function() {
        districtConfirm(block_id);
    })
    $('.checklist').find('[name="all"]').click(function() {
        if($(this).prop('checked')) {
            $('.checklist').find('input[name="field[cb]"]').each(function() {
                $(this).prop('checked',true);
            });
        } else {
            $('.checklist').find('input[name="field[cb]"]').each(function() {
                $(this).prop('checked',false);
            });
        }

    });
    //
}


function GETParameters(search) {
	if (search ==undefined) search = document.location.search;
	var _GET = search.replace('?','').split('&');
	var GET = { };
	for(var i = 0; i < _GET.length; i++) {
		var p = _GET[i].split('=',2);
		if (p[0]!='')
			GET[p[0]] = p[1];
	}
	return GET;
}

function districtConfirm(block_id) {
    $('#'+block_id+'_inputs').html('');
    $('.checklist').find('input').each(function() {
        if($(this).prop('checked') && $(this).val() !== '0') $('#'+block_id+'_inputs').append('<input type="hidden" name="'+block_id+'[]" value="'+$(this).val()+'" />');
    });
	$('.popup_messagebox, .shadow').fadeOut('fast', clearMessageboxes());
}

// Функции-аналоги sprintf-а
if (!String.format) {
	String.format = function (format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}
if (!String.prototype.format) {
	String.prototype.format = function () {
		var args = Array.prototype.slice.call(arguments, 0);
		args.unshift(this);
		return String.format.apply(null, args);
	};
}

Lib = {};
Lib.getReference = (function (NameRef,SelectContainer,type,callback, defaultValue) {
	if (type===undefined) type = 'json';
	Ajax({'url':cfgMainHost + '/common/ajax/index.php','module':'lib','action':'getRef','data':{'NameRef':NameRef,type:type},'after':function (data){
		if (!(SelectContainer instanceof jQuery)) SelectContainer = $(SelectContainer);	
		
		if (!$.isEmptyObject(data.result)&&SelectContainer.length>0) {
			if (SelectContainer.prop('tagName')!='SELECT'&&SelectContainer.find('select').length>0)
				SelectContainer = SelectContainer.find('select');
		
			
			
			if (SelectContainer.prop('tagName')=='SELECT') {
				SelectContainer.empty();
                                var defaultVal = SelectContainer.data("prevalue");
                                if (defaultValue!==undefined) {
                                    defaultVal = defaultValue;
                                }
				var html = '<option value=""></option>';
				for (var i in data.result) {
					html+='<option value="'+i+'" '+((defaultVal==i)?'selected="selected"':'')+'>'+data.result[i]+'</option>';
				}
				
				SelectContainer.html(html).trigger('chosen:updated').trigger('change');
	
			}
			else console.error('Блок не select',SelectContainer);
			
		}
                if (typeof callback =='function') {
                    callback();
                }
			
	}});
});
//для обратной совместимости пока
Lib.getQueryParams = (function (search) {
	return GETParameters(search);
});





