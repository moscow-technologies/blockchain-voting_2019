<?php

namespace App\Service\Base;

/**
 * Class Singleton
 * Inheritable Singleton's pattern implementation.
 * @package Itb\Mpgu\DBObject
 */

/**
 * Class Singleton
 * @package Itb\Mpgu\Core\Base
 */
abstract class Singleton
{

    /**
     * @var array
     */
    private static $instances = array();

    /**
     * Singleton constructor.
     */
    protected function __construct()
    {
    }

    /**
     * @param $class
     * @param null $args
     * @return mixed
     */
    final public static function getInstance($class, $args = null /* , ... */)
    {
        if (!isset(self::$instances[$class])) {
            /*if (2 < func_num_args()) {
                $args = func_get_args();
                array_shift($args);

                $object =
                    unserialize(
                        sprintf('O:%d:"%s":0:{}', strlen($class), $class)
                    );

                call_user_func_array(
                    array($object, '__construct'),
                    $args
                );
            } else {*/
                $object =
                    $args
                        ? new $class($args)
                        : new $class();
            //}

            self::$instances[$class] = $object;
        }

        return self::$instances[$class];
    }

    /**
     * @return array
     */
    final public static function getAllInstances()
    {
        return self::$instances;
    }


    /**
     * @param $class
     *
     * @throws \InvalidArgumentException
     */
    final public static function dropInstance($class)
    {
        if (!isset(self::$instances[$class]))
            throw new \InvalidArgumentException('knows nothing about ' . $class);

        unset(self::$instances[$class]);
    }


    /**
     *
     */
    final private function __clone()
    {
    }

    /**
     *
     */
    final private function __sleep()
    {
    }
}

?>
