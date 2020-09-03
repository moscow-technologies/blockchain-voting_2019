/**
 * Created by vpetukhov on 02.09.14.
 */

$(document).ready(function () {

    var newsObj = {
        $divToRender: $('div#elk-news'),
        emptyNews: function () {
           this.$divToRender.html('Новостей нет');
        },
        renderNews: function(news) {

            var renderStr = '<div class="info-news">';

            $.each(news, function(key, value){
                renderStr += '<div class="block style1"><b class="date">' + value.NEWS_DATE + '<p><b>';
                if (null == value.ANNOUNCE) {
                    renderStr += value.TITLE;
                }
                else {
                    renderStr += value.ANNOUNCE;
                }
                renderStr += '</b></p> <p><a href="'+ value.URL + '">Узнайте больше</a></p></div>';
            });
            renderStr += '</div>';

           this.$divToRender.html(renderStr);
        }
    }



    $.ajax({
        url: cfgMainHost + "/ru/blog/index.php",
        type: "POST",
        data: {
            isAjax: 1,
            limit: 6,
            type: 'json'
        },
        dataType: 'json', // Notice! JSONP <-- P (lowercase)
        success: function (jsonp) {
            if (true == jsonp['success']) {
//                newsObj.renderNews(jsonp['data']);
            }
            else {
                newsObj.emptyNews();
            }

        },
        error: function () {
            newsObj.emptyNews();
        }
    }).done(function () {
        $('[data-link="elk-news"]').click();
    });

})