<script id="vote_start_confirm" type="text/html">
    <p>При нажатии на кнопку «Приступить к голосованию» вы будете перенаправлены на страницу бюллетеня для голосования.
        У вас будет 15 минут для того, чтобы осуществить свой выбор. Обращаем внимание, что переход на страницу бюллетеня
        возможен только один раз.</p>

    <div class="popup-buttons text-right">
        <a href="#" class="button blue js-start-vote">Получить бюллетень</a>
        <a href="#" class="button blue button-cancel js-cancel-vote">Отменить</a>
    </div>
</script>

<script id="sending_popup" type="text/html">
    <p>Вы перенаправляетесь на страницу бюллетеня.</p>

    <div class="text-center my-3">
        <img class="popup_loader" src="{$CFG_MEDIA_HOST}/common/img/base/loader.gif" />
    </div>

    <p class="popup_error text-center hidden">
        При подаче заявления произошла ошибка.<br />
        Попробуйте <a href="#" class="btn-close-pop">закрыть окно</a> и отправить заявление снова
    </p>
</script>

{include file="$base_template_path/mgik/mgd2019/template_browsers.tpl"}