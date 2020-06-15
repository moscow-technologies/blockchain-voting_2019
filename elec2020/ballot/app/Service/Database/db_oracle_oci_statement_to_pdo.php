<?php
/**
 * Прокси-класс для работы с LOB-ами в выгрузках из БД.
 * В качестве дальнейшего развития можно использовать чтение данных из БД по частям.
 */

namespace App\Service\Database;

/**
 * Класс эмуляции PDOStatement при помощи библиотеки oci8
 * @todo Эмуляция неполноценна, только основные функции
 */
class db_oracle_oci_statement_to_pdo {
/**
 * Превыборка записей по умолчанию из Oracle
 */
	const OCI_PREFETCH = 1000;

	/**
	 * Идентификатор соединения с Oracle
	 * @var resource
	 */
	private $oci_connection;

	/**
	 * Идентификатор оператора, возвращенного oci_parse
	 * @var resource
	 */
	private $oci_parsed_statement;

	/**
	 * Массив LOB-дескрипторов и значений, использующихся для вставки данных в LOB-поля
	 * @var array
	 */
	public $lobs = array();

	/**
	 * Конструктор
	 * @param resource $oci_connection Идентификатор соединения с Oracle, возвращенный oci_connect
	 * @param resource $oci_parsed_statement Идентификатор оператора, возвращенный oci_parse
	 */
	function __construct(&$oci_connection, &$oci_parsed_statement) {
		$this->oci_connection = &$oci_connection;
		$this->oci_parsed_statement = &$oci_parsed_statement;
		oci_set_prefetch($this->oci_parsed_statement, self::OCI_PREFETCH);
	}

	/**
	 * Деструктор, очищает все oci-дескрипторы
	 */
	public function __destruct() {
		foreach ($this->lobs as $lob)
			oci_free_descriptor($lob['handle']);
		oci_free_statement($this->oci_parsed_statement);
	}

	/**
	 * Связывает поле с переменной PHP
	 * @see PDOStatement::bindColumn
	 */
	public function bindColumn($column, &$param, $type) {
		return oci_define_by_name($this->oci_parsed_statement, $column, $param);
	}

	/**
	 * Связывает параметр с определенной переменной
	 * @see PDOStatement::bindParam
	 */
	public function bindParam($parameter, &$value, $data_type = PDO::PARAM_STR) {
		if ($data_type == OCI_B_BLOB || $data_type == OCI_B_CLOB) {
			// Отдельно обрабатываем LOB-ы, для них заводим и сохраняем дескрипторы
			// для последующей записи в ф-ии save_lobs после выполнения операции
			$handle = oci_new_descriptor($this->oci_connection, OCI_D_LOB);
			if ($handle) {
				$this->lobs[] = array('param' => $parameter, 'handle' => $handle, 'value' => &$value);
				$result = oci_bind_by_name($this->oci_parsed_statement, $parameter, $handle, -1, $data_type);
			}
			else
				$result = false;
		}
		else {
			$result = oci_bind_by_name($this->oci_parsed_statement, $parameter, $value);
                }
		if (!$result) {
			$e = oci_error($this->oci_parsed_statement);
			throw new DBDebugException($e['message'], $e['sqltext'], $e['code']);
		}
		return $result;
	}

	/**
	 * Связывает значение с определенным параметром
	 * @see PDOStatement::bindValue
	 */
	public function bindValue($parameter, $value, $data_type = PDO::PARAM_STR) {
		return $this->bindParam($parameter, $value, $data_type);
	}

	/**
	 * Выполняет подготовленный оператор
	 * @see PDOStatement::execute
	 * @param boolean $autocommit Вызывать ли commit после выполнения оператора
	 */
	public function execute($input_parameters = array(), $autocommit = true) {
		if (sizeof($input_parameters) > 0)
			foreach ($input_parameters as $key => $value)
				$this->bindParam($key, $value);

		$r = oci_execute($this->oci_parsed_statement, OCI_DEFAULT);
		if (!$r) {
			$e = oci_error($this->oci_parsed_statement);
			throw new DBDebugException($e['message'], $e['sqltext'].preg_replace('/Array\s*\((.*)\)/s', '\1', var_export($input_parameters, true)), $e['code']);
		}
		$this->save_lobs();
		if ($autocommit)
			oci_commit($this->oci_connection);
	}

