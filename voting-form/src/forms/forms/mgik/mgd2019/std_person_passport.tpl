{if !isset($document_date_validator)||(isset($document_date_validator)&&!$document_date_validator)}

	{if !empty($birthdate_field)}
		{assign var="document_date_validator" value=" date_linked_doc_passport|{$birthdate_field}"}
	{elseif preg_match("/file\.[0-9]+|file\.<%[^%]+%>/", $contact)}
		{assign var="document_date_validator" value=" date_linked_doc_passport|field[{$contact|replace:'file.':'filefields.'}.contact.birthdate]"}
	{else}
		{assign var="document_date_validator" value=" date_linked_doc_passport|field[{$contact}.birthdate]"}
	{/if}
{else}
	{assign var="document_date_validator" value=$document_date_validator}
{/if}
{if !isset($portalid)}{assign var="portalid" value=false}{/if}
{assign var="container_class" value=""}

<div class="row">
	<div class="col-md-12">
		<div class="row">
			<div class="col-md-4 mb-3">
				{include
					file="$base_template_path/std_blocks/std_text.tpl"
					label="Серия и номер"
					required=true
					name="field[declarant.serial_number]"
					hint="4510 123456"
					container_class="{$document_container_class}"
					autocomplete_from="PASSPORT_RF:NUMBER"
					readonly="readonly"
				}
				{* TODO *}
				{* {include file="$base_template_path/std_blocks/std_serial_number.tpl" label="Серия и номер" serial_required=true hint="4510 123456" serial_class='document_serial' number_class='document_number' serial_minlength=4 serial_maxlength=4 serial_mask="9999" number_minlength=6 number_maxlength=6 number_mask="999999" required=true id="{$contact}Series" number_id="{$contact}Number{$postfix}" container_id="row{$contact}new_passport_serie{$postfix}" serial_name="field[{$contact}.new_{if $v6}serie{else}passport_serie{/if}{$postfix}]" number_required=true number_container_id="row{$contact}new_passport{$postfix}" number_name="field[{$contact}.new_{if $v6}name{else}passport{/if}{$postfix}]" autocomplete_from={($autocomplete)?(($child)?"CHILDREN:BIRTH_CERT_NUMBER":"PASSPORT_RF:NUMBER"):""}} *}
			</div>

            {if !isset($no_date)||!$no_date}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_date.tpl"
                        label="Дата выдачи" class="document_date"
                        required=true hint="17.06.2000"
                        id="{$contact}Date{$postfix}"
                        container_id="row{$contact}new_passport_date{$postfix}" name="field[{$contact}.new_{if $v6}docdate{else}passport_date{/if}{$postfix}2]"
                        validator="date_in_past_and_now {$document_date_validator}"
                        autocomplete_from="{($autocomplete)?(($child)?'CHILDREN:BIRTH_CERT_DATE':"PASSPORT_RF:ISSUED_ON"):""}"
                        container_class="{$document_container_class}"
                        readonly="readonly"
                    }
                </div>
            {/if}

            {if !$no_ovdcode}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_text.tpl"
                        class="document_ovdcode"
                        label="Код подразделения"
                        mask="999-999"
                        hint="111-222"
                        required=true
                        id="{$contact}DivisionCode{$postfix}"
                        container_id="row{$contact}new_divisioncode{$postfix}"
                        name="field[{$contact}.new_divisioncode{$postfix}2]"
                        autocomplete_from="{($autocomplete)?(($child)?'CHILDREN:DIVISION_CODE':"PASSPORT_RF:DIVISION_CODE"):""}"
                        container_class="{$document_container_class}"
                        readonly="readonly"
                    }
                </div>
            {/if}

            {if !isset($no_place)||!$no_place}
                <div class="col-md-8 mb-6">
                    {include file="$base_template_path/std_blocks/std_text.tpl"
                        label="Кем выдан" class="document_place"
                        validator="{$no_place_validator}"
                        required=true
                        hint="ОУФМС города Москвы по району Академический"
                        container_id="row{$contact}new_passport_place{$postfix}"
                        name="field[{$contact}.new_{if $v6}whosign{else}passport_place{/if}{$postfix}2]"
                        maxlength="250"
                        autocomplete_from="{($autocomplete)?(($child)?'CHILDREN:BERTH_CERT_ISSUED_BY':"PASSPORT_RF:ISSUED_BY"):""}"
                        container_class="{$document_container_class}"
                        readonly="readonly"
                    }
                </div>
            {/if}

            {if !$no_birthday}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_date.tpl" class="document_birthdate" label="Дата рождения" hint="11.01.1963" required=true id="{$contact}.birth_date{$postfix}" name="field[{$contact}.birthdate{$postfix}]" validator="date_in_past_and_now" autocomplete_from={($autocomplete)?"PERSON:BIRTHDATE":""}}
                </div>

                {if !$no_birthplace}
                    <div class="col-md-4 mb-3">
                        {include file="$base_template_path/std_blocks/std_text.tpl" class="document_birthdateplace" validator="main_ru" label="Место рождения" hint="{if isset($birthplace_hint)&&$birthplace_hint}{$birthplace_hint}{else}г. Ангарск{/if}" required=true id="{$contact}BirthPlace{$postfix}" name="{if isset($birthplace_name)&&$birthplace_name}field[{$contact}.{$birthplace_name}]{else}field[{$contact}.new_birthplace{$postfix}]{/if}" autocomplete_from={($autocomplete)?"PASSPORT_RF:BIRTHPLACE":""} maxlength=200 readonly="readonly"}
                    </div>
                {/if}
            {else}
                {if isset($no_birthplace) && !$no_birthplace}
                    <div class="col-md-4 mb-3">
                        {include file="$base_template_path/std_blocks/std_text.tpl"
                            class="document_birthdateplace"
                            validator="main_ru"
                            label="Место рождения"
                            hint="{if isset($birthplace_hint)&&$birthplace_hint}{$birthplace_hint}{else}г. Ангарск{/if}"
                            required=false id="{$contact}BirthPlace{$postfix}"
                            name="{if isset($birthplace_name)&&$birthplace_name}field[{$contact}.{$birthplace_name}]{else}field[{$contact}.new_birthplace{$postfix}]{/if}"
                            autocomplete_from={($autocomplete)?(($child)?'':"PASSPORT_RF:BIRTHPLACE"):""}
                            maxlength=200
                            container_class="{$document_container_class}"
                            readonly="readonly"
                        }
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>


