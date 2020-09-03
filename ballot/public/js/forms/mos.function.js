// боремся с IE
function resetFileInput(file) {
    file.val('');

    if (file.val() !== '') { // борьба с IE
        file.wrap('<form>').closest('form').get(0).reset();
        file.unwrap();
    }
    window.setTimeout(function() {
        //file.trigger('change');
        file.prev('label').remove();
    }, 0);
}

function HierarchyOpenCatalog(res, id) {
    if ($('#items-' + id).css('display') === 'none') {
        $($('#items-' + id).slideDown('fast'));
        $(res).addClass('active');
    } else {
        $($('#items-' + id).slideUp('fast'));
        $(res).removeClass('active');
    }
}

function HierarchyOpenCatalogCategory(res, mainId) {
    if ($(res).hasClass('item-active')) {
        $(res).removeClass('item-active')
        $(res).find('a').eq(0).html('+');
        $(res).next().slideUp('fast');
    } else {
        var old = $('#items-' + mainId).find('div.item-active');
        old.removeClass('item-active').find('a').eq(0).html('+');
        old.next().slideUp('fast');
        $(res).addClass('item-active');
        $(res).find('a').eq(0).html('-');
        $(res).next().slideDown('fast');
    }
}


//универсальные функции преобразований
function countdown_timestamp_to_str(timestamp,show_sec){
    //timestamp в микросекундах
    //show_sec показывать секунды
    if (timestamp===undefined) return false;
    var days = Math.floor(timestamp/86400000);
    timestamp = timestamp - days*86400000;
    var hours = Math.floor(timestamp/3600000);
    timestamp = timestamp - hours*3600000;
    var min = Math.floor(timestamp/60000);
    var sec = Math.floor((timestamp - min*60000)/1000);

    return (days>0?days+' д ':'')+(hours>0?hours+' ч ':'')+(min>0?min+' мин ':'')+(sec>0&&show_sec?sec+' c ':'');

}

function init_timer(timestamp,id,show_sec,period,all_timestamp,callback) {

    if (period===undefined||(period<60000&&!show_sec)) period=60000;
    if (timestamp===undefined) { console.log('Ошибка инициализации таймера с параметром timestamp='+timestamp); return false;}
    //обработаем контейнеры куда будем присылать, желательно id  чтоб разделять, или null чтобы все одинаковые были
    var dop='';
    if (id!==undefined) dop='#'+id;
    else id = 0;

    if (typeof timers[id] !== 'undefined' )clearInterval(timers[id]['timer']);
    timers[id] = {
        'time':timestamp,
        'period':period,
        'alltime':all_timestamp,
        'callback':{},
        'show_sec':show_sec,
        'func':function(id,dop){
            var all_width = $('.timer'+dop+' .timer_bg').width();
            if (!$.isEmptyObject(timers[id]['callback']))
                for (var i in timers[id]['callback']) {
                    if (!timers[id]['callback'][i]['is_runned']&&i>=timers[id]['time'])	{
                        timers[id]['callback'][i]['func']();
                        timers[id]['callback'][i]['is_runned'] = true;
                    }
                }
            if (timers[id]['time']<=0) {
                clearInterval(timers[id]['timer']);
                $('.timer'+dop+' .timer_active').width(0).show();
                $('.timer'+dop+' .timer_text').width(all_width).html('Время вышло').show();
                $('.timer'+dop).hide();
                return (callback!=='undefined'&&callback)?callback():0;
            }
            else {
                //просчитаем ширину
                var width = Math.floor(all_width*(timers[id]['time']/timers[id]['alltime'])-22);

                //проставим значение
                $('.timer'+dop+' .timer_active').width(width).show();
                $('.timer'+dop+' .timer_text').width(all_width).html(countdown_timestamp_to_str(timers[id]['time'],timers[id]['show_sec'])).show();
                $('.timer'+dop).show();
            }
            timers[id]['time'] = timers[id]['time']-timers[id]['period'];
        }
    };
    timers[id]['timer'] = setInterval(function() { timers[id].func(id,dop); },period);
    timers[id].func(id,dop);
    return 	timers[id]['timer'];
}

function add_callback(timestamp,id,callback) {
    if (timestamp!==undefined&&timestamp>0&&callback!==undefined){
        var dop='';
        if (id!==undefined) dop='#'+id;
        else id = 0;
        if (typeof timers[id] !== 'undefined') {
            timers[id]['callback'][timestamp]={'func':callback,'is_runned':false};
        }
        else console.log('Таймера с таким id не найдено');
    }
}

function del_callback(timestamp,id){
    if (timestamp!==undefined&&timestamp>0&&callback!==undefined){
        var dop='';
        if (id!==undefined) dop='#'+id;
        else id = 0;
        if (typeof timers[id] !== 'undefined') {
            delete  timers[id]['callback'][timestamp];
        }
    }
}


function del_timer(id){
    var dop='';
    if (id!==undefined) dop='#'+id;
    else id = 0;
    if (typeof timers[id] !== 'undefined' ) {
        clearInterval(timers[id]['timer']);
        delete timers.id;
        $('.timer'+dop).hide();
        return true;
    }
    return false;
}

