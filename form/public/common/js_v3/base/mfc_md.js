'use strict';

var underscore = _.noConflict();

function isNotUndefined(variable) {
	return variable !== undefined;
}

function isUndefined(variable) {
	return variable === undefined;
}

var ScrollMfcDecorator = (function () {
	function show($container) {
		$container.niceScroll({
			cursorcolor: '#92a5ac',
			cursoropacitymin: 1,
			cursorwidth: '7px',
			cursorborder: 'none',
			cursorborderradius: '4px',
			background: '#d8e2e5',
			railpadding: {
				top: 1,
				left: 4,
				bottom: 5,
				right: 2
			},
			railoffset: {
				left: -2
			}
		}).show();
	}

	function hide($container) {
		$container.getNiceScroll().hide();
	}

	function resize($container) {
		$container.getNiceScroll().resize();
	}

	return {
		show: function ($container) {
			show($container);
		},
		hide: function ($container) {
			hide($container);
		},
		resize: function ($container) {
			resize($container);
		}
	};
}());

var AutocompleteDecorator = (function () {

	function fillFieldWithMultipleValue($elem, autocompleteData) {
		$elem.autocomplete( {
			source : function ( request, response ) {
				var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" ),
					matching = $.grep( autocompleteData, function ( elem ) {
						var label = elem.name;

						return matcher.test( label );
					} );

				response( matching );
			},
			minLength : 0,
			open : function ( event ) {
				var $element = $( event.target),
					width = $element.css("width");

				$element.autocomplete( "widget" ).css({width: width});

				ScrollMfcDecorator.show($element.autocomplete( "widget" ));
			},
			close : function ( event ) {
				var $element = $( event.target );

				ScrollMfcDecorator.hide($element.autocomplete( "widget" ));
			},
			select : function ( event, ui ) {
				var $element = $( event.target );

				if ( ui.item ) {
					
					$element.val( ui.item.label );
					$element.data('selected-item', ui.item.id );
				}

				$element.trigger( 'change' ).trigger( 'blur' );
				$element.autocomplete( 'close' );
			}
		} )
		.autocomplete( 'widget' ).addClass( 'mpgu-autocomplete' );

		$elem.data("autocomplete")._renderItem = function(ul, item) {
			item.label = item.name;
			item.value = item.name;

			return $("<li></li>")
				.data("item.autocomplete", item)
				.append("<a>" + item.label + "</a>")
				.appendTo(ul);
		};

        $elem.addClass('js-autocomplete');
	}


	return {
		fillFieldWithMultipleValue : function ($elem, data) {
			fillFieldWithMultipleValue($elem, data);
		}
	};
}($));

var messageBox = {
	defaultWidth: 700,
	showErrorMessageBoxXHR: function (jqXHR) {
		var text = "";

		if (isNotUndefined(jqXHR) && isNotUndefined(jqXHR.responseText) && jqXHR.responseText){
			text = JSON.parse(jqXHR.responseText)[0];
		}
		else {
			text = isNotUndefined(jqXHR.statusText) ? jqXHR.statusText : "Error";
		}

		this.showErrorMessageBox(text);
	},
	showErrorMessageBox: function (errorText) {
		var messageboxHeader = OPR.templater('messagebox_error_header_tpl', {}),
			messageboxBody = OPR.templater('messagebox_error_body_tpl', {
				errorText: errorText
			});

		this.showMessageBox(messageboxHeader, messageboxBody);

	},
	messageMapNotReady: function (){
		var messageboxBody = OPR.templater('map_not_ready_tpl', {});

		this.showMessageBox('', messageboxBody);
	},
	showMessageBox: function (title, text, width, closeCallback) {
		messagebox(title || '',text || '', width, closeCallback);
	}
};

var ModuleController = {
	moduleName: "md",
	moduleArea: "",
	getModuleName: function () {
		return this.moduleName;
	},
	getModuleArea: function () {
		return this.moduleArea;
	},
	setModuleArea: function (area) {
		this.moduleArea = area;
	}
};

var SendHitCounterIncrement = (function () {
	function sendByType( type ) {
		var moduleArea = ModuleController.getModuleArea(),
			params = {};

		params['ajaxModule_' + moduleArea] = ModuleController.getModuleName();
		params['ajaxAction_' + moduleArea] = 'incrementHitCounters';
		params['type_' + moduleArea] = type;

		$.ajax( {
			url : document.location,
			dataType : 'json',
			type : "POST",
			data : params,
			noAbort: true
		} );
	}

	return {
		send : function ( type ) {
			sendByType( type );
		}
	};
}($));