	/**
	 * Записывает LOB-значения в БД
	 */
	private function save_lobs() {
		if (!$this->lobs) return;
		foreach ($this->lobs as $lob) {
			if (false === @$lob['handle']->write($lob['value'])) {
				$e = oci_error($this->oci_parsed_statement);
				throw new DBDebugException($e['message'], $e['sqltext'], -0x7777777);
			}
		}
	}

	/**
	 * Закрывает курсор
	 * @see PDOStatement::closeCursor
	 */
	public function closeCursor() {
		return ocifreecursor($this->oci_parsed_statement);
	}

	/**
	 * Возвращает кол-во колонок в результирующем множестве
	 * @see PDOStatement::columnCount
	 */
	public function columnCount() {
		return oci_num_fields($this->oci_parsed_statement);
	}

	/**
	 * Возвращает последний код ошибки
	 * @see PDOStatement::errorCode
	 */
	public function errorCode() {
		$err = oci_error();
		if ($err)
			return $err['code'];
		return null;
	}

	/**
	 * Возвращает расширенную информацию об последнем коде ошибки
	 * @see PDOStatement::errorInfo
	 */
	public function errorInfo() {
		$err = oci_error();
		if ($err)
			return array (
				$err['code'],
				$err['code'],
				$err['message']
			);
		return null;
	}

	/**
	 * Возвращает следующую строку из результирующего набора
	 * @see PDOStatement::fetch
	 */
	public function fetch($fetch_style = PDO::FETCH_BOTH) {
		switch ($fetch_style) {
			// Здесь нельзя использовать OCI_RETURN_LOBS!
			// На кривой инсталляции Оракла загрузка LOB-ов во время фетча приводит к
			// нехватке ресурсов, варнингам и получению пустых данных
			case PDO::FETCH_BOTH: $fetch_style = OCI_BOTH + OCI_RETURN_NULLS; break;
			case PDO::FETCH_ASSOC: $fetch_style = OCI_ASSOC + OCI_RETURN_NULLS; break;
			case PDO::FETCH_NUM: $fetch_style = OCI_NUM + OCI_RETURN_NULLS; break;
			case PDO::FETCH_BOUND: return oci_fetch($this->oci_parsed_statement);
			case PDO::FETCH_OBJ: return oci_fetch_object($this->oci_parsed_statement);
		}
		 $result = oci_fetch_array($this->oci_parsed_statement, $fetch_style);
       
         return $result;
	}

	private static $lobTypes = array('BLOB','CLOB','NCLOB','BFILE','LONG_RAW');
	/**
	 * Возвращает массив, который содержит весь результирующий набор
	 * @see PDOStatement::fetchAll
	 */
	public function fetchAll($fetch_style = PDO::FETCH_BOTH, $column_index = 0) {
		$rows = array();
		if ($fetch_style != PDO::FETCH_COLUMN) {
			$lobs = NULL;
			$xlobs = array();
			while ($row = $this->fetch($fetch_style)) {
				// ручная обработка LOB-ов
				if ($lobs === NULL)
					foreach ($row as $name => $dummy) {
						if (is_string($name) &&in_array(oci_field_type($this->oci_parsed_statement, $name), self::$lobTypes))
							$lobs[] = $name;
                    }
				if ($lobs)
					foreach ($lobs as $name)
						if (isset($row[$name]))
							$xlobs[] = &$row[$name];//$row[$name] = ($v = $row[$name]) ? new LobLoader($v) : $v;
				$rows[] = $row;
			}
			// загружаем LOB-ы, в случае сбоя переконнект к БД и повтор операции
			foreach ($xlobs as &$cell) {
				if (($cell = @$cell->load()) === false) {
					$e = oci_error($this->oci_parsed_statement);
					throw new DBDebugException($e['message'], $e['sqltext'], -0x7777777);
				}
			}
		}
		else
			oci_fetch_all($this->oci_parsed_statement, $rows);
		return $rows;
	}

	/**
	 * Возвращает одну колонку из следующей строки результирующего набора
	 * @see PDOStatement::fetchColumn
	 */
	public function fetchColumn($column_number = 0) {
		$res = $this->fetch(PDO::FETCH_NUM);
		return $res[$column_number];
	}

	/**
	 * Возвращает кол-во строк, затронутых последним SQL-оператором
	 * @see PDOStatement::rowCount
	 */
	public function rowCount() {
		return oci_num_rows($this->oci_parsed_statement);
	}

	public function statementType() {
		return oci_statement_type($this->oci_parsed_statement);
	}
}
