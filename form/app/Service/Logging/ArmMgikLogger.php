<?php

namespace App\Service\Logging;
use App\Service\Mgik;
use Monolog\Logger;

class ArmMgikLogger extends GrayLogLogger {
     public function __construct()
    {
         parent::__construct('ArmMgik', Logger::INFO, 'Arm');
    }

    public function tryLog($levelOrException, $message = '', array $context = array())
    {
         $district = app()['session.store']->get(Mgik::SESSION_KEY_DISTRICT) ?? null;
         if ($district) {
             $context['district'] = $district;

             try {
                 $user = app()['user']->getUser();
                 if ($user !== null) {
                     $context['ssoId'] = $user->id;
                 }
             } catch (\Exception $e) {
                 // just in case
             }
             app()['log']->tryLog($levelOrException, $message, $context);
             return parent::tryLog($levelOrException, $message, $context);
         }
     }
}