var MfcModel = {
	urlImgPath: cfgMediaHost + "/common/img/elem/",
	queueName: [],
	queuesStat: {},
	queuesServices: {},
	mfcs: {},
	regions: {},
	allMfc: {},
	allServices: {},
	allMetro: {},
	allMetroAndDirectory: {},
	allMfcQueueSchedule: {},

	getMfcAllKey: function () {
		return this.allMfc;
	},
	getMfcInfo: function (mfcId) {
		return this.mfcs[mfcId];
	},
	getAllMfcInfo: function () {
		return this.mfcs;
	},
	checkExistMfc: function (mfcId) {
		return this.mfcs.hasOwnProperty(mfcId);
	},
	getQueuesStat: function (mfcId) {
		return this.queuesStat[mfcId];
	},
	updateQueuesStat: function (mfcStat) {
		if (isNotUndefined(mfcStat)) {
			$.extend(
				this.queuesStat,
				mfcStat
			);
		}
	},
	setQueuesServices: function (mfcId, mfcQueueId, mfcServices) {
		if (isNotUndefined(mfcServices)) {
			if (isUndefined(this.queuesServices[mfcId])) {
				this.queuesServices[mfcId] = { };
			}
			this.queuesServices[mfcId][mfcQueueId] = mfcServices;
		}
	},
	getQueuesServices: function (mfcId, mfcQueueId) {
		if (isNotUndefined(mfcId) && isNotUndefined(mfcQueueId)  && isNotUndefined(this.queuesServices[mfcId]) && isNotUndefined(this.queuesServices[mfcId][mfcQueueId])) {
			return this.queuesServices[mfcId][mfcQueueId];
		}
	},
	setQueuesSchedule: function (mfcId, mfcQueueSchedule) {
		if (isNotUndefined(mfcId) && isNotUndefined(mfcQueueSchedule)) {
			this.allMfcQueueSchedule[mfcId] = mfcQueueSchedule;
		}
	},
	getQueuesSchedule: function (mfcId, mfcQueueId) {
		if (isNotUndefined(mfcId) && isNotUndefined(mfcQueueId) && isNotUndefined(this.allMfcQueueSchedule[mfcId][mfcQueueId])) {
			return this.allMfcQueueSchedule[mfcId][mfcQueueId];
		}
	},
	getQueueName: function (mfcQueueId) {
		return this.queueName[mfcQueueId];
	},
	getService: function (mfcQueueServiceId) {
		return underscore.find(this.allServices, function(service){ return service.id === mfcQueueServiceId; });
	},
	getServiceName: function (mfcQueueServiceId) {
		var service = this.getService(mfcQueueServiceId);
		return service.name;
	},
	getServiceLandingPageUrl: function (mfcQueueServiceId) {
		var service = this.getService(mfcQueueServiceId);
		return service.landingPageUrl;
	},
	getServiceIsDigital: function (mfcQueueServiceId) {
		var service = this.getService(mfcQueueServiceId);
		return service.isDigital;
	},
	getMetroName: function (metroId) {
		return this.allMetro[metroId];
	},
	getTimeoutMfc: function (mfcId) {
		var mfcQueuesStat = this.getQueuesStat(mfcId);

		return (isNotUndefined(mfcQueuesStat) && isNotUndefined(mfcQueuesStat.waitingMax)) ? parseInt(mfcQueuesStat.waitingMax, 10) : "";
	},
	getCurrentLevelLoading: function (mfcId) {
		var timeout = this.getTimeoutMfc(mfcId);

		return this.getCurrentLevelLoadingTimeout(timeout);
	},
	getCurrentLevelLoadingTimeout: function (timeout) {
		var levelLoading = [
			{
				classInfoWindow: "myInfoWindowColorGray",
				symbolUrl: "mfc-pointer-gray.png",
				roundUrl: "gray_round.png",
				isLevel: function (timeout) { return timeout === "";}
			},
			{
				classInfoWindow: "myInfoWindowColorGreen",
				symbolUrl: "mfc-pointer-green.png",
				roundUrl: "green_round.png",
				isLevel: function (timeout) { return (0 <= timeout && timeout <= 15);}
			},
			{
				classInfoWindow: "myInfoWindowColorYellow",
				symbolUrl: "mfc-pointer-yellow.png",
				roundUrl: "yellow_round.png",
				isLevel: function (timeout) { return (15 < timeout && timeout <= 30);}
			},
			{
				classInfoWindow: "myInfoWindowColorRed",
				symbolUrl: "mfc-pointer-red.png",
				roundUrl: "red_round.png",
				isLevel: function (timeout) { return 30 < timeout;}
			},
			{
				classInfoWindow: "myInfoWindowColorGray",
				symbolUrl: "mfc-pointer-gray.png",
				roundUrl: "gray_round.png",
				isLevel: function () { return true;}
			}
		];

		return underscore.find(levelLoading, function(level){ return level.isLevel(timeout); });
	},
	getSymbolUrl: function (mfcId) {
		var currentLevelLoading = this.getCurrentLevelLoading(mfcId);

		return this.urlImgPath + currentLevelLoading.symbolUrl;
	},
	getRoundUrl: function (timeout) {
		var currentLevelLoading = this.getCurrentLevelLoadingTimeout(timeout);

		return this.urlImgPath + currentLevelLoading.roundUrl;
	},
	getInfoWindowsClass: function(mfcId) {
		var currentLevelLoading = this.getCurrentLevelLoading(mfcId);

		return currentLevelLoading.classInfoWindow;
	},
	setVariableValue: function(variable, value){
		if(this[variable] && typeof this[variable] !== "function"){
			this[variable] = value;
		}
	},
	getVariableValue: function(variable){
		if(this[variable]){
			return this[variable];
		}
	}
};

