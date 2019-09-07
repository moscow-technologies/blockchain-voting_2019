<?php
/*
 * Сервис для отдачи нотификейшенов
 *
 */

namespace Mgd\api\registr\v1;

require_once(__DIR__.'/../../../config/params.php');

use Mgd\Lib\Cache\MemoryCache;
#use Mgd\Module\user\User;
#use Mgd\Module\notification\Notification;
use params;
use Mgd\Lib\Loggers\GrayLogger;
use Mgd\Lib\Interfaces\Implement;
use Mgd\Lib\Config\PoolConfig;
use lib;
use Mgd\api\registr\v1\Oauth;
use Exception;
use stdClass;

require_once(params::$params['common_ws_server'].'baseWsInclude.php');

class registrWs extends \ws implements Implement
{
    protected $client = false;
    protected $_notificationService;
    protected $conf;
    public $errorsMap = [
        1 => [
            'Пользователь не авторизован',
            401],
        2 => [
            'Неподдерживаемый метод',
            405],
        3 => [
            'Некорректные параметры',
            400],
        4 => [
            'Некорректная система',
            401],
        5 => [
            'Некорректный токен системы',
            401],
        6 => [
            'Доступ этой системы к методу запрещен',
            401],
        7 => [
            'Данные защиты переданы не в полном составе',
            403],
        8 => [
            'Данные округа не переданы',
            401],
        9 => [
            'Данные защиты переданы некорректны',
            401],
        10 => [
            'Данные не валидно зашифрованы или сжаты',
            403],
        11 => [
            'Запрошен несуществующий бюллетень',
            404],
        12 => [
            'Технический сбой при работе сервиса шифрования',
            400],
    ];

    public function __construct($client = null, bool $logger = false)
    {

        parent::__construct($client, $logger);

//        if (empty($this->client)) {
//            $this->client = User::getCurrent();
//            if (empty($this->client['legal']['ID'])) {
//                $this->returnError(1);
//            }
//        }
    }

