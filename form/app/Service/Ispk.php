<?php

namespace App\Service;

/*
 * Класс для универсализации подключения к испк
 */
use App\Service\Config\PoolConfig;
use App\Service\Config\FileConfig;
use App\Service\Ispk\IspkUser;
use App\Service\Task\TaskManager;

//require_once(\params::$params['common_data_server']['value'].'module/client/bti.interface.php');
//
require_once(__DIR__ .'/Ispk/mail.php');

class Ispk
{
    protected $ispkConf;

    function __construct(FileConfig $config = null)
    {
        if (!empty($config)) $this->ispkConf = $config;
        else $this->ispkConf = PoolConfig::me()->get('Ispk');
    }

    public function getSubscribe($data = array(), $ssoid = null)
    {



        $filter      = array();
        $allowFields = ['msisdn', 'stream', 'service'];
        foreach ($allowFields as $field) {
            if (isset($data[$field])) {
                $filter[] = $field.':'.$data[$field];
            }
        }

        if (isset($data['options'])) {
            foreach ($data['options'] as $key=>$field) {
                if (!empty($field)) {
                    $filter[] = 'options.'.$key.':'.$field;
                }
            }
        }

        //TODO должна будет нужна поддержка фильтра по параметрам
        //$data['token'] = $this->ispkConf->get("connstring/token");
        $data = http_build_query(array('q' => implode(',', $filter)));
         $ch = curl_init($this->ispkConf->get("connstring/subscribe").'list?'.$data);
        //curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            //'Accept: application/json',
            'x-auth-token: '.$this->ispkConf->get("connstring/token"),
        ));


        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->ispkConf->get("connstring/timeout", 5));
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $this->ispkConf->get("connstring/timeout", 5) + 15);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        $response = curl_exec($ch);

        if (!curl_errno($ch)) {
            switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
                case 200:
                    $response = (array) json_decode($response);

                    if ($response["errorCode"] == 0) {
                        $result  = (array)$response['result'];
                        foreach ($result as $key=>$array){
                            if (empty($array)) unset($result[$key]);
                        }
                        $message = '';
                    } else {
                        $http_code = $response["errorCode"];
                        $result    = false;
                        $message   = $response["errorMessage"];
                    }

                    break;
                default:
                    $result  = false;
                    $message = 'Ошибка в работе сервиса';
                    break;
            }
        } else {
            $result  = false;
            $message = 'Ошибка curl: '.curl_error($ch);
        }
        if ($ch) {
            curl_close($ch);
        }
        $this->sendLog('Получение подписки', array('error' => $result ? 0 : 1, 'ssoid' => $ssoid, 'action' => 'getSubscribe', 'stream_type' => $data['stream'], 'errorCode' => $http_code, 'errorMessage' => $message, 'response' => $response, 'request' => $data));

        return array($result, $message);
    }

    public function addSubscribe($data, $ssoid = null,$log_data=array())
    {
        $ch   = curl_init($this->ispkConf->get("connstring/subscribe").'item');
        //$data['token']=$this->ispkConf->get("connstring/token");
        curl_setopt($ch, CURLOPT_POST, 1);
        $data = json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
            'x-auth-token: '.$this->ispkConf->get("connstring/token"),
            'Content-Type: application/json; charset=utf-8',
            'Content-Length: '.mb_strlen($data)
        ));

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->ispkConf->get("connstring/timeout", 5));
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $this->ispkConf->get("connstring/timeout", 5) + 15);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        $response = curl_exec($ch);

        if (!curl_errno($ch)) {
            switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
                case 200:
                    $response = (array) json_decode($response);

                    if ($response["errorCode"] == 0) {
                        $result  = $response['result'];
                        $message = '';
                    } else {
                        $http_code = $response["errorCode"];
                        $result    = false;
                        $message   = $response["errorMessage"];
                    }

                    break;
                default:
                    $result  = false;
                    $message = 'Ошибка в работе сервиса';
                    break;
            }
        } else {
            $result  = false;
            $message = 'Ошибка curl: '.curl_error($ch);
        }
        if ($ch) {
            curl_close($ch);
        }
        $this->sendLog('Создание подписки', array_merge($log_data,array('error' => $result ? 0 : 1, 'ssoid' => $ssoid, 'action' => 'addSubscribe', 'stream_type' => $data['stream'], 'errorCode' => $http_code, 'errorMessage' => $message, 'response' => $response, 'request' => $data)));
        return array($result, $message);
    }

    public function handle($action, $form)
    {
        $result = [
            'error' => false,
            'errorMessage' => '',
            'data' => ''
        ];
        $data   = $_POST['items'];

        if (empty($data['systemArr'])) {
            $result['error']        = true;
            $result['errorMessage'] = 'Выберите хотя бы один вид коммуникации с Вами.';
        }
        if (empty($data['eno'])) {
            $result['error']        = true;
            $result['errorMessage'] = 'Не переданы номера заявлений';
        }
        require_once(\params::$params['common_data_server']['value'].'include/user.class.php');
        $usert  = \User::get_current_client();
        $userId = false;
        if (!$usert || !$userId = $usert['PGU_USER_ID']) {
            $result['error']        = true;
            $result['errorMessage'] = 'Не верный пользователь';
        }


        if (!$result['error']) switch ($action) {
                case 'add':
                    $i = 0;
                    foreach ($data['systemArr'] as $system) {
                        foreach ($data['eno'] as $eno) {
                            $request  = [
                                "msisdn" => '7'.$usert['TELEPHONE'],
                                "email" => $usert['EMAIL'],
                                "stream" => $this->ispkConf->get('StreamType/'.$system, 'sms'),
                                "service" => $this->ispkConf->get('EventType/'.$system, 'status_viber'),
                                "options" => ["eno" => $eno, "userId" => $usert['PGU_USER_ID'],'form_id'=>$data['form_id'],'org_id'=>$data['org_id']]
                            ];

                            $response = $this->addSubscribe($request, $usert['SUDIR_ID'],array('form_id'=>$data['form_id'],'org_id'=>$data['org_id']));
                            if ($response[0]) {
                                $i++; //успех
                            } else {
                                $result['error']        = true;
                                $result['errorMessage'] = $response[1];
                                break;
                                break;
                            }
                        }
                    }
                    $result['data']         = 'Успешно подписан на следующее количество подписок: '.$i.' ';
                    break;
                default:
                    $result['error']        = true;
                    $result['errorMessage'] = 'Неправильные параметры для вызова метода';
                    break;
            }
        return utf8_json_encode($result);
    }

    //функция постановки отправки сообщения до испк
    public function sendViber($to, $options = array(), $ignoreException = false)
    {

        try {

            $to = preg_replace("/\(\)\-/", "", $to);
            if (empty($to)) {
                throw new \Exception('Не возможно доставить адресату с пустым телефоном', 1);
            }
            $to      = '7'.$to;
            $request = array(
                "access_token" => $this->ispkConf->get('connstring/access_token', ''),
                "event_code" => $this->ispkConf->get('EventType/viber', 'status_viber'),
                "stream_type" => $this->ispkConf->get('StreamType/viber', 'sms'),
                "to" => $to,
                "data" => $options
            );
            //TODO проверить, что человек подписан на этот ено
            list($subsribe,$result) = $this->getSubscribe(array('msisdn' => $to, 'stream' => $request['stream_type'], 'service' => $request['event_code'], 'options' => array('eno' => $options['eno'])));
            if (empty($subsribe)) {
                //не отправляем ничего, подписки нет.
                return false;
            }
            $data = json_encode($request,JSON_UNESCAPED_UNICODE);

            $data =str_replace('&quot;','',$data);
            $data =str_replace("'",'',$data);
            $data =htmlspecialchars_decode($data);
            $request = json_decode($data,true);

            $userId = $request['data']['userId'];
            $messId = $request['data']['messageId'];
            unset($request['data']['userId']);
            unset($request['data']['messageId']);

            $taskNumber = $this->enqueueMessage($request, $userId, $messId);

            $this->sendLog('Создали сообщение', array('form_id'=>$options['form_id'],'org_id'=>$options['org_id'],'error' => 0, 'TaskNumber' => $taskNumber,'message_id'=>$messId,'to'=>$to, 'action' => 'create', 'event_code' => $request['event_code'],'stream_type' => $request['stream_type'], 'request' => $data));
        } catch (\Exception $e) {

            $this->sendLog($e->getMessage(), array('error' => 1, 'errorCode' => $e->getCode(),'message_id'=>$messId,'to'=>$to, 'action' => 'create', 'event_code' => $request['event_code'],'stream_type' => $request['stream_type'], 'errorMessage' => $e->getMessage(), 'request' => json_encode(array('to' => $to, 'options' => $options), JSON_UNESCAPED_UNICODE)));
            if (!$ignoreException) throw $e;
        }
        return $taskNumber;
    }

    /**
     * функция постановки отправки email до испк
     *
     * @param int    $userId
     * @param string $subject
     * @param array  $to   ['email' => 'example@example.ru', 'name' => 'example name']
     * @param array  $from ['email' => 'example@example.ru', 'name' => 'example name']
     * @param string $message
     * @param array  $status ['code' => '', 'desc' => '', 'text' => '']
     * @param array  $form ['id' => '', 'name' => '']
     * @param string $extId
     * @param string $eno
     * @param string $ssoId
     * @param string $corpid
     * @param string $phone
     *
     * @return bool|string false - успех
     */
    public function sendEmail($userId, $subject, array $to, array $from, $message, array $status, array $form, $extId,$eno=false,$ssoId=false,$corpId=false,$phone=false)
    {
        $result = null;

        try {
            $requestData = array(
                'access_token' => $this->ispkConf->get('connstring/access_token', ''),
                'event_code' => '2020og',
                'event_id' => $extId,
                'date_time' => time(),
                'to'   => array(
                    'email' => $to['email'],
                ),
                'data' => array(
                    'subject' => $subject,
                    'message' => \Mail::convertMessage($message, array('dontWrapWithHtmlTag' => true)),
                )
            );

            if ($phone) {
                $requestData['to']['msisdn'] = '7' . $phone;
            }

            if ($eno) {
                $requestData['data']['eno'] = $eno;
            }

            $result = $this->enqueueMessage($requestData, $userId, $extId, 'ispk2Send');

            $this->info('Положили письмо в TaskManager', array(
                'corp_id'   =>  $corpId,
                'form_id'    => $form['id'],
                'result'     => $result,
                'message_id' => $extId,
                'to'         => $to['email'],
                'eno'        => $eno,
                'action'     => 'sendEmail',
                'event_code' => $requestData['event_code'],
                'request'    => json_encode($requestData, JSON_UNESCAPED_UNICODE)
            ));
        } catch (\Exception $e) {
            $this->critical($e->getMessage(), array(
                'form_id'    => $form['id'],
                'message_id'=>$extId,
                'to'=>$to['email'],
                'eno'=>$eno,
                'action' => 'sendEmail',
                'event_code' => $requestData['event_code'],
                'errorCode' => $e->getCode(),
                'errorMessage' => $e->getMessage(),
                'request' => json_encode($requestData, JSON_UNESCAPED_UNICODE)
            ));
        }

        return $result; // false - успех
    }

    /**
     * Функция постановки отправки email до испк.
     * В отличии от sendEmail содержит упрощённый набор атрибутов.
     *
     * @param int $userId
     * @param string $to
     * @param string $subject
     * @param string $message
     * @param string $extId
     *
     * @return bool|string false - успех
     */
    public function sendServiceMessage($userId, $to, $subject, $message, $extId)
    {
        try {
            $requestData = array(
                "access_token"=> $this->ispkConf->get('connstring/access_token', ''),
                "event_code"  => $this->ispkConf->get('EventType/servicemessage', ''),
                "event_id"    => $extId,
                "date_time"   => time(),
                "to" => array(
                    'email' => $to,
                ),
                "data" => array(
                    'subject' => $subject,
                    'message' => \Mail::convertMessage($message, array('dontWrapWithHtmlTag' => true)),
                ),
            );

            $result = $this->enqueueMessage($requestData, $userId, $extId, 'ispk2Send');
            $this->info('Положили письмо в TaskManager', array(
                'result' => $result,
                'message_id' => $extId,
                'to' => $to,
                'action' => 'sendServiceMessage',
                'event_code' => $requestData['event_code'],
                'stream_type' => $requestData['stream_type'],
                'requestData' => json_encode($requestData, JSON_UNESCAPED_UNICODE),
            ));
        } catch (\Exception $e) {
            $this->critical($e->getMessage(), array(
                    'errorCode' => $e->getCode(),
                    'message_id' => $extId,
                    'to' => $to,
                    'action' => 'sendServiceMessage',
                    'event_code' => $requestData['event_code'],
                    'stream_type' => $requestData['stream_type'],
                    'errorMessage' => $e->getMessage(),
                    'requestData' => json_encode($requestData, JSON_UNESCAPED_UNICODE),
            ));
        }

        return $result; // false - успех
    }

    public function sendKotopes(IspkUser $user, $extId)
    {
        $request = array(
            "access_token"=> $this->ispkConf->get('connstring/access_token', ''),
            "event_code"  => $this->ispkConf->get('EventType/kotopes', 'pgu_kotopes'),
            "event_id"    => $extId,
            "date_time"   => time(),
            "to" => [
                "email" => $user->getEmail(),
//                "ssoid" => $user->getSsoid(), // отключил, тк в ИСПК не нашел ssoid "DIT2012@mos.ruUUID12345" и выдал ошибку "contact attr name not found: ssoid"
            ],
            "data" => [
                "Name_Patronymic"=> $user->getNamePatronymic()
            ]
        );

        try {
            $taskNumber = $this->enqueueMessage($request, $user->getPguUserId(), $extId, 'ispk2Send');
            $this->info('Положили в TaskManager', [
                'TaskNumber' => $taskNumber,
                'message_id' => $extId,
                'ssoid'      => $user->getSsoid(),
                'to'         => $user->getEmail(),
                'action'     => 'sendKotopes',
                'event_code' => $request['event_code'], //
                'request'    => json_encode($request, JSON_UNESCAPED_UNICODE)
            ]);
        } catch (\Exception $e) {
            $this->critical($e->getMessage(),
                [
                'errorCode' => $e->getCode(),
                'message_id'=> $extId,
                'ssoid'     => $user->getSsoid(),
                'to'        => $user->getEmail(),
                'action'    => 'sendKotopes',
                'event_code'  => $request['event_code'],
                'errorMessage'=> $e->getMessage(),
                'request'   => json_encode($request, JSON_UNESCAPED_UNICODE)
                ]
            );
        }

        return $taskNumber;
    }

    public function sendKruzhki(IspkUser $user, $extId, $dataToSend)
    {
        $taskNumber = null;

        if (
            array_key_exists('event_code', $dataToSend)
            && array_key_exists('user_io', $dataToSend)
            && array_key_exists('time', $dataToSend)
            && array_key_exists('place_service_address', $dataToSend)
            && array_key_exists('test', $dataToSend)
        ) {
            try {
                $requestData = array(
                    'user_io' => $dataToSend['user_io'],
                    'time' => $dataToSend['time'],
                    'place_service_address'=> $dataToSend['place_service_address'],
                    'test' => $dataToSend['test'],
                );
                if (array_key_exists('child_name', $dataToSend)) {
                    $requestData['child_name'] = $dataToSend['child_name'];
                }

                $configEventKey = 'EventType/' . $dataToSend['event_code'];
                $defaultEventCode = $dataToSend['event_code'];
                $eventCode = $this->ispkConf->get($configEventKey, $defaultEventCode);

                $request = array(
                    'access_token' => $this->ispkConf->get('connstring/access_token', ''),
                    'event_code'  => $eventCode,
                    'event_id' => $extId,
                    'date_time' => time(),
                    'to' => array(
                        'email' => $user->getEmail(),
                    ),
                    'data' => $requestData,
                );

                $taskNumber = $this->enqueueMessage($request, $user->getPguUserId(), $extId, 'ispk2Send');

                $this->info(
                    'Положили в TaskManager',
                    array(
                        'TaskNumber' => $taskNumber,
                        'message_id' => $extId,
                        'ssoid' => $user->getSsoid(),
                        'to' => $user->getEmail(),
                        'action' => 'sendKruzhki',
                        'event_code' => $eventCode,
                        'request' => json_encode($request, JSON_UNESCAPED_UNICODE)
                    )
                );
            } catch (\Exception $exception) {
                $this->critical(
                    $exception->getMessage(),
                    array(
                        'errorCode' => $exception->getCode(),
                        'message_id' => $extId,
                        'ssoid' => $user->getSsoid(),
                        'to' => $user->getEmail(),
                        'action' => 'sendKruzhki',
                        'event_code' => $eventCode,
                        'errorMessage' => $exception->getMessage(),
                        'request' => json_encode($request, JSON_UNESCAPED_UNICODE)
                    )
                );
            }
        } else {
            $this->warning(
                'Ispk: sendKruzhki. Necessary data is missing.',
                array(
                    'message_id' => $extId,
                    'ssoid' => $user->getSsoid(),
                    'to' => $user->getEmail(),
                    'dataToSend' => $dataToSend
                )
            );
        }

        return $taskNumber;
    }

    public function sendYP(IspkUser $user, $to, $eventCode, $extId)
    {
        $taskNumber = null;

        $eventCode = $this->ispkConf->get('EventType/' . $eventCode, null);
        if ($user && $to && $eventCode && $extId) {
            try {
                $delayTime = $this->ispkConf->get('EventData/' . $eventCode . '/DelayTime', 0);
                $startTime = time() + $delayTime;
                $request = array(
                    'access_token' => $this->ispkConf->get('connstring/access_token', ''),
                    'event_code'  => $eventCode,
                    'event_id' => $extId,
                    'date_time' => $startTime,
                    'to' => array(
                        'email' => $to,
                    ),
                );
                
                $taskNumber = $this->enqueueMessage($request, $user->getPguUserId(), $extId, 'ispk2Send', array(    'startTime' => $startTime,));
                
                $this->info(
                    'Положили в TaskManager',
                    array(
                        'TaskNumber' => $taskNumber,
                        'message_id' => $extId,
                        'ssoid' => $user->getSsoid(),
                        'to' => $to,
                        'action' => 'sendYP',
                        'event_code' => $eventCode,
                        'data' => array(
                            'delayTime' => $delayTime,
                            'startTime' => $startTime,
                        ),
                    )
                );
            } catch (\Exception $exception) {
                $this->critical(
                    $exception->getMessage(),
                    array(
                        'error' => 1,
                        'errorCode' => $exception->getCode(),
                        'errorMessage' => $exception->getMessage(),
                        'message_id' => $extId,
                        'to' => $to,
                        'event_code' => $eventCode,
                        'ssoid' => $user ? $user->getSsoid() : null,
                        'action' => 'sendYP',
                    )
                );
            }
        } else {
            $this->warning(
                'Неверные параметры.',
                array(
                    'error' => 1,
                    'errorCode' => 1,
                    'errorMessage' => 'Неверные параметры.',
                    'message_id' => $extId,
                    'to' => $to,
                    'event_code' => $eventCode,
                    'params' => array(
                        'user' => $user,
                    ),
                    'ssoid' => $user ? $user->getSsoid() : null,
                    'action' => 'sendYP',
                )
            );
        }

        return $taskNumber;
    }

    protected function enqueueMessage($data, $userId, $messageId, $plugin = 'ispkSend', $extParams = array())
    {
        $params = array('execute_now' => true, 'ext_id' => $messageId);
        if (! empty($extParams) && is_array($extParams)) {
            $params = array_merge($params, $extParams);
        }
        return TaskManager::queueTask($userId, $plugin, $data, $params);
    }

    //тупой метод доставки сообщения
    public function sendEvent($dataReq, $attemptNumber = 1, $taskNumber = 0,$extId='')
    {

        $ch = curl_init($this->ispkConf->get("connstring/send"));

        curl_setopt($ch, CURLOPT_POST, 1);
        $data = json_encode($dataReq);

        $data =htmlspecialchars_decode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);


        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
            'Content-Type: application/json; charset=utf-8',
            'Content-Length: '.mb_strlen($data)
        ));


        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->ispkConf->get("connstring/timeout", 5));
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $this->ispkConf->get("connstring/timeout", 5) + 15);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        $response = curl_exec($ch);

        if (!curl_errno($ch)) {
            switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
                case 200:
                    $response = (array) json_decode($response);

                    if ($response["errorCode"] == 0) {
                        $result  = true;
                        $message = 'Отправлено';
                    } else {
                        $result  = false;
                        $message = $response["errorMessage"];
                    }

                    break;
                default:
                    $result  = false;
                    $message = 'Ошибка в работе сервиса';
                    break;
            }
        } else {
            $result  = false;
            $message = 'Ошибка curl: '.curl_error($ch);
        }
        if ($ch) {
            curl_close($ch);
        }

        $eventCode = !empty($dataReq['event_code']) ? $dataReq['event_code'] : 'unknown';

        $this->sendLog(((!$result && $attemptNumber > $this->ispkConf->get('connstring/limit', 5)) ? "Достигнут лимит попыток. " : "").$message, array(
            'form_id' => $dataReq['data']['form_id'],
            'eno' => $dataReq['data']['eno'],
            'sso' => $dataReq['data']['sso'],
            'corp' => $dataReq['data']['corp'],
            'org_id' => $dataReq['data']['org_id'],
            'event_code' => $eventCode,
            'error' => 0,
            'action' => 'send',
            'to' => $dataReq['to'],
            'TaskNumber' => $taskNumber,
            'message_id' => $extId,
            'attemptNumber' => $attemptNumber,
            'url' => $this->ispkConf->get("connstring/send"),
            'errorMessage' => $message,
            'request' => $dataReq,
            'response' => $response));

        return array($result, $message);
    }

    public function sendLog($message, $data = array())
    {
        app()['log']->info($message, $data);
    }

    public function isOnSubscribe(array $formId)
    {
        return $this->ispkConf->get('sendStatus', false) && !empty(array_intersect($formId, array_keys($this->ispkConf->get('sendStatusService', array()))));
    }

    public function info($message, $data) {
        app()['log']->info($message, $data);
    }

    public function critical($message, $data) {
        app()['log']->error($message, $data);
    }

    /**
     * @return array
     */
    protected function getExtLogData()
    {
        return array(
            'controller' => 'ISPK',
            'pid' => posix_getpid(),
            'sess-id' => session_id(),
            'ServerName' => $_SERVER['SERVER_NAME'] ?? php_uname('n'),
            'server-time' => microtime(true),
            'ip' => \lib::clientIP()
        );
    }
}