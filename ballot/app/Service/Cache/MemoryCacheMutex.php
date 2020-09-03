<?php

namespace App\Service\Cache;

use App\Service\Cache as MemoryCache;

/**
 * Memory Cache Service
 *
 * This core module supports memory caching via Memcache.
 */

/**
 * Мьютекс на мемкеше
 */
class MemoryCacheMutex
{
    protected $key;
    protected $lockTriesInterval;
    protected $keyLifetime;

    public function __construct($settings)
    {
        if (!is_array($settings)) $settings = array(
                'key' => $settings);
        $this->key = 'Mutex|'.$settings['key'];
        $this->lockTriesInterval = isset($settings['lockTriesInterval']) ? $settings['lockTriesInterval'] : 1;
        $this->timeToWait = isset($settings['timeToWait']) ? $settings['timeToWait'] : 30;
        $this->keyLifetime = isset($settings['keyLifetime']) ? $settings['keyLifetime'] : 60;
    }

    public function refreshKey($keyLifetime = false)
    {
        $keyLifetime = $keyLifetime ? $keyLifetime : $this->keyLifetime;
        MemoryCache::set($this->key, 1, $keyLifetime);
    }

    public function lock($timeToWait = NULL)
    {
        if (is_null($timeToWait)) $timeToWait = $this->timeToWait;

        $added = MemoryCache::add($this->key, 1, $this->keyLifetime);
        if ($added === false) { //Уже есть блокировка идем в очередь
            // ждем пока блокировка будет доступна
            $t = time();
            do {
                usleep($this->lockTriesInterval * 1000000);
                // если блокировку отпустили, то получим тут 1 и выйдем,
                // иначе продолжаем ждать
                $lock = MemoryCache::add($this->key, 1, $this->keyLifetime);
            } while (!$lock && ((time() - $t) < $timeToWait));

            //блокировка получена или наступил таймаут
            if ($lock === true) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    }

    public function release()
    {
        MemoryCache::delete($this->key);
    }
}