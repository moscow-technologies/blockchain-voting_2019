$.validator.addMethod('dictrict', function (value, element, params) {
    if (! params) {
        return true;
    }

    var allowedDistricts = params.split(';');
    var currentDistrict = $('.DistrictInput').val().replace(/\s/g, '');

    $.validator.messages.dictrict = 'Для указанного района не доступен формат электронного дистанционного голосования';

    if (! currentDistrict || allowedDistricts.indexOf(currentDistrict) === -1) {
        return false;
    }

    return true;
});

$(document).ready(function () {

    $.checkBrowser({target: '#form_element'});

    var isOkButtonWasPressed = false;
    var confirmPopupContent = OPR.templater('address_change_confirm', []);
    var elkUnad = window.lkProfile.unad,
        elkUnom = window.lkProfile.unom,
        elkFlat = window.lkProfile.flat;

    var formController = new FormController(0, {
        skipAgreement: true,
        useSendingPopup: true,
        useHitcounter: true,
        finishButtonText: 'Отправить заявление'
    });

    formController.addValidator({
        step: 1,
        next: function() {
            if (isAddressWasChanged() && ! isOkButtonWasPressed) {
                messagebox('Изменение адреса регистрации', confirmPopupContent, null, null);

                return false;
            } else {
                return true;
            }
        }
    });

    ELK.ready(function () {
        ELK.fill($('#form_element'));
    });

    $(document).on('click', '.js-change-address', function() {
        var $form = $('#kladr_1');
        var regAddress = {
            REG_ADDRESS: {
                CORPUSNO: $('.CorpusInput', $form).val(),
                DISTRICTLABEL: $('.DistrictInput', $form).val(),
                FLAT: $('.FlatInput', $form).val(),
                HOUSENO: $('.HouseInput', $form).val(),
                STREET: $('.StreetInput', $form).val(),
                STREETNAME: $('.StreetInput', $form).val(),
                STROENIENO: $('.StroenieInput', $form).val(),
                UNAD: $('.UnadInput', $form).val(),
                UNOM: $('.UnomInput', $form).val(),
            }
        };

        ELK.saveUserProfileData({
            block: 'REG_ADDRESS',
            data: regAddress,
            done: function (data) {},
            error: function (data) {},
        });

        isOkButtonWasPressed = true;
        formController.advanceNext();

        return false;
    });

    $(document).on('click', '.js-change-address-cancel', function() {
        $('.popup_messagebox_shadow').fadeOut('fast');
        $('.popup_messagebox').fadeOut('fast');

        return false;
    });

    /**
     * @returns {boolean}
     */
    function isAddressWasChanged() {
        var formUnom = $('.UnomInput').val();
        var formUnad = $('.UnadInput').val();
        var formFlat = $('.FlatInput').val();

        if (formUnad) {
            if (formUnad !== elkUnad || formUnom !== elkUnom || formFlat !== elkFlat) {
                return true;
            }
        } else {
            if (formUnom !== elkUnom || formFlat !== elkFlat) {
                return true;
            }
        }

        return false;
    }

});
