{include file="$base_template_path/std_head_service.tpl" faq="#" special=false}

<form id="form_element" name="form" method="post" action="" enctype="multipart/form-data">
    <input type="hidden" name="org_id" value="{$org_id}"/>
    <input type="hidden" name="form_id" value="{$form_id}"/>
    <input type="hidden" name="action" value="send"/>
    <input type="hidden" name="uniqueFormHash" value="{$uniqueFormHash}"/>
    <input type="hidden" name="app_id" value="{$app_id}">
    <input type="hidden" name="revocation" value="1">
    <input type="hidden" name="field[internal.status]" value="{$status_code}">
    <input type="hidden" name="field[internal.revocation]" value="1">

    <fieldset class="form-step mt-5">
        <legend>Отзыв заявления</legend>

        <fieldset class="form-block">
            <div class="form-infobox orange">
                Этим действием Вы подтверждаете, что хотите отозвать свое заявление на включение вас в список
                избирателей для дистанционного электронного голосования на выборах депутатов Московской городской
                Думы. После отзыва заявления вернуть его в работу будет невозможно. Оформление нового заявления на
                включение в список избирателей для дистанционного электронного голосования на выборах депутатов
                Московской городской Думы будет возможно через сутки.
            </div>

            {include file="$base_template_path/std_mos/std_checkbox.tpl"
                label='Подтверждаю, что я ознакомился с условиями отзыва и хочу отозвать свое заявление'
                id="cb1" name="fields[internal.revocation]"
                value='1'
                container_class="revocation_check"
                required=true
            }

            {include file="$base_template_path/revocation_required_fields.tpl"}
        </fieldset>

    </fieldset>

    {include file="$base_template_path/std_blocks/std_form_controls.tpl"}

</form>


<script type="text/javascript">
    var sc = false;
    $(document).ready(function() {
        sc = new FormController(0, {
            skipAgreement: true,
            finishButtonText: 'Отозвать заявление'
        });
    });
</script>