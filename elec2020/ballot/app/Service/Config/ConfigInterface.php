<?php
/**
 * Created by PhpStorm.
 * User: artiom
 * Date: 06.06.17
 * Time: 14:19
 */

namespace App\Service\Config;


interface ConfigInterface
{
    /**
     * @param      $path 'services/rnip/version'
     * @param null $defaultValue
     *
     * @return null|mixed
     */
    public function get($path, $defaultValue = null);

    /**
     * Установка параметров в конфиг
     *
     * @param string $path
     * @param mixed  $value
     *
     * @return $this
     */
    public function set($path, $value);

    /**
     * @return array
     */
    public function getAll();

    /**
     * @param array $config
     *
     * @return $this
     */
    public function setAll($config);
}