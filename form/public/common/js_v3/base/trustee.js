'use strict';

var trusteeNeedReload = false;

(function (window, document, $, undefined) {

	$.validator.addMethod('snils_crc', function (value, element) {
		var strippedVal = value.replace(/[- ]/g, '');
		if (strippedVal.length < 11)
			return false;
		var no = strippedVal.substr(0, 9);
		var check = strippedVal.substr(9);
		var i, sum = 0, modulo;
		for (i = 9 - 1; i >= 0; i--) {
			sum += no.charAt(i) * (9 - i);
		}
		modulo = sum % 101;
		if (modulo === 100)
			modulo = 0;
		return (modulo === parseInt(check, 10));
	}, 'СНИЛС введен не верно.');

	$(document).ready(function () {
		$('.trustee-delete').on('click', function () {
			var trusteeId = $(this).data('trustee-id');
			var confirmRemoveMessage = $(this).data('confirm-message');
			if (trusteeId && confirm(confirmRemoveMessage)) {
				$.ajax({
					url: document.location.href,
					type: "POST",
					dataType: "json",
					data: ({
						delete_trustee: 1,
						trustee_id: trusteeId
					}),
					success: function (data) {
						if (typeof (data.status) !== 'undefined' && data.status === 'ok') {
							var wd = window || document;
							wd.location.reload(true);
							return false;
						}
					},
					error: function (data) {
					}
				});
			}
			return false;
		});

		$('#trustee_add_button').on('click', function () {
			try {
				var dialogConfig = {
					container: 'trustee-add-container',
					form: 'trustee-add-form',
					message: 'trustee-add-text',
					ok_button: 'trustee-add-button',
					cancel_button: 'trustee-save-cancel-button'
				};
				$.fn.colorbox({
					width: '570px',
					inline: true,
					html: OPR.templater('trustee_add_dialog', dialogConfig),
					krClose: false,
					opacity: 0.2,
					title: '',
					open: true,
					overlayClose: true,
					onClosed: function () {
						//$('#' + dialogConfig.cancel_button).trigger('click');
						return false;
					},
					onShow: function () {
						FormController.initialize($('#' + dialogConfig.form));
					}
				});
				$('body').off('click.trustee-add-cancel').on('click.trustee-add-cancel', '#' + dialogConfig.cancel_button, function () {
					if (trusteeNeedReload) {
						var wd = window || document;
						wd.location.reload(true);
					}
					$.fn.colorbox.close();
				});
				var $okButton = $('#' + dialogConfig.ok_button);
				$okButton.unbind('click.trustee-add').bind('click.trustee-add', function () {
					if ($('#' + dialogConfig.form).valid()) {
						var snils = $('#' + dialogConfig.form + ' input[name="snils"]').val();
						$('#' + dialogConfig.form).hide();
						$okButton.hide();
						$('#' + dialogConfig.message).text('Выполняется запрос...');
						$.ajax({
							url: cfgMainHost + '/common/ajax/index.php',
							type: 'POST',
							dataType: 'json',
							data: {
								'ajaxModule' : 'Users',
								'ajaxAction' : 'getInitialsBySnils',
								'snils'		 : snils,
							},
							error: function () {
								var message = 'Пользователь с таким СНИЛС не найден';
								$('#' + dialogConfig.message).html(message);
								$okButton.hide();
								return false;
							},
							success: function (data) {
								var initials = data.client.initials;
								var initialsMessagePart = initials.surname + ' ' + initials.name + '. ' + initials.patronymic + '.';
								var message = 'Действительно ли вы хотите сделать доверенным лицом: ' + initialsMessagePart + ', СНИЛС: ' + snils + ' ?';
								$('#' + dialogConfig.message).text(message);
								var $confirmButton = $('<a class="button green" id="trustee-confirm-button" href="#">Добавить</a>&nbsp;');
								$okButton.replaceWith($confirmButton);
								$confirmButton.unbind('click.trustee-confirm').bind('click.trustee-confirm', function () {
									$.ajax({
										url: document.location.href,
										type: 'POST',
										dataType: 'json',
										data: ({
											check_trustee: 1,
											snls: snils,
										}),
										success: function (data) {
											var message = 'Во время добавления доверенного лица произошла ошибка, попробуйте позже!';
											if (data != null && typeof (data) != 'undefined' && typeof (data.status) != 'undefined') {
												switch (data.status) {
													case 'ok':
														location.reload();
														return;
													case 'is_trustee':
														message = 'Пользователь уже есть в списке доверенных лиц.';
														break;
													case 'error':
														message = 'Во время добавления доверенного лица произошла ошибка, попробуйте позже!';
														break;
												}
											}
											$('#' + dialogConfig.message).html(message);
											$confirmButton.hide();
											return false;
										},
										error: function (data) {
											var message = 'Во время добавления доверенного лица произошла ошибка, попробуйте позже!';
											$('#' + dialogConfig.message).html(message);
											return false;
										},
									});
								});
							},
						});
						return;
					}
					return false;
				});
			} catch (e) {
				alert(e.message);
			}
			return false;
		});
	});
})(window, document, jQuery);