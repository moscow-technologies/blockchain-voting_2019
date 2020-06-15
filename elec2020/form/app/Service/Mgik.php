<?php

namespace App\Service;

use App\Service\Config\FileConfig;
use App\Service\Logging;
use GuzzleHttp\RequestOptions;
use lib;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Exception\GuzzleException;
use App\Exceptions\LogicException;

class Mgik
{
    const DEFAULT_ERROR_MESSAGE = 'По техническим причинам сервис временно недоступен. Пожалуйста, попробуйте позже.';

    const SUCCESS_CHECK_BALLOT_CODE = 14;
    const SUCCESS_GET_BALLOT_CODE = 0;

    const SYSTEM_MPGU = 'MPGU';
    const SYSTEM_MDM = 'mdm';
    const SYSTEM_SUDIR = 'sudir';

    const SUDIR_COOKIE_NAME = 'sudirhash';

    const DEPUTIES_CACHE_KEY = 'MGD_2019_DISTRICT_DEPUTIES';

    public const SESSION_KEY_DISTRICT = 'district';

    /** @var Config\FileConfig */
    private $_config;

    /** @var Client */
    private $_client;

    /** @var Logging\BaseLogger */
    private $_logger;

    /** @var array */
    private $_logData = [];

    public function __construct(Logging\BaseLogger $logger)
    {
        $this->_logger = $logger;
        $this->_config = new Config\FileConfig('Mgik');
    }

    /**
     * @return Client
     */
    public function getClient()
    {
        if (! $this->_client) {
            $this->_client = new Client([
                'timeout' => env('MGIK_CURL_TIMEOUT', 0),
                RequestOptions::ON_STATS => function ($stats) {
                    //app()['log']->info('', (array)$stats);
                }
            ]);
        }

        return $this->_client;
    }

    /**
     * @return Logging\BaseLogger
     */
    public function getLogger()
    {
        return app()['log'];
    }

    /**
     * @param string $method
     * @param string $url
     * @param array $config
     * @return bool|string
     */
    private function send($method, $url, $config = [])
    {
        /** @var Response $response */
        try {
            $response = $this->getClient()->$method($url, $config);

            return $response->getBody()->getContents();

        } catch (GuzzleException $e) {
            $response = $e->getResponse();
            $content = '';

            if ($response) {
                $content = $response->getBody()->getContents();
            }

            $errorMessage = $this->parseErrorMessage($content);
            $this->logError($errorMessage ?: 'Сетевая ошибка', [
                'method' => $method,
                'url' => $url,
                'action' => basename($url),
                'config' => $config,
                'errorMessage' => $errorMessage,
                'errorText' => $e->getMessage(),
                'errorCode' => $e->getCode(),
                'response' => $content,
                'jsonResponse' => $response,
                'jsonRequest' => ['url' => $url, 'method' => $method]
            ]);

            return $content ? $content : false;
        }
    }

    /**
     * @param string $message
     * @param array $logData
     */
    protected function logError(string $message = 'Неизвестная ошибка', array $logData = [])
    {
        $logData['error'] = 1;
        $this->getLogger()->error($message, array_merge($this->_logData, $logData));
    }

    /**
     * @param string $content
     * @return string
     */
    protected function parseErrorMessage(string $content = '')
    {
        if (! $content) {
            return '';
        }

        $json = json_decode($content);

        if (json_last_error()) {
            return is_string($content) ? $content : '';
        }

        if (isset($json->errorMessage)) {
            return $json->errorMessage;
        }

        if (isset($json->desc)) {
            return $json->desc;
        }

        if (isset($json->error->message)) {
            return $json->error->message;
        }

        return '';
    }

    /**
     * @param string $url
     * @param array $config
     * @return bool|string
     */
    public function get($url, $config = [])
    {
        return $this->send('get', $url, $config);
    }

    /**
     * @param string $url
     * @param array $config
     * @return bool|string
     */
    public function post($url, $config = [])
    {
        return $this->send('post', $url, $config);
    }