function init_pmulti($container){

    $container.find('.multiblock-control a.block-button, .pmulti_link').filter(function(){return $(this).data('increment-function') === undefined; }).data('increment-function', function(action, counter, value) {
        switch (action) {
            case 'init' :
                if (typeof FormController.dynamicCounters[counter] === 'undefined')
                    FormController.dynamicCounters[counter] = 0;
                break;
            case 'get':
                return FormController.dynamicCounters[counter];
            case 'next':
                FormController.dynamicCounters[counter]++;
                break;
            case 'prev':
                FormController.dynamicCounters[counter]--;
                break;
            case 'set':
                FormController.dynamicCounters[counter] = value*1;
                break;
            default:
                FormController.dynamicCounters[counter] = action;
                break;
        }
    });

    //старый мультиблок
    $container.find('.multiblock-control').off('click.controller').on('click.controller', function(event) {
        event.stopPropagation();
        var $btn = $(this).find('a.block-button');
        var $inputBlock;
        var counter = $btn.data('increment-function');
        if ($btn.data('template-block'))
            $inputBlock = $btn.data('template-block');
        counter('init', $btn.data('template-id'));
        if ($btn.data('expended') === undefined || !$btn.data('expended')) {
            $inputBlock = $('<fieldset/>').addClass($(this).attr('data-template-container-class')+" no-legend up-arrow hidden");
            $btn.removeClass('add').addClass('selected').closest('.multiblock-control').after($inputBlock);
            $btn.data('template-block', $inputBlock);
            $inputBlock.empty().append(OPR.templater($btn.data('template-id'), {multiblockCounter: counter('get', $btn.data('template-id'))+1}));
            FormController.initialize($inputBlock);
            var $saveBtn = $inputBlock.find('.multiblock-save-cancel .multiblock-save');
            var $cancelBtn = $inputBlock.find('.multiblock-save-cancel .multiblock-cancel');
            $saveBtn.data('template-block', $inputBlock);
            $cancelBtn.data('template-block', $inputBlock);
            if ($saveBtn.attr('data-change')!==undefined) {
                eval($saveBtn.attr('data-change'));
            }
            $saveBtn.off('click.controller').on('click.controller', function() {
                var $inputBlock = $(this).data('template-block');

                if (!check_validation_block_for_multiblock($inputBlock))
                    return false;

                $inputBlock.slideUp('slow', function() {
                    $inputBlock.removeClass('up-arrow').removeClass('hidden').show();
                    $inputBlock.find('.multiblock-save-cancel').remove();
                    $btn.closest('.multiblock-control').before($inputBlock);
                    $btn.data('template-block', undefined);
                    $btn.removeClass('selected').addClass('add');
                    $btn.data('expended', false);
                    counter('next', $btn.data('template-id'));
                });
                return false;
            });
            $cancelBtn.off('click.controller').on('click.controller', function() {
                var $inputBlock = $(this).data('template-block');
                $inputBlock.slideUp('slow', function() {
                    $btn.removeClass('selected').addClass('add');
                    $btn.data('template-block', undefined);
                    $inputBlock.remove();
                    $btn.data('expended', false);
                });
                return false;
            });
            $inputBlock.slideDown('slow', function() {
                $btn.data('expended', true);
            });
        } else {
            $inputBlock.slideUp('slow', function() {
                $btn.removeClass('selected').addClass('add');
                $btn.data('template-block', undefined);
                $inputBlock.remove();
                $btn.data('expended', false);
            });
        }
        return false;
    });



// Новый мультиблок
// Без сохранения, а также мультиблок в мультиблоке
//
//
//
//Мульти блок без сохранения

    //Инициализация ссылок на добавление мультиблока
    $container.find('.pmulti_link').off('click.controller').on('click.controller', function(event,container) {
        var $btn = $(this);
        var callback = $btn.closest('.pmulti').data('callback');
        var pmulti = $btn.closest('.pmulti');
        var $tid = $btn.data('template-id');
        var counter = $btn.data('increment-function');
        //иницилизируем счетчик
        counter('init',$tid);
        //var $input_block = $('<div></div>');

        if (pmulti.css('display') != 'none'&&!draft_in_process) {
            //Проверим валидацию предыдущих полей документов, прежде чем добавить еще
            if (this.disabled || !check_validation_block_for_multiblock(pmulti.find('> .pmulti_block:not(.valid)').filter(function(){return ($(this).css('display')!=='none')})))
                return false;

            this.disabled = true;
        }

        var serial = pmulti.attr('serial');

        for (var i = 1; i <= serial; i++) {
            count = counter('get', $tid) + 1;
            if (pmulti.attr('max') > 0 && pmulti.attr('max') == pmulti.find('> .pmulti_block').length) {
                if (callback.max && typeof callback.max == 'function') {
                    callback.max.apply(this, [pmulti]);
                }
                break;
            }

            if (callback.add_before && typeof callback.add_before == 'function') {
                if (!callback.add_before.apply(this, [pmulti])) {
                    this.disabled = false;
                    return false;
                }
            }

            //добавим содержимое
            var new_block = $(OPR.templater($tid, {multiblockCounter: count})).hide().addClass('in_load');
            $btn.before(new_block);

            //прогрузим валидаторы, подсказки и тд
            FormController.initialize(new_block);

            //нужно накинуть события на изменения полей, чтобы сбрасывало валидность блока
            new_block.find('select, input:not([type=hidden]),textarea').off('change.block_valid').on('change.block_valid',function(){
                if ($(this).closest('.pmulti').css('display')=='none') $(this).closest('.pmulti').addClass($.validator.defaults.validClass);
                else $(this).parents('.pmulti_block, .pmulti').removeClass($.validator.defaults.validClass);
                return true;
            });
            //нарастим счетчик
            counter('next', $tid);

            if (callback.add_after && typeof callback.add_after == 'function') {
                callback.add_after.apply(this, [pmulti, new_block, count]);
            }

            if (pmulti.css('display')!='none') {
                new_block.removeClass('hidden');
                if (pmulti.attr('max') > 0 && (pmulti.find('> .pmulti_block').length >= pmulti.attr('max'))) {
                    if (callback.max && typeof callback.max == 'function') {
                        callback.max.apply(this, [container]);
                    }
                    $btn.hide();
                }
            }

            //Копирование блоков в мультиблок
            if (callback.copy_block)
                copy_block(pmulti);

            if (parseInt(callback.re_num) >= 0)
                re_num(pmulti,parseInt(callback.re_num));
        }

        //снимим валидацию с блока, при добавлении нового
        pmulti.removeClass($.validator.defaults.validClass);

        $('html, body').animate({
            scrollTop: (pmulti.find('> .pmulti_block').last().offset().top)
        }, 200, function () {
            pmulti.find('> .pmulti_block.in_load').effect('drop', {'mode': 'show'}, 'slow', function () {
                $(this).next('a.pmulti_link').removeAttr('disabled');
                //этот блок загружен
                $(this).addClass('loaded');
            }).removeClass('in_load');
        });
        save_number_pmulti(pmulti);

        return false;
    });

    //инициализация мультиблоков первичная
    $container.find('.pmulti:not(.loaded)').each(function(){
        var container = $(this);
        var callback = container.data('callback');
        var $btn = container.find('.pmulti_link');
        var $max = container.attr('max')*1;
        var $req = container.attr('count-req')*1;

        if ($max>0&&$max!==0&&$req>=$max) {
            $req = $max;
            $btn.hide();
        }

        if ($req>0) {
            var $tid = $btn.data('template-id');
            var counter = $btn.data('increment-function');
            counter('init',$tid);

            for (var $i=1;$i<=$req;$i++) {
                count = counter('get', $tid)+1;

                if (callback.add_req_before && typeof callback.add_req_before == 'function') {
                    if (!callback.add_req_before.apply(this, [container]))
                        return false;
                }

                var new_block = $(OPR.templater($tid, {multiblockCounter: count}));
                $btn.before(new_block);
                //события запоминания и сбрасывания валидации
                new_block.find('select, input:not([type=hidden]),textarea').off('change.block_valid').on('change.block_valid',function(){
                    if ($(this).closest('.pmulti').css('display')=='none') $(this).parents('.pmulti_block, .pmulti').removeClass($.validator.defaults.errorClass);
                    else $(this).parents('.pmulti_block, .pmulti').removeClass($.validator.defaults.validClass);
                    return true;
                });

                /* вызываем каллбек только при сформированом доме */
                $(function () {
                    if (callback && callback.add_req_after && typeof callback.add_req_after == 'function')
                        callback.add_req_after.apply(this, [container, new_block, count]);
                });

                //сдвинем счетчик
                counter('next', $tid);
                //снимим валидацию с блока, при добавлении нового
                new_block.addClass('loaded').removeClass($.validator.defaults.validClass);;
            }
            //не показывать кнопку удаления блоков, так как они обязательные
            container.find('.pmulti-del').remove();

            //сохраняем номера мультиблоков
            save_number_pmulti(container);


            //событие пересчета номера блоков
            if (callback && parseInt(callback.re_num)>=0)
                re_num(container,parseInt(callback.re_num));
        }

        OPR.FormLoader.addListener(container.attr('id'), function(object, fields) {
            //нечего восстанавливать
            if (object[1]===undefined||object[1].length===0) return [];
            var index_arr = object[1].split(',');
            var file_arr = object[3].split(',');
            var container = $('#'+object[0]);
            var callback = container.data('callback');
            var $btn =container.find('> .pmulti_link');
            var counter = $btn.data('increment-function');
            var $tid = $btn.data('template-id');
            counter('init',$tid);
            var $max = container.attr('max')*1;
            var block_added = container.attr('count-req')*1||0;

            if (index_arr.length>0) {
                for (var j in index_arr) {
                    if (container.find('> .pmulti_block[number="'+index_arr[j]+'"]').length===0) {

                        index_arr[j] = 1 * index_arr[j]; // иначе некорректно восстанавливаются файловые индексы вида file.<%=multiblockCounter+1%>.
                        var old_count = counter('get', $tid);
                        counter('set', $tid,index_arr[j]);
                        var old_file_index = FormController.file_index;
                        if (file_arr[j]!==''&&file_arr[j]!==undefined) {
                            FormController.file_index = file_arr[j];
                        }

                        if (callback.draft_before && typeof callback.draft_before == 'function') {
                            if (!callback.draft_before.apply(this, [container]))
                                return false;
                        } else if (callback.add_req_before && typeof callback.add_req_before == 'function') {
                            if (!callback.add_req_before.apply(this, [container]))
                                return false;
                        }

                        var new_block = $(OPR.templater($tid, {multiblockCounter: index_arr[j]}));
                        $btn.before(new_block);
                        FormController.initialize(new_block);
                        //нужно накинуть события на изменения полей, чтобы сбрасывало валидность блока

                        new_block.find('select, input:not([type=hidden]),textarea').off('change.block_valid').on('change.block_valid',function(){
                            if ($(this).closest('.pmulti').css('display')=='none')
                                $(this).closest('.pmulti').addClass($.validator.defaults.validClass);
                            else $(this).parents('.pmulti_block, .pmulti').removeClass($.validator.defaults.validClass);

                            return true;
                        });

                        /* вешаем коллбек только родительские м.блоки, дочерние м.блоки игнорируются - они пустышки */
                        if (!container.hasClass('pmulti_child')) {
                            count = index_arr[j];
                            if (callback.draft_after && typeof callback.draft_after == 'function')
                                callback.draft_after.apply(this, [container, new_block,count]);
                            else if (callback.add_req_after && typeof callback.add_req_after == 'function')
                                callback.add_req_after.apply(this, [container, new_block,count]);
                            else if (callback.add_after && typeof callback.add_after == 'function')
                                callback.add_after.apply(this, [container, new_block, count]);
                        }

                        if (counter('get', $tid)<=old_count) counter('set', $tid,old_count);
                        if (FormController.file_index<=old_file_index) FormController.file_index = old_file_index;
                        block_added++;
                        new_block.addClass('loaded');
                    }
                }
            }

            if (block_added>=$max&&$max!==0) {
                if (callback.max && typeof callback.max == 'function') {
                    callback.max.apply(this, [container]);
                }

                //скроем кнопку добавить блок
                $btn.hide();
            }

            save_number_pmulti(container);

            if (parseInt(callback.re_num)>=0)
			    re_num(container,parseInt(callback.re_num));

            //if (callback.copy_block) copy_block(container);
            return [];
        });
        //Копирование блоков в мультиблок
        if (callback !== undefined && callback.copy_block) {
            copy_block($(this),true);
        }
        container.addClass('loaded');
    });
    //функция пересчета и сохранения номеров мультиблоков для восстановления черновика
    function save_number_pmulti($container){
        //не пересчитываем скрытым мультиблокам
        if ($container.css('display')=='none' && !$container.hasClass('pmulti_insert'))
        	return true;

        var magic = $container.find('> .magic:first');
        if (magic.length>0) {
            var number = [];
            var files = [];
            //соберем массив номеров мультиблоков
            $container.find('> .pmulti_block').each(function(){number.push($(this).attr('number')); files.push($(this).attr('file'));});
            var temp = magic.val().split('$');
            temp[1] = number; //номера блоков мультиблока

            if ($container.hasClass('pmulti_insert')) {
                var $parent = $container.parents('.pmulti_block,.pmulti_insert');
                temp[2] = $parent.attr('number');
                //заполним теперь правильно мультиблок
                var $proparent = $('#'+$container.attr('vid'));
                var proparent_magic = $proparent.find('> .magic');
                var proparent_number = [];
                var proparent_files = [];

                // вешаем флаг на контейнер скрытых дочерних м.блоков - пустышки
                if (!$proparent.hasClass('pmulti_child'))
                    $proparent.addClass('pmulti_child');

                $('.pmulti_insert[vid="'+$container.attr('vid')+'"] > .pmulti_block').each(function(){proparent_number.push($(this).attr('number')); proparent_files.push($(this).attr('file'));});
                var data = proparent_magic.val().split('$');
                data[1] = proparent_number;
                data[2] = '';
                data[3] = proparent_files;
                proparent_magic.val(data.join('$')).trigger('change');
            }
            else temp[2] = ''; // номера для подблоков мультиблока
            temp[3] = files; //номера файлов
            magic.val(temp.join('$')).trigger('change');
        }
    }

    function add_remove_pmulti($container) {
        //событие удаления блока
        $container.filter(':not(.loaded)').find('.pmulti-del').off('click.controller').on('click.controller',function () {

            var $btn = $(this);
            var $block = $btn.closest('.pmulti_block');
            var container = $btn.closest('.pmulti_insert, .pmulti');
            var pmulti = $('#'+$block.attr('vid'));
            var callback = pmulti.data('callback');

            if (callback.del_before && typeof callback.del_before == 'function') {
                if (!callback.del_before.apply(this, [$block, $btn]))
                    return false;
            }
            //удалим все прикрепленные файлы
            $block.find('.upload-state-done .file-remove').trigger('click.controller');
            
            $block.effect('drop',{'mode':'hide'},'slow',function(){
                //этот блок готов для удаления
                $(this).remove();
                if (pmulti.attr('max') > 0 && (container.find('> .pmulti_block').length < pmulti.attr('max'))) {
                    container.find('.pmulti_link').show();
                }

                if (callback.del_after && typeof callback.del_after == 'function') {
                    callback.del_after.apply(this, [container, $btn]);
                }

                if (parseInt(callback.re_num)>=0)
                    re_num(container,parseInt(callback.re_num));

                save_number_pmulti(container);

                return true;
            });


            return false;
        });
    }
    add_remove_pmulti($container);


    //функция переноса во вложенные мультиблоки
    function copy_block(obj,type_cnt_to_add){
        //type_cnt_to_add - true - количество взять из обязательных
        //false - количество взять из добавляемых вновь
        //[] массив, добавить именно эти
        var container = obj;

        if (!obj.hasClass('pmulti_insert'))
            obj = obj.find('.pmulti_insert:not(.loaded)');
        //вытащили все незаполненные блоки

        $.each(obj, function(){
            //Нашли блок для вставки
            var insert_div = $(this);
            //получим родителя мультиблока
            var parent = insert_div.parents('.pmulti_insert, .pmulti_block').removeClass($.validator.defaults.validClass);
            insert_div.closest('.pmulti').removeClass($.validator.defaults.validClass); //нужно снять кеш валидации блоков
            //запишем номер мультиблока номером родителя
            insert_div.attr('number',parent.attr('number'));
            //блок живородящий
            var block = $('#'+insert_div.attr('vid'));
            count = insert_div.attr('number');
            //функции коллбеки
            var callback = block.data('callback');

            //добавим поле связку родителя с ребенком
            if (insert_div.find('> .magic:first').length===0) {
                /* вызываем коллбеки для дочерних м.блоков */
                if (draft_in_process) {
                    if (callback.draft_after && typeof callback.draft_after == 'function')
                        callback.draft_after.apply(this, [container, insert_div, count]);
                    else if (callback.add_req_after && typeof callback.add_req_after == 'function')
                        callback.add_req_after.apply(this, [container, insert_div, count]);
                    else if (callback.add_after && typeof callback.add_after == 'function')
                        callback.add_after.apply(this, [container, insert_div, count]);
                }

                insert_div.empty();
                insert_div.prepend(block.find('> .magic:first').clone().val(insert_div.attr('vid')+'_'+parent.attr('vid')));
                OPR.FormLoader.addListener(insert_div.attr('vid')+'_'+parent.attr('vid'), function(object, fields) {pmulti_draft_load(object);});
            }

            //кнопка добавления нового блока в живородящем
            var block_add = $('#'+insert_div.attr('vid')+'_sub');
            //развилка, из черновика приедет массив ключей, а по умолчанию они вновь создаются
            if (typeof type_cnt_to_add === 'object') {
                //вытащим все блоки и отфильтруем по нужным индексам
                var blocks_to_add = block.find('> .pmulti_block:not(.used)').filter(function(){return type_cnt_to_add.indexOf($(this).attr('number')) >= 0;});
            }
            else {
                //каскады событий разные в зависимости от типа события
                var cnt_blocks_to_add = type_cnt_to_add?block.attr('count-req'):block.attr('serial');
                //проверим, достаточно ли у нас блоков, для переноса
                if (block.find('.pmulti_block:not(.used)').length<cnt_blocks_to_add) {
                    //не хватает блоков, нужно добавить
                    var d = Math.ceil((cnt_blocks_to_add - block.find('.pmulti_block:not(.used)').length)/block.attr('serial'));
                    for (var i=1;i<=d;i++) {
                        block_add.trigger('click');
                    }
                }
                var blocks_to_add = block.find('> .pmulti_block:not(.used):lt('+cnt_blocks_to_add+')');
            }

            //добавим ссылку добавить новый элемент
            if (insert_div.find('.pmulti_link[bid="' + insert_div.attr('vid') + '"]').length===0) {
                insert_div.append(block.find('.pmulti_link[bid="' + insert_div.attr('vid') + '"]').clone().removeAttr('id').on('click.add', function () {
                    var block = $(this).closest('.pmulti_insert');
                    var parent_block = $('#' + block.attr('vid'));

                    if (block.css('display') != 'none' && !draft_in_process) {
                        //Проверим валидацию предыдущих полей документов, прежде чем добавить еще
                        if (this.disabled  || !check_validation_block_for_multiblock(block.find('> .pmulti_block:not(.valid)').filter(function () {
                            return ($(this).css('display') !== 'none')
                        }))) return false;

                        this.disabled = true;
                        parent_block.find('.pmulti_link').trigger('click');
                        copy_block(block, false);
                    }

                    return false;
                }));
            }

            //получили ссылку на добавление вложенной ссылки
            var cascade_link = insert_div.find('.pmulti_link[bid="' + insert_div.attr('vid') + '"]');


            //добавим перед этой ссылкой
            cascade_link.before(blocks_to_add.addClass('in_load').hide());
            //скроем кнопки удаления
            insert_div.find('> .pmulti_block:not(.used):lt('+block.attr('count-req')+') > .pmulti-del').remove();

            //заменим для гуидов счетчик на актуальный
            insert_div.find('.in_load [value*="%parentMultiblockCounter%"]').val(function( i, val ) {
                return val.replace('%parentMultiblockCounter%',insert_div.attr('number'));
            });

            //оживим кнопки удаления
            add_remove_pmulti(insert_div.find('.in_load'));

            //вдруг не надо ничего делать
            if (callback.add_req_before && typeof callback.add_req_before == 'function') {
                if (!callback.add_req_before.apply(this, [container]))
                    return false;
            } else if (!draft_in_process && callback.add_after && typeof callback.add_after == 'function') {
                callback.add_after.apply(this, [container, blocks_to_add]);
            }

            //пересчитаем нумерацию, если надо
            if (parseInt(callback.re_num)>=0)  re_num(insert_div,parseInt(callback.re_num));
            //вызовем эффект появления
            if (draft_in_process)
                insert_div.find('.in_load').show().removeClass('in_load');
            else {
                var offset, $in_load = insert_div.find('.in_load:first');
                if ($in_load.length) {
                    offset = $in_load.offset().top;
                } else offset = insert_div.offset().top;

                $('html, body').animate({
                    scrollTop: offset
                }, 200, function () {
                    cascade_link.removeAttr('disabled');

                    insert_div.find('.in_load').effect('drop', {'mode': 'show'}, 'slow', function () {
                        //этот блок загружен
                        $(this).addClass('loaded');
                    }).removeClass('in_load');
                });
            }

            //проверим нужна ли видимая ссылка на добавление нового
            if (block.attr('max') > 0 && (insert_div.find('> .pmulti_block').length >= block.attr('max'))) {
                cascade_link.hide();
            }
            else cascade_link.show();
            //поменяем и запомним нумерацию для черновика
            save_number_pmulti(insert_div);
            //закончили обработку
            insert_div.addClass('loaded');
        });

        function pmulti_draft_load( object ) {
            if ( object.length < 3 || object[2] == '' ) return [];

            //ожидаем данные в виде ["idchild_idparent", "1,2", "3",'277']
            var id_arr = object[0].split( '_' );
            var container = $( '#' + id_arr[1] + ' > .pmulti_block[number="' + object[2] + '"] > .pmulti_insert[vid="' + id_arr[0] + '"], .pmulti_insert[vid="' + id_arr[1] + '"] > .pmulti_block[number="' + object[2] + '"] > .pmulti_insert[vid="' + id_arr[0] + '"]' );

            if ( container.length > 1 ) console.error( 'слишком много объектов, что-то не так' );
            container.empty();
            //массив ключей мультиблоков
            var index_arr = object[1].split( ',' );
            //перетащим все элементы из скрытого
            copy_block(container,index_arr);

            return true;

        }
        return true;
    }

    //функция меняющая свиду нумерацию в мультиблоке person_multi
    function re_num( block, start_number ) {
        if ( start_number == undefined ) start_number = 1;
        //при передаче сюда $(this) приедет блок pmulti_block, который удалили
        var is_multi = (block.parents( '.pmulti_block' ).length > 0);

        $.each(block.find('> .pmulti_block'), function() {
            var legend = $( this ).find( 'legend:first' );
            if ( legend.length > 0 && legend.text().match( /№[0-9]+/ig ) ) {
                legend.text( legend.text().replace( /№[0-9]+/, '№' + start_number ) );
            }
            $( this ).attr( 'num', start_number );
            if ( !is_multi )
                $( this ).find( ' .pmulti_counter' ).val( start_number );
            start_number++;
        });

        //произведем перенумерацию счетчика через родительские блоки
        if ( is_multi ) {
            var need_block = block;
            block.closest( '.pmulti_block' ).each( function () {
                if ( $( this ).attr('num')!=undefined&&$( this ).attr('num').length > 0 ) need_block = $(this);
            } );
            block.find( '> .pmulti_block .pmulti_counter' ).val( need_block.attr( 'num' ) );
        }
    }
}

