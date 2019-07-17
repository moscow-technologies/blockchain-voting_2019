<?php

namespace Itb\Mpgu\Form\mgik\mgd;

/**
 * Запрос отзыва заявления регистрации на выборы
 */
class TaskRevocationRequest extends TaskRequest
{
    /**
     * @return string
     */
    public function queueName()
    {
        return $this->config['queue']['revocation'];
    }

    /**
     * @return array
     */
    public function asArray()
    {
        $result = [];

        $result['message_type'] = '4';
        $result['rejection'] = [
            'reg_num' => $this->app['REG_NUM'],
            'sso' => $this->client['SUDIR_ID'],

        ];

        return $result;
    }
}