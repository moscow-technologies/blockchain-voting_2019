<?php


namespace App\Service;

use Illuminate\Contracts\Redis\Connection;

class Cache {

    private static $_redis;

    public static function getAll() {
        $keys = self::_redis()->keys('*');
        return $keys;
    }

    static function exists($key)
    {
        return self::_redis()->exists($key);
    }

    /**
     * @param     $key
     * @param     $value
     * @param int $timeout
     *
     * @return mixed
     */
    static function set($key, $value, $timeout = 3600)
    {
        if (is_array($value)) {
            $value = json_encode($value);
        }
        self::_redis()->set($key, $value, null, $timeout);
    }


    /**
     * @param     $key
     * @param     $value
     * @param int $timeout
     *
     * @return mixed
     */
    static function add($key, $value, $timeout = 3600)
    {
        if (self::exists($key)) {
            return false;
        }
        if (is_array($value)) {
            $value = json_encode($value);
        }
        self::_redis()->set($key, $value, null, $timeout);
    }

    /**
     * @param $key
     *
     * @return bool|mixed|null
     */
    static function get($key)
    {
        $valueFromRedis = self::_redis()->get($key);
        $result = json_decode($valueFromRedis, true);
        return !empty($result) ? $result : $valueFromRedis;
    }

    /**
     * @param $key
     *
     * @return bool
     */
    static function delete($key)
    {
        self::_redis()->del($key);
    }

    private static function _redis(): Connection {
        if (self::$_redis === null) {
            self::$_redis = app()->get('redis.connection');
        }
        return self::$_redis;
    }

}