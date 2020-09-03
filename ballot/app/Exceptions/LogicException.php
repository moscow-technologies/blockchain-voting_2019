<?php

namespace App\Exceptions;

use Throwable;

class LogicException extends \Exception
{
    /** @var array */
    protected $data;

    public $systemMessage;

    public function __construct($message = "", $data = [], $code = 0, Throwable $previous = null)
    {
        $this->data = (array) $data;

        parent::__construct($message, $code, $previous);
    }

    public function getData()
    {
        return $this->data;
    }

    public function setSystemMessage($message) {
        $this->systemMessage = $message;
    }
}