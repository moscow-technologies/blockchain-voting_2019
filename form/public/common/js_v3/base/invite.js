/**
 * Created 04.06.2018 Vereteiko Igor
 */
'use strict';
var INVITE = (function (container, params) {
    var opt = $.extend(true, {
            autoExecute: false,
            extUsers: false,
            draftId: false,
            declineMessage: 'Если Вы отклоните приглашение, то черновик будет удален из списка.<br/>Вы уверены, что хотите отклонить приглашение?',
            declineCallback: false,
            formController: false,
            hasInputAfterDeclineMessage: false,
            isEditingDraft: false,
            isFinal: false,
            isInvite: false,
            popupDeclarant: {
                popupHeader: 'Отправка приглашения',
                popupMessage: '',
                popupMessageAdditional: '',
                hideCancelButton: false,
                saveButtonText: 'Сохранить и перейти в Центр уведомлений'
            },
            popupExtUser: {
                popupHeader: 'Подтверждение и отправка заявления',
                popupMessage: '',
                hideCancelButton: false,
                saveButtonText: 'Подтвердить и отправить'
            }
        }, params)
        , $deleteInviteHtml = $('<div/>', {text: opt.declineMessage})
    ;

    if (opt.hasInputAfterDeclineMessage)
        $deleteInviteHtml.append($('<input/>', {
            id: 'declineMessage',
            type: 'text',
            class: 'form-control',
            style: 'max-width: none;',
            name: '',
            maxlength: '1024'
        }));

    $deleteInviteHtml.append($('<div/>', {
        style: 'text-align: center; margin-top: 15px;',
        html: [
            $('<a>', {
                href: "#",
                id: "acceptDeleteInvite",
                class: "button push-button",
                text: 'Да',
                onclick: "javascript:return false",
                style: 'margin: 0px 10px;'
            }),
            $('<a>', {
                href: "#",
                id: "cancelDeleteInvite",
                class: "button green push-button",
                text: 'Нет',
                onclick: "javascript:return false",
                style: 'margin: 0px 10px;'
            })
        ]
    }));

    function getExtUserKey(id) {
        var key = id.match(/-*\d+/) || [""];
        return key[0];
    }

    function declarantInitialize() {
        var totalSteps = opt.formController.totalSteps
            , afterStepCallback
        ;

        if (opt.isEditingDraft && !opt.isFinal && opt.isInvite) {
            afterStepCallback = function () {
                $('.form-controls > .form-buttons').empty();
                return false;
            };

            opt.formController.addAfterStepHandler({
                step: totalSteps,
                action: afterStepCallback
            });
        } else if (!opt.isFinal) {
            afterStepCallback = function () {
                var extUserBlockSelStr = [];

                if (opt.extUsers instanceof Array) {
                    $.each(opt.extUsers, function (key, elem) {
                        extUserBlockSelStr.push('input[id^="' + elem + '"]');
                    });
                } else extUserBlockSelStr.push('input[id^="' + opt.extUsers + '"]');

                var extUsersBlocks = container.find(extUserBlockSelStr.join(','));

                if (extUsersBlocks.length) {
                    //Пустой массив дополнительных заявителей
                    var extUsers = [];
                    $.each(extUsersBlocks, function (key, elem) {
                        //Соберем данные для проверки
                        var $elem = $(elem)
                            , id = $elem.attr('id')
                            , extUserkey = getExtUserKey(id) //Ключ заявителя
                            , type = id.substring(id.indexOf('-') + 1)
                        ;

                        if (typeof extUsers[extUserkey] === "undefined")
                            extUsers[extUserkey] = {};

                        if (['firstname', 'lastname', 'middlename', 'snils'].indexOf(type) !== -1)
                            extUsers[extUserkey][type] = $elem.val();
                    });

                    $.ajax({
                        url: cfgMainHost + '/ru/drafts/',
                        dataType: 'json',
                        type: 'POST',
                        data: {
                            ajaxRequest: 1,
                            method: 'checkUser',
                            extUsers: extUsers
                        }
                    }).done(function (data) {
                        if (data) {
                            if (data.success === false) {
                                messagebox('Ошибка!', data.error);
                                return false;
                            }
                            saveDraftOptions.ext_users = [data.ext_users];
                            $('#validate_error').hide();
                            $('#loader').hide();
                            downloadAppFileFromForm("", opt.popupDeclarant);
                        }
                    });
                }

                return false;
            };

            opt.formController.addValidator({
                step: totalSteps,
                next: afterStepCallback
            });
        }
    }

    function extUserInitialize(extUserEntity) {
        var totalSteps = opt.formController.totalSteps;
        var $btnContainer = $('.form-controls').find('> .form-buttons')
            , declineBtn = $('<a/>', {
                href: "#",
                id: "button_decline",
                class: "button blue push-button",
                text: 'Отклонить',
                style: 'margin-right: 10px;'
            })
        ;

        $btnContainer.prepend(declineBtn);

        var $btnAccept = $btnContainer.find('#button_next')
            , $btnDecline = $btnContainer.find('#button_decline');

        $btnAccept.addClass('green push-button').html('Принять');

        $btnDecline.off('click.buttonDecline').on('click.buttonDecline', function (e) {
            messagebox('Вы уверены?', $deleteInviteHtml[0].outerHTML, 700, false, true, function () {
                $('#acceptDeleteInvite').off('click.acceptDeleteInvite').on('click.acceptDeleteInvite', function (e) {
                    var dataParams = {
                        ajaxRequest: 1,
                        method: 'declineInvite',
                        draftId: opt.draftId
                    };

                    if (opt.hasInputAfterDeclineMessage)
                        dataParams['declineReason'] = $('#declineMessage').val();

                    $.ajax({
                        url: cfgMainHost + '/ru/drafts/',
                        dataType: 'json',
                        type: 'POST',
                        data: dataParams
                    }).done(function (data) {
                        if (data.success === false) {
                            $('.title1').html('Ошибка!');
                            $('.messagebox-body').html(data.error);
                            return false;
                        } else if (data.success === true) {
                            if (typeof opt.declineCallback == "function") {
                                opt.declineCallback();
                            } else window.location.href = MPGU.elk_host + '/my/#activity|info';
                        }
                    });

                    return false;
                });

                $('#cancelDeleteInvite').off('click.cancelDeleteInvite').on('click.cancelDeleteInvite', function (e) {
                    $.colorbox.close();
                    return false;
                });
            });

            return false;
        });

        Array.apply(null, Array(totalSteps)).forEach(function (value, idx) {
            var id = (idx+1);

            opt.formController.addAfterStepHandler({
                step: id,
                action: function (fromStep) {
                    if (opt.formController.getCurrentStep() < totalSteps) {
                        $btnAccept.removeClass('green').html('Продолжить');
                        $btnDecline.hide();
                    } else {
                        $btnAccept.addClass('green').html('Принять');
                        $btnDecline.show();
                    }

                    return true;
                }
            })
        });

        opt.formController.addValidator({
            step: totalSteps,
            next: function () {
                downloadAppFileFromForm('', $.extend(true, opt.popupExtUser, {isExtUser: true}));
                return false;
            }
        });
    }

    return {
        initialize: function (extUserEntity) {
            if (false === extUserEntity) {
                declarantInitialize();
            } else extUserInitialize(extUserEntity);
        }
    }
});