//Сервисные функции
//првоерка валидности полей
function check_validation_block_for_multiblock(block_for_check){
    //var logger = +new Date();
    if (block_for_check.length>0) {
        var $form = block_for_check.closest('form');
        var offset = false;
        var length = 0;

        $.each(block_for_check, function(){
            //console.log('level0',(+new Date()-logger)/1000);

            var $block = $(this);
            $block.find('fieldset:not(.form-step,.pmulti_block.'+$.validator.defaults.validClass+'),.form-step.disabled,div:not(.pmulti_block.'+$.validator.defaults.validClass+')').filter(function(){return ($(this).css('display')=='none')}).addClass('nonvalidation');

            //console.log('level1',(+new Date()-logger)/1000);
            var obj1 = $block.find('.wrap:not(.nonvalidation)');
            //console.log('level1.1',(+new Date()-logger)/1000);
            var obj2 = obj1.filter(function(){return ($(this).closest('.pmulti_block.valid').length==0&&$(this).closest('.nonvalidation').length==0);});
            //console.log('level1.2',(+new Date()-logger)/1000);

            var elements = [
                'input[data-validatefunction*="require_from_group"]',
                'input[required]:not([type=hidden])',
                'input[type=file]:not(.'+$.validator.defaults.validClass+')',
                'textarea[required]',
                'select[required]' // проверяем все селекты!
            ], obj3 = obj2.find(elements.join(', '));

            //console.log('level1.3',(+new Date()-logger)/1000);
            $.each(obj3, function () {
                var $elem = $(this);

                if (!($elem.is($form.data('validator').settings.ignore))) {
                    switch (this.tagName) {
                        case 'INPUT':
                            switch (this.type) {
                                case 'radio':
                                    var wrap = $elem.closest('.wrap');
                                    var inputs = wrap.find('.radiogroup:not(.nonvalidation),.radio:not(.nonvalidation),.holder:not(.nonvalidation)').find('input:radio');
                                    inputs.removeClass($.validator.defaults.errorClass);
                                    wrap.find('label.'+$.validator.defaults.errorClass).remove();
                                    if (inputs.filter(':checked').length>0)
                                        inputs.filter(':checked').valid();
                                    else inputs.not(':disabled').filter(':first').valid();
                                    break;
                                default:
                                    $elem.valid();
                                    break;
                            }
                            break;
                        case 'SELECT':
                            if ($elem.closest('.nonvalidation').length===0)
                                $elem.valid();
                            break;
                        default:
                            $elem.valid();
                            break;
                    }
                }
            });
            //console.log('level2',(+new Date()-logger)/1000);
            //что-то снимает nonvalidation  после первого цикла c div полей например кладра дома
            $block.find('div:not(.nonvalidation)').filter(function(){return ($(this).css('display')=='none')}).addClass('nonvalidation');
            // Нужно добавить класс nonvalidation для следующих элементов (не только для div).
            // Точно так же, как это делается в начале функции.
            $block.find('fieldset:not(.form-step,.pmulti_block.'+$.validator.defaults.validClass+'),.form-step.disabled,div:not(.pmulti_block.'+$.validator.defaults.validClass+')').filter(function(){return ($(this).css('display')=='none')}).addClass('nonvalidation');
            //console.log('level3',(+new Date()-logger)/1000);
            $block.find('.wrap:not(.nonvalidation)')
                .find('input.error:not(:disabled), textarea.error:not(:disabled), select.error:not(:disabled)')
                .filter(function(){return ($(this).closest('.nonvalidation').length==0)}).each(function () {
                if ($(this).prop('tagName') == 'SELECT') {
                    if ($(this).closest('.nonvalidation').length===0) {
                        offset = $(this).next('div').offset();
                        length++;
                        return false;
                    }
                }
                else {
                    offset = $(this).closest('.wrap').offset();
                    length++;
                    return false;
                }
            });

            $block.find('.nonvalidation').removeClass('nonvalidation');
            if (length==0)  $(this).addClass($.validator.defaults.validClass);
            else {
                $(this).removeClass($.validator.defaults.validClass);
                return false;
            }
        });

        if (length > 0&&block_for_check.closest('.messagebox-body').length===0) {
            $('html, body').animate({
                scrollTop: (offset.top-100)
            }, 500);
        }
        if (length>0) return false;
    }
    return true;
}

