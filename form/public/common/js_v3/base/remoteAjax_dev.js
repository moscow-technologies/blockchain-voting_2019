// настройки и константы
var mpguDomain = 'http://release.mpgu.srvdev.ru/';


// объект для кросс-доменного обмена данными с МПГУ
var remoteAjax = new easyXDM.Rpc(
    { remote: mpguDomain + 'common/xdm/index.html.php?tmp='+(+new Date()) },
    { remote: { request: {} },
        serializer: {
            parse: function(string) {
                return JSON.parse(string);
            },
            stringify: function(object) {
                return JSON.stringify(object);
            }
        }
    }
);