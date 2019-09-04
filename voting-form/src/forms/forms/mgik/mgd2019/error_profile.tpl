{extends file="$base_template_path/error.tpl"}

{block name="message_header"}Заявление не может быть подано.{/block}

{block name="message_add_text"}

    <link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />

    {assign var=messages value=[
        'age' => 'На день голосования вам будет 18 лет',
        'isConfirmed' => 'Вы подтвердили свою учетную запись в МФЦ',
        'gender' => 'Указан пол в Личном кабинете',
        'passport' => 'Данные вашего паспорта проверены в Личном кабинете',
        'regAddress' => 'Ваш адрес регистрации проверен в Личном кабинете',
        'district' => 'Вы зарегистрированы в одном из избирательных округов, для которых доступен формат дистанционного электронного голосования: № 1 — Крюково, Матушкино, Савелки, Силино, Старое Крюково, № 10 — Северный, Лианозово, Бибирево, № 30 — Чертаново Центральное, Чертаново Южное'
    ]}

    <h3>Уважаемый пользователь!</h3>

    {if $profile_validators.district === true}
        <p><b>Участие в пилотном дистанционном голосовании могут принять только жители районов указанных ниже:</b></p>
        <ul class="errors">
            <li>
                {if isset($profile_errors.district)}
                    <i class="icon icon-status-error icon-24"></i>
                {else}
                    <i class="icon icon-status-success icon-24"></i>
                {/if}
                <span class="error">{$messages.district}</span>
            </li>
        </ul>
    {/if}

    <p>Для подачи заявления на включение в список избирателей для электронного дистанционого голосования на выборах депутатов Московской городской Думы, необходимо, чтобы в вашем Личном кабинете были подтверждены следующие данные:</p>

    {if $profile_errors}
        <ul class="errors">
            {foreach from=$messages key=key item=message}
                {if $profile_validators[$key] === true && $key != 'district'}
                    <li>
                        {if isset($profile_errors[$key])}
                            <i class="icon icon-status-error icon-24"></i>
                        {else}
                            <i class="icon icon-status-success icon-24"></i>
                        {/if}
                        <span class="error">{$message}</span>
                    </li>
                {/if}
            {/foreach}
        </ul>
    {/if}

    <p>Убедитесь, что все необходимые требования выполнены.</p>

    <p>Если в вашем <a href="{$elk_host}/my/#profile">Личном кабинете</a> отсутствуют необходимые сведения, вам необходимо перейти в Личный кабинет, указать недостающие сведения и дождаться их проверки.</p>

    <div class="form-result-back-button d-inline-block pb-0 w-100">
        <span class="right">
            <a href="{$elk_host}/my/#profile" class="button btn btn-show">Перейти в личный кабинет</a>
        </span>
    </div>

{/block}