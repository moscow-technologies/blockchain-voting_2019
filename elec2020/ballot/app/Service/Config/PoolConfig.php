<?php
namespace App\Service\Config;


class PoolConfig
{
    /**
     * @var array
     */
    protected $configs = [];

    /**
     * @var self
     */
    protected static $instance = null;

    /**
     * @return self
     */
    public static function me()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * @param $key
     *
     * @return ConfigInterface
     */
    public function get($key)
    {
        if (!isset($this->configs[$key])) {
            $this->set($key, new FileConfig(ucfirst($key)));
        }

        return $this->configs[$key];
    }

    /**
     * @param $key
     *
     * @return ConfigInterface
     */
    public function conf($key)
    {
        return $this->get($key);
    }

    /**
     * @param string          $key
     * @param ConfigInterface $config
     *
     * @return $this
     */
    public function set($key, ConfigInterface $config)
    {
        $this->configs[$key] = $config;

        return $this;
    }

    /**
     * @param string $key
     *
     * @return $this
     */
    public function delete($key)
    {
        unset($this->configs[$key]);

        return $this;
    }
}