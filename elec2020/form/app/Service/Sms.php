<?php

namespace App\Service;

/*
 * Класс отправки смс
 */

class Sms
{
    protected static $config = false;
    /*
     * Отправка СМС
     * @param string $recipient Номер получателя
     * @param string $message Текст сообщения
     */
    //daemon -- наш смс демон, шлющий через гейт
    //service -- сервис смс, дергаем URL
    protected static $deliveryMode;   //daemon | service
    protected static $messageError;
    protected static $loggerPool;

    public static function send($phone, $message, $service = false,$requestId = false)
    {
        
        self::$config = new \App\Service\Config\FileConfig('Sms');
        self::$deliveryMode = self::$config->get('deliveryMode', 'service');
        $result = false;

        switch (self::$deliveryMode) {
            case 'emp':
                self::$messageError = 'Ok';
                $result = self::sendToEmp($phone, $message, $service,$requestId);
                break;
                default:
                    self::$messageError = 'Не поддерживаемый метод';
                    break;
        }
        $logData = array(
            'phone' => $phone,
            'sms' => $message,
            'service' => $service,
            'deliveryMode' => self::$deliveryMode,
            'messageId'=>$requestId
        );
        if (self::$messageError!='Ok') {
            $logData['error']=1;
            $logData['errorMessage']=self::$messageError;
        }
        
        self::sendLog(self::$messageError, $logData);
        return $result;
    }

    public static function sendToEmp($phone, $message, $service,$requestId=false)
    {
        list($recipient, $code) = self::preparePhone($phone);

        if (!$recipient || !$message) {
            self::$messageError = 'Не передан телефон или сообщение';
            return false;
        }


        if (mb_strlen($message) > 2000) {
            self::$messageError = 'Превышено ограничение 2000 по длине строки';
            return false;
        }
        $token = self::$config->get('service/'.$service.'/token');
        $source = self::$config->get('service/'.$service.'/tpl');
        if (!$token || !$source) {
            self::$messageError = 'Некорректная конфигурация '.$service.' по полям tpl и token';
            return false;
        }
        if (!$requestId) {
            $requestId = \lib::create_guid();
        }
        $request = array(
            'token' => $token,
            'msisdn' => $code.$recipient,
            'message' => $message,
            'source' => $source,
            'resource_id' => $requestId
        );

        self::sendEvent($request, self::$config);
        return 'success';
    }


    public static function sendEvent($request,$config){
        self::$config = $config;
        $timeout = self::$config->get('timeout',200);
        $ch = curl_init();
        //curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($request));
        curl_setopt($ch, CURLOPT_URL, self::$config->get('url'));
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, $timeout);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, $timeout);
        $result = false;
        $process = ProcessDurationLogger::start('Sms request to etp');
        $res = curl_exec($ch);
        ProcessDurationLogger::finish($process);
        if (curl_error($ch)) {
            self::$messageError = curl_error($ch);
        } else {
            switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
                case 200:
                    $answer = json_decode($res, true);

                    switch ($answer['errorCode']) {
                        case 0:
                            if (!empty($answer['result']['message_id'])) {
                                $result = $answer['result']['message_id'];
                            }
                            elseif (!empty($answer['result']['uid'])) {
                                $result = $answer['result']['uid'];
                            }
                            else {
                                $result = true;
                            }
                            
                            break;

                        default:
                            $result = false;
                            self::$messageError = $answer['errorCode']." ".$answer['errorMessage'];
                    }
                    break;

                default:
                    self::$messageError = $http_code." ".self::$messageError;
            }
        }
        curl_close($ch);
        return array($result,self::$messageError,$res);
    }


    public static function preparePhone($phone)
    {
        if (!$phone) return false;
        $phone = preg_replace('/[^\d]/', '', $phone);

        if (preg_match('/\d{11}/', $phone)) return array(
                substr($phone, 1),
                substr($phone, 0, 1));
        elseif (preg_match('/\d{10}/', $phone)) return array(
                $phone,
                '7');
        else return false;
    }

    public static function sendLog($message, $data = array())
    {
        app()['log']->info("Sms log message: {$message}", $data);
    }
}