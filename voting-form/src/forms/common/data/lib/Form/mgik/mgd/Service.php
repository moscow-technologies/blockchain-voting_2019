<?php

namespace Itb\Mpgu\Form\mgik\mgd;

use lib;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Exception\GuzzleException;
use Itb\Mpgu\Lib\Config\PoolConfig;
use Itb\Mpgu\Loggers\LoggerPool;

class Service
{
    const DEFAULT_ERROR_MESSAGE = 'По техническим причинам сервис временно недоступен. Пожалуйста, попробуйте позже.';

    const SUCCESS_CHECK_BALLOT_CODE = 14;
    const SUCCESS_GET_BALLOT_CODE = 0;

    const SYSTEM_MPGU = 'example-system';
    const SYSTEM_MDM = 'example-system';
    const SYSTEM_SUDIR = 'example-system';

    const SUDIR_COOKIE_NAME = 'example-cookie';

    /** @var array */
    private $_config;

    /** @var Client */
    private $_client;

    /** @var LoggerPool */
    private $_log;

    public function __construct()
    {
        $this->_config = PoolConfig::me()->conf('Mgik');
        $this->_log = LoggerPool::create('MgicNetService['.CFG_HOST_NAME.']', 'graylog');
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

            $this->_log->error('Ошибка', [
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
     * Проверяет регистрацию пользователя на электронное голосование
     * @param string $sudir_id
     * @return bool|array
     * @throws \LogicException
     */
    public function checkBallot($sudir_id)
    {
        $url = $this->_config->get('service/mdm/url/check');
        $token = $this->_config->get('service/mdm/token');

        $response = $this->post($url, [
            'headers' => ['x-application-token' => $token],
            'body' => json_encode(['ssoId' => $sudir_id], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        if (! $response) {
            throw new \LogicException(self::DEFAULT_ERROR_MESSAGE);
        }

        $content = json_decode($response, JSON_OBJECT_AS_ARRAY);

        $code = $content['code'][0] ?? null;
        $random = $content['random'] ?? null;
        $secureHash = $content['secureHash'] ?? null;
        $timestamp = $content['timestamp'] ?? null;
        $district = $content['district']['districtNumber'] ?? null;
        $districts = $this->_config->get('districts');

        if (! ($code && $random && $secureHash && $timestamp)) {
            throw new \LogicException(self::DEFAULT_ERROR_MESSAGE);
        }

        if ($code !== self::SUCCESS_CHECK_BALLOT_CODE || ! in_array($district, $districts)) {
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
     * @throws \LogicException
     */
    public function getBallot($sudir_id)
    {
        $url = $this->_config->get('service/mdm/url/get');
        $token = $this->_config->get('service/mdm/token');

        $response = $this->post($url, [
            'headers' => ['x-application-token' => $token],
            'body' => json_encode(['ssoId' => $sudir_id], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        if (! $response) {
            throw new \LogicException(self::DEFAULT_ERROR_MESSAGE);
        }

        $content = json_decode($response, JSON_OBJECT_AS_ARRAY);

        $code = $content['code'][0] ?? null;
        $random = $content['random'] ?? null;
        $secureHash = $content['secureHash'] ?? null;
        $timestamp = $content['timestamp'] ?? null;
        $district = $content['district']['districtNumber'] ?? null;
        $districts = $this->_config->get('districts');

        if ($code === null || ! ($random && $secureHash && $timestamp)) {
            throw new \LogicException(self::DEFAULT_ERROR_MESSAGE);
        }

        if ($code !== self::SUCCESS_GET_BALLOT_CODE || ! in_array($district, $districts)) {
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

    public function getGuid($userData)
    {
        $url = $this->_config->get('service/election/url/get');
        $token = $this->_config->get('service/election/systems/' . self::SYSTEM_MPGU);

        $data = json_encode(array_merge(
            $this->getMpguHashGroup(),
            $this->getSudirHashGroup(),
            $this->getMdmHashGroup($userData),
            ['okrug' => $userData['district']]
        ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $response = $this->post($url, [
            'body' => $data,
            'headers' => [
                'System' => self::SYSTEM_MPGU,
                'System-Token' => $token,
                'Content-Type' => 'application/json',
            ],
        ]);

        if (! $response) {
            throw new \LogicException(self::DEFAULT_ERROR_MESSAGE);
        }

        $content = json_decode($response);

        $result = $content->data->result ?? null;
        if (! $result) {
            throw new \LogicException(self::DEFAULT_ERROR_MESSAGE);
        }

        return $this->signGuid($result);
    }

    private function signGuid($guid)
    {
        $data = json_decode(base64_decode($guid), JSON_OBJECT_AS_ARRAY);

        if (! isset($data['url']) || ! $data['url']) {
            throw new \LogicException(self::DEFAULT_ERROR_MESSAGE);
        }

        $data['cert'] =  $this->_config->get('service/election/cert');
        $data['hash'] = 'example hash';
        $data['hashMac'] = 'example hash';

        return base64_encode(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    private function getMpguHashGroup()
    {
        $secret = $this->_config->get('service/election/secret');

        $data['timestamp'] = time();
        $data['random'] = lib::create_guid();
        $data['hash'] = 'example hash';

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

}