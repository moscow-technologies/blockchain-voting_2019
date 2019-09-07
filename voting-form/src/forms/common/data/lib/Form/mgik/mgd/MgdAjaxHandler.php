<?php

namespace Itb\Mpgu\Form\mgik\mgd;

use AjaxModule;
use FormMgik;

class MgdAjaxHandler implements AjaxModule
{
    /** @var array */
    private $allowActions = ['log'];

    /** @var string */
    private $action;

    /** @var FormMgik */
    private $form;

    public function handle($action, $form)
    {
        $this->action = 'action' . ucfirst($action);
        $this->form = $form;

        $result = ['result' => false];

        if (in_array($action, $this->allowActions) && method_exists($this, $this->action)) {
            $result = call_user_func([$this, $this->action]);
        }

        return json_encode($result);
    }

    private function actionLog()
    {
        $log = $_REQUEST['log'] ?? null;

        if (! $log) {
            return ['result' => false];
        }

        $message = $log['error'] ?? 'Неизвестная ошибка';

        $this->form->logData['error'] = 1;
        $this->form->logData['errorMessage'] = $log;
        $this->form->logTrait($message, $this->form->logData);

        return ['result' => true];
    }
}