function messagebox(html, options) {
	$('#messagebox_content').html(html);
	$.colorbox($.extend({}, {width: '500px', inline: true, href: '#messagebox', opacity: 0.4, transition: 'none'}, options));
}

// служебный обработчик для замены введённых букв на русские большие
function ReplaceGibddLetters() {
	var from = 'ABEKMHOPCTYX', to = 'АВЕКМНОРСТУХ';
	var str = this.value.toUpperCase();
	for (var i = 0, l = str.length; i < l; ++i) {
		var x = from.indexOf(str.charAt(i));
		if (x != -1)
			str = str.slice(0, i) + to.charAt(x) + str.slice(i + 1);
	}
	if (str != this.value)
		replaceTextAndRestoreCaret(this, str);
	return true;
}

// служебный обработчик для превращения римских цифр Unicode в ASCII-последовательности
function ReplaceRomanDigits(element) {
	if (element == 'undefined')
		element = this;
	var from = ['\u2160', '\u2161', '\u2162', '\u2163', '\u2164', '\u2165',
		'\u2166', '\u2167', '\u2168', '\u2169', '\u216a', '\u216b',
		'\u216c', '\u216d', '\u216e', '\u216f', 'Х', 'С'];
	var to = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'L', 'C', 'D', 'M', 'X', 'C'];
	var str = element.value.toUpperCase();
	var processedStr = '';
	for (var i = 0, l = str.length; i < l; ++i) {
		var x = from.indexOf(str.charAt(i));
		processedStr += x != -1 ? to[x] : str.charAt(i);
	}
	if (processedStr != element.value)
		replaceTextAndRestoreCaret(element, processedStr);
	return true;
}


//функция меняющая обязательность полей
function change_req( obj, flag, erors_stay) {
    if (obj.is('input[type=hidden]')) { return obj; }
    var old_obj = obj;
    var req_text = '<span class="required">*</span>';
    if (obj.is("input:text")&&obj.closest('.holder').find('input:text').length>0) obj.closest('.holder').find('input:text').filter(function(){return (!$(this).is(obj))}).addClass('required_ignore');
    if ( obj.is( "input,select,textarea" ) ) obj = obj.closest( '.wrap' );
    if (obj.hasClass('stable_req')) return old_obj;
    if (obj.find('.wrap:not(.stable_req)').length>0) {
        var block_change = obj.find('.wrap:not(.stable_req)');
    }
    else var block_change = obj;

    if (block_change.closest('form').length===0) return false;
    block_change.removeClass($.validator.defaults.validClass).find('.'+$.validator.defaults.validClass).removeClass($.validator.defaults.validClass);

    if ( flag ) {
        block_change.find( 'label span:not(.holder label span)' ).remove();
        block_change.find( 'label:not(.holder label)' ).append(req_text);
        if (block_change.find('select, textarea, input:text:not(.required_ignore)').length > 0 )
            block_change.find('select, textarea, input:text:not(.required_ignore)').each( function () {
                $(this).attr('required','required').rules('add', {'required':true});
            } );
        if (block_change.find('input:radio:first-child').length > 0 )
            block_change.find('input:radio:first-child').each( function () {
                $(this).attr('required','required').rules('add', {'required':true});
            } );
        if ( block_change.find('input:file').length > 0 )
            block_change.find('input:file').each( function () {
                $(this).attr('required','required').rules('add', {'required':true});
            } );
        if ( block_change.find('input:checkbox').length > 0 )
            block_change.find('input:checkbox').each( function () {
                var label_checkbox = $(this).closest('.holder').find('label[for="'+$(this).attr('id')+'"]');
                label_checkbox.find('span').remove();
                label_checkbox.append(req_text);
                $(this).attr('required','required').rules('add', {'required':true});
            });
        //случай со стандартным блоком std_dateselect
        if (block_change.hasClass('dateselect')&&block_change.find('>label:first').length==0)
            if (block_change.find('input:text').length>2)
                block_change.find('input:text').each( function () {
                    $(this).prev('span').remove();
                    $(this).before(req_text);
                });

        if (block_change.find('.wrap.dateselect').length>0)
            block_change.find('.wrap.dateselect').each( function () {
                if ($(this).find('>label:first').length==0&&$(this).find('input:text').length>2)
                    $(this).find('input:text').each( function () {
                        $(this).prev('span').remove();
                        $(this).before(req_text);
                    });
            });

    }
    else {
        block_change.find( 'label span:not(.holder label span)' ).remove();
        if ( block_change.find( 'select, textarea, input:text:not(.required_ignore), input:radio, input:file' ).length > 0 )
            block_change.find( 'select, textarea, input:text:not(.required_ignore), input:radio, input:file' ).each( function () {
                //$(this).prev('label.'+$.validator.defaults.errorClass).remove();
                $(this).removeAttr('required').rules( "add", {'required':false} );
                //$(this).closest('.form-block').removeClass($.validator.defaults.errorClass);
            } );
        if ( block_change.find('input:checkbox').length > 0 )
            block_change.find('input:checkbox').each( function () {
                var label_checkbox = $(this).closest('.holder').find('label[for="'+$(this).attr('id')+'"]');
                label_checkbox.find('span').remove();
                $(this).removeAttr( 'required').rules( "add", {'required':false} );

            });
        //случай со стандартным блоком std_dateselect
        if (block_change.hasClass('dateselect')&&block_change.find('>label:first').length==0)
            if (obj.find('input:text').length>2)
                obj.find('input:text').each( function () {
                    $(this).prev('span').remove();
                });

        if (block_change.find('.wrap.dateselect').length>0)
            block_change.find('.wrap.dateselect').each( function () {
                if ($(this).find('>label:first').length==0&&$(this).find('input:text').length>2)
                    $(this).find('input:text').each( function () {
                        $(this).prev('span').remove();
                    });
            });
        if (!erors_stay) FormController.clearErrors(obj);
    }
    obj.find('.required_ignore').removeClass('required_ignore');
    return old_obj;
}
//поддержка вызова в виде метода
$.fn.required = function ( isRequired ) {
    return change_req( $( this ), isRequired );
};
function init_bti(options){
    if (typeof(options) !== 'object') options = {};
    $('.bti').filter(function(){return ($(this).attr('id')!=undefined)}).each(function(){
        if (!$(this).hasClass('loaded')) {
            attachOOAddressProcessing($(this).attr('id'), $.extend({
                validate: true,
                validateFlat: true,
                showRoom: false,
                skipFlat: false,
                okato: true,
                unom: true,
                allowHistorical: true,
                allowNewMoscow: true,
                allowAlternatives: true
            },options));
            $(this).addClass('loaded');
        }
    });

}
function init_kladr(options){
    if (typeof(options) !== 'object') options = {};
    $('.kladr').filter(function(){return ($(this).attr('id')!=undefined)}).each(function(){
        if (!$(this).hasClass('loaded')) {
            attachKladrProcessing($('#'+$(this).attr('id')), $.extend({
                validate: true,
                validateFlat: true,
                defaultRegion: 7700000000000,
                skipkladr: false,
                includeOkato: true
            },options));
            $(this).addClass('loaded');
        }
    });
}
//для ff 38 и также всплывающие подсказки в современных бравзерах, display block ломал все полностью, сделали умнее скрытие показ, 
$.fn.show = function (){
    $(this).removeClass('hidden');
	if ($(this).length>1) {
		$(this).each(function(key,item){
			change_visible($(item));
		});
	}
	else if ($(this).length===1) {
		change_visible($(this));
	}
    $(this).closest('.pmulti_block').removeClass($.validator.defaults.validClass);
	function change_visible(item) {
		if (item.data('old_display')!==undefined&&item.data('old_display')!=='none') {
				item.css('display',item.data('old_display'));
			}
		else if (item.css('display')==='none')
			if (item.hasClass('wrap')||item.hasClass('button')||item.hasClass('btn-group')||item.hasClass('form-infobox'))
				item.css('display','inline-block');
			else
				switch (item.get(0).tagName.toLowerCase()) {
					case 'legend':
						item.css('display','inline-block');
						break;
					case 'tbody':
						item.css('display','table-row-group');
						break;
					case 'thead':
						item.css('display','table-header-group');
						break;
					case 'tr':
						item.css('display','table-row');
						break;
					case 'table':
						item.css('display','table');
						break;
					default:
						item.css('display','block');
					break;
				}
	}
	return $(this);
};
function uniqueArray(array) {
    var ii, item, new_array = [];
    var result = [];

    for (ii=0; ii<array.length; ii++) {
        item = array[ii];

        if (!new_array[item]) {
            new_array[item] = item;
        }
    }

    for (item in new_array) {
        result[result.length] = new_array[item];
    }

    return result;
};
/**
 * Заполняет список на основе массива объектов
 * @param data массив со значениями
 * @param element объект jQuery
 * @param settings настройки
 */
