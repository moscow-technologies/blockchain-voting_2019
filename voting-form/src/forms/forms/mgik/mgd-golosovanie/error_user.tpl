{extends file="$base_template_path/error.tpl"}

{block name="message_header"}Доступ к дистанционному электронному голосованию запрещен{/block}

{block name="message_add_text" }

    <link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />

    <div class="prototype">Прототип</div>

    <h4>Уважаемый пользователь!</h4>

    <p>Доступ к дистанционному электронного голоосованию запрещен по одной из следующих причин:</p>

    <ul>
        <li>Вы не включены в список для дистанционного электронного голосования на выборах депутатов Московской городской Думы</li>
        <li>Вы уже получали доступ к электронному бюллетеню для дистанционного электронного голосования</li>
    </ul>

    <p>Если Вы не включены в список для дистанционного электронного голосования, Вам необходимо посетить избирательный участок, за которым Вы закреплены.</p>

    <div class="form-result-back-button d-inline-block pb-0 w-100">
        <span class="right">
            <a href="{$elk_host}/my/#profile" class="button btn btn-show">Перейти в личный кабинет</a>
        </span>
    </div>

{/block}