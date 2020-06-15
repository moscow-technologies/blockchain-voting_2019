<?php

namespace App\Service\Logging;
use Monolog\Logger;
use App\Service\Logging\GrayLogLogger;
class ArmMgikLogger extends GrayLogLogger {
     public function __construct()
    {
         parent::__construct('ArmMgik', Logger::INFO, 'Arm');
    }
}