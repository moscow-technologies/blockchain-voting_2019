<?php

namespace Mgd\api\registr\v1;

use Mgd\Lib\Config\PoolConfig;
use Mgd\Lib\Base\Session;
use Mgd\Lib\Cache\MemoryCache;
use Exception;
use Mgd\Lib\Config\FileConfig;
use Mgd\Lib\Loggers\GrayLogger;
/*
 * Класс для универсализации подключения к криптопро (получение токена, выполнение запроса)
 */

class Oauth
{
    protected $timeout;
    protected $host;
    protected $consumerKey;
    protected $consumerSecret;
    protected $login;
    protected $password;
    protected $config;
    protected $access_token;
    protected $logger;

    /**
     * @var self
     */
    protected static $instance = null;

    function __construct(FileConfig $config = null)
    {
        if (!empty($config)) {
           $this->config = $config;
        } else {
           $this->config = PoolConfig::me()->get('Wsregistr');
        }
        $this->logger = GrayLogger::create('MGD_cryptoPro');
        $this->host = $this->config->get('crypt/host');
        $this->consumerKey = $this->config->get('crypt/client');
        $this->login = $this->config->get('crypt/login');
        $this->password = $this->config->get('crypt/password');
        $this->consumerSecret = $this->config->get('crypt/secret');
        $this->backUrl = $this->config->get('crypt/backUrl');
        $this->timeout = $this->config->get('crypt/timeout', 5);

        $this->initToken();
    }

    //функция авторизации токена
    protected function initToken()
    {
        $data = MemoryCache::get('cryptApi');
        if (empty($data) || $data['validTo'] <= time()) {
            //получим токен или  //нужно рефреш сделать
            $data = $this->getToken();
            if (is_array($data)) {
                MemoryCache::set('cryptApi', $data, $data['expires_in']);
            }
        }
        $this->access_token = $data['access_token'];

        if (!$this->hasToken()) {
            throw new Exception('Нет токена доступа к сервису шифрования', 401);
        }
    }

    /**
     * @return self
     */
    public static function me(FileConfig $config = null)
    {
        if (self::$instance === null) {
            self::$instance = new self($config);
        }

        return self::$instance;
    }

    //функция получения токена
    protected function getToken($refresh_token = false, $is_recursive = false)
    {
        $url = $this->config->get('crypt/oauth');
        $ch = curl_init($url);
        # Setup request to send json via POST.

        $params = array(
            "grant_type" => 'password',
            "username" => $this->getLogin(),
            "client_id" => $this->getConsumerKey(),
            "resource" => $this->config->get('crypt/resource'),
            "password" => $this->getPassword(),
        );

        # Return response instead of printing.
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        $headers = array(
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Basic '.base64_encode($this->getConsumerKey().':'.$this->getConsumerSecret())
        );
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        # Return response instead of printing.
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->getTimeout());
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $this->getTimeout());
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        # Send request.
        $resultJson = curl_exec($ch);
        $result = json_decode($resultJson,true);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        $logData = array(
            'errorCode'=>0,
            'errorMessage'=>'',
            'jsonRequest'=>json_encode($params,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE),
            'jsonResponse'=>$resultJson,
            'headers'=>$headers,
            'url'=>$url
        );
          if (!curl_errno($ch)) {
            switch ($http_code) {
                case 200:
                    $result['validTo'] = time() + $result['expires_in'];
                    $this->logger->info('Токен получен',$logData);
                    break;
                default:
                    $logData['errorCode'] = $http_code;
                    $logData['errorMessage'] = $result['error_description'];
                    $this->logger->error($result['error_description'],$logData);
                    throw new Exception($result['error_description'],$http_code);
                    break;
              
            }
        }
        if ($ch) {
            curl_close($ch);
        }

        return $result;
    }

    public function hasToken() {
        return !empty($this->access_token);
    }




    public function requestJson($url, $curlOptions = array())
    {

        //TODO реализовать ограничение по районам
        $ch = curl_init($url);

        $curlOptions[CURLOPT_HTTPHEADER] [] = 'Authorization: Bearer '.$this->access_token;

        if (!isset($curlOptions[CURLOPT_TIMEOUT])) {
            $curlOptions[CURLOPT_TIMEOUT] = $this->getTimeout();
        }
        if (!isset($curlOptions[CURLOPT_CONNECTTIMEOUT])) {
            $curlOptions[CURLOPT_CONNECTTIMEOUT] = $this->getTimeout();
        }

        foreach ($curlOptions as $name => $option) {
            curl_setopt($ch, $name, $option);
        }

        # Return response instead of printing.
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        $response = curl_exec($ch);

        $error = '';
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($http_code !== 200) {
            $error = curl_error($ch);
        }
        curl_close($ch);

        return array(
            $response,
            $http_code,
            $error);
    }

    /**
     * @return int
     */
    public function getTimeout()
    {
        return $this->timeout;
    }

    /**
     * @return bool
     */
    public function useTokenAutorization()
    {
        return $this->useTokenAutorization;
    }

    /**
     * @return string
     */
    public function getLogin()
    {
        return $this->login;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @return string
     */
    public function getConsumerKey()
    {
        return $this->consumerKey;
    }

    /**
     * @return string
     */
    public function getConsumerSecret()
    {
        return $this->consumerSecret;
    }

}