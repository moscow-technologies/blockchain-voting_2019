{extends file="$base_template_path/error.tpl"}

{block name="message_add_text"}

    <link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />

    {assign var=messages value=[
        'PERSON' => 'На день голосования вам будет 18 лет',
        'REG_DATA' => 'Вы подтвердили свою учетную запись в МФЦ',
        'PASSPORT_RF' => 'Данные вашего паспорта проверены в Личном кабинете',
        'REG_ADDRESS' => 'Ваш адрес регистрации проверен в Личном кабинете',
        'DISTRICTID' => 'Вы зарегистрированы в одном из избирательных округов, для которых доступен формат дистанционного электронного голосования: № 1 — Крюково, Матушкино, Савелки, Силино, Старое Крюково, № 10 — Северный, Лианозово, Бибирево, № 30 — Чертаново Центральное, Чертаново Южное'
    ]}

    <div class="prototype">Прототип</div>

    <h3>Уважаемый пользователь!</h3>

    <p>Для подачи заявления на включение в список избирателей для электронного дистанционного голосования на выборах депутатов Московской городской Думы, необходимо, чтобы в вашем Личном кабинете были подтверждены следующие данные:</p>

    {if $profile_errors}
        <ul class="errors">
            {foreach from=$messages key=key item=message}
                <li>
                    {if isset($profile_errors[$key])}
                        <i class="icon icon-status-error icon-24"></i>
                    {else}
                        <i class="icon icon-status-success icon-24"></i>
                    {/if}
                    <span class="error">{$message}</span>
                </li>
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