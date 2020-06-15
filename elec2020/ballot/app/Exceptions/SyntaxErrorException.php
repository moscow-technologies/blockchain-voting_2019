<?php

namespace App\Exceptions;

use Arm\Lib\Base;

/**
 * Class SyntaxErrorException
 * @package Itb\Mpgu\Core\Exceptions
 */
final class SyntaxErrorException extends BaseException
{
    private $errorLine = null;
    private $errorPosition = null;

    public function __construct(
        $message, $errorLine = null, $errorPosition = null, $code = 0
    )
    {
        parent::__construct($message, $code);

        $this->errorLine = $errorLine;
        $this->errorPosition = $errorPosition;
    }

    public function getErrorLine()
    {
        return $this->errorLine;
    }

    public function getErrorPosition()
    {
        return $this->errorPosition;
    }

    public function __toString()
    {
        return
            '[error at line '
            . (Assert::checkInteger($this->errorLine) ? $this->errorLine : 'unknown')
            . ', position '
            . (Assert::checkInteger($this->errorPosition) ? $this->errorPosition : 'unknown')
            . ": {$this->message}] in: \n" .
            $this->getTraceAsString();
    }
}
