<?php

namespace App\Service\Database;

use App\Service\Config\PoolConfig;

/**
 * Класс синглтон-обертка над {@link object db_access db_access}
 *
 * Для обычной работы с БД должен использоваться этот класс.<br>
 * Дублирует публичные методы {@link object db_access db_access}. Объект {@link object db_access db_access} не нужно специально инстанцировать -
 * инстанцирование происходит автоматечески при первом вызове любого из методов db на базе настроек из
 * {@link params}. У программиста остается возможность самостоятельного инстанцирования {@link object db_access db_access}, если, например,
 * нужно присоединиться к БД, не описанной в {@link params}.
 *
 * @package    PPR_Contents
 * @subpackage lib
 * @copyright  Copyright (c) 2019 PPR ITB
 */
class Facade
{
    private const MAX_RECONNECT_COUNT = 5;

    /**
     * Объект доступа к БД
     * @var object db_access
     */
    private static $db_access;

    /**
     * Режим подключения соединений с БД и константы определения режимов
     * @var int $connectionMode
     */
    private static $connectionMode = self::PERSISTENT_CONNECTION;

    const PERSISTENT_CONNECTION = 0;
    const SESSION_CONNECTION = 1;
    const NEW_CONNECTION = 2;

    /**
     * Устанавливает режим подключения соединений с БД
     * @param int $connectionMode
     */
    public static function setConnectionMode($connectionMode)
    {
        self::$connectionMode = $connectionMode;
    }

    public static function initSingleton(): void {
        self::singleton();
    }

    /**
     * Создает объект $db_access, если он еще не существует, затем его возвращает
     *
     * @param bool $isForce
     * @return object db_access
     */
    private static function singleton(bool $isForce = false)
    {
        if (!is_object(self::$db_access) || $isForce) {

            $config = PoolConfig::me()->get('Db');
            self::$db_access = db_access::factory(
                    $config->get('db_type'), $config->get('db_server'), $config->get('db_port', 0), $config->get('db_name'), $config->get('db_user'), $config->get('db_password'), self::$connectionMode
            );
        }
        return self::$db_access;
    }

    /**
     * Отключает объект БД
     */
    public static function disconnect()
    {
        self::$db_access = NULL;
    }

    /**
     * Выборка данных из БД, либо исполнение любого произвольного запроса
     *
     * @see db_access::sql_select()
     */
    public static function sql_select($query, $fields = array(), $special = array())
    {
        return self::_executeMethodWithReconnectOnFailure('sql_select', $query, $fields, $special);
    }

    /**
     * Помещение записи в таблицу
     *
     * @see db_access::insert_record()
     */
    public static function insert_record($table, $fields = array(), $special = array())
    {
        return self::_executeMethodWithReconnectOnFailure('insert_record', $table, $fields, $special);
    }

    /**
     * Получение последнего автоинкрементного идентификатора
     *
     * @see db_access::last_insert_id()
     */
    public static function last_insert_id($sequence_name)
    {
        return self::_executeMethodWithReconnectOnFailure('last_insert_id', $sequence_name);
    }

    /**
     * Изменение записи или записей в таблице с ограничением по значениям некоторых полей
     *
     * @see db_access::update_record()
     */
    public static function update_record($table, $fields = array(), $special = array(), $where = array())
    {
        return self::_executeMethodWithReconnectOnFailure('update_record', $table, $fields, $special, $where);
    }

    /**
     * Удаление записи или записей из таблицы с ограничением по значениям некоторых полей
     *
     * @see db_access::delete_record()
     */
    public static function delete_record($table, $where = array())
    {
        return self::_executeMethodWithReconnectOnFailure('delete_record', $table, $where);
    }

    private static function _executeMethodWithReconnectOnFailure(string $method, ...$params) {
        static $reconnectCounter = 0;
        while (true) {
            try {
                $result = self::singleton()->$method(...$params);
                $reconnectCounter = 0;
                return $result;
            } catch (\Exception $e) {
                if (++$reconnectCounter > self::MAX_RECONNECT_COUNT) {
                    throw $e;
                }
                $exceptionClass = get_class($e);
                app()['log']->error(
                    "Got {$exceptionClass} exception, reconnecting...",
                    [
                        'trace'   => $e->getTraceAsString(),
                        'message' => $e->getMessage(),
                    ]
                );
                usleep(300000);
                self::singleton(true);
                return self::_executeMethodWithReconnectOnFailure($method, ...$params);
            }
        }
    }
}