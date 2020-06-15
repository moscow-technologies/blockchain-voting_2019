$(function () {

    var timeLimit = 15;
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
        timer_head = {
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
        var zoom = $(window).height() / $(document).height();

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
    transformContent();

    $('.overlay').on('click', function (e) {
        $(this).remove();

//        userEntropy = Math.floor( (e.clientX  + e.clientY) * (Math.floor(new Date() / 1000)) );

        $wrapper.removeAttr('style').addClass('wrapper--origin');
        $html.css('overflow', 'inherit');
    });

    $(window).resize(function () {
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

    $(document).on('ready', function () {
        sendHit('Открытие бюллетеня', 'open', JSON.stringify({"guid": $('#guid').val()}));
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

        } else {
            $radios.data('previousValue', false);
            $this.data('previousValue', 'checked');

            if (isMobileView()) {
                var $name = $this.closest('.bulletin__deputy').find('.bulletin__name');

                if ($name.length) {
                    $('.bulletin__name').css('margin-bottom', '0');
                    $name.animate(
                        {'marginBottom': spaceForButton},
                        'fast',
                        function () {
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
        sendHit('Нажатие на кнопку', 'send', JSON.stringify({"guid": guid}));
        //округ
        var districtId = parseInt($('#district').val());
        //голосование
        var votingId = window.ditVotingParams.voitingId;
        //выбранный вариант
        var choice = parseInt($button.data('value'));

//        var entropy = userEntropy;
        var encryptionKey = window.ditVotingParams.publicKey;
        var util = window.ditVoting.util;
        var encryptor = window.ditVoting.Cryptor.withRandomKeyPair();
        var guid = $('#guid').val();

        $(document).off('click.election');
        $button.prop('disabled', true).text('Отправка...');
        $radios.prop('disabled', true);

        try {
            var encryptedBox = encryptor.encrypt(
                util.numberToLeBytes(choice),
                util.hexadecimalToUint8Array(encryptionKey),
                );

            console.log(
                `encrypted message: ${util.uint8ArrayToHexadecimal(encryptedBox.encryptedMessage)}` +
                `\nnonce: ${util.uint8ArrayToHexadecimal(encryptedBox.nonce)}` +
                `\nvoter's encryption public key: ${util.uint8ArrayToHexadecimal(encryptedBox.publicKey)}`
                );

            var signer = new window.ditVoting.TransactionSigner();
            var rawStoreBallotTx = signer.getSignedTransaction(
                votingId,
                districtId,
                util.uint8ArrayToHexadecimal(encryptedBox.encryptedMessage),
                util.uint8ArrayToHexadecimal(encryptedBox.nonce),
                util.uint8ArrayToHexadecimal(encryptedBox.publicKey)
                );

            var rawTxHash = signer.getRawTransactionHash(rawStoreBallotTx);

            sendHit('Удачно зашифровалось', 'successCrypt', );
            $.ajax({
                url: window.location.origin + '/election/vote',
                type: 'post',
                dataType: 'json',
                data: ({
                    rawStoreBallotTx: rawStoreBallotTx,
                    guid: guid,
                    votingId: votingId,
                    district: districtId,
                    accountAddressBlock: signer.getAccountAddress(),
                    keyVerificationHash: window.ditVoting.Cryptor.getKeyVerificationHash(
                    util.hexadecimalToUint8Array(encryptionKey)
                    ),
                    rawTxHash: rawTxHash,
                }),
                success: function (data) {
                    if (data.status === 'error') {
                        sendHit('Ошибка голосования', 'errorSend', JSON.stringify({"data": data, "guid": guid}));
                        redirectToUrl('/election/error/?code=' + data.code);
                        return false;
                    }
                    redirectToUrl('/election/success');
                    sendHit('Удачно отправилось','successSend');
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
    });

});


