<?php

namespace App\Http\Controllers;

use App\Service;
use Illuminate;
use App\Service\Ispk;

class ConfirmInputController extends Base {

    const DEFAUL_SMS_CONFIRM_TEMPLATE = 'Для подтверждения номера введите код: {code}';
    const DEFAUL_EMAIL_CONFIRM_TEMPLATE = 'Пароль для подтверждения участия в голосовании: {code}. Никому не сообщайте пароль.';
    const DEFAUL_CONFIRM_ATTEMPTS_LIMIT = 3;

    protected $config = false;
    protected $errorMaps = [
        1 => 'Пользователь не передан',
        2 => 'Некорректная система',
        3 => 'Доступ запрещен для данной системы',
        4 => 'Метод не поддерживается',
        5 => 'Пользователь не найден',
        6 => 'Техническая ошибка в работе сервиса',
        7 => 'Не передано значение поля для валидации',
        8 => 'Некорректный код',
        9 => 'Код не найден, пройдите процесс подтверждения заново',
        10 => 'Некорректный код. Осталось попыток ввода: %d',
        11 => 'Время ожидания истекло, пройдите процесс подтверждения заново',
        12 => 'Действие не разрешено',
        13 => 'Не найден телефон или email пользователя',
        14 => 'Некорректный код. Исчерпано количество попыток ввода или закончилось время ожидания. Запросите новый код подтверждения.'
    ];
    protected $key = 'cfm|';
    protected $result = [];
    protected $user = [];
    protected $force = false; //флаг генерации нового значения несмотря ниначто
    protected $error = false;
    protected $form;
    protected $logArmId = 0; //логировать ли в АРМ председателя

    private $_cache;
    /** @var Service\Logging\ArmMgikLogger */
    private $_armMgikLogger;

    public function __construct(Illuminate\Http\Request $request, Illuminate\Http\Response $response, Service\User $userService, Service\Cache $service)
    {
        parent::__construct($request, $response);
        $this->_armMgikLogger = app()['arm_mgik_logger'];
        $this->_cache = $service;
        $this->_userService = $userService;
        $this->user = $this->_userService->getUserInLegacyFormat($this->_request->session());
        $this->config = new Service\Config\FileConfig('ConfirmEmailAndSms');
        $this->logArmId = env('MGIK_VOTING_ID', 1); //получили разрешение слать лог в АРМ
        $this->result = [
            'error' => 0,
            'errorCode' => 0,
            'errorMessage' => '',
            'result' => [],
            'date' => date(\DateTime::W3C),
            'actual' => true
        ];
    }

