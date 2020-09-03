$(function () {

    var timeLimit = 15;
    var zoom=0;
    var $buttons = $('.bulletin__btn');
    var $radios = $('.bulletin__radio');
    var $wrapper = $('.wrapper');
    var $html = $('html');
    var guid = $('#guid').val();
//    var userEntropy = '';

    var spaceForButton = 54; // Место, которое займёт кнопка в мобильной вёрстке.

    var initTimer = function (timestamp, show_sec, period, callback) {
        if (period == undefined || (period < 60000 && !show_sec))
            period = 60000;
        if (typeof timer_head !== 'undefined') {
            clearInterval(timer_head['timer']);
        }
        var timer_head = {
            'time': timestamp,
            'period': period,
            'show_sec': show_sec,
            'func': function () {
                if (timer_head['time'] <= 0) {
                    clearInterval(timer_head['timer']);
                    $('.timer_head .timer_value').html('Время вышло');
                    $('.timer_head').hide();
                    if (callback != undefined && callback)
                        eval(callback());
                } else {
                    $('.timer_head .timer_value').html(countdown_timestamp_to_str(timer_head['time'], timer_head['show_sec']));
                    $('.timer_head').show();
                }

                timer_head['time'] = timer_head['time'] - timer_head['period'];
            }
        };

        timer_head['timer'] = setInterval(function () {
            timer_head.func();
        }, period);
        timer_head.func();
    };

    var isMobileView = function () {
        return $('.bulletin__action').eq(0).css('position') === 'absolute';
    };

    var calculateDeputyNameHeight = function (deputy) {
        var height = 0;

        if (deputy.find('.bulletin__lastname').height()) {
            height += deputy.find('.bulletin__lastname').height();
        }
        if (deputy.find('.bulletin__fullname').height()) {
            height += deputy.find('.bulletin__fullname').height();
            height += parseInt(deputy.find('.bulletin__fullname').css('marginBottom'));
        }
        if (deputy.find('.bulletin__birthdate').height()) {
            height += deputy.find('.bulletin__birthdate').height();
        }

        return height;
    };

    var setButtonsPosition = function () {
        if (isMobileView()) {
            var minMarginTop = -54; // Минимальное значение при котором кнопка не наезжает на чекбокс.
            var littleClose = 5; // Кнопка будет немного пересекаться с областью названия пункта,
            // тогда визуально отстуа от названия будет меньше, а от описания - больше.
            var $deputies = $('.bulletin__deputy');
            for (var i = 0; i < $deputies.length; i++) {
                var paddingTop = parseInt($deputies.eq(i).css('paddingTop'));
                var calculatedHeight = calculateDeputyNameHeight($deputies.eq(i));
                var buttonTop = calculatedHeight + paddingTop - littleClose; // Кнопка должна отображаться здесь.
                var topPosition = parseInt($deputies.eq(i).find('.bulletin__btn').css('top')); // Текущее положение кнопки.
                var marginTop = buttonTop - topPosition
                if (marginTop < minMarginTop) {
                    marginTop = minMarginTop;
                }
                $deputies.eq(i).find('.bulletin__btn').css('marginTop', marginTop + 'px');
            }
        } else {
            $('.bulletin__btn').css('marginTop', '0');
        }
    };

    var setBullSizes = function () {
        var $deputies = $('.bulletin__deputy');
        var maxHeight = 0;

        $deputies.height('auto');

        for (var i = 0; i < $deputies.length; i++) {
            var height = $deputies.eq(i).height();

            if (maxHeight < height) {
                maxHeight = height;
            }
        }

        $('.bulletin__name').css('margin-bottom', '0');
        $deputies.height(maxHeight);
    };

    var receiveGuid = function () {
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: '/crypto/api/registr/v1/receiveGuid',
            headers: {
                'System': 'BALLOT',
                'System-Token': 'ballottoken',
            },
            data: {
                data: {guid: guid}
            },
            success: function (data) {
                if (data.data == undefined || typeof data.data.result !== 'number') {
                    sendHit('Ошибка при получении бюллетеня', 'errorBallot', JSON.stringify({"data": data, "guid": $('#guid').val()}));
                    return false;
                }

                //sendHit('Успешное получение бюллетеня','sendBallot',JSON.stringify({"data":data,"guid":$('#guid').val()}));

                initTimer(data.data.result * 1000, true, 1000, function () {
                    redirectToUrl('/election/error/?code=1');
                });
            },
            error: function (data) {
                sendHit('Ошибка при получении бюллетеня', 'errorBallot', JSON.stringify({"data": data, "guid": $('#guid').val()}));
            }
        });
    };

    var transformContent = function () {
        zoom = $(window).height() / $(document).height();

        $wrapper.css('transform', 'scale(' + zoom + ')');
        $html.css('overflow', 'hidden');
    };

    var redirectToUrl = function (url) {
        allowLeaving();
        window.location = url;
    };

    var sendHit = function (hit, tp, value) {
        $.ajax({
            url: '/crypto/api/ajax/v1/service/hit',
            type: 'post',
            dataType: 'json',
            data: ({
                hit: hit,
                type: tp,
                value: value
            })
        });
    };

    receiveGuid();

    $('.overlay').on('click', function (e) {
        $(this).remove();

//        userEntropy = Math.floor( (e.clientX  + e.clientY) * (Math.floor(new Date() / 1000)) );

        $wrapper.animate(
            {
                scale: 1
            },
            {
                duration: 500,
                step: function(now, fx) {
                    if (now==0){
                        now=zoom;
                    }
                    $wrapper.css('transform', 'scale(' + now + ')')
                },
                complete: function() {
                    $html.css('overflow', 'inherit');
                    $wrapper.removeAttr("style");
                    setBullSizes();
                }
            }, 'linear');

    });

    $(window).resize(function () {
        setBullSizes();
        setButtonsPosition();
        $('.bulletin__name').css('margin-bottom', '0');
        if (isMobileView()) {
            var checkedEl = $('.bulletin__radio:checked');

            if (checkedEl.length) {
                checkedEl.closest('.bulletin__deputy').find('.bulletin__name');
            }
        }
    });

    $(document).on('ready', function () {
        sendHit('Открытие бюллетеня', 'open', JSON.stringify({"guid": $('#guid').val()}));
        setBullSizes();
        transformContent();
        setButtonsPosition();
        $("#deputiesForm").validate();
        initializeValidators($('#deputiesForm'));
    });
    var initializeValidators = function($container) {
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

    $.validator.addMethod("noMoreCheckbox", function(value, element) {
        if ($('input[type=checkbox]:checked').length < ditVotingParams.minChoices && element.checked) {
            $('label.hint').remove();
            $.validator.messages.noMoreCheckbox = "Необходимо выбрать не менее одного варианта";
            $('#button-send').attr("disabled", true);
            return false;
        }
        else if($('input[type=checkbox]:checked').length > ditVotingParams.maxChoices && element.checked) {
            $.validator.messages.noMoreCheckbox = "Необходимо выбрать не более двух вариантов";
            $('#button-send').attr("disabled", true);
            return false;
        }
        return true;
    });

    $.validator.addMethod("useMoreCheckbox", function(value, element) {
        if($('input[type=checkbox]:checked').length == ditVotingParams.minChoices ) {
            var $hint="<label for=\""+element.name+"\" class=\"hint\">Вы можете выбрать два варианта</label>"
            var $currentElement = $('[name='+(element.name).replace('[','\\\[').replace(']','\\\]')+']');
            if (element.checked) $currentElement.next('.bulletin__check').append($hint);
            $('label.hint').off('click.controller').on('click.controller', function() {
                $('label.hint').remove();
                return false;
            });
            return true;
        }
        else if ($('input[type=checkbox]:checked').length > ditVotingParams.minChoices) {
            $('label.hint').remove();
            return true;
        }
        return true;
    });

    $.validator.setDefaults({
        focusInvalid: true,
        errorClass: 'error',
        validClass: 'valid',
        ignore: '.ignore, .chosen-container input, [type=hidden]:not(select.chosen:not(*:hidden > select.chosen)), :disabled',
        errorPlacement: function($error, $element) {
            $error.insertAfter($element.next('.bulletin__check'));
            $error.off('click.controller').on('click.controller', function() {
                $(this).remove();
                return false;
            });
            return true;
        },
        unhighlight: function (element, errorClass, validClass) {
            var $currentElement = $('[name='+(element.name).replace('[','\\\[').replace(']','\\\]')+']');
            $currentElement.next(".bulletin__check").next('label.'+errorClass).remove();
            if($('input[type=checkbox]:checked').length <= ditVotingParams.maxChoices && $('input[type=checkbox]:checked').length >= ditVotingParams.minChoices) {
                $('label.'+errorClass).remove();
                $('#button-send').removeAttr("disabled");
            }
        }
    });

    $radios.on('click', function () {
        var $this = $(this);
        var $button = $('#button-send');

        if (ditVotingParams.maxChoices<=1) {
            $button.hide();
        }
        $(this).valid();
        if (!$this.is(':checked')) {
            $this.removeAttr('checked');

            if (ditVotingParams.maxChoices>1 && $('input[type=checkbox]:checked').length < ditVotingParams.minChoices) {
                $button.hide();
            }
        } else {

            if (isMobileView()) {
                var $name = $this.closest('.bulletin__deputy').find('.bulletin__name');

                if ($name.length) {
                    $('.bulletin__name').css('margin-bottom', '0');
                    $name.animate(
                        {'marginBottom': ''},
                        'fast',
                        function () {
                            if ($('input[type=checkbox]:checked').length <= ditVotingParams.maxChoices) {
                                if ($button.is(":hidden")) {
                                    $button.fadeIn('fast');
                                }
                            }
                        }
                    );
                } else {
                    if ($('input[type=checkbox]:checked').length <= ditVotingParams.maxChoices) {
                        if ($button.is(":hidden")) {
                            $button.fadeIn('fast');
                        }
                    }
                }
            } else {
                if ($('input[type=checkbox]:checked').length <= ditVotingParams.maxChoices) {
                    if ($button.is(":hidden")) {
                        $button.fadeIn('fast');
                    }
                }
            }
        }
    });

    var validateCheck = function () {
        zoom = $(window).height() / $(document).height();

        $wrapper.css('transform', 'scale(' + zoom + ')');
        $html.css('overflow', 'hidden');
    };


    $buttons.on('click', function () {
        if ($('#deputiesForm').valid()) {
            var $button = $(this);

            sendHit('Нажатие на кнопку', 'send', JSON.stringify({"guid": guid}));
            //округ
            var districtId = parseInt($('#district').val());
            //голосование
            var encryptionKey = window.ditVotingParams.publicKey;
            var votingId = window.ditVotingParams.voitingId;
            var minChoices = window.ditVotingParams.minChoices;
            var maxChoices = window.ditVotingParams.maxChoices;
            //выбранный вариант
            if (ditVotingParams.maxChoices > 1) {
                var choice = $('input:checkbox:checked').map(function () {
                    return parseInt(this.value);
                }).get();
            } else {
                var choice = [parseInt($button.data('value'))];
            }


//        var entropy = userEntropy;
            var guid = $('#guid').val();

            $(document).off('click.election');
            $button.prop('disabled', true).text('Отправка...');
            $radios.prop('disabled', true);
            var createBallot = window.ditVoting.createBallot;

            try {
                var ballot = createBallot({
                    votingId: votingId,
                    encryptionKey: encryptionKey,
                    districtId: districtId,
                    minChoices: minChoices,
                    maxChoices: maxChoices,
                    voterChoices: choice,
                });

                sendHit('Удачно зашифровалось', 'successCrypt');
                $.ajax({
                    url: window.location.origin + '/election/vote',
                    type: 'post',
                    dataType: 'json',
                    data: ({
                        rawStoreBallotTx: ballot.tx,
                        guid: guid,
                        votingId: votingId,
                        district: districtId,
                        accountAddressBlock: ballot.voterAddress,
                        keyVerificationHash: ballot.keyVerificationHash,
                        rawTxHash: ballot.txHash,
                    }),
                    success: function (data) {
                        if (data.status === 'error') {
                            sendHit('Ошибка голосования', 'errorSend', JSON.stringify({"data": data, "guid": guid}));
                            redirectToUrl('/election/error/?code=' + data.code);
                            return false;
                        }
                        redirectToUrl('/election/success');
                        sendHit('Удачно отправилось', 'successSend');
                        return true;
                    },
                    error: function (data) {
                        sendHit('Ошибка голосования', 'errorSend', JSON.stringify({"data": data, "guid": guid}));
                        //redirectToUrl('/election/error');
                        return false;
                    }
                });

            } catch (err) {
                sendHit('Ошибка шифрования', 'errorCrypt', JSON.stringify({"data": error, "guid": guid}));
                alert(err.message)
            }

            return true;
        }
    });

});