var MapController = (function () {
	var mfcModel = MfcModel,
		mfcMenu,
		mapID = "searched_map",
		mapAdditionalID = "additional_map",
		egip = EGIP,
		show = true,
		defaultZoom = 3,
		allPoints = [],
		mfcShowInfoWindow = "";

	function getInfoTitle(mfcId) {
		var mfcInfo = mfcModel.getMfcInfo(mfcId);

		return OPR.templater('mfc_title_info_tpl',
			mfcInfo
		);
	}

	function getInfoContent(mfcId) {
		var mfcInfo = mfcModel.getMfcInfo(mfcId),
			mfcQueuesStat = mfcModel.getQueuesStat(mfcId);

		return OPR.templater('mfc_body_info_tpl',
			$.extend(
				{},
				mfcInfo,
				mfcQueuesStat
			)
		);
	}

	function getInfoWindowsClass(mfcId) {
		return mfcModel.getInfoWindowsClass(mfcId);
	}

	function onPointsClick(layerDataPoint) {
		var mfcId = layerDataPoint.attr.idpoint;

		if (mfcModel.checkExistMfc(mfcId)) {
			mfcMenu.showSelectedMfcMenu(mfcId);

			egip.moveAndZoom({
				idmap: mapID,
				x: layerDataPoint.geometry.x,
				y: layerDataPoint.geometry.y,
				zoom: 5
			});

			$(".myInfoWindow").removeClass(function(index, currentClasses) {
				var currentClassesArray = [],
					currentClass = "",
					classIndex,
					classLength,
					classes = '';

				if(currentClasses !== undefined){
					currentClassesArray = currentClasses.split(" ");

					for(classIndex = 0, classLength = currentClassesArray.length; classIndex < classLength; classIndex += 1){
						currentClass = currentClassesArray[classIndex];

						if(currentClass !== '' && currentClass.indexOf('myInfoWindowColor') === 0){
							classes += " " + currentClass;
						}
					}
				}

				return classes;
			});

			egip.infoWindowShow({
				crds: {
					x: layerDataPoint.geometry.x,
					y: layerDataPoint.geometry.y
				},
				InfoWindowClass: "myInfoWindow " + getInfoWindowsClass(mfcId),
				InfoWindowContentClass: "myInfoWindowContent",
				InfoWindowTitleClass: "myInfoWindowTitle",
				InfoWindowCloseClass: "myInfoWindowClose",
				position: "upperright",
				width: "300",
				height: "200",
				title: getInfoTitle(mfcId),
				content: getInfoContent(mfcId)
			});
		}
	}

	function init() {
		console.log('map inited');
		egip.addMap(mapID, {
			Zoom: defaultZoom,
			ScaleBar: true,
			Slider: true,
			MouseWheelToggle: true,
			typeMap: "claster"
		});

	}

	function addPointClaster(mfcId) {
		var mfcInfo = mfcModel.getMfcInfo(mfcId),
			point;

		if (isNotUndefined(mfcInfo.coords) && isNotUndefined(mfcInfo.coords.lg) && isNotUndefined(mfcInfo.coords.lt)) {
			point = {
				x: mfcInfo.coords.lg,
				y: mfcInfo.coords.lt,
				icon: {
					url: mfcModel.getSymbolUrl(mfcId),
					width: 56,
					height: 71,
					x_offset: -4,
					y_offset: 35
				},
				attr: {
					idpoint: mfcId
				}
			};

			allPoints.push(point);
		}
	}

	function removePointsClaster(){
		egip.removeClasterPoints(mapID);
	}

	function removeAllPointsClaster() {
		allPoints.length = 0;

		removePointsClaster();
	}

	function getCenterMap() {
		var countPoints = allPoints.length,
			minXObject = underscore.min(allPoints, function (point) { return point.x; }),
			maxXObject = underscore.max(allPoints, function (point) { return point.x; }),
			minYObject = underscore.min(allPoints, function (point) { return point.y; }),
			maxYObject = underscore.max(allPoints, function (point) { return point.y; }),
			center,
			zoom;

		if (countPoints > 0 && SearchFilterController.checkExistFilterSearch()) {

			if (countPoints > 1) {
				zoom = egip.getExtentZoomLevel({
					xmin: parseFloat(minXObject.x),
					ymin: parseFloat(minYObject.y),
					xmax: parseFloat(maxXObject.x),
					ymax: parseFloat(maxYObject.y)
				});
			}

			center = {
				x: (parseFloat(minXObject.x) + parseFloat(maxXObject.x)) / 2,
				y: (parseFloat(minYObject.y) + parseFloat(maxYObject.y)) / 2,
				zoom: (isNotUndefined(zoom) ? zoom : defaultZoom)
			};

		} else {
			center = {
				x: 37.617906,
				y: 55.73,
				zoom: defaultZoom
			};

		}

		return center;
	}

	function isEgipReady () {
		return egip.isEgipReady();
	}

	function isMapReady (mapID) {
		return egip.isMapReady(mapID);
	}

	function showMap () {
		show = true;
		$("#" + mapID + "_container").show();
	}

	function hideMap () {
		show = false;
		$("#" + mapID + "_container").hide();
	}
	
		function showInfoWindow(mfcId) {
		var mfcInfo = mfcModel.getMfcInfo(mfcId),
			layerDataPoint,
			result;

		if(isNotUndefined(mfcInfo) && isNotUndefined(mfcInfo.coords)){
			layerDataPoint= {
				attr: {
					idpoint: mfcId
				},
				geometry: {
					x: mfcInfo.coords.lg,
					y: mfcInfo.coords.lt
				}
			};

			showMap();

			onPointsClick(layerDataPoint);

			result = true;
		}
		else{
			messageBox.showMessageBox("Ошибка", "Недостаточно данных для отображения центра услуг на карте");
			result = false;
		}

		return result;

	}

	function showPointsClasterCenter2(){
		var center;

		removePointsClaster();
		showMap();
		$("#loader_search").hide();

		if (isNotUndefined(allPoints) && allPoints.length > 0) {
			egip.addClasterPoints(mapID, allPoints);

			egip.addPointClick(mapID, MapController.onPointsClick);

			center = getCenterMap();

			if(allPoints.length === 1){
				showInfoWindow(allPoints[0].attr.idpoint);
			}
			else if(mfcShowInfoWindow !== ""){
				showInfoWindow(mfcShowInfoWindow);
				mfcShowInfoWindow = "";
			}
			else{
				egip.moveAndZoom({
					idmap: mapID,
					x: center.x,
					y: center.y,
					zoom: allPoints.length === 1 ? 5 : center.zoom
				});
			}

		}
	}

	function showPointsClasterCenter() {
		var mapClasterInterval;

		if (!isEgipReady()) {
			mapClasterInterval = setInterval(function () {
				if (isEgipReady()) {
					showPointsClasterCenter2();
					clearInterval(mapClasterInterval);
				}
			}, 2000);
		}
		else{
			showPointsClasterCenter2();
		}
	}



	function showPointOneMfc(mfcId) {
		var mfcInfo = mfcModel.getMfcInfo(mfcId),
			point,
			x,
			y;

		if (isNotUndefined(mfcInfo.coords) && isNotUndefined(mfcInfo.coords.lg) && isNotUndefined(mfcInfo.coords.lt)) {
			x = mfcInfo.coords.lg;
			y = mfcInfo.coords.lt;

			point = {
				idlayer: "one_mfc",
				x: x,
				y: y,
				symbolurl: mfcModel.getSymbolUrl(mfcId),
				symbolwidth: 56,
				symbolheight: 71,
				pic_x_offset: -4,
				pic_y_offset: 35
			};

			egip.removeAllPoints(mapAdditionalID);

			egip.addPoint(mapAdditionalID, mfcId, point);

			egip.moveAndZoom({
				idmap: mapAdditionalID,
				x: x,
				y: y,
				zoom: 7
			});

		}
	}

	function showMapOneMfc(mfcId) {
		var mapOneInterval,
			mfcInfo = mfcModel.getMfcInfo(mfcId);

		egip.mapReinit(mapAdditionalID);

		if (!isMapReady(mapAdditionalID)) {
			mapOneInterval = setInterval(function () {
				if (isMapReady(mapAdditionalID)) {
					showPointOneMfc(mfcInfo.id);
					clearInterval(mapOneInterval);
				}
			}, 2000);
		}
		else{
			showPointOneMfc(mfcInfo.id);
		}
	}


    function ready() {
        if (EGIP.isEgipReady()) {
            mfcMenu = MfcMenu;
        } else {
            setTimeout(ready, 1000);
        }
    }

    ready();
    init();

    return {
		addPointClaster: function (mfcId) {
			addPointClaster(mfcId);
		},
		removeAllPointsClaster: function () {
			removeAllPointsClaster();
		},
		hideMap: function () {
			hideMap();
		},
		showPointsClasterCenter: function () {
			showPointsClasterCenter();
		},
		showInfoWindow: function (mfcId) {
			return showInfoWindow(mfcId);
		},
		onPointsClick: function (params) {
			onPointsClick(params);
		},
		isEgipReady: function () {
			return isEgipReady ();
		},
		showMapOneMfc: function (mfcId) {
			return showMapOneMfc(mfcId);
		},
		setMfcShowInfoWindow: function (mfcId) {
			mfcShowInfoWindow = mfcId;
		}
	};
}($));

