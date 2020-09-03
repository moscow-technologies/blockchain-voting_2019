$(function () {
    var $candidatesBox = $('.js-candidates-box');
    var $districtsBox = $('.js-districts-box', $candidatesBox);
    var $districtsList = $('.js-districts-list', $districtsBox);
    var $deputiesBox = $('.js-deputies-box', $candidatesBox);
    var $deputiesList = $('.js-deputies-list', $deputiesBox);
    var $districtName = $('.js-district-name', $deputiesBox);
    var $loader = $('.js-loader');

    var isShowDistrictName = true;
    var isShowQuestion = false;
    var questions = {};

    var districts = {};
    var deputies = {};
    var currentDistrict;

    var formatDeputies = function (data) {
        $.each(data, function (districtId, items) {
            var districtDeputies = [];

            $.each(items, function (id, item) {
                var data = item.split('|');

                if (data.length === 1) {
                    districts[districtId] = {
                        id: districtId,
                        name: data[0]
                    };

                    if (! currentDistrict) {
                        currentDistrict = districtId;
                    }

                } else {
                    districtDeputies.push({
                        id: data[0],
                        lastName: data[1],
                        firstName: data[2],
                        middleName: data[3],
                        photo: data[4],
                        desc: data[5],
                        descFull: data[6],
                        income: data[7],
                    });
                }
            });

            deputies[districtId] = districtDeputies;
        });
    };

    var renderDistricts = function () {
        var html = '';

        $.each(districts, function (index, item) {
            var classes = 'js-district-link' + (currentDistrict === item.id ? ' active' : '');

            html = html + '<li><a class="' + classes + '" href="#" data-id="' + item.id + '">' + item.name + '</a></li>';
        });

        return html;
    };

    var renderDeputies = function (districtId) {
        var html = '';

        $.each(deputies[districtId], function (index, item) {
            html = html + OPR.templater('deputy', item);
        });

        return html;
    };

    var updateDistricts = function () {
        $loader.hide();

        if (Object.keys(districts).length === 1) {
            $districtsBox.hide();
            $deputiesBox.removeClass('col-md-9').addClass('col-md-12');
        }

        $districtsList.html(renderDistricts());
    };

    var updateDeputies = function (districtId) {
        if (currentDistrict == districtId) {
            return false;
        }

        if (districtId) {
            currentDistrict = districtId;
        }

        if (isShowDistrictName) {
            $districtName.text(districts[currentDistrict].name);
        }

        if (isShowQuestion && questions) {
            $districtName.text(questions[currentDistrict]);
        }

        $deputiesList.hide()
            .html(renderDeputies(currentDistrict))
            .fadeIn('fast');
    };

    $.checkBrowser({
        target: '.js-browser-check',
        loader: '.js-browser-loader',
        successTemplate: 'browser_success_template'
    });

    $.ajax({
        url: window.mgikDeputiesUrl,
        type: 'get',
        success: function (data) {
            if (data.error !== 0 || ! data.result) {
                return false;
            }

            formatDeputies(data.result);

            updateDistricts();
            updateDeputies();
            $candidatesBox.fadeIn('fast');
        },
        error: function () {

        }
    });

    $candidatesBox.on('click', '.js-district-link', function () {
        var $this = $(this);
        var districtId = $this.data('id');

        $('.js-district-link').removeClass('active');
        $this.toggleClass('active');

        updateDeputies(districtId);

        return false;
    });

});