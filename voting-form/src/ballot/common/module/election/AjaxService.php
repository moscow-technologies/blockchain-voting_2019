<?php

namespace Mgd\Module\election;

use Mgd\Lib\Loggers\GrayLogger;

class AjaxService
{
    /** @var string */
    protected $action;

    /** @var array  */
    protected $allowedActions = [
        'hit',
    ];

    public function handle($action, $form)
    {
        $this->action = $action;
        $method = "action" . ucfirst($action);

        if (in_array($action, $this->allowedActions) && method_exists($this, $method)) {
            return call_user_func([$this, $method]);
        }
    }

    protected function actionHit()
    {
        $hit = $_REQUEST['hit'] ?? null;
        $tp = $_REQUEST['type'] ?? null;
        $value = $_REQUEST['value'] ?? null;
        $guid = preg_replace('/.*election\/([^\/]+)$/','$1',$_SERVER['HTTP_REFERER']);
        if ($hit) {
            $log = GrayLogger::create('MgicHitCounter');
            $log->info($hit, ['data' => $value,'action'=>$tp,'errorMessage'=>$hit,'guid'=> $guid ?? '']);
        }

        exit;
    }

}