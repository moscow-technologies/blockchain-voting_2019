// универсальный контроллер шагов
function FormController(steps, options, curStep) {
    if (options===undefined) options = {};
    try {


        if (MPGU!==undefined&&!$.isEmptyObject(MPGU.controller)) {
            options.org_id = MPGU.controller.org_id;
            options.form_id = MPGU.controller.form_id;
            options = $.extend(options,MPGU.controller);
        } //далее deprecated
        else
        if (MPGU!==undefined&&MPGU.FORM!==undefined) {
            options.org_id = MPGU.FORM.ORG_ID;
            options.form_id = MPGU.FORM.FORM_ID;
        }
        else {
            options.org_id = $('#form_element [name="org_id"]').val()||document.location.pathname.match('/application\/([^\/]+)\/([^\/]+)/ig')[1]||'unknown';
            options.form_id = $('#form_element [name="form_id"]').val()||document.location.pathname.match('/application\/([^\/]+)\/([^\/]+)/ig')[2]||'unknown';
        }

    }
    catch(exception) {}




    if (typeof options.useHitcounter === 'undefined') {
        options.useHitcounter = true; //включим по умолчанию на всех формах и выключим, если на форме выключено принудительно 19379
    }
    if (options.useHitcounter !== undefined && options.useHitcounter&&!FormController.id_func_changestep_from_hash) {

        PersonEventCollector.newEvent(options.org_id+'_'+options.form_id, "formcontroller", "start");
        sendYandexMetrica('start');
    }


    if ($('[name="attach"]').length>0&&$('[name="app_id"]').length>0){
        $('[name="attach"]').val($('[name="app_id"]').val());
    }

    // добавляем метку к финальному шагу
    clearTimeout(FormController.id_func_changestep_from_hash);
    FormController.controller = this;
    FormController.wait_no_revert = false; //не откатывать шаги во время действий определенных
    // есть перевыбранное ЮЛ, значит сохраняем черновик, вместо отправки формы
    if ($('#mpgu-declarant-selector').length > 0 && $('#mpgu-declarant-selector').val() !== '0') {
        options.make_draft = true;
        options.finishButtonText = 'Сохранить черновик';
        options.useSendingPopup = false;
        options.esepSign = false;
    } else {
        options.make_draft = false;
    }

    if (options.use_captcha!==false&&$('#form_element .captcha').length>0) {
        if ($('#form_element .captcha').length>1) {
            //убьем дубли
            $('#button_next').closest('.form-controls').prev('.captcha').addClass('main_captcha');
            $('#form_element .captcha:not(.main_captcha)').remove();
        }

        $('.captcha .captcha_refresh').off('click.captcha').on('click.captcha',function(){
            FormController.ChangeCaptcha($(this));
            return false;
        });
        $('.captcha .captcha_text').off('change.captcha_text').on('change.captcha_text',function(){
            var captcha = $(this).closest('.captcha');
            captcha.find('.captcha_error').hide();
            return false;
        });

        options.use_captcha = true;
        $('#form_element .captcha').hide();
    }
    else options.use_captcha = false;

    FormController.currentStep = curStep || 1;
    var prevValidators = {},
        nextValidators = {},
        prevActions = {},
        nextActions = {},
        afterStepHandlers = {},
        beforeStepHandlers = {};
    var stepHeadersWidth = [];
    if (MPGU!=undefined&&!$.isEmptyObject(MPGU.controller))
        options = $.extend(options,MPGU.controller);

    if (typeof options.skipAgreement === 'undefined') options.skipAgreement = true;
    if (typeof options.buttonName === 'undefined') options.buttonName = 'Продолжить';
    if (typeof options.finishButtonText === 'undefined') options.finishButtonText = 'Отправить';




    //TAG: ESEP_SIGN подписание через РУЛ
    if (typeof options.esepSign !== 'undefined'&&options.esepSign) {
        $('#form_element').find('> fieldset.form-step.esep').remove();
        $('#form_element').find('> fieldset.form-step.submit-step').removeClass('submit-step');
        var $lastStep = $('#form_element').find('> fieldset.form-step:not(.disabled):last');
        $lastStep.addClass('submit-step');
        $lastStep.after($([
            '<fieldset class="form-step esep hidden">',
            '<legend>Просмотр и подписание заявления</legend>',
//			'<fieldset class="form-block">',
//			'<legend>Подписание заявления ЭП</legend>',
            '<iframe class="form-block no-legend" id="esep-sign-frame" src="about:blank" style="width: 100%; height: 630px;"></iframe>',
//			'</fieldset>',
            '</fieldset>'
        ].join('')));
        var signStep = $('#form_element').find('> fieldset.form-step:not(.disabled)').length - 1;
        afterStepHandlers[signStep] = [function (step, data) {
            $('#esep-sign-frame').next('fieldset').remove();

            if (data && data.data && data.data.url) {
                FormController.stepSubmitting = true;
                FormController.SetStateBtn('disabled');
                $('#esep-sign-frame').empty();
                $('#esep-sign-frame').attr('src', data.data.url).show();
                $('#form_element .captcha').hide();
            }
            else if (data!=undefined) {
                FormController.stepSubmitting = true;
                FormController.SetStateBtn('disabled');
                $('#esep-sign-frame').hide().after('<fieldset class="form-block"><p>Произошла ошибка в работе модуля подписания.<br/>Нажмите на кнопку "Сохранить черновик" и попробуйте произвести отправку позднее.<br/>Приносим извинения за доставленные неудобства.</p></fieldset>');
            }
            return true;
        }];
        function onESEPMessageReceived(event) {
            // if (!event.origin || typeof baseDomain === 'undefined' || event.origin.replace(/^http(s)?:/i, '') != baseDomain.replace(/^http(s)?:/i, ''))
            if (!event.origin || (event.origin.replace(/^http(s)?:/i, '') != MPGU.esep.baseDomain))
                return;
            var result;
            if (typeof event.data === 'string') {
                try {
                    result = event.data.split(','); // "{"id":"idd_15C3FEAB-8EFB-4033-9859-CFDC957FEFE0","name":"C:\\fakepath\\test.doc","size":22016,"callbackCode":"file_upload__1"}"
                } catch (e) {
                    return;
                }
                if (result.length === 2) {
                    //TODO: Проверить, что прислал фрейм ЕСЭПа
                    $('#form_element').find('input[name="esep_sign_ok"]').remove();
                    $('#form_element').prepend('<input type="hidden" name="esep_sign_ok" value="1"/>');
                    FormController.stepSubmitting = false;
                    FormController.SetStateBtn('enabled');
                } else {
                    FormController.controller.advancePrev();
                }
            } else if (typeof event.data.url !== 'undefined') {
                var visualUrl = event.data.url;
                messagebox(visualUrl);
            }
        }

        if (window.addEventListener) {
            window.addEventListener("message", onESEPMessageReceived, false);
        } else {
            window.attachEvent("onmessage", onESEPMessageReceived);
        }
    }

    //TAG: CHED_SIGN подписание через ЦХЕД
    if (typeof options.chedSign !== 'undefined'&&options.chedSign) {
        $('#form_element').find('> fieldset.form-step.ched_sign').remove();
        $('#form_element').find('> fieldset.form-step.submit-step').removeClass('submit-step');
        var $lastStep = $('#form_element').find('> fieldset.form-step:not(.disabled):last');
        $lastStep.addClass('submit-step');
        $lastStep.after($([
            '<fieldset class="form-step ched_sign hidden">',
            '<legend>Просмотр и подписание заявления</legend>',
            '<fieldset class="form-block" id="ched-sign-frame" style="padding-top:30px;"><img class="ched_sign_loader" src="'+cfgMediaHost+'/common/img/base/loader.gif">Обратитесь в службу поддержи или попробуйте еще раз.</div>',
            '</fieldset>',
            '</fieldset>'
        ].join('')));

        var signStep = $('#form_element').find('> fieldset.form-step:not(.disabled)').length - 1;
        afterStepHandlers[signStep] = [function (step, data) {
            //console.log(data);
            if (data!=undefined) {
                FormController.SetStateBtn('disabled');
                $('#form_element .captcha').hide();
                $('#ched-sign-frame').empty();
            }
            if (data&&data.result&&data.data) {
                //меняем на другую услугу
                if (data.data.form_id) options.form_id = data.data.form_id;
                if (data.data.org_id) options.org_id = data.data.org_id;
                if ($('#form_element [name="messageId"]').length==0)
                    $('#form_element').prepend('<input type="hidden" name="messageId" value="'+data.data.messageId+'"/>');
                else  $('#form_element [name="messageId"]').val(data.data.messageId);
                
                var ched_type = $('#form_element [name="ched_service"]');
                if (ched_type.length>0) {
                    var service = ched_type.val();
                }
                else {
                    var service = options.org_id+'_'+options.form_id+'_msign';
                }

                if ($.isArray(data.data.files)) {
                    FormController.stepSubmitting = true;
                    var guids = data.data.files;
                    var signed_guids = [];
                    var config = {
                        domContainerId: 'ched-sign-frame',
                        domain: MPGU.extStorage.domain,
                        channel: MPGU.extStorage.channel,
                        service: service,
                        handleErrors: false,
                        enabled: true,
                        preloadedDocuments: data.data.files,
                        callbacks: {

                            afterSign: function(data){
                                signed_guids.push(data);

                                if ($.unique(signed_guids).length==guids.length) {
                                    //убрать кнопку за другого
                                    $('.ched-btn-sign-all').closest('tr').remove();
                                    if ($('#ched-sign-frame .sign_complete').length==0)
                                        $('#ched-sign-frame').append('<div class="form-infobox green sign_complete">Документы успешно подписаны, Вы можете отправить заявление.</div>');
                                    FormController.SetStateBtn('enabled');
                                    $('#ched-sign-frame .doc-image-label').addClass('show').removeAttr('onclick');
//									$('div[class$="-EI"] > input[type=button]:last').trigger('click');
                                    FormController.stepSubmitting = false;

                                }
                                return false;

                            },
                            onFormLoad: function(data){
                                //console.log(data);
                                $('#ched-sign-frame .doc-image-label').attr('onclick','event.stopPropagation(); return false;')
                            },
                            onError: function(data){
                                var kk, errorMessage = [
                                    'Произошла ошибка в работе модуля подписания. Пожалуйста, сохраните черновик и загрузите новую версию плагина для осуществления подписания по ссылке <a href="https://www.cryptopro.ru/sites/default/files/products/cades/demopage/simple.html">Плагин КриптоПро</a>.'
                                ];

                                if (data.errors) {
                                    errorMessage[errorMessage.length] = '';
                                    errorMessage[errorMessage.length] = 'Техническая информация:';

                                    for (kk in data.errors) {
                                        if (data.errors[kk].originalError && data.errors[kk].originalError.message)
                                        errorMessage[errorMessage.length] = data.errors[kk].originalError.message;
                                    }
                                }

                                $('#ched-sign-frame .sign_complete').remove();
                                messagebox(
                                    'Информация',
                                    errorMessage.join('<br>')
                                );
//								messagebox('','К сожалению, произошла ошибка при подписании, попробуйте обратиться позднее. Сохраните черновик, чтобы не потерять Ваши данные.');

                            }
                        },
                        bindings: {
                        }
                    };


                    //console.log(config);
                    try {
                        var uform = $('#ched-sign-frame').data('uform');
                        if (uform) uform.remove();
                        if (data.data.eno) {
                            config.ENO = data.data.eno;
                        }
                        var uform = createUForm(config);
                        $('#form_element').attr('onSubmit',"return false;");
                        $('#ched-sign-frame').data('uform',uform).append($('#loader').clone().show());
                    }
                    catch (e) {messagebox('К сожалению, сервис ЦХЭД не доступен, попробуйте обратиться позднее. Сохраните черновик, чтобы не потерять Ваши данные.');}



                }
                else {
                    var chedError = 'Произошла ошибка при подготовке заявления к подписанию.<br/>Попробуйте позже или обратитесь за информацией в службу технической поддержки.';
                    $('#ched-sign-frame').html(chedError);
                    messagebox('Информация', chedError);
                }
            }

            if (data&&data.error) {
                messagebox('Информация', data.error);
                if (!data.result) $('#ched-sign-frame').html(data.error);
            }
            if (data&&data.form_hash) {$('input[name="uniqueFormHash"]').val(data.form_hash);}

            return true;
        }];

//		function onESEPMessageReceived(event) {
//			// if (!event.origin || typeof baseDomain === 'undefined' || event.origin.replace(/^http(s)?:/i, '') != baseDomain.replace(/^http(s)?:/i, ''))
//			if (!event.origin || (event.origin.replace(/^http(s)?:/i, '') != MPGU.esep.baseDomain))
//				return;
//			var result;
//			if (typeof event.data === 'string') {
//				try {
//					result = event.data.split(','); // "{"id":"idd_15C3FEAB-8EFB-4033-9859-CFDC957FEFE0","name":"C:\\fakepath\\test.doc","size":22016,"callbackCode":"file_upload__1"}"
//				} catch (e) {
//					return;
//				}
//				if (result.length === 2) {
//					//TODO: Проверить, что прислал фрейм ЕСЭПа
//					$('#form_element').find('input[name="esep_sign_ok"]').remove();
//					$('#form_element').prepend('<input type="hidden" name="esep_sign_ok" value="1"/>');
//					FormController.stepSubmitting = false;
//					FormController.SetStateBtn('enabled');
//				} else {
//					FormController.controller.advancePrev();
//				}
//			} else if (typeof event.data.url !== 'undefined') {
//				var visualUrl = event.data.url;
//				messagebox(visualUrl);
//			}
//		}
//
//		if (window.addEventListener) {
//			window.addEventListener("message", onESEPMessageReceived, false);
//		} else {
//			window.attachEvent("onmessage", onESEPMessageReceived);
//		}
    }

    //TAG PEP
    if (typeof options.pep !== 'undefined'&&options.pep&&Pep!=undefined) {
        $('.pep_tmpl').remove();
        var $lastStep = $('#form_element').find('> fieldset.form-step:not(.disabled):last');
        $lastStep.after('<fieldset class="form-step hidden pep_tmpl"><legend>Подписание простой электронной подписью</legend></fieldset>');
        Pep().initialize(options);

        var signStep = $('#form_element').find('> fieldset.form-step:not(.disabled)').length - 1;
        nextValidators[signStep+1] = [function () {
            return Pep().check_pep();
        }];
    }





    var act = $(this).attr('action');
    if (act == undefined)
        act = '';
    $('#form_element').attr('action', act + '#complete').attr('onSubmit',"return false;").attr('accept-charset','utf-8');
    $('#form_element').data('mpgu-form-controller', this);
    if (!options||options&&options.init_scroll) {
        if ($('[name="step"]').val() > 1) {
            document.location.href = "#step_" + $('[name="step"]').val();
        }
    }

    var $stepsContainer = $('#form-steps-container'),
        stepsChild = [];

    // $stepsContainer.html('');

    $('#form_element fieldset.form-step:not(.disabled)').each(function (idx, item) {
        $(item).attr('id', 'step_' + (idx + 1));
        var stepName = $(item).children('legend').text();
        var out = stepName.match(/^Шаг [0-9]+\. (.+)/i);
        if (!!out&&out.length>0) stepName = out[1];
        if (stepName) {
            var $stepNumber = $('<div/>', { class: 'step-number', text: (idx + 1)}),
                $stepText = $('<div/>', { class: 'step-text', text: stepName}),
                $link = $('<a/>', {'data-toggle': 'tab'}).html($stepNumber).append($stepText);


            stepsChild.push(
                $('<li/>', {
                    'id': 'step_' + (idx + 1) + '_header',
                    'for':  'step_' + (idx + 1),
                    'class': 'step-header step-tabs ' + (FormController.currentStep == (idx + 1) ? 'current' : '') ,
                    'title': stepName
                }).html($link)
            );

            // $('<li/>', {
            //     'id': 'step_' + (idx + 1) + '_header',
            //     'for':  'step_' + (idx + 1),
            //     'class': 'step-header step-tabs',
            //     'title': stepName
            // }).html($link).appendTo($stepsContainer);


            //$('<div/>', {id: 'step_' + (idx + 1) + '_header'}).attr('for', 'step_' + (idx + 1)).addClass('step-header').html('<span>' + (idx + 1) + '</span>' + stepName).attr('title', stepName).appendTo($stepsContainer);

            /*
			$('<li/>', {id: 'step_' + (idx + 1) + '_header'})
				.attr('for', 'step_' + (idx + 1))
				.addClass('step-header')
				.html('<a data-toggle="tab">' + (idx + 1) + '</a><span>'+stepName+'<span>')
				.attr('title', stepName)
				.appendTo($stepsContainer);
            */

            $(item).children('legend').text('Шаг ' + (idx + 1) + '. ' + stepName);
        }
        $(item).data('step_num', idx);
    });

    $stepsContainer.html(stepsChild);
    FormController.SetStateBtn(false,steps==1&&options && options.finishButtonText ? options.finishButtonText : options.buttonName);

    $(document).off('change.scroll keyup.scroll paste.scroll').on('change.scroll keyup.scroll paste.scroll','#form_element input:not(.chosen-container input), #form_element select, #form_element textarea', function (event) {
        var $field = $(this);
        if (draft_in_process||FormController.wait_no_revert||(typeof this.form !== 'undefined' && $field.is($(this.form).data('validator').settings.ignore) && !$field.hasClass('magic'))||event.draft) //magic - класс для мультиблоков поля field[internal.staff][]
            return true;
        $('[before_send_state]').each(function(){
            switch ($(this).attr('before_send_state')){
                case '1':
                    $(this).attr('disabled','disabled');
                    break;
                case '0':
                    $(this).removeAttr('disabled');
                    break;
            }
            $(this).removeAttr('before_send_state');
        });

        var elementStep = $field.closest('fieldset.form-step:not(.disabled)').data('step_num') + 1;
        if (FormController.controller.getCurrentStep() > elementStep) {
            FormController.SetStateBtn('enabled');
            FormController.controller.changeStep('step_' + elementStep);
            FormController.stepSubmitting = false;

        }
        return true;
    });
    $('#form_element input:not(.chosen-container input), #form_element select, #form_element textarea').off('change.scroll keyup.scroll paste.scroll').on('change.scroll keyup.scroll paste.scroll', function (event) {
        var $field = $(this);
        if (draft_in_process||FormController.wait_no_revert||(typeof this.form !== 'undefined' && $field.is($(this.form).data('validator').settings.ignore) && !$field.hasClass('magic'))||event.draft) //magic - класс для мультиблоков поля field[internal.staff][]
            return true;
        $('[before_send_state]').each(function(){
            switch ($(this).attr('before_send_state')){
                case '1':
                    $(this).attr('disabled','disabled');
                    break;
                case '0':
                    $(this).removeAttr('disabled');
                    break;
            }
            $(this).removeAttr('before_send_state');
        });

        var elementStep = $field.closest('fieldset.form-step:not(.disabled)').data('step_num') + 1;
        if (FormController.controller.getCurrentStep() > elementStep) {
            FormController.SetStateBtn('enabled');
            console.log('откат до '+'step_' + elementStep+''+$field.attr('name'));
            FormController.controller.changeStep('step_' + elementStep);
            FormController.stepSubmitting = false;

        }
        return true;
    });

    /**
     * Получает общее колличество шагов формы, основываясь на элементах формы.
     * 
     * @return int
     */
    function getTotalStepsFromFormElements() {
        return $('#form_element fieldset.form-step:not(.disabled)').length;
    }
    
    if (steps > 0 && steps !== getTotalStepsFromFormElements())
        console.error('Ошибка инициализации FormController-а! Не соответствие количества шагов!');
    this.totalSteps = getTotalStepsFromFormElements();
    recalcNextSubmit(this);
    if (options.use_captcha&&(this.submitStep=='1'||this.totalSteps=='1'))
        $('#form_element .captcha').show();
    $('#form-steps-container .step-header').each(function (idx, item) {
        stepHeadersWidth.push($(item).outerWidth()+4);
    });
    if (stepHeadersWidth.length === 1) stepHeadersWidth[0] = $('#form-steps-container').outerWidth();

    $('#form-steps-container .step-header').off('click.controller').on('click.controller', function () {
        var hash = $(this).attr('for');
        var step_number = hash.split('_');
        step_number = step_number[1]||'1';
//		var top = $('#' + hash + ':visible').offset();
        if (FormController.controller.getCurrentStep() > step_number) {
            FormController.SetStateBtn('enabled');
            FormController.controller.changeStep(hash);
            FormController.stepSubmitting = false;
        }

    });
    this.getCurrentStep = function () {
        return FormController.currentStep;
    };
    function updateStepHeaders() {
        var stepsHeaderContainerWidth = $('#form-steps-container').outerWidth();
        var currentStepWidth = stepHeadersWidth[FormController.currentStep - 1];
        var stepDeltaBefore;
        var stepDeltaAfter;
        if (FormController.controller.totalSteps === 1){
            stepDeltaBefore = 0;
            stepDeltaAfter = 0;
        } else if (FormController.currentStep === 1) {
            stepDeltaBefore = 0;
            stepDeltaAfter = (stepsHeaderContainerWidth - currentStepWidth) / (FormController.controller.totalSteps - 1);
        } else if (FormController.currentStep === FormController.controller.totalSteps) {
            stepDeltaBefore = (stepsHeaderContainerWidth - currentStepWidth) / (FormController.controller.totalSteps - 1);
            stepDeltaAfter = 0;
        } else {
            stepDeltaBefore = (stepsHeaderContainerWidth - currentStepWidth) / (FormController.controller.totalSteps - 1);
            stepDeltaAfter = (stepsHeaderContainerWidth - currentStepWidth) / (FormController.controller.totalSteps - 1);
        }

        $('#form-steps-container .step-header').removeClass('current').removeClass('done');
        var curStepPosition = 0;

        $('#form-steps-container .step-header').each(function (idx, item) {
            var $stepHeader = $(item);

            if (idx + 1 < FormController.currentStep) {
                curStepPosition += stepDeltaBefore;
            } else if (idx + 1 === FormController.currentStep) {
                $stepHeader.addClass('current');
                curStepPosition += currentStepWidth;
            } else {
                curStepPosition += stepDeltaAfter;
            }

        });
        $('#form_element fieldset.form-step:not(.disabled):eq(' + (FormController.currentStep - 1) + ')').find('select').each(function (idx, item) {
            var chosenOptions = $(item).data('chosen-options');
            $(item).chosen('destroy');
            $(item).chosen(chosenOptions);
        });
        setStepWidth();
    }
    function runValidators(direction) {
        var validators = direction == 'next' ? nextValidators[FormController.currentStep] : (direction == 'prev' ? prevValidators[FormController.currentStep] : 0);
        if (typeof validators == 'object')
            for (var i in validators)
                if (!validators[i](direction))
                    return false;
        return true;
    }
    function runHandlers(fromStep, data) {
        //if ($('h1').length>0) $('h1')[0].scrollIntoView();
        var result = true;
        var handlers = afterStepHandlers[FormController.currentStep];
        if (typeof handlers == 'object')
            for (var i in handlers) {
                var temp = handlers[i](fromStep, data);
                if (temp===undefined) temp = true;
                else if (temp===false) temp = false;
                if (!temp) result = false;
            }
        return result;
    }
    function runBeforeHandlers(fromStep) {
        //if ($('h1').length>0) $('h1')[0].scrollIntoView();
        var before_handlers = beforeStepHandlers[fromStep];
        if (typeof before_handlers == 'object')
            for (var i in before_handlers)
                return before_handlers[i](fromStep);
        return true;
    }
    this.addValidator = function (validator) {
        var step = validator.step, prev = validator.prev, next = validator.next;
        if (prev)
            if (!prevValidators[step])
                prevValidators[step] = [prev];
            else
                prevValidators[step].push(prev);
        if (next)
            if (!nextValidators[step])
                nextValidators[step] = [next];
            else
                nextValidators[step].push(next);
    };
    this.addAfterStepHandler = function (handler) {
        var step = handler.step;
        if (!afterStepHandlers[step])
            afterStepHandlers[step] = [handler.action];
        else
            afterStepHandlers[step].push(handler.action);
    };
    this.addBeforeStepHandler = function (handler) {

        var step = handler.step;
        if (!beforeStepHandlers[step])
            beforeStepHandlers[step] = [handler.action];
        else
            beforeStepHandlers[step].push(handler.action);
        //console.log(beforeStepHandlers)
    };
    this.setAction = function (action) {
        var step = action.step, prev = action.prev, next = action.next;
        prevActions[step] = prev;
        nextActions[step] = next;
    };
    this.setCurrentStep = function (step,no_scroll) {
        FormController.currentStep = step;
        if (!no_scroll)
            $('html, body').animate({scrollTop: getStepPosition($('#step_' +step))}, 300, function () {
                if (document.location !== '#step_' +step) {
                    // При изменении document.location происходит прокрутка к шагу,
                    // поэтому мы изменяем позицию видимой части на актуальное значение.
                    document.location = '#step_' +step;
                    $('html, body').scrollTop(getStepPosition($('#step_' +step)));
                }
            });
        if (options.use_captcha&&(FormController.controller.submitStep==FormController.currentStep)) {
            $('#form_element .captcha').show().removeClass('checked');
        }
        else {
            $('#form_element .captcha').hide().removeClass('checked');;
        }
    };
    this.getCurrentStep = function () {
        return FormController.currentStep;
    };
    this.runHandlers = function (fromStep, data) {
        return runHandlers(fromStep, data);
    };
    this.runBeforeHandlers = function (fromStep) {
        return runBeforeHandlers(fromStep);

    };
    // программный переход на предыдущий шаг

    this.advancePrev = function ($button_name) {
// сначала запускаем валидаторы
        if (!runValidators('prev'))
            return false;
        var action = prevActions[FormController.currentStep];
        var prevStep = action ? action(FormController.currentStep) : FormController.currentStep - 1;
        if ($('[name="attach"]').length==0)
            $('[name="app_id"]').remove(); //будем всегда удалять при откате назад номер заявки 19946

        if (FormController.currentStep === FormController.controller.totalSteps) { // с последнего шага
           FormController.SetStateBtn(false, ($button_name != undefined && $button_name) ? $button_name : options.buttonName);
        }
        if (options.use_captcha && (this.submitStep == prevStep)) {
            FormController.ChangeCaptcha($('#form_element .captcha'));
            $('#form_element .captcha').show();

        }
        else
            $('#form_element .captcha').hide();

        $('#validate_error').hide();
        //$('#step_' + prevStep).show();
        //$('#step_' + currentStep).hide();
        $('#form_element fieldset.form-step:not(.disabled):gt(' + (prevStep - 1) + ')').hide();
        if ($('#form_element fieldset.form-step:not(.disabled)').eq(prevStep - 1).length > 0) {
            var $step = $('#form_element fieldset.form-step:not(.disabled)').eq(prevStep - 1).show();
            if (!options || !options.scrolling_to_step) {
                $('html, body').animate({
                    scrollTop: getStepPosition($step)
                }, 300, 'easeOutExpo');
            }
        }
        var preservedCurrStep = FormController.currentStep;
        FormController.currentStep = prevStep;
        FormController.validationChecked = false;


        $('[name="step"]').val(FormController.currentStep);
        $('#form_element [name="final_step"]').remove(); //удалить флаг финального шага
        runHandlers(preservedCurrStep); // обработчики после перехода

        if (options.useHitcounter !== undefined && options.useHitcounter) {
            var dataEvent = {
                "currentStep": preservedCurrStep,
                "nextStep": prevStep
            };

            PersonEventCollector.newEvent(options.org_id + '_' + options.form_id, "step", "change", dataEvent);
            sendYandexMetrica('step_backword');
        }
        updateStepHeaders();
        recalcNextSubmit(FormController.controller);
        return true;
    };

    function recalcNextSubmit(formController) {
        var self = formController;
        if (1 == self.totalSteps)
            FormController.SetStateBtn(false, options.finishButtonText);
        self.submitStep = self.totalSteps;
        $('#form_element fieldset.form-step:not(.disabled)').each(function (idx, item) {
            if ($(item).hasClass('submit-step') && FormController.currentStep <= (idx + 1))
                self.submitStep = idx + 1;
        });
    }

    this.onAjaxSubmit = function (data) {
        FormController.stepSubmitting = false;

        if (data.app_id) {
            $('#form_element').find('input[name="app_id"]').remove();
            $('#form_element').prepend('<input name="app_id" type="hidden" value="' + data.app_id + '"/>');
        }
        if (data.form_hash) {
            $('#form_element').find('input[name="uniqueFormHash"]').val(data.form_hash);
        }

        $('#form_element').find('#wait-for-' + FormController.currentStep).hide();
        if (data.captcha) {
            if (data.image) FormController.ReplaceCaptcha($('#form_element .captcha'),data.image);
            messagebox('Информация', data.result);
            try {
                grecaptcha.reset();
            }
            catch(e) {}
            $('#form_element .captcha').removeClass('checked');
            FormController.SetStateBtn('enabled');
            return false;
        }
        var preservedCurrStep = FormController.currentStep + 1;
        if (runHandlers(preservedCurrStep, data)) {
            recalcNextSubmit(FormController.controller);
            FormController.currentStep++;
            $('[name="step"]').val(FormController.currentStep);
            FormController.controller.changeStep('step_'+FormController.currentStep);
            return true;
        }
        else {
            if (options.use_captcha&&(FormController.controller.submitStep==FormController.currentStep))
                $('#form_element .captcha').show().removeClass('checked');
            else $('#form_element .captcha').hide();
            return false;
        }
    };


    // программный переход на следующий шаг
    this.advanceNext = function () {

        var btn = $('#button_next');


        if (!draft_in_process&&!FormController.validationChecked) {
            var steps = $('#form_element .form-step, #form_element .captcha').filter(function(){return ($(this).css('display')!='none');});
            if (check_validation_block_for_multiblock(steps)) $('#validate_error').hide();
            else {
                $('#validate_error').show();
                //Если есть способ и агринмент, то выключим кнопку
                //FormController.SetStateBtn('enabled');
                if (!options || !options.skipAgreement) {
                    $('#form_element .form-step:not(:disabled):eq('+(FormController.currentStep-1)+')').find(FormController.checkbox_blocks+','+FormController.sposob_blocks).find('.wrap').filter(function(){return ($(this).css('display')!=='none');}).find('input:checkbox:first').trigger('change.controller');
                }

                FormController.SetStateBtn('enabled');
                return false;
            }
        }

        // теперь запускаем валидаторы
        if (!runValidators('next')){
            //Если есть способ и агринмент, то выключим кнопку

            if (!options || !options.skipAgreement) {
                $('#form_element .form-step:not(:disabled):eq('+(FormController.currentStep-1)+')').find(FormController.checkbox_blocks+','+FormController.sposob_blocks).find('.wrap').filter(function(){return ($(this).css('display')!=='none');}).find('input:checkbox:first').trigger('change.controller');
            }

            FormController.SetStateBtn('enabled');
            return false;
        }

        //если есть капча, нужно проверить на сервере код,если уже не проверена
        var captcha = $('#form_element .captcha');

        if ($('#g-recaptcha-response').length>0)
            $('#captcha_input').val($('#g-recaptcha-response').val());
        if (options.use_captcha&&!captcha.hasClass('checked')&&FormController.currentStep === FormController.controller.submitStep) {

            captcha.find('.captcha_text').attr('readonly','readonly');

            var code = false;
            try {
                code = grecaptcha.getResponse();
            }
            catch(e) {code = captcha.find('.captcha_text').val();}


            $.ajax( {
                url : cfgMainHost+'/common/ajax/index.php',
                type : 'POST',
                dataType : 'json',
                data : {ajaxModule : 'CaptchaBase',	ajaxAction : 'check', 'uniqueFormHash':$('[name="uniqueFormHash"]').val(),'code':code},
                success : function ( data ) {
                    if (data) {

                        if (data.result==1) {
                            captcha.addClass('checked');
                            FormController.controller.advanceNext();
                        }
                        else if (typeof data.result === 'string') {

                            captcha.find('.captcha_error').show();
                            FormController.ReplaceCaptcha(captcha,data.result);
                            messagebox('Информация', data.text);
                            FormController.SetStateBtn('enabled');
                        }
                        else if (typeof data.text === 'string') {
                            messagebox('Информация', data.text);
                            try {
                                grecaptcha.reset();
                            }
                            catch(e) {}
                            FormController.SetStateBtn('enabled');
                        }
                    }

                }

            } );
            return false;
        }

        //серверная валидация
        if (!FormController.validationChecked && FormController.currentStep === FormController.controller.submitStep) {
            serverValidation.validate({
                module: 'FormProcessor',
                validator: 'DefaultTestValidator',
                data: $('#form_element').find('> input, fieldset.form-step:not(.disabled):not(:hidden) :input:not(:disabled)').serialize(),
                async: false,
            },
                    function (data, status, state) {
                        //console.log(data, status, state, 'error');
                        FormController.validationChecked = true;
                        FormController.controller.advanceNext();
                        return true;
                    },
                    function (data, status, state) {
                        var data = JSON.parse(data);
                        //console.log(data, status, state, 'success');
                        var errorFields = (data.message != undefined) ? data.message : [];
                        if (data.message != undefined) {
                            var html = '';
                            for (var i in errorFields) {
                                var $clone_label_text = $('[name="' + i + '"]').closest('.wrap').find('> label').text().replace('*', '');
                                var field_arr = i.match(/field\[([^\]]+)\]/)[1].split('.');
                                var desc = '';
                                switch (field_arr[0]) {
                                    case 'declarant':
                                    case 'account':
                                        desc += ' заявителя';
                                        break;
                                    case 'trustee':
                                        desc += ' представителя';
                                        break;
                                    case 'head':
                                        desc += ' руководителя';
                                        break;
                                    default:
                                        break;
                                }
                                var out = [];
                                if (out = errorFields[i].match(/Max\:([0-9]+)\:([0-9]+)/)) {
                                    html += '<p>Поле <b>"' + $clone_label_text + desc + '"</b> длиной ' + out[1] + ' превышает допустимое значение равное ' + out[2] + '.</p>';
                                }
                                else if (out = errorFields[i].match(/Min\:([0-9]+)\:([0-9]+)/)) {
                                    html += '<p>Поле <b>"' + $clone_label_text + desc + '"</b> длиной ' + out[1] + ' не достигает допустимое значение равное ' + out[2] + '.</p>';
                                }
                                else
                                    switch (errorFields[i]) {
                                        case 'Not a number':
                                            html += '<p>Поле <b>"' + $clone_label_text + desc + '"</b> должно быть числом.</p>';
                                            break;
                                        case 'Min or Max value error':
                                            html += '<p>Поле <b>"' + $clone_label_text + desc + '"</b> не соответствует допустимым значениям минимальной и максимальной длины.</p>';
                                            break;
                                        case 'Pattern return error':
                                            html += '<p>Поле <b>"' + $clone_label_text + desc + '"</b> не соответствует допустимому формату ввода.</p>';
                                            break;
                                        case 'Value is required':



                                            if ($clone_label_text != "") {

                                            }
                                            else {

                                                switch (field_arr[field_arr.length - 1]) {
                                                    case 'gendercode':
                                                        $clone_label_text = 'Пол';
                                                        break;
                                                    case 'firstname':
                                                        $clone_label_text = 'Имя';
                                                        break;
                                                    case 'lastname':
                                                        $clone_label_text = 'Фамилия';
                                                        break;
                                                    case 'middlename':
                                                        $clone_label_text = 'Отчество';
                                                        break;
                                                    case 'birthdate':
                                                        $clone_label_text = 'Дата рождения';
                                                        break;
                                                    default:
                                                        $clone_label_text = field_arr.join('.');
                                                        break;
                                                }
                                            }

                                            html += '<p>Поле <b>"' + $clone_label_text + desc + '"</b> должно присутствовать.</p>';
                                            break;
                                    }
                            }
                            messagebox('Уважаемый пользователь!',
                                    '<span class="error_message"><b>Внимание!</b> Некоторые поля на форме заполненны некорректно.</span><br/>Проверьте правильность заполнения следующих полей:' + html,
                                    getPopupWidth(), false, false, function () {
                                $('.popup_messagebox').css({'position': 'fixed', 'top': 70});
                            });
                        }
                        check_final = false;
                        return false;
                    }
            );
            return false;
        }


        var action = nextActions[FormController.currentStep];
        var nextStep = action ? action(FormController.currentStep) : FormController.currentStep + 1;
        if (!runBeforeHandlers(nextStep)) {
            return false;
        }
        recalcNextSubmit(FormController.controller);

        FormController.SetStateBtn('enabled');

        //Если есть способ и агринмент, то выключим кнопку
        if (!options || !options.skipAgreement) {
            $('#form_element .form-step:not(:disabled):eq('+(FormController.currentStep)+')').find(FormController.checkbox_blocks+','+FormController.sposob_blocks).find('.wrap').filter(function(){return ($(this).css('display')!=='none');}).find('input:checkbox:first').trigger('change.controller');
        }




        //заменить текст на кнопке
        if (nextStep === FormController.controller.totalSteps) btn.text(options.finishButtonText);


        if (FormController.currentStep === FormController.controller.submitStep) { // подача заявления
            if (FormController.stepSubmitting)
                return false;
            FormController.SetStateBtn('wait');
            if (options.useHitcounter !== undefined && options.useHitcounter) {
                var dataEvent = {
                    "currentStep" : preservedCurrStep,
                    "nextStep" : nextStep
                };
                PersonEventCollector.newEvent(options.org_id+'_'+options.form_id, "formcontroller", "send", dataEvent);
                sendYandexMetrica('send');

            }

            var sendForm = function (submitFunc) {
                if (options.make_draft) {
                    FormController.SetStateBtn('enabled');
                    return downloadAppFileFromForm('',false,
                        function(){
                            FormController.SetStateBtn('disabled','Черновик сохранен');
                        },
                        function(){

                        });
                }

                var $form = $('#form_element');

                // Подсчитываем количество прикрепленных файлов
                // Если такого элемента не существует, идем дальше
                var fileCount = parseInt($form.find('input[name^="field[internal.external_upload][files]"]').length);//?эм, только цхэд считаем?
                if (fileCount) {
                    var fileCountInput = $form.find('.file_count');
                    if (fileCountInput.length===0) {
                        fileCountInput = $('<input type="hidden" class="file_count" name="field[internal.file_count]" value="" />');
                        $form.append($(fileCountInput));
                    }
                    fileCountInput.val(fileCount);

                }


                $form.removeAttr('onsubmit');
                if (typeof submitFunc === 'undefined')
                    submitFunc = function($form){

                        var myNav = navigator.userAgent.toLowerCase();
                        var ie = (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1], 10) : parseInt(-1, 10);
                        if ($.inArray(ie,[9,10])>0){
                            var tryCount = 0;
                            var maxTry = 10;
                            var maxTime = 50;
                            function trySubmit() {
                                tryCount = tryCount + 1;
                                try {
                                    $form.submit();
                                    tryCount = maxTry;
                                }
                                catch (err) {
                                    if (tryCount < maxTry) setTimeout(trySubmit, maxTime);
                                    else {
                                        var submitFn = document.createElement('form').submit;
                                        submitFn.apply($form);
                                    }
                                }
                            }
                            setTimeout(trySubmit, maxTime);
                        }
                        else $form.submit();

                    };

                if (FormController.controller.submitStep === FormController.controller.totalSteps && ($form.find('input[name="app_id"]').length === 0 || $form.find('input[name="attach"]').length > 0)) {
                    $form.find('input[name="send_from_step"]').remove();
                    $form.prepend('<input type="hidden" name="final_step" value="1">');
                } else {
                    var $formStepField = $form.find('input[name="send_from_step"]');
                    if ($formStepField.length === 0) {
                        $form.prepend('<input type="hidden" name="send_from_step" value="">');
                        $formStepField = $form.find('input[name="send_from_step"]');
                    }
                    if (FormController.controller.submitStep === FormController.controller.totalSteps)
                        $form.prepend('<input type="hidden" name="final_step" value="1">');

                    $formStepField.val(FormController.controller.submitStep);
                }
                //скрыть блоки невидимые
                //только магия спасает от кары (магия мультиблоков)
                $form.find('fieldset:not(.form-step),.form-step.disabled,div:not(.buildingWithoutHouses),.wrap:not(.buildingWithoutHouses)').filter(function(){return ($(this).css('display')=='none')}).addClass('nonvalidation');
                $form.find('input:not(.magic),select,textarea').filter(function(){return ($(this).closest('.nonvalidation').length>0)}).each(function(){
                    $(this).attr('before_send_state',$(this).prop('disabled')?1:0).prop('disabled',true);
                });

                $form.find('input[name="app_content"]').remove();
                var app_content = $('<input type="hidden" name="app_content" value="">'),
                    tmp_container = $('#saveAppContID').hide();

                $form.append(app_content);
                // tmp_container.show(); // зачем показыват дубликат?

                FormController.generatehtmlview(tmp_container,FormController.controller.submitStep<FormController.controller.totalSteps?FormController.controller.submitStep:(FormController.controller.totalSteps + 1));

                if (options && options.onSubmit) {
                    options.onSubmit.apply(FormController, [
                        function () {
                            app_content.val(tmp_container.html());
                            tmp_container.html('').hide();
                            submitFunc($form);
                        }, tmp_container ]);
                } else {
                    app_content.val(tmp_container.html());
                    tmp_container.html('').hide();
                    submitFunc($form);
                }
            };
            if (FormController.controller.submitStep !== FormController.controller.totalSteps) { // посередине
                sendForm(function ($form) {
                    FormController.stepSubmitting = true;
                    $.post(window.location, $form.find('> input, .captcha input ,  fieldset.form-step:not(.disabled):not(:hidden) :input:not(:disabled)').serialize())
                        .done(function (data) {
                            var json;
                            try {
                                json = JSON.parse(data);
                            } catch (ex) {
                                json = {};
                            }
                            var result= FormController.controller.onAjaxSubmit(json);
                            if (result) {
                                $('#form_element fieldset.form-step:not(.disabled):gt(' + (nextStep - 1) + ')').hide();
                                var $step = $('#form_element fieldset.form-step:not(.disabled)').eq(nextStep - 1).show();
                                $('html, body').animate({
                                    scrollTop: getStepPosition($step)
                                }, 300);
                                $('#form_element').find('#wait-for-' + FormController.currentStep).show();
                                updateStepHeaders();
                            }

                        }).fail(function(data) {
                        var json;
                        try {
                            json = JSON.parse(data);
                        } catch (ex) {
                            json = {};
                        }
                        var result = FormController.controller.onAjaxSubmit(json);
                        if (result) {
                            $('#form_element fieldset.form-step:not(.disabled):gt(' + (nextStep - 1) + ')').hide();
                            var $step = $('#form_element fieldset.form-step:not(.disabled)').eq(nextStep - 1).show();
                            $('html, body').animate({
                                scrollTop: getStepPosition($step)
                            }, 300);
                            $('#form_element').find('#wait-for-' + FormController.currentStep).show();
                            updateStepHeaders();
                        }
                    })
                });

            } else { // на последнем шаге

                if (options && !options.useSendingPopup)
                    sendForm();
                else
                // показываем сообщение об отправке на последнем шаге
                    showSendingPopup(sendForm);
            }
            return false; // no more steps
        }

        $('#form_element fieldset.form-step:not(.disabled):gt(' + (nextStep - 1) + ')').hide();
        if ($('#form_element fieldset.form-step:not(.disabled)').eq(nextStep - 1).length>0) {
            var $step = $('#form_element fieldset.form-step:not(.disabled)').eq(nextStep - 1).show();
            if (!options||!options.scrolling_to_step) {
                $('html, body').animate({
                    scrollTop: getStepPosition($step)
                }, 300);
            }
        }

        var preservedCurrStep = FormController.currentStep;
        FormController.currentStep = nextStep;
        $('[name="step"]').val(FormController.currentStep);

        runHandlers(preservedCurrStep); // обработчики после перехода

        if (options.useHitcounter !== undefined && options.useHitcounter) {
            var dataEvent = {
                "currentStep" : preservedCurrStep,
                "nextStep" : nextStep
            };

            PersonEventCollector.newEvent(options.org_id+'_'+options.form_id, "step", "change", dataEvent);
            sendYandexMetrica('next_step');
        }

        if (options.use_captcha&&(this.submitStep==nextStep||nextStep === FormController.controller.totalSteps))
            $('#form_element .captcha').show();
        else $('#form_element .captcha').hide();
        updateStepHeaders();
        
        // Успешно перешли на следующий шаг, обновим хеш в адресной строке.
        FormController.controller.changeWindowHash();
        
        return true;
    };
    // обработчик кнопки Далее

    $('#button_next').off('click.controller').on('click.controller', function () { // must return false for <a> buttons
        if ($(this).attr('disabled'))
            return false;
        //$('.kladr input.Building').trigger('blur');
        setTimeout(function(){
            FormController.controller.advanceNext();
        },0);

        return false;
    });
    if (!options || !options.skipAgreement) {
        // обработчик согласия


        $(FormController.checkbox_blocks+','+FormController.sposob_blocks).find('input:checkbox,input:radio').off('click.controller change.controller').on('click.controller change.controller',function(){
            //по умолчанию зеленая
            var result = true;

            $(FormController.checkbox_blocks).filter(function(){return ($(this).css('display')!='none')}).each(function(){
                var block = $(this).closest('.form-block');
                if (block.find('input:checkbox:checked').filter(function(){return ($(this).closest('.wrap').css('display')!='none')}).length==block.find('input:checkbox').filter(function(){return ($(this).closest('.wrap').css('display')!='none')}).length) {
                    return true;
                }
                else {
                    result = false;
                    return false;
                }
            });

            if (result)
                $(FormController.sposob_blocks).filter(function(){return ($(this).css('display')!='none')}).each(function(){
                    var block = $(this).closest('.form-block');
                    if (block.find('input:checkbox:checked,input:radio:checked').length>0) {
                        return true;
                    }
                    else {
                        result = false;
                        return false;
                    }
                });



            if (result) FormController.SetStateBtn('enabled');
            else FormController.SetStateBtn('disabled');

        });

    }

    // обработка шагов через историю
    this.changeStep = function (hashString) {
        var requested = parseInt(hashString.replace(/^step_/, ''));
        if (isNaN(requested))
            requested = 1;
        if (FormController.controller.totalSteps >= requested) {
            if (FormController.currentStep < requested) {
                while (FormController.currentStep < requested)
                    if (!FormController.controller.advanceNext())
                        break;
            }
            else
                while (FormController.currentStep > requested)
                    if (!FormController.controller.advancePrev())
                        break;
        }
        var check_requested = parseInt(window.location.hash.replace(/^#step_/, ''));
        if (check_requested != FormController.controller.getCurrentStep()) {
            FormController.controller.changeWindowHash();
        }
        updateStepHeaders();
    };

    //TODO очистить события старых контроллеров!
    //clearHandlers
    OPR.EventDispatcher.clearHandlers('History:onMove');
    OPR.EventDispatcher.addHandler('History:onMove', this.changeStep);


    FormController.id_func_changestep_from_hash = setTimeout(readyFn, 100);
    function readyFn( ) {
        function f() {
            FormController.controller.changeStep(document.location.hash.replace(/^#/, ''));
        }
        if (options.elkDataReady)
            options.elkDataReady(f);
        else
            f();
    }

    /**
     * Отправляет запрос в яндекс метрику о переходе на форму оплаты.
     * Должна вызываться до выполнения перенаправления на форму оплаты.
     * 
     * Пример использования:
     * 
     * controller.sendYandexMetricaPayment(); // Отправка запроса в яндекс метрику. 
     * document.location.href = result.data.url; // Перенаправление на форму оплаты.
     */
    this.sendYandexMetricaPayment = function() {
        return sendYandexMetrica('form_pay');
    }
    
    /**
     * Отправляет запрос в яндекс метрику.
     * 
     * @param  string action Тип выполняемого действия. Возможные значения:
     * 'start', 'send', 'next_step', 'step_backword', 'form_pay'
     */
    function sendYandexMetrica(action) {
        function getStepsString() {
            if (typeof FormController === 'undefined')
                return '';
            
            var currentStep;
            if (typeof FormController.currentStep !== 'undefined') {
                currentStep = FormController.currentStep
            } else {
                currentStep = '1';
            }
            
            var totalSteps = getTotalStepsFromFormElements();
            var stepsString = String(currentStep);
            if (totalSteps) {
                stepsString += '(' + totalSteps + ')';
            }
            
            return stepsString;
        }
        
        function getEventAction(action) {
            var eventAction1;
            switch (action) {
                case 'start':
                    eventAction = 'next_step';
                    break;
                case 'send':
                    eventAction = 'send';
                    break;
                case 'next_step':
                    eventAction = 'next_step';
                    break;
                case 'step_backword':
                    eventAction = 'step_backword';
                    break;
                case 'form_pay':
                    eventAction = 'form_pay';
                    break;
                default:
                    eventAction = '';
                    break;
            }
            
            return eventAction;
        }
        
        function prepareObjectToSend(orgId, serviceId, stepsString, eventAction) {
            var objectToSend = {
                'service': {}
            };
            objectToSend['service'][orgId] = {};
            objectToSend['service'][orgId][serviceId] = {};
            objectToSend['service'][orgId][serviceId][stepsString] = eventAction;
            
            return objectToSend;
        }
        
        if (typeof yaCounter32628510 === 'undefined')
            return;
        if (typeof yaCounter32628510.params === 'undefined')
            return;
        if (typeof options !== 'object')
            return;
        
        var orgId = options.org_id ? options.org_id : '';
        var serviceId = options.form_id ? options.form_id : '';
        var stepsString = getStepsString();
        var eventAction = getEventAction(action);
        
        var objectToSend = prepareObjectToSend(orgId, serviceId, stepsString, eventAction);
        try {
            yaCounter32628510.params(objectToSend);
        } catch (e) {
            console.log('Yandex Metrica error', e);
        }
    }
    
    /**
     * Изменяет адрес в адресной строке браузера в соответствии с текущим шагом.
     */
    this.changeWindowHash = function() {
        if (FormController.controller.getCurrentStep()) {
            window.location.hash = '#step_' + FormController.controller.getCurrentStep();
        }
    }
    
}

FormController.dynamicCounters = {};
FormController.controller = false;
FormController.stepSubmitting = false;
FormController.file_index = 0; //индексация для файлов мультиблока, когда 1 параметра не хватает
FormController.id_func_changestep_from_hash = false;//параметр нужен, чтобы не накапливать события при FormController.controller.changeStep(document.location.hash.replace(/^#/, ''));
//массивы для способа и согласия
FormController.checkbox_blocks = '.agree_agree, .agree_block';
FormController.sposob_blocks = '.final_sposob';
FormController.datepicker_option = {
    showOn: 'button',
    buttonImage: cfgMediaHost + '/common/img/calendar.png',
    buttonImageOnly: true,
    changeYear: true,
    changeMonth: true,
    defaultDate: 'с',
    buttonText: 'Выбрать дату с помощью интерактивного календаря'
};
//функция системная вызывается, после смены типа паспорта
FormController.doc_select_fill_callback = function($container){

};
FormController.findForms = function($container) {
    var forms = [];
    if (($container.length > 0) && ($container.get(0).tagName.toLowerCase() === 'form')) {
        forms.push($container);
    } else {
        var $forms = $container.find('form');
        if ($forms.length > 0)
            forms.concat($forms);
    }
    return forms;
};
FormController.initializeForms = function(forms) {
//	var $docTypeSel;

    $.each( forms, function ( idx, form ) {
        $( form ).validate();

//		$docTypeSel = $( form ).find( '.doc-type-select' );
//
//		if ( $docTypeSel.length > 0 )
//			$docTypeSel.trigger( 'change' );
    } );

};
//блокирует основную кнопку
FormController.SetStateBtn = function (state,text,id) {
    if (id===undefined)	var btn = $('#button_next');
    else btn = $('#'+id);
    var container = btn.closest('.form-controls');
    switch (state) {
        case 'disabled':
            container.find('span.error').hide();
            container.find('img.loader').hide();
            btn.attr('disabled','disabled');
            break;
        case 'wait':
        case 'waiting':
            container.show();
            container.find('span.error').hide();
            container.find('img.loader').show();
            btn.attr('disabled','disabled');
            break;
        case 'hidden':
            container.find('img.loader').hide();
            btn.attr('disabled','disabled');
            container.hide();
            break;
        case false:

            break;
        case 'enabled':
        default:
            container.show();
            container.find('span.error').hide();
            container.find('img.loader').hide();
            btn.removeAttr('disabled');
            break;
    }
    if (text!==undefined&&text!==false&&text!=='') {
        btn.text(text);
    }
};
//блокирует основную кнопку
FormController.print = function(block) {

    if (block !== undefined) {

        if (block.hasClass('print')) var temp = $('' + block.attr('print_block')).clone();
        else var temp = block.clone();
        var w = window.open();
        temp.find('.for_delete,.print,.btn-close-pop').hide();
        w.document.head.innerHTML = $(document).clone().find('head [rel="stylesheet"]').each(function() {
            if (/^http(s)?/.test($(this).attr('href'))) {
                $(this).attr('href', $(this).attr('href'));
            } else {
                $(this).attr('href', window.location.origin + $(this).attr('href'));
            }
        }).closest('head').html();
        w.document.body.innerHTML = (temp.css('width') && temp.css('width') > 0) ? '<div style="width:' + temp.css('width') + '">' + temp.html() + '</div>' : temp.html();
        setTimeout(function() {
            w.print();
            w.close();
        }, 500);
    }
    else {
        window.print();
    }
};

//блокирует основную кнопку
FormController.autorize = function($params_object) {
    if ($params_object==undefined) $params_object = {};
    //проверим авторизацию пользователя
    if (!MPGU.isAuthorized) {
        var org_id = $('#form_element [name="org_id"]').val()||document.location.pathname.match('/application\/([^\/]+)\/([^\/]+)/ig')[1]||'unknown';
        var form_id = $('#form_element [name="form_id"]').val()||document.location.pathname.match('/application\/([^\/]+)\/([^\/]+)/ig')[2]||'unknown';
        var $_get = Lib.getQueryParams(document.location.search);
        $.extend($_get,$params_object,{'force':1,'time':+ new Date()});
        document.location = cfgMainHost+'/ru/application/'+org_id+'/'+form_id+'/'+(!$.isEmptyObject($_get)?'?'+$.param($_get):'')+document.location.hash;
        return false;
    }

    return true;
};



//Вот так можно снять все ошибки в 2 строчки, мб есть смысл снимать в районе блока?
FormController.clearErrors= function ($block)  {
    if ($block===undefined) $block = $('#form_element');
    $block.find('label.'+$.validator.defaults.errorClass).remove();
    $block.find('.'+$.validator.defaults.errorClass).removeClass($.validator.defaults.errorClass);
    if ($block.hasClass($.validator.defaults.errorClass)) $block.removeClass($.validator.defaults.errorClass);
};
//обновить капчу по запросу
FormController.ChangeCaptcha = function ($block)  {
    var captcha = $block.closest('.captcha');
    captcha.find('.captcha_img').animate({opacity: 0.25}, 300);
    $.ajax( {
        url : cfgMainHost+'/common/ajax/index.php',
        type : 'POST',
        dataType : 'json',
        data : {ajaxModule : 'CaptchaBase',	ajaxAction : 'refresh', 'uniqueFormHash':$('[name="uniqueFormHash"]').val()},
        success : function ( data ) {
            if ( data && data.result ) {
                FormController.ReplaceCaptcha(captcha,data.result);
            }
        }
    });
};
//обновить картинку капчи
FormController.ReplaceCaptcha = function (captcha, src)  {
    captcha.find('.captcha_img').attr('src','data:image/png;base64,'+src);
    captcha.find('.captcha_text').val('').removeAttr('readonly');
    FormController.clearErrors(captcha);
    captcha.removeClass('checked');
    captcha.find('.captcha_img').animate({opacity: 1}, 300);
};
FormController.initializePinnedInfo = function($container) {



    $('.form-info-show-detail').off('mousedown.controller').on('mousedown.controller', function(e) {
        if (e.type == 'mousedown' && (e.which != 1 && e.which != 2)) { // Если клик мышкой, нужны только левая и колесико
            return;
        }
        
        var windowWidth = 710;
        if($(window).width()<690) windowWidth = $(window).width() - 20;
        $.fn.messagebox({width: windowWidth, inline: true, href: '#form-detail-info'});
        $('.form-manual-container .manual-step').first().addClass('active');

        $('.form-manual-container .manual-step').off('click.controller').on('click.controller', function(e) {
            if (e.target.nodeName == "A") return;
            
            $(this).toggleClass('active');
            return false;
        });
        return false;
    });
   
};

FormController.initializeSlider = function($container) {

    $container.find('.slider').each(function(idx, item) {
        var $slider = $(item);

        $slider.find('.img').off('click.controller').on('click.controller', function() {

            if (!$slider.hasClass('disabled')) {

                if($slider.find('a:first').hasClass('selected')){
                    $slider.find('a:last').click();
                } else {
                    $slider.find('a:first').click();
                }
            }
        });


        var v = $slider.find('input[type="radio"]:checked');

        $slider.find('a').removeClass('selected');
        $slider.find('a:first').off('click.controller').on('click.controller', function() {
            if (!$slider.hasClass('disabled')) {
                $slider.find('input[type="radio"]:first').prop('checked', true);
                $slider.find('input[type="radio"]:first').change();
                i = cfgMediaHost + '/common/img/elem/slider-left.png';
                $slider.find('img').attr('src', i);
                $slider.find('a:first').addClass('selected');
                $slider.find('a:last').removeClass('selected');
            }
        });
        $slider.find('a:last').off('click.controller').on('click.controller', function() {
            if (!$slider.hasClass('disabled')) {
                $slider.find('input[type="radio"]:last').prop('checked', true);
                $slider.find('input[type="radio"]:last').change();
                i = cfgMediaHost + '/common/img/elem/slider-right.png';
                $slider.find('img').attr('src', i);
                $slider.find('a:last').addClass('selected');
                $slider.find('a:first').removeClass('selected');
            }
        });
        if ($slider.find('input:radio:checked').length==0) {
            var i = cfgMediaHost + '/common/img/elem/slider-left.png';
            $slider.find('a[name="' + v.val() + '"]').addClass('selected');
            $slider.find('img').attr('src', i);
        }
    });

    $container.find('.toggle-on-off input:checkbox').off('change.controller').on('change.controller', function() {
        if ($(this).is(':disabled')) return false;
        var $box = $(this).closest('.toggle-on-off');
        if ($(this).is(':checked')) {
            $box.addClass('checked').find('img').attr('src', cfgMediaHost + '/common/img/elem/on-off-right.png');
            $box.find('.on').show();
            $box.find('.off').hide();
        } else {
            $box.removeClass('checked').find('img').attr('src', cfgMediaHost + '/common/img/elem/on-off-left.png');;
            $box.find('.on').hide();
            $box.find('.off').show();
        }
    });
    $container.find('.toggle-on-off .off').off('click.controller').on('click.controller', function() {
        var $checkbox = $(this).closest('.toggle-on-off').find('input:checkbox');
        if ($checkbox.is(':disabled')) return false;
        if (!$checkbox.is(':checked')) {
            $checkbox.prop('checked', true).trigger('change');
        }
    });
    $container.find('.toggle-on-off .on').off('click.controller').on('click.controller', function() {
        var $checkbox = $(this).closest('.toggle-on-off').find('input:checkbox');
        if ($checkbox.is(':disabled')) return false;
        if ($checkbox.is(':checked')) {
            $checkbox.prop('checked', false).trigger('change');
        }
    });
    $container.find('.toggle-on-off img').off('click.controller').on('click.controller', function() {
        var $checkbox = $(this).closest('.toggle-on-off').find('input:checkbox');
        if ($checkbox.is(':disabled')) return false;
        if ($checkbox.is(':checked')) {
            $checkbox.prop('checked', false).trigger('change');
        } else {
            $checkbox.prop('checked', true).trigger('change');
        }
    });
};

FormController.initializeHints = function($container) {


    $(document).mouseup(function (e)
    {
        var container = $(".hint-button");
        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            container.find('.hint').hide();
        }
    });


    $container.find('.floatingHint').each(function(idx, item) {
        var $element = $(item);
        if ($element.next('.hint').length>0)
            var $hint = $element.next('.hint');
        else
            var $hint = $element.closest('.wrap').find('.hint');
        $(this).append('<div class="floatingHint-container"><div class="arrow"></div>'+$hint.html()+'</div>');
        $(this).closest('.wrap').find('.floatingHint-container').off('click.contoller').on('click.controller',function() {$(this).hide();});
        $(this).off('mouseover.contoller').on('mouseover.controller',function() {
            $(this).closest('.wrap').find('.floatingHint-container').show();
        });
        $(this).off('mouseout.contoller').on('mouseout.controller',function(e) {
            $(this).closest('.wrap').find('.floatingHint-container').hide();
        });
        $(this).find('.hint-button, .hint').remove();
    });



    $container.find('.hint-button').each(function(idx, item) {
        var $element = $(item);
        if ($element.next('.hint').length>0)
            var $hint = $element.next('.hint');
        else
            var $hint = $element.closest('.wrap').find('.hint');
        $element.off('click.controller').on('click.controller', function(event) {
            if (!$element.hasClass('disabled')) {
                $container.find('fieldset').trigger('click.closehint');
                if ($hint.css('display') =='none'){
                    $('.hint-button .hint').hide();
                    $hint.show();
                }
                else {

                    $hint.hide();
                }
            }
        });
//		$hint.find('.close').off('click.closehint').on('click.closehint', function() {
//			$hint.hide();
//		});
    });


//	$container.find('fieldset').off('click.closehint').on('click.closehint', function() {
//		$('.hint').hide();
//	});


};
FormController.initializeMasks = function($container) {
    $container.find('input[data-mask]').each(function(idx, item) {
        if($(this).attr('data-mask').toString().indexOf('|') > 0) {
            var maskString = $(this).attr('data-mask').toString().split('|');
            $(item).setMask({mask: maskString[0], type:maskString[1]});
        } else {
            var ruleAttr = {
                pattern: '.{' + $(this).attr('data-mask').length + '}'
            };

            $(item).rules('add', ruleAttr);
            $(item).setMask({mask: $(this).attr('data-mask')});
        }

    });
};
FormController.initializeValidators = function($container) {
    if ($container.closest('form').length==1) {
        $container.find('input[data-pattern]').each(function(idx, item) {
            //$(item).rules('remove');
            $(item).rules('add', {'pattern': $(this).attr('data-pattern')});
        });
        $container.find('[data-validatefunction]').each(function(idx, item) {
            var validator_data = $(item).data('validatefunction')
            var validatorOptions = {};
            var brain_validators = validator_data.match(/[a-z\_]+\|{[^}]+}(?:\|{[^}]+})?/ig);
            if (brain_validators) {
                for (var i in brain_validators) {
                    if (brain_validators[i]=='') continue;
                    var validatorParams = brain_validators[i].split('|');
                    var validatorName = validatorParams.shift();
                    if ($.validator.methods.hasOwnProperty(validatorName)) {
                        //обработает валидаторспарам {1$2$3}
                        for (var j in validatorParams) {
                            validatorParams[j] = validatorParams[j].replace(/\&nbsp\;/gi, ' ').replace(/\{\s*([^\}]+)\s*\}/,'$1').trim().split('$');
                        }
                        var params = 1 === validatorParams.length ? validatorParams[0] : validatorParams;
                        validatorOptions[validatorName] = validatorParams.length > 0 ? params : true;
                        //console.log('add validator:', validatorName, ', params: ', validatorOptions[validatorName]);
                    } else {
                        console.log('no validator:', validatorName);
                    }
                }
                validator_data = validator_data.replace(/[a-z\_]+\|{[^}]+}(\|{[^}]+})?/,'');
            }

            var validators = validator_data.split(' ');

            $.each(validators, function (idx, validator) {
                if (validator=='') return true;
                var validatorParams = validator.split('|');
                var validatorName = validatorParams.shift();
                for (var j in validatorParams) {
                    validatorParams[j] = validatorParams[j].replace(/\s+/g,' ').replace(/\&nbsp\;/gi, ' ').trim();
                }
                if ($.validator.methods.hasOwnProperty(validatorName)) {
                    var params = 1 === validatorParams.length ? validatorParams[0] : validatorParams;
                    validatorOptions[validatorName] = validatorParams.length > 0 ? params : true;
                    //console.log('add validator:', validatorName, ', params: ', validatorOptions[validatorName]);
                } else {
                    console.log('no validator:', validatorName);
                }
            });
            $(item).rules('add', validatorOptions);
        });
        $container.find('input[required], select[required], textarea[required]').each(function() {
            $(this).rules('add', {required: true});
        });
        if (typeof rules !== 'undefined') {
            $.each(rules, function(formId, rules) {
                var $form = $('#' + formId);
                if ($form.length > 0) {
                    $.each(rules, function(field, rules) {
                        var $field = $form.find('[name="' + field + '"]');
                        if ($field.length > 0) {
                            $field.rules('add', rules);
                        }
                    });
                }
            });
        }
    }
};
FormController.initializeSelect = function($container, options) {

    if (options==undefined) {
        options = {
            'placeholder_text':'Выберите',
            'placeholder_text_multiple':'Начните вводить...',
            'no_results_text':'Нет данных',
            'max_selected_options':0
        };
    }


    $container.find('.chosen').each(function(idx, item) {

        
        var chosenOptions = {
            disable_search: false,
            search_contains:true,
            case_sensitive_search:false,
            placeholder_text: $(item).data('chosen-select-text') || options.placeholder_text,
            placeholder_text_single: $(item).data('chosen-select-text') || options.placeholder_text,
            placeholder_text_multiple: $(item).data('chosen-select-text-multiple') || options.placeholder_text_multiple,
            no_results_text: $(item).data('chosen-no-results-text') || options.no_results_text,
            max_selected_options: $(item).data('chosen-max_selected_options') || options.max_selected_options,
        };

        $(item).on('chosen:showing_dropdown', function(e, chosen) {
                var chosen_container  = chosen.chosen.container;
                if (!chosen_container.hasClass('loaded')) {
                    chosen_container.addClass('loaded').find('> .chosen-single > span').css('max-width',chosen_container.width()-90);
                }
        }).on('chosen:hiding_dropdown', function(e, chosen) {
            // На iPhone после выбора элемента из списка, поле для воода (input) скрывается,
            // но курсор ввода остаётся на прежнем месте. Следующий код призван скрыть этот курсор.
            var chosenContainer = chosen.chosen.container;
            var chosenSearchInput = chosenContainer.find('.chosen-search-input');
            setTimeout(
                function() {
                    chosenSearchInput.blur();
                },
                0
            );
        }).chosen(chosenOptions).data('chosen-options', chosenOptions);

//        $(item).off('chosen:hiding_dropdown').on('chosen:hiding_dropdown chosen:updated', function() {
//            if (!!$(this).val()&&$(this).val().length!=0)
//                $(this).valid();
//        });

//        $(item).off('keyup.chosenbacklink change.chosenbacklink').on('keyup.chosenbacklink change.chosenbacklink', function() {
//            $(this).trigger('chosen:updated');
//        });
    });

    $(document).off('chosen:showing_dropdown').on('chosen:showing_dropdown', function(evt, params) {
        scrollDecorator.show(params.chosen.search_results);

    });
    $(document).off('chosen:hiding_dropdown').on('chosen:hiding_dropdown', function(evt, params) {
        scrollDecorator.hide(params.chosen.search_results);
    });
};
FormController.initializeVisual = function($container, options) {

    //TODO: перенести инициализацию autoSuggest сюда
    $container.find('.multi-input').each(function(idx, item) {
        var $element = $(item);
        $element.autoSuggest([], {
            startText: "Начните вводить...",
            emptyText: 'Продолжайте ввод, чтобы добавить новое значение',
            minChars: 0,
            useOriginalInputName: true,
            usePlaceholder: true,
            classes: {
                containerClass: 'chosen-container chosen-container-multi',
                controlClass: 'chosen-choices',
                elementClass: 'search-choice',
                inputClass: 'search-field',
                resultContainerClass: 'chosen-drop',
                resultClass: 'chosen-results',
                resultItemClass: 'active-result'
            }
        });
    });
    $container.find('.button[data-buttongroup]').each(function(idx, item) {
        var $btn = $(item);
        if ($btn.data('buttonfor')) {
            $($btn.data('buttonfor')).off('change.controller').on('change.controller', function() {
                if ($(this).is(':checked'))
                    $btn.addClass('checked');
                else
                    $btn.removeClass('checked');
            });
            $btn.off('click.controller').on('click.controller', function() {
                $('[data-buttongroup="' + $(this).data('buttongroup') + '"]').removeClass('checked');
                $($(this).data('buttonfor')).prop('checked', true).change();
                return false;
            });
        }
    });




    //Вынес мультиблоки отдельно
    init_pmulti($container);

    var $seriesNumberAutocomplete = $container.find('.series_number_autocomplete');
    if ($seriesNumberAutocomplete.length > 0) {
        $seriesNumberAutocomplete.each(function(){
            var obj = $(this);
            var $seriesFieldSel = $(this).closest('.wrap').find('[name="' + $(this).data('series-name') + '"]');
            var $numberFieldSel = $(this).closest('.wrap').find('[name="' + $(this).data('number-name') + '"]');
            var seriesVal,numberVal;
            seriesVal=numberVal='';
            $seriesFieldSel.off('change.series_number_autocomplete').on('change.series_number_autocomplete', function () {
                seriesVal = $(this).val();
                obj.val(seriesVal + ' ' + numberVal);
                obj.trigger('change.mpgu-fill-monitor');
            });

            $numberFieldSel.off('change.series_number_autocomplete').on('change.series_number_autocomplete', function () {
                numberVal = $(this).val();
                obj.val(seriesVal + ' ' + numberVal);
                obj.trigger('change.mpgu-fill-monitor');
            });
        });

    }

    /* Для блока серия-номер. Переносим данные из скрытого поля в раздельные серию-номер */
    $container.off('change.series').on('change.series', '.series_number_autocomplete', function () {
        var $field = $(this);
        var $wrapper = $field.closest('.wrap');
        var value = $field.val();
        var $seriesField = $wrapper.find('[name="' + $field.data('series-name') + '"]');
        var $numberField = $wrapper.find('[name="' + $field.data('number-name') + '"]');
        var res = {};
        var lens = {
            series : {
                min: $field.data('series-min-len'),
                max: $field.data('series-max-len')
            },
            number : {
                min: $field.data('number-min-len'),
                max: $field.data('number-max-len')
            }
        };
        var regEx;
        if (lens.series.max == 0) {
            res[0]='';
            res[1]='';
            res[2] = value;
            res.length = 3;
        }
        else {
            if (value.split(' ').length!==2) {
                var cutByNumber = true;
                var cutLen = 0;
                if (lens.number.min == 0 && lens.number.max == 0) { // не указаны длины номера, режим по серии
                    cutByNumber = false;
                    cutLen = lens.series.max;
                } else {
                    cutLen = Math.max(lens.number.min, lens.number.max);
                }

                if (cutByNumber) {
                    regEx = new RegExp("^([а-яё\\w\\s-]+)\\s*([а-яё\\w\\s]{6})$", "i");
                } else {
                    regEx = new RegExp('([а-яё\\w\\s]{' + cutLen + '})\\s*([а-яё\\w\\s]*)', 'i');
                }
            }
            else regEx = new RegExp('([^ ]*) ([^ ]*)', 'i');
            res = value.match(regEx);
        }
        if (res && typeof res === 'object' && res.length === 3) {
            res[1] = res[1].replace(/\s/g, '');
            res[2] = res[2].replace(/\s/g, '');
            $seriesField.val(res[1]);
            $numberField.val(res[2]);
            if (res[1].length>0) {
                $seriesField.valid();
                if (!draft_loading) $seriesField.prop('readonly', true);
            }
            if (res[2].length>0) {
                $numberField.valid();
                if (!draft_loading) $numberField.prop('readonly', true);
            }

        } else {
            $field.val('');
            $seriesField.val('').prop('readonly', false);
            $numberField.val('').prop('readonly', false);
        }
    });

    //основной вызов смены типа документа личности
    $container.find('input.doc-type-select, select.doc-type-select').off('change.doc-type-select keyup.doc-type-select').on('change.doc-type-select keyup.doc-type-select', function () {
        var $wrapper = $(this).closest('.person-document');
        setDocType( $wrapper.find( '.document-type-container.document-type-other' ) );
        //теперь смена типа сама автоподстановку делает умную
//		if ( value === "1" && $wrapper.find( '*[data-elk-field*=""]' ) ) {
//			ELK.fill( $wrapper, function () {} );
//			$('#elk-change-data').show();
//		} else {
//			if (!draft_in_process) {
//				$wrapper.find( 'input:not(:hidden,:radio), select, textarea' ).filter(function(){return $(this).attr('name')!=undefined&&$(this).attr('name')!=$field.attr('name')}).prop( 'readonly', false ).val( '' ).removeClass( 'error' );
//				$wrapper.find( 'input:radio:checked').filter(function(){return $(this).attr('name')!=undefined&&$(this).attr('name')!=$field.attr('name')}).removeAttr('checked');
//		}
//		}
//

        FormController.initializeHints( $wrapper );
        FormController.clearErrors( $wrapper );
          return false;
    }).filter(':checked').trigger('change.doc-type-select');

    /**
     * Установка типа документа для случая, когда для блока Документ, 
     * удостоверяющий личность, предусмотрен только один тип документа.
     */
    (function() {
        var onePassportTypeInputs = $container.find('.doc-type-select-label input[type="hidden"]');
        onePassportTypeInputs.each(function(index, value) { 
            var wrapper = $(this).closest('.person-document');
            if (wrapper.find('.document-type-container.document-type-other').length) {
                setDocType(wrapper.find('.document-type-container.document-type-other'));
            }
        });
    })();

    FormController.initializeSelect($container, options);

    //Патч для валидации полей
    $container.find('input:radio, input:checkbox, input:text, select, textarea, input:file').off('change.valid').on('change.valid',function(){
        $(this).valid();
    });


    //обработка float полей
    $container.find('.float input, input.float').off('change.float paste.float').onFirst('change.float paste.float',function(){
        if ($(this).val().length>0) {
            var temp = $(this).val().replace(',', '.');
            var data = temp.match(/\.(.*)/);
            if (data!==null) {
                var temp = Math.abs(parseFloat(temp));
                var data_new =(temp+'').match(/(.*)\.(.*)/);
                if (data_new!==null)
                    temp = data_new['1']+'.'+data['1'];
            }
            else temp = Math.abs(parseInt(temp));
            if (isNaN(temp)) $(this).val(0);
            else $(this).val(temp);

        }
        return $(this).valid();
    });


    //Сделать первую букву большой
    $container.find('input:text[data-validatefunction*="fio"], .up input:text').off('change.up keyup.up paste.up').on('change.up keyup.up paste.up', function(event) {
        if (event.type === 'keyup') {
            var caret = $(this).getCursorPosition();
        }

        var origin = $(this).val();
        var changed;
        if (event.type === 'change') {
            changed = origin.substr(0, 1).toUpperCase() + origin.substr(1).trim();
        } else {
            changed = origin.substr(0, 1).toUpperCase() + origin.substr(1);
        }

        if (changed !== origin) {
            $(this).val(changed);
            if (event.type === 'keyup') {
                $(this).setCursorPosition(caret);
            }
        }
    });

    //15271 добавил обработку кареток
    $.fn.setSelection = function(selectionStart, selectionEnd) {
        if(this.lengh == 0) return this;
        var input = this[0];

        if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        } else if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }

        return this;
    }
    $.fn.getSelectionStart = function(){
        if(this.lengh == 0) return -1;
        var input = this[0];
        var pos = input.value.length;
        if (input.createTextRange&&document.selection) {
            var r = document.selection.createRange().duplicate();
            r.moveEnd('character', input.value.length);
            if (r.text == '')
            pos = input.value.length;
            pos = input.value.lastIndexOf(r.text);
        } else if(typeof(input.selectionStart)!="undefined")
        pos = input.selectionStart;

        return pos;
    }
    $.fn.getCursorPosition = function(){
        if(this.lengh == 0) return -1;
        return $(this).getSelectionStart();
    }
    $.fn.setCursorPosition = function(position){
        if(this.lengh == 0) return this;
        return $(this).setSelection(position, position);
    }

    //Обработка чекбоксов ручного ввода кладра
    $container.find('.copy_kladr_manual input:checkbox').off('change.copy_kladr_manual').on('change.copy_kladr_manual',function(){
        var fields = ['Federal','Raion','City','Place','Street','Building','VladenieNo','CorpusNo','StroenieNo','Flat','PostalIndex'];
        var kladr = $(this).closest('.kladr');
        var kladr_manual = $(this).closest('.wrap').nextAll('.kladr_manual:first');

        if ($(this).is(':checked')) {
            //переносим
            for (var i in fields) {
                var obj = kladr.find('.'+fields[i]);
                var value = '';
                if (obj.prop('tagName')=='SELECT') {
                    value = obj.find('option:selected').text();
                }
                else {
                    value = obj.val();
                }
                kladr_manual.find('.'+fields[i]+'_manual').val(value);
                if (value!=''||(obj.attr('readonly')=='readonly')) kladr_manual.find('.'+fields[i]+'_manual').attr('readonly','readonly');
            }
        }
        else {
            for (var i in fields)
                kladr_manual.find('.'+fields[i]+'_manual').val('').removeAttr('readonly');
        }

    });


    //системный обработчик простых событий
    $container.find('.visual_controller input, .visual_controller select, .visual_controller textarea').off('change.visual').onFirst('change.visual', function(){
        var val = $(this).val();
        //проверим значение, мб это не пользователь, а просто триггер, тогда нужно скинуть в 0 значение
        switch ($(this).prop('tagName')){
            case 'INPUT':
                switch ($(this).attr('type')){
                    case 'radio':
                        val = $(this).is(':checked')?val:0;
                        break;
                    case 'checkbox':
                        val = $(this).is(':checked')?1:0;
                        break;
                }
                break;
        }
        var obj = $(this).closest('.wrap');
        if (obj.nextAll('.visual').length==0) var obj = $(this).closest('.form-block');
        obj.nextAll('.visual').hide();
        if($.isArray(val) && val.length > 1) {
            val.forEach(function (value) {
                obj.nextAll('.visual_'+value).show();
            });
        } else obj.nextAll('.visual_'+val).show();
    });

    //Визуальный хак для поля отчества, при подстановке из елк
    $container.find('.middlename.visual input').off('change.elk_middlename').on('change.elk_middlename',function(){
        var wrap = $(this).closest('.wrap');
        if (wrap.prev('.middlename_checkbox').length>0) {
            var checkbox = wrap.prev('.middlename_checkbox').find('input:checkbox');
            checkbox.removeAttr('disabled');
            if (wrap.data('elk-filled')) {
                if ($(this).val().length>0){
                    if (checkbox.is(':checked')) checkbox.click().trigger('change.visual');
                }
                else {
                    if (!checkbox.is(':checked'))checkbox.click().trigger('change.visual');
                    $(this).prev('label.error').remove();
                }
                checkbox.attr('disabled','disabled');
            }
        }
    });


    //	$('.gray_table.scroll:not(.loaded)').each(function(){
