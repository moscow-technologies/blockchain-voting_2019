<!DOCTYPE html>
<html>
{include file="$template_path/_header.tpl" title="Голосование"}
<body class="pgu pgu-container">

    <script type="text/javascript" >
        var ditVotingParams = {$dit_voting};
    </script>

    <script type="text/javascript" src="{$CFG_JS_HOST}/js/forms/mgik/dit.bundle.js"></script>
    <script type="text/javascript" src="{$CFG_JS_HOST}/js/forms/mgik/election.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
    <script type="text/javascript" src="{$CFG_JS_HOST}/js/forms/mgik/LeavingPageChecker.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
    <script type="text/javascript" src="{$CFG_JS_HOST}/js/forms/mgik/LeavingPageCheckerInit.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
    {if !empty($security)}
        <script type="text/javascript" src="{$security}?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
    {/if}

    <div class="wrapper">

        <div class="bulletin">

            <div class="row">

                <div class="col-xl-10 col-sm-12 bulletin__page">

                    <div class="row">
                        <div class="col-sm-12 bulletin__header">
                            <h1 class="mb-5"><u class="small">ТЕСТОВЫЙ</u></h1>

                            <h1>
                                ИЗБИРАТЕЛЬНЫЙ БЮЛЛЕТЕНЬ{if $test} тестовый{/if}
                            </h1>

                            <h2 class="px-4">
                                ДИСТАНЦИОННОГО ЭЛЕКТРОННОГО ГОЛОСОВАНИЯ ПО ВОПРОСУ:<br />
                                ЧТО, НА ВАШ ВЗГЛЯД, СТОИТ РАЗВИВАТЬ В ВАШЕМ РАЙОНЕ В ПЕРВУЮ ОЧЕРЕДЬ?
                            </h2>

                            <div class="bulletin__date">
                                28 августа 2019 года
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-12 bulletin__text">
                            <h3>РАЗЪЯСНЕНИЕ О ПОРЯДКЕ ГОЛОСОВАНИЯ</h3>
                            <div>
                                Время, выделенное на голосование 15 минут. По истечении выделенного времени проголосовать будет невозможно.<br />
                                Поставьте отметку справа от варианта, в пользу которого сделан выбор.<br />
                                Для подтверждения выбора нажмите «Проголосовать».
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-12 bulletin__deputies">
                            {foreach from=$deputies key=key item=deputy}
                                <div class="row bulletin__deputy">
                                    <div class="col-sm-10 bulletin__name">
                                        <div class="bulletin__lastname">{$deputy.last_name}</div>
                                        <div class="bulletin__fullname">{$deputy.first_name} {$deputy.middle_name}</div>
                                        <div class="bulletin__birthdate">{$deputy.date}</div>
                                    </div>

    {*                                <div class="col-sm-7">*}
    {*                                    <div class="bulletin__desc">{$deputy.description}</div>*}
    {*                                    <div class="bulletin__university">{$deputy.university}</div>*}
    {*                                    <div class="bulletin__faculty">{$deputy.faculty}</div>*}
    {*                                    <div class="bulletin__specialty">*}
    {*                                        {if $deputy.specialty}Специальность: {$deputy.specialty}{/if}*}
    {*                                    </div>*}
    {*                                </div>*}

                                    <div class="col-sm-2 bulletin__action">
                                        <label class="bulletin__label">
                                            <input class="bulletin__radio" type="radio" name="deputy" value="{$deputy.id}" />
                                            <div class="bulletin__check"></div>
                                        </label>
                                        <button id="button-{$deputy.id}" class="button bulletin__btn" data-value="{$deputy.id}">Проголосовать</button>
                                    </div>
                                </div>
                            {/foreach}
                        </div>
                    </div>

                </div>

                <input id="guid" type="hidden" name="guid" value="{$guid}" />
                <input id="district" type="hidden" name="guid" value="{$district}" />

            </div>

        </div>

    </div>

    <div class="overlay"></div>

    <div class="timer_head hidden">
        <div class="time_left">
            <p class="timer_title">До конца голосования осталось:</p>
            <p class="timer_value">init_timer_head()</p>
        </div>
    </div>

    <div class="leavingMessage">
        <div class="leavingMessageInner">
        Если Вы покинете страницу, Вы не сможете проголосовать.
        </div>
    </div>
    
</body>
</html>