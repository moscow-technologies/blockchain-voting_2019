<?php


namespace App\Service;

use Illuminate\Contracts\Cache\Repository;

class Cache {

    private static $_redis;

    public static function getAll() {
        $keys = self::_redis()->keys('*');
        return $keys;
    }

    static function exists($key)
    {
        return self::_redis()->has($key);
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
        self::_redis()->set($key, $value, $timeout);
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
        self::_redis()->set($key, $value, $timeout);
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
        self::_redis()->delete($key);
    }

    private static function _redis(): Repository {
        if (self::$_redis === null) {
            self::$_redis = app()->get('cache.store');
        }
        return self::$_redis;
    }

}