var MfcMenu = (function() {
	var $searchedList,
		$menuMenuButton,
		$menuContainer,
		menuStateVisible = false;

	function add(html) {
		if (html) {
			$menuContainer.hide();
			$searchedList.append(html);
			ScrollMfcDecorator.hide($searchedList);
		}
	}

	function show() {
		menuStateVisible = true;

		$menuContainer.show();

		$menuContainer.stop();

		$menuContainer.animate({width: 250}, "fast", function(){
			$searchedList.show();
			ScrollMfcDecorator.show($searchedList);
			ScrollMfcDecorator.resize($searchedList);
		});

	}

	function hide() {
		menuStateVisible = false;

		ScrollMfcDecorator.hide($searchedList);

		$menuContainer.stop();

		$menuContainer.animate({width: 0}, "fast");

	}

	function clear() {
		$searchedList.find(".mfc_search").remove();
	}

	function showSelectedMfcMenu(mfcId) {
		var elementId = "mfc_search_" + mfcId,
			$mfcSearch = $("#" + elementId),
			$mfcDetails = $mfcSearch.find(".details");

		$(".mfc_search .active").removeClass("active");
		$(".mfc_search .details").hide();

		$mfcSearch.find(".name").addClass("active");
		$mfcDetails.show();

		document.getElementById(elementId).scrollIntoView(true);
		document.getElementById("searched_header").scrollIntoView(true);
	}

    function ready() {
		if (EGIP.isEgipReady()) {
            $searchedList = $("#searched_list");
            $menuMenuButton = $("#mfc_menu_button");
            $menuContainer = $(".searched_left");

            hide();

            $menuMenuButton.on('click', function () {
                if (menuStateVisible) {
                    hide();
                    $menuMenuButton.addClass('collapsed');
                }
                else {
                    $menuMenuButton.removeClass('collapsed');
                    show();
                }
                return false;
            });

            $menuContainer.attr("width", 0);
        } else {
            setTimeout(ready, 1000);
		}
	}

    ready();

	return {
		add: function (html) {
			add(html);
		},
		show: function () {
			show();
		},
		hide: function () {
			hide();
		},
		clear: function () {
			clear();
		},
		hideButton: function() {
			$menuMenuButton.hide();
		},
		showButton: function() {
			$menuMenuButton.show();
		},
		showSelectedMfcMenu: function(mfcId) {
			showSelectedMfcMenu(mfcId);
		}
	};
}($));

var SearchFilterController = (function () {
	var $region,
		$metro,
		$service,
		$filters,
		mapController,
		mfcModel;

	function getSearchFilters(){
		var region = $region.data("selected-item") || "",
			metro = $metro.data("selected-item") || "",
			service = $service.data("selected-item") ||  "";

		return {
			region: region,
			metro: metro,
			service: service
		};
	}

	function clearSearchFilter($field){
		if($field.val() !== "") {
			$field.attr("readonly", false);
			$field.val("");
			$field.data("selected-item", "");
		}
	}

	function clearSearchFilters(changeEnabled){
		$(".search_nothing").hide();
		$("#show_searched_mfc").hide();

		clearSearchFilter($metro);
		clearSearchFilter($region);
		clearSearchFilter($service);

		if(changeEnabled){
			$metro.trigger("change");
		}
	}

	function checkExistFilterSearch(){
		var filters = getSearchFilters();

		return !!filters.region || !!filters.metro || !!filters.service;
	}

    function ready() {
        if (EGIP.isEgipReady() && mfcMdCallbakLoaded) {
            mapController = MapController;
            mfcModel = MfcModel;

            $metro = $("#search_metro");
            $region = $("#search_region");
            $service = $("#search_service");

            $filters = $(".search_filter");

            $filters.on("change", function(){
                var filters = getSearchFilters();

                if(mapController.isEgipReady()) {
                    $(".search_nothing").hide();

                    $(this).data("selected-default", $(this).data('selected-item'));

                    SearchMfcController.changeFiltersSearch(checkExistFilterSearch() ? filters : "");
                }
                else{
                    clearSearchFilters(true);
                    messageBox.messageMapNotReady();
                }
            })
            .on("blur", function(){
                if($(this).data('selected-item') === ""){
                    $(this).val("");
                }

                if(isNotUndefined($(this).data("selected-default")) && $(this).data("selected-default") !== $(this).data('selected-item')){
                    $(this).trigger("change");
                }

            })
            .on("click", function(){
                if(!mapController.isEgipReady()) {
                    $(this).autocomplete( "close" );
                    messageBox.messageMapNotReady();
                }
                else{
                    clearSearchFilter($(this));
                    $(this).autocomplete( "search");
                }
            });

            AutocompleteDecorator.fillFieldWithMultipleValue($metro, mfcModel.getVariableValue("allMetroAndDirectory"));
            AutocompleteDecorator.fillFieldWithMultipleValue($region, mfcModel.getVariableValue("regions"));
            AutocompleteDecorator.fillFieldWithMultipleValue($service, mfcModel.getVariableValue("allServices"));
        } else {
            setTimeout(ready, 1000);
        }
    }

    ready();

	return {
		clearSearchFilters: function (changeEnabled){
			clearSearchFilters(changeEnabled);
		},
		checkExistFilterSearch: function (){
			return checkExistFilterSearch();
		},
		getSearchFilters: function (){
			return getSearchFilters();
		}
	};
}($));