function fillSelectArray(data, element, settings) {
	if (typeof (data) == 'undefined')
		return;
	var defaultOptions = {
		selectedId: null,
		empty: {
			label: '-- выберите значение из списка --',
			value: ''
		},
		fields: {value: 'id', label: 'name'}	//имена полей с данными
	};
	settings = $.extend({}, defaultOptions, settings);
	var preservedValue;
	preservedValue = element.val();
	if (settings.selectedId != null)
		preservedValue = settings.selectedId;
	element.children().remove();
	var preservedValueExistsFlag = false;
	var k, val, lbl;
	if (settings.empty != null) {
		element.addOption2Select(settings.empty.label, settings.empty.value);
	}
	else element.addOption2Select('', '');

	for (k = 0; k < data.length; k++) {
		val = data[k][settings.fields.value];
		lbl = data[k][settings.fields.label];
		if (val == preservedValue)
			preservedValueExistsFlag = true;
		element.addOption2Select(lbl, val);
	}

	if (preservedValue != null && preservedValueExistsFlag) {
		element.val(preservedValue);
	}

	if (element.trigger != undefined)
		element.trigger('chosen:updated');
}
//позволяет добавить значение в селект // deprecated
$.fn.addOption2Select = function(label, value, isDefault) {
    var opt;
    if (typeof (isDefault) === 'undefined')
        isDefault = false;
    opt = new Option(label, value, isDefault, isDefault);
    $(opt).html(label); //IE8
    $(this).append(opt);
    return $(this);
};
//позволяет заполнить всецело селект
$.fn.fillSelect = function (data, valueChecked, noEmpty) {
    if (noEmpty) {
        var html = '';
    }
    else {
        var html = '<option value="">Выбрать...</option>';
    }
    for (var k in data) {
        html += '<option value="' + k + '" ' + (valueChecked == k ? 'checked="checked"' : "") + '>' + data[k] + '</option>';
    }
    var checkedValue = $(this).empty().html(html).find('> option').filter(':checked');
    if (checkedValue.length === 0 && noEmpty) {
        $(this).find('> option:first').attr('checked', 'checked');
        checkedValue.push(1);
    }
    $(this).trigger('chosen:updated');
    if (checkedValue.length > 0)
        $(this).trigger('change');

    return $(this);
};

$.fn.scrollSelf = function (speed, callback) {
    $('html').stop().animate({
            scrollLeft: 0,
            scrollTop: $(this).offset().top - $('.mos-header').height() || 0
        }, speed, false, callback
    );
};

var scrollDecorator = (function () {
    function show($container) {
        var ns = $container.niceScroll({
            cursorcolor: '#92a5ac',
            cursoropacitymin: 1,
            cursorwidth: '7px',
            cursorborder: 'none',
            cursorborderradius: '4px',
            background: '#d8e2e5',
            railpadding: {top: 1, left: 4, bottom: 5, right: 2},
            railoffset: {left: -2}
        });
        
        /**
         * В IE при заполнении списков через autocomplete (например
         * список улиц), возникает ситуация, когда nicescroll не может
         * корректно определить высоту списка и вставляет прокрутку там,
         * где она не нужна (для кототких списков).
         * 
         * Ошибка проявляется в IE, если список заполнен через autocomplete
         * и состоит из одного или двух элементов.
         * 
         * Мы заменяем метод определения размеров области, содержащей контент,
         * таким образом, чтобы вернуть меньший размер. Т е прокрутка не будет
         * появляться, если 2 пикселя выходят за пределы видимой области.
         * Это не мешает использованию списков, но в IE не будет появляться
         * лишней прокрутки.
         * 
         * В случае обновления плагина nicescroll следует обратить внимание, не
         * изменился ли интерфейс или поведение метода getContentSize .
         * 
         * Задача https://repo.mos.ru/issues/15627
         */
        var getContentSizeOrig = ns.getContentSize;
        ns.getContentSize = function () {
            var result = getContentSizeOrig();
            result.w -= 2;
            result.h -= 2;
            return result;
        };
        
        
        ns.show();
    }

    function hide($container) {
        $container.getNiceScroll().hide();
    }

    return {
        show: function ($container) {
            show($container);
        },
        hide: function ($container) {
            hide($container);
        }
    };
}());


//Поддержка для стандартного блока std_kladr_manual для использование в удаленной инициализации
//копировать ручной блок адреса
function copyAddrBlockNoInList($block_from, $block_to) {
    $block_to.find('.manual_okrug option').removeAttr('disabled','disabled');
    $block_to.find('.manual_okrug option[value="'+$block_from.find('.manual_okrug').val()+'"]').prop('selected',true).trigger('change');
    $block_to.find('.manual_okrug option:not(:checked)').attr('disabled','disabled');
    $block_to.find('.manual_okrug').trigger('chosen:updated');
    $block_to.find('.manual_rayon option').removeAttr('disabled','disabled');
    $block_to.find('.manual_rayon option[value="'+$block_from.find('.manual_rayon').val()+'"]').prop('selected',true).trigger('change');
    $block_to.find('.manual_rayon option:not(:checked)').attr('disabled','disabled');
    $block_to.find('.manual_rayon').trigger('chosen:updated');

    $block_to.find('.manual_street').val($block_from.find('.manual_street').val()).attr('readonly','readonly').trigger('change');
    $block_to.find('.manual_dom').val($block_from.find('.manual_dom').val()).attr('readonly','readonly').trigger('change');
    $block_to.find('.manual_ownership').val($block_from.find('.manual_ownership').val()).attr('readonly','readonly').trigger('change');
    $block_to.find('.manual_korpus').val($block_from.find('.manual_korpus').val()).attr('readonly','readonly').trigger('change');
    $block_to.find('.manual_stroenie').val($block_from.find('.manual_stroenie').val()).attr('readonly','readonly').trigger('change');
    $block_to.find('.manual_room').val($block_from.find('.manual_room').val()).attr('readonly','readonly').trigger('change');
}
//копировать блок бти и кладра справочный
function copyAddrBlock($block_from, $block_to) {
	var type = ($block_from.hasClass('bti')||$block_from.find('.bti').length>0)?'bti':false;
	if(!type) type = ($block_from.hasClass('kladr')||$block_from.find('.kladr').length>0)?'kladr':false;
	if(!type) type = ($block_from.hasClass('fias')||$block_from.find('.fias').length>0)?'fias':false;
    
    
	if (!type) {
		console.error('Не смогли идентифицировать тип адреса '+$block_from.attr('id'));
		return false;
	}
	
	if (!$block_to.hasClass(type)) {
		console.error('Не смогли идентифицировать нужный тип адреса в конечном блоке '+$block_to.attr('id'));
		return false;
	}
	switch (type) {
		case 'bti':
			if (!$block_from.hasClass('bti')) $block_from = $block_from.find('.bti');
			if (!$block_to.hasClass('bti')) $block_from = $block_from.find('.bti');
			//копируем бти
			var data = {
				'street':$block_from.find('.StreetID').val(), 
				'streetName':$block_from.find('.StreetName').val(), 
				'building': $block_from.find('.Building').val(),
				'flat': $block_from.find('.Flat').val()
			};
			if ($block_from.find('.Unom').val()!='') data['Unom'] = $block_from.find('.Unom').val();
			if ($block_from.find('.Unad').val()!='') data['Unad'] = $block_from.find('.Unad').val();
			if ($block_from.find('.UNKV').val()!='') data['unkv'] = $block_from.find('.UNKV').val();
			

			$block_to.data('fillAddress')(data, function() {
				
				//перенесем округ и район вручную
				//$block_to.find('.Building').autocomplete('option','change').call($block_from.find('.Building'),{'item':false});
				$block_to.find('.manual_okrug').val($block_from.find('.manual_okrug').val()).trigger('change').attr("disabled", true).trigger('chosen:updated');
				$block_to.find('.manual_rayon').val($block_from.find('.manual_rayon').val()).trigger('change').attr("disabled", true).trigger('chosen:updated');
				if ($block_from.find('.bti_distr_manual_block').css('display')!='none'){
					$block_to.find('.bti_distr_manual_block').show();
					$block_to.find('.bti_distr_block').hide();
				}
				else {
					$block_to.find('.bti_distr_manual_block').hide();
					$block_to.find('.bti_distr_block').show();
				}
				$block_to.find('.AreaLabel').text($block_from.find('.AreaLabel').text());
				$block_to.find('.DistrictLabel').text($block_from.find('.DistrictLabel').text());
				$block_to.find('.District').val($block_from.find('.District').val());
				$block_to.find('.Area').val($block_from.find('.Area').val());
				
				
				$block_to.find('input:text').attr('readonly','readonly');
				$block_to.find('.Building, .Street, .Flat').autocomplete('disable');     

     
            });
            break;
        case 'kladr':
            //TODO кладр
            kladrAddressFill({
                block_id: $block_to.attr('id'),
                kladrCode: $block_from.find('.KLADRCode').val()||'',
                buildingLabel: $block_from.find('.Building').val()||'',
                house: $block_from.find('.HouseNo').val()||'',
                vladenie: $block_from.find('.VladenieNo').val()||'',
                corpus: $block_from.find('.CorpusNo').val()||'',
                stroenie: $block_from.find('.StroenieNo').val()||'',
                flat: $block_from.find('.Flat').val()||'',
                postalcode:$block_from.find('.PostalIndex').val()||''
            });
            break;
        case 'fias':

            $block_to.find('.fiasInput').data('autocomplete')._trigger('select', 'autocompleteselect', {item:$block_from.find('.fiasInput').data('autocomplete')['selectedItem']});
            $block_to.find('.fiasInput').attr('readonly','readonly').autocomplete('disable').removeClass('notValidClass');
            $block_to.find('.FlatInput').val($block_from.find('.FlatInput').val()).attr('readonly','readonly');
        break;
    }

}
//функция для очищения полей адреса
function clearaddr($block) {
    
    
    if ($block.hasClass('fias')) {
        $block.find('.fiasField, .fiasInput').val('').removeAttr('readonly');//поддержка фиаса  
        $block.find('.fiasInput').autocomplete('enable');
    }
	else {
        $block.find('.manual_okrug option').removeAttr('disabled');
        $block.find('.manual_okrug').attr("disabled", false).val('').trigger('chosen:updated');
        $block.find('.manual_rayon option').removeAttr('disabled');
        $block.find('.manual_rayon').val('').attr("disabled", false).trigger('chosen:updated');
        $block.find('.manual_street').val('').removeAttr('readonly');
        $block.find('.manual_dom').val('').removeAttr('readonly');
        $block.find('.manual_ownership').val('').removeAttr('readonly'); 
        $block.find('.manual_korpus').val('').removeAttr('readonly');
        $block.find('.manual_stroenie').val('').removeAttr('readonly');
        $block.find('.manual_room').val('').removeAttr('readonly');

        $block.find('.Building, .Street, .Flat, .Area, .District, input[type=hidden]:not([name="field[internal.staff][]"])').filter(function(){return $(this).closest('.upload-area').length===0;}).val('').removeAttr('readonly');
        $block.find('.Flat').autocomplete('destroy').trigger('change');
        $block.find('.Flat').html('<option value=""></option>').trigger('chosen:updated').trigger('change');
        $block.find('.AreaLabel, .DistrictLabel').html('');
        $block.find('.Building, .Street, .Flat').autocomplete('enable');
        
    }  
	FormController.clearErrors($block);
}


