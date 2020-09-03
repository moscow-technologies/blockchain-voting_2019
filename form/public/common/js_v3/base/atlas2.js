/*
Параметры при инициализации:
dblClickZoom - приближение при даблклике
baloons - отображать всплывающие подсказки при даблклике на точке
autoZoom - авто масштабирование и перемещение области просмотра после добавления точек/точки.
addressTextType - тип подписи для точки добавляемой по адресу
0: адрес который вернул поиск
1: адрес который запрашивался при добавлении
2: не добавлять текстовую подпись
onClickFunc, onDblClickFunc - каллбеки при клике и даблклике

При добавлении адреса на карту рекомендуется использовать EGIP.normalize_address(...)

Примеры использования: mosobr/77060601
*/
var egip_ready = false;
var EGIP = (function() {
	var maps = {}, hasSeveralMaps = false, initialized = false;
	var unom_cache = {};
	var const_AK = '514'; // ID слоя AK: http://apieatlas.mos.ru/arcgis/rest/services/Basemaps/egipdatanew/MapServer

	function _addPoint(container, id, params) {
		var data = {
			idmap: container,
			idlayer: 'points',
			idpoint: id,
			x: params.x*1.0,
			y: params.y*1.0,
			symbolurl: params.symbolurl || (cfgMediaHost + '/common/img/elem/map-pointer-blue.png'),
			symbolwidth: params.symbolwidth || 37,
			symbolheight: params.symbolheight || 52,
			pic_x_offset: params.pic_x_offset || 0,
			pic_y_offset: params.pic_y_offset || 27
		};
		gcapi.AddPoint(data);
	};
	function _mapLoaderShow(container) {
		if (!$('#' + container).parent().find('.map_loader').length) {
			$('#' + container).before('<span class="map_loader"><img src="' + cfgMediaHost + '/common/img/base/loader2.gif"/> Загружается карта...</span>')
		}

	};
	function _mapLoaderHide(container) {
		$('#' + container).parent().find('.map_loader').remove();
	};
	function showError(container) {
		if (!$('#'+container+' span.error_map').length) {
			$('#'+container).html('<span class="error_map" style="color:red;">Карта еше не загружена. Дождитесь загрузки карты или перезагрузите страницу.</span>');
		}
		return this;
	};
	function hideError(container) {
		$('#'+container+' span.error_map').remove();
		return this;
	};
	function addFunctions(container){
		// отображение балунов
		gcapi.AddLayerClickFunction({
			idlayer:"points",
			idmap:container,
			click_fnc: function (layerDataPoint){
				var id=layerDataPoint.idpoint;//.substr(3);

				if((typeof(maps[container].baloons)!="undefined") && (typeof(maps[container].baloons[id])!="undefined")){
					var baloon = maps[container].baloons[id];
					if (baloon.title || baloon.content) { // если есть что отображать
						gcapi.CenterAt({x:layerDataPoint.x, y:layerDataPoint.y, idmap:container});
						gcapi.InfoWindowShow({
							crds: {
								x:layerDataPoint.x,
								y:layerDataPoint.y
							},
							title:(baloon.title)?baloon.title:'',
							content:(baloon.content)?baloon.content:'',
							idmap: container
						});
					}
				}
			}
		});
		// двойной клик
		gcapi.uFuncs.mapDblClick=function(obj){
			try {
				var container = obj.idmap;
				if (typeof(maps[container])!='undefined') {
					// зум карты при двойном клике
					if ((typeof(maps[container].dblClickZoom)!='undefined') && maps[container].dblClickZoom) {
						gcapi.SetZoomLevelPlus({idmap:container});
						gcapi.CenterAt(obj);
					}
					// каллбек
					if (typeof(maps[container].onDblClickFunc)=='function') {
						maps[container].onDblClickFunc(obj);
					}
				}
			} catch(e) {
			}
		};
		// клик
		gcapi.uFuncs.mapClick=function(obj){
			try {
				var container = obj.idmap;
				if (typeof(maps[container])!='undefined') {
					// каллбек
					if (typeof(maps[container].onClickFunc)=='function') {
						maps[container].onClickFunc(obj);
					}
				}
			} catch(e) {
			}
		};
	}

	// глобальный инициализатор объекта ЭА ЕГИП
	window.gcapiReady = function() {
		//console.log('called gcapiReady')
		initialized = true;
		egip_ready = true;
		var firstContainer = null, firstMap;
		for (var i in maps) {
			if (!firstContainer) {
				firstContainer = i;
				firstMap = maps[i];
			}
			else {
				hasSeveralMaps = true;
				break;
			}
		}
		gcapi.MapContainer = firstContainer;
		gcapi.Zoom = firstMap.Zoom || 6;
		// для всех карт центром ставим центр Москвы
		gcapi.Center.x = 37.617906;
		gcapi.Center.y = 55.755732;

		if (hasSeveralMaps) {
			var AdditionalMapContainers = [], Slider = [], ScaleBar = [], OverviewMap = [];
			for (var container in maps) {
				if (container != firstContainer) AdditionalMapContainers.push(container);
				var map = maps[container];
				Slider.push([container, map.Slider || false]);
				ScaleBar.push([container, map.ScaleBar || false]);
				OverviewMap.push([container, map.OverviewMap || false]);
			}
			gcapi.AdditionalMapContainers = AdditionalMapContainers;
			gcapi.Slider = Slider;
			gcapi.ScaleBar = ScaleBar;
			gcapi.OverviewMap = OverviewMap;
		}
		else {
			gcapi.Slider = [[firstContainer, firstMap.Slider || false]];
			gcapi.ScaleBar = [[firstContainer, firstMap.ScaleBar || false]];
			gcapi.OverviewMap = [[firstContainer, firstMap.OverviewMap || false]];
		}

		gcapi.OnMapLoad = function(idmap) {
			//console.log('called OnMapLoad: '+idmap)
			var map = maps[idmap];
			if (!$.isEmptyObject(map.layers)) { // {Layer:'Mnogofunc_centri_EDS',Visible:true}
				gcapi.ToggleEALayer(map.layers);
			}
			gcapi.ToggleEAObjectsInfo({ShowInfowindow:true})
			if (map.LayersSwitcher) {
				gcapi.gcFuncs.MakeButton.LayersSwitcher({ idmap:idmap,
					top:map.LayersSwitcher.top || 50, right: map.LayersSwitcher.right || 180,
					layers:['map','satellite','hybrid']
				});
			}
			gcapi.AddPointLayer({
				idlayer: 'points',
				idmap: idmap
			});
			if (map.onPointsClick) {
				gcapi.AddLayerClickFunction({idmap:idmap,
					idlayer: 'points',
					click_fnc: map.onPointsClick
				});
			} else {
				//console.log('called addFunctions: '+idmap)
				addFunctions(idmap);
			}
			map.loaded = true; // именно тут (до добавления адресов) устанавливаем признак загруженности карты
			hideError(idmap); // стираем старые ошибки
			if (!$.isEmptyObject(map.points)) {
				for (var id in map.points) {
					_addPoint(idmap, id, map.points[id]);
				}
				delete map.points;
			}
			if (!$.isEmptyObject(map.txtpoints)) {
				for (var id in map.txtpoints) {
					try {
						EGIP.addTextPoint(idmap, (map.txtpoints[id][0] ? map.txtpoints[id][0] : 1000), map.txtpoints[id][1], map.txtpoints[id][2], map.txtpoints[id][3]);
					} catch(e) {
					}
				}
				delete map.points;
			}
			if (!$.isEmptyObject(map.unoms)) {
				for (var id in map.unoms) {
					EGIP.addByUnom(idmap, map.unoms[id][0], map.unoms[id][1], map.unoms[id][2]);
				}
				delete map.unoms;
			}
			if (!$.isEmptyObject(map.unoms_multi)) {
				for (var id in map.unoms_multi) {
					EGIP.addByUnomMulti(idmap, map.unoms_multi[id]);
				}
				delete map.unoms_multi;
			}
			if (map.addresses) {
				for (var k in map.addresses) {
					EGIP.addAddress(idmap, (map.addresses[k][1] ? map.addresses[k][1] : 1000), map.addresses[k][0]);
				}
				delete map.addresses;
			}
			if (typeof(map.extents)!='undefined') {
				try {
					gcapi.SetExtent(map.extents);
				} catch(e) {
				}
				delete map.extents;
			}
		};
	};

	if (typeof(gcapi) !== 'undefined') { // иногда карта может не загрузиться
		gcapi.ready = 'gcapiReady';
	}

	return {
		ready: function() {
			return egip_ready;
		},
		addMap: function(container, params) {
			//if (!initialized) return showError(container); // не проверяем, возможна отложенная загрузка карты
			if (!params.points) params.points = {};
			if (!params.addressTextType) params.addressTextType = 0;
			maps[container] = params || {};
			return this;
		},

				moveTo:  function(container, params) {

						if (initialized){
								gcapi.Center.x = params.x;
								gcapi.Center.y = params.y;
						}
				},


		addPoint: function(container, id, params) {
			if (!initialized) return showError(container);
			if (maps[container].loaded) {
				_addPoint(container, id, params);
				EGIP.autorun(container);
			} else {
				maps[container].points[id] = params;
			}
			return this;
		},
		/**
		* Добавить адрес на карту
		*
		* @param container
		* @param addresses - либо массив адресов (строки), либо массив объектов c подсказкой {address:'...', baloon:{...}}
		*/
		addAddresses: function(container, addresses) {
			for (var k in addresses) {
				if ((typeof(addresses[k])=='string')) {
					EGIP.addAddress(container, k, addresses[k]);
				} else if ((addresses[k] instanceof Object) && (typeof(addresses[k].address)!='undefined')) {
					EGIP.addAddress(container, k, addresses[k].address);
					if (typeof(addresses[k].baloon)=='object') {
						EGIP.addBaloons(container, {id: k, content: addresses[k].baloon.content, title: addresses[k].baloon.title});
					}
				} else {
					if (typeof(console)=='object'&& typeof(console.log)=='function') {
						console.log('atlas2.addAddresses, не могу добавить: ', addresses[k]);
					}
				}
			}
		},
		/**
		* Добавить адрес на карту
		*
		* @param container
		* @param id - ID для точки, если адрес будет найден и добавлен
		* @param address
		*/
		addAddress: function(container, id, address) {
			if (!initialized) return showError(container);
			if (maps[container].loaded) {
				var address_text_type = maps[container].addressTextType;
				_mapLoaderShow(container);
				gcapi.FindAddress({s: address, type: 1,
					f: function(found) {
						//console.log('Искали "'+address+'" нашли ['+found.length+'] вариантов. ', found);
						if (!found.length && typeof(window.address_not_found) == 'function') {
							window.address_not_found(address);
							if (typeof(MPGU)!='undefined' && MPGU.dev
								&& typeof(console)!='undefined' && typeof(console.log)!='function') {
								console.log('Не удалось преобразовать адрес в координаты ['+address+']');
							}
						}
						for (var i = 0; i < found.length; ++i) {
							var x = found[i].location.x, y = found[i].location.y;
							maps[container].coords = [x, y];
							map = maps[container];
							var address2 = (found[i].address).replace('Москва город федерального значения','Москва,');
							address2 = (address2).replace('Зеленоградский административный округ','Зеленоград,');
							var shown_string = address2;
							if (address_text_type == 1) {
								shown_string = address;
							} else if (address_text_type == 2) {
								shown_string = '';
							}
							gcapi.AddPoint({idmap: container,
								txt: shown_string,
								//txt: address,
								fontname: 'Helious regular',
								fontsize: '18',
								text_x_offset: 20,
								text_y_offset: 20,
								idlayer: 'points',
								idpoint: id,
								x: x,
								y: y,
								symbolurl: map.symbolurl || (cfgMediaHost + '/common/img/elem/map-pointer-blue.png'),
								symbolwidth: map.symbolwidth || 37,
								symbolheight: map.symbolheight || 52,
								pic_x_offset: map.pic_x_offset || 0,
								pic_y_offset: map.pic_y_offset || 27
							});
							// gcapi.MapReinit(container);
							var zoom = (typeof(map.Zoom) != 'undefined') ? map.Zoom : 5;
							var command = "try{gcapi.MapReinit('"+container+"');gcapi.MoveAndZoom({ idmap: '"+container+"',	x: "+x+", y: "+y+",	zoom: "+zoom+",});}catch(e){}";
							try {
								gcapi.MoveAndZoom({ idmap: container,
									x: x,
									y: y,
									zoom: zoom,
								});
							} catch(e) {
								setTimeout(command, 2000);
							}
							break;
						}
						EGIP.autorun(container);
						_mapLoaderHide(container);
					}
				});
			} else {
				// отложенная загрузка карты, добавляем в список инициализации
				if (typeof(maps[container].addresses) == 'undefined') {
					maps[container].addresses = [];
				}
				maps[container].addresses.push([address, id]);
			};
			return this;
		},
		// добавить всплывающие подсказки
		// baloons - массив объектов или просто объект {id:'map', title:'заголовок', content:'текст'}
		addBaloons: function(container, baloons) {
			if (!(baloons instanceof Array)) {
				baloons = [baloons];
			}
			for (var k in baloons) {
				if ((baloons[k].id && (baloons[k].title || baloons[k].content))) {
					if (typeof(maps[container].baloons)=='undefined') {
						maps[container].baloons = {};
					}
					maps[container].baloons[baloons[k].id] = {content: baloons[k].content, title: baloons[k].title}
				}
			}
			return this;
		},
		addTextPoint: function(container, id, x, y, text) {
			if (!initialized) return showError(container);
			if (maps[container].loaded) {

				map = maps[container];

				if (id instanceof Object) {
					var first_point = [];
					var points_arr = [];
					for (var k in id) {
						x = id[k].x;
						y = id[k].y;
						text = id[k].text || '';
						points_arr.push({
							txt: text,
							//txt: address,
							fontname: 'Helious regular',
							fontsize: '18',
							text_x_offset: 20,
							text_y_offset: 20,
							//idlayer: 'points',
							idpoint: k,
							x: x,
							y: y,
							symbolurl: map.symbolurl || (cfgMediaHost + '/common/img/elem/map-pointer-blue.png'),
							symbolwidth: map.symbolwidth || 37,
							symbolheight: map.symbolheight || 52,
							pic_x_offset: map.pic_x_offset || 0,
							pic_y_offset: map.pic_y_offset || 27
						});

						//						if (id[k].baloon_body || id[k].baloon_head) {
						//							gcapi.InfoWindowShow({
						//								idmap: container,
						//								crds:{x:x ,y:y}, title:(id[k].baloon_head?id[k].baloon_head:''),
						//								content: (id[k].baloon_body?id[k].baloon_body:'')})
						//						}

						if (!first_point.length) {
							first_point = [x, y];
							maps[container].coords = [x, y];
						};

						// подсказки
						if (typeof(id[k].baloon) == 'object') {
							EGIP.addBaloons(container, {id: k, content: id[k].baloon.content, title: id[k].baloon.title});
							//							if (typeof(maps[container].baloons)=='undefined') {
							//								maps[container].baloons = {};
							//							}
							//							maps[container].baloons[k] = {content: id[k].baloon.content, title: id[k].baloon.title}
						}

					};
					//gcapi.InfoWindowHide({idmap: container}); // спрятать все балуны
					gcapi.AddPoints({idmap: container,
						idlayer: 'points',
						points_attr: points_arr,
					});
				} else {

					maps[container].coords = [x, y];
					//var address2 = (found[i].address).replace('Москва город федерального значения','Москва,');
					gcapi.AddPoint({idmap: container,
						txt: text,
						//txt: address,
						fontname: 'Helious regular',
						fontsize: '18',
						text_x_offset: 20,
						text_y_offset: 20,
						idlayer: 'points',
						idpoint: id,
						x: x,
						y: y,
						symbolurl: map.symbolurl || (cfgMediaHost + '/common/img/elem/map-pointer-blue.png'),
						symbolwidth: map.symbolwidth || 37,
						symbolheight: map.symbolheight || 52,
						pic_x_offset: map.pic_x_offset || 0,
						pic_y_offset: map.pic_y_offset || 27
					});
				}
				// gcapi.MapReinit(container);
				var zoom = (typeof(map.Zoom) != 'undefined') ? map.Zoom : 5;
				var command = "try{gcapi.MapReinit('"+container+"');gcapi.MoveAndZoom({ idmap: '"+container+"',	x: "+x+", y: "+y+",	zoom: "+zoom+",});}catch(e){}";
				try {
					gcapi.MoveAndZoom({ idmap: container,
						x: x,
						y: y,
						zoom: zoom,
					});
				} catch(e) {
					setTimeout(command, 2000);
				}
				//EGIP.autorun(container);
			} else {
				// отложенная загрузка карты, добавляем в список инициализации
				if (typeof(maps[container].txtpoints) == 'undefined') {
					maps[container].txtpoints = [];
				}
				if (id instanceof Array) {
					maps[container].txtpoints.push([id, '', '', '']);
				} else {
					maps[container].txtpoints.push([id, x, y, text]);
				}
			};
			return this;
		},
		/**
		*  убрать все точки с рабочего слоя карты
		*
		* @param container
		*/
		removeAllPoints: function(container) {
			// очищаем также все отложенные данные
			if (typeof(maps[container]) == 'undefined') {
				//console.log('попытка очистить не существующую карту!');
				return;
			}
			maps[container].baloons = {};
			maps[container].points = [];
			maps[container].txtpoints = [];
			maps[container].addresses = [];
			maps[container].unoms = [];
			maps[container].unoms_multi = [];

			if (initialized && maps[container].loaded) {
				gcapi.ClearLayer({ idmap: container, idlayer: 'points' });
				gcapi.InfoWindowHide({ idmap: container});
			}
			hideError(container);
			return this;
		},
		// тест: EGIP.addByUnom('map', 3804883, 3804883, '!!!')
		addByUnom: function(container, id, unom, text) {
			// кешируем результаты, т.к. сервис иногда не выдает повторно данные
			if (typeof(unom_cache[unom]) != 'undefined') {
				EGIP.addTextPoint(container, id, unom_cache[unom].x, unom_cache[unom].y, text); // подпись берем текущую
				return true;
			}
			// if (!initialized) return showError(container);
			if (initialized && maps[container].loaded) {

				var url = gcapi.Paths.egip_service + '/'+const_AK+'/query?where=UNOM%3D'+unom+'&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson';

				var Request = esri.request({
					url: url,
					handleAs: "json",
					callbackParamName: "callback"
				});
				Request.then(
					function(response) {
						var address, points, x, y, data = response;
						if (data.features && data.features[0]) {
							address = (data.features[0].attributes && data.features[0].attributes.ADDR) ? data.features[0].attributes.ADDR : text;
							points = (data.features[0].geometry && data.features[0].geometry.rings && data.features[0].geometry.rings[0]) ? data.features[0].geometry.rings[0] : [];
							if (points[0] && (points[0].length == 2)) {
								x = points[0][0];
								y = points[0][1];
								unom_cache[unom] = {x: x, y: y, address: address};
								EGIP.addTextPoint(container, id, x, y, address);
							}
						}

					}, function(error) {
						//console.log(error);
				});
			} else {
				showError(container);
				// отложенная загрузка карты, добавляем в список инициализации
				if (typeof(maps[container].unoms) == 'undefined') {
					maps[container].unoms = [];
				}
				maps[container].unoms.push([id, unom, text]);
			}
		},
		addByUnomMulti: function(container, unom_array, _step) {

			//console.log('call addByUnomMulti: ' + container);
			//console.log(unom_array);
			//if (!initialized) return showError(container);
			if (initialized && maps[container].loaded) {
				//console.log('call addByUnomMulti (loaded): '+ container);
				// кешируем результаты, т.к. сервис иногда не выдает повторно данные
				//			if (typeof(unom_cache[unom]) != 'undefined') {
				//				EGIP.addTextPoint(container, id, unom_cache[unom].x, unom_cache[unom].y, unom_cache[unom].address);
				//				return true;
				//			}
				var unom_query = [];
				for (var k in unom_array) {
					//if (typeof(unom_cache[unom]) == 'undefined') { // TODO: пока непонятно как отличить получаемые результаты по начальным unom, в ответе они идут не по порядку
					unom_query.push('UNOM%3D'+k);
					if (unom_array[k].baloon) {
						if (typeof(maps[container].baloons)=='undefined') {
							maps[container].baloons = {};
						}
						maps[container].baloons[k] = {content: unom_array[k].baloon.content, title: unom_array[k].baloon.title}
					}
					//}
				}
				var unom_string = unom_query.join('+or+');

				if (unom_string) { // если есть что запрашивать
					var url = gcapi.Paths.egip_service + '/'+const_AK+'/query?where='+unom_string+'&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=UNOM,ADDR&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson';

					var Request = esri.request({
						url: url,
						handleAs: "json",
						callbackParamName: "callback"
					});
					Request.then(
						function(response) {
							//console.log(response);
							var address, points, x, y, data = response;
							if (data.features) {
								var add = {};
								for (var k in data.features) {
									unom = (data.features[k].attributes && data.features[k].attributes.UNOM) ? data.features[k].attributes.UNOM : '';//text;
									//address = (data.features[k].attributes && data.features[k].attributes.ADDR) ? data.features[k].attributes.ADDR : '';//text;
									address = unom_array[unom].addr || '';// (data.features[k].attributes && data.features[k].attributes.ADDR) ? data.features[k].attributes.ADDR : '';//text;
									points = (data.features[k].geometry && data.features[k].geometry.rings && data.features[k].geometry.rings[0]) ? data.features[k].geometry.rings[0] : [];

									if (points[0] && (points[0].length == 2)) {
										x = points[0][0];
										y = points[0][1];
										unom_cache[unom] = {x: x, y: y, address: address};
										add[unom] = {x: x, y: y, text: address}
										//EGIP.addTextPoint(container, unom, x, y, address);
									}
								}
								EGIP.addTextPoint(container, add); // добавляем за один раз все данные
								EGIP.setExtentByPoints(add);
								// TODO: иногда у карты не выводится смасштабированное содержимое. причина неясна

							}

						}, function(error) {
							//console.log('error!');
							//console.log(error);
							if ((typeof(_step)=='undefined') || (_step<3)) { // делаем еще попытки получить адреса
								setTimeout("eval(EGIP.addByUnomMulti(container, unom_array, (typeof(_step)!='undefined')?_step+1:2))", 500);
							}
					});
					//} else { // если все результаты уже кешированы - не реализовано
				}

			} else {
				showError(container);
				//console.log('call addByUnomMulti (отложенная загрузка)');

				// отложенная загрузка карты, добавляем в список инициализации
				if (typeof(maps[container].unoms_multi) == 'undefined') {
					maps[container].unoms_multi = [];
				}
				maps[container].unoms_multi.push(unom_array);
			}

		},
		/**
		* Установить границы карты, чтобы поместились все точки
		*
		* @param points_array
		* @param container - карта, необязательный
		*/
		setExtentByPoints : function(points_array, container) {
			//console.log('setExtentByPoints');
			//console.log(points_array);
			var x_min=99999, x_max=-99999, y_min=99999, y_max=-99999;
			for (var k in points_array) {
				var p = points_array[k];
				if (p.x && p.y) {
					if (x_min>p.x) x_min=p.x;
					if (y_min>p.y) y_min=p.y;
					if (x_max<p.x) x_max=p.x;
					if (y_max<p.y) y_max=p.y;
				}
			}
			//console.log('finished setExtentByPoints');
			//console.log({xmin:x_min,ymin:y_min,xmax:x_max,ymax:y_max});
			if (x_min!=x_max && y_min!=y_max) {
				if (typeof(container)=='undefined') { // карта не задана
					gcapi.SetExtent({xmin:x_min,ymin:y_min,xmax:x_max,ymax:y_max});
				} else if (typeof(container)!='undefined' && initialized && maps[container].loaded) { // карта задана и инициализирована
					gcapi.SetExtent({xmin:x_min,ymin:y_min,xmax:x_max,ymax:y_max,idmap:container});
				} else { // карта задана и еще не инициализирована - отложенная загрузка
					maps[container].extents = {xmin:x_min,ymin:y_min,xmax:x_max,ymax:y_max,idmap:container};
				}
			}
		},
		extentByContent : function(container) {
			//.baloons
			var objects = gcapi.GetLayersObjectsInfo ({idmap: container, idlayer:"points"});
			if (typeof(objects) == 'object') {
				var points_array = [];
				for(var k in objects) {
					if (typeof(objects[k].x)!='undefined' && typeof(objects[k].y)!='undefined' ) {
						points_array.push({x: objects[k].x, y: objects[k].y});
					}
					EGIP.setExtentByPoints(points_array);
				}
			}
		},
		autorun: function(container) { // выполняется после добавления-удаления точек
			if ((typeof(maps[container]).autoZoom)!='undefined' && typeof(maps[container]).autoZoom) {
				EGIP.extentByContent(container);
			}
		},
		normalize_address: function(address_string) { // нормализация адреса перед передачей на карту
			if (typeof(address_string)!='string') return '';
			var m = address_string.match(/г\.[ ]?Москва,(.*)$/);
			if (!m) {
				m = address_string.match(/^[\d]+, город[\. ]*Москва[,]?(.*)$/);
			}
			if (!m) {
				m = address_string.match(/^[\d]+, [г\. ]*Москва[,]?(.*)$/);
			}
			if (m && (m.length == 2)) {
				address_string = 'Москва, '+m[1].trim();
			} else {
				address_string = address_string.trim().replace(/^г\. /, '').trim();
			}
			// Зеленоград
			m = address_string.match(/^[г. ]*Зеленоград[,]?(.*)$/);
			if (m && (m.length == 2)) {
				address_string = 'Зеленоградский административный округ, '+m[1].trim();
			}
			return address_string;
		},

	};
})();
