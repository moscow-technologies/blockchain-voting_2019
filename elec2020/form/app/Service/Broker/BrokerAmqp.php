<?php

namespace App\Service\Broker;

use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Exception\AMQPTimeoutException;
use PhpAmqpLib\Exception\AMQPProtocolException;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire;
use PhpAmqpLib\Wire\AMQPTable;

class BrokerAmqp
{

    /**
     * @var AMQPStreamConnection
     */
    private $connection;

    /**
     * @var AMQPChannel
     */
    private $channel;

    /**
     * @var int Время ожидания получения сообщений
     */
    private $waitTime = 3600;

    /**
     * @var int Время жизни подписки
     */
    private $lifeTime;

    /**
     * @var array Обратный вызов для обработки полученного сообщения
     */
    private $callback;

    /** @var string */
    protected $host;

    /** @var int */
    protected $port;

    /** @var string */
    protected $username;

    /** @var string */
    protected $password;
    /** @var string */

    /** @var string */
    protected $vhost;
    protected $exchange;
    protected $queueType;

    /** @var array */
    private $_declaredBindsByQueue;

    /**
     * @param string     $host
     * @param int        $port
     * @param string     $username
     * @param string     $password
     */
    public function __construct($host, $port = 5672, $username = 'guest', $password = 'guest', $vhost = '/', $exchange = '')
    {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->vhost = $vhost;
        $this->exchange = $exchange;
        $this->_declaredBindsByQueue = [];
        $this->connection = new AMQPStreamConnection($host, $port, $username, $password, $vhost, false, 'AMQPLAIN', null, 'en_US', 1, 1, null, true);
        $this->channel = $this->connection->channel();


        register_shutdown_function(array($this, 'close'));
    }


    public function setClientId(string $clientId)
    {

        return $this;
    }
    /**
     * @param int $waitTime
     *
     * @return $this
     */
    public function setWaitTime($waitTime)
    {
        $this->waitTime = $waitTime;

        return $this;
    }

    public function setQueueType(string $type = '')
    {
        $this->queueType = $type;
        return $this;
    }

    public function setExchange(string $type = '')
    {
        $this->exchange = $type;
        return $this;
    }
    /**
     * @param int $waitTime
     *
     * @return $this
     */
    public function setLifeTime($lifeTime)
    {
        $this->lifeTime = $lifeTime;

        return $this;
    }

    /**
     * @return array
     */
    public function getCallback()
    {
        return $this->callback;
    }

    /**
     * @param array $callback
     *
     * @return $this
     */
    public function setCallback($callback)
    {
        $this->callback = $callback;

        return $this;
    }

    /**
     * @param $queueName
     *
     * @return mixed
     */
    public function getCountMessage($queueName)
    {
        $connection = new AMQPStreamConnection($this->getHost(), $this->getPort(), $this->getUsername(), $this->getPassword(), $this->getVhost());
        $channel = $connection->channel();
        $returnValue = $channel->queue_declare($queueName, false, true, false, false);
        $channel->close();
        $connection->close();

        return $returnValue['1'];
    }

    /**
     * @param string $queueName
     * @param string $message
     * @param array  $properties
     *
     * @return boolean
     */
    public function send($queueName, $message, $properties = array())
    {

        if (!empty($properties['typeExchange'])) {
            $typeExchange = $properties['typeExchange'];
            unset($properties['typeExchange']);
        } else {
            $typeExchange = $this->getTypeExchange($this->getExchange($queueName));
        }
        $this->declareBind($queueName, $typeExchange);

        $aMessage = new AMQPMessage($message);

        if (!empty($properties['persistent'])) {
            $properties['delivery_mode'] = AMQPMessage::DELIVERY_MODE_PERSISTENT;
            unset($properties['persistent']);
        }

        $appHeaders = new Wire\AMQPTable();

        foreach ($properties as $key => $value) {
            try {
                $aMessage->set($key, $value);
            } catch (\OutOfBoundsException $e) {
                $appHeaders->set($key, $value);
            }
        }

        $aMessage->set('application_headers', $appHeaders);

        $this->channel->basic_publish($aMessage, $this->getExchange($queueName));


        return true;
    }

    /**
     * @param string $queueName
     * @param int $prefetchCount
     */
    public function subscribe($queueName, $prefetchCount = 1)
    {
        $this->channel->basic_qos(null, $prefetchCount, null);
        $this->declareBind($queueName);

        $this->channel->basic_consume(
            $queueName, #очередь
            '', #тег получателя - Идентификатор получателя, валидный в пределах текущего канала. Просто строка
            false, #не локальный - TRUE: сервер не будет отправлять сообщения соединениям, которые сам опубликовал
            false, #без подтверждения - отправлять соответствующее подтверждение обработчику, как только задача будет выполнена
            false, #эксклюзивная - к очереди можно получить доступ только в рамках текущего соединения
            false, #не ждать - TRUE: сервер не будет отвечать методу. Клиент не должен ждать ответа
            array($this, 'callback')  #функция обратного вызова - метод, который будет принимать сообщение
        );


        try {
            $finishTime = $this->lifeTime ? (time() + $this->lifeTime) : 0;

            while (count($this->channel->callbacks)) {
                if ($finishTime && time() >= $finishTime) {
                    throw new AMQPTimeoutException("Lifetime timeout");
                }

                $this->channel->wait(null, true, $this->waitTime);
            }
        } catch (AMQPTimeoutException $e) {
            //
        }
    }