var SearchMfcController = (function () {
	var mfcModel = MfcModel,
		mfcMenu = MfcMenu,
		mapController = MapController,
		weekDaysCount = 7,
		currentShowMfcId = '',
		currentShowQueueId  = '',
		searchResult = {
			mfc: []
		};

	function showMfcFullInfo(mfcName) {
		$("#page_search").hide();
		$("#page_mfc").show().find("h1").html(mfcName);

		$(".search_map_legend").hide();

		$("#mfc_full_info").show();
		$('#searched_header').hide();
		$("#show_all_mfc").show();

		if(SearchFilterController.checkExistFilterSearch()){
			$("#show_searched_mfc").show();
		}

		document.getElementById("searched_header").scrollIntoView(true);

	}

	function hideMfcFullInfo() {
		$("#page_search").show();
		$("#page_mfc").hide().find("h1").html("");

		$(".search_map_legend").show();
		$("#mfc_full_info").hide();
		$('#searched_header').show();

		ScrollMfcDecorator.hide($("#mfc_table_container"));
		ScrollMfcDecorator.hide($("#mfc_info_main"));
	}

	function hideSelectedMfc() {
		$(".mfc_search .active").removeClass("active");
		$(".mfc_search .details").hide();
	}

	function addPointsMfc(source){
		var mfcId,
			mfcCount = source.length,
			mfcIndex;

		mapController.removeAllPointsClaster();

		if (isNotUndefined(source) && mfcCount > 0) {

			for (mfcIndex = 0; mfcIndex < mfcCount; mfcIndex += 1) {
				mfcId = source[mfcIndex];

				mapController.addPointClaster(mfcId);
			}

			mapController.showPointsClasterCenter();
		}
	}

	function showAllSearchedMfcMap() {
		currentShowMfcId = '';

		hideMfcFullInfo();
		hideSelectedMfc();
		addPointsMfc(searchResult.mfc);

		document.getElementById("searched_header").scrollIntoView(true);
		$("#show_searched_mfc").hide();

		mfcMenu.showButton();

	}

	function getScheduleMfc(schedule, separator){
		var record,
			recordsCount,
			recordsIndex,
			scheduleText = "";

		if (isNotUndefined(schedule) && isNotUndefined(schedule.records)){
			recordsCount = schedule.records.length;

			for (recordsIndex = 0; recordsIndex < recordsCount; recordsIndex += 1){
				record = schedule.records[recordsIndex];

				scheduleText += record.daysOfWeek + ": "+ record.workDescription + " ";
				scheduleText += separator;
			}
		}

		return scheduleText;
	}

	function getScheduleQueue(schedule){
		var scheduleText = "";

		if (isNotUndefined(schedule) && isNotUndefined(schedule.workDescription) && schedule.workDescription){
			scheduleText = OPR.templater('schedule_queue_tpl', {
					workDescription: schedule.workDescription,
					breakDescription: schedule.breakDescription
				}
			);
		}

		return scheduleText;
	}

	function getSearchCommentsMfc(mfcId) {
		var html = "",
			metroId,
			metroName;

		if (isNotUndefined(searchResult) && isNotUndefined(searchResult.mfcMetro) && searchResult.mfcMetro.hasOwnProperty(mfcId)) {
			metroId = searchResult.mfcMetro[mfcId];

			metroName = mfcModel.getMetroName(metroId);

			if(isNotUndefined(metroName)) {
				html += OPR.templater('mfc_near_metro_tpl', {
					comment: metroName
				});
			}
		}

		return html;
	}

	function getHtmlSearchedMfcMenu(mfcId){
		var mfcInfo = mfcModel.getMfcInfo(mfcId);

		return OPR.templater('mfc_search_tpl',
			$.extend(
				mfcInfo,
				{
					searchComments: getSearchCommentsMfc(mfcId),
					scheduleText: getScheduleMfc(mfcInfo.schedule, "<br>")
				}
			)
		);
	}

	function addAllMfcMenu(){
		var mfc_search_html = "",
			mfcId,
			mfcIndex,
			mfcKey = mfcModel.getMfcAllKey(),
			mfcKeyLength = mfcKey.length,
			mfcs = mfcModel.getAllMfcInfo();

		for (mfcIndex = 0; mfcIndex < mfcKeyLength; mfcIndex += 1) {
			mfcId = mfcKey[mfcIndex];
			if (mfcs.hasOwnProperty(mfcId)) {
				mfc_search_html += getHtmlSearchedMfcMenu(mfcId);
			}
		}

		if (mfc_search_html) {
			mfcMenu.add(mfc_search_html);
		}
	}

	function showSearchResult() {
		if(SearchFilterController.checkExistFilterSearch()){
			$("#show_all_mfc").show();
		}

		addAllMfcMenu();
		addPointsMfc(searchResult.mfc);

		if (isNotUndefined(searchResult.mfc) && searchResult.mfc.length > 0) {

			$(".search_nothing").hide();

			mfcMenu.showButton();
		}
		else{
			var filters = SearchFilterController.getSearchFilters();
			if(!!filters.service) {
				$("#search_nothing_service").show();
			}
			else{
				$("#search_nothing_mfc").show();
			}

			mfcMenu.hideButton();
		}
	}

	function clearSearchResult() {
		searchResult = { };

		hideMfcFullInfo();

		mfcMenu.hide();
		mfcMenu.clear();
	}

	function searchMfcInfo(filters) {
		var region = filters.region || "",
			metro = filters.metro || "",
			service = filters.service || "",
			moduleArea = ModuleController.getModuleArea(),
			moduleName = ModuleController.getModuleName(),
			params = {};

		clearSearchResult();
		mapController.removeAllPointsClaster();

		params['ajaxModule_' + moduleArea] = moduleName;
		params['ajaxAction_' + moduleArea] = 'searchMfcInfo';
		params['region_' + moduleArea] = region;
		params['metro_' + moduleArea] = metro;
		params['service_' + moduleArea] = service;

		$.ajax({
			url: document.location,
			dataType: 'json',
			type: 'POST',
			data: params,
			beforeSend: function () {
				$("#loader_search").show();
			},
			success: function (data) {
				if (isNotUndefined(data) && isUndefined(data.error)) {
					searchResult = data;
					mfcModel.updateQueuesStat(data.mfcStat);
					showSearchResult();
				}
				else {
					messageBox.showErrorMessageBox(data.error);
				}
			},
			error: function (jqXHR) {
				messageBox.showErrorMessageBoxXHR(jqXHR);
			},
			complete: function () {
				$("#loader_search").hide();
			}
		});
	}

	function getMfcStat(mfc, callback) {
		var moduleArea = ModuleController.getModuleArea(),
			moduleName = ModuleController.getModuleName(),
			params = {};

		if (!(isNotUndefined(mfc) && mfc.length > 0)) {
			return;
		}

		params['ajaxModule_' + moduleArea] = moduleName;
		params['ajaxAction_' + moduleArea] = 'getMfcStat';
		params['mfc_' + moduleArea] = mfc;

		$.ajax({
			url: document.location,
			dataType: 'json',
			type: 'POST',
			data: params,
			beforeSend: function () {
				$("#loader_search").show();
			},
			success: function (data) {
				if (isNotUndefined(data) && isUndefined(data.error)) {
					mfcModel.updateQueuesStat(data.mfcStat);
					if (isNotUndefined(callback) && typeof  callback === 'function') {
						callback();
					}
				}
				else {
					messageBox.showErrorMessageBox(data.error);
				}
			},
			error: function (jqXHR) {
				messageBox.showErrorMessageBoxXHR(jqXHR);
			},
			complete: function () {
				$("#loader_search").hide();
			}
		});
	}

	function showAllMfc(showMfcId) {
		var mfcId,
			mfcIndex,
			mfcKey = mfcModel.getMfcAllKey(),
			mfcKeyLength = mfcKey.length,
			mfcs = mfcModel.getAllMfcInfo();

		clearSearchResult();
		addAllMfcMenu();
		addPointsMfc(mfcKey, showMfcId);

		searchResult.mfc = [];

		for (mfcIndex = 0; mfcIndex < mfcKeyLength; mfcIndex += 1) {
			mfcId = mfcKey[mfcIndex];
			if (mfcs.hasOwnProperty(mfcId)) {
				searchResult.mfc.push(mfcId);
			}
		}

		$("#show_all_mfc").hide();

		mfcMenu.showButton();
	}

	function showFullInfoMfc(mfcId, data) {
		var mfcInfo = mfcModel.getMfcInfo(mfcId),
			mfcQueuesStat = data.queuesStat,
			mfcQueuesSchedule = data.queuesSchedules,
			mfc_queue_content_table = "",
			mfcQueueSchedule,
			mfcQueueStat,
			mfcQueueId,
			queueName,
			$mfc_info_main = $("#mfc_info_main"),
			$mfc_table_container = $("#mfc_table_container"),
			$mfc_table_services = $("#mfc_table_services");

		mapController.hideMap();

		ScrollMfcDecorator.hide($mfc_info_main);
		ScrollMfcDecorator.hide($mfc_table_container);

		if (isNotUndefined(mfcInfo) && isNotUndefined(mfcQueuesStat) && isNotUndefined(mfcQueuesSchedule)) {

			for (mfcQueueId in mfcQueuesSchedule) {
				if (mfcQueuesSchedule.hasOwnProperty(mfcQueueId)) {
					mfcQueueSchedule = mfcQueuesSchedule[mfcQueueId];
					mfcQueueStat = isNotUndefined(mfcQueuesStat.queues) && isNotUndefined(mfcQueuesStat.queues[mfcQueueId]) ? mfcQueuesStat.queues[mfcQueueId] : {};
					queueName = mfcModel.getQueueName(mfcQueueId);

					mfc_queue_content_table += OPR.templater(
						'mfc_queue_content_table_tpl', {
							mfcId: mfcId,
							queueId: mfcQueueId,
							name: queueName,
							roundUrl: mfcModel.getRoundUrl(mfcQueueStat.waitingMax),
							waitCount: isNotUndefined(mfcQueueStat.waitCount) ? mfcQueueStat.waitCount : "",
							waitingMaxText: isNotUndefined(mfcQueueStat.waitingMaxText) ? mfcQueueStat.waitingMaxText : "",
							scheduleNow: getScheduleQueue(mfcQueueSchedule.now),
							scheduleTomorrow: getScheduleQueue(mfcQueueSchedule.tomorrow)
						}
					);
				}
			}

			$mfc_table_services.html(mfc_queue_content_table);

			$mfc_info_main.html(
				OPR.templater('mfc_info_main_tpl',$.extend(
					{
						mfcId: mfcId
					},
					mfcInfo
				))
			);

			showMfcFullInfo(mfcInfo.name);

			currentShowMfcId = mfcId;

			ScrollMfcDecorator.show($mfc_info_main);
			ScrollMfcDecorator.show($mfc_table_container);
		}
	}

	function getFullInfoMfc (mfcId) {
		var moduleArea = ModuleController.getModuleArea(),
			params = {};

		params['ajaxModule_' + moduleArea] = ModuleController.getModuleName();
		params['ajaxAction_' + moduleArea] = 'getFullInfoMfc';
		params['mfcId_' + moduleArea] = mfcId;

		$.ajax({
			url: document.location,
			dataType: 'json',
			type: 'POST',
			data: params,
			beforeSend: function () {
				$("#loader_search").show();
			},
			success: function (data) {
				if (isNotUndefined(data) && isNotUndefined(data.queuesStat) && isNotUndefined(data.queuesSchedules) && isUndefined(data.error)) {
					showFullInfoMfc(mfcId, data);
					mfcModel.setQueuesSchedule(mfcId, data.queuesSchedules);
				}
				else {
					messageBox.showErrorMessageBox(data.error);
				}

                EGIP.addMap("additional_map", {
                    Zoom: 3
                });
                MapController.showMapOneMfc(mfcId);

                $('#nonitembased').sly('reload');
			},
			error: function (jqXHR) {
				messageBox.showErrorMessageBoxXHR(jqXHR);
			},
			complete: function () {
				$("#loader_search").hide();
			}
		});
	}

	function showVideo(mfcId) {
		var mfcInfo = mfcModel.getMfcInfo(mfcId);
		if (isNotUndefined(mfcInfo.camerasUrl)){
			window.open(mfcInfo.camerasUrl);
		}
	}

	function showNewStatSearchedMfc() {
		var mfcs = searchResult.mfc,
			callback = function () {
				showAllSearchedMfcMap();
			};

		getMfcStat(mfcs, callback);
	}

	function getDayWeekScheduleQueue(mfcQueueSchedule, indexDay){
		var weekDays = $.datepicker.regional.ru.dayNamesMin,
			weekDay = mfcQueueSchedule.week[indexDay],
			isNow = (mfcQueueSchedule.indexNowWeek === indexDay);

		return OPR.templater('schedule_weekday_services_tpl', {
				dayName: weekDays[indexDay],
				workDescription: weekDay.workDescription,
				breakDescription: weekDay.breakDescription,
				isNow: isNow
			}
		);
	}

	function replacerSearchText(str, searchText) {
		return OPR.templater(
			'underline_tpl', {
				searchText: searchText
			}
		);
	}

	function getMfcQueueServicesContentTable(mfcId, mfcQueueServices, searchText) {
		var queueServicesHtml = "",
			mfcQueueService,
			mfcQueueServiceId,
			mfcQueueIndex,
			mfcQueueServiceName;

		if (isNotUndefined(mfcQueueServices)) {
			for (mfcQueueIndex in mfcQueueServices) {
				if (mfcQueueServices.hasOwnProperty(mfcQueueIndex)) {
					mfcQueueService = mfcQueueServices[mfcQueueIndex];
					mfcQueueServiceId = mfcQueueService.id;
					mfcQueueServiceName = mfcModel.getServiceName(mfcQueueServiceId);

					if(isNotUndefined(searchText) && searchText) {
						mfcQueueServiceName = mfcQueueServiceName.replace(new RegExp("(" + searchText + ")", 'gi'), replacerSearchText);
					}

					queueServicesHtml += OPR.templater(
						'services_content_table_tpl', {
							mfcId: mfcId,
							mfcQueueService: mfcQueueService,
							serviceName: mfcQueueServiceName,
							serviceIsPassport: mfcModel.getServiceLandingPageUrl(mfcQueueServiceId),
							serviceIsDigital: mfcModel.getServiceIsDigital(mfcQueueServiceId)
						}
					);
				}
			}
		}
		return queueServicesHtml;
	}

	function showMfcQueueServices(mfcId, mfcQueueId, mfcQueueServices) {
		var mfcQueueName = mfcModel.getQueueName(mfcQueueId),
			closeCallback = function () {
			ScrollMfcDecorator.hide($("#queue_services"));
			currentShowQueueId = "";
		};

		mapController.hideMap();
		currentShowQueueId = mfcQueueId;

		if (isNotUndefined(mfcQueueServices)) {

			messageBox.showMessageBox(
				mfcQueueName,
				OPR.templater('mfc_services_info_tpl', {
						mfcId: mfcId,
						queueServicesHtml: getMfcQueueServicesContentTable(mfcId, mfcQueueServices),
						queueName: mfcQueueName
					}
				),
				700,
				closeCallback
			);

			ScrollMfcDecorator.show($("#queue_services"));

			$('body').one('click', '.btn-close-pop, .popup_messagebox_shadow', function () {
				closeCallback();
				return false;
			});
		}
	}

	function getMfcQueueServices(mfcId, mfcQueueId) {
		var moduleArea = ModuleController.getModuleArea(),
			params = {};

		params['ajaxModule_' + moduleArea] = ModuleController.getModuleName();
		params['ajaxAction_' + moduleArea] = 'getQueueServicesMfc';
		params['mfcId_' + moduleArea] = mfcId;
		params['mfcQueueId_' + moduleArea] = mfcQueueId;

		$.ajax({
			url: document.location,
			dataType: 'json',
			type: 'POST',
			data: params,
			beforeSend: function () {
				$("#loader_search").show();
			},
			success: function (data) {
				if (isNotUndefined(data) && isNotUndefined(data.queueStat) && isNotUndefined(data.queueServices) && isUndefined(data.error)) {
					mfcModel.setQueuesServices(mfcId, mfcQueueId, data.queueServices);
					showMfcQueueServices(mfcId, mfcQueueId, data.queueServices);
				}
				else {
					messageBox.showErrorMessageBox(data.error);
				}
			},
			error: function (jqXHR) {
				messageBox.showErrorMessageBoxXHR(jqXHR);
			},
			complete: function () {
				$("#loader_search").hide();
			}
		});
	}

	function getMfcQueueServicesSchedule(mfcId, mfcQueueId){
		var indexDay,
			mfcQueueSchedule = mfcModel.getQueuesSchedule(mfcId, mfcQueueId),
			mfcQueueName = mfcModel.getQueueName(mfcQueueId),
			week_schedule_html = "";

		if (isNotUndefined(mfcQueueSchedule) && isNotUndefined(mfcQueueSchedule.week)) {
			for (indexDay = 1; indexDay < weekDaysCount; indexDay += 1) {
				week_schedule_html += getDayWeekScheduleQueue(mfcQueueSchedule, indexDay);
			}
			week_schedule_html += getDayWeekScheduleQueue(mfcQueueSchedule, 0);
		}

		messageBox.showMessageBox(mfcQueueName, week_schedule_html);
	}

	function checkExistMfcCurrentSearch(mfcId){
		return $.isArray(searchResult.mfc) && $.inArray(parseInt(mfcId, 10), searchResult.mfc) >= 0;
	}

	function showSelectedMfcMap(mfcId){
		if(mapController.isEgipReady()) {
			if(checkExistMfcCurrentSearch(mfcId)){
				mfcMenu.showSelectedMfcMenu(mfcId);

				if(mapController.showInfoWindow(mfcId)){
					hideMfcFullInfo();
				}
			}
			else{
				var mfcs = Object.keys(mfcModel.mfcs),
					callback = function () {
						mapController.setMfcShowInfoWindow(mfcId);
						SearchFilterController.clearSearchFilters(true);

						mfcMenu.showSelectedMfcMenu(mfcId);
					};

				getMfcStat(mfcs, callback);
			}

		}
		else{
			messageBox.messageMapNotReady();
		}
	}

	function showFullInfoMap(mfcId){
		if(mapController.isEgipReady()) {
			SendHitCounterIncrement.send("viewMFC");

			mfcMenu.hideButton();
			mfcMenu.hide();
			getFullInfoMfc(mfcId);
		}
		else{
			messageBox.messageMapNotReady();
		}
	}

	function searchServices(searchText){
		var queueServices = mfcModel.getQueuesServices(currentShowMfcId, currentShowQueueId),
			filterQueueServices = [],
			serviceName = "",
			queueServicesHtml,
			$containerQueueServices = $("#queue_services");

		if(isNotUndefined(searchText) && searchText){
			filterQueueServices = underscore.filter(queueServices, function(service){
				serviceName = mfcModel.getServiceName(service.id).toLowerCase();

				return serviceName.indexOf(searchText.toLowerCase()) !== -1;
			});
		}
		else{
			filterQueueServices = queueServices;
		}

		queueServicesHtml = getMfcQueueServicesContentTable(currentShowMfcId, filterQueueServices, searchText);

		if(queueServicesHtml){
			$containerQueueServices.html(queueServicesHtml);
		}
		else{
			queueServicesHtml = OPR.templater(
				'services_content_empty_tpl'
			);
			$containerQueueServices.html(queueServicesHtml);
		}

	}

	function init() {
        if (EGIP.isEgipReady() && mfcMdCallbakLoaded) {
		
            $(document).on('click', '.mfc_search_name', function () {
                var mfcId = $(this).attr('id').substr(16);

                showSelectedMfcMap(mfcId);

                return false;
            });

            $(document).on('click', '.mfc_search', function () {
                var mfcId = $(this).attr('id').substr(11);

                showSelectedMfcMap(mfcId);

                return false;
            });

            $(document).on('click', '.mfc_title_info', function () {
                var mfcId = $(this).attr('id').substr(15);

                showFullInfoMap(mfcId);

                return false;
            });

            $(document).on('click', '.mfc_service', function () {
                var mfcId = $(this).attr('id').substr(12);

                showFullInfoMap(mfcId);

                return false;
            });

            $(document).on('click', '.video', function () {
                if(currentShowMfcId){
                    showVideo(currentShowMfcId);
                }

                return false;
            });

            $('#show_searched_mfc').on('click', function () {
                showNewStatSearchedMfc();

                return false;
            });

            $('#show_all_mfc').on('click', function () {
                var mfcs = Object.keys(mfcModel.mfcs),
                    callback = function () {
                        SearchFilterController.clearSearchFilters(true);

                        document.getElementById("searched_header").scrollIntoView(true);
                    };

                $(this).hide();

                $(".search_nothing").hide();

                getMfcStat(mfcs, callback);

                return false;
            });

            $(document).on('click', '.mfc_services', function () {
                var idParts = $(this).attr('id').substr(5).split('_'),
                    mfcId = idParts[0],
                    mfcQueueId = idParts[1];

                SendHitCounterIncrement.send("viewOIV");

                getMfcQueueServices(mfcId, mfcQueueId);

                return false;
            });

            $(document).on('click', '.mfc_queue_schedule', function () {
                var idParts = $(this).attr('id').substr(8).split('_'),
                    mfcId = idParts[0],
                    mfcQueueId = idParts[1];

                getMfcQueueServicesSchedule(mfcId, mfcQueueId);

                return false;
            });

            $(document).on('click', '.services', function () {

                var serviceId = parseInt($(this).attr('id').substr(8), 10),
                    landingPageUrl = mfcModel.getServiceLandingPageUrl(serviceId);

                SendHitCounterIncrement.send("viewService");

                if(landingPageUrl){
                    window.open(landingPageUrl);
                }

                return false;
            });

            $(document).on('keyup edit paste', '.search_services', function () {
                var searchText = $(this).val();

                searchServices(searchText);

                return false;
            });

            showAllMfc();

        } else {
            setTimeout(init, 1000);
        }
    }

	init();

	return {
		changeFiltersSearch: function(filters) {
			if(filters){
				searchMfcInfo(filters);
			}
			else{
				showAllMfc();
			}
		}
	};
}($));