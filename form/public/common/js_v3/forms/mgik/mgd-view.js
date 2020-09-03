var controller = false;

$(function () {
    var $input = $('[name="tx"]');
    var $btn = $('.js-btn-submit');
    var $loader = $('.js-loader');
    var $result = $('.js-result');

    var initStep1 = function (step, data) {
        $input.prop('disabled', false);
        $btn.fadeIn('fast').css('display', 'inline-block');

        return true;
    };

    var initStep2 = function (step, data) {
        return $.ajax({
            url: cfgMainHost + '/common/ajax/index.php?ajaxModule=MgdService&ajaxAction=view',
            type: 'post',
            data: {
                tx: $input.val()
            },
            beforeSend: function () {
                $loader.fadeIn('fast');
                $input.prop('disabled', true);
                $btn.fadeOut('fast');
            },
            success: function (data) {
                if (data.error) {
                    return error(data);
                }

                return success(data);
            },
            error: function (data) {
                return error(data);
            }
        });
    };

    var error = function (data) {
        var template = OPR.templater('result', {
            error: data.errorMessage || 'Произошла непредвиденная ошибка. Попробуйте повторить запрос позднее.'
        });

        return result('error', template);
    };

    var success = function (data) {
        var template = OPR.templater('result', {
            error: false,
            deputy: data
        });

        return result('success', template);
    };

    var result = function (status, template) {
        $loader.fadeOut('fast');
        $result.html(template).fadeIn('fast');

        return status === 'success';
    };

    var controller = new FormController(0);

    controller.addAfterStepHandler({ step: 1, action: initStep1 });
    controller.addBeforeStepHandler({ step: 2, action: initStep2 });

    $btn.on('click', function () {
        controller.advanceNext();

        return false;
    });

});