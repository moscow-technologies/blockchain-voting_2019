/**
 * Определят, нужно ли pop-up окно и отрисовывает при необходимости
 */
$(function () {
    setTimeout(function () {
        messagebox('Настройка подписок', OPR.templater('subscribeIspk', {'systemArr': {'viber': "Viber"}}), null, function () {

        }, null, function () {

            //инициализация кнопок
            $('#subscribeIspk-save-button').off('click.save').on('click.save', function () {
                if ($(this).attr('disabled'))
                    return false;
                $(this).attr('disabled', 'disabled');
                var systemArr = [];
                $('.ispk_system input:checkbox:checked').each(function () {
                    systemArr.push($(this).val())
                });
                var enoArr = $('.reg_num').text().match(/\d{4}\-\d+\-\d+\-\d+\/\d+/g)
                $.ajax({
                    url: cfgMainHost + '/common/ajax/index.php',
                    type: 'POST',
                    dataType: 'json',
                    data: {ajaxModule: 'ispk', ajaxAction: 'add', 'items': {'eno': enoArr, 'systemArr': systemArr,'org_id':$('[name="org_id"]').val(),'form_id':$('[name="form_id"]').val()}},
                }).done(function (data) {
                    $('#subscribeIspk-save-button').removeAttr('disabled');
                    $('.ispk_message').hide();
                    if (data.error) {
                        if (data.data == '' && data.errorMessage != '') {
                            $('#SaveErrorCustom').text(data.errorMessage).show();
                        }
                        else {
                            $('#SaveError').show();
                        }
                    }
                    else {
                        //закрываем окно
                        $.fn.colorbox.close();
                    }

                    //$.fn.colorbox.close();
                });
                return false;
            });
        });
    }, MPGU.ispk&&MPGU.ispk.visualTimeout*1000||2000);
});