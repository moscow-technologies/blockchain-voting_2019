<?php

namespace Itb\Mpgu\Form\mgik\mgd;

use params;
use Itb\Mpgu\Lib\MessageBroker\BrokerTrait;
use Itb\Mpgu\Task\FormsMQ\LoggerTrait;

require_once params::$params['common_data_server']['value'].'lib/Form/process_status.php';

/**
 * Обработчик статусов заявлений на регистрацию
 * Используется в задаче common/data/tools/tasks/1m#mgik_receive_status.php
 */
class ReceiveStatusWorker
{
    use LoggerTrait,
        BrokerTrait;

    public function __construct()
    {
        $this->setPid(posix_getpid());
    }

    /**
     * @param array $message
     * @throws \Exception
     */
    public function brokerCallback($message)
    {
        try {
            $data = $this->createUpdateStatusData($message);
            $this->log('Формирование запроса', ['data' => $data], 'info');

            $result = update_status($data, true);
            $this->log('Обновление статуса', ['result' => $result], 'info');

            $removeMessage = true;

            if (strpos($result, 'ORA') !== false) {
                $removeMessage = false;
            } elseif (strpos($result, 'Status date is old') !== false) {
                $removeMessage = true;
            } elseif ($result !== 'OK') {
                $moveResult = $this->broker->send('0MDM-2.BK', $message['body'], [
                    'persistent' => 'true',
                    'result' => $result,
                ]);

                if (!$moveResult) {
                    $removeMessage = false;
                }

                $result .= "\nПеренос в .BK очередь: " . (int)$moveResult;
            }

            if ($removeMessage) {
                $this->getBroker()->ack($message);
                $result .= "\nСообщение удалено из очереди";
            }

            $this->log('Изменение статуса заявления', [
                'eno' => $data->reg_num ?? null,
                'sso_id' => $data->sso ?? null,
                'data' => $data,
                'result' => $result,
            ], 'info');

        } catch (\Throwable $e) {
            $this->error('Критическая ошибка', [
                'message' => $e->getMessage(),
                'data' => $e->getTrace()
            ]);

            throw new \Exception($e->getMessage());
        }
    }

    /**
     * @param array $message
     * @return object
     */
    private function createUpdateStatusData($message)
    {
        $body = json_decode($message['body']);
        $data = $body->result ?? null;

        $result = [
            'reg_num' => $data->reg_num ?? '',
            'status_info' => [
                'status_code' => $data->status_info->status_code ?? '',
                'status_title' => $data->status_info->status_title ?? '',
                'status_date' => $data->status_info->status_date ?? '',
            ],
            'extra_info' => [
                'append' => false,
                'value' => $data->extra_info->value ?? '',
            ],
        ];

        return json_decode(json_encode($result), false);
    }
}