function init_kladr_manual(type,block){
    if (block===undefined) block = $('#form_element');
    if (type===undefined) type='kladr';
    switch (type) {
        case 'bti':
        case 'orient_bti':
            block.find('.manual_okrug_bti').off('change.kladr_manual').onFirst('change.kladr_manual',function(){
                var obj = $(this).closest('.addr_manual_block');
                var val = $(this).val();
                //делаем обратную совместимость к разным типа значений 2 и 4
                if (val.length<3) val = (val+"0000").slice(0,4);
                if (val.length==3) val = ("0"+val);
                var val2 =val.slice(0,-2);
                var valint = parseInt(val);

                obj.find('.manual_okato').val('');
                obj.find('.manual_rayon_input').val('');
                obj.find('.manual_okrug_input').val(val);

                var items = BTI_district_and_areas_form['districts'][val];
                if (items==undefined) items = BTI_district_and_areas_form['districts'][val2];
                if (items==undefined) items = BTI_district_and_areas_form['districts'][valint];

                var html = '<option value=""></option>';
                for (var i in items) {
                    html+='<option value="'+items[i]['id']+'">'+items[i]['name']+'</option>';
                }
                obj.find('.manual_rayon').html(html).trigger("chosen:updated");
            });
            block.find('.manual_rayon_bti').off('change.kladr_manual').onFirst('change.kladr_manual',function(){
                var obj = $(this).closest('.addr_manual_block');
                var val = $(this).val();
                //делаем обратную совместимость к разным типа значений 2 и 4

                if (val.length<3) val = ("0000"+val).slice(-4);
                if (val.length==3) val = ("0"+val);
                var val2 =val.slice(2);
                var valint = parseInt(val);

                var okrug = obj.find('.manual_okrug').val();
                if (okrug.length<3) okrug = (okrug+"0000").slice(0,4);
                if (okrug.length==3) okrug = ("0"+okrug);
                var okrug2 =okrug.slice(0,-2);
                var okrugint = parseInt(okrug);

                var items = BTI_district_and_areas_form['districts'][okrug];
                if (items==undefined) items = BTI_district_and_areas_form['districts'][okrug2];
                if (items==undefined) items = BTI_district_and_areas_form['districts'][okrugint];

                for (var i in items) {
                    if (items[i]['id']==val||items[i]['id']==val2||items[i]['id']==valint) {
                        obj.find('.manual_okato').val(items[i]['okato']);
                        break;
                    }
                }

                obj.find('.manual_rayon_input').val(okrug2+val2);

            });
            break;
        case 'kladr':
        case 'orient':
            block.find('.manual_okrug_kladr').off('change.kladr_manual').onFirst('change.kladr_manual',function(){
                var obj = $(this).closest('.addr_manual_block');
                var val = $(this).val();
                //делаем обратную совместимость к разным типа значений 2 и 4

                if (val.length<3) val = (val+"0000").slice(0,4);
                if (val.length==3) val = ("0"+val);
                var val2 =val.slice(0,-2);
                var valint = parseInt(val);

                obj.find('.manual_okato').val('');
                obj.find('.manual_rayon_input').val('');
                obj.find('.manual_okrug_input').val(val);

                var items = manual_rayons[val];
                if (items==undefined) items = manual_rayons[val2];
                if (items==undefined) items = manual_rayons[valint];

                var html = '<option value=""></option>';
                for (var i in items) {
                    html+='<option value="'+items[i]['id']+'">'+items[i]['name']+'</option>';
                }
                obj.find('.manual_rayon').html(html).trigger("chosen:updated");

            });
            block.find('.manual_rayon_kladr').off('change.kladr_manual').onFirst('change.kladr_manual',function(){
                var obj = $(this).closest('.addr_manual_block');
                var val = $(this).val();
                //делаем обратную совместимость к разным типа значений 2 и 4

                if (val.length<3) val = ("0000"+val).slice(-4);
                if (val.length==3) val = ("0"+val);
                var val2 =val.slice(2);
                var valint = parseInt(val);

                var okrug = obj.find('.manual_okrug').val();
                if (okrug.length<3) okrug = (okrug+"0000").slice(0,4);
                if (okrug.length==3) okrug = ("0"+okrug);
                var okrug2 =okrug.slice(0,-2);
                var okrugint = parseInt(okrug);

                var items = manual_rayons[okrug];
                if (items==undefined) items = manual_rayons[okrug2];
                if (items==undefined) items = manual_rayons[okrugint];

                for (var i in items) {
                    if (items[i]['id']==val||items[i]['id']==val2||items[i]['id']==valint) {
                        obj.find('.manual_okato').val(items[i]['okato']);
                        break;
                    }
                }

                obj.find('.manual_rayon_input').val(okrug2+val2);


            });
            break;
    }
}

//превращение таблицы в таблицу со скроллом с фиксированным заголовком
$.fn.createScrollableTable = function(options) {

    return false;

};
//уникадизируем массив
$.unique = function(array) {
    return array.filter(function(el, index, arr) {
        return index === arr.indexOf(el);
    });
};

