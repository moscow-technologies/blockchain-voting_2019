{block name=body}
    {capture highloadContent}
        <p style="margin-right: 80px;">Доступ будет открыт с {$time} по московскому времени {$date}</p>
        <small>Дистанционное электронное голосование для участников голосования, зарегистрированных по месту жительства на территории {$title_parent_case}, проводится с {$time} по московскому времени {$date} года до {$endTime} по московскому времени {$endDate} {$endMonth} 2020 года.</small>
    {/capture}
    {include file="$base_template_path/disabled.tpl" hide_cutalog_button='hide_all' skip_elk=true errorContent=$smarty.capture.highloadContent}
{/block}