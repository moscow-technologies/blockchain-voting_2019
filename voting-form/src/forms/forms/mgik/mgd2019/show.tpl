<link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />

<script type="text/javascript"> var lkProfile = {$profile|@json_encode}; </script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/jquery/monthpicker.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/fias.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/base/ua-parser.min.js"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/check.browser.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/mgd2019.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>

{include file="$base_template_path/std_head_service.tpl" faq="{$CFG_MAIN_HOST}/ru/faq/?subject=$faq" download_app_file_enabled = false has_additional_legals=false}

<div class="prototype">Прототип</div>

<div class="mb-4">
    <img src="{$CFG_MEDIA_HOST}/common/img/forms/mgik/mgd2019/remote_voting.jpg" alt="" class="remote-voting" />
</div>

<form id="form_element" class="pinned-container" name="form" method="post" action="" enctype="multipart/form-data">
    <input type="hidden" name="org_id" value="{$org_id}">
    <input type="hidden" name="form_id" value="{$form_id}">
    <input type="hidden" name="action" value="send">
    <input type="hidden" name="step" value="{$load_app_step}">
    <input type="hidden" name="uniqueFormHash" value="{$uniqueFormHash}">

    {array vars="array(
      '1' => 'Паспорт гражданина РФ',
    )"
    assign="document_types"}

	<fieldset class="step form-step step-readonly pb-0">
		<div class="step__title">Заполнение данных заявления</div>
		<fieldset class="form-block declarant_block">
			<h3>Сведения о заявителе</h3>
            {include file="$base_template_path/mgik/mgd2019/std_person.tpl"
                autocomplete=true
                person="declarant"
                required=true
                show_birthdate=true
                show_snils=true
                show_email=false
                show_gender=false
            }

			<h3 class="mt-2">Сведения о документе, удостоверяющем личность заявителя</h3>
            {include file="$base_template_path/mgik/mgd2019/std_person_document.tpl"
                autocomplete=true
                contact="declarant"
                required=true
                defaultDocType=1
                no_birthday=true
                no_birthplace=false
                no_photo=true
                no_ovdcode=false
            }
		</fieldset>

		<fieldset class="form-block">
			<h3 class="mt-2">Адрес регистрации</h3>
            {include file="$base_template_path/std_blocks/std_infoblock.tpl"
                color="orange"
                container_class="visual visual_0"
                text='Обращаем Ваше внимание, что для поиска по справочнику требуется ввести минимум три символа.'
            }

            <div class="fias_custom">
                {include file="$base_template_path/mgik/mgd2019/std_fias.tpl"
                    id='kladr_1'
                    contact='declarant'
                    addressType='1'
                    container_class="visual"
                    validateFlat=true
                }
            </div>

		</fieldset>

        <fieldset class="form-block">
            <h3 class="mt-2">Порядок проведения дистанционного электронного голосования</h3>

            {include file="$base_template_path/std_blocks/std_infoblock.tpl"
                color="orange"
                container_class="visual visual_0"
                text='Текст с информацией о порядке проведения дистанционного электронного голосования'
            }

            {include file="$base_template_path/std_mos/std_checkbox.tpl"
                id="is_agree"
                name="field[declarant.new_is_agree]"
                value="1"
                required=true
                label="Я подтверждаю, что ознакомлен с порядком проведения дистанционного электронного голосования на выборах депутатов Московской городской Думы седьмого созыва"
            }
        </fieldset>

	</fieldset>

    {include file="$base_template_path/std_blocks/std_form_controls.tpl"
        button_name="Отправить заявление"
    }

</form>

{include file="$base_template_path/mgik/mgd2019/templates.tpl"}