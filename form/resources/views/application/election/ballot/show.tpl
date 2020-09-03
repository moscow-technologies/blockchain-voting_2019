<link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/base/ua-parser.min.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/dit.bundle.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/check.browser.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/mgd-golosovanie.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/das.obf.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}" async></script>

{include file="$base_template_path/std_head_service.tpl" faq="{$CFG_MAIN_HOST}/ru/faq/?subject=$faq" download_app_file_enabled = false has_additional_legals=false}
<script type="text/javascript">
    $(document).ready(function () {
        MPGU.FORM.VOITINGID = {if $voitingId}{$voitingId}{else}0{/if};
    });
</script>
<div class="row">

    <div class="electform">
        <div class="dept__box js-browser-check">
            <div class="my-3 js-browser-loader">
                <p class="mb-1 ml-1">Проверка браузера...</p>
                <img class="popup_loader" src="{$CFG_MEDIA_HOST}/common/img/base/loader.gif" />
            </div>
        </div>

        <form id="form_element" class="pinned-container" name="form" method="post" action="" enctype="multipart/form-data">
            <input type="hidden" name="org_id" value="{$org_id}">
            <input type="hidden" name="form_id" value="{$form_id}">
            <input type="hidden" name="action" value="send">
            <input type="hidden" name="step" value="{$load_app_step}">
            <input type="hidden" name="uniqueFormHash" value="{$uniqueFormHash}">

            <fieldset class="step form-step step-readonly">

                <legend>Подтверждение участия</legend>

                <fieldset class="form-block">

                    <p>
                        Для подтверждения участия в голосовании введите код подтверждения. <a href="#" data-toggle="collapse" data-target="#election-info">Подробнее</a>
                    </p>

                    <p class="collapse" id="election-info">
                       {$about}
                    </p>
                    {if $confirmType == 'sms'}
                    {include file="$base_template_path/std_blocks/std_text.tpl"
                    vid="sms"
                    label="Телефон"
                    confirmText='Телефон успешно подтвержден.'
                    class="needConfirm"
                    required=true
                    name="field[declarent.telephone1]"
                    mask="(999) 999-99-99"
                    value=$client.TELEPHONE
                    readonly=true
                    container_class="disabled"
                    disabled=true}
                    {else}

                    {include file="$base_template_path/std_blocks/std_text.tpl"
                    id="emailBox"
                    class="needConfirm email"
                    label="Адрес электронной почты"
                    required=true
                    confirmText='Почта успешно подтверждена.'
                    name="field[new_person2_mail]"
                    readonly=true
                    value=$client.EMAIL
                    maxlength="250"
                    validator="email"
                    vid="email"
                    disabled=true}
                    {/if}

                    <div class="form-buttons">
                        <a href="#" class="btn btn-primary btn-lg my-4 js-get-code">Запросить код подтверждения</a>
                    </div>

                    <div class="vote-block hidden">

                        <h4 class="mt-4">Порядок проведения дистанционного электронного голосования</h4>

                        <div class="form-infobox visual visual_0 orange">
                          {$rules}
                        </div>

                        {include file="$base_template_path/std_mos/std_checkbox.tpl"
                        id="is_agree"
                        name="field[declarant.new_is_agree]"
                        value="1"
                        required=true
                        label="{$agreement}"
                        }

                        <a href="#" class="btn btn-primary btn-lg mt-3 js-show-vote-popup">{$buttonVote}</a>

                    </div>

                </fieldset>

            </fieldset>
        </form>

    </div>

    <div class="col-md-5 logo">
        <img src="{$CFG_MEDIA_HOST}/common/img/forms/edg/logo.png" alt="" class="elections" />
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

<script id="vote_start_confirm" type="text/html">
    <p>{$messageVoteStart}</p>

    <div class="popup-buttons text-left">
        <a href="#" class="button blue js-start-vote">Получить бюллетень</a>
        <a href="#" class="button blue button-cancel js-cancel-vote">Отменить</a>
    </div>
</script>

<script id="sending_popup" type="text/html">
    <p>Вы перенаправляетесь на страницу бюллетеня.</p>

    <div class="text-center my-3">
        <img class="popup_loader" src="{$CFG_MEDIA_HOST}/common/img/base/loader.gif" />
    </div>

    <p class="popup_error text-center hidden">
        При подаче заявления произошла ошибка.<br />
        Попробуйте <a href="#" class="btn-close-pop">закрыть окно</a> и отправить заявление снова
    </p>
</script>

{include file="./template_browsers.tpl"}
