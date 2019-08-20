<link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/base/ua-parser.min.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/check.browser.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/mgd-golosovanie.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>

{include file="$base_template_path/std_head_service.tpl" faq="{$CFG_MAIN_HOST}/ru/faq/?subject=$faq" download_app_file_enabled = false has_additional_legals=false}

<div class="prototype">Прототип</div>

<div class="row">

    <div class="col-md-7">

        <form id="form_element" class="pinned-container" name="form" method="post" action="" enctype="multipart/form-data">
            <input type="hidden" name="org_id" value="{$org_id}">
            <input type="hidden" name="form_id" value="{$form_id}">
            <input type="hidden" name="action" value="send">
            <input type="hidden" name="step" value="{$load_app_step}">
            <input type="hidden" name="uniqueFormHash" value="{$uniqueFormHash}">

            <fieldset class="step form-step step-readonly">

                <div class="step__title">Подтверждение участия</div>

                <fieldset class="form-block">

                    <p>
                        Для подтверждения участия в голосовании введите код подтверждения. <a href="#" data-toggle="collapse" data-target="#election-info">Подробнее</a>
                    </p>

                    <p class="collapse" id="election-info">
                        Вы перешли на форму голосования на выборах депутатов Московской городской Думы седьмого созыва.
                        Это означает, что вы подавали заявление и были включены в Реестр избирателей для дистанционного электронного голосования.
                        Для продолжения вам необходимо подтвердить свою личность. Для этого необходимо запросить код подтверждения в SMS-сообщении и ввести
                        его не форме. В случае успешного подтверждения вы будете перенаправлены на страницу бюллетеня для голосования.
                        Обращаем внимание, что голосование осуществляется анонимно. Портал обеспечивает обезличивание учетной записи при переходе на форму бюллетеня</p>
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
                        <a href="#" class="button blue js-get-code">Запросить код подтверждения</a>
                    </div>

                    <div class="vote-block hidden">

                        <h4 class="mt-4">Порядок проведения дистанционного электронного голосования</h4>

                        <a href="{$CFG_MEDIA_HOST}/common/forms/mgik/bulletin_example_{$district}.pdf" class="button blue mt-0"  target="_blank"
                           title="Посмотреть пример бюллетеня в новом окне">Посмотреть пример бюллетеня</a>

                        {include file="$base_template_path/std_blocks/std_infoblock.tpl"
                            color="orange"
                            container_class="visual visual_0"
                            text='Текст с информацией о порядке проведения дистанционного электронного голосования Текст с информацией о порядке проведения дистанционного электронного голосования Текст с информацией о порядке проведения дистанционного электронного голосования Текст с информацией о порядке проведения дистанционного электронного голосования Текст с информацией о порядке проведения дистанционного электронного голосования'
                        }

                        {include file="$base_template_path/std_mos/std_checkbox.tpl"
                            id="is_agree"
                            name="field[declarant.new_is_agree]"
                            value="1"
                            required=true
                            label="Я подтверждаю, что ознакомлен с порядком проведения дистанционного электронного голосования на выборах депутатов Московской городской Думы седьмого созыва"
                        }

                        <a href="#" class="button blue mt-3 js-show-vote-popup">Приступить к голосованию</a>

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