(function(global, mainHost){

    var MPGUValidator = function() {

        /** Объект структуры флага*/
        var flagStruct$1 = function () {
            this.name = this.usage = this.value = this.defValue = '';
        };
        /**
         * Заполняем структуру флага
         * @param name$1
         * @param value$1
         * @param usage$1
         * @returns {flagStruct}
         */
        flagStruct$1.prototype.String = function (name$1, value$1, usage$1) {
            this.name = name$1;
            this.value = value$1;
            this.usage = usage$1;
            return this;
        };

        /**
         * Возвращаем значение value
         * @returns {string|*}
         */
        flagStruct$1.prototype.Value = function () {
            return this.value;
        };

        /**
         * Возвращаем значение usage
         * @returns {string|*}
         */
        flagStruct$1.prototype.Usage = function () {
            return this.usage;
        };

        /**
         * Устанавливаем значение usage
         * @param value$1
         * @returns {flagStruct$1}
         */
        flagStruct$1.prototype.setUsage = function (value$1) {
            this.usage = value$1;
            return this;
        };

        /**
         * Возвращаем значение name
         * @returns {*|string}
         */
        flagStruct$1.prototype.Name = function () {
            return this.name;
        };

        /** Объект флаг */
        var flag$1 = function () {
        };
        /**
         * Передаем строковые значение в структуру флага
         * @param name$1
         * @param value$1
         * @param usage$1
         * @returns {flagStruct}
         */
        flag$1.prototype.String = function (name$1, value$1, usage$1) {
            return new flagStruct$1().String(name$1, value$1, usage$1);
        };

        /**
         * Инициализируем флаг
         * @type {flag$1}
         */
        var flag = new flag$1();

        /**
         * Параметры требуемые для работы с асинхронным запросом
         * @type {{url: flagStruct, module: flagStruct, action: flagStruct, validator: flagStruct}}
         */
        this.params = {
            url: flag.String("checkUrl", mainHost + '/common/ajax/index.php', ''),
            module: flag.String("ajax module", 'ajaxModule', ''),
            action: flag.String("ajax action", 'ajaxAction', 'validate'),
            validator: flag.String("ajax validator", 'ajaxValidator', ''),
            org: flag.String("ajax org", 'ajaxOrg', ''),
            form: flag.String("ajax form", 'ajaxForm', '')
        };

        /**
         * Ajax реализация
         * @param long
         */
        var polling = function(long) {
            /**
             *  Конструируем XMLHttpRequest
             */
            var xmlhttp = function() {
                var xhttp;
                if (window.XMLHttpRequest) {
                    xhttp = new XMLHttpRequest();
                } else {
                    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                return xhttp;
            }();

            long.method = true;

            /**
             * Фиксируемся
             */
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    if (long.success) {
                        long.success(xmlhttp.responseText, xmlhttp.readyState, xmlhttp.status);
                    }
                } else if(xmlhttp.readyState == 4 && xmlhttp.status != 200) {
                    if (long.error) {
                        long.error(xmlhttp.responseText, xmlhttp.readyState, xmlhttp.status);
                    }
                }
            };

            var sendString = [],
                sendData = long.data;

            if (typeof sendData === "string" ) {
                var tmpArr = String.prototype.split.call(sendData,'&');
                eachSendData(tmpArr, 0, tmpArr.length);
            }else if ( typeof sendData === 'object'
                && !( sendData instanceof String || (FormData && sendData instanceof FormData) ) ){
                for (var k in sendData) {
                    var datum = sendData[k];
                    if( Object.prototype.toString.call(datum) == "[object Array]" ){
                        for(var i = 0, j = datum.length; i < j; i++) {
                            pushSendData(k,datum[i],"[]=");
                        }
                    }else{
                        pushSendData(k,datum,"=");
                    }
                }
            }

            sendString = sendString.join('&');

            if (long.type == "GET") {
                xmlhttp.open("GET", long.url + "?" + sendString, long.method);
                xmlhttp.send();
            } else if (long.type == "POST") {
                xmlhttp.open("POST", long.url, long.method);
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlhttp.send(sendString);
            }

            /**
             * @private Констрактим данные
             * @param tmpArray
             * @param index
             * @param length
             * @returns {*}
             */
            function eachSendData(tmpArray, index, length) {
                if (index < length) {
                    var datum = tmpArray[index].split('=');
                    pushSendData(datum[0],datum[1],'=');
                    return eachSendData(tmpArray, index + 1, length);
                }
                return true;
            }

            /**
             * Пушим данные
             * @param one$1
             * @param two$1
             */
            function pushSendData(one$1, two$1, symbol$1) {
                sendString.push(one$1 + symbol$1 + two$1);
            }
        };

        /**
         * Валидируем
         * @param params$1
         * @param callback$1
         */
        this.validate = function(params$1, callback$1, callback$2) {

            if (typeof params$1 === 'object' && params$1 === null) {
                return false;
            }

            if (params$1.hasOwnProperty('module')) {
                this.params.module.setUsage(params$1['module']);
            }
            if (params$1.hasOwnProperty('action')) {
                this.params.action.setUsage(params$1['action']);
            }
            if (params$1.hasOwnProperty('validator')) {
                this.params.validator.setUsage(params$1['validator']);
            }
            if (params$1.hasOwnProperty('org')) {
                this.params.org.setUsage(params$1['org']);
            }
            if (params$1.hasOwnProperty('form')) {
                this.params.form.setUsage(params$1['form']);
            }


            var data = [];
            var type = 'POST';

            if (params$1.hasOwnProperty('data')) {
                data = params$1['data'];
            }
            if (params$1.hasOwnProperty('type')) {
                type = params$1['type'];
            }

            data[this.params.module.Value()] = this.params.module.Usage();
            data[this.params.action.Value()] = this.params.action.Usage();
            data[this.params.validator.Value()] = this.params.validator.Usage();

            polling({
                url: this.params.url.Value()
                + '?' + this.params.module.Value()
                + '=' + this.params.module.Usage()
                + '&' + this.params.action.Value()
                + '=' + this.params.action.Usage()
                + '&' + this.params.validator.Value()
                + '=' + this.params.validator.Usage()
                ,
                type: type,
                data: data,
                success: function(data, state, status) {
                    if (callback$1) {
                        callback$1(data, state, status);
                    }
                },
                error: function(data, state, status) {
                    if (callback$2) {
                        callback$2(data, state, status);
                    }
                }
            });

        };

    };

    global.MPGUValidator = MPGUValidator || function(){};

})(window, cfgMainHost);

var serverValidation = new MPGUValidator;
serverValidation.submit = function(){
    serverValidation.validate(
        {module: 'FormProcessor', validator: 'DefaultTestValidator', data: $('#form_element').serialize()},
        /* success */ function(data, status, state){
            console.log(data, status, state, 'success')
        },
        /* error   */ function(data, status, state){
            console.log(data, status, state, 'error')
        }
    );
}


function head_service() {
	if (typeof (runHeaderOnce) == 'undefined') {
		runHeaderOnce = 1;
		//bindCalendar();

		/**************************Tool Tip*****************************/
		$('.toolTip, .ui-datepicker-trigger').live('hover', function() {
			$('#contentToolTip').html($(this).parent().find('div').html());
			$('#toolTip').show();
			$(this).removeClass('toolTip').addClass('toolTipHover');
			$('.ui-datepicker-trigger').removeClass('toolTip toolTipHover');
			var height = $('#toolTip').height();
			var p = $(this).position();
			$('#toolTip').css({top: p.top - height, left: p.left - 260});
		});
		$('.toolTipHover, .ui-datepicker-trigger').live('mouseout', function() {
			var content = $('.toolTip').next('div').hide();
			$(this).removeClass('toolTipHover').addClass('toolTip');
			$('.ui-datepicker-trigger').removeClass('toolTip toolTipHover');
			$('#toolTip').hide();
		});
		/***************************************************************/
		$('#manualInfo').mpguModalWindow({
			inline: true,
			overlayClose: true,
			opacity: 0.3,
			href: '#manualInfo',
			innerWidth: '670',
			innerHeight: '700'});
		$('a[name=modal]').live('click', function() {
			$('#manualInfo').mpguModalWindow('show');
			return false
		});
		/***************************************************************/
	}
}
/**
 * Позволяет использовать прокрутку для таблиц, которые не помещаются по ширине
 * при просмотре сайта на мобильных устройства.
 * 
 * Если элементы находятся внутри тегов fieldset, bootstrap не может
 * корректно определить ширину таких элементов. Данная функция устанавливает
 * для таких элементов ширину, ориентируясь на родительские элементы.
 * 
 * Для использования страница должна содержать элементы:
 * 1. Элемент, имеющий ширину равную ширине формы
 * $('fieldset.form-step').parent()
 * 2. Элемент, определяющий отступы от формы. Если элемент не найден,
 * в качестве отступов принимаются значения 30px слева и 30px справа.
 * $('fieldset.form-step .form-block')
 * 
 * 3. На страницу нужно добавить элемент с классом "table-responsive-sizefixed"
 * этот элемент должен быть добавлен внутри тега fieldset и он будет иметь
 * корректную ширину.
 * $('fieldset.form-step .table-responsive-sizefixed')
 * 
 * Пример внедрения:
 * <fieldset class="form-step">
 * <legend class="">Доверенные лица</legend>
 * <fieldset class="form-block no-legend">
 * <div class="table-responsive table-responsive-sizefixed col-xs-12 col-sm-12 col-lg-12">
 * <table class="pgu_request_tbl payment_list_tbl table-bordered">
 * ...
 * 
 */
var setWidthBootstrapSizefixed = function() {
        if (! $('fieldset.form-step').length)
            return;
        var parent = $('fieldset.form-step').eq(0).parent();
        
        if (! parent.find('.table-responsive-sizefixed').length)
            return;
        var sizefixedList = parent.find('.table-responsive-sizefixed');
        
        var padding = 0;
        if (parent.find('.form-block').length) {
            var paddingEl = parent.find('.form-block').eq(0);
            if (parseInt(paddingEl.css('padding-left'))) {
                padding += parseInt(paddingEl.css('padding-left'));
            }
            if (parseInt(paddingEl.css('padding-right'))) {
                padding += parseInt(paddingEl.css('padding-right'));
            }
        } else {
            var defaultPadding = 60;
            padding = defaultPadding;
        }
        
        var width = parent.width() - padding - 2;
        if (width > 0) {
            sizefixedList.width(width);
        }
    }
    $(document).on('ready', function() {
        if ($('fieldset.form-step').length && $('fieldset.form-step .table-responsive-sizefixed').length) {
            setWidthBootstrapSizefixed();
            $(window).on('resize', function() {
                setWidthBootstrapSizefixed();
            });
        }
    });



function showSendingPopup(func) {
// Показать colorbox
	$.colorbox({
		html: '<p style="font-size:18px;text-align:center;line-height:45px">Подождите, пожалуйста.<br/>' +
			'Выполняется формирование и передача заявления в ведомственную систему.<br/>' +
			// 'Выполняется формирование заявления для передачи в ведомственную систему.<br/>' +
			'<img src="' + cfgMediaHost + '/common/img/base/loader.gif"/><div id="submit_repeater"></div></p>',
		width: getPopupWidth()+'px',
		height: '200px',
		overlayClose: false,
		escKey: false
	});
	// скрываем кнопку закрытия окна
	$('#colorbox #cboxClose').hide();
	// делаем задержку перед отправкой в 1 сек, чтобы окно сообщения успело загрузиться
	setTimeout(function() {
// Показать предложение повторить отправку формы
		setTimeout(function() {
			$('#submit_repeater').css('text-align', 'center');
			$('#colorbox #cboxClose').show(); // показать кнопку "закрыть"
			$('#submit_repeater').html('При подаче заявления произошла ошибка. Попробуйте закрыть окно и отправить заявление снова');
			$('#loader').css('display', 'none'); // спрятать лоадер
		}, 360000);
		// Отправка формы
		
		func();
	}, 1000);
}

