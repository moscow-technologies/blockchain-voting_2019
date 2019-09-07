<link rel="stylesheet" type="text/css" href="{$CFG_CSS_HOST}/common/css/new/forms/mgik/mgd2019.css?{$smarty.now|date_format:'%Y-%m-%dT%H'}" />
<script type="text/javascript" src="{$CFG_JS_HOST}/common/js_v3/forms/mgik/mgd-view.js?{$smarty.now|date_format:'%Y-%m-%dT%H'}"></script>

{include file="$base_template_path/std_head_service.tpl" faq="{$CFG_MAIN_HOST}/ru/faq/?subject=$faq" download_app_file_enabled = false has_additional_legals=false}

<div class="row">

    <div class="col-md-7">

        <form id="form_element" class="pinned-container form--mgd-view" name="form" method="post" action="" enctype="multipart/form-data">
            <input type="hidden" name="org_id" value="{$org_id}">
            <input type="hidden" name="form_id" value="{$form_id}">
            <input type="hidden" name="action" value="send">
            <input type="hidden" name="step" value="{$load_app_step}">
            <input type="hidden" name="uniqueFormHash" value="{$uniqueFormHash}">

            <fieldset class="form-step">
                <legend>Транзакция зашифрованного голоса</legend>

                <p>Укажите транзакцию зашифрованного голоса, которую Вы получили после голосования:</p>

                {include file="$base_template_path/std_blocks/std_textarea.tpl"
                    label=false
                    name="tx"
                    required=true
                    class="field--tx"
                }

                <div class="row form-horizoontal">
                    <div class="col-md-12 text-right">
                        <a class="btn btn-primary btn-lg js-btn-submit" href="#">Проверить</a>
                    </div>
                </div>
            </fieldset>

            <fieldset class="form-step step2 hidden">
                <legend>Результат проверки</legend>
                <div class="my-3 js-loader">
                    <p class="mb-1 ml-1">Пожалуйста, подождите....</p>
                    <img class="popup_loader" src="{$CFG_MEDIA_HOST}/common/img/base/loader.gif" />
                </div>
                <div class="js-result hidden"></div>
            </fieldset>

            {include file="$base_template_path/std_blocks/std_form_controls.tpl"}

        </form>

    </div>

    <div class="col-md-5">
        <img src="{$CFG_MEDIA_HOST}/common/img/forms/mgik/mgd_view.jpg" class="d-none d-md-block img-fluid mt-5 mt-lg-0" />
    </div>

</div>

<script id="result" type="text/html">
    <% if (error) { %>
        <p><%= error %></p>
    <% } else { %>
        <div>
            <h4><%= deputy.last_name %> <%= deputy.first_name %> <%= deputy.middle_name %></h4>

            <p><b><%= deputy.district %></b></p>
            <p><%= deputy.description %></p>
        </div>
    <% } %>
</script>