<?php

namespace App\Service\Task;

/**
 * Запрос отправки результаов голосования
 */
class TaskVoteRequest extends TaskRequest
{
    /**
     * @return string
     */
    public function queueName()
    {
       return $this->config['queue'].(!empty($this->app['voitingId'])?"-{$this->app['voitingId']}":'');
    }

    /**
     * @return array
     */
    public function asArray()
    {
        return $this->fields;
    }

    /**
     * @return array
     */
    public function asTaskData()
    {
        return [
            'eno' => $this->app['REG_NUM'] ?? null,
            'queue' => $this->queueName(),
            'json' => $this->asArray(),
        ];
    }

}