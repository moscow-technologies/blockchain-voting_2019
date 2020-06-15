<?php

namespace App\Service\Logging;

use Monolog\Formatter\JsonFormatter;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

/**
 * Запись в файловый лог
 *
 * @package Itb\Mpgu\Loggers
 */
class StdoutLogger extends BaseLogger
{
    /**
     * Формат вывода даты
     *
     * @var string
     */
    protected $dateFormat = "Y-m-d H:i:s u";

    /**
     * @var array
     */
    protected static $instances = [];

    /**
     * @param string $className Имя класса инициализатора
     * @param int    $logLevel  Уровень логирования
     */
    public function __construct($className, $logLevel=Logger::INFO)
    {
        $formatter = new JsonFormatter();
        $formatter->includeStacktraces();

        $stream = new StreamHandler('php://stdout', $logLevel);
        $stream->setFormatter($formatter);

        $this->setLogger(new Logger($className));
        $this->getLogger()->pushHandler($stream);
    }

    /**
     * Создать инстанс
     *
     * @param string $className Имя класса инициализатора
     * @param int    $logLevel  Уровень логирования

     * @return $this
     */
    public static function create($className, $logLevel=Logger::INFO)
    {
        $key = md5($className . $logLevel);
        $instance = !empty(self::$instances[$key]) ? self::$instances[$key] : false;

        if ($instance===false) {
            $instance = new self($className, $logLevel);
            self::$instances[$key] = $instance;
        }

        return $instance;
    }
}