    /**
     * Проверяет регистрацию пользователя на электронное голосование
     * @param string $sudir_id
     * @return bool|array
     * @throws LogicException
     */
    public function checkBallot($sudir_id, $testMode = false)
    {
        $mdmConfig = new Config\FileConfig('Mdm');
        $url = $mdmConfig->get('url/check');
        $token = $mdmConfig->get('token');

        $response = $this->post($url, [
            'headers' => ['x-application-token' => $token],
            'body' => json_encode(['ssoId' => $sudir_id], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $log = [
            'url' => $url,
            'action' => basename($url),
            'type' => $testMode ? 'test' : 'prod',
            'response' => $response,
        ];

        if (! $response) {
            if (!$testMode) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                    'errorMessage' => 'Нет ответа от сервера'
                ]));
            }
            $this->_logger->error('Нет ответа от сервера', $log);
            $content = [];
        } else {
            $content = json_decode($response, JSON_OBJECT_AS_ARRAY);
        }

        // TODO: убрать после тестирования!
        if ($testMode) {
            $content['code'] = [self::SUCCESS_CHECK_BALLOT_CODE];
            $content['district'] = ['districtNumber' => $_GET['district'] ?? $mdmConfig->get('default_district_id')];
            $content['random'] = $content['random'] ?? 'random';
            $content['secureHash'] = $content['secureHash'] ?? 'secureHash';
            $content['timestamp'] = $content['timestamp'] ?? time();
        }

        $code = $content['code'][0] ?? null;
        $random = $content['random'] ?? null;
        $secureHash = $content['secureHash'] ?? null;
        $timestamp = $content['timestamp'] ?? null;
        $district = $content['district']['districtNumber'] ?? null;
        $log['districtId'] = $district;
        app()['session.store']->put(self::SESSION_KEY_DISTRICT, $district);

