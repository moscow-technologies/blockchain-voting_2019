(function ($) {
    
        $.validator.setDefaults({
        focusInvalid: true,
        ignore: '.ignore, .chosen-container input, [type=hidden]:not(select.chosen:not(*:hidden > select.chosen)), :disabled',
        onsubmit: true,
        onkeyup: false,
        onclick: false,
        errorClass: 'error',
        validClass: 'valid',
        errorPlacement: function($error, $element) {
            var insertBefore = ($element.hasClass('multi-input') && $element.is(':visible')) ? $element.closest('.holder').find('.multi-input:hidden') : $element;
            //$error.addClass('error-message').css('display','inline-block').insertBefore(insertBefore);
            $error.addClass('error-message').css('display','block').insertBefore(insertBefore);
            $error.off('click.controller').on('click.controller',function(){$(this).hide();	return false;});
            return true;
        },
        //красное
        highlight: function (element, errorClass, validClass) {
            $(element).removeClass(validClass).addClass(errorClass);
            $(element).parents('fieldset.form-block').removeClass(validClass).addClass(errorClass);
        },
        //Зеленое
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass(errorClass).addClass(validClass).prev('label.error').remove();

            var $fields_req = 0; var $fields_valid_req =0;	var $fields_error = 0;
            var $block=$(element).parents('fieldset.form-block');
            $block.find('div,.wrap,fieldset:not(.form-step),.disabled').filter(function(){return ($(this).css('display')==='none');}).addClass('nonvalidation');
            $block.find('.wrap:not(.nonvalidation)').filter(function(){return ($(this).closest('.nonvalidation').length===0);}).each(function(){
                if ($(this).hasClass(errorClass)) $fields_error++;
                var $temp_req = $(this).find('select[required], textarea[required], input[required]:not(:hidden)').length;
                var $temp_valid_req = $(this).find('select[required].'+validClass+', textarea[required].'+validClass+', input[required].'+validClass+'').length;
                if ($temp_req>0) $fields_req++;
                if ($temp_req>0&&$temp_valid_req>0) $fields_valid_req++;
            });
            //console.log('name='+$(element).attr('name')+'#'+$fields_req+'#'+$fields_valid_req+'#'+$fields_error)
            if ($fields_req<=$fields_valid_req&&$fields_error===0)
                $block.removeClass(errorClass).addClass(validClass);

            $block.find('.nonvalidation').removeClass('nonvalidation');
        }
    });


    $(document).on('ready', function () {
        for (var method in $.validator.messages)
            if (typeof ($.validator.messages[method]) === 'undefined')
                $.validator.messages[method] = 'Поле заполнено неверно';
    });
    
    $.validator.addMethod("pattern", function(value, element, param) {
        return (value.length===0 || true === this.optional(element) || new RegExp('^' + param + '$','gm').test(value));
    });

    var validateLinkedPassportMessages = {
        0: 'Поле валидно',
        1: 'Введите правильную дату',
        2: 'Введите правильную дату рождения',
        3: 'Ваш паспорт недействительный! Обратитесь в ФМС для замены паспорта',
        4: 'Дата рождения указана позже, чем дата получения документа',
        5: 'Паспорт выдан ранее, чем в 14 лет',
        6: 'Дата выдачи паспорта должна быть не ранее 1 октября 1997 г.',
        7: 'Военный билет выдан ранее, чем в 18 лет',
        8: 'Удостоверение личности офицера выдано ранее, чем в 18 лет',
        9: 'Паспорт моряка выдан ранее, чем в 16 лет',
        10: 'Заграничный паспорт выдан ранее, чем в 2 недели'
    };
    /**
     * Проверяет документ, удостоверяющий личность, на валидность.
     * 
     * @param  string linkedFieldName|undefined Название поля Дата рождения.
     * @return int
     */
    var validateLinkedPassport = function (element, linkedFieldName) {

        /**
         * Вычисляет возраст в годах.
         * 
         * @param  Date birthdate Дата рождения.
         * @param  Date|undefined ageInDate Вычислить возраст на это время.
         * @return int
         */
        function calculateAge(birthdate, ageInDate) {
            if (typeof ageInDate !== 'object') {
                var now = new Date();
                ageInDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
            }
            age = ageInDate.getFullYear() - birthdate.getFullYear();
            if (ageInDate.getMonth() < birthdate.getMonth()) {
                age--;
            } else if (ageInDate.getMonth() === birthdate.getMonth() && ageInDate.getDate() < birthdate.getDate()) {
                age--;
            }

            return age;
        }

        /**
         * Вычисляет возраст в днях.
         * 
         * @param  Date birthdate Дата рождения.
         * @param  Date|undefined ageInDate Вычислить возраст на это время.
         * @return int
         */
        function calculateAgeInDays(birthdate, ageInDate) {
            var secondsInDay = 86400;
            var millisecondsInSecond = 1000;
            
            if (typeof ageInDate !== 'object') {
                var now = new Date();
                ageInDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
            }
            
            var ageInDays = Math.floor((ageInDate.getTime() - birthdate.getTime()) / millisecondsInSecond / secondsInDay);
            return ageInDays;
        }
        
        /**
         * Проверяет документ, удостоверяющий личность по дате рождения.
         * 
         * @param  string documentType Тип документа, удостоверяющего личность, ('1' - паспорт РФ и т п).
         * @param  Date documentDate Дата выдачи документа, удостоверяющего личность.
         * @param  Date birthdate Дата рождения.
         * @return int
         * 
         */
        function checkBirthdate(documentType, documentDate, birthdate) {
            var now = new Date();
            var date30DaysBefore = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0));
            
            var age = calculateAge(birthdate);
            var ageDocumentGot = calculateAge(birthdate, documentDate);
            var age30DaysBefore = calculateAge(birthdate, date30DaysBefore);

            if (birthdate.getTime() > documentDate.getTime())
                return 4;
            if (documentType === '1') { // Паспорт РФ.
                if (ageDocumentGot < 14)
                    return 5;
                if (ageDocumentGot < 14 && age30DaysBefore >= 14)
                    return 3; // Проверка избыточная, сохраняю для соответствия заданию.
                if (ageDocumentGot < 20 && age30DaysBefore >= 20)
                    return 3;
                if (ageDocumentGot < 45 && age30DaysBefore >= 45)
                    return 3;
            } else if (documentType === '2') { // Военный билет.
                if (ageDocumentGot < 18) // Не младше 18 лет.
                    return 7;
            } else if (documentType === '3') { // Удостоверение личности офицера.
                if (ageDocumentGot < 18) // Не младше 18 лет.
                    return 8;
            } else if (documentType === '6') { // Паспорт моряка.
                if (ageDocumentGot < 16) // Не младше 16 лет.
                    return 9;
            } else if (documentType === '16') { // Заграничный паспорт
                var ageInDays = calculateAgeInDays(birthdate, documentDate);
                if (ageInDays < 14) // Не младше 2 недель.
                    return 10;
            }

            return 0; // Блок валиден.
        }

        /**
         * Возвращает тип документа, удостоверяющего личность.
         * 
         * @param  element DOM object Поле Когда выдан.
         * @return string
         */
        function getDocumentType(element) {
            // Если не можем определить тип, считаем паспортом РФ.
            var documentType = '1';
            
            if ($(element).closest('.person-document').find('.doc-type-select').length > 0) {
                documentType = $(element).closest('.person-document').find('.doc-type-select').val();
            }
            
            return documentType;
        }
        
        var dateRe = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
        var documentDate = $(element).val();
        var birthdate, dateParts;

        var documentType = getDocumentType(element);

        if (!dateRe.test(documentDate))
            return 1;
        dateParts = documentDate.split('.');
        var today = new Date();
        today = new Date(Date.UTC(today.getFullYear(),today.getMonth(),today.getDate(),0,0,0));
        documentDate = new Date(Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0],0,0,0));

        // Согласно Указу Президента Российской Федерации от 13 марта 1997 г. N 232.
        var minDate = new Date(Date.UTC(1997, 9, 01, 0, 0, 0)); // 1997-10-01
        if (documentDate.getTime() < minDate.getTime() && documentType === '1')
            return 6;
        
        var linkedField = linkedFieldName ? $('input[name="' + linkedFieldName + '"]') : false;
        // Находим поле Дата рождения.
        if (! linkedField || linkedField.length !== 1)
            return 0; // Не найдено поле Дата рождения. Значит блок валиден.
        
        birthdateString = linkedField.val();
        if (! dateRe.test(birthdateString))
            return 2; // Поле дата рождения не валидно.
        
        birthdateParts = birthdateString.split('.');
        var birthdate = new Date(Date.UTC(birthdateParts[2], birthdateParts[1] - 1, birthdateParts[0],0,0,0));

        return checkBirthdate(documentType, documentDate, birthdate);
    };

    $.validator.addMethod("date_linked_doc_passport", function (value, element, params) {
        return this.optional(element) || (validateLinkedPassport(element, params) === 0);
    }, function (params, element) {
        return validateLinkedPassportMessages[validateLinkedPassport(element, params)];
    });
    //Валидатор, который дергает валидацию связанного поля
  $.validator.addMethod("back", function (value, element, params) {
//		if (params==undefined||params===true) {
//			console.error('Не переданы связанные поля');
//			return true;
//		}
//		var temp  = params.split(',');
//		var fields = [];
//		temp.forEach(function(elem){
//			fields.push('[name="' + elem + '"]');
//		});
//		setTimeout(function (){
//			if (typeof field_recursion_level==='undefined') field_recursion_level = 0;
//			if (field_recursion_level<3) {field_recursion_level++; $(fields.join(',')).valid();}
//			else field_recursion_level = 0;
//		}, 100);
        return true;
    });

    function m2date(m) {
        if (typeof m === 'undefined') {
            var d = new Date();
            var now =  new Date(d.getFullYear(), d.getMonth(), 1);
        }
        else {
            var dateParts = m.split('.');
            var now =  new Date(dateParts[1] + '-' + dateParts[0] + '-' + '01');
        }
        now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);
        return now;
    }
    function compareMonth(m1, m2) {
        if (m1 === '')
            return 1;
        if (m2 === '')
            return -1;
        var d1 = (m1 instanceof Date ? m1 : m2date(m1));
        var d2 = (m2 instanceof Date ? m2 : m2date(m2));
        if (typeof d1 === 'undefined' || isNaN(d1.getTime()))
            return 1;
        if (typeof d2 === 'undefined' || isNaN(d2.getTime()))
            return -1;
        if (d1 > d2)
            return -1;
        if (d2 > d1)
            return 1;
        return 0;
    }
    $.validator.addMethod("month_year_interval_valid", function (value, element, params) {
        var d = m2date(value);
        return this.optional(element) || (d instanceof Date && !isNaN(d.getTime()));
    });
    $.validator.addMethod("month_year_interval_not_less", function (value, element, params) {
        if (typeof params === "object"||typeof params === "array") {
            var par = params[0]||'';
            var message = params[1]||'';
        }
        else var par = params;

        if (message) $.validator.messages.month_year_interval_not_less = message;
        else $.validator.messages.month_year_interval_not_less = 'Дата "с" должна быть ранее Даты "по"';

        var $other = $(element).closest('.wrap').find(par);
        var date = m2date();
        if ($other.length === 1)
            date = $other.val();
        else if ($other.length === 0)
            date = m2date(par);

        return this.optional(element) || (compareMonth(date, value) >= 0);
    });

    $.validator.addMethod("month_year_interval_in_future_and_now", function (value, element, params) {
        return this.optional(element) || (compareMonth(m2date(), value) >= 0);
    });

    $.validator.addMethod("month_year_interval_in_past_and_now", function (value, element, params) {
        return this.optional(element) || (compareMonth(m2date(), value) <= 0);
    });

    //СТС
    $.validator.addMethod('gibdd_sts', function(value, element) {
        return value === '' || /^\d\d[АБВЕКМНОРСТУХавекмнорстух\d]{2}\d{6}$/.test(value);
    });

    //Корректный валидатор для СТС и поля multiinput
    $.validator.addMethod( 'gibdd_sts_new', function ( value, element ) {
        var valid = true;
        value.replace( /^,+|,+$/g, '' ).split( ',' ).forEach( function ( elem ) {
            valid = valid && (0 === elem.trim().length  || /^([0-9]{2})([АВЕКМНОРСТУХABEKMHOPCTYX]{2}|[0-9]{2})([0-9]{6})$/gi.test( elem ));
        } );
        return valid;
    } );

    //Корректный валидатор для Серии Номера ВУ на форме штрафов
    $.validator.addMethod( 'vu_new', function ( value, element, options ) {
        var valid = false,
            sel = options[0],
            oppositeValue = $( '#' + sel ).val();

        var valueRegexp =  'series' === options[1] ? /^\d{2}([АВЕКМНОРСТУХавекмнорстух]{2}|\d{2})$/ : /^\d{6}$/ ;
        var oppValueRegexp =  'series' === options[1] ? /^\d{6}$/ : /^\d{2}([АВЕКМНОРСТУХавекмнорстух]{2}|\d{2})$/;


        if ((valueRegexp.test(value) && oppValueRegexp.test(oppositeValue)) || (0 === value.length && 0 === oppositeValue.length)) {
            valid = true;
        }

        if (!valueRegexp.test(value) || 0 === value.length) {
            setTimeout(function() {
                $(element).removeClass($.validator.defaults.validClass).addClass($.validator.defaults.errorClass);
            }, 50);
        } else {
            setTimeout(function() {
                $(element).removeClass($.validator.defaults.errorClass).addClass($.validator.defaults.validClass);
            }, 50);
        }

        if (!oppValueRegexp.test(oppositeValue) || 0 === oppositeValue.length) {
            setTimeout(function() {
                $('#' + sel).removeClass($.validator.defaults.validClass).addClass($.validator.defaults.errorClass);
            }, 50);

        } else {
            setTimeout(function() {
                $('#' + sel).removeClass($.validator.defaults.errorClass).addClass($.validator.defaults.validClass);
            }, 50);
        }

        if (valid) {
            $( '#' + sel ).removeClass($.validator.defaults.errorClass).addClass($.validator.defaults.validClass);
            $(element).removeClass($.validator.defaults.errorClass).addClass($.validator.defaults.validClass);
        }


        return valid;

    } );


    $.validator.addMethod('vu_series', function(value, element, options) {
        return /^\d{2}([АБВЕКМНОРСТУХавекмнорстух]{2}|\d{2})$/.test(value) || 0 == value.length;
    });

    $.validator.addMethod('vu_number', function(value, element, options) {
        return /^\d{6}$/.test(value) || 0 == value.length;
    });


    $.validator.addMethod('vu_both_fields', function(value, element, options) {
        var oppositeValue = $('#' + options).val();

        return (0 === value.length && 0 === oppositeValue.length || 0 !== value.length && 0 !== oppositeValue.length);

    });

    $.validator.addMethod('passport_series_number_for_rnip', function(value) {
        value = value.replace(/\s/g, '');
        return parseInt(value, 10) > 0 || 0 === value.length;
    });

    $.validator.addMethod('upload_max', function(value, element, param) {
        var size_must = param!=undefined? param*1024*1024:89128960;
        var size = $(element).closest('.wrap').find('input[name*="_file_size"]').val()*1||0;
        return size<=size_must;
    }, $.format('Прикрепите документ, размер которого не превышает {0} МБ.'));

    var dsts = $('input.has-gibdd-sts');
    if (dsts.length)
        dsts.rules('add', {gibdd_sts_new: true, minlength: 10, maxlength: 10});

    //Постановление, старый
    $.validator.addMethod('gibdd_resolution1', function(value, element) {
        return value === '' || /^\d\d[А-яЁё]{2}\d{6,7}$/.test(value);
    });

    //...и новый (http://www.garant.ru/products/ipo/prime/doc/70481450/#1000) форматы
    $.validator.addMethod('gibdd_resolution2', function(value, element) {
        return value === '' || /^18810[0-4][0-9]{14}$/.test(value);
    });

    //номер постановления МАДИ
    $.validator.addMethod('gibdd_resolution_madi', function(value, element) {
        return value === '' || /^\d{20}$/.test(value);
    });

    $.validator.addMethod('gibdd_invalid', function(value, element) {
        return value === '' || false;
    });

    $.validator.addMethod('email', function(value, element) {
        return (this.optional(element) === true) || value === '' || (/^[\-а-яёa-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[\-a-zа-яё0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[a-zа-яё0-9]([\-а-яёa-z0-9]{0,61}[а-яёa-z0-9])?\.)+(?:[a-zа-яё0-9]{2,})$/i.test(value));
    });
    /* from additional-methods.js
	 * Lets you say "at least X inputs that match selector Y must be filled."
	 *
	 * The end result is that neither of these inputs:
	 *
	 *  <input class="productinfo" name="partnumber">
	 *  <input class="productinfo" name="description">
	 *
	 *  ...will validate unless at least one of them is filled.
	 *
	 * partnumber:  {require_from_group: [1,".productinfo"]},
	 * description: {require_from_group: [1,".productinfo"]}
	 *
	 */
    $.validator.addMethod("require_from_group", function(value, element, options) {
        var validator = this;
        // только в видимых искать
        $(options[1]).closest('.form_step').find('div,.wrap').filter(function() {
            return ($(this).css('display') == 'none')
        }).addClass('nonvalidation');
        var selector = $(options[1] + ':not(.ignore, .chosen-container input:not(.multi-input), :disabled, .slider input[type="radio"])');
        var fields = $(options[1]).filter(function() {
            if ($(this).closest('.nonvalidation').length > 0) {
                return false;
            }
            switch (this.type) {
                case "checkbox":
                    return ($(this).is(':checked')) ? '1' : '';
                    break;
                case "text":
                default:
                    return validator.elementValue(this).replace(/^,+|,+$/g, '');
                    break;
            }

        });
        var validOrNot = fields.length >= options[0];

        var fields = $(selector, element.form);
        if (validOrNot) {
            if (1 < fields.length) {
                $(selector, element.form).each(function(index, value) {
                    $(this).prev('label.' + $.validator.defaults.errorClass)
                        .remove()
                        .end()
                        .removeClass($.validator.defaults.errorClass)
                        .addClass($.validator.defaults.validClass);

                    if ($(this).hasClass('as-input') && $(this).parent().parent().hasClass('as-selections')) {
                        $(this).parent().parent().removeClass($.validator.defaults.errorClass)
                            .addClass($.validator.defaults.validClass);
                    }
                });
            } else {
                $(selector, element.form).prev('label.' + $.validator.defaults.errorClass)
                    .remove()
                    .end()
                    .removeClass($.validator.defaults.errorClass)
                    .addClass($.validator.defaults.validClass);
            }

        } else {
            if (1 < fields.length) {
                $(selector, element.form).each(function(index, value) {
                    $(this).addClass($.validator.defaults.errorClass);
                    if ($(this).hasClass('as-input') && $(this).parent().parent().hasClass('as-selections')) {
                        $(this).parent().parent().addClass($.validator.defaults.errorClass);
                    }
                });
            } else {
                $(selector, element.form).addClass($.validator.defaults.errorClass);
            }

        }

        $(options[1]).closest('.form_step').find('.nonvalidation').remove();
        return validOrNot;
    });

    $.validator.addMethod('birthcert_rnip_forms',
        function(value, element) {
            return this.optional(element) || value.replace(/\s|\-/g, '').match(/^[IVXLC]{1,4}[А-Я]{2}\d{6}$/i);
        }, 'Укажите корректный номер свидетельства о рождении.<br/>Пример: IIЮР111111'
    );

    $.validator.addMethod('file_not_in_progress', function(value, element) {
        if (this.optional(element))
            return true;
        var parent = $(element).parents('.wrap');
        return !parent.hasClass('upload-state-process');
    });
    // Валидаторы
    // дата
    $.validator.addMethod('date_in_date', function (value, element) {
        if (value.length == 0)
            return true;

        var date_value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/, '$3-$2-$1'));
        if (date_value == 'Invalid Date' || date_value.toJSON().replace(/([0-9]{4})\-([0-9]{2})\-([0-9]{2})(.*)/, '$3.$2.$1') != value) {
            return false;

        }
        date_value.setHours(0);
        date_value.setMinutes(0);
        date_value.setSeconds(0);
        date_value.setMilliseconds(0);//приведем минуты часы секунды к 0
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);//текущая дата без учета времени

        var str = ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);

        var past_date = new Date((now.getFullYear() - 130) + '-' + str);
        past_date.setHours(0);
        past_date.setMinutes(0);
        past_date.setSeconds(0);
        past_date.setMilliseconds(0);
        var future_date = new Date((now.getFullYear() + 130) + '-' + str);
        future_date.setHours(0);
        future_date.setMinutes(0);
        future_date.setSeconds(0);
        future_date.setMilliseconds(0);

        return (+date_value >= +past_date && +date_value <= +future_date);
    });
    // дата в прошлом
    $.validator.addMethod('date_in_past', function (value, element, params) {
        if (value.length == 0)
            return true;
        if (typeof params === "undefined" || params === true) {
            params = [];
            params.push(130);
        }
        if (typeof params === "string") {
            var new_params = params;
            params = [];
            params.push(new_params);

        }


        var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
        if (re.test(value)) {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени

            if (!params[0]) {
                $.validator.messages.date_in_past = 'Укажите дату в прошлом';
            }
            else {
                if (typeof params === "array" && params.length > 1 && params.length <= 2) {
                    //то написать текст нормальный для дней лет и тд
                }
                else
                if (typeof params === "array" && params.length > 2) {
                    $.validator.messages.date_in_past = params[2];
                }


            }

            var diff = false;

            switch (params[1]) {
                case 'd':

                    diff = 3600000 * 24 * params[0];
                    $.validator.messages.date_in_past = 'Укажите дату в прошлом, но не ранее ' + params[0] + ' дней';
                    break;
                case 'm':
                    var now2 = +new Date();
                    diff = ((365.25 * 3600000 * 24) / 12) * params[0] + now2 * 1 - +now;
                    $.validator.messages.date_in_past = 'Укажите дату в прошлом, но не ранее ' + params[0] + ' месяцев';
                    break;
                case 'y':
                default:

                    diff = 365.25 * 3600000 * 24 * params[0];
                    $.validator.messages.date_in_past = 'Укажите дату в прошлом, но не ранее ' + params[0] + ' лет(года)';
                    break;
            }


            value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/, '$3-$2-$1'));
            value.setHours(0);
            value.setMinutes(0);
            value.setSeconds(0);
            value.setMilliseconds(0); //приведем минуты часы секунды к 0
            var past_date = new Date(+now - diff);
            past_date.setHours(0);
            past_date.setMinutes(0);
            past_date.setSeconds(0);
            past_date.setMilliseconds(0);
            return (+value >= +past_date && +value < +now);

            return true;
        } else {
            return (element.getAttribute('required') !== 'required');
        }
    });
    // дата в будущем
    $.validator.addMethod('date_in_future', function (value, element, params) {
        if (value.length == 0)
            return true;
        if (typeof params === "undefined" || params === true) {
            params = [];
            params.push(130);
        }
        if (typeof params === "string") {
            var new_params = params;
            params = [];
            params.push(new_params);

        }


        var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
        if (re.test(value)) {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени

            if (!params[0]) {
                $.validator.messages.date_in_future = 'Укажите дату в будущем';
            }
            else {
                if (typeof params === "array" && params.length > 1 && params.length <= 2) {
                    //то написать текст нормальный для дней лет и тд
                }
                else
                if (typeof params === "array" && params.length > 2) {
                    $.validator.messages.date_in_future = params[2];
                }

            }

            var diff = false;

            switch (params[1]) {
                case 'd':

                    diff = 3600000 * 24 * params[0];
                    $.validator.messages.date_in_future = 'Укажите дату в будущем, но не позднее ' + params[0] + ' дней';
                    break;
                case 'm':
                    var now2 = +new Date();
                    diff = ((365.25 * 3600000 * 24) / 12) * params[0] + now2 * 1 - +now;
                    $.validator.messages.date_in_future = 'Укажите дату в будущем, но не позднее ' + params[0] + ' месяцев';
                    break;
                case 'y':
                default:

                    diff = 365.25 * 3600000 * 24 * params[0];
                    $.validator.messages.date_in_future = 'Укажите дату в будущем, но не позднее ' + params[0] + ' лет(года)';
                    break;
            }

            value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/, '$3-$2-$1'));
            value.setHours(0);
            value.setMinutes(0);
            value.setSeconds(0);
            value.setMilliseconds(0);//приведем минуты часы секунды к 0
            var future_date = new Date(+now + diff);
            future_date.setHours(0);
            future_date.setMinutes(0);
            future_date.setSeconds(0);
            future_date.setMilliseconds(0);
            return (+value <= +future_date && +value > +now);

        } else {
            return (element.getAttribute('required') !== 'required');
        }
    });
    // дата в будущем
    $.validator.addMethod('date_in_future_and_now', function (value, element, params) {
        if (value.length == 0)
            return true;
        if (typeof params === "undefined" || params === true) {
            params = [];
            params.push(130);
        }
        if (typeof params === "string") {
            var new_params = params;
            params = [];
            params.push(new_params);

        }


        var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
        if (re.test(value)) {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени

            if (!params[0]) {
                $.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня';
            }
            else {
                if (typeof params === "array" && params.length > 1 && params.length <= 2) {
                    //то написать текст нормальный для дней лет и тд
                }
                else
                if (typeof params === "array" && params.length > 2) {
                    $.validator.messages.date_in_future_and_now = params[2];
                }

            }

            var diff = false;

            switch (params[1]) {
                case 'd':

                    diff = 3600000 * 24 * params[0];
                    $.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня, но не позднее ' + params[0] + ' дней';
                    break;
                case 'm':
                    var now2 = +new Date();
                    diff = ((365.25 * 3600000 * 24) / 12) * params[0] + now2 * 1 - +now;
                    $.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня, но не позднее ' + params[0] + ' месяцев';
                    break;
                case 'y':
                default:

                    diff = 365.25 * 3600000 * 24 * params[0];
                    $.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня, но не позднее ' + params[0] + ' лет(года)';
                    break;
            }

            value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/, '$3-$2-$1'));
            value.setHours(0);
            value.setMinutes(0);
            value.setSeconds(0);
            value.setMilliseconds(0);//приведем минуты часы секунды к 0
            var future_date = new Date(+now + diff);
            future_date.setHours(0);
            future_date.setMinutes(0);
            future_date.setSeconds(0);
            future_date.setMilliseconds(0);
            return (+value <= +future_date && +value >= +now);

            return true;
        } else {
            return (element.getAttribute('required') !== 'required');
        }
    });

    // дата в прошлом и сейчас
    $.validator.addMethod('date_in_past_and_now', function (value, element, params) {
        if (value.length == 0)
            return true;
        if (typeof params === "undefined" || params === true) {
            params = [];
            params.push(130);
        }
        if (typeof params === "string") {
            var new_params = params;
            params = [];
            params.push(new_params);

        }


        var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
        if (re.test(value)) {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени

            if (params === undefined || !params[0]) {
                $.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня';
            }
            else {
                if (typeof params === "array" && params.length > 1 && params.length <= 2) {
                    //то написать текст нормальный для дней лет и тд
                }
                else
                if (typeof params === "array" && params.length > 2) {
                    $.validator.messages.date_in_past_and_now = params[2];
                }

            }

            var diff = false;

            switch (params[1]) {
                case 'd':

                    diff = 3600000 * 24 * params[0];
                    $.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня, но не позднее ' + params[0] + ' дней';
                    break;
                case 'm':
                    var now2 = +new Date();
                    diff = ((365.25 * 3600000 * 24) / 12) * params[0] + now2 * 1 - +now;
                    $.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня, но не позднее ' + params[0] + ' месяцев';
                    break;
                case 'y':
                default:

                    diff = 365.25 * 3600000 * 24 * params[0];
                    $.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня, но не позднее ' + params[0] + ' лет(года)';
                    break;
            }

            value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/, '$3-$2-$1'));
            value.setHours(0);
            value.setMinutes(0);
            value.setSeconds(0);
            value.setMilliseconds(0);//приведем минуты часы секунды к 0
            var past_date = new Date(+now - diff);
            past_date.setHours(0);
            past_date.setMinutes(0);
            past_date.setSeconds(0);
            past_date.setMilliseconds(0);
            return (+value >= +past_date && +value <= +now);

            return true;
        } else {
            return (element.getAttribute('required') !== 'required');
        }
    });
    //deprecated обратная совместимость
    $.validator.addMethod('date_in_past_and_now_and_null', function (value, element, params) {
        return $.validator.methods.date_in_past_and_now.call(this, value, element);
    });
    //deprecated обратная совместимость
    $.validator.addMethod('date_in_past_or_null', function (value, element) {
        return $.validator.methods.date_in_past.call(this, value, element);
    });
    //deprecated обратная совместимость
    $.validator.addMethod('date_in_future_or_null', function (value, element, params) {
        return $.validator.methods.date_in_future.call(this, value, element);
    });

    $.validator.addMethod('complex_require', function (value, element, params) {
        return !(params[0]() && value == '');
    });
    //Проверить, что возвраст не больше 18
    $.validator.addMethod('not_larger_date_18', function (value, element, params) {
        if (value.length == 0)
            return true;
        var temp = value.split('.');
        value = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
        if (params != undefined && params.length > 1 && $(params).length > 0) {
            var temp = $(params).val().split('.');
            var old = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
            var age = Math.floor((value.getTime() - old.getTime()) / (24 * 3600 * 365.25 * 1000));
        }
        else {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени
            var age = Math.floor((now.getTime() - value.getTime()) / (24 * 3600 * 365.25 * 1000));
        }
        if (age <= 18)
            return true;
        else
            return false;
    });
    //Проверить, что возвраст не больше 14
    $.validator.addMethod('not_larger_date_14', function (value, element, params) {
        if (value.length == 0)
            return true;
        var temp = value.split('.');
        value = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
        if (params != undefined && params.length > 1 && $(params).length > 0) {
            var temp = $(params).val().split('.');
            var old = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
            var age = Math.floor((value.getTime() - old.getTime()) / (24 * 3600 * 365.25 * 1000));
        }
        else {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени
            var age = Math.floor((now.getTime() - value.getTime()) / (24 * 3600 * 365.25 * 1000));
        }
        if (age <= 14)
            return true;
        else
            return false;
    });
    //Проверить, что возвраст больше 18
    $.validator.addMethod('larger_date_18', function (value, element, params) {
        if (value.length == 0)
            return true;
        var temp = value.split('.');
        value = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
        if (params != undefined && params.length > 1 && $(params).length > 0) {
            var temp = $(params).val().split('.');
            var old = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
            var age = Math.floor((value.getTime() - old.getTime()) / (24 * 3600 * 365.25 * 1000));
        }
        else {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени
            var age = Math.floor((now.getTime() - value.getTime()) / (24 * 3600 * 365.25 * 1000));
        }
        if (age >= 18)
            return true;
        else
            return false;
    });
    //Проверить,  params: >=, 0 или [>=, 0, 'Введите больше 0']|[<=, 20,'Введите меньше 20']
    $.validator.addMethod('check_count', function (value, element, params) {
        if (value.length === 0)
            return true;
        if ($.isArray(value))
            value = value.length;
        else
            value = value * 1;
        var count = 0;
        var $result = true;
        if ($.isArray(params[0]) && $.isArray(params[1])) {
            //режим интервала [>=, 0, 'Введите больше 0']|[<=, 20,'Введите меньше 20']
            var $i = 0;

            while (params[$i] !== undefined && params[$i].length > 2) {
                $result = check_value(params[$i][0], value, params[$i][1]);
                if (!$result) {
                    if (params[$i][2] !== undefined)
                        $.validator.messages.check_count = params[$i][2];
                    else
                        $.validator.messages.check_count = $.validator.messages.regex;
                    break;
                }
                $i++;
            }
        }
        else {
            //режим одиночной проверки значения
            if (params[1] !== undefined)
                count = params[1] * 1;
            if (params[2] !== undefined)
                $.validator.messages.check_count = params[2];
            else
                $.validator.messages.check_count = $.validator.messages.regex;
            return check_value(params[0], value, count);
        }
        function check_value(operator, value_input, value_be) {
            value_input = value_input * 1;
            value_be = value_be * 1;
            switch (operator) {
                case '>':
                    return (value_input > value_be);
                    break;
                case '>=':
                    return (value_input >= value_be);
                    break;
                case '<':
                    return (value_input < value_be);
                    break;
                case '<=':
                    return (value_input <= value_be);
                    break;
                case '=':
                case '==':
                    return (value_input == value_be);
                    break;
                default:
                    console.error('Не верный параметр для сравнения');
                    return false;
                    break;
            }
            if (params[2] != undefined)
                $.validator.messages.check_count = params[2];
            else
                $.validator.messages.check_count = $.validator.messages.regex;
        }
        return $result;

    });
    //params 0 - длинна всего, 1- длина после запятой
    $.validator.addMethod('numeric_length', function (value, element, params) {
        var after = params[1] * 1;

        var len = params[0] * 1;
        if (after > 0 && len > 0) {
            var all_len = '';
            for (var i = 1; i <= len; i++)
                all_len += 'x';
            var temp = '';
            for (var i = 1; i <= after; i++)
                temp += 'x';
            $.validator.messages.numeric_length = 'Укажите число в формате ' + all_len + '.' + temp;
            var re = new RegExp('^((\\d{1,' + len + '})|(\\d{1,' + (len - after) + '}[\\.\\,]\\d{1,' + after + '}))$', 'ig');
        }
        else if (after > 0) {
            var temp = '';
            for (var i = 1; i <= after; i++)
                temp += 'x';
            $.validator.messages.numeric_length = 'Укажите число в формате ххх.' + temp + ', где количество цифр после точки равно ' + (after);
            var re = new RegExp('^((\\d+)|(\\d+[\\.\\,]\\d{' + after + ',' + after + '}))$', 'ig');
        }
        else if (len > 0) {
            $.validator.messages.numeric_length = 'Укажите число в формате ' + all_len + '.xxx, где количество цифр до и после точки вместе не более ' + (len);
            var re = new RegExp('^((\\d{1,' + len + '})|(\\d{1,' + (len) + '}[\\.\\,]\\d+))$', 'ig');
        }
        else {
            var re = new RegExp('^((\\d+)|(\\d+[\\.\\,]\\d+))$', 'ig');
            $.validator.messages.numeric_length = 'Укажите число в формате ххх.xxx, где нет ограничений до и после точки';
        }


        return this.optional(element) || (value.match(re));
    });


    //Проверить,  params: >=, 0, d(дней), name="name_field_second_date", message (или .class)
    //check_date|>=|0|y|#id_polya|'я&nbsp;текст&nbsp;подсказки'
    //также умеет сравнивать со статичными датами
    //check_date|>=|01.01.1990|date|undefined
    $.validator.addMethod('check_date', function (value, element, params) {
        if (value.length === 0)
            return true;
        var temp = value.split('.');
        value = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
        value.setHours(0);
        value.setMinutes(0);
        value.setSeconds(0);
        value.setMilliseconds(0);//текущая дата без учета времени

        if (params[4] !== undefined) {
            params[4] = params[4].replace(new RegExp(String.fromCharCode(160), "g"), ' ');
            $.validator.messages.check_date = params[4];
            for (var i = 0; i < 3; i++)
                $.validator.messages['check_date_' + i] = params[4];
        }
        else {
            $.validator.messages.check_date = $.validator.messages.regex;
            for (var i = 0; i < 3; i++)
                $.validator.messages['check_date_' + i] = $.validator.messages.regex;
        }

        if (params[3] !== undefined && params[3] !== 'undefined' && params[3] != false) {
            var temp = $(params[3]).val();
            var pole = $(params[3]);
            if (pole.closest('.wrap').css('display') === 'none' || temp.length === 0)
                return true;

            if (!pole.is('input.date_field') || pole.is('input.date_field') && temp.length === 10) {
                setTimeout(function () {
                    if (typeof field_recursion_level === 'undefined')
                        field_recursion_level = 0;
                    if (field_recursion_level < 3) {
                        field_recursion_level++;
                        pole.valid();
                    }
                    else
                        field_recursion_level = 0;
                }, 100);
            }
            var temp2 = temp.split('.');
            var old = new Date(temp2[2], (temp2[1] * 1 - 1), temp2[0]);
            old.setHours(0);
            old.setMinutes(0);
            old.setSeconds(0);
            old.setMilliseconds(0);//текущая дата без учета времени
            var diff = Math.floor(value.getTime() - old.getTime());


        }
        else
            var diff = value.getTime();

        var count = false;
        switch (params[2]) {
            case 'd':
                count = params[1] * 86400000;
                break;
            case 'h':
                count = params[1] * 3600000;
                break;
            case 'm':
                count = params[1] * 60000;
                break;
            case 's':
                count = params[1] * 1000;
                break;
            case 'y':
                count = params[1] * 31557600000;
                break;
            case 'date':
                var temp2 = params[1].split('.');
                var choose_date = new Date(temp2[2], (temp2[1] * 1 - 1), temp2[0]);
                choose_date.setHours(0);
                choose_date.setMinutes(0);
                choose_date.setSeconds(0);
                choose_date.setMilliseconds(0);//текущая дата без учета времени
                count = choose_date.getTime();
                break;
            default:
                //по умолчанию timestamp в микросекундах
                count = params[1];
                break;
        }
        switch (params[0]) {
            case '>':
                return (diff > count);
                break;
            case '>=':
                return (diff >= count);
                break;
            case '<':
                return (diff < count);
                break;
            case '<=':
                return (diff <= count);
                break;
            case '=':
            case '==':
                return (diff === count);
                break;
            default:
                console.error('Не верный параметр для сравнения');
                return false;
                break;
        }


    });
    //сделаем заглушки, чтобы можно было check_date вешать еще 3 раза на 1 поле
    for (var i = 0; i < 3; i++)
        $.validator.addMethod('check_date_' + i, function (value, element, params) {
            return $.validator.methods.check_date.call(this, value, element, params);
        }, $.validator.messages.check_date);

    //Проверить, что возвраст больше 14
    $.validator.addMethod('larger_date_14', function (value, element, params) {
        if (value.length == 0)
            return true;

        var temp = value.split('.');
        value = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
        var now = new Date();
        if (params != undefined && params.length > 1 && $(params).length > 0) {
            var temp = $(params).val().split('.');
            var old = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
            var age = Math.floor((value.getTime() - old.getTime()) / (24 * 3600 * 365.25 * 1000));
        }
        else {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);//текущая дата без учета времени
            var age = Math.floor((now.getTime() - value.getTime()) / (24 * 3600 * 365.25 * 1000));
        }

        if (age >= 14)
            return true;
        else
            return false;
    });
    //Проверить, что возвраст больше определенного возвраста, переданного в params validator="larger_age|18"
    $.validator.addMethod('larger_age', function (value, element, params) {
        if (value.length === 0)
            return true;
        if (!value.match(/\./i) || params == undefined || isNaN(parseInt(params)))
            return false;
        var temp = value.split('.');
        value = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);//текущая дата без учета времени
        var age = Math.floor((now.getTime() - value.getTime()) / (24 * 3600 * 365.25 * 1000));
        if (age >= parseInt(params))
            return true;
        else
            return false;
    });
    //Проверить, что возвраст меньше определенного возвраста, переданного в params validator="not_larger_age|18"
    $.validator.addMethod('not_larger_age', function (value, element, params) {
        if (value.length === 0)
            return true;
        if (!value.match(/\./i) || params == undefined || isNaN(parseInt(params)))
            return false;
        var temp = value.split('.');
        value = new Date(temp[2], (temp[1] * 1 - 1), temp[0]);
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);//текущая дата без учета времени
        var age = Math.floor((now.getTime() - value.getTime()) / (24 * 3600 * 365.25 * 1000));
        if (age <= parseInt(params))
            return true;
        else
            return false;
    });

    // фото из фоторедактора
    $.validator.addMethod('photoeditor_photo', function (value, element) {
        if (!element.value || $('#photoeditor_alert').text()) {
            return false;
        } else {
            return true;
        }
    });

    $.validator.addMethod('date', function (value, element) {
        if (!element.value || !(new RegExp('^[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}$', '').test(value))) {
            return false;
        }

        var year = element.value.substring(6, 10);
        var month = element.value.substring(3, 5);
        var day = element.value.substring(0, 2);
        if (month > 12 || month < 1 || day > 31 || day < 1) {
            return false;
        }

        return true;
    });
    // проверка СНИЛС
    $.validator.addMethod('snils', function (value, element) {
        if (value === '')
            return true;
        if (!/^\d{3}-\d{3}-\d{3} \d\d$/.test(value))
            return false;
        var strippedVal = value.replace(/[- ]/g, '');
        var no = strippedVal.substr(0, 9), check = strippedVal.substr(9);
        if (/(\d)\1\1/.test(no))
            return false; // номер не может содержать 3 одинаковые цифры подряд
        for (var i = 8, sum = 0; i >= 0; i--)
            sum += no.charAt(i) * (9 - i);
        var modulo = sum % 101;
        if (modulo == 100)
            modulo = 0;
        return modulo == parseInt(check, 10);
    });
    // проверка окпо
    $.validator.addMethod('okpo', function (value, element) {
        switch (value.length) {
            case 0: //пусто 
            case undefined:
                return true;
                break;
            case 1: //только контрольная цифра
                return false
                break;
            default:
                if (value.length != 8 && value.length != 10)
                    return false;
                var need_kontr = value.substr(-1); //контрольное число
                var stroka = value.slice(0, -1); //сама строка оставшаяся
                var sum = 0;
                var weight = 1;
                for (var i = 0; i <= stroka.length - 1; i++) {
                    if (weight > 10)
                        weight = 1;
                    sum += stroka[i] * weight;
                    weight++;
                }
                var real_kontr = sum % 11;
                if (real_kontr == 10) {
                    //разряд равен 10, значит нужно заново со смещением
                    var sum = 0;
                    var weight = 3;
                    for (var i = 0; i <= stroka.length - 1; i++) {
                        if (weight > 10)
                            weight = 3;
                        sum += stroka[i] * weight;
                        weight++;
                    }
                    real_kontr = sum % 11;
                    if (real_kontr == 10)
                        real_kontr = 0;
                }
                return (real_kontr == need_kontr);

                break;
        }



    });
    // проверка ЕПД
    var epdFactors = [5, 8, 4, 2, 1, 6, 3, 7, 9];
    $.validator.addMethod('epd', function (value, element) {
        if (value === '')
            return true;
        if (!/^\d{10}$/.test(value))
            return false;
        for (var i = 0, sum = 0; i < 9; ++i)
            sum += epdFactors[i] * value.charAt(i);
        return (sum % 11) % 10 == parseInt(value.substr(9));
    });
    // проверка ИНН
    var innFactors = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    //Оставлен для совместимости
    $.validator.addMethod('inn', function (value, element, params) {
        if (value === '')
            return true;
        if (params == 'person') { // физлица
            if (!/^\d{12}$/.test(value))
                return false;
            for (var i = 0, sum = 0; i < 10; ++i)
                sum += innFactors[i + 1] * value.charAt(i);
            if ((sum % 11) % 10 != parseInt(value.substr(10, 1)))
                return false;
            for (var i = 0, sum = 0; i < 11; ++i)
                sum += innFactors[i] * value.charAt(i);
            return (sum % 11) % 10 == parseInt(value.substr(11));
        }
        else { // юрлица
            if (!/^\d{10}$/.test(value))
                return false;
            for (var i = 0, sum = 0; i < 9; ++i)
                sum += innFactors[i + 2] * value.charAt(i);
            return (sum % 11) % 10 == parseInt(value.substr(9));
        }
    });
    //Валидация физ ИНН
    $.validator.addMethod('inn_fiz', function (value, element) {
        if (value === '')
            return true;

        if (!/^\d{12}$/.test(value))
            return false;
        for (var i = 0, sum = 0; i < 10; ++i)
            sum += innFactors[i + 1] * value.charAt(i);
        if ((sum % 11) % 10 != parseInt(value.substr(10, 1)))
            return false;
        for (var i = 0, sum = 0; i < 11; ++i)
            sum += innFactors[i] * value.charAt(i);
        return (sum % 11) % 10 == parseInt(value.substr(11));
    });
    //Валидация юр ИНН
    $.validator.addMethod('inn_ul', function (value, element) {
        if (value === '')
            return true;
        if (!/^\d{10}$/.test(value))
            return false;
        for (var i = 0, sum = 0; i < 9; ++i)
            sum += innFactors[i + 2] * value.charAt(i);
        return (sum % 11) % 10 == parseInt(value.substr(9));
    });
    // проверка КПП
    $.validator.addMethod('kpp', function (value, element) {
        return value === '' || /^\d{4}[0-9A-Z]{2}\d{3}$/.test(value);
    });
    // проверка кадастрового номера
    $.validator.addMethod('kadastr_check', function (value, element) {
        return $.validator.methods.check_kadastr.call(this, value, element);
    });
    // проверка БИК
    $.validator.addMethod('bik', function (value, element) {
        if (value === '')
            return true;
        if (value.length != 9)
            return false;
        //проверка по разрядам
        //1-2 разряды слева — код Российской Федерации. Используется код — «04»;
        //7-9 разряды слева —  принимает цифровые значения от «050» до «999
        return (
                (value.substr(0, 2) == '04') &&
                (/^\d{4}$/.test(value.substr(2, 4))) &&
                (((value.substr(6, 3) * 1 >= 50) && (value.substr(6, 3) * 1 <= 999)) || (value.substr(6, 3) * 1 >= 0) && (value.substr(6, 3) * 1 <= 2))
                );
    });
    // свидетельство о рождении в формате XIV-МЮ №777777, знак номера необязателен, допускаются промежуточные пробелы
    $.validator.addMethod('birth_cert', function (value, element) {
        return ((value === '') || ((value == undefined) ? false : value.match(/^[CDILMVX]+\s*-\s*[А-ЯЁ]{2}\s+[№N]?\s*\d{6}$/)));
    });
    // серия свидетельства о рождении
    $.validator.addMethod('birthCertSerial', function (value, element) {
        return value === '' || /^[CDILMVX]+-[А-ЯЁ]{2}$/.test(value);
    });

    // валидация ФИО
    $.validator.addMethod('fio', function (value, element) {
        return value === '' || ((value == undefined) ? false : value.match(/^[а-яё]+([- \`\']{1}[а-яё]+)*\.{0,1}$/i));
    });
    // валидация float
    $.validator.addMethod('float', function (value, element) {
        return value === '' || ((value == undefined) ? false : value.match(/^[0-9]+[\.\,]{0,1}[0-9]*$/i));
    });
    // валидация ОГРН
    $.validator.addMethod('check_ogrn', function (value, element) {
        if (value === '')
            return true;
        if (!/^\d{13}$/.test(value))
            return false;
        var ost = value.substr(0, value.length - 1) % 11;
        if (ost == 10)
            ost = 0;
        return (ost == value.substr(-1));
    });
    // валидация ОГРНИП
    $.validator.addMethod('check_ogrnip', function (value, element) {
        if (value === '')
            return true;
        if (!/^\d{15}$/.test(value))
            return false;
        var ost = value.substr(0, value.length - 1) % 13;
        if (ost >= 10)
            ost = ost - 10;
        return (ost == value.substr(-1));
    });
    $.validator.addMethod('phone_num', function (value, element) {
        return value === '' || ((value == undefined) ? false : /^[0-9\-\(\) ]+$/i.test(value));
    });
    //Номер квартиры с возможной буквой в конце
    $.validator.addMethod("flat", function (value, element) {
        return value === '' ? true : /^[0-9IVX]+[а-яё]{0,1}[\-\;]{0,1}[0-9IVX]*[а-яё]{0,1}$/ig.test(value);
    });
    //диапазон значений от 1:20 например. validator="count|1:20"
    $.validator.addMethod("count", function (value, element, params) {
        if (value.length === 0)
            return true;
        value = value * 1;
        if (params == undefined || !params.match(/\:/i))
            return false;
        var param = params.split(':');
        if (param.length < 2)
            return false;
        return (value >= param[0] * 1 && value <= param[1] * 1);
    });
    // валидация названий организаций 
    $.validator.addMethod('main', function (value, element) {
        return value === '' || ((value == undefined) ? false : value.match(/^[а-яёa-z\<\>\+\:\;\*0-9\^\_\.\-\'\"#№@\»`\«&,!\(\)\s\/\[\]]+$/i));
    });
    $.validator.addMethod('main_ru', function (value, element) {
        return value === '' || ((value == undefined) ? false : value.match(/^[а-яё\+\:0-9\<\>\^\_\.\-\'\"#№@\»`\«&,\(\)\s!\/\[\]]+$/i));
    });
    $.validator.addMethod('captcha', function (value, element) {
        return value === '' || ((value == undefined) ? false : value.match(/^[а-яё]+$/i));
    });
    $.validator.addMethod('check_kadastr', function (value, element) {
        if (value.length == 0)
            return true;
        return (value.match(/^[0-9]{2}:[0-9]{1,2}:[0-9]{1,10}:[0-9]+$/i));
    });
    // номер свидетельства о рождении
    $.validator.addMethod('birthCertNo', function (value, element) {
        return value === '' || value.match(/^\d{6}$/);
    });

    //4 валидатора ОМС
    //возможность ввода  только 16 цифр
    $.validator.addMethod('chknew_oms', function (value, element) {
        return value === '' || value.match(/^\d{16}$/);
    });

    //Возможность ввода до 6 букв русского или латинского алфавита /[0-9a-zA-ZА-яЁё]/, остальное цифры
    $.validator.addMethod('chkold_oms', function (value, element) {
        return value === '' || value.match(/^[0-9a-zA-ZА-яЁё]{6}\d*$/);
    });

    //Возможность ввода от 6 знаков
    $.validator.addMethod('chkanc_oms', function (value, element) {
        return value === '' || value.match(/^\d{6}\d*$/);
    });

    //Возможность ввода 9 цифры
    $.validator.addMethod('chktemp_oms', function (value, element) {
        return value === '' || value.match(/^\d{9}|\d{16}$/);
    });


    // для документов: должен быть выдан после даты рождения, взятой из указанного поля
    $.validator.addMethod('validDocDate', function (value, element, birthdateField) {
        if (birthdateField.val() == '' || value == '')
            return true;
        var docDate = new Date(value.substring(3, 5) + '/' + value.substring(0, 2) + '/' + value.substring(6, 10));
        var birthdate = birthdateField.val();
        birthdate = new Date(birthdate.substring(3, 5) + '/' + birthdate.substring(0, 2) + '/' + birthdate.substring(6, 10));
        return birthdate <= docDate;
    });
    //допустимые типы файлов 
    $.validator.addMethod('accept', function (value, element, param) {
        param = typeof param === 'string' ? param.replace(/,/g, '|') : 'png|jpe?g|gif';
        return this.optional(element) || value.match(new RegExp('.(' + param + ')$', 'i'));
    }, $.format('Введите имя файла с разрешённым расширением.'));


    $.validator.addMethod('notValidClass', function (value, element, params) {
        if (params !== 'undefined')
            $.validator.messages.notValidClass = params;
        return !$(element).hasClass('notValidClass');
    }
    );
// Валидаторы
	// дата
	$.validator.addMethod('date_in_date', function(value, element) {
		if(value.length==0) return true;
		
		var date_value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/,'$3-$2-$1')); 
		if (date_value=='Invalid Date'||date_value.toJSON().replace(/([0-9]{4})\-([0-9]{2})\-([0-9]{2})(.*)/,'$3.$2.$1')!=value) {
			return false;
			
		}
		date_value.setHours(0); date_value.setMinutes(0); date_value.setSeconds(0); date_value.setMilliseconds(0);//приведем минуты часы секунды к 0
		var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени
		
		var str = ('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+now.getDate()).slice(-2);
		
		var past_date = new Date((now.getFullYear()-130)+'-'+str); past_date.setHours(0); past_date.setMinutes(0); past_date.setSeconds(0); past_date.setMilliseconds(0);
		var future_date = new Date((now.getFullYear()+130)+'-'+str); future_date.setHours(0); future_date.setMinutes(0); future_date.setSeconds(0); future_date.setMilliseconds(0);
		
		return (+date_value>=+past_date&&+date_value<=+future_date);
	});
	// дата в прошлом
	$.validator.addMethod('date_in_past', function(value, element,params) {
		if(value.length==0) return true;
		if (typeof params === "undefined"||params===true) {
			params = [];
			params.push(130);
		}
		if (typeof params==="string") {
			var new_params = params;
			params = [];
			params.push(new_params);

		}

  
		var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
		if (re.test(value)) {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0);  now.setMilliseconds(0);//текущая дата без учета времени

			if (!params[0]) {
					$.validator.messages.date_in_past = 'Укажите дату в прошлом';
			}
			else {
				if (typeof params==="array"&&params.length>1&&params.length<=2) {
					//то написать текст нормальный для дней лет и тд
				}
				else
					if (typeof params==="array"&&params.length>2) {
						$.validator.messages.date_in_past = params[2];
					}
					
						
			}

			var diff = false;
		
				switch (params[1]) {
					case 'd':
						
						diff = 3600000*24*params[0];
						$.validator.messages.date_in_past = 'Укажите дату в прошлом, но не ранее '+params[0]+' дней';
						break;
					case 'm':
						var now2 = +new Date();
						diff = ((365.25*3600000*24)/12)*params[0]+now2*1-+now; 
						$.validator.messages.date_in_past = 'Укажите дату в прошлом, но не ранее '+params[0]+' месяцев';
						break;
					case 'y':
					default:

						diff = 365.25*3600000*24*params[0];
						$.validator.messages.date_in_past = 'Укажите дату в прошлом, но не ранее '+params[0]+' лет(года)';
						break;
				}

			
				value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/,'$3-$2-$1')); 
				value.setHours(0); value.setMinutes(0); value.setSeconds(0); value.setMilliseconds(0); //приведем минуты часы секунды к 0
				var past_date = new Date(+now-diff); past_date.setHours(0); past_date.setMinutes(0); past_date.setSeconds(0); past_date.setMilliseconds(0);
				return (+value>=+past_date&&+value<+now);
		
				return true;
		} else {
			return (element.getAttribute('required') !== 'required');
		}
	});
	// дата в будущем
	$.validator.addMethod('date_in_future', function(value, element,params) {
		if(value.length==0) return true;
		if (typeof params === "undefined"||params===true) {
			params = [];
			params.push(130);
		}
		if (typeof params==="string") {
			var new_params = params;
			params = [];
			params.push(new_params);

		}

  
		var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
		if (re.test(value)) {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени

			if (!params[0]) {
					$.validator.messages.date_in_future = 'Укажите дату в будущем';
			}
			else {
				if (typeof params==="array"&&params.length>1&&params.length<=2) {
					//то написать текст нормальный для дней лет и тд
				}
				else
					if (typeof params==="array"&&params.length>2) {
						$.validator.messages.date_in_future = params[2];
					}
					
			}

			var diff = false;
		
				switch (params[1]) {
					case 'd':
						
						diff = 3600000*24*params[0];
						$.validator.messages.date_in_future = 'Укажите дату в будущем, но не позднее '+params[0]+' дней';
						break;
					case 'm':
						var now2 = +new Date();
						diff = ((365.25*3600000*24)/12)*params[0]+now2*1-+now; 
						$.validator.messages.date_in_future = 'Укажите дату в будущем, но не позднее '+params[0]+' месяцев';
						break;
					case 'y':
					default:

						diff = 365.25*3600000*24*params[0];
						$.validator.messages.date_in_future = 'Укажите дату в будущем, но не позднее '+params[0]+' лет(года)';
						break;
				}
				
				value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/,'$3-$2-$1')); 
				value.setHours(0); value.setMinutes(0); value.setSeconds(0); value.setMilliseconds(0);//приведем минуты часы секунды к 0
				var future_date = new Date(+now+diff); future_date.setHours(0); future_date.setMinutes(0); future_date.setSeconds(0);  future_date.setMilliseconds(0);
				return (+value<=+future_date&&+value>+now);

		} else {
			return (element.getAttribute('required') !== 'required');
		}
	});
	// дата в будущем
	$.validator.addMethod('date_in_future_and_now', function(value, element,params) {
		if(value.length==0) return true;
		if (typeof params === "undefined"||params===true) {
			params = [];
			params.push(130);
		}
		if (typeof params==="string") {
			var new_params = params;
			params = [];
			params.push(new_params);

		}

  
		var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
		if (re.test(value)) {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени

			if (!params[0]) {
					$.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня';
			}
			else {
				if (typeof params==="array"&&params.length>1&&params.length<=2) {
					//то написать текст нормальный для дней лет и тд
				}
				else
					if (typeof params==="array"&&params.length>2) {
						$.validator.messages.date_in_future_and_now = params[2];
					}

			}

			var diff = false;
		
				switch (params[1]) {
					case 'd':
						
						diff = 3600000*24*params[0];
						$.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня, но не позднее '+params[0]+' дней';
						break;
					case 'm':
						var now2 = +new Date();
						diff = ((365.25*3600000*24)/12)*params[0]+now2*1-+now; 
						$.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня, но не позднее '+params[0]+' месяцев';
						break;
					case 'y':
					default:

						diff = 365.25*3600000*24*params[0];
						$.validator.messages.date_in_future_and_now = 'Укажите дату в будущем или сегодня, но не позднее '+params[0]+' лет(года)';
						break;
				}
			
				value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/,'$3-$2-$1')); 
				value.setHours(0); value.setMinutes(0); value.setSeconds(0); value.setMilliseconds(0);//приведем минуты часы секунды к 0
				var future_date = new Date(+now+diff); future_date.setHours(0); future_date.setMinutes(0); future_date.setSeconds(0); future_date.setMilliseconds(0);
				return (+value<=+future_date&&+value>=+now);
		
				return true;
		} else {
			return (element.getAttribute('required') !== 'required');
		}
	});
	
	// дата в прошлом и сейчас
	$.validator.addMethod('date_in_past_and_now', function(value, element,params) {
		if(value.length==0) return true;
		if (typeof params === "undefined"||params===true) {
			params = [];
			params.push(130);
		}
		if (typeof params==="string") {
			var new_params = params;
			params = [];
			params.push(new_params);

		}

  
		var re = new RegExp('^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$', '');
		if (re.test(value)) {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени

			if (params===undefined||!params[0]) {
					$.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня';
			}
			else {
				if (typeof params==="array"&&params.length>1&&params.length<=2) {
					//то написать текст нормальный для дней лет и тд
				}
				else
					if (typeof params==="array"&&params.length>2) {
						$.validator.messages.date_in_past_and_now = params[2];
					}

			}

			var diff = false;
		
				switch (params[1]) {
					case 'd':
						
						diff = 3600000*24*params[0];
						$.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня, но не позднее '+params[0]+' дней';
						break;
					case 'm':
						var now2 = +new Date();
						diff = ((365.25*3600000*24)/12)*params[0]+now2*1-+now; 
						$.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня, но не позднее '+params[0]+' месяцев';
						break;						
					case 'y':
					default:

						diff = 365.25*3600000*24*params[0];
						$.validator.messages.date_in_past_and_now = 'Укажите дату в прошлом или сегодня, но не позднее '+params[0]+' лет(года)';
						break;
				}
			
				value = new Date(value.replace(/([0-9]{2})\.([0-9]{2})\.([0-9]{4})/,'$3-$2-$1')); 
				value.setHours(0); value.setMinutes(0); value.setSeconds(0); value.setMilliseconds(0);//приведем минуты часы секунды к 0
				var past_date = new Date(+now-diff); past_date.setHours(0); past_date.setMinutes(0); past_date.setSeconds(0); past_date.setMilliseconds(0);
				return (+value>=+past_date&&+value<=+now);
		
				return true;
		} else {
			return (element.getAttribute('required') !== 'required');
		}
	});
	//deprecated обратная совместимость
	$.validator.addMethod('date_in_past_and_now_and_null', function(value, element,params) {
		return $.validator.methods.date_in_past_and_now.call(this, value, element);
	});
	//deprecated обратная совместимость
	$.validator.addMethod('date_in_past_or_null', function(value, element) {
		return $.validator.methods.date_in_past.call(this, value, element);
	});
	//deprecated обратная совместимость
	$.validator.addMethod('date_in_future_or_null', function(value, element,params) {
		return $.validator.methods.date_in_future.call(this, value, element);
	});
	
	$.validator.addMethod('complex_require', function(value, element, params) {
		return !(params[0]() && value == '');
	});
	//Проверить, что возвраст не больше 18
	$.validator.addMethod('not_larger_date_18', function(value, element,params) {
		if(value.length==0) return true;
		var temp = value.split('.');
		value =  new Date(temp[2],(temp[1]*1-1),temp[0]);
		if (params!=undefined&&params.length>1&&$(params).length>0) {
			var temp = $(params).val().split('.');
			var old = new Date(temp[2],(temp[1]*1-1),temp[0]);
			var age = Math.floor((value.getTime() - old.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		else {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени
			var age = Math.floor((now.getTime() - value.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		if (age <= 18) return true;
		else return false;
	});
	//Проверить, что возвраст не больше 14
	$.validator.addMethod('not_larger_date_14', function(value, element,params) {
		if(value.length==0) return true;
		var temp = value.split('.');
		value =  new Date(temp[2],(temp[1]*1-1),temp[0]);
		if (params!=undefined&&params.length>1&&$(params).length>0) {
			var temp = $(params).val().split('.');
			var old = new Date(temp[2],(temp[1]*1-1),temp[0]);
			var age = Math.floor((value.getTime() - old.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		else {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени
			var age = Math.floor((now.getTime() - value.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		if (age <= 14) return true;
		else return false;
	});
	//Проверить, что возвраст больше 18
	$.validator.addMethod('larger_date_18', function(value, element, params) {
		if(value.length==0) return true;
		var temp = value.split('.');
		value =  new Date(temp[2],(temp[1]*1-1),temp[0]);
		if (params!=undefined&&params.length>1&&$(params).length>0) {
			var temp = $(params).val().split('.');
			var old = new Date(temp[2],(temp[1]*1-1),temp[0]);
			var age = Math.floor((value.getTime() - old.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		else {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени
			var age = Math.floor((now.getTime() - value.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		if (age >= 18) return true;
		else return false;
	});
	//Проверить,  params: >=, 0 или [>=, 0, 'Введите больше 0']|[<=, 20,'Введите меньше 20']
	$.validator.addMethod('check_count', function(value, element, params) {
		if(value.length===0) return true;
		if ($.isArray(value)) value = value.length;
		else value = value*1;
		var count = 0;
		var $result = true;
		if ($.isArray(params[0])&&$.isArray(params[1])) {
			//режим интервала [>=, 0, 'Введите больше 0']|[<=, 20,'Введите меньше 20']
			var $i = 0;
			
			while (params[$i]!==undefined&&params[$i].length>2) {
				$result = check_value(params[$i][0],value,params[$i][1]);
				if (!$result) {
					if (params[$i][2]!==undefined)
						$.validator.messages.check_count = params[$i][2];
					else $.validator.messages.check_count = $.validator.messages.regex;
					break;
				}
				$i++;
			}
		}
		else {
			//режим одиночной проверки значения
			if (params[1]!==undefined) count = params[1]*1;
			if (params[2]!==undefined)
				$.validator.messages.check_count = params[2];
			else $.validator.messages.check_count = $.validator.messages.regex;
			return check_value(params[0],value,count);
		}
		function check_value(operator,value_input,value_be){
			value_input = value_input*1;
			value_be = value_be*1;
			switch (operator){
					case '>':
						return (value_input>value_be);
						break;
					case '>=':
						return (value_input>=value_be);
						break;
					case '<':
						return (value_input<value_be);
						break;
					case '<=':
						return (value_input<=value_be);
						break;
					case '=':
					case '==':
						return (value_input==value_be);
						break;
					default:
						console.error('Не верный параметр для сравнения');
						return false;
					break;
			}
			if (params[2]!=undefined)
				$.validator.messages.check_count = params[2];
			else $.validator.messages.check_count = $.validator.messages.regex;
		}
		return $result;
		
	});
	//params 0 - длинна всего, 1- длина после запятой
	$.validator.addMethod('numeric_length', function (value, element, params) {
		var after = params[1]*1;
		
		var len = params[0]*1;
		if (after>0&&len>0) {
			var all_len = '';
			for (var i=1;i<=len;i++) all_len+='x';
			var temp ='';
			for (var i=1;i<=after;i++) temp+='x';
			$.validator.messages.numeric_length = 'Укажите число в формате '+all_len+'.'+temp;
			var re = new RegExp('^((\\d{1,' + len + '})|(\\d{1,' + (len - after) + '}[\\.\\,]\\d{1,' + after + '}))$', 'ig');
		}
		else if (after>0) {
			var temp ='';
			for (var i=1;i<=after;i++) temp+='x';
			$.validator.messages.numeric_length = 'Укажите число в формате ххх.'+temp+', где количество цифр после точки равно '+(after);
			var re = new RegExp('^((\\d+)|(\\d+[\\.\\,]\\d{'+ after +',' + after + '}))$', 'ig');                       
		}
		else if (len>0) {
			$.validator.messages.numeric_length = 'Укажите число в формате '+all_len+'.xxx, где количество цифр до и после точки вместе не более '+(len);
			var re = new RegExp('^((\\d{1,' + len + '})|(\\d{1,' + (len) + '}[\\.\\,]\\d+))$', 'ig');
		}
		else {
			var re = new RegExp('^((\\d+)|(\\d+[\\.\\,]\\d+))$', 'ig');
			$.validator.messages.numeric_length = 'Укажите число в формате ххх.xxx, где нет ограничений до и после точки';
		}
		
		
		return this.optional(element) || (value.match(re));
	});
	
	
	//Проверить,  params: >=, 0, d(дней), name="name_field_second_date", message (или .class)
	//check_date|>=|0|y|#id_polya|'я&nbsp;текст&nbsp;подсказки'
	//также умеет сравнивать со статичными датами
	//check_date|>=|01.01.1990|date|undefined
	$.validator.addMethod('check_date', function(value, element, params) {
		if(value.length===0) return true;
		var temp = value.split('.');
		value =  new Date(temp[2],(temp[1]*1-1),temp[0]);
		value.setHours(0); value.setMinutes(0); value.setSeconds(0); value.setMilliseconds(0);//текущая дата без учета времени
		
		if (params[4]!==undefined) {
			params[4] = params[4].replace(new RegExp(String.fromCharCode(160), "g"),' ');
			$.validator.messages.check_date = params[4];
			for (var i=0;i<3;i++) $.validator.messages['check_date_'+i] = params[4];
		}
		else {
			$.validator.messages.check_date = $.validator.messages.regex;
			for (var i=0;i<3;i++) $.validator.messages['check_date_'+i] = $.validator.messages.regex;
		}
		
		if (params[3]!==undefined&&params[3]!=='undefined'&&params[3]!=false) {
			var temp = $(params[3]).val();
			var pole = $(params[3]);
			if (pole.closest('.wrap').css('display')==='none'||temp.length===0) return true;
			
			if (!pole.is('input.date_field')||pole.is('input.date_field')&&temp.length===10) {
				setTimeout(function (){
					if (typeof field_recursion_level==='undefined') field_recursion_level = 0;
					if (field_recursion_level<3) {field_recursion_level++; pole.valid();}
					else field_recursion_level = 0;
				}, 100);
			}
			var temp2 = temp.split('.');
			var old = new Date(temp2[2],(temp2[1]*1-1),temp2[0]);
			old.setHours(0); old.setMinutes(0); old.setSeconds(0); old.setMilliseconds(0);//текущая дата без учета времени
			var diff = Math.floor(value.getTime() - old.getTime());
		
			
		}
		else var diff = value.getTime();
			
			var count = false;
			switch (params[2]){
				case 'd':
					count = params[1]*86400000;
					break;
				case 'h':
					count = params[1]*3600000;
					break;
				case 'm':
					count = params[1]*60000;
					break;
				case 's':
					count = params[1]*1000;
					break;
				case 'y':
					count = params[1]*31557600000;
					break;
				case 'date':
					var temp2 =  params[1].split('.');
					var choose_date = new Date(temp2[2],(temp2[1]*1-1),temp2[0]);
					choose_date.setHours(0); choose_date.setMinutes(0); choose_date.setSeconds(0); choose_date.setMilliseconds(0);//текущая дата без учета времени
					count = choose_date.getTime();
					break;
				default:
				//по умолчанию timestamp в микросекундах
				count = params[1];
				break;
			}
			switch (params[0]){
				case '>':
					return (diff>count);
					break;
				case '>=':
					return (diff>=count);
					break;
				case '<':
					return (diff<count);
					break;
				case '<=':
					return (diff<=count);
					break;
				case '=':
				case '==':
					return (diff===count);
					break;
				default:
					console.error('Не верный параметр для сравнения');
					return false;
				break;
			}
		

	});
	//сделаем заглушки, чтобы можно было check_date вешать еще 3 раза на 1 поле
	for (var i=0;i<3;i++) 
		$.validator.addMethod('check_date_'+i, function(value, element, params) {
			return $.validator.methods.check_date.call(this, value, element, params);
		},$.validator.messages.check_date);
	
	//Проверить, что возвраст больше 14
	$.validator.addMethod('larger_date_14', function(value, element, params) {
		if(value.length==0) return true;
		
		var temp = value.split('.');
		value =  new Date(temp[2],(temp[1]*1-1),temp[0]);
		var now = new Date();
		if (params!=undefined&&params.length>1&&$(params).length>0) {
			var temp = $(params).val().split('.');
			var old = new Date(temp[2],(temp[1]*1-1),temp[0]);
			var age = Math.floor((value.getTime() - old.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		else {
			var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени
			var age = Math.floor((now.getTime() - value.getTime())/(24 * 3600 * 365.25 * 1000));
		}
		
		if (age >= 14) return true;
		else return false;
	});
	//Проверить, что возвраст больше определенного возвраста, переданного в params validator="larger_age|18"
	$.validator.addMethod('larger_age', function(value, element, params) {
		if (value.length===0) return true;
		if (!value.match(/\./i)||params==undefined||isNaN(parseInt(params))) return false;
		var temp = value.split('.');
		value =  new Date(temp[2],(temp[1]*1-1),temp[0]);
		var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени
		var age = Math.floor((now.getTime() - value.getTime())/(24 * 3600 * 365.25 * 1000));
		if (age >= parseInt(params)) return true;
		else return false;
	});
		//Проверить, что возвраст меньше определенного возвраста, переданного в params validator="not_larger_age|18"
	$.validator.addMethod('not_larger_age', function(value, element, params) {
		if (value.length===0) return true;
		if (!value.match(/\./i)||params==undefined||isNaN(parseInt(params))) return false;
		var temp = value.split('.');
		value =  new Date(temp[2],(temp[1]*1-1),temp[0]);
		var now = new Date(); now.setHours(0); now.setMinutes(0); now.setSeconds(0); now.setMilliseconds(0);//текущая дата без учета времени
		var age = Math.floor((now.getTime() - value.getTime())/(24 * 3600 * 365.25 * 1000));
		if (age <= parseInt(params)) return true;
		else return false;
	});

	// фото из фоторедактора
	$.validator.addMethod('photoeditor_photo', function(value, element) {
		if (!element.value || $('#photoeditor_alert').text()) {
			return false;
		} else {
			return true;
		}
	});
	
	$.validator.addMethod('date', function(value, element) {
		if (!element.value || !(new RegExp('^[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}$', '').test(value))) {
			return false;
		}

		var year = element.value.substring(6, 10);
		var month = element.value.substring(3, 5);
		var day = element.value.substring(0, 2);
		if (month > 12 || month < 1 || day > 31 || day < 1) {
			return false;
		}

		return true;
	});
	// проверка СНИЛС
	$.validator.addMethod('snils', function(value, element) {
		if (value === '')
			return true;
		if (!/^\d{3}-\d{3}-\d{3} \d\d$/.test(value))
			return false;
		var strippedVal = value.replace(/[- ]/g, '');
		var no = strippedVal.substr(0, 9), check = strippedVal.substr(9);
		if (/(\d)\1\1/.test(no))
			return false; // номер не может содержать 3 одинаковые цифры подряд
		for (var i = 8, sum = 0; i >= 0; i--)
			sum += no.charAt(i) * (9 - i);
		var modulo = sum % 101;
		if (modulo == 100)
			modulo = 0;
		return modulo == parseInt(check, 10);
	});
	// проверка окпо
	$.validator.addMethod('okpo', function(value, element) {
		switch(value.length) {
		case 0: //пусто 
		case undefined:
			return true;
			break;
		case 1: //только контрольная цифра
			return false
			break;
		default:
			if (value.length!=8&&value.length!=10) return false;
			var need_kontr = value.substr(-1); //контрольное число
			var stroka = value.slice(0, -1); //сама строка оставшаяся
			var sum = 0;
			var weight = 1;
			for (var i=0;i<=stroka.length-1;i++) {
				if (weight>10) weight=1;
				sum+=stroka[i]*weight;
				weight++;
			}
			var real_kontr = sum%11; 
			if (real_kontr==10) {
				//разряд равен 10, значит нужно заново со смещением
				var sum = 0;
				var weight = 3;
				for (var i=0;i<=stroka.length-1;i++) {
					if (weight>10) weight=3;
					sum+=stroka[i]*weight;
					weight++;
				}
				real_kontr = sum%11;
				if (real_kontr == 10) real_kontr = 0;
			}
			return (real_kontr==need_kontr);
			
			break;
	}
		
		
		
	});
	// проверка ЕПД
	var epdFactors = [5, 8, 4, 2, 1, 6, 3, 7, 9];
	$.validator.addMethod('epd', function(value, element) {
		if (value === '')
			return true;
		if (!/^\d{10}$/.test(value))
			return false;
		for (var i = 0, sum = 0; i < 9; ++i)
			sum += epdFactors[i] * value.charAt(i);
		return (sum % 11) % 10 == parseInt(value.substr(9));
	});
	// проверка ИНН
	var innFactors = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
	//Оставлен для совместимости
	$.validator.addMethod('inn', function(value, element, params) {
		if (value === '')
			return true;
		if (params == 'person') { // физлица
			if (!/^\d{12}$/.test(value))
				return false;
			for (var i = 0, sum = 0; i < 10; ++i)
				sum += innFactors[i + 1] * value.charAt(i);
			if ((sum % 11) % 10 != parseInt(value.substr(10, 1)))
				return false;
			for (var i = 0, sum = 0; i < 11; ++i)
				sum += innFactors[i] * value.charAt(i);
			return (sum % 11) % 10 == parseInt(value.substr(11));
		}
		else { // юрлица
			if (!/^\d{10}$/.test(value))
				return false;
			for (var i = 0, sum = 0; i < 9; ++i)
				sum += innFactors[i + 2] * value.charAt(i);
			return (sum % 11) % 10 == parseInt(value.substr(9));
		}
	});
	//Валидация физ ИНН
		$.validator.addMethod('inn_fiz', function(value, element) {
			if (value === '')
				return true;
			
				if (!/^\d{12}$/.test(value))
					return false;
				for (var i = 0, sum = 0; i < 10; ++i)
					sum += innFactors[i + 1] * value.charAt(i);
				if ((sum % 11) % 10 != parseInt(value.substr(10, 1)))
					return false;
				for (var i = 0, sum = 0; i < 11; ++i)
					sum += innFactors[i] * value.charAt(i);
				return (sum % 11) % 10 == parseInt(value.substr(11));
		});
	//Валидация юр ИНН
		$.validator.addMethod('inn_ul', function(value, element) {
		if (value === '')
			return true;
			if (!/^\d{10}$/.test(value))
				return false;
			for (var i = 0, sum = 0; i < 9; ++i)
				sum += innFactors[i + 2] * value.charAt(i);
			return (sum % 11) % 10 == parseInt(value.substr(9));
		});
	// проверка КПП
	$.validator.addMethod('kpp', function(value, element) {
		return value === '' ||  /^\d{4}[0-9A-Z]{2}\d{3}$/.test(value);
	});
	// проверка кадастрового номера
	$.validator.addMethod('kadastr_check', function(value, element) {
		return $.validator.methods.check_kadastr.call(this, value, element);
	});
	// проверка БИК
	$.validator.addMethod('bik', function(value, element) {
		if (value === '') return true;
		if ((/^04\d{7}$/.test(value))==false) return false;
		//проверка по разрядам
		//1-2 разряды слева — код Российской Федерации. Используется код — «04»;
		//3-4 разряды слева - принимает цифровые значения по ОК 019-95
		//7-9 разряды слева —  принимает цифровые значения от «050» до «999», «000», «001», «002»
		var subst = Number(value.substr(6,3));
		return (
			($.inArray(value.substr(2,2),['02','06','09','13','16','21','23','31','35','39','43','48','51','55','59','62','67','72','74']) == -1)&&
			(((subst>=50)&&(subst<=999))||((subst>=0)&&(subst<=2)))
		);
	});
    // проверка ОКВЭД
    $.validator.addMethod('okved', function(value, element) {
        if (value === '') return true;
        else return /^\d{2}\.\d{2}(\.\d{1,2}|)$/.test(value);
    });
	//проверка ЛС
    $.validator.addMethod('ls', function(value, element) {
        if (value === '') return true;
        if (value.length===11) {
            return /^\d{5}[0-9A-ZА-ЯЁ]{1}\d{5}$/.test(value);
        }
        else return /^\d+$/.test(value);
    });
    // свидетельство о рождении в формате XIV-МЮ №777777, знак номера необязателен, допускаются промежуточные пробелы
	$.validator.addMethod('birth_cert', function(value, element) {
		return ( (value === '') || ( (value == undefined)?false:value.match(/^[CDILMVX]+\s*-\s*[А-ЯЁ]{2}\s+[№N]?\s*\d{6}$/) ) );
	});
	// серия свидетельства о рождении
	$.validator.addMethod('birthCertSerial', function(value, element) {
	return value === '' || /^[CDILMVX]+-[А-ЯЁ]{2}$/.test(value);
	});

	// валидация ФИО
	$.validator.addMethod('fio', function(value, element) {
		 return value === '' || ((value == undefined) ? false : value.match(/^[а-яё]+([- \`\']{1}[а-яё]+)*\.{0,1}$/i));
	});
	// валидация float
	$.validator.addMethod('float', function(value, element) {
		return value === '' || ((value == undefined)?false:value.match(/^[0-9]+[\.\,]{0,1}[0-9]*$/i));
	});
	// валидация ОГРН
	$.validator.addMethod('check_ogrn', function(value, element) {
		if (value === '') return true;
		if (!/^\d{13}$/.test(value))return false;
		var ost = value.substr(0,value.length-1)%11;
		if (ost==10) ost = 0;
		return (ost==value.substr(-1));
	});
	// валидация ОГРНИП
	$.validator.addMethod('check_ogrnip', function(value, element) {
		if (value === '') return true;
		if (!/^\d{15}$/.test(value))return false;
		var ost = value.substr(0,value.length-1)%13;
		if (ost>=10) ost = ost-10;
		return (ost==value.substr(-1));
	});
	$.validator.addMethod('phone_num', function(value, element) {
		return value === '' ||  ((value == undefined)?false:/^[0-9\-\(\) ]+$/i.test(value));
	});
	//Номер квартиры с возможной буквой в конце
	$.validator.addMethod("flat", function(value, element) {
		return value === '' ? true : /^[0-9IVX]+[а-яё]{0,1}[\-\;]{0,1}[0-9IVX]*[а-яё]{0,1}$/ig.test(value);
	});
	//диапазон значений от 1:20 например. validator="count|1:20"
	$.validator.addMethod("count", function(value, element, params) {
		if (value.length===0) return true;
		value = value*1;
		if (params==undefined||!params.match(/\:/i)) return false;
		var param = params.split(':');
		if (param.length<2) return false;
		return (value>=param[0]*1&&value<=param[1]*1);
	});
	// валидация названий организаций 
	$.validator.addMethod('main', function(value, element) {
		return value === '' ||  ((value == undefined)?false:value.match(/^[а-яёa-z\<\>\+\:\;\*0-9\^\_\.\-\'\"#№@\»`\«&,!\(\)\s\/\[\]]+$/i));
	});
	$.validator.addMethod('main_ru', function(value, element) {
		return value === '' ||  ((value == undefined)?false:value.match(/^[а-яё\+\:0-9\<\>\^\_\.\-\'\"#№@\»`\«&,\(\)\s!\/\[\]]+$/i));
	});
	$.validator.addMethod('captcha', function(value, element) {
		return value === '' ||  ((value == undefined)?false:value.match(/^[а-яё]+$/i));
	});
	$.validator.addMethod('check_kadastr', function(value, element) {
		if (value.length==0) return true;
		return (value.match(/^[0-9]{2}:[0-9]{1,2}:[0-9]{1,10}:[0-9]+$/i));
	});
	// номер свидетельства о рождении
	$.validator.addMethod('birthCertNo', function(value, element) {
		return value === '' || value.match(/^\d{6}$/);
	});
    
    //4 валидатора ОМС
    //возможность ввода  только 16 цифр
	$.validator.addMethod('chknew_oms', function(value, element) {
		return value === '' || value.match(/^\d{16}$/);
	});
    
    //Возможность ввода до 6 букв русского или латинского алфавита /[0-9a-zA-ZА-яЁё]/, остальное цифры
	$.validator.addMethod('chkold_oms', function(value, element) {
		return value === '' || value.match(/^[0-9a-zA-ZА-яЁё]{6}\d*$/);
	});
    
    //Возможность ввода от 6 знаков
	$.validator.addMethod('chkanc_oms', function(value, element) {
		return value === '' || value.match(/^\d{6}\d*$/);
	});
    
    //Возможность ввода 9 цифры
	$.validator.addMethod('chktemp_oms', function(value, element) {
		return value === '' || value.match(/^\d{9}|\d{16}$/);
	});

    
	// для документов: должен быть выдан после даты рождения, взятой из указанного поля
	$.validator.addMethod('validDocDate', function(value, element, birthdateField) {
		if (birthdateField.val() == '' || value == '')
			return true;
		var docDate = new Date(value.substring(3, 5) + '/' + value.substring(0, 2) + '/' + value.substring(6, 10));
		var birthdate = birthdateField.val();
		birthdate = new Date(birthdate.substring(3, 5) + '/' + birthdate.substring(0, 2) + '/' + birthdate.substring(6, 10));
		return birthdate <= docDate;
	});
	//допустимые типы файлов 
	$.validator.addMethod('accept', function(value, element, param) {
		param = typeof param === 'string' ? param.replace(/,/g, '|') : 'png|jpe?g|gif';
		return this.optional(element) || value.match(new RegExp('.(' + param + ')$', 'i'));
	}, $.format('Введите имя файла с разрешённым расширением.'));
    
     $.validator.addMethod('notValidClass', function (value, element, params) {
        if (params !== 'undefined')
            $.validator.messages.notValidClass = params;
        return !$(element).hasClass('notValidClass');
    }
    );

    $.extend($.validator.messages, {
        required: "Поле обязательно для заполнения",
        remote: "Исправьте поле",
        email: "Введите корректный адрес электронной почты",
        url: "Введите правильный URL",
        date: "Введите правильную дату",
        dateISO: "Введите правильную дату (ISO)",
        number: "Введите правильную цифру",
        digits: "Введите правильное число",
        creditcard: "Введите правильный номер кредитной карты",
        equalTo: "Введите значение повторно",
        accept: "Укажите файл с допустимым расширением",
        maxlength: $.validator.format("Введите не более {0} символов"),
        minlength: $.validator.format("Введите не менее {0} символов"),
        rangelength: $.validator.format("Введите значение не менее {0} и не более {1} символов"),
        range: $.validator.format("Введите значение между {0} и {1}"),
        birthdate_and_passport: 'На момент получения паспорта должно быть не менее 14 лет',
        not_larger_date_18: 'На момент подачи заявления должно быть не более 18 лет',
        larger_date_18: 'На момент подачи заявления должно быть не менее 18 лет',
        not_larger_date_14: "На момент подачи заявления должно быть не более 14 лет",
        larger_date_14: "На момент подачи заявления должно быть не менее 14 лет",
        snils: "Введите верный СНИЛС",
        okpo: "Введите верный ОКПО",
        inn_fiz: "Введите верный ИНН, состоящий из 12 цифр",
        inn_ul: "Введите верный ИНН, состоящий из 10 цифр",
        kpp: "Введите верный КПП, состоящий из 9 цифр",
        bik: "Введите верный БИК, состоящий из 9 цифр",
        fio: "Допускаются для ввода только русские буквы, пробел, тире и апостроф",
        float: "Введите верное дробное число. Пример, 3.54",
        check_ogrn: "Укажите верный ОГРН, состоящий из 13 цифр",
        check_ogrnip: "Укажите верный ОГРНИП, состоящий из 15 цифр",
        date_in_future: "Укажите дату в будущем",
        date_in_future_and_now: "Укажите дату в будущем или сегодня",
        date_in_past: "Укажите дату в прошлом",
        main_ru: "Не допускается ввод латинских букв и необычных знаков",
        max: $.validator.format("Введите значение не более {0}"),
        min: $.validator.format("Введите значение не менее {0}"),
        flat: "Введите правильный номер квартиры (например, 42 или 339б)",
        back: "Исправьте связанное поле",
        count: $.validator.format("Введите число в рамках допустимого интервала [{0}]"),
        larger_age: $.validator.format("На момент подачи заявления должно быть не менее {0} лет"),
        not_larger_age: $.validator.format("На момент подачи заявления должно быть не более {0} лет"),
        check_date: 'Введите правильную дату',
        datecompare: 'Дата "с" должна быть ранее Даты "по"',
        file_not_in_progress: "Необходимо дождаться окончания загрузки файла или отменить её",
        month_year_interval_not_less: 'Дата "с" должна быть ранее Даты "по"',
        month_year_interval_in_past_and_now: 'Укажите дату в прошлом или сегодня',
        month_year_interval_valid: 'Укажите корректную дату',
        month_year_interval_in_future_and_now: 'Укажите дату в будущем или сегодня',
        require_from_group: $.format("Необходимо заполнить хотя бы {0} из этих полей"),
        captcha: "Введите код из строчных кириллических букв"
//		numeric_length:'Поле заполнено неверно'

    });
    for (var method in $.validator.messages)
        if (typeof ($.validator.messages[method]) === 'undefined')
            $.validator.messages[method] = 'Поле заполнено неверно';

})(jQuery);