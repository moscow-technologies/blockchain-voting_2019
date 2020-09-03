<?php

namespace App\Http\Controllers;

use App\Service\Config\PoolConfig;
use App\Service\Setting;

class Ajax extends Base {

    public function hit() {
        $hit = $this->_request->get('hit');
        $type = $this->_request->get('type');
        $data = json_decode($this->_request->get('value'), true);
        $guid = $data['guid'] ?? null;
        if (!$hit || !$type) {
            return $this->_jsonErrorResponse(3, 'Отсутствует один из обязательных параметров для метода hit');
        }
        $this->_logger->info($hit, ['data' => $data, 'action' => $type, 'errorMessage' => $hit, 'guid' => $guid]);
        return $this->_jsonSuccessResponse(['result' => 'success'], false);
    }

    public function reset() {
        $id = $this->_requestParam('id');
        $reset_cache = $this->_requestParam('reset-cache');
        $setting = [];
        if ($id && $reset_cache== PoolConfig::me()->get('My')->get('reset-cache')) {
            $setting = Setting::me()->getSettings($id, true);
        }
        if (count($setting)===0) {
            return $this->_jsonErrorResponse(3, ['text'=>'Переданы недостоверные данные для обновления, Ваш запрос залогирован']);
        }
        return $this->_jsonSuccessResponse($setting);
    }

    //http://ks.mgd.srvdev.ru/api/ajax/v1/service/update/
    //Запускает задачу по обновлению голосований
    public function update() {
        $reset_cache = $this->_requestParam('reset-cache');
        if ($reset_cache == PoolConfig::me()->get('My')->get('reset-cache')) {
            exec('nohup php '. resource_path() . '/task/update_dit_voting_settings.php release 1>/dev/null 2>/dev/null &');
            return $this->_jsonSuccessResponse(['text'=>'задача запущена nohup php '. resource_path() .'/tools/tasks/1m#update_dit_voting_settings.php release >> /www/logs/cron_runner_output.log 2> /dev/null &']);
        }
        return $this->_jsonErrorResponse(3, ['text'=>'Не обновлено']);
    }

    //http://ks.mgd.srvdev.ru/api/ajax/v1/service/lib/?reset-cache=123&ref=CIKRF
    //Запускает задачу по обновлению голосований
    public function lib() {
        $reset_cache =$this->_requestParam('reset-cache') ?? null;
        $ref = $this->_requestParam('ref') ?? null;
        return $this->_jsonSuccessResponse($this->_electionService->getDistrictDeputies($ref, null, $reset_cache == PoolConfig::me()->get('My')->get('reset-cache')));
    }
}