(function($) {

    $.checkBrowser = function (options) {
        var parser = new UAParser();
        var browser = parser.getBrowser();
        var browserName = browser.name.toLowerCase();
        var browserVersion = browser.major;
        var result = false;

        options = $.extend({}, $.checkBrowser.defaults, options);

        $.each(options.allow, function (allowName, allowVersion) {
            if (browserName === allowName && browserVersion >= allowVersion) {
                result = true;

                return false;
            }
        });

        return result;
    };

    $.checkBrowser.defaults = {
        allow: {
            'chrome': 37,
            'firefox': 34,
            'opera': 24,
            'edge': 12,
            'safari': 11,
            'mobile safari': 11
        }
    };

})(jQuery);