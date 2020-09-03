<?php

namespace App\Service\Task\Plugin;

use App\Service;
use App\Service\Task\TaskManager;
use App\Service\Broker\BrokerAmqp;

class Mgd2019 implements TaskPlugin
{
    private $_config;

    private const MAX_RETRY_COUNT = 5;

    public function __construct() {
        $this->_config = Service\Config\PoolConfig::me()->conf('Mgik')->get('amqp');
    }

    private static $_broker;

    protected $log;

    /**
     * @param TaskManager $taskManager
     * @param $attemptNumber
     * @param $userID
     * @param $data
     * @param $extID
     */
    public function executeTask($taskManager, $attemptNumber, $userID, $data, $extID)
    {
        $config = Service\Config\PoolConfig::me()->conf('Mgik')->get('amqp');

        for ($i = 0; $i < self::MAX_RETRY_COUNT; $i++) {
            try {
                $broker = $this->_broker();
                $sendVoteProcess = Service\ProcessDurationLogger::start('send_vote');
                $result = $broker->send(
                    $data['queue'],
                    $data['json'],
                    ['persistent' => 'true']
                );
                Service\ProcessDurationLogger::finish($sendVoteProcess);
                break;
            } catch (\Throwable $e) {
                $this->_broker()->close();
                app()['log']->error('Error', ['class' => get_class($e), 'type' => 'retry']);
                $this->_broker(true);
            }
        }

        if (!$result)  {
            throw new \Exception('Unable to execute after ' . self::MAX_RETRY_COUNT . ' retries');
        }

        $log_data = array(
            'error' => 0,
            'result' => $result,
            'userID' => $userID,
            'data' => $data['json'],
            'eno' => $data['eno'],
            'host' => $config['host'],
            'queue' => $data['queue'],
            'attemptNumber' => $attemptNumber,
        );

        if ($result) {
            $taskManager::$message = true;
            $taskManager->stopTask(true);
            $this->sendLog('OK', $log_data);
        } else {
            $taskManager::$message = false;
            $log_data['error'] = 1;

            if ($attemptNumber >= $config->get('limit', 5)) {
                $this->sendLog("Достигнут лимит отправки", $log_data);
                $taskManager->stopTask(false, false, "Достигнут лимит отправки $extID");
            } else {
                $this->sendLog("Неудачная отправка $attemptNumber", $log_data);
                $taskManager->setExtIdAndWait($extID, $message, time() + ($config->get('resendTime', 120) * ($attemptNumber + 1)));
            }
        }
    }

    private function _broker(bool $isForce = false) {
        $createBrokerProcess = Service\ProcessDurationLogger::start('create broker');
        if (self::$_broker === null || $isForce) {
            self::$_broker = new BrokerAmqp($this->_config['host'], $this->_config['port'], $this->_config['login'], $this->_config['password'], $this->_config['vhost'], $this->_config['exchange']);
        }
        Service\ProcessDurationLogger::finish($createBrokerProcess);
        return self::$_broker;
    }

    protected function sendLog($message, $data = [])
    {
        if (! $this->log) {
            $this->log = app()['log'];
        }

        $this->log->info($message, array_merge([
            'pid' => posix_getpid(),
            'sess-id' => session_id(),
            'type' => 'Forms'
        ], $data));
    }

}