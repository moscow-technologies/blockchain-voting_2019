{extends file="$base_template_path/error.tpl"}

{block name="message_header"}Доступ к форме проверки голоса запрещен{/block}

{block name="message_add_text" }

    <link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />

    <h4>Уважаемый пользователь!</h4>

    <p>Доступ к форме проверки голоса запрещен, так как Вы не участвовали в дистанционном электронном голосовании на выборах Депутатов Московской городской Думы седьмого созыва</p>

    <div class="form-result-back-button d-inline-block pb-0 w-100">
        <span class="right">
            <a href="{$elk_host}/my/#profile" class="button btn btn-show">Перейти в личный кабинет</a>
        </span>
    </div>

{/block}