function convertAddressToStructure(request)
{
	if (!$.isPlainObject(request))
		return {
			name: request.id,
			address: request.address
		};
	else return request;
}

var mapFilter;
var serviceFilter;
var mfcs = [];
var filteredMfcs = [];
var filterServices = [];
var mapReadyInterval;

function showVideo() {
		window.open('https://cl.vc.iqubecloud.com/?l=621', '','width=640,height=480');
}

function filter() {
	$.ajax({
		url:cfgMainHost + '/ru/mfc/',
		type:'get',
		dataType:'json',
		data:{show:'filter',map:mapFilter,service:serviceFilter,online:filterByOnline}
	}).done(function(data) {

		var itemsList = $('#mfc-items');
		itemsList.find('li').remove();

		for (var i in data) {
			if(data.hasOwnProperty(i)) {
				filteredMfcs[data[i].id] = data[i];
				itemsList.append(OPR.templater('mfct', data[i]));
			}
		}

		$('.ad_option:odd').addClass('right');
		$('.ad_option:even').addClass('left');

		if(mapReadyInterval) {
			clearInterval(mapReadyInterval);
		}

		mapReadyInterval = setInterval(function () {
			if (EGIP.isMapReady('map_img')) {

				EGIP.removeAllPoints('map_img');

				for (var i in data) {
					if(data.hasOwnProperty(i) && data[i].coords) {
						EGIP.addPoint('map_img', data[i].id, { x: data[i].coords.lg, y: data[i].coords.lt });
					}
				}

				clearInterval(mapReadyInterval);
			}
		}, 2000);
	});

}

$(document).ready(function() {
	filter();
});

//FILE INPUT BUTTON
function getFile(str) {
	document.getElementById(str).click();
}

//MAP AND DIVS SCROLLERS
function scrollContent(obj, time)
{
	var block = obj.parent().find('.add_content');
	if (obj.hasClass('opened'))
	{
		block.slideUp(parseInt(time));
		obj.removeClass('opened');
	}
	else
	{
		block.slideDown(parseInt(time));
		obj.addClass('opened');
	}
}

function scrollContentInTab(obj, time)
{
	var block = obj.parents("div:first").find('.add_content');

	if (obj.hasClass('opened'))
	{
		block.slideUp(parseInt(time));
		obj.removeClass('opened');
	}
	else
	{
		block.slideDown(parseInt(time));
		obj.addClass('opened');
	}
}

function filterResize()
{
	var filters = $('.filters');
	$('.for_filter').height(filters.height());
}

function centerMap(lt,lg,zoom){
	var $map = $('.map_img'),
		for_map = $('.for_map'),
		for_map_button = $('.for_map_button');

		if(zoom == undefined) {
			zoom = 8;
		}

		if (!for_map.hasClass('opened')) {
			openMap($map, for_map, for_map_button);
		}

		$("html, body").animate({scrollTop: $map.offset().top}, 1000);
		var mapCentered = false;
		setInterval(function() {
			if(!mapCentered) {
			try {
				EGIP.moveAndZoom({ idmap: 'map_img',
					x: lg,
					y: lt,
					zoom: zoom
				});
				mapCentered = true;
			}
			catch(e) {
				console.log('fail');
				mapCentered = false;
			}
		}
			
		},100);
}
var _startheight = 314;

function closeMap(map, for_map, for_map_button) {
	for_map.removeClass('opened');
	for_map_button.find('.map_button').removeClass('opened');
	
	map.slideUp(500,function() {
		map.hide();
	});
	
	for_map.animate({height: _startheight}, 500);
	for_map_button.find('span').html('показать карту');
}

function openMap(map, for_map, for_map_button) {
	var add_height = 700/*map.height()*/ - for_map.height(),
		$map = $('#map_img');

	_startheight = for_map.height();

	if (add_height >= 0)
		for_map.animate({height: "+=" + add_height}, 500);
	
	map.slideDown(500, function() {
//		$('#map_img img').hide();
		$map.css('position', 'absolute');
		$map.css('width', '100%');
		$map.css('height', $('.opened').css('height'));

		//centerMap(37.624108,55.747484, 1);
		EGIP.mapStart();

	});
	for_map.addClass('opened');
	for_map_button.find('.map_button').addClass('opened');
	for_map_button.find('span').html('cкрыть карту');
}

