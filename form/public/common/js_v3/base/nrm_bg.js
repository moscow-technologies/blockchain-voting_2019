$(document).ready(function()
{       
	/*if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/Mac OS/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ){}else{
            $('.fba_nrm').css('margin-top','414px');
            var bgb=$('.non-registered-message');
            $('.non-registered-message').css('position','fixed');
	var _top=bgb.css('top');
	var sumheight=135;// суммарная высота блоков до фона
	var inv=0;
        var logo = $('.logo');
	$(window).scroll(function()
	{
		if($(window).scrollTop()>sumheight)
		{
			bgb.css('top',0+'px');
			bgb.css('z-index',-1000);
			
                        logo.css('margin-top','-6px');
		}
		else
		{
			bgb.css('top',parseInt(_top)-$(window).scrollTop()+'px');
                        logo.css('margin-top','0px');
			bgb.css('z-index',0);
			
		}
		//Скрытие блока при промотке ниже его отображения(иначе появляется на фоне в зазорах между блоками)
		if($(window).scrollTop()>sumheight+bgb.height() && inv==0)
		{
			bgb.css('display','none');
			inv=1;
		}
		//Появление блока при возвращении в зону его отображения
		else if($(window).scrollTop()<sumheight+bgb.height() && inv==1)
		{
			bgb.css('display','block');	
			inv=0;
		}
	});
    }*/
	
});