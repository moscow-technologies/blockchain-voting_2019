<?php

namespace App\Exceptions;

use Throwable;

class RedirectRequired extends \Exception {

    /** @var string */
    private $_location;

    public function __construct(string $location, $message = "", $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
        $this->_location = $location;
    }

    public function location(): string {
        return $this->_location;
    }
}