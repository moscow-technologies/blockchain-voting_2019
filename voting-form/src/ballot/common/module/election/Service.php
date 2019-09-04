<?php

namespace Mgd\Module\election;

use lib;
use Mgd\Lib\Cache\MemoryCache;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Exception\GuzzleException;
use Mgd\Lib\Config\PoolConfig;
use Mgd\Lib\Loggers\GrayLogger;
use Mgd\Module\election\LogicException;

class Service
{
    const DEFAULT_ERROR_MESSAGE = 'По техническим причинам сервис временно недоступен. Пожалуйста, попробуйте позже.';
    protected  $DEPUTIES_CACHE_KEY = 'MGD_2019_QUESTIONS';

    private $_SYSTEM, $_TOKEN;

    /** @var array */
    private $_config;

    /** @var Client */
    private $_client;

    /** @var array */
    protected $logData = [];

    public function __construct()
    {
        $this->_config = PoolConfig::me()->conf('Mgik');
        $this->_SYSTEM = $this->_config->get('service/system');
        $this->_TOKEN = $this->_config->get('service/token');
        switch ($this->_config->get('ballot_template','show')) {
            case 'show':
            default:
                $this->DEPUTIES_CACHE_KEY = 'MGD_2019_DISTRICT_DEPUTIES';
                break;
            case 'vybory':
                $this->DEPUTIES_CACHE_KEY = 'MGD_2019_QUESTIONS';
                break;
        }
        
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

    public function setClient($client)
    {
        $this->_client = $client;
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

            if ($response) {
                $content = $response->getBody()->getContents();
            }

            $log = GrayLogger::create('MgicBallotService');
            $log->error('Сетевая ошибка', [
                'method' => $method,
                'url' => $url,
                'config' => $config,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'response' => $content ?? null,
            ]);

            return $content ?? false;
        }
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
     * @param $guid
     * @return string
     * @throws LogicException
     */
    public function checkSign($guid)
    {
        $url = $this->_config->get('service/election/url/check_sign');
   
        $data = json_encode([
            'data' => [
                'base64body' => $guid,
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $response = $this->post($url, $this->getRequest($data));
        if (! $response) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, [
                'error' => 'checkSign: нет ответа от сервера'
            ]);
        }

        $content = json_decode($response);

        $log = [
            'url' => $url,
            'guid' => $guid,
            'data' => $data,
            'response' => $content,
        ];

        $this->checkErrorResponse($content, $log);

        $url = $content->data->result ?? null;
        if (! $url) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                'error' => 'Отсутствует ссылка на бюллетень'
            ], $log));
        }

        return $url;
    }

    /**
     * @param $guid
     * @return array
     * @throws LogicException
     */
    public function checkGuid($guid)
    {
        $url = $this->_config->get('service/election/url/check');

        $data = json_encode([
            'data' => [
                'guid' => $guid,
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
 
        $response = $this->post($url, $this->getRequest($data));
        if (! $response) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, [
                'error' => 'checkGuid: нет ответа от сервера'
            ]);
        }

        $content = json_decode($response);
        $log = [
            'url' => $url,
            'guid' => $guid,
            'data' => $data,
            'response' => $content,
        ];
          
        $this->checkErrorResponse($content, $log);

        $result = $content->data->result ?? null;
        if (! $result) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                'error' => 'checkGuid: пустой result в ответе сервера'
            ], $log));
        }

        $guid = $result->guid ?? null;
        $district = $result->okrug ?? null;
        $url = $result->url ?? null;
        $opened = $result->opened ?? null;

        if (! ($guid && $district && $url)) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                'error' => 'Неверный ответ сервера'
            ], $log));
        }

        if ($opened) {
            throw new LogicException('Вы уже получали бюллетень', array_merge([
                'error' => 'Бюллетень уже был выдан'
            ], $log));
        }

        return [
            'guid' => $guid,
            'district' => $district,
            'url' => $url,
        ];
    }

    /**
     * @param string $guid
     * @param array $ballot
     * @return string
     * @throws LogicException
     */
    public function sendGuid($guid, $ballot)
    {
        $url = $this->_config->get('service/election/url/send');

        $data = json_encode([
            'data' => [
                'guid' => $guid,
                'base64body' => base64_encode(json_encode($ballot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)),
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $response = $this->post($url, $this->getRequest($data));
        if (! $response) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, [
                'error' => 'sendGuid: нет ответа от сервера'
            ]);
        }

        $content = json_decode($response);

        $log = [
            'url' => $url,
            'guid' => $guid,
            'data' => $data,
            'response' => $content,
        ];

        $this->checkErrorResponse($content, $log);

        $result = $content->data->result ?? null;
        if (! $result) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                'error' => 'Неверный ответ сервера'
            ], $log));
        }

        return $result;
    }

    /**
     * @param string $data
     * @return array
     */
    protected function getRequest($data) {
        return [
            'body' => $data,
            'headers' => [
                'System' => $this->_SYSTEM,
                'System-Token' => $this->_TOKEN,
                'Content-Type' => 'application/json',
            ]
        ];
    }

    /**
     * Возвращает список депутатов в округе
     * @param integer|null $district_id
     * @param bool $force
     * @return array
     * @throws LogicException
     */
    public function getDistrictDeputies($district_id = null, $force = false)
    {

        if (! $force) {
            $deputies = MemoryCache::get($this->DEPUTIES_CACHE_KEY);
        }

        if ($force || empty($deputies) || ! is_array($deputies)) {

            $content = lib::getKeyValueSetData($this->DEPUTIES_CACHE_KEY, false, $force);
 
            $log = [
                'data' => [
                    'district_id' => $district_id,
                    'force' => $force,
                ]
            ];

            if (! $content) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                    'error' => 'Список депутатов: некорректные данные',
                    'response' => $content
                ], $log));
            }

            $deputies = $this->formatDeputies($content);

            MemoryCache::set($this->DEPUTIES_CACHE_KEY, $deputies, $this->_config->get('service/deputies/cache', 3600));
        }

        if ($district_id) {
            if (! isset($deputies[$district_id])) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE.' У данного округа нет кандидатов.', array_merge([
                    'error' => "Список депутатов: отсутсутвет ID $district_id"
                ], $log));
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

            if (isset($deputies['name'])) {
                unset($deputies['name']);
            }

            foreach ($deputies as $id => $deputy) {
                $parts = array_map('trim', explode('|', $deputy));

                $result[$district_id][$id] = [
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
                ];
            }
        }

        return $result;
    }

    /**
     * @return string
     * @throws LogicException
     */
    public function getBlockchainAuthenticate()
    {
        $url = $this->_config->get('service/blockchain/host') . $this->_config->get('service/blockchain/url/authenticate');
        $login = $this->_config->get('service/blockchain/login');
        $password = $this->_config->get('service/blockchain/password');

        $data = json_encode([
            'login' => $login,
            'password' => $password,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $response = $this->post($url, [
            'body' => $data,
            'headers' => [
                'Content-Type' => "application/json",
            ],
        ]);

        $this->createLogData($url, $data, $response);
        $content = $this->getContent($response);

        $token = $content->result->token ?? null;
        if (! $token) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->logData, [
                'errorMessage' => 'В ответе сервера отсутствует токен',
            ]));
        }

        return $token;
    }

    /**
     * @param string $token
     * @return string
     * @throws LogicException
     */
    public function getBlockchainRegistryAddress(string $token)
    {
        $url = $this->_config->get('service/blockchain/host') . $this->_config->get('service/blockchain/url/addresses');

        $response = $this->get($url, [
            'headers' => [
                'Authorization' => "Bearer {$token}",
            ],
        ]);

        $this->createLogData($url, $token, $response);
        $content = $this->getContent($response);

        $address = $content->result->ballotsRegistryAddress ?? null;
        if (! $address) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->logData, [
                'errorMessage' => 'В ответе сервера отсутствует адрес',
            ]));
        }

        return $address;
    }

    /**
     * @param string $token
     * @return object
     * @throws LogicException
     */
    public function getBlockchainEncryptionKeys(string $token)
    {
        $url = $this->_config->get('service/blockchain/host') . $this->_config->get('service/blockchain/url/keys');

        $response = $this->get($url, [
            'headers' => [
                'Authorization' => "Bearer {$token}",
            ],
        ]);

        $this->createLogData($url, $token, $response);
        $content = $this->getContent($response);

        $modulo = $content->result->modulo ?? null;
        $generator = $content->result->generator ?? null;
        $publicKey = $content->result->publicKey ?? null;

        if (! ($modulo && $generator && $publicKey)) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->logData, [
                'errorMessage' => 'В ответе сервера отсутствует один из ключей',
            ]));
        }

        return $content->result;
    }

    protected function createLogData($url, $data = '', $response = '')
    {
        $this->logData = [
            'url' => $url,
            'action' => basename($url),
            'data' => $data,
            'response' => $response,
        ];

        return $this->logData;
    }

    /**
     * @param string $response
     * @return object
     * @throws LogicException
     */
    protected function getContent(string $response = null)
    {
        if (! $response) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->logData, [
                'errorMessage' => 'Нет ответа от сервера',
            ]));
        }

        $content = json_decode($response);
        $this->checkErrorResponse($content);

        return $content;
    }

    /**
     * @param object $content
     * @param array $log
     * @return bool
     * @throws LogicException
     */
    protected function checkErrorResponse($content, $log = [])
    {
        $errorMessage = $content->errorMessage ?? null;

        if ($errorMessage) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                'error' => $errorMessage
            ], $log));
        }

        // Ошибки из Blockchain
        $errorMessage = $content->error->message ?? null;
        $errorDetails = $content->error->details ?? null;

        if ($errorMessage) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge($this->logData, [
                'errorMessage' => $errorMessage,
                'errorText' => $errorDetails,
            ]));
        }

        return true;
    }

}