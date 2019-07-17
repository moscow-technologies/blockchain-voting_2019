<?php

namespace Mgd\Module\election;

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
    const DEPUTIES_CACHE_KEY = 'MGD_2019_DISTRICT_DEPUTIES';

    private $_SYSTEM, $_TOKEN;

    /** @var array */
    private $_config;

    /** @var Client */
    private $_client;

    public function __construct()
    {
        $this->_config = PoolConfig::me()->conf('Mgik');
        $this->_SYSTEM = $this->_config->get('service/system','MGD');
        $this->_TOKEN = $this->_config->get('service/token','MGD');
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
     * @param object $content
     * @param array $log
     * @return bool
     * @throws LogicException
     */
    protected function checkErrorResponse($content, $log)
    {
        $errorMessage = $content->errorMessage ?? null;

        if ($errorMessage) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                'error' => $errorMessage
            ], $log));
        }

        return true;
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
            $deputies = MemoryCache::get(self::DEPUTIES_CACHE_KEY);
        }

        if ($force || empty($deputies) || ! is_array($deputies)) {
            $local = $this->_config->get('service/deputies/local', null);
            $url = $this->_config->get('service/deputies/url');

            $response = $local ? $local : $this->get($url);

            $log = [
                'url' => $url,
                'data' => [
                    'district_id' => $district_id,
                    'force' => $force,
                    'local' => (bool) $local,
                ]
            ];

            if (! $response) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                    'error' => 'Список депутатов: нет ответа от сервера'
                ], $log));
            }

            $content = json_decode($response, JSON_OBJECT_AS_ARRAY);

            if (! isset($content['result']) || empty($content['result'])) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                    'error' => 'Список депутатов: некорректный ответ от сервера',
                    'response' => $content
                ], $log));
            }

            $deputies = $this->formatDeputies($content['result']);

            MemoryCache::set(self::DEPUTIES_CACHE_KEY, $deputies, $this->_config->get('service/deputies/cache', 3600));
        }

        if ($district_id) {
            if (! isset($deputies[$district_id])) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE, array_merge([
                    'error' => "Список депутатов: в ответе отсутсутвет ID $district_id"
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

}