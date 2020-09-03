<?php


namespace App\Service;

use Illuminate\Contracts\Cache\Repository;

class Cache {

    /**
     * @param     $key
     * @param     $value
     * @param int $timeout
     *
     * @return mixed
     */
    static function set($key, $value, $timeout = 3600)
    {
        self::_cache()->set($key, $value, $timeout);
    }

    static function setArray($key, array $value, $timeout = 3600)
    {
        self::set($key, json_encode($value), $timeout);
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
        return self::_cache()->add($key, $value, $timeout);
    }

    /**
     * @param $key
     *
     * @return bool|mixed|null
     */
    static function get($key)
    {
        return self::_cache()->get($key);
    }

    static function getArray($key) {
        return json_decode(self::get($key), true);
    }

    /**
     * @param $key
     *
     * @return bool
     */
    static function delete($key)
    {
        self::_cache()->delete($key);
    }

    private static function _cache(): Repository {
        static $cache;
        if ($cache === null) {
            $cache = app()['cache.store'];
        }
        return $cache;
    }

}