    /**
     * @param string $queueName
     * @param string $type direct, topic, headers and fanout
     *
     * @return mixed|null
     */
    public function declareBind($queueName, $type = 'direct')
    {
        if (array_key_exists($queueName, $this->_declaredBindsByQueue)) {
            return;
        }

        if (!empty($this->queueType)) {
            $arguments['x-queue-type'] = $this->queueType;
        }
        elseif (strpos($this->getExchange($queueName), 'quorum') >= 0) {
            $arguments['x-queue-type'] = 'quorum';
        }

        $this->channel->queue_declare(
            $queueName, #имя очереди, такое же, как и у отправителя
            false, #пассивный
            true, #надёжный
            false, #эксклюзивный
            false,  #автоудаление
            false,
            new AMQPTable($arguments)
        );
        if (!in_array($type, array('direct', 'topic', 'headers', 'fanout'))) {
            throw new AMQPProtocolException(1, 'Not support type exchange '.$type);
        }

        $this->channel->exchange_declare($this->getExchange($queueName), $this->getTypeExchange($this->getExchange($queueName)), false, true, false);
        $this->channel->queue_bind($queueName, $this->getExchange($queueName));

        $this->_declaredBindsByQueue[$queueName] = true;
    }

    /**
     * @return $this
     */
    public function unsubscribe()
    {
        if ($this->channel) {
            $this->channel->basic_cancel('');
        }

        return $this;
    }

    /**
     * @param \PhpAmqpLib\Message\AMQPMessage $message
     */
    public function callback($message)
    {
        $msg = [];
        $msg['body'] = $message->body;
        $msg['headers'] = $message->get_properties();
        $msg['message'] = $message;

        if (!empty($msg['headers']['application_headers'])) {
            $msg['headers'] = array_merge($msg['headers'], $msg['headers']['application_headers']->getNativeData());
            unset($msg['headers']['application_headers']);
        }

        call_user_func($this->getCallback(), $msg);
    }

    /**
     * Подтверждение прочтения сообщения
     *
     * @param array $message
     *
     * @return boolean
     */
    public function ack($message)
    {
        $returnValue = false;

        if (!empty($message['message'])) {

            $message['message']->delivery_info['channel']->basic_ack($message['message']->delivery_info['delivery_tag']);
            $returnValue = true;

        }

        return $returnValue;
    }

    /**
     * Отказ от прочтения сообщения
     *
     * @param array $message
     *
     * @return boolean
     */
    public function nack($message)
    {
        $returnValue = false;

        if (!empty($message['message'])) {
            $message['message']->delivery_info['channel']->basic_nack($message['message']->delivery_info['delivery_tag']);
            $returnValue = true;

        }

        return $returnValue;
    }

    /**
     * Закрытие канала и соединения с MQ
     *
     * @return $this
     */
    public function close()
    {
        if ($this->channel || $this->connection) {
            $this->channel->close();
            $this->connection->close();
            $this->channel = null;
            $this->connection = null;
        }

        return $this;
    }

    public function getExchange(string $queue = '')
    {
        if (empty($this->exchange)) {
            return $queue.'-exchange';
        }

        return $this->exchange;
    }

    public function getTypeExchange(string $exchange = '')
    {
        $typeExchange = 'direct';
        if (strpos($exchange, 'fanout') >= 0) {
            $typeExchange = 'fanout';
        }
        return $typeExchange;
    }

    /**
     * @return string
     */
    public function getHost()
    {
        return $this->host;
    }

    /**
     * @return int
     */
    public function getPort()
    {
        return $this->port;
    }

    /**
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    public function getVhost()
    {
        return $this->vhost;
    }
    protected static $_singletonInstance;
    public static function getMe(string $host, int $port , string $login = '', string $pass = '', string $vhost = '/',string $exchange = ''): BrokerAmqp
    {
        $connstring = $host.$port.$login.$pass.$vhost.$exchange;
        $class = get_called_class();
        if (empty(self::$_singletonInstance[$connstring])) {
            self::$_singletonInstance[$connstring] = new $class($host,$port, $login, $pass, $vhost,$exchange);
        }
        return self::$_singletonInstance[$connstring];
    }
}

