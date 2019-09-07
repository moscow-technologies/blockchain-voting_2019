<!DOCTYPE html>
<html>
{include file="$template_path/_header.tpl" title="Выборы депутатов Московской городской думы седьмого созыва"}
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
                            <h1>Избирательный бюллетень</h1>

                            <h2>
                                ДИСТАНЦИОННОГО ЭЛЕКТРОННОГО ГОЛОСОВАНИЯ НА ВЫБОРАХ<br />
                                ДЕПУТАТОВ МОСКОВСКОЙ ГОРОДСКОЙ ДУМЫ СЕДЬМОГО СОЗЫВА
                            </h2>

                            <div class="bulletin__date">
                                8 сентября 2019 года
                            </div>

                            <h2 class="mb-0">ОДНОМАНДАТНЫЙ ИЗБИРАТЕЛЬНЫЙ ОКРУГ №{$district}</h2>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-12 bulletin__text">
                            <h3>Разъяснение о порядке голосования</h3>
                            <div class="font-weight-bold">
                                Время, выделенное на голосование 15 минут. По истечении выделенного времени проголосовать будет невозможно.<br />
                                Поставьте отметку в квадрате справа от фамилии только одного зарегистрированного кандидата, в пользу которого сделан выбор.
                                Для подтверждения сделанного выбора и окончания процесса голосования необходимо нажать кнопку "Проголосовать"
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-12 bulletin__deputies">
                            {foreach from=$deputies key=key item=deputy}
                                <div class="row bulletin__deputy">
                                    <div class="col-sm-12">

                                        <div class="bulletin__action">
                                            <label class="bulletin__label">
                                                <input class="bulletin__radio" type="radio" name="deputy" value="{$deputy.id}" />
                                                <div class="bulletin__check"></div>
                                            </label>
                                            <button id="button-{$deputy.id}" class="button bulletin__btn" data-value="{$deputy.id}">Проголосовать</button>
                                        </div>

                                        <div class="bulletin__desc">
                                            <div class="bulletin__name">
                                                <div class="bulletin__lastname">{$deputy.last_name}</div> <div class="bulletin__fullname">{$deputy.first_name} {$deputy.middle_name}</div>
                                            </div>
                                            <div class="font-weight-bold">
                                                {$deputy.description}
                                            </div>
                                        </div>

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

        <div class="bulletin__result">
            <p class="bulletin__msg"></p>
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