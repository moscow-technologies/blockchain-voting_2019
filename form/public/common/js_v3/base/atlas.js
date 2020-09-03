var EGIP = (function () {
	"use strict";
	var maps = {},
		hasSeveralMaps = false,
		IsEgipReady = false,
		skipInit = false,
		layerPoint = 'points',
		defaultSymbolUrl = cfgMediaHost + '/common/img/elem/map-pointer-blue.png';

	function _consoleLog(text){
		if (console !== undefined && typeof(console.log) !== 'function') {
			console.log(text);
		}
	}

	function _addPoint(container, id, params) {
		var point = {
			idmap: container,
			idlayer: params.layer || layerPoint,
			idpoint: id,
			x: params.x,
			y: params.y,
			symbolurl: params.symbolurl || defaultSymbolUrl,
			symbolwidth: params.symbolwidth || 37,
			symbolheight: params.symbolheight || 52,
			pic_x_offset: params.pic_x_offset || 0,
			pic_y_offset: params.pic_y_offset || 27
		};
		gcapi.AddPoint(point);
	}

	function _removeAllPoints(container) {
		if (maps[container] === undefined) {
			return;
		}

		if (IsEgipReady && maps[container].loaded) {
			gcapi.ClearLayer({
				idmap: container,
				idlayer: layerPoint
			});

			gcapi.InfoWindowHide({
				idmap: container
			});
		}

	}

	function _existPointLayer(container) {
		var allLayers;

		if(IsEgipReady){
			allLayers= gcapi.GetAllLayers({
				idmap: container
			});
			return $.inArray(layerPoint, allLayers) !== -1;
		}

		return false;
	}

	function _removeClasterPoints(container) {
		if (maps[container] === undefined) {
			return;
		}

		if (_existPointLayer(container)) {
			gcapi.RemoveLayer({
				idmap: container,
				idlayer: layerPoint
			});

			gcapi.InfoWindowHide({
				idmap: container
			});
		}

	}

	function _addClasterPoints(container, points) {
		gcapi.GraphicsGroup({
			idmap: container,
			idlayer: layerPoint,
			mode: 1,
			data: points
		});
	}

	function _addPointClick(container, onPointClick) {
		gcapi.AddLayerClickFunction({
			idmap: container,
			idlayer: layerPoint,
			click_fnc: onPointClick
		});
	}

	function _addAddress(container, id, address) {
		if (maps[container].loaded) {

			gcapi.FindAddress({
				s: address,
				type: 1,
				f: function (found) {
					var x,
						y,
						map,
						zoom;

					if (!found.length) {
						_consoleLog('Не удалось преобразовать адрес в координаты [' + address + ']');
						return;
					}

					x = found[0].location.x;
					y = found[0].location.y;
					maps[container].coords = [x, y];

					map = maps[container];

					gcapi.AddPoint({
						idmap: container,
						text_x_offset: 20,
						text_y_offset: 20,
						idlayer: layerPoint,
						idpoint: id,
						x: x,
						y: y,
						symbolurl: map.symbolurl || defaultSymbolUrl,
						symbolwidth: map.symbolwidth || 37,
						symbolheight: map.symbolheight || 52,
						pic_x_offset: map.pic_x_offset || 0,
						pic_y_offset: map.pic_y_offset || 27
					});

					zoom = (map.Zoom !== undefined) ? map.Zoom : 5;

					gcapi.MoveAndZoom({
						idmap: container,
						x: x,
						y: y,
						zoom: zoom
					});
				}
			});
		}
	}

    // глобальный инициализатор объекта ЭА ЕГИП
    window.gcapiReady = function () {
        console.log('call gcapi.ready');

        var container,
            map,
            firstContainer = null,
            firstMap,
            Slider = [],
            ScaleBar = [],
            OverviewMap = [],
            AdditionalMapContainers = [];

        if ($.isEmptyObject(maps)) {
            return;
        }

        for (container in maps) {
            if (maps.hasOwnProperty(container)) {
                if (!firstContainer) {
                    firstContainer = container;
                    firstMap = maps[container];
                }
                else {
                    hasSeveralMaps = true;
                    AdditionalMapContainers.push(container);
                }

                map = maps[container];

                Slider.push([container, map.Slider || false]);
                ScaleBar.push([container, map.ScaleBar || false]);
                OverviewMap.push([container, map.OverviewMap || false]);

                if(map.skipInit !== undefined && map.skipInit){
                    skipInit = true;
                }
            }
        }

        gcapi.MapContainer = firstContainer;
        gcapi.Zoom = firstMap.Zoom || 6;
        gcapi.Slider = [[firstContainer, true]];

        // для всех карт центром ставим центр Москвы
        gcapi.Center.x = 37.617906;
        gcapi.Center.y = 55.755732;

        if (hasSeveralMaps) {
            gcapi.AdditionalMapContainers = AdditionalMapContainers;
            gcapi.Slider = [[firstContainer, true]];
            gcapi.ScaleBar = ScaleBar;
            gcapi.OverviewMap = OverviewMap;
        }
        else {
            gcapi.Slider = [[firstContainer, firstMap.Slider || false]];
            gcapi.ScaleBar = [[firstContainer, firstMap.ScaleBar || false]];
            gcapi.OverviewMap = [[firstContainer, firstMap.OverviewMap || false]];
        }

        gcapi.OnMapLoad = function (idmap) {
            var map = maps[idmap],
                pointIndex;

            if (map.LayersSwitcher) {
                gcapi.gcFuncs.MakeButton.LayersSwitcher({
                    idmap: idmap,
                    top: map.LayersSwitcher.top || 50,
                    right: map.LayersSwitcher.right || 180,
                    layers: ['map', 'satellite', 'hybrid']
                });
            }

            if (map.typeMap !== undefined && map.typeMap === "claster") {
                if (!$.isEmptyObject(map.points)) {
                    _addClasterPoints(idmap, map.points);
                }
            }
            else {
                gcapi.AddPointLayer({
                    idlayer: layerPoint,
                    idmap: idmap
                });

                map.loaded = true;

                if (!$.isEmptyObject(map.points)) {
                    for (pointIndex in map.points) {
                        if (map.points.hasOwnProperty(pointIndex)) {
                            _addPoint(idmap, pointIndex, map.points[pointIndex]);
                        }
                    }
                    delete map.points;
                }

                if (!$.isEmptyObject(map.address)) {
                    _addAddress(idmap, 1, map.address);
                }

            }

            if (map.onPointsClick) {
                _addPointClick(idmap, map.onPointsClick);
            }

            // Скрывать кнопку панорама для мобильных устройств.
            if (/Android|iPhone|iPad|iPod|BlackBerry|BB|webOS|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini|Mobile/i.test(navigator.userAgent)) {
                $('.panoramsToggle').hide();
            }
            
            IsEgipReady = true;
        };
    };

    // if (gcapi !== undefined && !skipInit) {
    //     gcapi.ready = window.gcapiReady;
    // }


    /**
     * Пересчитывает размер карты.
     */
    function mapResize(mapId) {
        if (typeof EGIP !== 'undefined' && EGIP && typeof EGIP.isEgipReady === 'function' && EGIP.isEgipReady()) {
            if ($('#' + mapId).length) {
                if (window.gcapi && typeof window.gcapi.MapResize === 'function') {
                    window.gcapi.MapResize({idmap: mapId});
                }
            }
        }
    }
    
	return {
		addMap: function (container, params) {
			if (!params.points) {
				params.points = {};
			}
			maps[container] = params || {};
            $(window).on('resize', function() {
                mapResize(container);
            });
		},
		addPoint: function (container, id, params) {
			if(maps[container].loaded) {
				_addPoint(container, id, params);
			}
		},
		removeAllPoints: function (container) {
			_removeAllPoints(container);
		},
		isEgipReady: function () {
			return IsEgipReady;
		},
		isMapReady: function (container) {
			return maps[container].loaded;
		},
		addClasterPoints: function (container, points) {
			_addClasterPoints(container, points);
		},
		removeClasterPoints: function (container) {
			_removeClasterPoints(container);
		},
		addPointClick: function (idmap, onPointsClick) {
			_addPointClick(idmap, onPointsClick);
		},
		centerAt: function (info) {
			gcapi.CenterAt(info);
		},
		infoWindowShow: function (info) {
			gcapi.InfoWindowShow(info);
		},
		moveAndZoom: function (info) {
			gcapi.MoveAndZoom(info);
		},
		getExtentZoomLevel: function (info) {
			return gcapi.GetExtentZoomLevel(info);
		},
		mapReinit: function (container) {
			gcapi.MapReinit(container);
		},
		gcapiExist: function () {
			return gcapi !== undefined;
		},
		addAddress: function (container, id, address) {
			_addAddress(container, id, address);
		},
		mapStart: function () {
			gcapi.ready = window.gcapiReady;
		}
	};
}());