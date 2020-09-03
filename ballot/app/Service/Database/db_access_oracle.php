<?php

namespace App\Service\Database;

/**
 * Класс доступа к Oracle
 * В связи с ограничениями библиотеки PDO для Oracle и нестабильным ее состоянием внедрена работа с oci8 на основе
 * аналогичного PDO Statement класса db_oracle_oci_statement_to_pdo
 *
 * @package    RBC_Contents_5_0
 * @subpackage lib
 * @copyright  Copyright (c) 2008 RBC SOFT
 */
require_once(dirname(__FILE__).'/db_oracle_oci_statement_to_pdo.php');

use App\Service\Logging\LoggerPool;
use Illuminate;

class db_access_oracle extends db_access
{
    /**
     * Кэш выборки lob-полей из БД
     * @var array
     * @see db_access_oracle::get_lobs()
     */
    protected $lob_cache;
    protected $connection = array();
    protected $reconnected = false;


    static private $connectFuncs = array(
        Facade::PERSISTENT_CONNECTION => 'oci_pconnect',
        Facade::SESSION_CONNECTION => 'oci_connect',
        Facade::NEW_CONNECTION => 'oci_new_connect'
    );

    /**
     * Конструктор. Осуществляет соединение с БД
     */
    function __construct($db_type, $db_server,$db_port, $db_name, $db_user, $db_password, $connectionMode)
    {
        ini_set('oci8.connection_class', $db_user);
        $this->connection = array(
            'db_type'=>$db_type,
            //'db_server'=>$db_server,
            'db_name'=>$db_name,
           // 'db_port'=>$db_port,
            'db_user'=>$db_user,
            'db_password'=>$db_password,
            'connectionMode'=>$connectionMode
            );
        $func = self::$connectFuncs[$connectionMode];
        $this->dbh = @$func($db_user, $db_password, $db_name, (params::$params['encoding']['value'] == 'utf-8')
                    ? 'UTF8'
                    : 'CL8MSWIN1251');

        if (!$this->dbh) {

            $e = oci_error();
            $exception = new DBDebugException($e['message'], 'Невозможно подключиться к БД');
            LoggerPool::me()->exception($exception, array(
                'db_name' => $db_name,
                'db_password' => $db_password,
                'db_user' => $db_user,
                'db_server' => $db_server,
                'pid' => posix_getpid(),
                'sess-id' => $this->_session->getId()));

            // перенаправление на заглушку "Регламентные работы"
            if (empty($_POST['send-force']) && isset(params::$params['db_failure_page']['value'])) include(params::$params['db_failure_page']['value']);

            throw $exception;
        }
    }

    function __destruct()
    {
        if ($this->dbh) oci_close($this->dbh);
    }
    
    function reconnect()
    {
       $this->__destruct();
       $this->__construct($this->connection['db_type'],$this->connection['db_server'],$this->connection['db_port'],$this->connection['db_name'],$this->connection['db_user'],$this->connection['db_password'],$this->connection['connectionMode']);
       $this->reconnected = true;
    }