var filteredPlaces = [];
var filterByOnline = false;
var openedhint = false;
$(document).ready(function() {
	setCookie('mfc_search_service', false, 1);
	$('.add_for_topic, .f_add_for_topic').click(function() {
		scrollContent($(this),300);
	});
	$('.filter_popup').hide();
	$('.filters').change(function() {
		filterResize();
	});
	$('#online-hint').parent().css('width','173px');

	$('#online-hint').closest('.wrap').find('.hint-button').click(function() {
		if(openedhint) {
			$(this).closest('.wrap').find('.hint').hide(); openedhint = false;
		} else {
			$(this).closest('.wrap').find('.hint').show(); openedhint = true;
		}
	});

	$('.map_button').click(function(event) {
		event.preventDefault();
		var map = $('.map_img');
		var for_map = $('.for_map');
		var for_map_button = $('.for_map_button');

		if (for_map.hasClass('opened')) {
			closeMap(map, for_map, for_map_button);
		} else {
			openMap(map, for_map, for_map_button);
		}
	});

	$('.table_service .gray_arrow_slider').click(function(event) {
		event.preventDefault();
		scrollContentInTab($(this), 300);
	});

	$('.upl_file').change(function() {
		var file = $(this).val();
		var fileName = file.split("\\");
		$(this).parent().find('.upload_button_chosen_file').html(fileName[fileName.length - 1]);
	});
	$('[name="map-filter"]').change(function() {
		setupFilter('map',$(this));
		filter();
	});

	$('[name="filter-online"]').change(function() {
		setupFilter('online',$(this));
		filter();
	});

	$('[name="service-filter"]').change(function() {
		setupFilter('services',$(this));
		filter();
	});

	$('#online-hint').change(function() {
		filterResize();
	});

	filterResize();

	setTimeout(function() { 
		setupFilter('map',$('[name="map-filter"]'));
		setupFilter('online',$('[name="filter-online"]'));
		setupFilter('services',$('[name="service-filter"]'));
		filter();
	},300);
}
);

function setupFilter(filterType,res) {
	var ids;

	if(filterType == 'map') {
		ids = res.val();
			mapFilter = ids;
	}
	if(filterType =='services' && res.val() != "") {
			ids = [];

			ids.push(res.val());
			setCookie('mfc_search_service',res.val(),1);
			serviceFilter = ids;
			var exter = false;
			for(var item__ in ids) { 
				if(filterServices[ids[item__]].exter < 3) {
					exter = true;
					break;
				}
			}

			if(!exter) {
				$('.filter_popup').hide();
				filterResize();
			} else {
				$('.filter_popup').show();
				filterResize();
			}
	}
	if(filterType == 'online') {
		filterByOnline = res.prop('checked');
	}
}

EGIP.addMap('map_img', {
	Zoom: 1, ScaleBar: true, Slider:true, OverviewMap: true,
	LayersSwitcher: { top: 20, right: 20 },
	skipInit: true,
	onPointsClick: function(layerDataPoint) {
		var id = layerDataPoint.idpoint;
		if (id in filteredMfcs) {
			EGIP.infoWindowShow({
				crds: {
					x: layerDataPoint.x,
					y: layerDataPoint.y
				},
				InfoWindowClass:"myInfoWindow",
				InfoWindowContentClass:"myInfoWindowContent",
				InfoWindowTitleClass:"myInfoWindowTitle",
				InfoWindowCloseClass:"myInfoWindowClose",
				position:"upperleft",
				width: '300',
				height: '200',
				title: '<h2 class="bubble_header"><a href="' + cfgMainHost + '/ru/mfc/?show=mfc&id='+id+'">'+filteredMfcs[id].title+'</a></h2>',
				content: '<p class="mfc_queue stt_'+filteredMfcs[id].load+
					'_queue" style="margin-bottom:15px;">Загруженность: '+filteredMfcs[id].count+
					' чел.<br>Среднее время ожидания - '+filteredMfcs[id].time+
					'</p><table class="reset"><tr><td class="adot_f">Время работы:</td><td class="adot_s">'+filteredMfcs[id].schedule+
					'</td></tr><tr><td class="adot_f">Контакт:</td><td class="adot_s">'+filteredMfcs[id].phone+
					'</td></tr><tr><td class="adot_f">Адрес:</td><td class="adot_s" height="52">'+filteredMfcs[id].address+
					'</td></tr><tr><td colspan="2" style="text-align:center"><a href="' + cfgMainHost + '/ru/application/mfc/mfc_reg/?office='+id+'" class="button" style="margin-top:10px">Записаться на приём</a></td></tr></table>'
			});
		}
	}
});
