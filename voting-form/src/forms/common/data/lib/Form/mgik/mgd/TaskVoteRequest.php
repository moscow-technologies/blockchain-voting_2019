<?php

namespace Itb\Mpgu\Form\mgik\mgd;

use TaskManager;

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
        return $this->config['queue']['vote'];
    }

    /**
     * @return array
     */
    public function asArray()
    {
        $result = $this->fields;

        return $result;
    }
}