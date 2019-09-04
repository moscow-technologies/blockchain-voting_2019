<!DOCTYPE html>
<html>
{include file="$template_path/_header.tpl" title="Выборы депутатов Московской городской думы седьмого созыва"}
<body class="pgu pgu-container">

    <script type="text/javascript" >
        var ditVotingParams = {$dit_voting};
    </script>

    <script type="text/javascript" src="{$CFG_JS_HOST}/js/forms/mgik/dit.bundle.js"></script>
    <script type="text/javascript" src="{$CFG_JS_HOST}/js/forms/mgik/election.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
    {if !empty($security)}
    <script type="text/javascript" src="{$security}?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>
    {/if}
    
    <div class="timer_head hidden">
        <div class="time_left">
            <p class="timer_title">До конца голосования осталось:</p>
            <p class="timer_value">init_timer_head()</p>
        </div>
    </div>

    <div class="wrapper">

        <div class="bulletin">

            <div class="row">

                <div class="col-xl-10 col-sm-12 bulletin__page">

                    <div class="row">
                        <div class="col-sm-12 bulletin__header">
                            <h1>Избирательный бюллетень</h1>

                            <h2>
                                Для голосования на выборах депутатов<br />
                                Московской городской думы седьмого созыва
                            </h2>

                            <div class="bulletin__date">
                                8 сентября 2019 года
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-12 bulletin__text">
                            <h3>Разъяснение порядка заполнения избирательного бюллетеня</h3>
                            <div>
                                Поставьте любой знак в пустом квадрате справа от фамилии не более чем пяти зарегистрированных кандидатов,
                                в пользу которых сделан выбор. В случае использования прозрачных ящиков для голосования, в целях тайны
                                голосования избирателя, избирательный бюллетень складывается лицевой стороной внутрь.
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-12 bulletin__deputies">
                            {foreach from=$deputies key=key item=deputy}
                                <div class="row bulletin__deputy">
                                    <div class="col-sm-3 bulletin__name">
                                        <div class="bulletin__lastname">{$deputy.last_name}</div>
                                        <div class="bulletin__fullname">{$deputy.first_name} {$deputy.middle_name}</div>
                                    </div>

                                    <div class="col-sm-7 bulletin__desc">
                                        {$deputy.description}
                                    </div>

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

        <div class="bulletin__result">
            <p class="bulletin__msg"></p>
        </div>

    </div>

    <div class="overlay"></div>

    <div class="leavingMessage">
        <div class="leavingMessageInner">
        Если Вы покинете страницу, Вы не сможете проголосовать.
        </div>
    </div>

</body>
</html>