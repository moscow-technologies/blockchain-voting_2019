<?php

namespace App\Exceptions;

/**
 * Class BaseException
 * @package Itb\Mpgu\Core\Exceptions
 */
class BaseException extends \Exception
{
    public function __toString()
    {
        return
            "[$this->message] in: \n" .
            $this->getTraceAsString();
    }
}
