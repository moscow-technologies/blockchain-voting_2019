// todo в будущем можно перевести на прототип, пока так.
OPR.Cades = (function (){
	var cadesCerts = [],
	oStore,
	oSigner, 
	CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0,
	CADES_BES = 1, // обычная
	CADESCOM_CADES_DEFAULT = 0, // усовершенствованная
	cadesXMLStr = '', // подписываемая строка
	cadesFileValid = true, // array for cades files
	cadesFiles = {}, // массив описания документов на форме
	cadesFilesCounter = 1, // счетчик документов на форме
	_this = this;

	this.checkPlugIn = function() {
		switch (navigator.appName) {
			case 'Microsoft Internet Explorer':
				try {
					var obj = new ActiveXObject("CAdESCOM.CPSigner");
					return true;
				}
				catch (err) {
				}
				break;
			default:
				var userAgent = navigator.userAgent;
				if(userAgent.match(/ipod/i) ||userAgent.match(/ipad/i) || userAgent.match(/iphone/i)) {
					return true;
				}
				var cadesobject = document.getElementById('cadesplugin');
				var mimetype = navigator.mimeTypes["application/x-cades"];
				if (mimetype) {
					var plugin = mimetype.enabledPlugin;
					if (plugin) {
						return true;
					}
				}
		}
		return false;
	}
	/* ------------------ Стандартный функционал ------------------ */
	// Функция активации объектов КриптоПро ЭЦП Browser plug-in
	this.objCreator = function(name) {
		switch (navigator.appName) {
			case 'Microsoft Internet Explorer':
				return new ActiveXObject(name);
			default:
			var userAgent = navigator.userAgent;
				if(userAgent.match(/ipod/i) ||userAgent.match(/ipad/i) || userAgent.match(/iphone/i)) {
				 return call_ru_cryptopro_npcades_10_native_bridge("CreateObject", [name]);
				}
				var cadesobject = document.getElementById('cadesplugin');
				return cadesobject.CreateObject(name);
		}
	}
	// Получение списка сертичикатов
	this.getCertList = function() {
		var oStore = objCreator("CAPICOM.store");
		if (!oStore) {
			alert("store failed");
			return;
		}

		try {
			oStore.Open();
		}
		catch (e) {
			alert("Ошибка при открытии хранилища: " + GetErrorMessage(e));
			return;
		}

		var certCnt = oStore.Certificates.Count;
		for (var i = 1; i <= certCnt; i++) {
			var cert;
			try {
				cert = oStore.Certificates.Item(i);
			}
			catch (ex) {
				alert("Ошибка при перечислении сертификатов: " + GetErrorMessage(ex));
				return;
			}

			try
			{
				cadesCerts.push({"name":cert.SubjectName, "value":cert.Thumbprint});
			}
			catch (ex)
			{
				alert("Ошибка при проверке свойств сертификатов: " + GetErrorMessage(ex));
				return;
			}
		}
		oStore.Close();
	}
	// Подписывание данных
	this.signData = function (cert_val, data, type) {
		var cert = cert_val.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase();
		if (!cert) {
			alert('Сертификат не выбран!');
			return;
		}

		try {
			oStore = objCreator("CAPICOM.Store");
			oStore.Open();
		}
		catch (ex) {
			alert("Ошибка при открытии списка сертификатов: " + GetErrorMessage(ex));
			return;
		}

		try {
			oSigner = objCreator("CAdESCOM.CPSigner");
			var oCerts = oStore.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, cert);
			oSigner.Certificate = oCerts.Item(1);
		}
		catch (ex) {
			alert("Ошибка при выборе сертификата: " + GetErrorMessage(ex));
			return;
		}

		try {
			var oSignedData = objCreator("CAdESCOM.CadesSignedData");
		}
		catch (ex) {
			alert("Ошибка при создании объекта подписи: " + GetErrorMessage(ex));
			return;
		}

		var sSignedData;
		oSignedData.Content = data;
		try {
			if (type) {
				oSigner.Options = 2;//1; //CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN
				sSignedData = oSignedData.SignCades(oSigner, CADES_BES, true);
			}
			else {
				oSigner.TSAAddress = $('#tsp_server').val();
				sSignedData = oSignedData.SignCades(oSigner, CADESCOM_CADES_DEFAULT, true);
			}
		}
		catch (ex) {
			alert("Ошибка при подписи данных: " + GetErrorMessage(ex));
			return;
		}
		oStore.Close();
		return sSignedData;
	}
	/* ------------------ / Стандартный функционал ------------------ */

	/* ------------------ Функционал для форм ------------------ */
	this.checkLoader = function (doc_id) {
		
		if (doc_id == undefined)
			doc_id = 0;
		
		//if ($('#cadesLoader').is(':visible')) {
			var data = cadesXMLStr.split("\n").join('').split("\t").join('');
			//alert(data);
			var signedData = signData($('#cadesCertList').val(), data, 1/*$('#cadesSubType1').is(':checked')*/);
			
			if (signedData) {
				$('#loader').show();
				//$.fn.colorbox.close();
				if (doc_id) {
					$('#cadesDocSign' + doc_id).val(signedData);
					$('#cadesFileBtn' + doc_id).hide();
					$('#cadesFileMsg' + doc_id).show();
					cadesFiles[doc_id].signed = 1;
				}
				else {
					$('#signContainer').html('<input type="hidden" name="field[new_sign]" value="' + signedData + '">');
					$("#form_element").submit();
				}
			}
		/*}
		else {
			setTimeout('OPR.Cades.checkLoader(' + doc_id + ')', 300);
		}*/
	}
	this.extFileDataCopy = function(container, type) {
		$('#' + container + ' fieldset ' + type).each(function(){
			$('#cades_form_element ' + type + '[name="' + $(this).attr('name') + '"]').val($(this).val());
		});
	}
	this.handleAjaxResult = function(data) {
		if (data.error != undefined) {
			alert(data.error);
			$('#' + (data.type == 'fields' ? 'subLoader' : 'cadesDocLoader' + data.id)).hide();
			return false;
		}
		cadesXMLStr = data.xml;
		var html_str = data.html;
		var files_data = '';
		if (data.type == 'fields') {
			for (var id in cadesFiles)
				if (typeof(cadesFiles[id].visible) == 'undefined' || cadesFiles[id].visible)
					files_data += cadesFiles[id].title + ' - ' + (cadesFiles[id].signed ? 'подписан' : 'не подписан') + '<br /><br />';
			if (files_data)
				files_data = '<div id="cades_doc_container" style="display:none;">' + files_data + '</div>'
		}
		var xml_head = '<h2>Параметры подписи</h2><select id="cadesCertList" style="width: 500px;"></select>' + 
		// если будет нужно сделаем зависимость от параметра
		//<br /><br /><input type="radio" name="cadesSubType" class="cadesSubType" value="0" id="cadesSubType1" checked=checked>&nbsp;<label for="cadesSubType1">Простая подпись</label><br /><input type="radio" name="cadesSubType" class="cadesSubType" value="1" id="cadesSubType2">&nbsp;<label for="cadesSubType2">Усовершенствованная подпись</label><br /><div id="tsp_container" style="display:none;">TSP Server: <input type="text" value="http://cryptopro.ru/tsp/" name="tsp_server" id="tsp_server" style="width: 400px;"></div>
		'<br /><a href="#" id="cadesHTMLView">Показать в текстовом виде</a>&nbsp;&nbsp;&nbsp;\
		<a href="#" id="cadesXMLView">Показать в XML</a>' + 
		(files_data ? '&nbsp;&nbsp;&nbsp;<a href="#" id="cadesDocView">Документы</a>' : '' ) +
		'<br /><h2 id="cadesSubHeader">Данные для подписания</h2>';

		/*var xml_bottom = '<br /><br />\
		<a id="cades' + (data.type == 'fields' ? 'Form' : 'Doc') + 'Cancel" class="mpgu_btn green_btn" onclick="return false;" href="#"><span>&nbsp;</span><span id="button_sub_cancel_text" class="b_center">Отмена</span><span class="b_right">&nbsp;</span></a>&nbsp;\
		<a id="cades' + (data.type == 'fields' ? 'Form' : 'Doc') + 'Submit" class="mpgu_btn green_btn" onclick="return false;" href="#"><span>&nbsp;</span><span id="button_sub_ok_text" class="b_center">Подписать ' + (data.type == 'fields' ? 'и подать заявление' : 'файл') + '</span><span class="b_right">&nbsp;</span></a>' + 
		(data.type == 'doc' ? '<input type="hidden" name="doc_id" value="' + data.id + '">' : '') + 
		'<img id="cadesLoader" src="/common/img/base/loader2.gif" style="display:none;" />'; */
		// сделать для XML вида документов возможность сворачивать тело файлов <>sdfsdfsdf ... sdsfsdfs<>
		//$('#cadesData').html(xml_head + '<div id="cades_html_container">' + html_str + '</div><div id="cades_xml_container" style="display:none;">' + cadesXMLStr.split("<").join("&lt;").split(">").join("&gt;").split("\n").join("<br>").split("\t").join("&nbsp;&nbsp;&nbsp;&nbsp;") + '</div>' + (files_data ? files_data : '') + xml_bottom);
		$('#cades_html').html(html_str);
		$('#cades_xml').html(cadesXMLStr.split("<").join("&lt;").split(">").join("&gt;").split("\n").join("<br>").split("\t").join("&nbsp;&nbsp;&nbsp;&nbsp;") + (files_data ? files_data : ''));
		$('#cadesButtonNext').attr('id','cades' + (data.type == 'fields' ? 'Form' : 'Doc') + 'Submit');
		$('#signDataBlock').slideDown('fast');
		/*var str = '<option value="">Выберите сертификат</option>';
		for (var i in cadesCerts) {
			if (i == 'indexOf') {
				continue;
			}
			str += '<option value="' + cadesCerts[i].value + '">' + cadesCerts[i].name + '</option>';
		}
		if (str)
			$('#cadesCertList').html(str);*/
		//$('.cadesSubType').change();
		//$('#cadesDataInfo').show();
		//jQuery.fn.colorbox({width: '700px', inline:true, href:"#cadesDataInfo",krClose:false, opacity: 0.2, title:"", open: true, overlayClose: false, onClosed: function(){cadesXMLStr = '';$('#cadesDataInfo').hide();}});
		$('#' + (data.type == 'fields' ? 'subLoader' : 'cadesDocLoader' + data.id)).hide();
		//alert(cadesXMLStr);
		return false;
	}

	function submitDocument(id) {
		$('#cadesDocLoader' + id).show();
		if (!_this.checkPlugIn()) {
			alert('Для подписания заявления Вам необходимо установить КриптоПро ЭЦП Browser plug-in.');
			$('#cadesDocLoader' + id).hide();
			return false;
		}

		cadesFileValid = true;
		for (var i in cadesFiles[id].container) {
			$('#' + cadesFiles[id].container[i] + ' input, #' + cadesFiles[id].container[i] + ' select, #' + cadesFiles[id].container[i] + ' textarea').each(function(){
				if (!$(this).valid())
					cadesFileValid = false;
			});
		}

		if (!cadesFileValid) {
			$('#cadesDocLoader' + id).hide();
			$('#validate_error').show();
			return false;
		}
		else {
			$('#validate_error').hide();
		}

		if (cadesFiles[id].required != 'undefined') {
			for (var i in cadesFiles[id].required) {
				var element = $('*[name="field[' + cadesFiles[id].required[i] + ']"]');
				if ((element.is('textarea') && element.html() == '') || !element.val()) {
					$('#cadesDocLoader' + id).hide();
					alert('Документ не заполнен или заполнен неверно!');
					return false;
				}
			}
		}

		if (!cadesCerts.length) {
			try {
				_this.getCertList();
			}
			catch(err) {
				$('#cadesDocLoader' + id).hide();
				alert("Не удалось получить список сертификатов");
				return;
			}
		}

		var form_str = '<form id="cades_form_element" name="sub_form" method="post" action="" target="cadesFileLoader" enctype="multipart/form-data">\
			<input type="hidden" name="org_id" value="' + $('input[name="org_id"]').val() + '">\
			<input type="hidden" name="form_id" value="' + $('input[name="form_id"]').val() + '">\
			<input type="hidden" name="action" value="get_cades_doc">\
			<input type="hidden" name="uniqueFormHash" value="' + $('input[name="uniqueFormHash"]').val() + '">\
			<input type="hidden" name="field[internal.cades_file_id]" value="' + id + '">\
		';
		for (var i in cadesFiles[id].block)
			form_str += '<input type="hidden" name="field[internal.cades_file_block][]" value="' + cadesFiles[id].block[i] + '">';
		form_str += '<input type="hidden" name="field[internal.cades_file_num]" value="' + cadesFiles[id].num + '">';
		if (cadesFiles[id].form_num != undefined)
			form_str += '<input type="hidden" name="field[internal.cades_file_form_num]" value="' + cadesFiles[id].form_num + '">';
		if (cadesFiles[id].type != undefined) 
			form_str += '<input type="hidden" name="field[internal.cades_file_type]" value="' + cadesFiles[id].type + '">';
		form_str += '</form>';
		$('#cadesFormContainer').html(form_str);

		for (var i in cadesFiles[id].container) {
			$('#' + cadesFiles[id].container[i] + ' fieldset').clone().appendTo('#cades_form_element');
			extFileDataCopy(cadesFiles[id].container[i], 'select');
			extFileDataCopy(cadesFiles[id].container[i], 'textarea');
		}
		$('#cades_form_element').submit();
		$('#cadesFormContainer').html('');
	}

	function submitForm() {
		
		if (!checkPlugIn()) {
			alert('Для подписания заявления Вам необходимо установить КриптоПро ЭЦП Browser plug-in.');
			$('#loader').hide();
			return false;
		}
		if (!$("#form_element").valid()) {
			$('#loader').hide();
			$('#validate_error').show();
			return false;
		}
		else {
			$('#validate_error').hide();
		}
		if (!cadesCerts.length) {
			try {
				getCertList();
			}
			catch(err) {
				$('#loader').hide();
				alert("Не удалось получить список сертификатов");
				return;
			}
		}
		var str = '<form id="cades_form_element" name="sub_form" method="post" action="" target="cadesFileLoader" enctype="multipart/form-data">';
		$('#form_element input[type="text"]:not(:disabled), #form_element input[type="checkbox"]:not(:disabled):checked, #form_element input[type="radio"]:not(:disabled):checked, #form_element input[type="hidden"]:not(:disabled), #form_element select:not(:disabled),#form_element textarea:not(:disabled)').each(function(){//SZ
			if ($(this).attr('name') != undefined) {
				str += '<input type="hidden" name="' + $(this).attr('name') + '" value="' + encodeURIComponent($(this).val()) + '" />';//SZ
			}
				
		});
		str += '</form>';
	

		$('#cadesFormContainer').append(str);
		$('#cades_form_element input[name="action"]').val('get_cades_fields');
		$('#cades_form_element').submit();
		$('#cadesFormContainer').html('');
	}

	this.init = function (options) {
		if (options != undefined && options.cadesFiles != undefined) {
			cadesFiles = options.cadesFiles;
			for (var id in cadesFiles) {
				cadesFilesCounter++;
			}
		}
		else
			cadesFiles = {};
		$(document).ready(function() {
			// события для изменения подписанных файлов
			for (var id in cadesFiles) {
				for (var i in cadesFiles[id].container) {
					$('#' + cadesFiles[id].container[i] + ' input, #' + cadesFiles[id].container[i] + ' select, #' + cadesFiles[id].container[i] + ' textarea').live('change', function(){
						$('#cadesDocSign' + id).val('');
						$('#cadesFileBtn' + id).show();
						$('#cadesFileMsg' + id).hide();
						cadesFiles[id].signed = 0;
					});
				}
				//cadesFilesCounter++; //переместил в init, для корректной работы черновика
			}		
			$('.cadesFileBtn a').live('click', function(){
				var id = $(this).attr('id').substr(12);
				OPR.Cades.submitDocument(id);
			});

			$('#cadesButtonNext').click(function(){
				OPR.Cades.submitForm();
			});

			$('.cadesSubType').live('change', function(){
				if ($('#cadesSubType1').is(':checked')) {
					$('#tsp_container').hide();
				}
				else {
					$('#tsp_container').show();
				}
			});

			$('#cadesDocCancel').live('click',function(){
				OPR.Cades.emptyStr();
				jQuery.fn.colorbox.close();
				return false;
			});

			$('#cadesDocSubmit').live('click',function(){
				if (!$('#cadesCertList').val()) {
					alert('Выберите сертификат!');
					$('#loader').hide();
					return;
				}
				$('#cadesLoader').show();
				OPR.Cades.checkLoader($('input[name="doc_id"]').val());
				return false;
			});

			$('#cadesFormCancel').live('click',function(){
				OPR.Cades.emptyStr();
				jQuery.fn.colorbox.close();
				return false;
			});

			$('#cadesFormSubmit').live('click',function(){
				if (!$('#cadesCertList').val()) {
					alert('Выберите сертификат!');
					$('#loader').hide();
					return;
				}
				$('#cadesLoader').show();
				OPR.Cades.checkLoader();
				return false;
			});

			$('#cadesHTMLView').live('click', function(){
				$('#cades_html_container').show();
				$('#cades_doc_container').hide();
				$('#cades_xml_container').hide();
				$('#cadesSubHeader').html('Данные для подписания');
				return false;
			});

			$('#cadesXMLView').live('click', function(){
				$('#cades_html_container').hide();
				$('#cades_doc_container').hide();
				$('#cades_xml_container').show();
				$('#cadesSubHeader').html('Данные для подписания');
				return false;
			});

			$('#cadesDocView').live('click', function(){
				$('#cades_html_container').hide();
				$('#cades_xml_container').hide();
				$('#cades_doc_container').show();
				$('#cadesSubHeader').html('Документы');
				return false;
			});
		});
	}

	return {
		init: function (options){
			init(options);
		},
		checkPlugIn: function(){
			return checkPlugIn();
		},
		checkLoader: function(doc_id){
			if (doc_id == undefined)
				doc_id = 0;
			return checkLoader(doc_id);
		},
		handleAjaxResult: function (data){
			handleAjaxResult(data);
		},
		addDocument: function(data){
			var id = cadesFilesCounter++;
			for (var i in data.container) {
				$('#' + data.container[i] + ' input, #' + data.container[i] + ' select, #' + data.container[i] + ' textarea').live('change', function(){
					$('#cadesDocSign' + id).val('');
					$('#cadesFileBtn' + id).show();
					$('#cadesFileMsg' + id).hide();
					data.signed = 0;
				});
			}
			cadesFiles[id] = data;
			return id;
		},
		removeDocument: function(id){
			delete cadesFiles[id];
		},
		showDocument: function(id){
			cadesFiles[id].visible = 1;
		},
		hideDocument: function(id){
			cadesFiles[id].visible = 0;
		},
		emptyStr: function() {
			cadesXMLStr = '';
		},
		submitDocument: function(id) {
			submitDocument(id);
		},
		submitForm: function() {
			submitForm();
		},
		getCertList: function() {
			getCertList();
			return cadesCerts;
		},
		signData: function(cert_val, data, type) {
			return signData(cert_val, data, type);
		}
	}
})();