    function handle($action)
    {

        $this->conf = PoolConfig::me()->get('Wsregistr');
        if ($_SERVER["CONTENT_TYPE"] == 'application/json') {
            //преобразуем ответ
            $postdata = json_decode(file_get_contents("php://input"), true);
            if (!empty($postdata['data'])) {
                $postdata = $postdata['data'];
                $_REQUEST['data'] = $postdata;
            }
        } else {
            $postdata = $_REQUEST['data'];
        }
        $this->postdata = $postdata;

        if ($action == 'auth') {
            try {
                if (Oauth::me($this->conf)->hasToken()) {


                    $url = $this->conf->get('crypt/service').'/documents/encrypt';

                    $params = array(
                        "Content" => base64_encode('Тестовый запрос'),
                        "Encryption" => [
                            "Type" => 0,
                            "Parameters" => new stdClass(),
                            "Certificates" => [
                                $this->conf->get('crypt/cert')]
                        ]
                    );
                    $params = json_encode($params);

                    $curlOptions = array(
                        CURLOPT_POST => 1,
                        CURLOPT_POSTFIELDS => $params,
                        CURLOPT_HTTPHEADER => array(
                            'Content-Type: application/json; charset=utf-8'
                        )
                    );

                    list($resultJson, $http, $error) = Oauth::me($this->conf)->requestJson($url, $curlOptions);

                    $result = json_decode($resultJson, true);
                     $url = $this->conf->get('crypt/service').'/documents/decrypt/parse';

                    $params = array(
                        "Content" => $result,
                        "Decryption" => [
                            "Type" => 0,
                            "CertificateId" => 0,
                        ]
                    );
                    $params = json_encode($params);

                    $curlOptions = array(
                        CURLOPT_POST => 1,
                        CURLOPT_POSTFIELDS => $params,
                        CURLOPT_HTTPHEADER => array(
                            'Content-Type: application/json; charset=utf-8'
                        )
                    );

                    list($resultJson, $http, $error) = Oauth::me($this->conf)->requestJson($url, $curlOptions);

                    $result = json_decode($resultJson, true);
                    $this->sendOk('Токен получен. id сертификата ' .$result[0]);
                }
            } catch (Exception $e) {
                $this->returnError(12, $e->getMessage());
            }
        }


        if (empty($_SERVER['HTTP_SYSTEM']) || !array_key_exists($_SERVER['HTTP_SYSTEM'], $this->conf->get('systemsAllow'))) {
            $this->returnError(4, 'Нет такой системы в списках'.$_SERVER['HTTP_SYSTEM']);
        }
        $system = $_SERVER['HTTP_SYSTEM'];

        if (empty($_SERVER['HTTP_SYSTEM_TOKEN']) || $this->conf->get('systemsAllow/'.$system) != $_SERVER['HTTP_SYSTEM_TOKEN']) {
            $this->returnError(5, 'ну токен должен быть другим! '.$this->conf->get('systemsAllow/'.$system).", а вы прислали ".$_SERVER['HTTP_SYSTEM_TOKEN']);
        }


        $action = mb_strtolower($action);

        if (!empty($this->conf->get('methodAllow/'.$action)) && !in_array($system, $this->conf->get('methodAllow/'.$action))) {
            $this->returnError(6, "$system не в списках метода $action");
        }

        if (empty($postdata)) {
            $this->returnError(3);
        }
        switch ($action) {
            case 'getguid':
                #получить данные из урла бюллетеня
                $res = [
                    'result' => $this->createGuid($postdata)];
                break;
            case 'decrypt':
                #расшифровка бюллетеня
                $res = [
                    'result' => $this->decrypt($postdata)];
                break;
            case 'crypt':
                #зашифровать бюллетень


                $res = [
                    'result' => $this->crypt($postdata)];

                break;
            case 'checkguid':
                #получить данные из урла бюллетеня
                $res = [
                    'result' => $this->checkguid($postdata)];
                break;
            case 'receiveguid':
                #получить бюллетнь
                $res = [
                    'result' => $this->receiveguid($postdata)];
                break;
            case 'sendguid':
                #получить данные из урла бюллетеня
                $res = [
                    'result' => $this->sendguid($postdata)];
                break;
            case 'checksign':
                #получить данные из урла бюллетеня
                $res = [
                    'result' => $this->checksign($postdata)];
                break;
            default:
                $this->redirect404();
                break;
        }
        $this->sendOk($res);
    }

