<?php
/**
 * Created by PhpStorm.
 * User: artiom
 * Date: 06.06.17
 * Time: 14:01
 */

namespace App\Service\Config;


use App\Service\Config;
use App\Service\Config\Parser\FileConfigInterface;

class FileConfig extends MemoryConfig
{
    /**
     * @var string
     */
    protected static $confPath = '';

    /**
     * @var string
     */
    protected static $serverType = 'Dev';

    /**
     * Config constructor.
     *
     * @param string $fileName
     *
     * @throws UnsupportedConfigType
     */
    public function __construct($fileName)
    {
        $this->setAll(Config::getConfig($fileName));
    }

    /**
     * @param FileConfigInterface $parser
     * @param string              $fileName
     *
     * @return array
     */
    protected function loadConfig(FileConfigInterface $parser, $fileName)
    {
        $returnValue = [];

        $filePath    = self::getConfPath() . '/My/' . $fileName;
        if (is_file($filePath)) {
            $returnValue = $parser->loadFile($filePath);
        } else {
            $filePath = self::getConfPath() . '/' . self::getServerType() . '/' . $fileName ;
            if (is_file($filePath)) {
                $returnValue = $parser->loadFile($filePath);
            }
        }

        return $returnValue;
    }

    /**
     * @return string
     */
    public static function getConfPath()
    {
        return self::$confPath;
    }

    /**
     * @param string $confPath
     */
    public static function setConfPath($confPath)
    {
        self::$confPath = $confPath;
    }

    /**
     * @return string
     */
    public static function getServerType()
    {
        return self::$serverType;
    }

    /**
     * @param string $serverType
     */
    public static function setServerType($serverType)
    {
        self::$serverType = $serverType;
    }
}