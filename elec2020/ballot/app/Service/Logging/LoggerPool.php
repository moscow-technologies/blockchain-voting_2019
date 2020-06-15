<?php
/*
  +----------------------------------------------------------------------+
   LoggerPool.php                                                         
  +----------------------------------------------------------------------+
   This source file                                                     
  +----------------------------------------------------------------------+
   27.02.2017  11:56                                                     
  +----------------------------------------------------------------------+
*/


namespace App\Service\Logging;


/**
 * Class LoggerPool
 * @package Itb\Mpgu\Lib\pglib\logging
 */
class LoggerPool extends BaseLogger
{
    /**
     * @var array
     */
    protected $loggers = [];

    /**
     * @var
     */
    protected static $instance;

    /**
     * @var float
     */
    protected $microtime;

    /**
     * LoggerPool constructor.
     */
    public  function __construct()
    {
        $this->microtime = microtime(true);

        return;
    }

    /**
     * @return LoggerPool
     */
    public static function me()
    {
        if (!self::$instance) self::$instance = new self();
        return self::$instance;
    }

    /**
     * @param string $facility
     * @param string $loggerName
     *
     * @return BaseLogger
     */
    public static function create($facility, $loggerName='graylog')
    {
        /** @var GrayLogLogger $clone */
        $clone = clone static::me()->get($loggerName);
        $clone->setLogger($clone->getLogger()->withName($facility));

        return $clone;
    }

    /**
     * @param $index
     * @param BaseLogger $logger
     * @return $this
     */
    public function add($index, BaseLogger $logger)
    {
        /** @var array $loggers */
        $loggers = $this->loggers;
        if (!array_key_exists($index, $loggers)) {
            $this->loggers[$index] = $logger;
        } else {
            throw new \OverflowException("index %{$index}% already exists in an array");
        }

        return $this;
    }

    /**
     * @param $index
     * @return bool|mixed
     */
    public function get($index)
    {
        /** @var array $loggers */
        $loggers = $this->getLoggers();

        if (array_key_exists($index, $loggers)) {
            return $loggers[$index];
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getLoggers()
    {
        return $this->loggers;
    }


    /**
     * @param $levelOrException
     * @param string $message
     * @param array $context
     * @return bool
     */
    public function tryLog($levelOrException, $message = '', array $context = array())
    {
        /** @var array $loggers */
        $loggers = $this->getLoggers();

        reset($loggers);

        /** @var BaseLogger $logger */
        foreach ($loggers as $logger) {
            if ($logger instanceof BaseLogger) {
                $logger->tryLog($levelOrException, $message, $context);
            }
        }

        return true;
    }

}
