<?php

namespace App\Service\Logging;

use Monolog\Logger;

class ArmMgikLogger extends GrayLogLogger {
     public function __construct($facility, $logLevel = Logger::INFO, $confFile = 'Graylog')
    {
         parent::__construct($facility, $logLevel, 'Arm');
    }
}