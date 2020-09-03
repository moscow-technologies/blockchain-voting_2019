<?php
/**
 * Created by PhpStorm.
 * User: artiom
 * Date: 06.06.17
 * Time: 15:23
 */

namespace App\Service\Config\Parser;

use Exception;
use RuntimeException;
use UnexpectedValueException;

class Php implements FileConfigInterface
{
    /**
     * @param string $filePath
     *
     * @return array
     */
    public function loadFile($filePath)
    {
        try {
            $returnValue = require($filePath);
        } catch (Exception $e) {
            throw new RuntimeException (
                array(
                    'message'   => 'PHP file threw an exception',
                    'exception' => $e,
                )
            );
        }

        if (!is_array($returnValue)) {
            throw new UnexpectedValueException('PHP file does not return an array');
        }

        return $returnValue;
    }
}