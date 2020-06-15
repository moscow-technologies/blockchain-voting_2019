<?php

namespace App\Service\Logging;

use Monolog\Logger;

/**
 * Class BaseLogger
 * @package Itb\Mpgu\Loggers
 */
class BaseLogger
{
    /**
     * @var Logger|BaseLogger|$this
     */
    protected $logger = null;

    /**
     * Получение Логгера в формате \Psr\Log\LoggerInterface
     *
     * @return Logger|BaseLogger|$this
     */
    public function getLogger()
    {
        if (!$this->logger) {
            return $this;
        }
        return $this->logger;
    }

    /**
     * @param Logger $logger
     * @return Logger|BaseLogger|$this
     */
    public function setLogger(Logger $logger)
    {
        $this->logger = $logger;
        return $this;
    }

    /**
     * Логирование средствами Logger::addRecord c пустым хэндлером при отсутствии инстанса логгера
     *
     * @param $levelOrException
     * @param string $message
     * @param array $context
     * @return string
     */
    public function addRecord($levelOrException, $message = '', array $context = array())
    {
        return true;
    }

    /**
     * @param \Exception $e
     * @param array $context
     * @return null|string
     */
    protected function exceptions(\Exception $e, array $context = array())
    {
        $returnValue = null;

        $message = '['.get_class($e).':'.$e->getCode()."] {$e->getMessage()}\n";

        $data = array_merge($context, array(
//            'class' => get_class($e),
            'file' => $e->getFile(),
//            'line' => $e->getLine(),
//            'code' => $e->getCode(),
            'error' => 1,
            'errorMessage' => $e->getMessage(),
            'errorCode' => $e->getCode(),
            'errorTrace' => $e->getTraceAsString(),
//            'export' => var_export($e, true),
        ));

        if ($this->getLogger()) $returnValue = $this->getLogger()->addRecord(Logger::CRITICAL, $message, $data);

        return $returnValue;
    }

    /**
     * @param $levelOrException
     * @param string $message
     * @param array $context
     * @return bool
     */
    public function tryLog($levelOrException, $message = '', array $context = array())
    {
        $returnValue = null;

        try {
            $logger = $this->getLogger();
            $context = $this->getMainContext($context);
            if (!$logger instanceof Logger && !$logger instanceof BaseLogger) throw new \InvalidArgumentException('%'.get_class($logger).'% is not instanceof BaseLogger');
            if ($levelOrException instanceof \Exception) {
                $returnValue = $this->exceptions($levelOrException, $context);
            } else {
                $returnValue = $logger->addRecord($levelOrException, $message, $context);
            }
        } catch (\Exception $e) {

        }

        return $returnValue;
    }

    public function getMainContext(array $context = array())
    {
        return $context;
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function debug($message, array $context = array())
    {
        return $this->tryLog(Logger::DEBUG, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function info($message, array $context = array())
    {
        return $this->tryLog(Logger::INFO, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function notice($message, array $context = array())
    {
        return $this->tryLog(Logger::NOTICE, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function warn($message, array $context = array())
    {
        return $this->tryLog(Logger::WARNING, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function warning($message, array $context = array())
    {
        return $this->tryLog(Logger::WARNING, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function err($message, array $context = array())
    {
        return $this->tryLog(Logger::ERROR, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function error($message, array $context = array())
    {
        return $this->tryLog(Logger::ERROR, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function crit($message, array $context = array())
    {
        return $this->tryLog(Logger::CRITICAL, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function critical($message, array $context = array())
    {
        return $this->tryLog(Logger::CRITICAL, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function alert($message, array $context = array())
    {
        return $this->tryLog(Logger::ALERT, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function emerg($message, array $context = array())
    {
        return $this->tryLog(Logger::EMERGENCY, $message, $context);
    }

    /**
     * @param $message
     * @param array $context
     * @return bool
     */
    public function emergency($message, array $context = array())
    {
        return $this->tryLog(Logger::EMERGENCY, $message, $context);
    }

    /**
     * @param \Exception $e
     * @param array $context
     * @return mixed
     */
    public function exception(\Exception $e, array $context = array())
    {
        return $this->tryLog($e, '', $context);
    }
}
?>
