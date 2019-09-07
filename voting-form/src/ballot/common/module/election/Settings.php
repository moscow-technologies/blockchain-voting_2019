<?php

namespace Mgd\Module\election;

use db;
use Mgd\Lib\Cache\Cache;
use Mgd\Lib\Cache\MemoryCache;

class Settings
{
    const CACHE_KEY = 'mgd|settings';

    protected $settings = [];

    /**
     * @param string $name
     * @return string
     * @throws \Exception
     */
    public function get(string $name)
    {
        $this->init();

        return $this->settings[$name] ?? '';
    }

    /**
     * @return array
     * @throws \Exception
     */
    public function getAll()
    {
        $this->init();

        return $this->settings;
    }

    /**
     * @return bool
     * @throws \Exception
     */
    public function init()
    {
        if ($this->settings) {
            return true;
        }

        $this->settings = MemoryCache::get(static::CACHE_KEY);

        if (! $this->settings) {
            $this->load();
        }

        return (bool) $this->settings;
    }

    /**
     * @return array
     * @throws \Exception
     */
    public function load()
    {
        $this->settings = [];
        $this->setCache();

        $result = db::sql_select("SELECT * FROM p_settings");

        if (! $result) {
            return $this->settings;
        }

        foreach ($result as $row) {
            $this->settings[$row['name']] = $row['value'];
        }

        $this->setCache();

        return $this->settings;
    }

    /**
     * @return mixed
     */
    public function setCache()
    {
        return MemoryCache::set(static::CACHE_KEY, $this->settings, Cache::EXPIRES_MAXIMUM);
    }

    /**
     * @return void
     * @throws \Exception
     */
    public function resetCache()
    {
        $this->load();
    }

    /**
     * @param string $name
     * @param string $value
     * @return mixed
     * @throws \Exception
     */
    public function set(string $name, string $value)
    {
        $data = [
            'name' => $name,
            'value' => $value,
        ];

        $result = db::update_record('p_settings', $data, [], ['name' => $name]);

        if (! $result) {
            $result = db::insert_record('p_settings', $data);
        }

        if (! $result) {
            throw new \Exception('Не удалось сохранить значение а базу данных');
        }

        $this->settings[$name] = $value;

        return $this->setCache();
    }

    /**
     * @param array $settings
     * @throws \Exception
     */
    public function setArray(array $settings)
    {
        try {
            db::beginTransaction();
            foreach ($settings as $name => $value) {
                $this->set($name, $value);
            }
            db::commit();
        } catch (\Exception $e) {
            db::rollBack();
            throw $e;
        }
    }

}