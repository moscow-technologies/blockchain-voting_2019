$(function() {

    var timeLimit = 15;
    var $buttons = $('.bulletin__btn');
    var $radios = $('.bulletin__radio');
    var $wrapper = $('.wrapper');
    var $html = $('html');
    var guid = $('#guid').val();
    var userEntropy = '';

    var spaceForButton = 54; // Место, которое займёт кнопка в мобильной вёрстке.
    
    var initTimer = function (timestamp, show_sec, period, callback) {
        if (period == undefined ||(period < 60000 && !show_sec)) period = 60000;
        if (typeof timer_head !== 'undefined' ) {
            clearInterval(timer_head['timer']);
        }
        timer_head = {
            'time': timestamp,
            'period': period,
            'show_sec': show_sec,
            'func': function(){
                if (timer_head['time']<=0) {
                    clearInterval(timer_head['timer']);
                    $('.timer_head .timer_value').html('Время вышло');
                    $('.timer_head').hide();
                    if (callback!=undefined&&callback) eval(callback());
                } else {
                    $('.timer_head .timer_value').html(countdown_timestamp_to_str(timer_head['time'], timer_head['show_sec']));
                    $('.timer_head').show();
                }

                timer_head['time'] = timer_head['time']-timer_head['period'];
            }
        };

        timer_head['timer'] = setInterval(function(){timer_head.func();},period);
        timer_head.func();
    };

    var isMobileView = function () {
        return $('.bulletin__action').eq(0).css('position') === 'absolute';
    };

    var calculateDeputyNameHeight = function(deputy) {
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
    
    var setButtonsPosition = function() {
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
        $('.bulletin__name').css('margin-bottom', spaceForButton + 'px');
        
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
                data: { guid: guid }
            },
            success: function (data) {
                if (data.data.result !== true) {
                    sendHit('Ошибка при получении бюллетеня','errorBallot',JSON.stringify(data));

                    return false;
                }

                sendHit('Успешное получение бюллетеня','sendBallot',JSON.stringify(data));

                initTimer(timeLimit * 60000, true, 1000, function () {
                    redirectToUrl('/election/error/?code=1');
                });
            },
            error: function (data) {
                sendHit('Ошибка при получении бюллетеня','errorBallot',JSON.stringify(data));
            }
        });
    };

    var transformContent = function () {
        var zoom = $(window).height() / $(document).height();

        $wrapper.css('transform', 'scale(' + zoom + ')');
        $html.css('overflow', 'hidden');
    };

    var redirectToUrl = function(url) {
        allowLeaving();
        window.location = url;
    };

    var sendHit = function (hit,tp, value) {
        $.ajax({
            url: '/api/ajax/v1/AjaxService/hit',
            type: 'post',
            dataType: 'json',
            data: ({
                hit: hit,
                type:tp,
                value: value
            })
        });
    };

    receiveGuid();
    transformContent();

    $('.overlay').on('click', function (e) {
        $(this).remove();

        userEntropy = Math.floor( (e.clientX  + e.clientY) * (Math.floor(new Date() / 1000)) );

        $wrapper.removeAttr('style').addClass('wrapper--origin');
        $html.css('overflow', 'inherit');
    });

    $(window).resize(function ()  {
        setBullSizes();
        setButtonsPosition();

        $('.bulletin__name').css('margin-bottom', '0');
        if (isMobileView()) {
            var checkedEl = $('.bulletin__radio:checked');
            
            if (checkedEl.length) {
                checkedEl.closest('.bulletin__deputy').find('.bulletin__name').css('margin-bottom', spaceForButton + 'px');
            }
        }
    });

    $(document).on('ready', function() {
        sendHit('Открытие бюллетеня','open');
        setBullSizes();
        setButtonsPosition();
    });
    
    $(document).on('click.election', function (e) {
        var $target = $(e.target);

        if ($target.is('.bulletin__check, .bulletin__radio, .bulletin__btn')) {
            return true;
        }

        $buttons.hide();
        $radios.removeAttr('checked');
        $radios.data('previousValue', false);
    });

    $radios.on('click', function () {
        var $this = $(this);
        var previousValue = $this.data('previousValue');
        var $button = $('#button-' + this.value);

        $buttons.hide();

        if (previousValue === 'checked') {
            $this.removeAttr('checked');
            $this.data('previousValue', false);

            sendHit('Снят выбор варианта', 'change');
        } else {
            $radios.data('previousValue', false);
            $this.data('previousValue', 'checked');

            sendHit('Выбор варианта', 'unchange');

            if (isMobileView()) {
                var $name = $this.closest('.bulletin__deputy').find('.bulletin__name');

                if ($name.length) {
                    $('.bulletin__name').css('margin-bottom', '0');
                    $name.animate(
                        {'marginBottom': spaceForButton},
                        'fast',
                        function() {
                            $button.fadeIn('fast');
                        }
                    );
                } else {
                    $button.fadeIn('fast');
                }
            } else {
                $button.fadeIn('fast');
            }
        }
    });

    $buttons.on('click', function () {
        var $button = $(this);
        var votingId = parseInt( $('#district').val() );
        var dataToEncrypt = parseInt($button.data('value'));
        var entropy = userEntropy;

        sendHit('Нажатие на кнопку', 'send');

        var ballotsRegistryAddress = window.ditVotingParams.ballotsRegistryAddress;
        var modulo = window.ditVotingParams.modulo;
        var generator = window.ditVotingParams.generator;
        var publicKey = window.ditVotingParams.publicKey;

        var encryptor = new window.ditVoting.ElGamal(modulo, generator, publicKey);
        var signer = new window.ditVoting.TransactionSigner();

        $(document).off('click.election');
        $button.prop('disabled', true).text('Отправка...');
        $radios.prop('disabled', true);

        signer.initContract(ballotsRegistryAddress).then(function() {
            return signer.getSignedTransaction(votingId, dataToEncrypt, entropy, encryptor);
        }).then(function(rawTX) {

            var voterAddress = signer.getAccountAddress();
            var keyVerificationHash = encryptor.getKeyVerificationHash();
            var tx = rawTX;

            $.ajax({
                url: window.location.origin + '/election/?action=vote',
                type: 'post',
                dataType : 'json',
                data: ({
                    registryAddress: ballotsRegistryAddress,
                    guid: guid,
                    votingId: votingId,
                    voterAddress: voterAddress,
                    keyVerificationHash: keyVerificationHash,
                    tx: tx,
                }),
                beforeSend: function() {
                    sendHit('Отправка голоса', 'send');
                },
                success: function (data) {
                    if (data.status === 'error') {
                        sendHit('Ошибка голосования','errorSend',  JSON.stringify(data));
                        redirectToUrl('/election/error/?code=' + data.code);
                        return false;
                    }
                    redirectToUrl('/election/success');
                    return true;
                },
                error: function (data) {
                    sendHit('Ошибка голосования','errorSend',JSON.stringify(data));
                    redirectToUrl('/election/error');
                    return false;
                }
            });

        }).catch(function (error) {
            sendHit('Ошибка шифрования','errorCrypt', JSON.stringify(error));
        });

        return true;
    });

});