    public function handle($action)
    {
        $system      = 'mpgu'; //self::getSystem();
        $this->force = true; //self::isForce();

//        if (empty($system) || !array_key_exists($system, $this->config->get('systemAllow', []))) {
//            return $this->returnError(2);
//        }


        $org_id = $this->_request->input('org_id') ?? null;
        $form_id = $this->_request->input('form_id') ?? null;
        $this->form = null; //ParamForm::getParamForm($org_id, $form_id)[0] ?? null;

        $sso = $this->user['SUDIR_ID'];
        if (empty($sso)) {
            return $this->returnError(5);
        }

        $_REQUEST['code'] = isset($_REQUEST['code']) ?trim($_REQUEST['code']) : '';
        $code = (int) $_REQUEST['code'];
        if (!empty($_REQUEST['code']) && (mb_strlen($_REQUEST['code']) != 5 || empty($code))) {
            return $this->returnError(8);
        }

        $this->result['logData']['action'] = $action;
        $this->result['logData']['system'] = $system;

        if ($action == 'phone') {
            $action = 'sms';
        }

        if (!in_array($action, ['sms', 'email'])) {
            return $this->returnError(4);
        }

        $value = $_REQUEST['value'] ?? null;
        $formId = "$org_id/$form_id";
        $allow = $this->config->get("confirm/$action/allowFromClient", []);

        if (! ($value && in_array($formId, $allow))) {
            $value = null;

            if ($action === 'sms') {
                $value = !empty($this->user['TELEPHONE']) ? $this->user['TELEPHONE'] : null;
            } elseif ($action === 'email') {
                $value = !empty($this->user['EMAIL']) ? $this->user['EMAIL'] : null;
            }
        }

        if (! $value) {
            return $this->returnError(13);
        }

        if ($code) {
            $updateValue = isset($_REQUEST['updateValue']) ? $_REQUEST['updateValue'] : true;
            $result = $this->checkCode($sso, $value, $code, $action, $updateValue);
        } else if (! empty($_REQUEST['updateConfirmed'])) {
            $result = $this->updateConfirmed($sso, $value, $action);
            if ($this->logArmId) {
                $this->_armMgikLogger->info('Сохранение после подтверждения',['action'=>'form_sms_update','value'=>$value,'method'=>$action,'ssoId'=>$sso,'voitingId'=>$this->logArmId,'sessId'=>session_id()]);
            }
        } else {
            $result = $this->sendCode($sso, $value, $action);
            if ($this->logArmId) {
                $this->_armMgikLogger->info('Отправлен код',['action'=>'form_sms_send','value'=>$value,'method'=>$action,'ssoId'=>$sso,'voitingId'=>$this->logArmId,'sessId'=>session_id()]);
            }
        }

        if ($this->error) {
            return $result;
        } else {
            $this->result['result'] = $result;
        }
        return json_encode($this->result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public function sendCode($sso, $value, $type)
    {
        $this->key .= $type.'|'.$sso;
        $life = $this->config->get('confirm/'.$type.'/life', 600);
        $retreat = $this->config->get('confirm/'.$type.'/retreat', 60);

        if (!$this->force) {
            $oldCode = Service\Cache::getArray($this->key);

            if (!empty($oldCode)) {

                if ($oldCode['value'] == $value && time() < $oldCode['time']) {
                    $int = $oldCode['time'] - time() - $life + $retreat;

                    $data = [
                        'retreat' => $int,
                        'life' => $oldCode['time'] - time(),
                        'lifeText' => $this->config->get('confirm/'.$type.'/lifeText')
                    ];
                    if ($this->config->get('debug', false)) {
                        $data['code'] = $oldCode['code'];
                    }
                    return $data;
                }
            }
        }

        $code = $this->generateCode();

        Service\Cache::setArray($this->key, [
            'code' => $code,
            'value' => $value,
            'time' => time() + $life,
            'confirmed' => false,
            'attempt' => 0
        ], $life);

        switch ($type) {
            case 'sms':
                $template = $this->config->get('confirm/'.$type.'/template', self::DEFAUL_SMS_CONFIRM_TEMPLATE);
                $body = str_replace(['{code}'], [$code], $template);

                if (!empty($body)) {
                    $result = Service\Sms::send($value, $body, 'CONFIRM');
                }

                break;

            case 'email':
                $template = env('EMAIL_CONFIRM_TEMPLATE') ?: self::DEFAUL_EMAIL_CONFIRM_TEMPLATE;
                $body = str_replace(['{code}'], [$code], $template);

                if (!empty($body)) {
                    $mailConf = Service\Config\PoolConfig::me()->get('Ispk');
                    $fromEmail = $mailConf->get('from_address');
                    $fromName = $mailConf->get('from_name');
                    $result = (new Ispk($mailConf))->sendEmail(
                        $this->user["PGU_USER_ID"], "Подтверждение участия в общероссийском голосовании", [
                        'email' => $value,
                        'name' => "Подтверждение почтового адреса"], [
                        'email' => $fromEmail,
                        'name' => $fromName], $body, [
                        'code' => '10',
                        'desc' => 'Подтверждение почтового адреса',
                        'text' => ''], [
                        'id' => '',
                        'name' => ''], \lib::create_guid(), '', $sso, '',''
                    );
                }

                break;
        }

        $data = [
            'retreat' => $retreat,
            'life' => $life,
            'lifeText' => $this->config->get('confirm/'.$type.'/lifeText')
        ];

        if ($this->config->get('debug', false)) {
            $data['code'] = $code;
        }

        return $data;
    }

    public function checkCode($sso, $value, $code, $type, $updateValue = true)
    {
        $this->key .= $type.'|'.$sso;
        $oldCode = Service\Cache::getArray($this->key);

        if (!empty($oldCode)) {
            if ($oldCode['time'] < time()) {
                return $this->returnError(11);
            }
            if ($code != $oldCode['code']) {
                $oldCode['attempt'] += 1;
                $limit = $this->config->get('confirm/'.$type.'/tryCount', self::DEFAUL_CONFIRM_ATTEMPTS_LIMIT);
                $left = $limit - $oldCode['attempt'];

                if ($oldCode['attempt'] >= $limit) {
                    Service\Cache::delete($this->key);
                    if ($this->logArmId) {
                        $this->_armMgikLogger->info('Код не подтверждён',['action'=>'form_sms_unsuccess_limit','value'=>$value,'method'=>$type,'ssoId'=>$sso,'voitingId'=>$this->logArmId,'sessId'=>session_id()]);
                    }
                    return $this->returnError(14);
                }
                if ($this->logArmId) {
                    $this->_armMgikLogger->info('Код не подтверждён',['action'=>'form_sms_unsuccess','value'=>$value,'method'=>$type,'ssoId'=>$sso,'voitingId'=>$this->logArmId,'sessId'=>session_id()]);
                }
                Service\Cache::setArray($this->key, $oldCode);

                return $this->returnError(10, [$left]);
            }

            if ($oldCode['value'] == $value && $code == $oldCode['code']) {
                Service\Cache::set("$type|confirmed|$sso", true, 1800);

                if ($updateValue) {
                    $result = $this->saveData($sso, $type, $value);
                    Service\Cache::delete($this->key);
                } else {
                    $result = [
                        'code' => 'CONFIRMED',
                        'message' => 'Код подтверждён. Данные не сохранены',
                    ];
                    if ($this->logArmId) {
                        $this->_armMgikLogger->info('Код подтверждён',['action'=>'form_sms_success','value'=>$value,'method'=>$type,'ssoId'=>$sso,'voitingId'=>$this->logArmId,'sessId'=>session_id()]);
                    }

                    // Продлеваем время жизни подтверждённого кеша.
                    $life = $this->config->get('confirm/'.$type.'/life', 600);
                    $oldCode['confirmed'] = true;
                    $oldCode['time'] = time() + $life;

                    Service\Cache::setArray($this->key, [
                        'code' => $oldCode['code'],
                        'value' => $oldCode['value'],
                        'time' => time() + $life,
                        'confirmed' => true,
                    ], $life);
                }
            } else {
                Service\Cache::delete($this->key);

                return $this->returnError(11);
            }

            return $result;
        } else {
            return $this->returnError(9);
        }

        return $this->returnError(9);
    }

    public function updateConfirmed($sso, $value, $type)
    {
        $this->key .= $type.'|'.$sso;
        $oldCode = Service\Cache::getArray($this->key);

        if (!empty($oldCode)) {
            if (! $oldCode['confirmed']) {
                return $this->returnError(12);
            }

            if ($oldCode['value'] == $value && $oldCode['confirmed']) {
                $result = $this->saveData($sso, $type, $value);
                Service\Cache::delete($this->key);
            } else {
                Service\Cache::delete($this->key);
                return $this->returnError(11);
            }

            return $result;
        } else {
            return $this->returnError(9);
        }

        return $this->returnError(9);
    }

    private function generateCode()
    {
        return random_int(10000, 99999);
    }

    private function returnError($code, $vars = [], $debugMessage = '')
    {
        $this->error = true;
        $this->result['error'] = 1;
        $this->result['errorCode'] = $code;

        if (isset($this->errorMaps[$code])) {
            $this->result['errorMessage'] = $this->errorMaps[$code];
        } else {
            $this->result['errorMessage'] = 'Произошла непредвиденная ошибка';
        }

        if ($vars) {
            $this->result['errorMessage'] = vsprintf($this->result['errorMessage'], $vars);
        }

        $this->result['headerSended'] = true;
        $this->_response->setStatusCode(403);

        if (!empty($debugMessage) && $this->config->get('debug', false)) {
            $this->result['debug'] = $debugMessage;
        }

        return response()->json($this->result, 403);
    }

    private function returnSuccess($resultField)
    {
        $result = [
            'error' => 0,
            'errorCode' => 0,
            'errorMessage' => '',
            'result' => $resultField,
            'date' => date(DATE_W3C),
            'actual' => true,
        ];

        return $result;
    }

    /**
     * Сохраняет даные в НЛК.
     */
    private function saveData($sso, $type, $value) {
        $lk = new ProfileLk();
        $lkData = [
            'code' => 'REG_DATA',
            'data' => []
        ];
        switch ($type) {
            case 'email':
                $lkData['data']['EMAIL'] = $value;
                break;
            case 'sms':
                $lkData['data']['PHONE_MP'] = $value;
                break;
        }
        list($result, $error) = $lk->set($sso, $lkData, true);

        return $result;
    }
}