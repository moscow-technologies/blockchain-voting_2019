if (!window.assistant)
{
	function Assistant (params) {
		//Конфигурация
		Assistant.prototype.__toggleDelay = 200;
		Assistant.prototype.__toggleStepDelayStep = 0;
		Assistant.prototype.__saveProfileDelay = 2000;
		
		//Приватные
		Assistant.prototype.__selectedCategory = {}; //текущая категория
		Assistant.prototype.__categories = {};
		Assistant.prototype.__showQuestionsCount = 0; //количество открытых вопросов ( включая вложенные )
		Assistant.prototype.__toplevelQuestions = []; //ID вопросов верхнего уровня ( опорный массив для расчета и рендеринга блока сервисов ) 
		Assistant.prototype.__toplevelQuestionsCount = 0; //Количество блоков вопросов верхнего уровня
		Assistant.prototype.__throughQuestionsCount = 0;  //Сквозное количество блоков вопросов 
		Assistant.prototype.__possibleServices = {}; //ID возможных подобранных услуг
		Assistant.prototype.__IsShowServiceNotInCatalog = false; //Если нужно показывать услуги, не заведенные в каталоге, то сюда true
		Assistant.prototype.__currentAnswers = [];
		Assistant.prototype.__currentProfileID = 0;
		Assistant.prototype.__currentProfile = {};
		Assistant.prototype.__profiles = {};
		Assistant.prototype.__currentSaveTimer = false;
		
		Assistant.prototype.renderQuestions = function()
		{
			var questionHTML, questionsAllHTML = '', qItem, answersLength, aDefault, qStyle, qChilds, pId, isAns, qn;
			$('.questions_container').hide();
			for ( var q in questions )
			{
				if ( questions[q].QUESTION_TYPE != 'radio' && questions[q].QUESTION_TYPE != 'checkbox' ) continue;
				if ( !questions[q].PARENTS ) this.__toplevelQuestions[q] = {}; //опорный массив вопросов первого уровня, потом отсюда будем начинать построение дерева услуг
				
				qStyle = '';
				qn = false;
				qItem = { 
					name : 'name_q-'+q+'-a',
					id : 'id_q-'+q+'-a',
					containerID : q, 
					items : []
				};
				
				switch ( questions[q].QUESTION_TYPE )
				{
					case 'radio':
						answersLength = 0;
						for ( var a in questions[q].ANSWERS )
						{
							qItem.items[a] = { 
								name : questions[q].ANSWERS[a].TITLE,
								attr : 'question="' + q + '"'
							};
							if ( this.__currentProfile && this.__currentProfile.ANSWERS[a] ) qItem['value'] = a;
							answersLength += questions[q].ANSWERS[a].TITLE.length;
						}
						qItem['layout'] = answersLength > 30 ? 'vertical' : 'horizontal';
						qChilds = questions[q].CHILDS;
						qTemplate = 'std_radiogroup';
						break;
					case 'checkbox':
						var answer;
						for (var a in questions[q].ANSWERS)
						{
							answer = questions[q].ANSWERS[a];
							qItem.items.push({ 
								value : a,
								id : "id_q-" + q + "-a-" + a,
								label : answer.TITLE,
								isChecked : this.__currentProfile && this.__currentProfile.ANSWERS[a] ? true : false,
								attrs : 'question="' + q + '"'
							});
						}
						qTemplate = 'std_checkgroup';
						break;
				}

				if ( questions[q].PARENTS ) //Если это дочерний узел 
				{
					pId = questions[q].PARENTS[questions[q].PARENTS.length - 1];
					isAns = false;
					if ( pId )
						for ( var parentAnswer in questions[pId].ANSWERS )
							if ( this.__currentProfile && this.__currentProfile.ANSWERS[parentAnswer] && questions[pId].CHILDS[q].DEPENDS_ON_ANSWER == parentAnswer ) { // у родителя выделено значение по умолчанию ( из профиля )
								isAns = true;
								if ( questions[pId].THROUGH_CHILD_NUMBER > 0 )
									questions[pId].THROUGH_CHILD_NUMBER++;
								else
									questions[pId].THROUGH_CHILD_NUMBER = 1;
								this.__showQuestionsCount++;
								qn = questions[pId].QUESTION_NUMBER + '.' + questions[pId].THROUGH_CHILD_NUMBER;
								questions[pId].CHILDS[q].WAS_ONCE_SHOWN = 1;									
								break;
							}
							
					if ( !isAns )
						qStyle = 'display: none;';
				}
				else
				{
					questions[q].QUESTION_NUMBER = ++this.__throughQuestionsCount;
				}
				if ( qn == false ) qn = this.__throughQuestionsCount;
				questionsAllHTML += '<fieldset id="question_container_'+ q +'" style="' + qStyle + '" class="form-block">\
				<div style="margin-bottom:10px;"><legend style="display:inline-block;"><span id="question_number_' + q + '">' + qn + '</span>\
				.&nbsp;' + questions[q].TITLE + '</legend></div>' + OPR.templater(qTemplate, { data: qItem }) + '</fieldset>';
				
			}
			this.__showQuestionsCount += this.__throughQuestionsCount;
			$('.questions_container').html(questionsAllHTML);
			$('#questions_total_title').html(
			
				'Для подбора услуг вам необходимо ответить на <b>' + this.__showQuestionsCount + '</b>' + ' вопрос' + getNumEnding(this.__showQuestionsCount)
			);
			$('.questions_container').show();
			if ( this.__currentProfile )
			{
				this.buildPossibleServiceData();
				this.redrawPossibleServices();
			}
		}

		Assistant.prototype.getSortedPossibleServices = function()
		{
			var possibleServices = [];
			for ( var i in this.__possibleServices )
			{
				for ( var j = 0; j < this.__possibleServices[i].length; j++ )
					possibleServices.push( $.extend( {PROCEDURE_ID: i}, this.__possibleServices[i][j] ) );
			}
			
			return possibleServices.sort(function(a,b){
				return ( parseInt( b.POPULAR ) ? parseInt( b.POPULAR ) : 0 ) - ( parseInt( a.POPULAR ) ? parseInt( a.POPULAR ) : 0 ); 
			});
		}
		
		Assistant.prototype.redrawPossibleServices = function()
		{
			var html = '', cnt = 1, s;
			var possibleServices = this.getSortedPossibleServices();					
			for ( i = 0; i < possibleServices.length; i++ ) 
			{
				s = possibleServices[i];
				if ( !s.PROCEDURE_ID || !s.TITLE ) continue;
				html += '<a class="small_link mt_20" href="' + cfgMainHost + '/ru/services/procedure/0/0/' + s.PROCEDURE_ID + '">' + s.TITLE + '</a>';
					
 				if ( ++cnt > this.__showQuestionsCount ) break;
				
			}
			
			if ( html )
				html = '<h3 style="margin-bottom:25px">Возможные услуги:</h3>' + html;
			else
				html = 'Ответье на один или несколько вопросов, что мы подобрали услуги, отвечающие Вашим требованиям.';
			html += '<a class="expand no-arrow all-available-services" style="font-weight:bold;" href="' + cfgMainHost + '/ru/"><span>Все возможные услуги</span></a>';
			
			$(".possible_services").html(html);
			$(".possible_services").hide();
			$(".possible_services").show(this.__toggleDelay);
		}

		Assistant.prototype.updateProfile = function()
		{
			var possibleServices = this.getSortedPossibleServices(), answers = {};

			//Собрали информацию по ответам
			$(".questions_container input[type=radio], .questions_container input[type=checkbox]").each(function(){
				if ( $(this).attr('checked') ) answers[$(this).val()] = {};
			});
			
			//Сохранили локальный профиль
			this.__currentProfile.ANSWERS = answers;
			this.saveLocalProfile();
			if ( this.__isRegistratedClient ) //Для аутентифицированного пользователя сохраняем ответы на сервер, с задержкой
				this.saveRemoteProfile(possibleServices);
		}

		Assistant.prototype.saveRemoteProfile = function(possibleServices)
		{
			var this_obj = this;
			var postData = {
				action:'ajaxPostAnswers',
				answers:Object.keys(this.__currentProfile.ANSWERS),
				services:[],
				profile_id: this.__currentProfileID,
				assist_category_id: this.__selectedCategory
			};
			for ( var i = 0; i < possibleServices.length; i++ ) postData.services.push( possibleServices[i].PROCEDURE_ID );
			
			if ( this.__currentSaveTimer )
				clearTimeout(this.__currentSaveTimer);
			this.__currentSaveTimer = setTimeout( function() { 
				$.ajax({ url: cfgMainHost + '/ru/assistant/', type: "POST", data: postData, dataType: 'json', success : function(data) {
					if ( data.success > 0 && data.profile_id > 0 )
					{
						if ( this_obj.__currentProfileID == 0 ) //пересохраним локальный профиль с новым ключом, полученным от сервера
						{
							this_obj.__currentProfileID = data.profile_id;
							this_obj.saveLocalProfile();
						}
						else
						{
							this_obj.__currentProfileID = data.profile_id;
						}
						
					}
				}}); //Отошлем данные для профиля
			}, this.__saveProfileDelay );
		}
		
		Assistant.prototype.saveLocalProfile = function()
		{
			if ( !$.jStorage.storageAvailable() ) return false;
			var saveData = {};
			saveData[this.__currentProfileID] = this.__currentProfile;
			saveData[this.__currentProfileID]['MDATE'] = new Date().getTime();
			$.jStorage.set('ASSISTANT_PROFILES:'+this.__selectedCategory, saveData);
		}

		//Загружает локальные профили по текущей категории. Если профилей несколько, то загружает первый ( пока у нас не будет функционала управления профилями ). 
		Assistant.prototype.loadLocalProfile = function(possibleServices)
		{
			if ( !$.jStorage.storageAvailable() ) return false;
			var profiles = $.jStorage.get('ASSISTANT_PROFILES:'+this.__selectedCategory, {isNew:true, MDATE: new Date().getTime(), 0:{ANSWERS:{}}});
			for ( var i in profiles ) break;
			this.__currentProfileID = i;
			this.__currentProfile = profiles[i];
		}

		Assistant.prototype.syncProfiles = function(possibleServices)
		{
			var remoteProfile = false;
			for ( var i in this.__profiles ) break; //Для удаленного профиля берем первый пришедший
			if ( i ) remoteProfile = this.__profiles[i];

			if ( remoteProfile && this.__currentProfile.isNew )
			{
				this.__currentProfile.ANSWERS = remoteProfile.ANSWERS;
				this.saveLocalProfile();
			}
			else if ( remoteProfile && !this.__currentProfile.isNew )
			{
				if ( remoteProfile.MDATE < this.__currentProfile.MDATE )
					this.saveRemoteProfile(this.getSortedPossibleServices());
				else
				{
					this.__currentProfile.ANSWERS = remoteProfile.ANSWERS;
					this.saveLocalProfile();
				}
			}
			else if ( !remoteProfile && this.__currentProfile && !$.isEmptyObject(this.__currentProfile.ANSWERS) )
				this.saveRemoteProfile(this.getSortedPossibleServices());
		}
		
		Assistant.prototype.createEventDispatchers = function()
		{
			var this_obj = this;

			$('.back_to_questions_button').click(function() {
				$('.assistant #questions_total_title').show(this_obj.__toggleStepDelayStep);
				$('.assistant .questions').show(this_obj.__toggleStepDelayStep);
				$('.assistant .possible_services').show(this_obj.__toggleStepDelayStep);
				$(".assistant .services .services_container").html('');
				$(".assistant .services").hide(this_obj.__toggleStepDelayStep);	
			    $('html, body').animate({
			        scrollTop: $(".assistant .questions").offset().top - 40
			    }, this_obj.__toggleDelay);			
			});
			
			$('.assistant .get_services_button').click(function() {
				var possibleServices = this_obj.getSortedPossibleServices(), htmlServices = '' , item, s; 
				if ( !possibleServices.length ) return;

				//Покажем подобранные услуги				
				for ( var i = 0; i < possibleServices.length; i++ )
				{
				
					if ( !possibleServices[i].PROCEDURE_ID | !possibleServices[i].TITLE ) continue;

					var arr=possibleServices[i]['TITLE'].split(" ");
					var firstwords="";
					for(var j=0;j<arr.length-1;j++)
					{
						firstwords+=arr[j]+" ";
					}
					
					var lastword=arr[arr.length-1];
					possibleServices[i]['firstwords']=firstwords;
					possibleServices[i]['lastword']=lastword;
					console.log(possibleServices[i]['TITLE']);
					htmlServices += OPR.templater('assistantService', { data: possibleServices[i] });
				}
				$('.assistant #questions_total_title').hide(this_obj.__toggleStepDelayStep);
				$('.assistant .questions').hide(this_obj.__toggleStepDelayStep);
				$('.assistant .possible_services').hide(this_obj.__toggleStepDelayStep);
				$(".assistant .services .services_container").html(htmlServices);
				$(".assistant .services").show(this_obj.__toggleStepDelayStep);	
			    $('html, body').animate({
			        scrollTop: $(".assistant .services").offset().top - 40
			    }, this_obj.__toggleDelay);			
				
			});
			
			//Обработчик кликов на радио
			$('.assistant .questions_container input[type=radio], .assistant .questions_container input[type=checkbox]').change(function(event) {
				var q = $(this).attr('question');
				if ( q > 0 )
				{
					var qChilds = questions[q].CHILDS;
					this_obj.updateProfile();
					if ( qChilds ) // Если есть субвопросы, то нужно скрыть вопросы предыдущего радио и показать вопросы выделенного 
					{
						var childsDeltaNum = 0;
						for ( var qc in qChilds )
						{
							if ( qChilds[qc].DEPENDS_ON_ANSWER > 0 ) //показы-скрытия и дельта вопросов всего в тайтле
							{
								if ( $(this).is(':checked') && $(this).val() == qChilds[qc].DEPENDS_ON_ANSWER && ( questions[qc].QUESTION_TYPE == 'radio' || questions[qc].QUESTION_TYPE == 'checkbox' )) // покажем субвопрос. 
								{
									var qShow = $("#question_container_"+qc);
									qShow.show(this_obj.__toggleDelay);
									if ( !qChilds[qc].WAS_ONCE_SHOWN ) //Если вопрос ни разу не показывался, посчитаем его номер
									{
										if ( questions[q].THROUGH_CHILD_NUMBER > 0 )
											questions[q].THROUGH_CHILD_NUMBER++;
										else
											questions[q].THROUGH_CHILD_NUMBER = 1;
										this_obj.__throughQuestionsCount++;
										var qn = questions[q].QUESTION_NUMBER + '.' + questions[q].THROUGH_CHILD_NUMBER;
										$( "#question_number_" + qc ).html( qn );
										questions[q].CHILDS[qc].WAS_ONCE_SHOWN = 1;
									}
									childsDeltaNum++;
								}
								else  // уменьшаем и скроем субвопрос только в тогда, когда он виден и ответ, от которого он зависит, не выбран
								if ( $("#question_container_"+qc).is(":visible") && ( 
									( $(this).attr('type') == 'checkbox' && !$(this).is(":checked") && $(this).val() == qChilds[qc].DEPENDS_ON_ANSWER ) ||
									( $(this).attr('type') == 'radio' && $(this).val() != qChilds[qc].DEPENDS_ON_ANSWER )
								) )
								{
									$("#question_container_"+qc).hide(this_obj.__toggleDelay);
									childsDeltaNum--;
									$("#question_container_"+qc+" input[type=radio], #question_container_"+qc+" input[type=checkbox]").removeAttr("checked");
								}
							}
						}
						if ( childsDeltaNum != 0 )
						{
							if ( this_obj.__showQuestionsCount > 0 )
							{
								this_obj.__showQuestionsCount += childsDeltaNum;
								$('#questions_total_title').html(
									'Для подбора услуг вам необходимо ответить на <b>' + this_obj.__showQuestionsCount + '</b> ' + 'вопрос' + getNumEnding(this_obj.__showQuestionsCount) 
								);
							}	
						}
					}
					this_obj.buildPossibleServiceData();
					this_obj.redrawPossibleServices();
				}
			});
		},

		//Строит плоскую структуру услуг из дерева ответов, исходя из логики, что услуги находятся только на листьях ( конечных узлах ) ответов. 
		//Услуги на промежуточных узлах игнорируются
		Assistant.prototype.buildPossibleServiceData = function(qChilds) 
		{
			var qCurrent, isTop = false;
			if (!qChilds) //вызов верхнего уровня, строим стек ответов
			{
				this.__currentAnswers = [];
				qCurrent = this.__toplevelQuestions;
				this.__possibleServices = [];
				isTop = true;
			}
			else
				qCurrent = qChilds;

			for ( var i in qCurrent ) 
			{
				var q = questions[i];
				if ( q.QUESTION_TYPE == 'radio' )
				{
					var inp = $('input:radio[name=name_q-'+ i +'-a]:checked'); //Получаем id ответа. Узнаем его значение и проверяем, является ли он тупиковым узлом.
					this.__buildPossibleServiceData_processQuestion(q,inp,isTop,true);
				}
				else if ( q.QUESTION_TYPE == 'checkbox' )
				{ //если ни один чекбокс не выделен - показываем все услуги чекбоксов. Как только выделен хотя бы один - учитываем только его услуги
					// определим, есть ли хоть один выделенный чекбокс - от этого будет зависеть алгоритм
					var isOneChecked = $('input:checkbox[name=name_q-'+ i +'-a]:checked').length ? true : false;
					for ( var a in q.ANSWERS ) 
					{
						var inp = $('input:checkbox#id_q-' + i + '-a-' + a + ':checked'); //Получаем id ответа. Узнаем его значение и проверяем, является ли он тупиковым узлом.
						this.__buildPossibleServiceData_processQuestion(q,inp,isTop,isOneChecked);
					}
				}
			}
		}

		Assistant.prototype.__buildPossibleServiceData_processQuestion = function(q,inp,isTop,isOneChecked)
		{
			if ( inp.val() || !isTop )	//Если у вопроса верхнего уровня не выделен ни один ответ, не идем внутрь 
			{
				if ( !$.isEmptyObject(q.CHILDS) ) //Если нет, но отмечен и есть зависимые от него вопросы, то идем на уровень вниз.
				{
					var qInnerChilds = [];
					for (var j in q.CHILDS)
						if ( ( isTop && q.CHILDS[j].DEPENDS_ON_ANSWER == inp.val() ) || !isTop )
							qInnerChilds[j] = {};
				}
				
				if ( $.isEmptyObject(qInnerChilds) )
				{
					for ( var a in q.ANSWERS ) //Добавляем сервисы у вопросов, только если не отмечен ни один ( тогда все у всех вопросов ), либо только у отмеченного. Или это нижний уровень и ни один ответ не выбран - добавляем все сервисы всех ответов
						if ( ( inp.val() == a && q.ANSWERS[inp.val()] && q.ANSWERS[inp.val()].SERVICES ) || ( !isTop && !inp.val() && !isOneChecked ) )
							this.mergePossibleServices(q.ANSWERS[a].SERVICES); 
				}
				else 
					this.buildPossibleServiceData(qInnerChilds); //Если есть вложенные вопросы, рекурсивно идем вниз
			}
		}

		Assistant.prototype.mergePossibleServices = function(arr)
		{
			for ( var i in arr )
				if ( services[i] )
					for ( var j in services[i] )
						this.__possibleServices[j] = services[i][j];
				else if ( this.__IsShowServiceNotInCatalog )
					this.__possibleServices[i] = $.extend( arr[i], {NO_LINK_TO_CATALOG:true} )
		}
			
		Assistant.prototype.renderError = function(msg)
		{
			alert(msg);
		}

		//Конструктор
		{
			this.__isRegistratedClient = isRegistratedClient;
			this.__selectedCategory = category;
			this.__profiles = profiles;
			
			this.loadLocalProfile();
			this.syncProfiles();
			this.renderQuestions();
			this.redrawPossibleServices();
			this.createEventDispatchers();
			
		}
	}
	$(document).ready(function() {
		window.assistant = new Assistant();
	});
}