//==============================================================================================
// Модальное окно на основе div'a
// добавляет контур, перемещает див в скрытый контейнер, вынесенный прямо в body
(function($) {
	var methods = {
		init: function(options) {
			this.data('mpguModalWindow', {
				options: options
			});
			var container = $('#mpguModalWindowsContainer');
			if (container.length == 0)
				$('body').append('<div id="mpguModalWindowsContainer" style="display:none"></div>');
			$(options.href).appendTo('#mpguModalWindowsContainer');
			$(options.href).css('display', 'block').wrapInner('<div class="contur"/>');
		},
		show: function() {
			var lOptions = this.data('mpguModalWindow').options;
			if (arguments[0] !== undefined)
				$.extend(lOptions, arguments[0]);
			$.colorbox(lOptions);
		}
	};
	$.fn.mpguModalWindow = function(method) {
		if (methods[method])
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method)
			return methods.init.apply(this, arguments);
		else
			$.error('Method ' + method + ' does not exist on jQuery.mpguModalWindow');
	};
})(jQuery);

  //DEPRECATED 2 случая использования   mpgu3\common\htdocs\forms\gibdd\040102.js и mpgu3\common\htdocs\js_v3\forms\dogm\77060201.js
    $.fn.buttonToSelected = function(buttonText, selectedText, oneway) {
        var self = $(this);
        if (self.hasClass('button')) {
            self.addClass('button-selected');
            self.removeClass('button');
            self.text(selectedText);
        } else if (self.hasClass('button-selected') && (!oneway || oneway === undefined)) {
            self.addClass('button');
            self.removeClass('button-selected');
            self.text(buttonText);
        }
    };

$.fn.textLimited = function(method) {
		if (methods[method])
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method)
			return methods.init.apply(this, arguments);
		else
			$.error('Method ' + method + ' does not exist on jQuery.textLimited');
	};

// заглушка для контроллера динамической загрузки файлов

var UploadController = (function($) {
    var
        params, formHashAdded = false;

    // public data
    return {
        init: function(_params) {
            params = _params;
        },
        bind: function() {
        },
        unbind: function() {
        },
        validate: function() {
            return true;
        },
        upload: function() {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred;
        },
        cancel: function() {
        },
        attachDraft: function() {
            if (!formHashAdded&&params!=undefined&&params.upload_hash!=undefined) {
                formHashAdded = true;
                $('#form_element').prepend('<input type="hidden" name="field[internal.dynamic_upload][hash]" value="' + params.upload_hash + '"/>');
            }
            return false;
        }
    };
})(jQuery);
    /*
 * Привязываем календарь
 * элементы с классом inputCalendarBefore получают календарь с годами до текущего,
 * inputCalendarAfter с годами после текущего, inputCalendar с годами до и после текущего
 * если указать параметр, то привязка будет производится внутри указанного селектора
 */
function bindCalendar() {
    var options = FormController.datepicker_option;
    // При передаче в параметрах jQuery объекта привязываем календарь только к нему
    if (arguments[0] !== undefined && arguments[0] instanceof jQuery) {
        var elem = arguments[0];
        if (elem.is('input')) {
            if (elem.hasClass('inputCalendarBefore'))
                options = $.extend({yearRange: '-100:с', maxDate: '0'}, options);
            if (elem.hasClass('inputCalendarAfter'))
                options = $.extend({yearRange: 'с:+18', minDate: '0'}, options);
            if (elem.hasClass('inputCalendar'))
                options = $.extend({yearRange: '-10:+10'}, options);
            if (elem.hasClass('inputCalendarBirthdate'))
                options = $.extend({yearRange: '-99:+0'}, options);
            elem.datepicker(options);
            elem.unsetMask();
            elem.setMask({mask: '99.99.9999', mpguDate: true});
        }
        return true;
    }

    function apply_config_year_day($element,$validator,$config,$options){
        try {
            var config = $element.rules()[$validator];
        } catch (exp) {console.error(exp)}
        var year = 130;
        var day = false;
        if (typeof config !=='undefined'&&config !==true)  {

            switch (typeof config) {
                case 'string':
                    year = parseInt(config);
                    break;
                case 'array':
                case 'object':
                    switch (config[1]) {
                        case 'd':
                            year = Math.ceil(config[0]/365.25);
                            day = parseInt(config[0]);
                            console.log(year,day)
                            break;

                        default:
                            year = parseInt(config[0]);
                            break;
                    }
                    console.log('array')
                    break;
            }

            if (day!==false&&$config.maxDate!==undefined&&$config.minDate===undefined) {
                //Значит в обратную сторону ограничение выставим
                $config.minDate = -day;
            }

            if (day!==false&&$config.minDate!==undefined&&$config.maxDate===undefined) {
                //Значит в другую сторону ограничение выставим
                $config.maxDate = day;
            }
        }

        $config.yearRange = $config.yearRange.replace(/\$year/g,year);

        try {
            $element.datepicker('destroy');
            $element.datepicker($.extend($config, options));
        } catch (exp) {}
    }

    var sel = arguments[0] !== undefined ? arguments[0] : sel = '';
    $(sel + '.date_field').datepicker($.extend({yearRange: '-150:+50'}, options));
    $(sel + '.date_field').unsetMask();
    $(sel + '.date_field').setMask({mask: '99.99.9999', mpguDate: true});

    $.each($(sel + '[data-validatefunction*=date_in_date], ' + sel + '[data-validatefunction*=date]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_date',{yearRange: '-$year:+$year'},options);
    });
    $.each($(sel + '[data-validatefunction*=date_in_past]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_past',{yearRange: '-$year:c',maxDate: '0'},options);
    });
    $.each($(sel + '[data-validatefunction*=date_in_past_or_null]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_past_or_null',{yearRange: '-$year:c',maxDate: '0'},options);
    });
    $.each($(sel + '[data-validatefunction*=date_in_past_and_now]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_future_or_null',{yearRange: '-$year:+0', maxDate: '0'},options);
    });
    $.each($(sel + '[data-validatefunction*=date_in_past_and_now_and_null]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_past_and_now_and_null',{yearRange: '-$year:+0', maxDate: '0'},options);
    });
    $.each($(sel + '[data-validatefunction*=date_in_future]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_future',{yearRange: 'с:+$year', minDate: '1'},options);
    });
    $.each($(sel + '[data-validatefunction*=date_in_future_or_null]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_future_or_null',{yearRange: 'с:+$year', minDate: '1'},options);
    });
    $.each($(sel + '[data-validatefunction*=date_in_future_and_now]'), function(rdx, item) {
        apply_config_year_day($(item),'date_in_future_and_now',{yearRange: '+0:+$year', minDate: '0'},options);
    });
}

// кастомные валидаторы для полей месяц-год
function initValidatorMonthYearInterval($container) {
    function m2date(m) {
        if (typeof m === 'undefined') {
            var d = new Date();
            return new Date(d.getFullYear(), d.getMonth(), 1);
        }
        var dateParts = m.split('.');
        return new Date(dateParts[1] + '-' + dateParts[0] + '-' + '01');
    }
    var $base = (typeof $container === 'undefined') ? $(document) : $container;
    $base.find('.month-year-picker-interval').each(function (item, idx) {
        var $container = $(this).closest('.wrap.month_year_interval_select');
        if (!$container.hasClass('month-year-loaded')) {
            var $intervalDateStart = $container.find('.month-year-picker-interval-start');
            var $intervalDateEnd = $container.find('.month-year-picker-interval-end');

            $intervalDateStart.MonthPicker({
                i18n: {
                    year: "Год",
                    jumpYears: "Изменить год",
                    prevYear: "Предыдущий год",
                    nextYear: "Следующий год",
                    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
                },
                Button: '<img class="ui-datepicker-trigger" style="right: 41px" src="' + cfgMediaHost + '/common/img/calendar.png" alt="Выбрать дату с помощью интерактивного календаря" title="Выбрать дату с помощью интерактивного календаря">',
                ShowOn: 'both',
                MonthFormat: 'mm.yy'
            });
            $intervalDateEnd.MonthPicker({
                i18n: {
                    year: "Год",
                    jumpYears: "Изменить год",
                    prevYear: "Предыдущий год",
                    nextYear: "Следующий год",
                    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
                },
                Button: '<img class="ui-datepicker-trigger" style="right: 41px" src="' + cfgMediaHost + '/common/img/calendar.png" alt="Выбрать дату с помощью интерактивного календаря" title="Выбрать дату с помощью интерактивного календаря">',
                ShowOn: 'both',
                MonthFormat: 'mm.yy'
            });

            $intervalDateStart.off('change.mpgu_month_year_interval').on('change.mpgu_month_year_interval', function () {
                $intervalDateEnd.MonthPicker('option', 'MinMonth', m2date($intervalDateStart.val()));
            });
            $container.addClass('month-year-loaded');
        }
    });
}
    
    
    
/**
 * Возвращает такую позицию видимой части экрана при которой шаг будет виден.
 * Учитывает то, что шапка закрывает часть экрана.
 *
 * @param  Object stepObj Объект jquery, относящийся к шагу формы.
 *                        Объект будет виден на экране.
 * @return int
 */
function getStepPosition(stepObj) {
    if (stepObj && stepObj.length) {
        var stepPos = stepObj.offset().top;
        // Высота шапки не вычисляется, т к если это сделать сразу после загрузки страницы, то
        // не всегда высота определяется корректно.
        var headerHeight = 100; // Высота шапки.
        stepPos = (stepPos > headerHeight ? stepPos - headerHeight : 0);
    } else {
        // Нельзя получить значение прокрутки при помощи $('html, body').scrollTop()
        // из-за того, что это не работает в Opera.
        var stepPos = window.pageYOffset; // Вернуть текущее пололжение экрана.
    }
    return stepPos;
}

$(window).on('load', function () {
    // Прокрутка к текущему шагу формы после загрузки страницы.
    // Добавлена в wondow -> load потому что прокрутку нужно выполнить
    // после загрузки страницы и отработки остальных скриптов.
    (function() {
        var match = document.location.toString().match(/#step_(\d+)/i);
        if (match && match.length == 2) {
            // В адресной строке записан шаг формы, прокрутить страницу к нему.
            var step = match[1];
            if ($('#step_' +step).length) {
                var pos = getStepPosition($('#step_' +step));
                // setTimeout нужен чтобы прокрутка была выполнена после остальных действий.
                setTimeout(function(){$('html, body').scrollTop(pos)}, 0);
            }
        }
    })();


});

   
//  устаревшее удалить потом
//
//
//
//
function bindAgreeCheckBoxes() {
    return true;
}

var values = new Array();
// всплывающие подсказки
function applyHints() {
	for (var i = 0; i < values.length; ++i) {
		if (values[i][1]) {
			$('input[name="field[' + values[i][0] + ']"],' +
				'select[name="field[' + values[i][0] + ']"],' +
				'textarea[name="field[' + values[i][0] + ']"]').attr('title', values[i][1]).tooltip({
				track: true
			});
		}
	}
}
    
    

