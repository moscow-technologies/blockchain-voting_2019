<?php

namespace App\Service\Database;

/**
* Исключение с возможностью указания отладочного сообщения
* Используется к примеру чтобы добавить к исключению информацию об SQL операторе и его параметрах
*/

	class DBDebugException extends \Exception {
		
		/**
		* @var string $debug_message отладочная строка
		*/
		private $debug_message;
		
		/**
		* Конструктор
		* @param string $message Строка ошибки
		* @param string $debug_message Отладочная информация
		* @param int $code Код ошибки
		*/
		function __construct ($message, $debug_message, $code=0) {
			parent::__construct($message, $code);
			$this->debug_message = $debug_message;
		}
		
		/**
		* Функция возвращает отладочную строку
		* @return string
		*/
		public function getDebugMessage() {
			return $this->debug_message;
		}
	}

?>