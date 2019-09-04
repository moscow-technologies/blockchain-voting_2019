<?php

namespace Itb\Mpgu\Form\mgik\mgd;

use lib;
use MemoryCache;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Exception\GuzzleException;
use Itb\Mpgu\Lib\Config\PoolConfig;
use Itb\Mpgu\Loggers\BaseLogger;
use Itb\Mpgu\Loggers\LoggerPool;
use Itb\Mpgu\Form\mgik\mgd\LogicException;

class Service
{
    const DEFAULT_ERROR_MESSAGE = 'По техническим причинам сервис временно недоступен. Пожалуйста, попробуйте позже.';

    const SUCCESS_CHECK_BALLOT_CODE = 14;
    const SUCCESS_GET_BALLOT_CODE = 0;
    const SUCCESS_HAS_BALLOT_CODE = 0;

    const SYSTEM_MPGU = 'example-system';
    const SYSTEM_MDM = 'example-system';
    const SYSTEM_SUDIR = 'example-system';

    const SUDIR_COOKIE_NAME = 'example-cookie';

    const DEPUTIES_CACHE_KEY = 'example-key';

    /** @var PoolConfig */
    private $_config;

    /** @var Client */
    private $_client;

    /** @var BaseLogger */
    private $_logger;

    /** @var array */
    private $_logData = [];

    public function __construct()
    {
        $this->_config = PoolConfig::me()->conf('Mgik');
    }

    /**
     * @return Client
     */
    public function getClient()
    {
        if (! $this->_client) {
            $this->_client = new Client;
        }

        return $this->_client;
    }

    /**
     * @param BaseLogger $logger
     * @param array $logData
     */
    public function setLogger(BaseLogger $logger, array $logData = [])
    {
        $this->_logger = $logger;
        $this->_logData = $logData;
    }

    /**
     * @return BaseLogger
     */
    public function getLogger()
    {
        if (! $this->_logger) {
            $this->_logger = LoggerPool::create('MgicNetService ['.CFG_HOST_NAME.']', 'graylog');
        }

        return $this->_logger;
    }