//		$(this).addClass('loaded');
//		$(this).createScrollableTable();
//	});
    //Скрытие инфоблока
    $('.form-infobox button.close').off('click.close').on('click.close', function() {
        $(this).closest('.form-infobox').hide();
        return true;
    });

    //добавим сворачивание инфоблоку, который не закрывается
    $('.form-infobox').filter(function () {return $(this).find('button.close').length===0;}).off('click.slide').on('click.slide', function() {
        if ($(this).hasClass('slided')) {
            $(this).switchClass("slided", "", 300, "easeInOutQuad");
        }
        else {
            $(this).switchClass("", "slided", 300, "easeInOutQuad");
        }
        return true;
    });

    //хак на замену старых легенд на новые
//	$('legend').filter(function(){return $(this).css('display')!=='none';}).each(function(){
//		console.log('удалили legend');
//		$(this).css('display','none');
//		$(this).before('<>');
//	});



};

FormController.initializeUpload = function($container) {
    $container.find('.upload-area a').each(function(idx, item) {
        var $link = $(item);
        var $cont = $link.closest('.wrap');
        var $file = $cont.find('input[type="file"]');
        $cont.data('state','empty');
        $cont.data('uploadSetState', function(state) {
            $cont.data('state',state);
            $cont.removeClass('upload-state-empty upload-state-process upload-state-done').addClass('upload-state-' + state).trigger('change');
            return $cont;
        });
        $cont.data('uploadSetState')('empty');
        $link.off('click.controller').on('click.controller', function(event) {
            var uploadMethod = $file.attr('upload_method');
            if (uploadMethod === 'external_storage') {
                onUploadEventHandler.call($file.get(0), null, true);

                $cont.find('.file-remove').off('click.controller').on('click.controller', function() {
//					$cont.find('.file-process.loading').hide();
                    $file = $(this).closest('.holder').find('input:file');
                    $file.closest('.wrap').find('.file-process.done .file-name').attr('title', '').text('');
                    UploadController.cancel($file.get(0));
                    resetFileInput($file);
                    $file.trigger('change');
                    $('#'+$file.attr('id')+'_iframe_wrapper').hide();
                    return false;
                });


            } else {
                $file.trigger('click.controller');
            }
            return false;
        });
        // подключаем контроллер валидации и динамической загрузки файлов на сервер
        UploadController.bind($file);
        $container.on('mpgu.clearblock', function() {
            $file.rules('remove', 'file_not_in_progress');
            UploadController.unbind($file);
        });

        var onUploadEventHandler = function(event, useExternalStorage) {
            if (typeof useExternalStorage === 'undefined')
                useExternalStorage = false;

            var self = this;
            var $file = $(this);
            var $cont = $file.closest('.wrap');
            if (window.File && window.FileList) {
                if (UploadController.validate(this)) {
                    var fileData = this.files;
                    if ($file.val() === '')
                        fileData = [];
                    if (fileData.length === 0 && !useExternalStorage) {
                        if ($file.attr('required-draft') === 'true')
                            $file.prop('required', true);
                        if ($file.prop('required'))
                            $file.rules('add', {required: true});
                        $file.valid();
                        $cont.data('uploadSetState')('empty');
                    } else {
                        // подключаем валидацию для недоотправленных полей
                        if ($file.prop('required')) {
                            $file.rules('add', {file_not_in_progress: true});
                        }
                        $inner = $cont.data('uploadSetState')('process').find('.file-process.loading');
                        $inner.find('.file-remove').addClass('no_bg').off('click.controller').on('click.controller', function() {
                            $file.closest('.wrap').find('.file-process.done .file-name').attr('title', '').text('');
                            UploadController.cancel(self);
                            resetFileInput($file);
                            $file.trigger('change');
                            return false;
                        });
                        UploadController.upload(this, fileData[0])
                            .progress(function(status) {
                                var progress = $cont.find('.file-process.loading');
                                progress.attr('title', 'Загружено ' + status.progress + '%');
                            })
                            .done(function(file) {
                                var file = file || fileData[0];
                                var fileName = (file.name || $file.val());
                                var name = fileName.substr(0, (Math.max(0, fileName.lastIndexOf('.')) || Infinity));
                                var ext = fileName.substr((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
                                var $inner = $cont.data('uploadSetState')('done').find('.file-process.done');
                                $inner.find('.file-name').text(name);
                                $inner.find('.file-name').attr('title', $file.val());
                                $inner.find('.file-size').text(bytesToSize(file.size, 0));
                                $cont.find('input[type=hidden].file-size').val(file.size);
                                $inner.find('.file-ext').text(ext);
                                $inner.find('.file-remove').addClass('no_bg').off('click.controller').on('click.controller', function() {
                                    $file.closest('.wrap').find('.file-process.done .file-name').attr('title', '').text('');
                                    UploadController.cancel(self);
                                    resetFileInput($file);
                                    $file.trigger('change');
                                    return false;
                                });
                                $file.valid();
                            })
                            .fail(function(error) {
                                if (error)
                                    messagebox('Ошибка при загрузке файла', error);
                                UploadController.cancel(self);
                                resetFileInput($file);
                            });
                    }
                } else {
                    // не пройдены условия - очищаем поле файла
                    UploadController.cancel(self);
                    resetFileInput($file);
                }
            } else {
                if ($file.val() === '') {
                    $cont.data('uploadSetState')('empty');
                    if ($file.attr('required-draft') === 'true')
                        $file.prop('required', true);
                    if ($file.prop('required'))
                        $file.rules('add', {required: true});
                    $file.valid();
                } else {
                    var $inner = $cont.data('uploadSetState')('done').find('.file-process.done');
                    $inner.find('.file-name').text($file.val());
                    $inner.find('.file-name').attr('title', $file.val());
                    $inner.find('.file-info').text('');
                    $inner.find('.file-remove').addClass('no_bg').off('click.controller').on('click.controller', function() {
                        resetFileInput($file);
                    });
                }
            }
        };
        $file.off('change.controller').on('change.controller', onUploadEventHandler);

    });
};

FormController.attachDraftUpload = function($file, draftData) {
    if ($file.length==0 ) return false;
    var $cont = $file.closest('.wrap');
    var fileName = draftData.NAME;
    var name = fileName.substr(0, (Math.max(0, fileName.lastIndexOf('.')) || Infinity));
    var ext = fileName.substr((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
    var $inner = $cont.data('uploadSetState')('done').find('.file-process.done');
    $inner.find('.file-name').text(name);
    $inner.find('.file-name').attr('title', draftData.NAME);
    $inner.find('.file-size').text(bytesToSize(draftData.SIZE, 0));
    $cont.find('input[type=hidden].file-size').val(draftData.SIZE);
    $inner.find('.file-ext').text(ext);
    $inner.find('.file-remove').addClass('no_bg').off('click.controller').on('click.controller', function() {
        UploadController.cancel($file.get(0));
        resetFileInput($file);
        $file.trigger('change');
    });
//	$file.attr('required-draft', $file.prop('required'));
//	$file.prop('required', false);
//	$file.rules('add', {required: false});
//	$file.valid();
    return UploadController.attachDraft($file[0], draftData);
};

FormController.initialize = function($container, options) {
    var initOptions = {
        placeholder_text: 'Выберите...',
        no_results_text: 'Ничего не найдено'
    };
    if (options !== undefined)
        $.extend(initOptions, options);



    var forms = FormController.findForms($container);
    FormController.initializeForms(forms);
    FormController.initializeVisual($container, initOptions);

    FormController.initializePinnedInfo($container);
    FormController.initializeSlider($container);

    FormController.initializeHints($container);
    FormController.initializeMasks($container);
    FormController.initializeValidators($container);

    // сравнение дат
    var ds = ($container.hasClass('.dateselect')?$container.find('input:text'):$container.find('.dateselect input:text'));
    if (ds.length) {
        $.validator.addMethod('datecompare', function(value, element) {
            var $fields = $(element).closest('.wrap').find('input');
            if ($fields.length != 2) {
                return true; // должно быть 2 поля в одном блоке, иначе сравнивать не с чем
            }
            // Дальнейший код решает следующую проблему. При вызове valid для формы,
            // вначале вызывается valid для первого поля даты, затем для второго.
            // При этом если скрывать уведомления для обоих полей даны перед проверкой,
            // то при проверке второго элемента паары, он скроет уведомление для первого
            // элемента.
            //
            // Отображение уведомлений об ошибках важно, т к это
            // используется при определении корректнсти заполнения формы,
            // например в check_validation_block_for_multiblock
            //
            // При этом возможна ситуаия, когда изменение одного поля будет влиять
            // на корректность значения второго поля. Поэтому лишние уведомления
            // скрываются для поля-соседа.
            if ($fields[0] != $(element).get(0) && $fields[1] == $(element).get(0)) {
                // Это второй элемент из пары полей для даты.
                // Проверка на то что это не первый элемент из пары избыточна,
                // до добавлена для подстраховки зацикливания,
                // таким образом этот код будет вызван для второго поля,
                // но не для первого.

                // Перепроверим первый элемент, чтобы скрыть/отобразить
                // уведомления об ошибках.
                if ($($fields[0]).valid) {
                    // Просто скрыть уведомление об ошибке для первого элемента
                    // нельзя из-за того, что в этом случае при вызове valid()
                    // для всей формы во время проверки второго элемента, может
                    // быть скрыто сообщение об ошибке возле первого элемента.
                    $($fields[0]).valid();
                }
                // Скрываем уведомление об ошибках для второго элемента.
                $($fields[1]).removeClass($.validator.defaults.errorClass).prev('.'+$.validator.defaults.errorClass).remove();
            } else {
                // Скрываем сообщения об ошибках для обоих элементов.
                // Мы можем это сделать, т к в данный момент проверяется первое поле
                // из пары полей для даты. Если вызвать valid для формы, то проверка
                // второго поля будет производиться позже и актуальное сообщение для
                // сторого поля будет отображено.

                // Этот код был написан до 25.09.2017 и вызывался для
                // обоих элементов из пары полей для даты.
                $fields.each(function(){$(this).removeClass($.validator.defaults.errorClass).prev('.'+$.validator.defaults.errorClass).remove();});
            }
            var datefrom = $fields.eq(0).datepicker('getDate');
            var dateto = $fields.eq(1).datepicker('getDate');
            if ((datefrom <= dateto) || (datefrom === null) || (dateto === null)) {
                return true;
            } else {
                return false;
            }
        });
        ds.each(function(idx, element) {
            $(element).rules('add', {datecompare: true});
        });
    }

    $container.find('.doc-type-select option:selected').trigger('change.doc-type-select');

    FormController.initializeUpload($container);
    initValidatorMonthYearInterval($container);

    bindCalendar();

};

FormController.generateLastStepCallback = function(container) {

};

/**
 * Превью всех введенных данных
 * @param container
 * @param totalSteps
 * @param removeSelectors Селекторы, которые не должны войти в превью. Разделены пробелами
 * @param saveClasses Классы, которые должны войти в превью. Разделены пробелами
 * @returns {boolean}
 */
FormController.generateLastStep = function(container, totalSteps, removeSelectors, saveClasses) {
    container.empty();
    for (var i = 1; i < totalSteps; i++) {
        var currentStep2 = $('#form_element fieldset.form-step:not(.disabled)').eq(i - 1);
        if (!currentStep2 || currentStep2.length === 0)
            continue;

        currentStep2.find('fieldset:not(.form-step),.form-step.disabled,div,.wrap').filter(function(){return ($(this).css('display')=='none')}).addClass('nonvalidation');



        var clonedStep = $("<fieldset class='form-step-generate'>").append($($(currentStep2.html())).not('script'));
        clonedStep.removeAttr("id");
        clonedStep.find('.nonvalidation').remove();

        //Удаление номеров шагов
        clonedStep.find('legend:first').remove();
        //Удаление всех блоков в которых нет элементов для отображения
        clonedStep.find(".form-block:not(:has(.wrap))").remove();
        //удаление блоков, что нужно
        clonedStep.find(".remove").remove();

        //удаление ссылок
        clonedStep.find("a").removeAttr('href');

        if (typeof(removeSelectors) == 'string') removeSelectors.split(' ').forEach(function(selector) {
            clonedStep.find(selector).remove();
        });




//		//Удаление незаполненных checkbox
//		clonedStep.find('input[type=checkbox]:not(:checked)').closest('.wrap').remove();
//


        //обработка группы кнопок
        clonedStep.find(".button_group .button").click(function(){return false;});
        clonedStep.find(".button_group input[type=radio]").remove();

        //обработка Чекбоксов
        clonedStep.find("input[type=checkbox]").each(function() {
            var checkboxResultText = '';
            var wrap = $(this).closest('.wrap');
            if (currentStep2.find('[name="' + $(this).attr("name") + '"]').is(":checked")) {
                $("<span>").html("<input type='checkbox' class='filtered-saved' disabled checked>").replaceAll($(this));
                checkboxResultText = 'Выбрано';
            } else {
                $("<span>").html("<input type='checkbox' class='filtered-saved' disabled>").replaceAll($(this));
                checkboxResultText = 'Не выбрано';
            }
            wrap.append('<div class="holder"><span>' + checkboxResultText + '</span></div>');
        });

        //обработка Радиобаттанов
        clonedStep.find("input[type=radio]").each(function() {
            $(this).parent().find("br").remove();
            if (currentStep2.find('[name="' + $(this).attr("name") + '"][id="' + $(this).attr("id") + '"]').is(":checked")) {
                var label = currentStep2.find('label[for="' + $(this).attr("id") + '"]').text();
                $("<span>").html("<b><input type='checkbox' class='filtered-saved' disabled checked > " + label + "</b>").replaceAll($(this));
            } else {
                $(this).remove();
            }
            clonedStep.find('label[for="' + $(this).attr("id") + '"]').remove();
        });

        //не удалять переключатель
        clonedStep.find(".slider").removeAttr('id');
        //clonedStep.find(".slider img").addClass('ignore');
        clonedStep.find(".slider").each(function() {
            var direction = $(this).find('img').attr('src');
            if(direction.indexOf('slider-right') >= 0) {
                $(this).find('a').eq(0).remove();
            } else {
                $(this).find('a').eq(1).remove();
            }
        });

        //обработка Списков
        clonedStep.find("select").each(function(j) {
            var $select = currentStep2.find('[name="' + $(this).attr("name") + '"]');
            var text = '';

            // Фикс select`a в мультиблоке
            if ($select.length > 1) {
                console.error('Нужно пофиксить проблему множества имен!!!',$select)
                $select = $($select[$select.length-1]);
            }

            if ($select.find('option:checked').length===0) return true;

            // Добавление поддержки мультиселекта
            if ($select.prop('multiple') == true){
                $.each($select.val(), function (i, v) { text += $select.find('[value="'+ v +'"]').html() + '<br>';})
            } else text = $select.find("option:selected").html();

            $("<span>").html("<b>" + text + "</b>").replaceAll($(this));
        });
        clonedStep.find('.chosen-container').remove();
        clonedStep.find('.multiblock-control').remove();

        //обработка Файлов
        clonedStep.find("input[type=file]").each(function(j) {
            var t = $(this);

            var wrap = t.closest('.wrap');
            var fcontainer = wrap.find('.file-info-container');
            var fname = wrap.find('.file-name');
            if (t.attr('upload_method')==='external_storage') {
                var done = wrap.hasClass('upload-state-done');
            }
            else var done = true;
            if(fcontainer.css('display') !== 'none'&&fname.text()!=undefined&&done) {
                $("<span>").html("<b>"+fname.text().replace(new RegExp("[^\\\\]+\\\\",'g'),'')+"</b>").replaceAll(t);
            } else {
                $("<span>").html("<b>(Не загружен)</b>").replaceAll(t);
            }
        });
        clonedStep.find('.file-process.empty, .file-process.done .file-remove').remove();

        //обработка текстовых полей и текстарии
        clonedStep.find("input[type!=hidden], textarea").not('.filtered-saved').each(function(j) {
            if ($(this).css('display')=='none') return;
            var value = '';
            var input = currentStep2.find('[name="' + $(this).attr("name") + '"]');

            if (input.length > 1) {
                console.error('Нужно пофиксить проблему множества имен!!!',input)
                value = $(input[input.length-1]).val();
            }
            else value = $(input).val();

            if(value == '') value = 'Не заполнено';
            if ($(this).attr('type')=='password') value = value.replace(/./g,'*');

            $("<span>").html("<b>" + value + "</b>").replaceAll($(this));

        });

        // Заполняем метку, если пустая
        clonedStep.find("label[data-info]").not('.hidden').each(function(j) {
            if ($(this).html() == '') {
                $(this).html($(this).attr('data-info'));
            }
        });

        //Удаление лишних тегов
        clonedStep.find('.holder').removeClass('inline');
        clonedStep.find("input[name='field[internal.staff][]']").remove();
        clonedStep.find("script, .hint, .for_delete, img:not(.ignore),.error-message, .menu_cont, .mpgu_btn, .info_z_div,.block-button.add, .obyaz_zap_div, font, .form-infobox:not(.ignore), .pmulti_link, .multiblock-save, .up-arrow, input[type='hidden'], .required, .chosen-container, .multiblock-control, .file-process.empty, .file-process.done, .file-remove, .additional").remove();

        clonedStep.find('input,select, textarea').removeAttr('name').removeAttr('id').removeAttr('data-elk-field').removeAttr('data-elk-block');

        //Удаление скрытых fieldset и div
        clonedStep.find('fieldset, div').filter(function() {
            return $(this).css('display') == 'none';
        }).remove();

        //Удаление незаполненных checkbox
        clonedStep.find('input[type=checkbox]:not(:checked)').parents('div.wrap').remove();

        var neededClasses = [];
        if (typeof(saveClasses) === 'string') saveClasses.split(' ').forEach(function (selector) {
            neededClasses.push(selector);
        });

        // убираем id и лишние классы для устранения конфликтов
        clonedStep.find('*').removeClass(function(index, currentClasses) {
            var classNeed = ['form-block', 'no-legend', 'wrap', 'holder', 'filtered-saved','button_group','button_link', 'button','checked'].concat(neededClasses),
                current = [],
                classes = '';
            if(typeof(currentClasses) != "undefined"){
                current = currentClasses.split(" ");
                for(var i = 0, count = current.length; i < count; i++){
                    if(current[i] !== '' && $.inArray(current[i], classNeed) === -1){
                        classes += " " + current[i];
                    }
                }
            }
            return classes;
        });
        currentStep2.find('.nonvalidation').removeClass('nonvalidation');
        // добавляем на контейнер

        // Удаление атрибутов for у label. Если этого не сделать, то при клике по
        // тексту, сформированному из checkbox, вызываются обработчики событий.
        clonedStep.find('label').removeAttr('for');

        clonedStep.appendTo(container);
    }

    FormController.generateLastStepCallback(container);

    return true;
};

FormController.generatehtmlview = function(container, totalSteps) {
    container.empty();

    for (var i = 1; i <= totalSteps; i++) {
        var currentStep2 = $('#form_element fieldset.form-step:not(.disabled)').eq(i - 1);
        //пометить невидимые поля классом todelete
        //if (currentStep2.css('display')=='none') continue;
        currentStep2.find('div,.wrap,fieldset:not(.form-step),.disabled').filter(function(){return ($(this).css('display')=='none')}).addClass('todelete');
        var clonedStep = $("<fieldset class='form-step'>").append($($(currentStep2.html())).not('script'));
        if (!currentStep2 || currentStep2.length === 0 || clonedStep.find('.form#form_element').length>0)
            continue;

        clonedStep.removeAttr("id");
        //удалить все невидимые поля и кнопки мультиблока
        clonedStep.find('.todelete, .pmulti-del, .pmulti_link').remove();
        //Убьем все, что не видно
        clonedStep.find('fieldset.form-block').filter(function() { return $(this).css("display") == "none" }).remove();
        clonedStep.find('.wrap, div').filter(function() { return (($(this).css("display") == "none")||($(this).css("display") == ""&&$(this).hasClass('hidden')))}).remove();


        //обработка группы кнопок
        clonedStep.find(".button_group .button").click(function(){return false;})
        clonedStep.find(".button_group input[type=radio]").remove();

        clonedStep.find("input:checkbox, input:radio").each(function(){
            $(this).attr('disabled','disabled').removeAttr('checked');
            if (currentStep2.find('[id="'+$(this).attr('id')+'"]').is(':checked')) {
                $(this).attr('checked','checked');
                if ($(this).attr('type')=='radio')
                    $(this).removeAttr('disabled');
            }

        });

        //не удалять переключатель
        clonedStep.find(".slider").removeAttr('id');
        clonedStep.find(".slider img").addClass('ignore');


        //обработка Файлов
        clonedStep.find("input[type=file]").each(function() {
            var wrap = $(this).closest('.wrap');
            $(this).remove();
            var state = ['empty','loading','done'];
            for (var i in state) {
                if (!wrap.hasClass('upload-state-'+state[i])) {
                    wrap.find('.'+state[i]).remove();
                }
            }
            wrap.find('.file-remove').remove();
        });


        //обработка текстовых полей
        clonedStep.find("input:text").each(function(j) {
            if ($(this).css('display')!='none'&&$(this).css('opacity')!='0') {
                var value = currentStep2.find('[name="' + $(this).attr("name") + '"]:not(:disabled)').val();
                if(value == '') {
                    $(this).val('Не заполнено');
                }
                else $(this).val(value).attr('value',value);
                $(this).attr('disabled','disabled');
            }
            else $(this).remove();
        });
        //обработка  текстарии
        clonedStep.find("textarea").each(function(j) {
            if ($(this).css('display')!='none'&&$(this).css('opacity')!='0') {
                var value = currentStep2.find('[name="' + $(this).attr("name") + '"]:not(:disabled)').val();
                if(value == '') {
                    $(this).html('Не заполнено');
                }
                else $(this).html(value);
                $(this).attr('disabled','disabled');
            }
            else $(this).remove();
        });

        //Удаление лишних тегов
        //clonedStep.find('.holder').removeClass('inline');
        clonedStep.find("input[type=hidden], .additional.hint-button, script, select, .chosen-drop, .multiblock-control, .service_del, .for_delete, img:not(.ignore, img[src*='gisoiv']), .menu_cont, .mpgu_btn, .info_z_div, .obyaz_zap_div, font , .error-message,.pmulti_link,.block-button.add,.up-arrow").remove();
        clonedStep.find('input,textarea').removeAttr('name').removeAttr('data-validatefunction').removeAttr('required');
        clonedStep.find('label').removeAttr('for');

        // добавляем на контейнер
        clonedStep.appendTo(container);
        currentStep2.find('.todelete').removeClass('todelete');
    }

    return true;
};


timers = {};

// Инициализация новых форм
$(document).ready(function() {
    $('.sub_form').each(function(){
        $(this).validate();
    });
    

    FormController.initialize($('#form_element'));
    
    $(document).on('change', '.inputCalendarBefore, .inputCalendarAfter, .inputCalendar, .date_field', function() {
        $(this).valid()
    });
    
    	var methods = {
		init: function(options) {
			options = $.extend({
				label: 'Осталось символов: ',
				limit: 255,
				blockStyle: 'color: gray;font-size: 10px;margin-left: 4px'
			}, options);
			this.data('textLimited', {
				options: options
			});
			//append status line
			var counterDiv = $('<div class="textLimitedCount" style="' + options.blockStyle +
				'"><span class="textLimitedCountLabel">' + options.label + '</span> ' +
				'<span class="textLimitedCountCounter">' + options.limit + '</span></div>');
			var counterValue = counterDiv.find('.textLimitedCountCounter');
			var text = this;
			this.bind('keyup change blur', function() {
				var $this = $(this);
				if ($this.val().length > options.limit) {
					$this.val($this.val().substring(0, options.limit));
					counterValue.text('0');
				}
				counterValue.text(options.limit - text.val().length);
			});
			counterDiv.insertAfter(this);
			this.trigger('blur');
		},
		destroy: function() {
		}
	};
    
    
    
    $('.sub_form').each(function(){
        if ($(this).attr('id')!=undefined) FormController.initialize($('#'+$(this).attr('id')));
    });


    //валидаторы для идентификаторов ГИБДД
    var glet = $('input.has-gibdd-letters');
    if (glet.length) {
        glet.on('keyup paste', ReplaceGibddLetters);	// заменяем введённые буквы на русские большие СТС и постановления
    }



    // сравнение временных промежутков std_timeselect.tpl
    var ts = $('.timeselect input, .timeselect select');
    if (ts.length) {
        $.validator.addMethod('timeselect', function(value, element) {
            if (/^[0-9]?[0-9]:\d\d/.test(value)) {
                var t = value.split(':');
                return (parseInt(t[0]) >= 0 && parseInt(t[0]) < 24 && parseInt(t[1]) >= 0 && parseInt(t[0]) < 24 && parseInt(t[1]) >= 0 && parseInt(t[1]) < 60);
            }
            if (value == '')
                return true;
            return false;
        });
        $.validator.addMethod('timecompare', function(value, element) {
            var a = element.id.split('_');
            var id1 = element.id;

            if (a[1] == 'from') {
                if (parseInt(element.value.replace(':', '')) < parseInt($('#' + id1.replace('from', 'to')).val().replace(':', ''))) {
                    $('#' + a[0] + '_to').removeClass('error');
                    $('#' + a[0] + '_to').addClass('valid');
                    return true;
                }
                return false;
            } else if (a[1] == 'to') {
                if (parseInt(element.value.replace(':', '')) > parseInt($('#' + id1.replace('to', 'from')).val().replace(':', ''))) {
                    $('#' + a[0] + '_from').removeClass('error');
                    $('#' + a[0] + '_from').addClass('valid');
                    return true;
                }
                return false;
            }
        });
        ts.each(function(idx, element) {
            $(element).rules('add', {timeselect: true, timecompare: true});
        });
    }

    // сравнение временных промежутков - std_timeslider.tpl
    var ts = $('.timeslider');
    if (ts.length) {
        ts.each(function(idx, element) {
            var timestep = parseInt($(element).find('.timestep:first').val());
            var timemin_a = $(element).find('.timemin:first').val().toString().split(':');
            var timemin = parseInt(timemin_a[0]) * 60 + parseInt(timemin_a[1]);
            var timemax_a = $(element).find('.timemax').val().toString().split(':');
            var timemax = parseInt(timemax_a[0]) * 60 + parseInt(timemax_a[1]);
            var timefrom_a = $(element).find('.timeslider_from_value:first').val().toString().split(':');
            var timefrom = parseInt(timefrom_a[0]) * 60 + parseInt(timefrom_a[1]);
            var timeto_a = $(element).find('.timeslider_to_value:first').val().toString().split(':');
            var timeto = parseInt(timeto_a[0]) * 60 + parseInt(timeto_a[1]);
            $(element).find('.timefrom_display').html($(element).find('.timeslider_from_value:first').val());
            $(element).find('.timeto_display').html($(element).find('.timeslider_to_value:first').val());
            $(element).find('.timeselect_slider').slider({
                range: true,
                min: timemin,
                max: timemax,
                step: timestep,
                values: [timefrom, timeto],
                slide: function(e, ui) {
                    var hours = Math.floor(ui.values[0] / 60).toString();
                    var minutes = (ui.values[0] - (hours * 60)).toString();
                    if (hours.length == 1)
                        hours = '0' + hours;
                    if (hours == 24)
                        hours = '00';
                    if (minutes.length == 1)
                        minutes = '0' + minutes;
                    if ($('.timeslider_from_value:first').val() != hours + ':' + minutes) {
                        $('.timeslider_from_value:first').val(hours + ':' + minutes).trigger('change');
                    }
                    $(element).find('.timefrom_display').html(hours + ':' + minutes);
                    var hours = Math.floor(ui.values[1] / 60).toString();
                    var minutes = (ui.values[1] - (hours * 60)).toString();
                    if (hours.length == 1)
                        hours = '0' + hours;
                    if (hours == 24)
                        hours = '00';
                    if (minutes.length == 1)
                        minutes = '0' + minutes;
                    if ($('.timeslider_to_value:first').val() != hours + ':' + minutes) {
                        $('.timeslider_to_value:first').val(hours + ':' + minutes).trigger('change');
                    }
                    $(element).find('.timeto_display').html(hours + ':' + minutes);
                }
            });
        });
    }

    $.mask2.rules['~'] = /[АБВЕКМНОРСТУХабвекмнорстухABEKMHOPCTYXabekmhopctyx0-9]/;
    $.mask2.rules['k'] = /[0-9A-ZА-ЯЁ]/;

    $('.has-gibdd-resolution-number').each(function(index, elem) {
        elem = $(elem);
        var setGibbResolutionMask = function(ev, element) {
            var c = elem.val(), curMask = elem.attr('curMask');
            if (c.length >= 3 && c.indexOf('188') == 0 && curMask != 'gibdd_resolution2') { //Новый уин, 188 - КБК МВД
//					console.log(c,'gibdd_resolution2');
                elem.setMask("99999499999999999999");
                if (/^1881?[0-4]?$/.test(c))
                    elem.val('18810');
                elem.rules('remove');
                elem.rules('add', {gibdd_resolution2: true, minlength: 20, maxlength: 20});
                elem.attr('curMask', 'gibdd_resolution2');
            }
            else if (c.length >= 3 && /^\d{3}/.test(c) && curMask != 'gibdd_resolution_madi') {//20 цифр - КБК МАДИ, поищем 3 первых
//					console.log(c,'gibdd_resolution_madi');
                elem.setMask("99999999999999999999");
                elem.rules('remove');
                elem.rules('add', {gibdd_resolution_madi: true, minlength: 20, maxlength: 20});
                elem.attr('curMask', 'gibdd_resolution_madi');
            }
            else if (c.length >= 3 && /^\d{2}[А-Яа-яЁё]{1}/.test(c) && curMask != 'gibdd_resolution1') { //Старый уин
//					console.log(c,'gibdd_resolution1');
                elem.setMask("99vv9999999");
                elem.rules('remove');
                elem.rules('add', {gibdd_resolution1: true, minlength: 10, maxlength: 11});
                elem.attr('curMask', 'gibdd_resolution1');
            }
            else if (c.length < 3) {
//					console.log(c,'<3');
                elem.setMask("99wwwwwwwwwwwwwwwwww");
                elem.rules('remove');
                elem.rules('add', {gibdd_invalid: true, minlength: 0, maxlength: 20});
                elem.removeAttr('curMask');
            }
            return false;
        };
        elem.on('keyup paste', setGibbResolutionMask);

    });
});






