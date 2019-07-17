<?php

namespace Mgd\Module\election;

use params;
use TaskManager;
use Mgd\Lib\Config\PoolConfig;
use Mgd\Lib\Loggers\GrayLogger;
use Mgd\Lib\MessageBroker\BrokerAmqp;

require_once(params::$params['common_data_server'].'/lib/taskManager.php');

abstract class TaskRequest
{
    /** @var array  */
    public $app;

    /** @var array  */
    public $client;
    
    /** @var array|string  */
    public $fields;

    /** @var array */
    protected $config;

    /** @var string */
    protected $plugin = 'mgd2019_serviceSend';

    /**
     * @param array $client
     * @param array|string $fields
     * @param array $app
     */
    public function __construct(array $client, $fields = '', array $app = [])
    {
        $this->client = $client;
        $this->fields = $fields;
        $this->app = $app;

        $this->config = PoolConfig::me()->conf('Mgik')->get('amqp');
    }

    /**
     * @return string
     */
    abstract public function queueName();

    /**
     * @return array
     */
    abstract public function asArray();

    /**
     * @return string
     */
    public function asJson()
    {
        return json_encode($this->asArray(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * @return array
     */
    public function asTaskData()
    {
        return [
            'eno' => $this->app['REG_NUM'] ?? null,
            'queue' => $this->queueName(),
            'json' => $this->asJson(),
        ];
    }

    /**
     * Добавляет задачу в TaskManager
     * @return void
     */
    public function addQueueTask()
    {
        $config = PoolConfig::me()->conf('Mgik')->get('amqp');
        $broker = new BrokerAmqp($config['host'], $config['port'], $config['login'], $config['password'],null, $config['vhost']);
        $data = $this->asTaskData();
        $result = $broker->send(
            $data['queue'],
            $data['json'],
            ['persistent' => 'true']
        );

        $logger = GrayLogger::create('MgicTaskManager');

        $log = [
            'result' => $result,
            'action' => $this->plugin,
            'jsonRequest' => json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'user_id' => $this->client['PGU_USER_ID'] ?? null,
            'app_id' => $this->app['APP_ID'] ?? null,
            'eno' => $this->app['REG_NUM'] ?? null,
            'data' => $this->asJson(),
        ];

        if (! empty($result) && $result != 'OK') {
            $logger->error('Не удалось отправить заявку', $log);
        } else {
            $logger->info('Заявка отправлена', $log);
        }
    }

    /**
     * @param string $date Дата
     * @param string $format Формат даты. По умолчанию 'd.m.Y'
     * @return string Дата в формате 'Y-m-d H:i:s.000'
     */
    protected function formatAsDate($date, $format = 'd.m.Y')
    {
        $dt = \DateTime::createFromFormat($format, $date);

        if (! $dt) {
            return '';
        }

        if (str_replace(['H', 'i', 's'], '', $format) === $format) {
            $dt->setTime(0, 0, 0);
        }

        return $dt->format('Y-m-d H:i:s.000');
    }

    /**
     * @param $string
     * @return string
     */
    protected function formatAsNumber($string)
    {
        return preg_replace('/[^0-9]/', '', $string);
    }

    /**
     * @param string $serial_number
     * @return string
     */
    protected function formatAsPassportSerial($serial_number)
    {
        return substr($this->formatAsNumber($serial_number), 0, 4);
    }

    /**
     * @param string $serial_number
     * @return string
     */
    protected function formatAsPassportNumber($serial_number)
    {
        return substr($this->formatAsNumber($serial_number), 4, 6);
    }

}