<div class="row">
	<div class="col-md-12">
{if $validityperiod}
	{include file="$base_template_path/std_blocks/std_date.tpl" label="Срок действия" class="document_validityperiod" required=true id="{$contact}Validityperiod{$postfix}" container_id="row{$contact}new_validityperiod{$postfix}" name="field[{$contact}.new_validityperiod{$postfix}]" validator="date_in_future"}
{/if}

{if $photo_info_text}
	{include file="$base_template_path/std_blocks/std_infoblock.tpl" container_class="document_info" color="orange" text=$photo_info_text}
	{/if}
{if !$no_photo}

	{if !$one_photo}
		{include file="$base_template_path/std_blocks/std_file.tpl" class="document_photopage" label="Страница паспорта с фотографией" required=!$free_photo name="field[{$contact}.0.contact_annotation.1.documentbody{$postfix}]" hint="Прикрепите электронный образ документа"}
		{include file="$base_template_path/std_blocks/std_file.tpl" class="document_regpage" label="{if $regpage_label}{$regpage_label}{else}Страница паспорта с адресом регистрации{/if}" required=!$free_photo name="field[{$contact}.0.contact_annotation.2.documentbody{$postfix}]" hint="Прикрепите электронный образ документа"}
	{else}
		{include file="$base_template_path/std_blocks/std_file.tpl" class="document_ebody" label="{if $photo_label}{$photo_label}{else}Электронный образ{/if}" required=!$free_photo name="field[{$contact}.0.contact_annotation.1.documentbody{$postfix}]" hint="{if $photo_hint}{$photo_hint}{else}Прикрепите электронный образ документа{/if}"}
	{/if}
{/if}


{if $document}
	{if !isset($document_no_file)}{assign var="document_no_file" value=false}{/if}
	{if !isset($document_kind)}{assign var="document_kind" value='20001'}{/if}
	{if !isset($document_send_index)}{assign var="document_send_index" value=true}{/if}
	{if !$document_no_file}<input type="hidden" name="field[internal.staff][]" value="{$container_id}_ebody${$contact}.new_doctype">{/if}
	{if $document_radio_name}
		<div class="{$document_radio_class}">
		{$document_out_data=true}
		{if !isset($document_radio_show)}{assign var="document_radio_show" value='1'}{/if}
		{include file="$base_template_path/std_blocks/std_radiogroup.tpl"
			items=['1'=>'Да','0'=>'Нет'] name=$document_radio_name container_class="visual_controller {$document_radio_class}" label="{if $document_radio_label}{$document_radio_label}{else}Прикрепить документ?{/if}" label_position="top" layout='horizontal' required=true}
	
		{include file="$base_template_path/std_blocks/std_document.tpl"
					label="{if $document_label}{$document_label}{else}Электронный образ{/if}"
					class=$document_class
					container_id="{$container_id}_ebody{$postfix}"
					container_class="document_ebody {if $document_radio_name}visual visual_{$document_radio_show} hidden{/if}"
					required=!$free_photo
					document_index=$document_index
					send_index=$document_send_index
					document_kind=$document_kind
					portalid=false
					out_data=$document_out_data
					no_file=$document_no_file
					hint_header="Какого формата необходим файл?" hint_text=$document_format}
			{if $document_info}
				{include file="$base_template_path/std_blocks/std_infoblock.tpl" container_class="{if $document_radio_name}visual visual_{$document_radio_show} hidden{/if}" color="orange" text=$document_info}
			{/if}
		</div>
	{else}
		{include file="$base_template_path/std_blocks/std_document.tpl"
					label="{if $document_label}{$document_label}{else}Электронный образ{/if}"
					class=$document_class
					container_id="{$container_id}_ebody{$postfix}"
					container_class="document_ebody {if $document_container_class}{$document_container_class}{/if} "
					required=!$free_photo
					document_index=$document_index
					send_index=$document_send_index
					document_kind=$document_kind
					portalid=false
					out_data=$document_out_data
					no_file=$document_no_file
					hint_header="Какого формата необходим файл?" hint_text=$document_format}
		{if $document_info}
			{include file="$base_template_path/std_blocks/std_infoblock.tpl" container_class="{if $document_container_class}{$document_container_class}{/if}" color="orange" text=$document_info}
		{/if}
	{/if}
{/if}
	
	</div>
</div>
