$(function(){
				
				function str_included( haystack, needle, offset){
					var i = haystack.indexOf( needle, offset );
					return i >= 0 ? true : false;
				}

				
				function isLocal(dmn){
                    
                    if(typeof dmn == 'undefined' || dmn == ''){
                        return true;
                    }
					
					// href of this page '#something'
					if(dmn.charAt(0) == '#'){
						return true;
					}
                    
                    // если первый слеш, то тоже локальныя
                    if(dmn.charAt(0) == '/'){
                        return true;
                    }
                    
					var local_domains = ['javascript','pgu.mos.ru', 'pgu-dev.mos.ru','pgu.tech.mos.ru', 'pgu-dev.tech.mos.ru', 'srvdev.ru', 'my.mos.ru', 'elk.srvdev.ru', 'my-tech.mos.ru','newmos.mos.ru','mos.ru','www.mos.ru'];
					var res = false;
					for(k in local_domains){
						
						if(str_included(dmn, local_domains[k],0)){
							res = true;
							break;
						}
						
					}
					return res;
				}
				
				
                $( document ).on( "click", "a", function() {
                    if(typeof $(this).attr('target') == 'undefined'){
                        
						if( !isLocal( $(this).attr('href')) ){
							$(this).attr('target','_blank');
                            //$(this).click();
						}
                        
					}
                });
                
                
                
				// устанавливаем всем формам внешним target = _blank
				$( "form" ).each(function(indx, elem){
					
					if(typeof $(this).attr('target') == 'undefined'){
						if( !isLocal( $(this).attr('action')) ){
							$(this).attr('target','_blank');
						}
					}
					
				});
				
				
				
				
});