        if (! ($code && $random && $secureHash && $timestamp)) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => 'Неверный ответ сервера (отсутствует обязательный параметр)'
            ]));
        }

        if ($code !== self::SUCCESS_CHECK_BALLOT_CODE) {
            $this->logError('Неверный код ответа', array_merge($log, [
                'errorMessage' => 'Неверный код ответа',
            ]));

            return false;
        }

        return [
            'code' => $code,
            'district' => $district,
            'random' => $random,
            'secureHash' => $secureHash,
            'timestamp' => $timestamp,
        ];
    }

    /**
     * Получить бюллетень
     * @param string $sudir_id
     * @return bool|array
     * @throws LogicException
     */
    public function getBallot($sudir_id, $testMode = false)
    {
        $mdmConfig = new FileConfig('Mdm');
        $url = $mdmConfig->get('url/get');
        $token = $mdmConfig->get('token');

        $response = $this->post($url, [
            'headers' => ['x-application-token' => $token],
            'body' => json_encode(['ssoId' => $sudir_id], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $log = [
            'url' => $url,
            'action' => basename($url),
            'type' => $testMode ? 'test' : 'prod',
            'response' => $response,
        ];

        if (! $response) {
            if (!$testMode) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                    'errorMessage' => 'Нет ответа от сервера'
                ]));
            }
            $this->_logger->error('Нет ответа от сервера', $log);
            $content = [];
        } else {
            $content = json_decode($response, JSON_OBJECT_AS_ARRAY);
        }

        // TODO: убрать после тестирования!
        if ($testMode) {
            $content['code'] = [self::SUCCESS_GET_BALLOT_CODE];
            $content['district'] = ['districtNumber' => $_GET['district'] ?? $mdmConfig->get('default_district_id')];
            $content['random'] = $content['random'] ?? 'random';
            $content['secureHash'] = $content['secureHash'] ?? 'secureHash';
            $content['timestamp'] = $content['timestamp'] ?? time();
        }

        $code = $content['code'][0] ?? null;
        $random = $content['random'] ?? null;
        $secureHash = $content['secureHash'] ?? null;
        $timestamp = $content['timestamp'] ?? null;
        $district = $content['district']['districtNumber'] ?? null;
        $log['district'] = $district;
        app()['session.store']->put(self::SESSION_KEY_DISTRICT, $district);

        if ($code === null || ! ($random && $secureHash && $timestamp)) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => 'Неверный ответ сервера (отсутствует обязательный параметр)'
            ]));
        }

        if ($code !== self::SUCCESS_GET_BALLOT_CODE) {
            $this->logError('Неверный код ответа', array_merge($log, [
                'errorMessage' => 'Неверный код ответа',
            ]));

            return false;
        }

        return [
            'code' => $code,
            'district' => $district,
            'random' => $random,
            'secureHash' => $secureHash,
            'timestamp' => $timestamp,
        ];
    }

    /**
     * @param array $userData
     * @return string
     * @throws LogicException
     */
    public function getGuid(array $userData)
    {
        $url = $this->_config->get('service/election/url/get');
        $token = $this->_config->get('service/election/systems/' . self::SYSTEM_MPGU);

        $data = json_encode(array_merge(
            $this->getMpguHashGroup(),
            $this->getSudirHashGroup(),
            $this->getMdmHashGroup($userData),
            ['okrug' => $userData['district'],'id'=>$userData['id']]
        ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $response = $this->post($url, [
            'body' => $data,
            'headers' => [
                'System' => self::SYSTEM_MPGU,
                'System-Token' => $token,
                'Content-Type' => 'application/json',
            ],
        ]);

        $log = [
            'url' => $url,
            'data' => $data,
            'action' => basename($url),
            'response' => $response,
            'type'=>'getGuid'
        ];

        if (! $response) {
            $log['errorMessage'] = 'Нет ответа от сервера';
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, $log);
        }

        $content = json_decode($response);

        $result = $content->data->result ?? null;
        if (! $result) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                'errorMessage' => $content->errorMessage ?? 'Неверный ответ сервера'
            ], $log));
        }

        return $this->signGuid($result, $log);
    }

    private function signGuid($guid, $log)
    {
        $data = json_decode(base64_decode($guid), JSON_OBJECT_AS_ARRAY);

        if (! isset($data['url']) || ! $data['url']) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => 'Ошибка в signGuid',
                'guid' => $guid,
                'data' => $data,
            ]));
        }

        $data['cert'] =  $this->_config->get('service/election/cert');
        $data['hash'] = hash('....................скрыли логику генерации хэша......................................');
        $data['hashMac'] = hash_hmac('gost', json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $data['cert']);

        return base64_encode(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    private function getMpguHashGroup()
    {
        $secret = $this->_config->get('service/election/secret');

        $data['timestamp'] = time();
        $data['random'] = lib::create_guid();
        $data['hash'] = hash('....................скрыли логику генерации хэша......................................');

        return [mb_strtolower(env('MGIK_ELECTION_SYSTEM', self::SYSTEM_MPGU)) => $data];
    }

    private function getSudirHashGroup()
    {
        $cookie = $_COOKIE[self::SUDIR_COOKIE_NAME] ?? null;

        if (! $cookie) {
            return [];
        }

        $cookie = json_decode($cookie, JSON_OBJECT_AS_ARRAY);

        $data = [
            'timestamp' => $cookie['timestamp'] ?? null,
            'random' => $cookie['rnumber'] ?? null,
            'hash' => $cookie['hash'] ?? null,
        ];

        return [self::SYSTEM_SUDIR => $data];
    }

    private function getMdmHashGroup($userData)
    {
        $data = [
            'timestamp' => $userData['timestamp'] ?? null,
            'random' => $userData['random'] ?? null,
            'hash' => $userData['secureHash'] ?? null,
        ];

        return [self::SYSTEM_MDM => $data];
    }
}