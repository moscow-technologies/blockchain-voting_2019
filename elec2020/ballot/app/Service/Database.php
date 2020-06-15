<?php
/**
 * Created by PhpStorm.
 * User: serqol
 * Date: 09.06.20
 * Time: 21:01
 */

namespace App\Service;


use Illuminate;

class Database {

    private const RECONNECTS_LIMIT = 5;

    /** @var Illuminate\Database\Connection */
    private static $_connection;

    /**
     * @param $name
     * @param array $arguments
     * @return mixed
     * @throws \Exception
     *
     * TODO: Add support for execution chains, so that DRY 'insert' is unnecessary
     */
    public static function __callStatic($name, $arguments) {
        static $reconnectsCount = 0;
        try {
            $result = self::_connection()->$name(...$arguments);
            $reconnectsCount = 0;
            return $result;
        } catch (\Exception $e) {
            app()['log']->info('Reconnect required', [
                'type'             => 'reconnect',
                'exception'        => get_class($e),
                'reconnects_count' => $reconnectsCount,
            ]);
            if ($reconnectsCount > self::RECONNECTS_LIMIT) {
                throw $e;
            }
            self::_connection(true);
            $reconnectsCount++;
            return self::__callStatic($name, $arguments);
        }
    }

    public static function insert($tableName, array $params) {
        static $reconnectsCount = 0;
        try {
            $result = self::_connection()->table($tableName)->insert($params);
            $reconnectsCount = 0;
            return $result;
        } catch (\Exception $e) {
            app()['log']->info('Reconnect required', [
                'type'             => 'reconnect',
                'exception'        => get_class($e),
                'reconnects_count' => $reconnectsCount,
            ]);
            if ($reconnectsCount > self::RECONNECTS_LIMIT) {
                throw $e;
            }
            self::_connection(true);
            $reconnectsCount++;
            return self::insert($tableName, $params);
        }
    }

    private static function _connection(bool $isForce = false) {
        if (self::$_connection === null || $isForce) {
            self::$_connection = \DB::connection();
            self::$_connection->statement('set statement_timeout TO 1000;');
        }
        return self::$_connection;
    }
}