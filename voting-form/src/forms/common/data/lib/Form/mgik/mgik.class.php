<?php

use Itb\Mpgu\Form\mgik\mgd\LogicException;

require_once(dirname(__DIR__).'/form.crm.class.php');

/**
 * @property array $client
 * @property array $logData
 */
class FormMgik extends CrmForm
{
    protected $org_id = 'mgik';
    protected $state_structure_title = 'Московская городская избирательная комиссия';

    /**
     * @param \Exception $exception
     */
    protected function logExceptionError(\Exception $exception)
    {
        $this->logData['error'] = 1;

        if ($exception instanceof LogicException) {
            $data = $exception->getData();
            $message = $data['errorMessage'] ?? $exception->getMessage();
            $this->logTrait($message, array_merge($this->logData, $data));
        } else {
            $this->logData['errorMessage'] = $exception->getMessage();
            $this->logData['errorTrace'] = $exception->getTraceAsString();
            $this->logTrait('Неизвестная ошибка', $this->logData);
        }
    }
}
