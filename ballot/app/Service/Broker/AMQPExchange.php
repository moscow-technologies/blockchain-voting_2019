<?php

/**
 * stub class representing AMQPExchange from pecl-amqp
 */

class AMQPExchange
{
    private const MAX_RETRY_COUNT = 5;

    protected $_options = null;

    /** @var \App\Service\Broker\BrokerAmqp */
    protected $broker = null;

    protected $queue;

    public static function closeConnections(): void {
        self::storeBroker(null);
    }

    /**
     * Publish a message to an exchange.
     *
     * Publish a message to the exchange represented by the AMQPExchange object.
     *
     * @param string  $message     The message to publish.
     * @param string  $routing_key The optional routing key to which to
     *                             publish to.
     * @param integer $flags       One or more of AMQP_MANDATORY and
     *                             AMQP_IMMEDIATE.
     * @param array   $attributes  One of content_type, content_encoding,
     *                             message_id, user_id, app_id, delivery_mode,
     *                             priority, timestamp, expiration, type
     *                             or reply_to, headers.
     *
     * @throws AMQPExchangeException   On failure.
     * @throws AMQPChannelException    If the channel is not open.
     * @throws AMQPConnectionException If the connection to the broker was lost.
     *
     * @return boolean TRUE on success or FALSE on failure.
     */
    public function publish(
        $message, $routing_key = null, $flags = AMQP_NOPARAM, array $attributes = array()
    )
    {
        for ($i = 0; $i < self::MAX_RETRY_COUNT; $i++) {
            try {
                $this->_broker()->send($this->queue, $message, $attributes);
                break;
            } catch (\Throwable $e) {
                $this->_broker()->close();
                app()['log']->error('Error', ['class' => get_class($e), 'type' => 'retry']);
                $this->_broker(true);
            }
        }
        return true;
    }

    // Its deliberate
    private static function storeBroker($broker): void {
        static $brokers = [];
        if ($broker === null) {
            foreach ($brokers as $broker) {
                $broker->close();
                unset($broker);
            }
            return;
        }
        $brokers[] = $broker;
    }

    public function setOptions($options){
        $this->_options = $options;
    }
     public function setQueue(string $queue){
        $this->queue = $queue;
    }

    private function _broker(bool $isForce = false) {
        if ($this->broker === null || $isForce) {
            $createBrokerProcess = \App\Service\ProcessDurationLogger::start('create broker');
            $this->broker = new \App\Service\Broker\BrokerAmqp(
                $this->_options['connstring']['host']??'localhost',
                $this->_options['connstring']['port']??'5672',
                $this->_options['connstring']['login']??'',
                $this->_options['connstring']['pass']??'',
                $this->_options['connstring']['vhost']??'/',
                $this->_options['connstring']['exchange']??''
            );
            $this->broker->setWaitTime(1);
            $this->broker->setQueueType($options['connstring']['queueType']??'');
            self::storeBroker($this->broker);
            \App\Service\ProcessDurationLogger::finish($createBrokerProcess);
        }
        return $this->broker;
    }
}