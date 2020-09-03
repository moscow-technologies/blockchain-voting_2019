// настройки и константы

if (typeof mpguDomain==="undefined") {
	if (!document.location.search.match(/domain=dev/)) {
		var mpguDomain = 'https://www.mos.ru/pgu/';
	}
	else var mpguDomain = 'http://release.mpgu.srvdev.ru/';
}

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