    private function createGuid($data = array())
    {

        $checkHashGroup = $this->conf->get('checkHashGroup', array());
        if (!empty($checkHashGroup)) {
            #проверим хэши
            foreach ($checkHashGroup as $group => $secret) {
                if (empty($data[$group]) && (empty($data[$group]['hash']) || empty($data[$group]['random']) || empty($data[$group]['timestamp']))) {
                    $this->returnError(7, 'Либо группа не та, либо нет hash,random,timestamp');
                }

                $hash = hash('....................скрыли логику проверки хэша......................................');
                if ($data[$group]['hash'] !== $hash) {
                    $this->returnError(9, "Хэш не совпал в поле hash $hash group $group");
                }
            }
        }

        if (empty($data['okrug'])) {
            $this->returnError(3, 'Нет поля или пустое okrug');
        }

        while (true) {
            $guid = lib::create_guid();
            if (!MemoryCache::get('g|'.$guid)) { //проверим на уникальность, как заставили делать
                break;
            }
        }
        $cachePreLife = $this->conf->get('cachePreLife', 600);
        $lifeTo = $cachePreLife + time();
        MemoryCache::set('g|'.$guid, array(
            'okrug' => $data['okrug'],
            'lifeTo' => $lifeTo,
            'hash' => $hguid,
            'opened' => 0), $cachePreLife);

        $hguid = $this->crypt(array('base64body'=>base64_encode($guid))); //зашифровали типо
//        MemoryCache::set('h|'.$hguid, $guid, $cachePreLife);
        $data = array(
            'url' => $hguid,
            'cert' => null,
            'hash' => null,
            'hashMac' => null);
        #нужно поля заполнить  недостующие для 2 метода реализовав слепую подпись на другом сервере
        if ($this->conf->get('debug_guid', false)) {
            $data['cert'] = $this->conf->get('cert');
            $data['hash'] = hash('....................скрыли логику проверки хэша......................................');
            $data['hashMac'] = hash_hmac('....................скрыли логику проверки хэша......................................');
        }
        return base64_encode(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    private function checkguid($data = array())
    {
        $time = time();
        if (empty($data['guid'])) {
            $this->returnError(3, 'Нет поля или пустое guid');
        }
        $guid = $data['guid'];

        #проверим в кеше и найдем гуидик
        $data = MemoryCache::get('g|'.$guid);
        if (empty($data)) {
            $this->returnError(11, "Нет данных по гуиду $guid");
        }

        if (empty($data['lifeTo']) || $data['lifeTo'] < $time) {
            $this->returnError(11, "Время вышло, гуид $guid протух ".($time - $data['lifeTo'])." сек. как");
        }

        $data['guid'] = $guid;
        $data['url'] = lib::getMainUrl().'/election/'.$guid;

        return $data;
    }

    private function receiveguid($data = array())
    {
        $time = time();
        $guid = $data['guid'] ?? null;

        if (! $guid) {
            $this->returnError(3, 'Нет поля или пустое guid');
        }

        $data = MemoryCache::get('g|'.$guid);

        if (empty($data)) {
            $this->returnError(11, "Нет данных по гуиду $guid");
        }

        if (empty($data['lifeTo']) || $data['lifeTo'] < $time) {
            $this->returnError(11, "Время вышло, гуид $guid протух ".($time - $data['lifeTo'])." сек. как");
        }

        if (empty($data['opened'])) {
            $cacheLife = $this->conf->get('cacheLife', 600);
            $data['opened'] = 1;
            $data['session'] = session_id();
            $data['lifeTo'] = $time + $cacheLife;
            MemoryCache::set('g|' . $guid, $data, $cacheLife);

            return true;
        }

        return false;
    }

    //функция работает только 2 раза, ее вызов сетить новое время хранения
    private function sendguid($data = array())
    {
        $cdata = $this->checkguid($data);
        $hash = $this->crypt($data);
        MemoryCache::deleteKeys(array(
            'g|'.$cdata['guid'],
            'h|'.$cdata['hash']
        ));

        return $hash;
    }

    private function checksign($data = array())
    {
        $time = time();
        if (empty($data['base64body'])) {
            $this->returnError(3, 'Нет поля или пустое base64body');
        }
        $hguid = $data['base64body'];
        $jsonString = base64_decode($hguid, true);
        if (empty($jsonString) || base64_encode($jsonString) !== $hguid) {
            $this->returnError(10, "base64body не распаковывается: $hguid");
        }
        $data = json_decode($jsonString, true);
        #проверим подпись мпгу
        if (empty($data)) {
            $this->returnError(10, "Битый json в строке $jsonString");
        }


        if (empty($data['cert']) || $this->conf->get('cert') != $data['cert']) {
            $this->returnError(3, "Отсутствует поле или чужой  cert $jsonString");
        } elseif (empty($data['hash'])) {
            $this->returnError(3, "Отсутствует поле hash $jsonString");
        } elseif (empty($data['hashMac'])) {
            $this->returnError(3, "Отсутствует поле hashMac $jsonString");
        } elseif (empty($data['url'])) {
            $this->returnError(3, "Отсутствует поле url c гуидом шифрованным $jsonString");
        }

        $hashMac = $data['hashMac'];
        $data['hashMac'] = null;
        $jsonTest = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (hash_hmac('stribog', $jsonTest, $data['cert']) !== $hashMac) {
            $this->returnError(10, "hashMac не бьется по  $jsonTest, шифруем сертификатом в base64");
        }
        $hash = $data['hash'];
        $data['hash'] = null;
        $jsonTest = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (hash('stribog512', $jsonTest) !== $hash) {
            $this->returnError(10, "hash   не бьется по  $jsonTest, шифруем stribog512 GOST R 34.11-2012 512 bit hash function");
        }

        $hguid = $data['url'];
        $guid = $this->decrypt(array('base64body'=>$hguid));

        #проверим в кеше и найдем гуидик
        $data = MemoryCache::get('g|'.$guid);
        if (empty($data)) {
            $this->returnError(11, "Нет данных по гуиду $guid");
        }

        if (empty($data['lifeTo']) || $data['lifeTo'] < $time) {
            $this->returnError(11, "Время вышло, гуид $guid протух ".($time - $data['lifeTo'])." сек. как");
        }

        return lib::getMainUrl().'/election/'.$guid;
    }

    private function crypt($data = array())
    {
        if (empty($data['base64body'])) {
            $this->returnError(3, 'Нет поля или пустое base64body');
        }
        $data = $data['base64body'];
        $string = base64_decode($data, true);

        if (empty($string) || base64_encode($string) !== $data) {
            $this->returnError(10, "base64body не распаковывается: $data");
        }


        $url = $this->conf->get('crypt/service').'/documents/encrypt';

        $params = array(
            "Content" => $data,
            "Encryption" => [
                "Type" => 0,
                "Parameters" => new stdClass(),
                "Certificates" => [
                    $this->conf->get('crypt/cert')]
            ]
        );
        $params = json_encode($params,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

        $curlOptions = array(
            CURLOPT_POST => 1,
            CURLOPT_POSTFIELDS => $params,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json; charset=utf-8'
            )
        );

        list($resultJson, $http, $error) = Oauth::me($this->conf)->requestJson($url, $curlOptions);

        $result = json_decode($resultJson, true);

        if ($http !== 200) {
            $this->returnError(12, $http.': '.$result['Message']);
        }

        return $result;
    }

    private function decrypt($data = array())
    {
        if (empty($data['base64body'])) {
            $this->returnError(3, 'Нет поля или пустое base64body');
        }
        $data = $data['base64body'];

        $string = base64_decode($data, true);
        if (empty($string) || base64_encode($string) !== $data) {
            $this->returnError(10, "base64body не распаковывается: $data");
        }


        $url = $this->conf->get('crypt/service').'/documents/decrypt/parse';

        $params = array(
            "Content" => $data,
            "Decryption" => [
                "Type" => 0,
                "CertificateId" => 0,
            ]
        );
        $params = json_encode($params,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

        $curlOptions = array(
            CURLOPT_POST => 1,
            CURLOPT_POSTFIELDS => $params,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json; charset=utf-8'
            )
        );

        list($resultJson, $http, $error) = Oauth::me($this->conf)->requestJson($url, $curlOptions);

        $result = json_decode($resultJson, true);

        if (empty($result[0])) {
            $this->returnError(12, 'Не сказали какой номер сертификата');
        }
//



        $url = $this->conf->get('crypt/service').'/documents/decrypt';

        $params = array(
            "Content" => $data,
            "Decryption" => [
                "Type" => 0,
                "CertificateId" => $result[0],
            ]
        );
        $params = json_encode($params,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

        $curlOptions = array(
            CURLOPT_POST => 1,
            CURLOPT_POSTFIELDS => $params,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json; charset=utf-8'
            )
        );

        list($resultJson, $http, $error) = Oauth::me($this->conf)->requestJson($url, $curlOptions);

        $result = json_decode($resultJson, true);

        if ($http !== 200) {
            $this->returnError(12, $http.': '.$result['Message']);
        }

        if (empty($result)) {
            $this->returnError(3, 'Нет поля или пустое result расшифровки');
        }

        $string = base64_decode($result, true);
         if (empty($string) || base64_encode($string) !== $result) {
            $this->returnError(10, "base64body не распаковывается: $result");
        }
        return $string;
    }
}
(new registrWs())->handle($action, $logger);