    /**
     * @param string $method
     * @param string $url
     * @param array $config
     * @return bool|string
     */
    private function send($method, $url, $config = [])
    {
        $timeout = $this->_config->get('timeout', 5);
        $config = array_merge([
            'timeout' => $timeout,
            'connect_timeout' => $timeout,
        ], $config);

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
     * Проверяет регистрацию пользователя на электронное голосование в МДМ
     * @param string $ssoId
     * @return bool|array
     * @throws LogicException
     */
    public function checkBallot($ssoId)
    {
        $content = $this->getContent($ssoId, $this->_config->get('service/mdm/url/check'));

        $result = $this->getResult($content);

        if (! ($result['code'] && $result['random'] && $result['secureHash'] && $result['timestamp'])) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->_logData, [
                'errorMessage' => 'Неверный ответ сервера (отсутствует обязательный параметр)'
            ]));
        }

        if ($result['code'] !== self::SUCCESS_CHECK_BALLOT_CODE || ! in_array($result['district'], $this->_config->get('districts'))) {
            $this->logError('Неверный код ответа или округ', [
                'errorMessage' => 'Неверный код ответа или округ'
            ]);

            return false;
        }

        return $result;
    }

    /**
     * Получить бюллетень в МДМ
     * @param string $ssoId
     * @param bool $testMode
     * @return bool|array
     * @throws LogicException
     */
    public function getBallot($ssoId)
    {
        $content = $this->getContent($ssoId, $this->_config->get('service/mdm/url/get'));

        $result = $this->getResult($content);

        if ($result['code'] === null || ! ($result['random'] && $result['secureHash'] && $result['timestamp'])) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->_logData, [
                'errorMessage' => 'Неверный ответ сервера (отсутствует обязательный параметр)'
            ]));
        }

        if ($result['code'] !== self::SUCCESS_GET_BALLOT_CODE || ! in_array($result['district'], $this->_config->get('districts'))) {
            $this->logError('Неверный код ответа или округ', [
                'errorMessage' => 'Неверный код ответа или округ'
            ]);

            return false;
        }

        return $result;
    }

    /**
     * Проверяет участвовал ли пользователь в голосовании
     * @param $ssoId
     * @return array|bool
     * @throws \Itb\Mpgu\Form\mgik\mgd\LogicException
     */
    public function hasBallot($ssoId)
    {
        $content = $this->getContent($ssoId, $this->_config->get('service/mdm/url/check'));

        $result = $this->getResult($content);

        if ($result['code'] === null || ! ($result['random'] && $result['secureHash'] && $result['timestamp'])) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->_logData, [
                'errorMessage' => 'Неверный ответ сервера (отсутствует обязательный параметр)'
            ]));
        }

        if ($result['code'] !== self::SUCCESS_HAS_BALLOT_CODE || ! in_array($result['district'], $this->_config->get('districts'))) {
            $this->logError('Неверный код ответа или округ', [
                'errorMessage' => 'Неверный код ответа или округ'
            ]);

            return false;
        }

        return $result;
    }

    /**
     * Возвращает ответ из запросов в сервисы МДМ
     * @param string $url
     * @param string $ssoId
     * @return array
     * @throws LogicException
     */
    protected function getContent(string $ssoId, string $url)
    {
        $token = $this->_config->get('service/mdm/token');

        $response = $this->post($url, [
            'headers' => ['x-application-token' => $token],
            'body' => json_encode(['ssoId' => $ssoId], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $this->_logData = array_merge($this->_logData, [
            'url' => $url,
            'action' => basename($url),
            'districtId' => $this->_config->get('districts'),
            'response' => $response,
        ]);

        if (! $response) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->_logData, [
                'errorMessage' => 'Нет ответа от сервера'
            ]));
        }

        $content = json_decode($response, JSON_OBJECT_AS_ARRAY);

        return $content;
    }

    /**
     * Формирует результирующий массив из ответа сервисом МДМ
     * @param array $content
     * @return array
     */
    protected function getResult(array $content = [])
    {
        $result = [];

        $result['code'] = $content['code'][0] ?? null;
        $result['random'] = $content['random'] ?? null;
        $result['secureHash'] = $content['secureHash'] ?? null;
        $result['timestamp'] = $content['timestamp'] ?? null;
        $result['district'] = $content['district']['districtNumber'] ?? null;

        return $result;
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
        $timeout = $this->_config->get('service/election/timeout', 30);

        $data = json_encode(array_merge(
            $this->getMpguHashGroup(),
            $this->getSudirHashGroup(),
            $this->getMdmHashGroup($userData),
            ['okrug' => $userData['district']]
        ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $response = $this->post($url, [
            'timeout' => $timeout,
            'connect_timeout' => $timeout,
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
        ];

        if (! $response) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => 'Нет ответа от сервера'
            ]));
        }

        $content = json_decode($response);

        $result = $content->data->result ?? null;

        if (! $result) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => $content->errorMessage ?? 'Неверный ответ сервера (отсутствует result)'
            ]));
        }

        return $this->signGuid($result, $log);
    }

    /**
     * @param string $guid
     * @param array $log
     * @return string
     * @throws LogicException
     */
    private function signGuid(string $guid = '', array $log = [])
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
        $data['hash'] = 'example-hash';
        $data['hashMac'] = 'example-hash';

        return base64_encode(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    private function getMpguHashGroup()
    {
        $secret = $this->_config->get('service/election/secret');

        $data['timestamp'] = time();
        $data['random'] = lib::create_guid();
        $data['hash'] = 'example-hash';

        return [mb_strtolower(self::SYSTEM_MPGU) => $data];
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

    /**
     * Расшифровать голос
     * @param string $tx
     * @return array
     * @throws LogicException
     */
    public function decryptTx(string $tx = '')
    {
        $url = $this->_config->get('service/decrypt/url/decrypt');
        $token = $this->_config->get('service/decrypt/token');

        $response = $this->get($url, [
            'query' => [
                'tx' => $tx
            ],
            'headers' => [
                'Authorization' => "Bearer {$token}",
            ],
        ]);

        $log = [
            'url' => $url,
            'action' => basename($url),
            'data' => $tx,
            'response' => $response,
        ];

        if (! $response) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => 'Нет ответа от сервера'
            ]));
        }

        $content = json_decode($response);

        $this->checkDecryptErrorResponse($content, $log);

        $result = $content->result ?? null;
        if (! $result) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => 'Неверный ответ сервера (отсутствует result)'
            ]));
        }

        $districtId = $result->votingId ?? null;
        $deputyId = $result->decryptedData ?? null;

        if (! ($districtId && $deputyId)) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                'errorMessage' => 'Неверный ответ сервера (отсутствует votingId или decryptedData)'
            ]));
        }

        return [
            'districtId' => $districtId,
            'deputyId' => $deputyId,
        ];
    }

    /**
     * @param object $content
     * @param array $log
     * @return bool
     * @throws LogicException
     */
    protected function checkDecryptErrorResponse($content, array $log = [])
    {
        $errorMessage = $content->error->message ?? null;
        if (! $errorMessage) {
            return false;
        }

        $errors = [
            'Voting results are not ready yet (voting still in process or decryption is not finished)' => 'Результаты голосования еще не готовы (голосование еще продолжается или расшифровка не завершена)',
            'Incorrect input parameters' => 'Неверные входные параметры',
        ];

        $message = $errors[$errorMessage] ?? self::DEFAULT_ERROR_MESSAGE;

        throw new LogicException($message, array_merge($log, [
            'errorMessage' => $errorMessage
        ]));
    }

    /***
     * @param null|int $district_id
     * @param bool $force
     * @return array
     * @throws LogicException
     */
    public function getDistrictDeputies(int $district_id = null, bool $force = false)
    {
        $deputies = [];
        $url = $this->_config->get('service/deputies/url');

        $log = [
            'data' => [
                'url' => $url,
                'district_id' => $district_id,
                'force' => $force,
            ]
        ];

        if (! $force) {
            $deputies = MemoryCache::get(self::DEPUTIES_CACHE_KEY);
        }

        if ($force || empty($deputies) || ! is_array($deputies)) {
            $response = $this->get($url);

            if (! $response) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                    'errorMessage' => 'Список депутатов: нет ответа от сервиса',
                ]));
            }

            $content = json_decode($response, JSON_OBJECT_AS_ARRAY);
            $result = $content['result'] ?? null;

            if (! $result) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                    'errorMessage' => 'Список депутатов: некорректные данные',
                    'response' => $result
                ]));
            }

            $deputies = $this->formatDeputies($result);

            MemoryCache::set(self::DEPUTIES_CACHE_KEY, $deputies, $this->_config->get('service/deputies/cache', 3600));
        }

        if ($district_id) {
            if (! isset($deputies[$district_id])) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($log, [
                    'errorMessage' => "Список депутатов: отсутсутвет ID $district_id"
                ]));
            }

            return $deputies[$district_id];
        }

        return $deputies;
    }

    /**
     * Форматирует список депутатов перед сохранением в кэш
     * @param array $district_deputies
     * @return array
     */
    private function formatDeputies(array $district_deputies)
    {
        $result = [];

        foreach ($district_deputies as $district_id => $deputies) {
            $result[$district_id] = [];

            $district = '';
            if (isset($deputies['name'])) {
                $district = $deputies['name'];
                unset($deputies['name']);
            }

            foreach ($deputies as $id => $deputy) {
                $parts = array_map('trim', explode('|', $deputy));

                $result[$district_id][$parts[0]] = [
                    'id' => $parts[0] ?? '',
                    'last_name' => $parts[1] ?? '',
                    'first_name' => $parts[2] ?? '',
                    'middle_name' => $parts[3] ?? '',
                    'date' => $parts[4] ?? '',
                    'university' => $parts[5] ?? '',
                    'faculty' => $parts[6] ?? '',
                    'specialty' => $parts[7] ?? '',
                    'logo' => $parts[8] ?? '',
                    'photo' => $parts[9] ?? '',
                    'description' => $parts[10] ?? '',
                    'district' => $district,
                ];
            }
        }

        return $result;
    }

}