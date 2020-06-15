<?php
/**
 * Created by PhpStorm.
 * User: artiom
 * Date: 06.06.17
 * Time: 14:09
 */

namespace App\Service\Config;


use Exception;

class MemoryConfig implements ConfigInterface
{
    /**
     * @var array
     */
    protected $config = [];

    /**
     * @param      $path 'services/rnip/version'
     * @param null $defaultValue
     *
     * @return null|mixed
     */
    public function get($path, $defaultValue = null)
    {
        $parts     = explode('/', $path);
        $keyExists = true;
        $node      = $this->getAll();

        foreach($parts as $part) {
            $part = trim($part);

            if (!array_key_exists($part, $node)) {
                $keyExists = false;
                break;
            }

            $node = &$node[$part];
        }

        if ($keyExists) {
            return $node;
        } else {
            return $defaultValue;
        }
    }

    /**
     * Установка параметров в конфиг
     *
     * @param string $path
     * @param mixed  $value
     *
     * @return $this
     * @throws Exception
     */
    public function set($path, $value)
    {
        $path = explode('/', $path);
        $node = &$this->config;
        $cnt  = count($path) - 1;

        for ($ii=0; $ii<=count($path); $ii++) {
            if ($ii == $cnt) {
                if (is_array($node)) {
                    $node[$path[$ii]] = $value;
                } else {
                    throw new Exception('Last element "'. $path .'" is not empty and not array');
                }
                break;
            } elseif (!array_key_exists($path[$ii], $node)) {
                $node[$path[$ii]] = [];
            }
            $node = &$node[$path[$ii]];
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getAll()
    {
        return $this->config;
    }

    /**
     * @param array $config
     *
     * @return $this
     */
    public function setAll($config)
    {
        $this->config = $config;

        return $this;
    }
}