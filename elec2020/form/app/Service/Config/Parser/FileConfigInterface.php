<?php
/**
 * Created by PhpStorm.
 * User: artiom
 * Date: 06.06.17
 * Time: 14:04
 */

namespace App\Service\Config\Parser;


interface FileConfigInterface
{
    /**
     * @param string $filePath
     *
     * @return array
     */
    public function loadFile($filePath);
}