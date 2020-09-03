<link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />

<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/base/ua-parser.min.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/dit.bundle.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/check.browser.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/landing.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>

<div class="landing">

    <div class="row">
        <div class="col-md-12 mb-4">
            <div class="dept__box js-browser-check">
                <div class="my-3 js-browser-loader">
                    <p class="mb-1 ml-1">Проверка браузера...</p>
                    <img class="popup_loader" src="{$CFG_MEDIA_HOST}/common/img/base/loader.gif" />
                </div>
            </div>
        </div>
    </div>

    <div class="poster mb-4">
        <div class="row">
            <div class="col-sm-12 col-md-8">
                {$text}
                <a class="btn btn-primary poster__btn" href="{$formUrl}">{$buttonText}</a>
            </div>
            <div class="col-md-4">
                <img class="img-fluid img d-none d-sm-none d-md-block" src="{$CFG_MEDIA_HOST}/common/img/forms/edg/logo.png" />
            </div>
        </div>
    </div>

    <script id="browser_success_template" type="text/html">
        <ul class="errors errors--sm mt-2 mb-0">
            <li>
                <i class="icon icon-status-success icon-24"></i>
                <span class="error">Ваш браузер успешно прошел проверку и готов к электронному голосованию</span>
            </li>
        </ul>
    </script>

{include file="../ballot/template_browsers.tpl"}