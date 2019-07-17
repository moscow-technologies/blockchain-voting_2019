{if !isset($autocomplete)}{$autocomplete = false}{/if}
{if !isset($child)}{$child = false}{/if}
{if !$defaultDocType}{$defaultDocType=1}{/if}
{if !$contact}{$contact = "declarant"}{/if}
{if !$docTypeList}{$docTypeList = "passportOnly"}{/if}
{if $docTypeList == 'full' && !isset($document_types)}
	{array vars="array(
		'1' => 'Паспорт гражданина РФ',
		'2' => 'Военный билет',
		'3' => 'Удостоверение личности офицера',
		'4' => 'Справка об освобождении из мест лишения свободы',
		'5' => 'Паспорт иностранного образца',
		'6' => 'Паспорт моряка',
		'7' => 'Вид на жительство в РФ',
		'8' => 'Удостоверение беженцев РФ',
		'9' => 'Временное удостоверение личности гражданина РФ',
		'10' => 'Разрешение на временное проживание',
		'11' => 'Документ, удостоверяющий личность лица без гражданства',
		'12' => 'Документ, удостоверяющий личность иностранного гражданина',
		'13' => 'Паспорт гражданина СССР',
		'14' => 'Свидетельство о регистрации ходатайства иммигранта о признании его беженцем',
		'15' => 'Удостоверение личности моряка',
		'16' => 'Заграничный паспорт',
		'17' => 'Свидетельство о рождении',
		'18' => 'Свидетельство о рождении иностранного образца',
		'19' => 'Удостоверение личности военнослужащего'
	)" 
assign="document_types"}
{/if}
{if !$wrapper}{$wrapper = "fieldset"}{/if}

<{$wrapper} {if $autocomplete}data-autocomplete{/if} class="{if $wrapper=="fieldset"}form-block {/if}person-document {$contact}_passport_data{if isset($container_class)} {$container_class}{/if}"{if isset($container_id)} id="{$container_id}{$postfix}"{/if}>
	{if isset($title)&&$title}
		<legend>{$title}</legend>
	{/if}
	{if $portalid}
		{if $contact=='declarant'||$contact=='trustee'||$contact=='account'}
			<input type="hidden" name="field[{$contact}.new_portalid]" value="{$portalid}">
		{else}
			<input type="hidden" name="field[filefields.{$contact|regex_replace:"/.*?\.(<%=FormController\.file_index%>)/":"$1"|regex_replace:"/.*?\.([0-9]+)/":"$1"}.contact.new_portalid]" value="{$portalid}">
		{/if}
	{/if}
	{if $send_index}<input type="hidden" name="field[{$contact}.index]" value="{$contact|regex_replace:"/.*?\.([0-9]+)/":"$1"}">{/if}
	{block name="add_blocks"}{/block}
	{if $docTypeList == 'full'}
		{include file="$base_template_path/std_blocks/std_select.tpl" label="Тип документа" required=true class="valid doc-type-select save_passport_rf" container_class="valid {$doc_type_select_class}" items=$document_types name="field[{$contact}.new_doctype{$postfix}]" value=$defaultDocType no_empty=true}
		<div class="document-type-container document-type-other">
			{include file="$base_template_path/mgik/mgd2019/std_person_passport.tpl" child=$child contact="{$contact}" no_ovdcode={$no_ovdcode} no_birthday={$no_birthday} no_photo={$no_photo} one_photo={$one_photo} free_photo={$free_photo} autocomplete=$autocomplete}
		</div>
	{else}
		{include file="$base_template_path/std_blocks/std_label.tpl" container_class='doc-type-select-label' required=true label="Тип документа" name="field[{$contact}.new_doctype{$postfix}]" value="1" text="Паспорт гражданина РФ"}
        <div class="document-type-container document-type-other">
            {include file="$base_template_path/mgik/mgd2019/std_person_passport.tpl"
                child=$child no_place_validator="main_ru"
                contact="{$contact}"
                no_ovdcode={$no_ovdcode}
                no_birthday={$no_birthday}
                no_photo={$no_photo}
                one_photo={$one_photo}
                free_photo={$free_photo}
                autocomplete=$autocomplete
                disabled=$disabled
                document_container_class=$document_container_class
            }
        </div>
	{/if}
</{$wrapper}>
