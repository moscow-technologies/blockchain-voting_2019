<?php

namespace App\Console\Commands;

use App\Service;
use Illuminate\Console\Command;

class ExportGuidDataFromStorageToRedis extends Command
{

    /** @var \Illuminate\Database\ConnectionInterface */
    private $_connection;

    /** @var Service\Guid */
    private $_guidService;

    public function __construct(Service\Guid $guidService) {
        parent::__construct();
        $this->_connection = \DB::connection();
        $this->_connection->disableQueryLog();
        $this->_guidService = $guidService;
    }

    protected $signature = "migrate:guid";
    protected $description = "Import guid data from postgres into redis";

    public function handle(): void
    {

        try {
            $guids = $this->_guidService->getGuids();
            foreach ($guids as $guid) {
                $lifeTo = $this->_timeStamp($guid['vote_end']) - time();
                $createTime = $this->_timeStamp($guid['created_at']);
                $finishTime = $this->_timeStamp($guid['vote_end']);
                Service\Cache::set('g|'.$guid['guid'], [
                    'id'     => $guid['vote_id'],
                    'extId'  => $guid['vote_ext_id'],
                    'okrug'  => $guid['district'],
                    'sessId' => $guid['session_id'],
                    'finishTime' => $finishTime,
                    'createTime' => $createTime,
                    'opened' => (int)$guid['opened'],
                ], $lifeTo);
            }
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    private function _timeStamp(string $date) {
        return (new \DateTime($date))->getTimestamp();
    }
}
