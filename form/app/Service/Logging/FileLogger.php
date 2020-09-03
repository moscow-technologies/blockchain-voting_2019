<?php

namespace App\Service\Logging;

use Monolog\Formatter\LineFormatter;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

/**
 * Запись в файловый лог
 *
 * @package Itb\Mpgu\Loggers
 */
class FileLogger extends BaseLogger
{
    /**
     * Формат вывода даты
     *
     * @var string
     */
    protected $dateFormat = "Y-m-d g:i:s u";

    /**
     * @var array
     */
    protected static $instances = [];

    /**
     * @param string $className Имя класса инициализатора
     * @param string $logFile   Путь к файлу лога
     * @param int    $logLevel  Уровень логирования
     */
    public function __construct($className, $logFile, $logLevel=Logger::INFO)
    {
        $stream = new StreamHandler($logFile, $logLevel);
        $stream->setFormatter(new LineFormatter(null, $this->dateFormat));

        $this->setLogger(new Logger($className));
        $this->getLogger()->pushHandler($stream);
    }

    /**
     * Создать инстанс
     *
     * @param string $className Имя класса инициализатора
     * @param string $logFile   Путь к файлу лога
     * @param int    $logLevel  Уровень логирования

     * @return $this
     */
    public static function create($className, $logFile, $logLevel=Logger::INFO)
    {
        $key = md5($className . $logFile . $logLevel);
        $instance = !empty(self::$instances[$key]) ? self::$instances[$key] : false;

        if ($instance===false) {
            $instance = new self($className, $logFile, $logLevel);
            self::$instances[$key] = $instance;
        }

        return $instance;
    }
}