    /**
     * Выборка для создания многоуровневого документа из плоской структуры
     * Важный момент - даже если ветке сооответствует одна запись, она все равно будет прицеплена к последнему столбцу в 0 индекс массива.
     * @param string $query SELECT
     * @param array $keys индексированный массив полей, в этом порядке будет создана вложенная структура
     * @return mixed Хеш, сгруппированный по полям { field1_val1 : { field2_val1 : {}...}, }
     */
    public function sql_fetch_by_key($query, $fields = array(), $special = array(), $keys = array())
    {
        $sth = $this->execute_query($query, $fields, $special);
        $result = array();
        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $el = &$result;
            foreach ($keys as $key) {
                $k = $row[$key];
                if (!isset($el[$k])) $el[$k] = array();
                $el = &$el[$k];
                unset($row[$key]);
            }
            $el[] = $row;
        }
        return $result;
    }

    /**
     * Выборка данных из БД
     * Для Оракле добавлена работа с LIMIT
     * @see db_access::sql_select
     */
    public function sql_select($query, $fields = array(), $special = array())
    {
        if (!$this->reconnected) {
            $parsed_query = $this->get_limit_from_query($query);
            // Если LIMIT есть, то модифицируем запрос
            if ($parsed_query['is_limited']) {
                // Если выбираем не с нуля
                if ($parsed_query['offset']) {
                    $query = 'SELECT TABLE_LIMIT.* FROM(
                            SELECT TABLE_LIMIT.*, ROWNUM AS ROWNUM_LIMIT FROM('.$parsed_query['pure_query'].'
                            )TABLE_LIMIT WHERE ROWNUM<=:lim_row_count_plus_offset
                        )TABLE_LIMIT WHERE ROWNUM_LIMIT>:lim_offset';
                    $fields += array(
                        'lim_row_count_plus_offset' => $parsed_query['row_count'] + $parsed_query['offset'],
                        'lim_offset' => $parsed_query['offset']);
                } else {
                    // Если выбираем с нуля (запрос проще, поэтому более производительный)
                    $query = 'SELECT TABLE_LIMIT.*, ROWNUM FROM('.$parsed_query['pure_query'].')TABLE_LIMIT WHERE ROWNUM<=:lim_row_count';
                    $fields += array(
                        'lim_row_count' => $parsed_query['row_count']);
                }
            }
        }
        try {
            return parent::sql_select($query, $fields, $special);
        } catch (DBDebugException $e) {
            if (!$this->reconnected&&($e->getCode() == 56600)) {
                // ORA-56600: DRCP: Illegal call [First call inconsistency]
                //попытаемся обновить соединение и попробовать еще раз
                 LoggerPool::me()->debug('Обновление подключения', array(
                    'sqlQuery' => $query,
                    'action' => 'reconnect',
                    'errorCode' => $e->getCode(),
                    'errorMessage' => $e->getMessage(),
                    'type' => 'BD',
                    'sqlParams' => json_encode($fields, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                    'pid' => posix_getpid(),
                    'sess-id' => $this->_session->getId()));
                $this->reconnect();

                return $this->sql_select($query, $fields, $special);
            }

            LoggerPool::me()->exception($e, array(
                'sqlQuery' => $query,
                'action' => 'sql_select',
                'errorCode' => $e->getCode(),
                'errorMessage' => $e->getMessage(),
                'type' => 'BD',
                'sqlParams' => json_encode($fields, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                'pid' => posix_getpid(),
                'sess-id' => $this->_session->getId()));
            // в случае, если чтение лобов не удалось, то переподключаемся к БД в режиме
            // нового соединения и повторяем запрос
            if ($e->getCode() == -0x7777777) { // см. db_oracle_oci_statement_to_pdo::fetchAll
                oci_close($this->dbh);
                $this->dbh = NULL;
                Facade::disconnect();
                Facade::setConnectionMode(Facade::NEW_CONNECTION);
                return Facade::sql_select($query, $fields, $special);
            } else throw $e;
        }
    }

    /**
     * Подготовка запроса, возвращает объект класса db_oracle_oci_statement_to_pdo, аналога PDO Statement, работающего с библиотекой oci
     * @see db_access::prepare_query
     */
    protected function prepare_query($query)
    {
        $sth = oci_parse($this->dbh, $query);
        if (!$sth) {
            $e = oci_error($this->dbh);
            $pos = mb_strpos($query,'""');


            $exception = new DBDebugException($e['message'], $e['sqltext'], $e['code']);
            LoggerPool::me()->exception($exception, array(
                'errorCode' => $e->getCode(),
                'errorMessage' => $e->getMessage(),
                'sqlQuery' => $query,
                'action' => 'prepare_query',
                'type' => 'BD',
                'pid' => posix_getpid(),
                'sess-id' => $this->_session->getId()));
            throw $exception;
        }
        return new db_oracle_oci_statement_to_pdo($this->dbh, $sth);
    }

    /**
     * Экранирование данных против SQL-инъекций
     * В связи с тем, что класс не использует PDO, приходится делать вручную
     * @see db_access::db_quote
     */
    public function db_quote($content)
    {
        return '\''.preg_replace('/\'/', '\'\'', $content).'\'';
    }

    /**
     * Базонезависимая конкатенация произвольного количества полей для Oracle
     *
     * @see db_access::concat_clause()
     */
    public function concat_clause($fields, $delimiter)
    {
        if (count($fields) > 1) {
            foreach ($fields as $key => $field) {
                if ($key == 0) $full_fields[] = 'NVL('.$field.', \'\')';
                else $full_fields[] = "NVL2({$field}, '{$delimiter}' || {$field}, '')";
            }
            return implode(' || ', $full_fields);
        } else return $fields[0];
    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Выборка информации о наличии lob-полей в таблице для использования в insert_record(), update_record()
     *
     * Работает как для таблиц из собственной схемы, так и для таблиц из других схем, для которых есть синонимы в текущей схеме.
     * Формат: array("BODY"=>"BLOB", "ANOTHER_BODY"=>"CLOB"). Если lob-полей нет, то вернет false
     *
     * @param string $table		название таблицы, для которой собирается информация
     * @return mixed
     */
    protected function get_lobs($table)
    {
        // Используется кэширование, чтобы не тормозить серии инсертов или апдейтов
        if (!isset($this->lob_cache[$table])) {
            // Первая половина запроса для таблиц из собственной схемы, вторая - для синонимов из других схем
            $lobs = parent::sql_select(
                    'SELECT USER_TAB_COLUMNS.COLUMN_NAME, USER_TAB_COLUMNS.DATA_TYPE FROM USER_TAB_COLUMNS
				WHERE USER_TAB_COLUMNS.TABLE_NAME=:table1
					AND (USER_TAB_COLUMNS.DATA_TYPE IN (\'BLOB\',\'CLOB\',\'NCLOB\',\'BFILE\',\'LONG_RAW\'))
			UNION
			SELECT ALL_TAB_COLUMNS.COLUMN_NAME, ALL_TAB_COLUMNS.DATA_TYPE FROM
				USER_SYNONYMS
					INNER JOIN ALL_TAB_COLUMNS ON (USER_SYNONYMS.SYNONYM_NAME = ALL_TAB_COLUMNS.TABLE_NAME AND USER_SYNONYMS.TABLE_OWNER = ALL_TAB_COLUMNS.OWNER)
						WHERE ALL_TAB_COLUMNS.TABLE_NAME=:table1
							AND (ALL_TAB_COLUMNS.DATA_TYPE IN (\'BLOB\',\'CLOB\',\'NCLOB\',\'BFILE\',\'LONG_RAW\'))', array(
                    'table1' => $table)
            );
            // Формируем запись для кэша
            $done_lobs = array();
            foreach ($lobs as $lob) $done_lobs[$lob['COLUMN_NAME']] = $lob['DATA_TYPE'];
            $this->lob_cache[$table] = $done_lobs;
        }
        return $this->lob_cache[$table];
    }

    /**
     * Помещение записи в таблицу
     *
     * Добавлена работа с LOB-полями. Функция переписана, не вызывает родительский метод
     * @see  db_access::insert_record
     */
    public function insert_record($table, $fields = array(), $special = array())
    {
        if (!is_array($special)) $special = array();
        // получаем blob-поля
        $lob_fields = $this->get_lobs($table);

        $columns = array();
        $values = array();
        $lobs = array();

        foreach ($fields as $key => $value) {
            $columns[] = $key;

            // если значение не передано и нельзя вставлять null-ы в поле, то вставляем default-значение
            if (!$value && class_exists('metadata') && !@metadata::$objects[$table]['fields'][$key]['is_null']) {
                $values[] = 'DEFAULT';
                unset($fields[$key]);
                continue;
            }

            if (array_key_exists($key, $lob_fields)) {
                if ($lob_fields[$key] == 'BLOB') {
                    // если поле является блобом, то вставляем вместо значения-параметра ф-ию EMPTY_BLOB, а затем внедряем данные через RETURNING INTO
                    $lobs[] = $key;
                    $values[] = 'EMPTY_BLOB()';
                    $special[$key] = OCI_B_BLOB;
                } elseif ($lob_fields[$key] == 'CLOB') {
                    // то же самое для CLOB
                    $lobs[] = $key;
                    $values[] = 'EMPTY_CLOB()';
                    $special[$key] = OCI_B_CLOB;
                }
            } else $values[] = $this->set_parameter_colon($key);
        }
        // добавляем вставку лобов
        $query = $this->set_lobs('INSERT INTO '.$table.'('.implode(',', $columns).
            ')VALUES('.implode(',', $values).')', $lobs);

        try {
            $sth = $this->execute_query($query, $fields, $special);
            return $sth->rowCount();
        } catch (DBDebugException $e) {
            LoggerPool::me()->exception($e, array(
                'sqlQuery' => $query,
                'errorCode' => $e->getCode(),
                'errorMessage' => $e->getMessage(),
                'action' => 'insert_record',
                'type' => 'BD',
                'sqlParams' => json_encode($fields, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                'pid' => posix_getpid(),
                'sess-id' => $this->_session->getId()));
            // в случае, если запись лобов не удалась, то переподключаемся к БД в режиме
            // нового соединения и повторяем запрос
            if ($e->getCode() == -0x7777777) { // см. db_oracle_oci_statement_to_pdo::save_lobs
                oci_close($this->dbh);
                $this->dbh = NULL;
                Facade::disconnect();
                Facade::setConnectionMode(Facade::NEW_CONNECTION);
                return Facade::insert_record($table, $fields, $special);
            } else throw $e;
        }
    }

    /**
     * Изменение записи или записей в таблице с ограничением по значениям некоторых полей
     * Добавлена работа с LOB-полями. Функция переписана, не вызывает родительский метод
     * @see db_access::update_record
     */
    public function update_record($table, $fields = array(), $special = array(), $where = array())
    {
        if (!$fields || !$where) return;
        $_special = $special;
        if (!is_array($special)) $special = array();
        $lob_fields = $this->get_lobs($table);
        $lobs = array();
        foreach ($fields as $key => $value) {
            // если значение не передано и нельзя вставлять null-ы в поле, то вставляем default-значение
            if ($value == '' && class_exists('metadata') && !metadata::$objects[$table]['fields'][$key]['is_null']) {
                $pairs[] = $key.'=DEFAULT';
                unset($fields[$key]);
                continue;
            }
            if (array_key_exists($key, $lob_fields)) {
                switch ($lob_fields[$key]) {
                    case 'BLOB':
                        // если поле является блобом, то вставляем вместо значения-параметра ф-ию EMPTY_BLOB, а затем внедряем данные через RETURNING INTO
                        $pairs[] = $key.'=EMPTY_BLOB()';
                        $special[$key] = OCI_B_BLOB;
                        $lobs[] = $key;
                        break;
                    case 'CLOB':
                        // то же самое для CLOB
                        $pairs[] = $key.'=EMPTY_CLOB()';
                        $special[$key] = OCI_B_CLOB;
                        $lobs[] = $key;
                }
            } else $pairs[] = $key.'='.$this->set_parameter_colon($key);
        }
        $add_fields = array();
        $pairs = implode(',', $pairs);
        foreach ($where as $key => $value) {
            $ands[] = $key.'=:ands_'.$key;
            $add_fields['ands_'.$key] = $value;
        }
        $ands = implode(' AND ', $ands);

        $query = $this->set_lobs('UPDATE '.$table.' SET '.$pairs.' WHERE '.$ands, $lobs);

        try {
            $sth = $this->execute_query($query, array_merge($fields, $add_fields), $special);
            return $sth->rowCount();
        } catch (DBDebugException $e) {
            LoggerPool::me()->exception($e, array(
                'sqlQuery' => $query,
                'action' => 'update_record',
                'errorCode' => $e->getCode(),
                'errorMessage' => $e->getMessage(),
                'type' => 'BD',
                'sqlParams' => json_encode($fields, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                'pid' => posix_getpid(),
                'sess-id' => $this->_session->getId()));
            // в случае, если запись лобов не удалась, то переподключаемся к БД в режиме
            // нового соединения и повторяем запрос
            if ($e->getCode() == -0x7777777) { // см. db_oracle_oci_statement_to_pdo::save_lobs
                oci_close($this->dbh);
                $this->dbh = NULL;
                Facade::disconnect();
                Facade::setConnectionMode(Facade::NEW_CONNECTION);
                return Facade::update_record($table, $fields, $_special, $where);
            } else throw $e;
        }
    }

    /**
     * Функция модифицирует запросы INSERT и UPDATE для работы с блобами
     * @param string $query Запрос
     * @param array $blobs массив названий полей с блобами
     *
     * @return string Оператор
     */
    private function set_lobs($query, $lobs)
    {
        if (sizeof($lobs)) $query .= ' RETURNING '.implode(',', $lobs).' INTO '.
                implode(',', array_map(array(
                    $this,
                    'set_parameter_colon'), $lobs));
        return $query;
    }

    /**
     * Получение последнего автоинкрементного идентификатора
     *
     * @param string $sequence_name		название сиквенса (учитывается только теми СУБД, где есть сиквенсы)
     * @return int
     */
    public function last_insert_id($sequence_name)
    {
        $res = parent::sql_select('SELECT '.$sequence_name.'.CURRVAL AS CURRVAL FROM DUAL');
        return !empty($res[0]['CURRVAL'])?$res[0]['CURRVAL']:null;
    }

    /**
     * Возвращает поля, входящие в первичный ключ таблицы
     * @param string $obj	название таблицы
     * @return array
     */
    public function get_primary_key_fields($obj)
    {
        return lib::array_reindex($this->sql_select(
                    'SELECT
				UCC.COLUMN_NAME
			FROM
				USER_CONSTRAINTS UC
					INNER JOIN
						USER_CONS_COLUMNS UCC
			USING (CONSTRAINT_NAME)
				WHERE
					UC.CONSTRAINT_TYPE=\'P\'
				AND
					UC.TABLE_NAME=:obj', array(
                    'obj' => $obj)), 'COLUMN_NAME'
        );
    }

    /**
     * Возвращает поля, входящие в автоинкремент
     * @note	Без COLUMN_USAGE LIKE 'NEW IN OUT%' возвращает вообще все поля.
     * 			Но в любом случае это ненадежный способ. К примеру, появится триггер MYTABLE_BI, который никак не связан с автоинкрементами.
     * 			Лучше было бы избавиться от необходимости использования этой функции.
     * @param string $obj	название таблицы
     * @return array
     */
    public function get_autoincrement_fields($obj)
    {
        return lib::array_reindex($this->sql_select(
                    "SELECT
				COLUMN_NAME
			FROM
				USER_TRIGGER_COLS
			WHERE
				TRIGGER_NAME = :trigger_name
			AND
				TABLE_NAME = :obj
			AND
				COLUMN_USAGE LIKE 'NEW IN OUT%'", array(
                    'trigger_name' => $obj.'_BI',
                    'obj' => $obj)), 'COLUMN_NAME');
    }

    public function procedure($query, $vars_in, $cursor, $var_out)
    {
        return new procedure($this->dbh, $query, $vars_in, $cursor, $var_out);
    }

    public  function get_insert_id($table, $fieldId)
    {
        $id = $this->last_insert_id($table.'_SEQ');
        return $id;

    }

        //добавил транзации
    public function beginTransaction()
    {
        $this->autoCommit = false;
    }

    public function commit()
    {
        $this->autoCommit = true;
        return oci_commit($this->dbh);

    }

    public function rollBack()
    {
        $this->autoCommit = true;
        return oci_rollback($this->dbh);
    }

}

class procedure
{

    function __construct($link, $query, $vars_in, $cursor, $vars_out)
    {
        $this->link = $link;
        $this->query = $query;
        $this->vars_in = $vars_in;
        $this->vars_out = $vars_out;
        $this->cursor = $cursor;
        $this->out = array();
        $this->result = array();
        $this->Prepare();
    }

    function getOut()
    {
        return $this->out;
    }

    function getCursor($is_lobs = 'false')
    {
        $res_set = array();
        foreach ($this->cursor as $c_name => $c_value) {
            while ($row = $this->FetchArrayByName($c_name, $is_lobs)) {
                $res_set[$c_name][] = $row;
            }
        }

        return $res_set;
    }

    function Prepare()
    {
        if ($this->link) {
            $stid = OCIParse($this->link, $this->query);
            if (is_array($this->vars_in)) {
                foreach ($this->vars_in as $k => $v) {
                    if (!OCIBindByName($stid, $k, $v, 65536)) sql_error("Procedure: OCIBindByName failed param name=".$k."<br>SQL=".$this->query, OCIError($stid));

                    unset($v);
                }
            }

            if (is_array($this->cursor)) {
                foreach ($this->cursor as $cname => $cval) {
                    $refcur[$cname] = OCINewCursor($this->link);
//                echo $cval.' - '. $cname.' - '.$this->query;exit;
                    if (!OCIBindByName($stid, $cval, $refcur[$cname], -1, OCI_B_CURSOR)) {
                        sql_error("Procedure: OCIBindByName failed cursor name=".$cname."<br>SQL=".$this->query, OCIError($stid));
                    }
                }
            }

            if (is_array($this->vars_out)) foreach ($this->vars_out as $k => $vo) {
                    //$clob=OCINewDescriptor($this->link, OCI_D_LOB);
                    if (!OCIBindByName($stid, $vo, $this->out[$k], 65000)) sql_error("Procedure: OCIBindByName failed param name=".$vo."<br>SQL=".$this->query, OCIError($stid));
                    //else {
                    //$this->out[$k]=$clob->load();
                    //$clob->free();
                    //}
                }

            if (!OCIExecute($stid)) sql_error("Procedure: OCIExecute failed, SQL=".$this->query, OCIError($stid));

            if (is_array($this->cursor)) {
                foreach ($this->cursor as $cname => $cval) {
                    $this->result[$cname] = OCIExecute($refcur[$cname], OCI_DEFAULT);
                    if (!$this->result) sql_error("Procedure: OCIExecute failed, SQL=".$this->query, OCIError($refcur));
                }
            }

            $this->statement = $refcur;
            oci_free_statement($stid);
        };
    }

    private function FetchArrayByName($cname, $fetch_lobs = 0)
    {
        if ($this->result[$cname]) $data = oci_fetch_array($this->statement[$cname], OCI_ASSOC +
                OCI_RETURN_NULLS +
                ($fetch_lobs
                    ? OCI_RETURN_LOBS
                    : 0));
        /* не работает в php 5.3
          OCIFetchInto($this -> statement[$cname], &$data,
          OCI_ASSOC+
          OCI_RETURN_NULLS+
          ($fetch_lobs?OCI_RETURN_LOBS:0) );
         */
        else sql_error("FetchArray: Unknown SQL result<br>SQL=$this->query", OCIError($this->link));
        $tmp_data = $data;
        $idx = 0;
        if (is_array($data)) while (list($k, $v) = each($tmp_data)) {
                $data[$idx++] = $v;
            }
        $this->ResultArray = $data;

        return $data;
    }
    


}