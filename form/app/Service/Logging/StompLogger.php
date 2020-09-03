<?php

namespace App\Service\Logging;

/**
 * Описание файла StompLogger
 *
 * @author Сорокин Константин Николаевич
 * @date 06.05.2020 18:53:34
 */
use Gelf\Transport\AbstractTransport;
use App\Service\Broker\Broker;
use Gelf\MessageInterface as Message;

class StompLogger extends AbstractTransport
{
    protected $connstring,$login,$pass,$queue,$exchange,$vhost;
    public function __construct(string $connstring, string $queue, string $exchange='',string $vhost=null, string $login = '', string $pass = '')
    {
        $this->connstring=$connstring;
        $this->login=$login;
        $this->pass=$pass;
        $this->queue=$queue;
        $this->vhost=$vhost;
        $this->exchange=$exchange;
    }

    public function send(Message $message)
    {
        $rawMessage = $this->getMessageEncoder()->encode($message);
        $headers = [];
        if ($this->exchange) {
            $headers['destination'] = '/exchange/'.$this->exchange;
        }
        $result = Broker::getMe($this->connstring, $this->login, $this->pass,$this->vhost)->send($this->queue, $rawMessage, $headers);
        return $result?1:0;
    }
}