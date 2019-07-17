$(function () {
    var $candidatesBox = $('.js-candidates-box');
    var $districtsBox = $('.js-districts-box', $candidatesBox);
    var $districtsList = $('.js-districts-list', $districtsBox);
    var $deputiesBox = $('.js-deputies-box', $candidatesBox);
    var $deputiesList = $('.js-deputies-list', $deputiesBox);
    var $districtName = $('.js-district-name', $deputiesBox);
    var $loader = $('.js-loader');

    var isShowDistrictName = false;

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
                        year: data[4],
                        university: data[5],
                        faculty: data[6],
                        specialty: data[7],
                        logo: data[8],
                        photo: data[9],
                        desc: data[10],
                    });
                }
            });

            deputies[districtId] = districtDeputies;
        });
    };

    var renderDistricts = function () {
        var html = '';

        $.each(districts, function (index, item) {
            html = html + '<li><a class="js-district-link" href="#" data-id="' + item.id + '">' + item.name + '</a></li>';
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

        $deputiesList.hide()
            .html(renderDeputies(currentDistrict))
            .fadeIn('fast');
    };

    $.ajax({
        url: cfgMainHost + '/common/ajax/lib/getRef/?NameRef=MGD_2019_DISTRICT_DEPUTIES',
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
        var districtId = $(this).data('id');

        updateDeputies(districtId);

        return false;
    });

});