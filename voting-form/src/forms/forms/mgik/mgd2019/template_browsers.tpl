<script id="browser_errors_template" type="text/html">
    <div class="js-browser-errors">

        <h4>Ваш браузер не обеспечивает полноценную и безопасную работу с сайтом.</h4>

        <% if (! isModernBrowser) { %>
        <div class="js-browser-version-error">
            <ul class="errors errors--sm">
                <li>
                    <i class="icon icon-status-error icon-24"></i>
                    <span class="error">Браузер устарел</span>
                </li>
            </ul>

            <p>Установите актуальную версию вашего браузера или одну из современных альтернатив.</p>

            <ul class="browsers clearfix">
                <li class="browser">
                    <a class="browser__link" href="https://www.google.com/chrome/">
                        <div class="browser__icon browser__icon--chrome"></div>
                        <span class="browser__name">Google Chrome</span>
                    </a>
                </li>
                <li class="browser">
                    <a class="browser__link" href="https://browser.yandex.ru/">
                        <div class="browser__icon browser__icon--yandex"></div>
                        <span class="browser__name">Яндекс.Браузер</span>
                    </a>
                </li>
                <li class="browser">
                    <a class="browser__link" href="https://www.mozilla.org/ru/firefox/">
                        <div class="browser__icon browser__icon--firefox"></div>
                        <span class="browser__name">Mozilla Firefox</span>
                    </a>
                </li>
                <li class="browser">
                    <a class="browser__link" href="https://www.microsoft.com/ru-ru/windows/microsoft-edge">
                        <div class="browser__icon browser__icon--ie"></div>
                        <span class="browser__name">Microsoft Edge</span>
                    </a>
                </li>
                <li class="browser">
                    <a class="browser__link" href="https://www.opera.com/ru">
                        <div class="browser__icon browser__icon--opera"></div>
                        <span class="browser__name">Opera</span>
                    </a>
                </li>
                <li class="browser">
                    <a class="browser__link" href="https://browser.sputnik.ru/">
                        <div class="browser__icon browser__icon--sputnik"></div>
                        <span class="browser__name">Спутник</span>
                    </a>
                </li>
            </ul>
        </div>
        <% } %>

        <% if (! isEncryptionWorks) { %>
        <div class="js-browser-crypt-error">
            <ul class="errors errors--sm">
                <li>
                    <i class="icon icon-status-error icon-24"></i>
                    <span class="error">Браузер не поддерживает шифрование. Отключите браузерные плагины и попробуйте зайти на форму еще раз.</span>
                </li>
            </ul>
        </div>
        <% } %>

    </div>
</script>