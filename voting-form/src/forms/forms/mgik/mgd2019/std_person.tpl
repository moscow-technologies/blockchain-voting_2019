{array vars="array('1' => 'Мужской','2' => 'Женский')" assign="gender_dict"}
{if !isset($autocomplete)}{$autocomplete = false}{/if}
{if !isset($snils_required)}{$snils_required = true}{/if}
{if isset($person)}{assign var=person_new value="$person."}{/if}
{if !$person_age}{$person_age=false}{/if}
{$age=false}

<div class="row">

    <div class="col-md-9">

        <div class="row">
            <div class="col-md-4 form-group">
                {include
                file="$base_template_path/std_blocks/std_text.tpl"
                validator="fio"
                label="Фамилия"
                required=true
                class="{$surname_class}"
                name="field[{$person_new}{$prefix}lastname{$postfix}]"
                hint="{if isset($lastname_hint)&&$lastname_hint}{$lastname_hint}{else}false{/if}"
                age=$person_age container_class="lastname {$container_class}"
                id="{$person}-lastname{$postfix}"
                maxlength="{if $maxlength_lastname}{$maxlength_lastname}{else}50{/if}"
                disabled="{(isset($disabled)&&$disabled)?'disabled':false}"
                readonly="readonly"
                autocomplete_from="{if $autocomplete}{if $child}CHILDREN:SURNAME{else}{if $complex}COMPLEX_OMS:SURNAME{else}FIO:SURNAME{/if}{/if}{/if}"
                }
            </div>
            <div class="col-md-4 form-group">
                {include file="$base_template_path/std_blocks/std_text.tpl" validator="fio" label="Имя" required=true class="{$firstname_class}" name="field[{$person_new}{$prefix}firstname{$postfix}]" hint="{if isset($firstname_hint)&&$firstname_hint}{$firstname_hint}{else}false{/if}" container_class="firstname {$container_class}" id="{$person}-firstname{$postfix}" maxlength="{if $maxlength_firstname}{$maxlength_firstname}{else}50{/if}" disabled={(isset($disabled)&&$disabled)?'disabled':false} autocomplete_from="{if $autocomplete}{if $child}CHILDREN:NAME{else}{if $complex}COMPLEX_OMS:NAME{else}FIO:NAME{/if}{/if}{/if}" readonly="readonly"}
            </div>
            <div class="col-md-4 form-group">
                {if !isset($show_moddlename_checkbox) || ! $show_moddlename_checkbox}
                    {block name="middlename_block"}
                        {include file="$base_template_path/std_blocks/std_text.tpl" validator="fio" label="Отчество" required=false  class="{$middlename_class}" name="field[{$person_new}{$prefix}middlename{$postfix}]" hint="{if isset($middlename_hint)&&$middlename_hint}{$middlename_hint}{else}false{/if}" container_class="middlename {$container_class}"
                        id="{$person}-middlename{$postfix}" maxlength="{if $maxlength_middlename}{$maxlength_middlename}{else}50{/if}"
                        disabled="{(isset($disabled)&&$disabled)?'disabled':false}"
                        autocomplete_from="{if $autocomplete}{if $child}CHILDREN:PATRONYMIC{else}{if $complex}COMPLEX_OMS:PATRONYMIC{else}FIO:PATRONYMIC{/if}{/if}{/if}"
                        readonly="readonly"
                    }
                    {/block}
                {else}
                    {include file="$base_template_path/std_mos/std_checkbox.tpl" autocomplete_from=false required=false container_class="visual_controller middlename_checkbox {$container_class}" id="{$person}.{$prefix}middlename_checkbox{$postfix}" label='Нет отчества' name="field[{if isset($middlename_checkbox_name)&&$middlename_checkbox_name}{$middlename_checkbox_name}{else}internal.{$person_new}{$prefix}middlename_checkbox{/if}{$postfix}]" value="1"}
                    {include file="$base_template_path/std_mos/std_text.tpl"  validator="fio" label="Отчество" required=false  class="{$middlename_class}" name="field[{$person_new}{$prefix}middlename{$postfix}]" hint="{if isset($middlename_hint)&&$middlename_hint}{$middlename_hint}{else}false{/if}" container_class="middlename visual visual_0 {$container_class}" id="{$person}-middlename{$postfix}" maxlength="{if $maxlength_middlename}{$maxlength_middlename}{else}50{/if}"  autocomplete_from="{if $autocomplete}{if $child}CHILDREN:PATRONYMIC{else}{if $complex}COMPLEX_OMS:PATRONYMIC{else}FIO:PATRONYMIC{/if}{/if}{/if}"}
                {/if}
            </div>
        </div>

        <div class="row">
            {if !isset($show_birthdate) || $show_birthdate}
                <div class="col-md-4 form-group">
                    {include
                    file="$base_template_path/std_blocks/std_date.tpl"
                    label="Дата рождения"
                    class="{$birthdate_class}"
                    required=true
                    name="{if $birthdate_name}{$birthdate_name}{else}field[{$person_new}birthdate{$postfix}]{/if}"
                    container_class="birthdate {$person}-birthdate {$container_class}"
                    id="{if $birthdate_id}{$birthdate_id}{else}{$person}-birthdate{/if}{$postfix}"
                    validator="date_in_past_and_now {$birthdate_validator}"
                    autocomplete_from="{($autocomplete) ? (($child) ? 'CHILDREN:BIRTHDATE' : (($complex) ? 'COMPLEX_OMS:BIRTHDATE' : 'PERSON:BIRTHDATE')) : false}"
                    disabled="{(isset($disabled)&&$disabled)?'disabled':false}"
                    hint="{if isset($birthdate_hint)&&$birthdate_hint}{$birthdate_hint}{else}false{/if}"
                    readonly="readonly"
                    }
                </div>
            {/if}

            {if !isset($show_gender) || $show_gender}
                <div class="form-group">
                    {include file="$base_template_path/std_blocks/std_radiogroup.tpl"
                        layout='horizontal'
                        items=$gender_dict label="Пол:"
                        name="field[{$person_new}gendercode{$postfix}]"
                        hint="{if isset($gender_hint)&&$gender_hint}{$gender_hint}{else}false{/if}"
                        container_class="gender {$person}-gender {$container_class}" id="{$person}-gender{$postfix}"
                        autocomplete_from="{if $autocomplete}{if $child}CHILDREN:GENDER{else}{if $complex}COMPLEX_OMS:GENDER{else}PERSON:GENDER{/if}{/if}{/if}"
                        disabled="{(isset($disabled)&&$disabled)?'disabled':false}"
                    }
                </div>
            {/if}

            {if isset($show_birthplace) || $show_birthplace}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_text.tpl"
                        class="{$birthplace_class}"
                        label="Место рождения"
                        container_class="birthplace {$person}-birthplace {$container_class}"
                        hint="{if isset($birthplace_hint)&&$birthplace_hint}{$birthplace_hint}{else}г. Ангарск{/if}"
                        required=false
                        name="field[{$person_new}new_birthplace{$postfix}]"
                        disabled="{(isset($disabled)&&$disabled)?'disabled':false}"
                        autocomplete_from="{if $autocomplete}{if $child}{else}PASSPORT_RF:BIRTHPLACE{/if}{/if}"
                        maxlength="{if $maxlength_birthplace}{$maxlength_birthplace}{else}200{/if}"
                    }
                </div>
            {/if}

            {if isset($show_home_phone) &&$show_home_phone}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_text.tpl" label="{if $phone_home_label}{$phone_home_label}{else}Домашний телефон{/if}" validator="phone_num" container_class="phone {$person}-phone {$container_class}" id="{$person}-phone{$postfix}" required=true name="field[{$person_new}phone{$postfix}]" mask="(999) 999-99-99" placeholder="(495) 123-45-67" autocomplete_from="{if $autocomplete}{if $child}{else}REG_DATA:PHONE_MP{/if}{/if}" disabled="{(isset($disabled)&&$disabled)?'disabled':false}" readonly="readonly"}
                </div>
            {/if}

            {if !isset($show_phone) || $show_phone}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_text.tpl" label="{if $phone_label}{$phone_label}{else}Контактный телефон{/if}" validator="phone_num" container_class="mobilephone {$person}-mobilephone {$container_class}" id="{$person}-mobilephone{$postfix}" required=true name="field[{$person_new}mobilephone{$postfix}]" mask="(999) 999-99-99" placeholder="(926) 123-45-67" autocomplete_from="{if $autocomplete}{if $child}{else}REG_DATA:PHONE_MP{/if}{/if}" disabled="{(isset($disabled)&&$disabled)?'disabled':false}" readonly="readonly"}
                </div>
            {/if}

            {if isset($show_work_phone) && $show_work_phone}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_text.tpl" label="{if $phone_work_label}{$phone_work_label}{else}Телефон{/if}" validator="phone_num" container_class="telephone1 {$person}-telephone1 {$container_class}" id="{$person}-telephone1{$postfix}" required=true name="field[{$person_new}telephone1{$postfix}]" mask="(999) 999-99-99" placeholder="(926) 123-45-67" autocomplete_from="{if $autocomplete}{if $child}{else}REG_DATA:PHONE_MP{/if}{/if}" disabled={(isset($disabled)&&$disabled)?'disabled':false}}
                </div>
            {/if}

            {if !isset($show_email) || $show_email}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_text.tpl" label="{if $email_label}{$email_label}{else}Адрес электронной почты{/if}" required=true name="field[{$person_new}emailaddress1{$postfix}]" validator="email" container_class="emailaddress1 {$person}-emailaddress {$container_class}" id="{$person}-emailaddress{$postfix}" placeholder="login@mail.ru" maxlength="100" autocomplete_from="{if $autocomplete}{if $child}{else}REG_DATA:EMAIL{/if}{/if}" disabled={(isset($disabled)&&$disabled)?'disabled':false}}
                </div>
            {/if}

            {if isset($show_inn) && $show_inn}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_blocks/std_text.tpl" class="type_inn_ip" label="ИНН" name="field[{$person_new}new_inn{$postfix}]" required=true minlength="12" maxlength="12" mask="999999999999" container_class="inn {$person}-inn {$container_class}" validator="inn_fiz"}
                </div>
            {/if}

            {if !isset($show_snils) || $show_snils}
                <div class="col-md-4 mb-3">
                    {include file="$base_template_path/std_mos/std_text.tpl"
                    label="СНИЛС"
                    required=$snils_required
                    name="field[{$person_new}new_snils{$postfix}]"
                    container_class="snils {$person}-snils {$container_class}"
                    id="{$person}-snils{$postfix}"
                    mask="999-999-999 99"
                    autocomplete_from="{if $autocomplete}{if $child}CHILDREN:SNILS_NUMBER{else}SNILS:SNILS{/if}{/if}"
                    disabled="{(isset($disabled)&&$disabled)?'disabled':false}"
                    readonly="readonly"
                    }
                </div>
            {/if}
        </div>

        {include file="$base_template_path/std_blocks/std_hidden.tpl"
            name="field[{$person_new}gendercode{$postfix}]"
            id="{$person}-gender{$postfix}"
            required=false
            value="{$profile.gender}"
        }

    </div>

    <div class="col-md-3">
        <p>Если вам необходимо изменить данные, перейдите в <a href="{$elk_host}/my/#profile">Личный кабинет</a> и внесите изменения в данные своего профиля.</p>
    </div>

</div>