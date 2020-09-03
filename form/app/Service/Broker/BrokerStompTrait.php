<?php

namespace App\Service\Broker;

trait BrokerStompTrait
{
    /**
     * @var Broker
     */
    protected $broker = null;

    /**
     * @param Broker $broker
     *
     * @return $this
     */
    public function setBroker($broker)
    {
        $this->broker = $broker;

        return $this;
    }

    /**
     * @return Broker
     */
    public function getBroker()
    {
        return $this->broker;
    }

    /**
     * Подписка на очередь
     *
     * @param string $queue
     * @param array  $headers
     *
     * @return $this
     */
    public function subscribe($queue, $headers = array())
    {
        $this->getBroker()->subscribe($queue, $headers);

        return $this;
    }

    /**
     * @param bool $sendAck
     *
     * @return $this
     */
    public function wait($sendAck = true)
    {
        $this->getBroker()->wait($sendAck);

        return $this;
    }

    /**
     * Отписка от очереди
     *
     * @param string $queue
     *
     * @return $this
     */
    public function unsubscribe($queue)
    {
        $this->getBroker()->unsubscribe($queue);
        $this->getBroker()->close();

        return $this;
    }
}