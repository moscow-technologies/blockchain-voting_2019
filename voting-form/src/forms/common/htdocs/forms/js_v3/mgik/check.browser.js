(function($) {

    var options = {};
    var errors = [];
    var parser = new UAParser();
    var browser = parser.getBrowser();

    var isModernBrowser = false;
    var isEncryptionWorks = false;

    var checkVersion = function () {
        var browserName = browser.name.toLowerCase();
        var browserVersion = browser.major;
        var result = false;

        $.each(options.allow, function (allowName, allowVersion) {
            if (browserName === allowName && browserVersion >= allowVersion) {
                result = true;

                return false;
            }
        });

        return result;
    };

    var checkCrypt = function () {
        try {
            var entropy = Math.floor( 1234 * (Math.floor(new Date() / 1000)) );
            var encryptor = new window.ditVoting.ElGamal(options.modulo, options.generator, options.publicKey);
            var signer = new window.ditVoting.TransactionSigner();

            return signer.initContract(options.ballotRegistryAddress).then(function () {
                return signer.getSignedTransaction(options.votingId, options.dataToEncrypt, entropy, encryptor);
            }).then(function (rawTX) {
                var address = signer.getAccountAddress();
                var hash = encryptor.getKeyVerificationHash();

                if (rawTX && address && hash) {
                    return true;
                }

                return false;

            }).catch(function (error) {
                return false;
            });

        } catch(e) {
            return false;
        }
    };

    var result = function (status) {
        var $loader = $(options.loader);
        var $target = $(options.target);
        var template;

        if ($loader) {
            $loader.hide();
        }

        if (isModernBrowser && isEncryptionWorks) {
            if (options.successTemplate) {
                template = OPR.templater(options.successTemplate, {});
            }
        } else {
            if (options.errorTemplate) {
                template = OPR.templater(options.errorTemplate, {
                    isModernBrowser: isModernBrowser,
                    isEncryptionWorks: isEncryptionWorks
                });
            }

            logError();
        }

        if (template) {
            $target.html(template);
        }

        $target.fadeIn('fast');

        return isModernBrowser && isEncryptionWorks;
    };

    var logError = function() {
        var error = [];

        if (! isModernBrowser) {
            errors.push('Версия браузера устарела');
        }

        if (! isEncryptionWorks) {
            errors.push('Ошибка шифрования в браузере');
        }

        $.ajax({
            url: cfgMainHost + '/ru/app/mgik/mgd2019/?ajaxModule=mgd&ajaxAction=log',
            method: 'post',
            data: {
                log: {
                    error: errors.join(' и '),
                    isModernBrowser: isModernBrowser,
                    isEncryptionWorks: isEncryptionWorks,
                    browser: browser,
                    allow: options.allow
                }
            }
        });
    };

    $.checkBrowser = function (opt) {
        options = $.extend({}, $.checkBrowser.defaults, opt);

        isModernBrowser = checkVersion();

        try {
            return checkCrypt().then(function (checkCryptResult) {
                isEncryptionWorks = checkCryptResult;

                return result();
            });
        } catch (e) {
            return result();
        }
    };

    $.checkBrowser.defaults = {
        loader: '.js-loader',
        errorTemplate: 'browser_errors_template',
        successTemplate: '',
        allow: {
            'chrome': 37,
            'yandex': 18,
            'firefox': 34,
            'opera': 24,
            'edge': 12,
            'safari': 11,
            'mobile safari': 11
        },
        votingId: 1,
        dataToEncrypt: 42,
        ballotRegistryAddress: '0xEc125529358FAF12Db8d9011c436FDd366C3c57F',
        modulo: '146570125332794430542818431487733773806445617910805576681149223214515926515262344449800205240321052888756776899073115676322199498416392708781288575864811600918242614466003206600150496684000188399730466527726818579732721375724514648843247384550519643901843281193538127050405451310812425466119354395937435723963',
        generator: '51485467714157181686957437925033977273931460391056172036554775203931631465270206203402107913383811463538076053469067553943003916925222036013186843031240314832311012753998386766013230324015500372022104138209548710911021144186418000301820195612465143572987234804341944496905743918171709905612170964166439147779',
        publicKey: '89561115595849849871212801772140896801544244852380268144766865424391551858413980304317773345761511001991772833045048640658973810891326201766126501621920988674652049039313774711073092021084184281639063209808216438926777433371839132484031959511138202274700402983229844754677626217079288260543070252921289635039'
    };

})(jQuery);