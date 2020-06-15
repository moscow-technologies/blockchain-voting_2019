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
            var entropy = 100001231984;
            var choice = 1;
            var encryptor = new window.ditVoting.ElGamal(options.modulo, options.generator, options.publicKey);

            var verifyFunction = function (encryptedChoice) {
                {
                    var signer = new window.ditVoting.TransactionSigner();
                    var rawStoreBallotTx = signer.getSignedTransaction(options.votingId, options.districtId, encryptedChoice);
                    var rawTxHash = signer.getRawTransactionHash(rawStoreBallotTx);
                    var keyVerificationHash  = encryptor.getKeyVerificationHash();
                    var voterAddress  = signer.getAccountAddress();
                    if (rawTxHash && voterAddress && keyVerificationHash ) {
                        return true;
                    }
                    return false;
                }
            };

            encryptor.encrypt(choice, entropy)
                .then(verifyFunction).then(function (checkCryptResult) {
                isEncryptionWorks = checkCryptResult;
                return result();
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
        var $content = $(options.content);
        var template;

        if ($loader) {
            $loader.hide();
        }

        if (isModernBrowser && isEncryptionWorks) {
            if (options.successTemplate) {
                template = OPR.templater(options.successTemplate, {});
                $content.show();
            }
        } else {
            if (options.errorTemplate) {
                template = OPR.templater(options.errorTemplate, {
                    isModernBrowser: isModernBrowser,
                    isEncryptionWorks: isEncryptionWorks
                });
                $content.hide();
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
            return checkCrypt();
        } catch (e) {
            console.log(e);
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
        votingId: '5d76d43d819d89552af7d14cb491617095314bcbbabeaf327b409b313161c8aa',
        districtId: 1,
        dataToEncrypt: 42,
        ballotRegistryAddress: '0xEc125529358FAF12Db8d9011c436FDd366C3c57F',
        modulo: '61057153381611049525712420987507972698295226188515440334479048470769243616275179728418017706181664756481280113300726646266978475407690867131626444833648564312445005972715918498147586311831622706897911644067717936878490652664342409096426566269290232028997333902048030235597083496324956365429001059665426909559',
        generator: '29768758715446860401865434691229772205782663856582324592749592881124165939106969628770805064823497340240903111512298649367428100560529537211053010848207807080434362881538797156730465594873784395566853463114230437965384203754844450029416318958287819410666085150785046785582778627990620201438196523491333831624',
        publicKey: '59898322148058491772094638521953372152942384655511250649799732834377821133157224149725478829918197091230841197977068581606135116591466097832083665409471256441548891284581513585284311273332025394128148033227161847266791433599161535595385342872711238867584803432037684904625513069501030617419054057474881788768'
    };

})(jQuery);