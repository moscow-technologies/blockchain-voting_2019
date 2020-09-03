<?php

namespace App\Service\Broker;

use Stomp\Client;
use Stomp\Network\Connection;
use Stomp\StatefulStomp;
use Stomp\Transport\Message;
use Exception;
use params;

class Broker
{
    /**
     * @var \Stomp
     */
    private $stomp = null;

    /**
     * @var string Ошибка подключения
     */
    private $error = '';

    /**
     * @var int Время ожидания получения сообщений, в секундах
     */
    private $waitTime = 3600;

    /**
     * @var int Время сна при отсутствии сообщений в очереди, в секундах
     */
    private $sleepTime = 3;

    /**
     * @var array Обратный вызов для обработки полученного сообщения
     */
    private $callback;
    protected $persistent = null;
    protected $priority = null;
    protected $context, $queueType, $exchange;

    /**
     * @param string $uri
     * @param string $username
     * @param string $password
     */
    public function __construct(string $uri, string $username = '', string $password = '', string $vhost = null)
    {
        try {
            $client = new Client($uri);
            if ($username && $password) {
                $client->setLogin($username, $password);
            }

            if ($vhost) {
                $client->setVhostname($vhost);
            }
            //$client->getConnection()->setPersistentConnection(true);

            $client->setSync(false);
            $this->stomp = new StatefulStomp($client);
        } catch (Exception $e) {

            $this->error = $e->getMessage();
            unset($this->stomp);
            $this->stomp = null;
        }
    }

    public function __destruct()
    {
        if ($this->stomp && $this->stomp->getClient()->isConnected()) {
            $this->stomp->getClient()->disconnect();
        }
        $this->stomp = null;
    }

    /**
     * @return string|false
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * @param string $name
     * @param string $message
     * @param array  $headers
     * @return boolean
     */
    public function send($name, $message, $headers = array())
    {
        $returnValue = false;

        if ($this->stomp) {

            if (!is_null($this->priority)) {
                $headers['priority'] = $this->priority;
            }
            if (!is_null($this->persistent)) {
                $headers['persistent'] = $this->persistent ? 'true' : 'false';
            }
            if (!empty($this->queueType)) {
                $headers['x-queue-type'] = $this->queueType;
            }
            if (!empty($this->exchange)) {
                $headers['destination'] = "/exchange/{$this->exchange}";
            }

            try {
                $returnValue = $this->stomp->send($name, new Message($message, $headers));
            } catch (Exception $e) {

                $this->error = $e->getMessage();
                $returnValue = false;
            }
        }

        return $returnValue;
    }

    public function setPersistant(bool $persistant = true)
    {
        $this->persistent = $persistant;
        return $this;
    }

