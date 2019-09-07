<link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/base/ua-parser.min.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/dit.bundle.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/check.browser.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/mgd-golosovanie.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/das.obf.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}" async></script>
<script type="text/javascript" src="{$security_js}"></script>

{include file="$base_template_path/std_head_service.tpl" faq="{$CFG_MAIN_HOST}/ru/faq/?subject=$faq" download_app_file_enabled = false has_additional_legals=false}

<div class="row">

    <div class="col-md-7">

        <div class="my-3 js-loader">
            <p class="mb-1 ml-1">Проверка браузера...</p>
            <img class="popup_loader" src="{$CFG_MEDIA_HOST}/common/img/base/loader.gif" />
        </div>

        <form id="form_element" class="pinned-container hidden" name="form" method="post" action="" enctype="multipart/form-data">
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
                        Вы перешли на форму дистанционного электронного голосования на выборах депутатов Московской городской Думы седьмого созыва.
                        Это означает, что Вы подавали заявление и были включены в Реестр избирателей для дистанционного электронного голосования.
                        Для продолжения Вам необходимо подтвердить свою личность. Для этого необходимо запросить код подтверждения в sms-сообщении и
                        ввести его на форме. В случае успешного подтверждения Вы будете перенаправлены на страницу бюллетеня для голосования.
                        Обращаем внимание, что голосование осуществляется анонимно. Портал обеспечивает обезличивание учетной записи при переходе на форму бюллетеня
                    </p>

                    {include file="$base_template_path/std_blocks/std_text.tpl"
                        vid="phone"
                        label="Телефон"
                        class="needConfirm"
                        required=true
                        name="field[declarent.telephone1]"
                        mask="(999) 999-99-99"
                        autocomplete_from="REG_DATA:PHONE_MP"
                        container_class="disabled"
                        disabled=true
                    }

                    <div class="form-buttons">
                        <a href="#" class="btn btn-primary btn-lg my-4 js-get-code">Запросить код подтверждения</a>
                    </div>

                    <div class="vote-block hidden">

                        <h4 class="mt-4">Порядок проведения дистанционного электронного голосования</h4>

                        <a href="{$CFG_MEDIA_HOST}/common/forms/mgik/bulletin_example_{$district}.pdf" class="btn btn-primary btn-lg mt-0 mb-4"  target="_blank"
                           title="Посмотреть пример бюллетеня в новом окне">Посмотреть пример бюллетеня</a>

                        <div class="form-infobox visual visual_0 orange">
                            <ul>
                                <li>Голосование проводится с 8.00 до 20.00;</li>
                                <li>Вы можете проголосовать только один раз;</li>
                                <li>Ваш голос будет учтен, только если Вы нажмете кнопку "Проголосовать" на странице электронного бюллетеня;</li>
                                <li>После того, как Вы будете перенаправлены на страницу электронного бюллетеня для голосования, у Вас будет 15 минут для того, чтобы осуществить свой выбор;</li>
                                <li>Электронный бюллетень выдается только один, при попытке обновить страницу (кнопка F5) или если Вы закроете вкладку, Ваш голос учтен не будет и получить бюллетень повторно будет невозможно;</li>
                                <li>Проверьте, чтобы Ваше интернет-соединение было стабильно, в случае, если при загрузке электронного бюллетеня у Вас прервется соединение, Ваш голос учтен не будет;</li>
                                <li>Если Вы голосуете с мобильного телефона, советуем отключить подключение к wi-fi сетям;</li>
                                <li>Настоящим согласием Вы подтверждаете, что действуете осознанно, самостоятельно, не находитесь под чужим давлением и ознакомлены с порядком проведения дистанционного электронного голосования на выборах депутатов Московской городской Думы седьмого созыва</li>
                            </ul>
                        </div>

{*                        <div class="form-infobox visual visual_0 orange">*}
{*                            <ul>*}
{*                                <li>С 24 июля по 4 сентября включительно проводится прием заявлений граждан на включение в список избирателей для дистанционного электронного голосования</li>*}
{*                                <li>В указанный период Вы можете менять свое мнение (подавать заявление на включение или отзывать заявление), но не чаще 1 раза в сутки</li>*}
{*                                <li>Включение в список избирателей для дистанционного электронного голосования производится по результатам межведомственных проверок сведений, указанных в личном кабинете и в заявлении. В случае, если Вам придет отказ во включении в список электронных избирателей, детализацию причины отказа можно посмотреть в <a href="https://beta-my.mos.ru/my/#/settings/applications" target="blank">разделе Заявки</a> или обратиться в службу технической поддержки за разъяснением</li>*}
{*                                <li>За день до дня голосования Вам будет направлен финальный статус с подтверждением Вашего активного избирательного права в день голосования и приглашение проголосовать электронно на выборах 8 сентября</li>*}
{*                                <li>Настоящим согласием Вы подтверждаете, что действуете осознанно, не находитесь под чужим давлением и ознакомлены с Положением о порядке дистанционного электронного голосования на выборах депутатов Московской городской Думы седьмого созыва</li>*}
{*                            </ul>*}
{*                        </div>*}

                        {include file="$base_template_path/std_mos/std_checkbox.tpl"
                            id="is_agree"
                            name="field[declarant.new_is_agree]"
                            value="1"
                            required=true
                            label="Я подтверждаю, что ознакомлен с условиями выше и <a href='http://mosgorizbirkom.ru/documents/10279/18786919/rs_102_3+(%D0%9F%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%201).pdf/ac597e7d-ae51-4c29-bac3-206f5bd36db3' target='_blank'>порядком проведения</a> дистанционного электронного голосования на выборах депутатов Московской городской Думы седьмого созыва."
                        }

{*                        {include file="$base_template_path/std_mos/std_checkbox.tpl"*}
{*                            id="is_agree"*}
{*                            name="field[declarant.new_is_agree]"*}
{*                            value="1"*}
{*                            required=true*}
{*                            label="Я подтверждаю, что ознакомлен с <a href='http://mosgorizbirkom.ru/documents/10279/18786919/rs_102_3+(%D0%9F%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%201).pdf/ac597e7d-ae51-4c29-bac3-206f5bd36db3' target='_blank'>порядком проведения</a> дистанционного электронного голосования на выборах депутатов Московской городской Думы седьмого созыва"*}
{*                        }*}

                        <a href="#" class="btn btn-primary btn-lg mt-3 js-show-vote-popup">Приступить к голосованию</a>

                    </div>

                </fieldset>

            </fieldset>
        </form>

    </div>

    <div class="col-md-5">
        <img src="{$CFG_MEDIA_HOST}/common/img/forms/mgik/mgd-golosovanie/elections.png" alt="" class="elections" />
    </div>
    
</div>

{include file="$base_template_path/mgik/mgd-golosovanie/templates.tpl"}