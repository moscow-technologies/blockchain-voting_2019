<?php

namespace App\Service\Logging;

use Monolog\Logger;

class ArmMgikLogger extends GrayLogLogger {
     public function __construct($facility, $logLevel = Logger::INFO, $confFile = 'Graylog')
    {
         parent::__construct($facility, $logLevel, 'Arm');
    }

    public function tryLog($levelOrException, $message = '', array $context = array()) {
        $district = app()['session.store']->get('district') ?? null;
        if ($district) {
            $context['district'] = $district;
        }
        app()['log']->tryLog($levelOrException, $message, $context);
        return parent::tryLog($levelOrException, $message, $context);
    }
}