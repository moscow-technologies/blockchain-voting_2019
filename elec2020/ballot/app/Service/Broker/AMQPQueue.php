<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of AMQPQueue
 *
 * @author ksorokin
 */

define('AMQP_DURABLE', 2);
define('AMQP_NOPARAM', 0);

class AMQPQueue
{
    //put your code here
    protected $queue;
    public function __construct($queue)
    {
        $this->queue = $queue;
        
    }

    public function getFlags()
    {
        return 2;
    }

    public function getName(){
        return $this->queue;
    }
}