<?php

namespace App\Service\Broker;

trait BrokerTrait
{
    /**
     * @var BrokerAmqp
     */
    protected $broker = null;

    /**
     * @param BrokerAmqp $broker
     *
     * @return $this
     */
    public function setBroker($broker)
    {
        $this->broker = $broker;

        return $this;
    }

    /**
     * @return BrokerAmqp
     */
    public function getBroker()
    {
        return $this->broker;
    }

    /**
     * Подписка на очередь
     *
     * @param string $queue
     * @param int $prefetchCount
     *
     * @return $this
     */
    public function subscribe($queue, $prefetchCount=1)
    {
        $this->getBroker()->subscribe($queue, $prefetchCount);

        return $this;
    }

    /**
     * Отписка от очереди
     *
     * @return $this
     */
    public function unsubscribe()
    {
        $this->getBroker()->unsubscribe()->close();

        return $this;
    }
}