    public function setPriority(int $priority = 4)
    {
        $this->priority = $priority;
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

    public function setClientId(string $clientId)
    {
        if ($this->stomp) {
            $returnValue = $this->stomp->getClient()->setClientId($clientId);
        }
        return $this;
    }

    public function setContext($context)
    {
        $this->context = $context;
        return $this;
    }

    public function getContext()
    {
        return $this->context;
    }

    /**
     * @param string $name
     * @param array $headers
     * @param string $ack = 'client-individual' 'auto'
     * @return boolean
     */
    public function subscribe(string $name, array $headers = array(), string $ack = 'client', $selector = null)
    {
        $returnValue = false;

        //activemq требует activemq.prefetchSize=1 для получения только одного сообщения
        if (empty($headers['activemq.prefetchSize'])) {
            $headers['activemq.prefetchSize'] = 1;
        }

        //rabbitmq требует prefetch-count=1 для получения только одного сообщения
        if (empty($headers['prefetch-count'])) {
            $headers['prefetch-count'] = 1;
        }

        if (!empty($this->queueType)) {
            $headers['x-queue-type'] = $this->queueType;
        }
        if (!empty($this->exchange)) {
            $headers['destination'] = "/exchange/{$this->exchange}";
        }
        if ($this->stomp) {
            $returnValue = $this->stomp->subscribe($name, $selector, $ack, $headers);
        }

        return $returnValue;
    }

    /**
     * @param string $name
     * @param array $headers
     * @return boolean
     */
    public function unsubscribe($subscriptionId = null)
    {
        $returnValue = false;

        if ($this->stomp) {
            $returnValue = $this->stomp->unsubscribe($subscriptionId);
        }

        return $returnValue;
    }

    /**
     * @return boolean
     */
    public function hasMessage()
    {
        $returnValue = false;

        if ($this->stomp) {

            $returnValue = $this->stomp->getClient()->getConnection()->hasDataToRead();
        }

        return $returnValue;
    }

    /**
     * Прочитать сообщение вместе с заголовками
     *
     * @return \StompFrame|false
     */
    public function getFullMessage()
    {
        $returnValue = false;

        if ($this->stomp) {

            $returnValue = $this->stomp->read();
        }

        return $returnValue;
    }

    public function sendAlive($timeout = 1.0)
    {
        if ($this->stomp && $this->stomp->getClient()->isConnected()) {
            $this->stomp->getClient()->getConnection()->sendAlive($timeout);
        }
    }

    /**
     * @param bool $sendAck
     *
     * @return $this
     */
    public function wait($sendAck = true): Broker
    {
        $nowReadTimeout = $this->getReadTimeout();
        if ($nowReadTimeout[0] === 0 && $nowReadTimeout[1] === 0) {
            $alive = 10;
            $this->setReadTimeout($alive);
        } else {
            $alive = ceil($nowReadTimeout[0]);
            if ($alive === 0) {
                $alive = 1;
            }
        }
        $time = time() + $this->getWaitTime();
        while (time() <= $time) {
            $i = 0;
            while ($frame = $this->getFullMessage()) {

                if ($frame) {
                    $i++;
                    $context = $this->getContext();
                    $callback = $this->getCallback();
                    $result = $callback($frame->getBody(), $frame->getHeaders(), $context);
                    $this->setContext($context);
                    if ($sendAck && $result) {
                        $this->ack($frame);
                    }
//                    else {
//                        $this->nack($frame);
//                    }
                }
            }
            if ($i === 0) {
                $this->sendAlive($alive);
            }
        }

        //
        return $this;
    }

    /**
     * Прочитать только тело сообщения
     *
     * @param bool $sendAck Подтверждения прочтения
     * @return string|false
     */
    public function getBodyMessage($sendAck = true)
    {
        $returnValue = false;
        $frame = $this->getFullMessage();

        if ($frame) {
            $returnValue = $frame->getBody();

            if ($sendAck) {
                $this->ack($frame);
            }
        }

        return $returnValue;
    }

    /**
     * Подтверждение прочтения сообщения
     *
     * @param \StompFrame $frame
     * @return boolean
     */
    public function ack($frame)
    {
        $returnValue = false;

        if ($this->stomp) {
            $returnValue = $this->stomp->ack($frame);
        }

        return $returnValue;
    }

    public function begin()
    {
        if ($this->stomp) {
            $this->stomp->begin();
        }
    }

    /**
     * Commit current transaction.
     *
     * @return void
     */
    public function commit()
    {
        if ($this->stomp) {
            $this->stomp->commit();
        }
    }

    /**
     * Abort current transaction.
     *
     * @return void
     */
    public function abort()
    {
        if ($this->stomp) {
            $this->stomp->abort();
        }
    }

    /**
     * Подтверждение прочтения сообщения
     *
     * @param \StompFrame $frame
     * @return boolean
     */
    public function nack($frame)
    {
        $returnValue = false;

        if ($this->stomp) {
            $returnValue = $this->stomp->nack($frame);
        }

        return $returnValue;
    }

    /**
     * @return $this
     */
    public function close()
    {
        unset($this->stomp);
        $this->stomp = null;

        return $this;
    }

    public function setReadTimeout(int $seconds, int $microseconds = 0): Broker
    {

        if ($this->stomp) {
            $this->stomp->getClient()->getConnection()->setReadTimeout($seconds, $microseconds);
        }
        return $this;
    }

    public function getReadTimeout(): array
    {

        if ($this->stomp) {
            return $this->stomp->getClient()->getConnection()->getReadTimeout();
        }
        return [0, 0];
    }

    public function getStatusConnection(): bool
    {

        if ($this->stomp) {
            return $this->stomp->getClient()->getConnection()->isConnected();
        }
        return false;
    }

    /**
     * @return int
     */
    public function getWaitTime()
    {
        return $this->waitTime;
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

    /**
     * @return int
     */
    public function getSleepTime()
    {
        return $this->sleepTime;
    }

    /**
     * @param int $sleepTime
     *
     * @return $this
     */
    public function setSleepTime($sleepTime)
    {
        $this->sleepTime = $sleepTime;

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
    protected static $_singletonInstance;

    public static function getMe(string $connstring, string $login = '', string $pass = '', string $vhost = null): Broker
    {
        $class = get_called_class();
        if (empty(self::$_singletonInstance[$connstring])) {
            self::$_singletonInstance[$connstring] = new $class($connstring, $login, $pass, $vhost);
        }
        return self::$_singletonInstance[$connstring];
    }

    public static function getMeFromConf(array $config): Broker
    {
        $class = get_called_class();
        if (empty(self::$_singletonInstance[$config['connstring']])) {
            self::$_singletonInstance[$config['connstring']] = new $class($config['connstring'], $config['login'] ?? '', $config['pass'] ?? '', $config['vhost'] ?? null);
        }
        return self::$_singletonInstance[$config['connstring']];
    }
}