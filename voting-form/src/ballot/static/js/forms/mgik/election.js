$(function() {

    var timeLimit = 15;
    var bulletinDeputyNameHeight = '174px';
    var $buttons = $('.bulletin__btn');

    var initTimer = function (timestamp, show_sec, period, callback) {
        if (period == undefined ||(period < 60000 && !show_sec)) period = 60000;
        if (typeof timer_head != 'undefined' ) {
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

    var setBullSizes = function () {
        var $deputies = $('.bulletin__deputy');
        var maxHeight = 0;

        $deputies.height('auto');

        if (isMobileView()) {
            $('.bulletin__name').css('height', 'auto');
        }

        for (var i = 0; i < $deputies.length; i++) {
            var height = $deputies.eq(i).height();

            if (maxHeight < height) {
                maxHeight = height;
            }
        }

        $deputies.height(maxHeight);
    };

    initTimer(timeLimit * 60000, true, 1000, function () {
        window.location = '/election/error/?code=1';
    });

    setBullSizes();

    $(window).resize(function ()  {
        setBullSizes();

        var checkedEl = $('.bulletin__radio:checked');

        if (checkedEl.length) {
            $('.bulletin__name').css('height', 'auto');
            checkedEl.closest('.bulletin__deputy').find('.bulletin__name').css('height', bulletinDeputyNameHeight);
        }
    });

    $('.bulletin__radio').on('click', function () {
        var value = this.value;
        var $button = $('#button-' + value);

        $buttons.hide();

        if (isMobileView()) {
            var $name = $(this).closest('.bulletin__deputy').find('.bulletin__name');

            if ($name.length && $name.css('height') !== bulletinDeputyNameHeight) {
                $('.bulletin__name').css('height', 'auto');
                $name.animate(
                    {'height': bulletinDeputyNameHeight},
                    500,
                    function() {
                        $button.fadeIn('fast');
                    }
                );
            } else {
                $button.show();
            }
        } else {
            $button.fadeIn('fast');
        }

    });

    $buttons.on('click', function () {
        var $button = $(this);

        var votingId = 1;
        var dataToEncrypt = parseInt($(this).data('value'));
        var entropy = Math.floor(Math.random() * Math.floor(100001231984));

        var ballotRegistryAddress = window.ditVotingParams.ballotRegistryAddress;
        var modules = window.ditVotingParams.modules;
        var generators = window.ditVotingParams.generators;
        var publicKeys = window.ditVotingParams.publicKeys;

        var encryptor = new window.ditVoting.MultiLevelEncryptor(modules, generators, publicKeys);
        var signer = new window.ditVoting.TransactionSigner();

        $button.prop('disabled', true).text('Отправка...');

        signer.initContract(ballotRegistryAddress).then(function() {
            return signer.getSignedTransaction(votingId, dataToEncrypt, entropy, encryptor);
        }).then(function(rawTX) {

            var address = signer.getAccountAddress();
            var tx = rawTX;

            // TODO: удалить после тестов
            console.log('accountAddress', address);
            console.log('tx', tx);

            $.ajax({
                url: window.location.origin + '/election/?action=vote',
                type: 'post',
                dataType : 'json',
                data: ({
                    guid: $('#guid').val(),
                    votingId: parseInt($('#district').val()),
                    voterAddress: address,
                    tx: tx,
                }),
                success: function (data) {
                    if (data.status === 'error') {
                        window.location = '/election/error/?code=' + data.code;
                        return false;
                    }

                    window.location = '/election/success';
                    return true;
                },
                error: function (data) {
                    window.location = '/election/error';
                    return false;
                }
            });

        }).catch(function (error) {
            console.error(error);
            alert(error.message)
        });

        return true;
    });

});