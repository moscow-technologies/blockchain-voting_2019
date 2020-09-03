<?php

namespace App\Service;

class SwooleManager extends \SwooleTW\Http\Server\Manager {

    public function onWorkerStop() {
        app()['log']->info('Worker restart', ['type' => 'worker_restart']);
        \AMQPExchange::closeConnections();
    }

}