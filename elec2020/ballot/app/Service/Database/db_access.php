<?php

namespace App\Service\Database;

use PDO;
use PDOException;
use Illuminate;

/**
 * Класс доступа к БД
 *
 * При обычной работе не должен использоваться напрямую - для этого есть набор статических методов в классе {@link db}.
 * Если же вдруг понадобится присоединиться к нескольким базам одновременно, тогда можно инстанцировать db_access
 * напрямую, чтобы организовать соединения к второстепенным базам.
 *
 * @package    PPR_Contents
 * @subpackage lib
 * @copyright  Copyright (c) 2019 PPR ITB
 * @todo Специальная обработка требуется для полей (или параметров привязки), указываемых в параметрах методов $special
 */
abstract class db_access
{
    /**
     * PDO объект для доступа к базе
     * @var object PDO
     */
    protected $dbh;

    /** @var Illuminate\Session\Store */
    protected $_session;

    /**
     * Название драйвера PDO. Если не указано, то считается таким же, как $db_type RBC Contents. Заполнять должен конструктор наследника
     * @var string
     */
    protected $driver_name;
    protected $autoCommit = true;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Конструктор. Осуществляет соединение с БД
     *
     * @param string $db_type		тип СУБД - "mysql", "oracle", "mssql"
     * @param string $db_server		адрес сервера
     * @param string $db_name		название базы
     * @param string $db_user		имя пользователя
     * @param string $db_password	пароль
     */
    public function __construct($db_type, $db_server, $db_port, $db_name, $db_user, $db_password,$connectionMode)
    {
        $this->_session = app()['session.store'];
        if (!$this->driver_name) {
            $this->driver_name = $db_type;
        }

        try {
            $this->dbh = new PDO(
                "{$this->driver_name}:host={$db_server};port={$db_port};dbname={$db_name};",
                $db_user,
                $db_password,
                [PDO::ATTR_PERSISTENT => true, PDO::ATTR_EMULATE_PREPARES => true,  PDO::ATTR_TIMEOUT => 1, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Connection failed: ".$e->getMessage();
            exit();
        }
    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Фабрика создания объекта доступа к БД
     *
     * Параметры такие же как у {@link db_access::__construct()}
     * @return object db_access
     */
    static public function factory($db_type, $db_server, $db_port, $db_name, $db_user, $db_password, $connectionMode)
    {
        // Dynamic class instancing does not work with our naming conventions, TODO: fix
        return new db_access_pgsql($db_type, $db_server, $db_port, $db_name, $db_user, $db_password, $connectionMode);
    }

    //добавил транзации
    public function beginTransaction()
    {
        return $this->dbh->beginTransaction();
    }

    public function commit()
    {
        return $this->dbh->commit();
    }

    public function rollBack()
    {
        return $this->dbh->rollBack();
    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Выборка данных из БД, либо исполнение любого произвольного запроса
     *
     * $fields, $special такие же как у {@link db_access::insert_record()}
     *
     * @param string $query		запрос
     * @return array
     * @todo сделать $special
     */
    public function sql_select($query, $fields = array(), $special = array())
    {
        $sth = $this->execute_query($query, $fields, $special);
        return $sth->fetchAll(PDO::FETCH_ASSOC);
    }

    public function sql_query($query, $fields = array(), $special = array())
    {
        $sth = $this->execute_query($query, $fields, $special);
        return $sth->rowCount();
    }

    public function sql_select_for_fetch($query, $fields = array(), $special = array())
    {
        return $this->execute_query($query, $fields, $special);
    }

    public function sql_fetch($handle)
    {
        return $handle->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Исполнение любого произвольного запроса
     *
     * Параметры такие же как у {@link db_access::sql_select()}.
     * И работает так же как {@link db_access::sql_select()}, только не возвращает выборку данных даже если она есть
     */
    public function sql_count($query, $fields = array(), $special = array())
    {
        $sth = $this->execute_query($query, $fields, $special);
        return $sth->rowCount();
    }

    /**
     * Помещение записи в таблицу
     *
     * @param string $table		название таблицы в БД
     * @param array $fields		перечень полей (в общем случае параметров привязки) БЕЗ двоеточия: array("bind1"=>"value1","bind2"=>"value2")
     * @param array $special	перечень полей, требующих специальной обработки: array("bind1"=>"type_of_special")
     * @todo есть забавная трабла - если поле not null, то при попытке вставить запись со значением такого поля пустая строка, запись молча не добавляется
     */
    public function insert_record($table, $fields = array(), $special = array())
    {
        $columns = array();
        $values = array();
        foreach ($fields as $key => $value) {
            $columns[] = $key;
            if ($special[$key] == 'pure') $values[] = $value;
            else $values[] = $this->set_parameter_colon($key);
        }
        $sth = $this->execute_query('INSERT INTO '.$table.' ('.implode(',', $columns).
            ') VALUES ('.implode(',', $values).')', $fields, $special);
        return;
    }

    /**
     * Получение последнего автоинкрементного идентификатора
     *
     * @param string $sequence_name		название сиквенса (учитывается только теми СУБД, где есть сиквенсы)
     * @return int
     */
    public function last_insert_id($sequence_name)
    {
        return $this->dbh->lastInsertId($sequence_name);
    }

    public function get_insert_id($table, $fieldId)
    {
        return $this->dbh->get_insert_id($table, $fieldId);
    }

    /**
     * Изменение записи или записей в таблице с ограничением по значениям некоторых полей
     *
     * $table, $fields, $special такие же как у {@link db_access::insert_record()}
     *
     * @param array $where		перечень полей для кляузы WHERE БЕЗ двоеточия: array("TABLE_ID"=>"value1","LANG_ID"=>"value2")
     */
    public function update_record($table, $fields = array(), $special = array(), $where = array())
    {
        if (!$fields || !$where) return;

        foreach ($fields as $key => $value) {
            if ($special[$key] == 'pure') $pairs[] = $key.'='.$value;
            else $pairs[] = $key.'='.$this->set_parameter_colon($key);
        }
        $pairs = implode(',', $pairs);

        foreach ($where as $key => $value) {
            $ands[] = $key.'=:ands_'.$key;
            $fields['ands_'.$key] = $value;
        }
        $ands = implode(' AND ', $ands);

        $sth = $this->execute_query('UPDATE '.$table.' SET '.$pairs.' WHERE '.$ands, $fields, $special);
        return $sth->rowCount();
    }

    /**
     * Удаление записи или записей из таблицы с ограничением по значениям некоторых полей
     *
     * $table, $where такие же как у {@link db_access::update_record()}
     */
    public function delete_record($table, $where = array())
    {
        if (!is_array($where) || !count($where)) return 0;

        foreach ($where as $key => $value) {
            $ands[] = "{$key}=:ands_{$key}";
            $fields["ands_".$key] = $value;
        }
        $ands = implode(' AND ', $ands);

        $query = "DELETE FROM {$table} WHERE {$ands}";
        $sth = $this->execute_query($query, $fields, array());
        return $sth->rowCount();
    }

    /**
     * Экранирование данных против SQL-инъекций
     *
     * При использовании переменных привязки использовать экранирование не нужно, так как оно выполняется
     * автоматически силами PDO, так что этот метод нужен для тех случаев, когда нужно собрать совсем
     * кастомный запрос без использования переменных привязки.
     *
     * @param string $content	данные, которые нужно экранировать
     * @return string
     */
    public function db_quote($content)
    {
        return $this->dbh->quote($content);
    }

    /**
     * Базонезависимая конкатенация произвольного количества полей
     *
     * Позволяет выбирать несколько полей, как одно поле на любых СУБД, то есть использование кляузы, полученной из вызова
     * concat_clause(array("LANG.NAME", "LANG.ROOT_DIR), ", "), вернет в резалт сете поле с примерно таким значением: "Русский, ru"
     *
     * Первое поле считается приоритетным, если его не будет в выборке, то спереди будет разделитель болтаться.
     * Если поле одно, то функция конкатенация не накладывается, так как нет смысла лишнюю нагрузку на БД делать.
     *
     * @param array $fields			список конкатенируемых полей
     * @param string $delimiter		разделитель полей
     * @return string
     */
    abstract public function concat_clause($fields, $delimiter);

///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Исполняет запрос, возвращает объект статемент, из которого можно, например, получить строки
     *
     * Параметры такие же как у {@link db_access::sql_select()}
     *
     * @todo Организовать правильное отображение ошибок на клиентской части
     *
     * @return object PDOStatement
     */
    protected function execute_query($query, $fields, $special)
    {
        $sth = $this->prepare_query($query);
        foreach ($fields as $key => $value) {
            if (is_array($special) && array_key_exists($key, $special) && isset($special[$key]) & is_int($special[$key])) $sth->bindValue($this->set_parameter_colon($key), $value, $special[$key]);
            else {
                $sth->bindValue($this->set_parameter_colon($key), $value);
            }
        }
        try {

            $sth->execute();
        } catch (DBDebugException $e) {

            throw $e;
        } catch (\Exception $e) {

            $params = array();
            $enc = \params::$params['encoding']['value'];
            foreach ($fields as $key => $value) {
                $params[$key] = htmlspecialchars(mb_substr($value, 0, 10, $enc));
                if (mb_strlen($value, $enc) > 10) $params[$key] .= '...';
            }
            throw new DBDebugException($e->getMessage(), $query.preg_replace('/Array\s*\((.*)\)/s', '\1', print_r($params, 1)));
        }
        return $sth;
    }


    /**
     * Подготовка запроса
     * @param string $query SQL-оператор
     * @return object PDOStatement
     */
    protected function prepare_query($query)
    {
        return $this->dbh->prepare($query);
    }

    /**
     * Метод для спецобработки некоторых типов полей. В общем случае ничего не делает
     *
     * Не сделан
     *
     * @param mixed $value
     * @param string $value
     * @return mixed
     * @todo Метод не сделан. Сделать
     */
    protected function special_value($value, $type)
    {
        return $value;
    }

    /**
     * Формирует параметр для sql-запроса
     * @param string $param название параметра
     *
     * @return string
     */
    public function set_parameter_colon($param)
    {
        return ':'.$param;
    }

    /**
     * Извлечение параметров кляузы LIMIT из запроса и возвращение очищенного запроса и отдельно параметров LIMIT
     *
     * Допускаются форматы "LIMIT offset, row_count" и "LIMIT row_count" с наличием или отсутствием пробельных символом между всеми компонентами.
     * Применяется в наследниках класса для тех СУБД, что не поддерживают LIMIT сам по себе (только через спецэмуляцию).
     * Формат возвращаемого значения: array("pure_query"=>"SELECT * FROM TABLE", "is_limited"=>true, "offset"=>0, "row_count"=>20)
     *
     * @param string $query		запрос, из которого требуется извлечь LIMIT
     * @return array
     */
    protected function get_limit_from_query($query)
    {
        // Дефолтные значения
        $offset = 0;
        $row_count = 0;
        $pure_query = $query;
        // Есть ли LIMIT?
        if (preg_match('/LIMIT\s*(\d+)(?:\s*,\s*(\d+))?/i', $query, $matches, PREG_OFFSET_CAPTURE)) {
            $is_limited = true;
            $pure_query = substr($query, 0, $matches[0][1]);
            // LIMIT с оффсетом
            if (isset($matches[2])) {
                $offset = $matches[1][0];
                $row_count = $matches[2][0];
            } else // LIMIT без оффсета
                $row_count = $matches[1][0];
        } else $is_limited = false;
        return array(
            'pure_query' => $pure_query,
            'is_limited' => $is_limited,
            'offset' => $offset,
            'row_count' => $row_count);
    }



    public function get_columns($tableName)
    {
        return array();
    }
}