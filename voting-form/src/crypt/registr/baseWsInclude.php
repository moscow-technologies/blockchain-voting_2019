<?php

preg_match('|ws\/([^\/]+)\/v([0-9\.]+)|', $_SERVER['REQUEST_URI'], $found);
if (!empty($found)) {
    $module = $found[1];
    $version = $found[2];
}

if (!empty($_REQUEST['action'])) {
    $action = trim(mb_strtolower($_REQUEST['action']));
} else $action = false;

use Mgd\Lib\Loggers\GrayLogger;

if (isset($_REQUEST['swagger'])) {
    $logger = GrayLogger::create($module);
    $logger->info('swagger', array(
        'errorMessage' => 'Запрос swagger',
        'vers' => $version));
    $file = 'swagger.yml';
    if (file_exists($file)) {

        // сбрасываем буфер вывода PHP, чтобы избежать переполнения памяти выделенной под скрипт
        // если этого не сделать файл будет читаться в память полностью!
        if (ob_get_level()) {
            ob_end_clean();
        }
        // заставляем браузер показать окно сохранения файла
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header("Content-Disposition: attachment; filename={$module}_v{$version}_".basename($file));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: '.filesize($file));
        // читаем файл и отправляем его пользователю
        readfile($file);
        exit();
    }
}

class ws
{
    public $errorsMap = array(
        1 => array(
            'Не поддерживаемый метод',
            401)
    );
    protected $logger;
    protected $module;
    protected $version;
    protected $postdata;
    protected $logData = array(); // массив доп данных для логов
    function __construct($client = null)
    {
        preg_match('|api\/([^\/]+)\/v([0-9\.]+)|', $_SERVER['REQUEST_URI'], $found);
        if (!empty($found)) {
            $this->module = $found[1];
            $this->version = $found[2];
        }
        else {
            $this->module = 'api';
        }
        if (!empty($client)) {
            $this->client = $client;
        }
        $this->logger = GrayLogger::create('MGD_'.$this->module);

        if ($this->module == 'api'){
            $this->returnError(1,'Что то не так с настройками nginx, нет модуля');
        }
    }

    public function returnError($code,$debugMessage=null)
    {

        if (isset($this->errorsMap[$code])) {
            $message = (string) $this->errorsMap[$code][0];
            if (isset($this->errorsMap[$code][1])) {
                $httpcode = (int) $this->errorsMap[$code][1];
            } else {
                $httpcode = 400;
            }
        } else {
            $message = 'Произошла непредвиденная ошибка';
            $httpcode = 500;
        }

        switch ($httpcode) {
            case 400:
                $string = "400 Bad Request";
                break;
            case 403:
                $string = "403 Forbidden";
                break;
            case 401:
                $string = "401 Unauthorized";
                break;
            case 404:
                $string = "404 Not Found";
                break;
            case 405:
                $string = "405 Method Not Allowed";
                break;
            case 204:
                $string = "204 No Content";
                break;
            case 501:
                $string = "501 Not Implemented";
                break;
            case 500:
            default:
                $string = "500 Internal Server Error";

                break;
        }
        header("HTTP/1.0 {$string}");
        header("Content-Type: application/json; charset=utf-8");
        $mainLogData = array(
            'errorMessage' => $message,
            'errorText' => $debugMessage,
            'errorCode' => $code,
            'version'=>$this->version,
            'action'=>$_REQUEST['action'],
            'jsonRequest' => json_encode($this->postdata, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_SLASHES),
            'corpId' => !empty($this->client['legal']['CORP_ID']) ? $this->client['legal']['CORP_ID'] : $_SERVER['HTTP_LEGALCORPID'],
            'legalId' => !empty($this->client['legal']['ID']) ? $this->client['legal']['ID'] : null,
            'ssoId' => !empty($this->client['user']['USER_ID']) ? $this->client['user']['USER_ID'] : null,
            'system'=>$_SERVER['HTTP_SYSTEM'],
            'token'=>$_SERVER['HTTP_SYSTEM_TOKEN'],
            'sess-id'=> session_id()
        );
        if (!empty($this->logData)) {
            $mainLogData = array_merge($mainLogData,$this->logData);
        }
        $this->logger->error($message, $mainLogData);
        echo json_encode(array(
            'error' => 1,
            'errorMessage' => $message,
            'code' => $code,
            'debugMessage'=>$this->conf->get('debug',false)?$debugMessage:''
            ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function sendOk($response)
    {
        $response = array(
            'error' => 0,
            'data' => $response);
        $data = json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $mainLogData = array(
            'jsonResult' => $data,
            'version'=>$this->version,
            'action'=>$_REQUEST['action'],
            'jsonRequest' => json_encode($this->postdata, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'corpid' => !empty($this->client['legal']['CORP_ID']) ? $this->client['legal']['CORP_ID'] : $_SERVER['HTTP_LEGALCORPID'],
            'legalid' => !empty($this->client['legal']['ID']) ? $this->client['legal']['ID'] : null,
            'ssoid' => !empty($this->client['user']['USER_ID']) ? $this->client['user']['USER_ID'] : null,
            'system'=>$_SERVER['HTTP_SYSTEM'],
            'sess-id'=> session_id()
            //'token'=>$_SERVER['HTTP_SYSTEMTOKEN']
        );
        if (!empty($this->logData)) {
            $mainLogData = array_merge($mainLogData,$this->logData);
        }
        $this->logger->info('Ок', $mainLogData);
        header("Content-Type: application/json; charset=utf-8");
        echo $data;
        exit();
    }

    public function redirect404($code)
    {
        header('HTTP/1.0 404 Not Found');
        exit;
    }

    public function redirect500($code)
    {
        header('HTTP/1.0 500 Server Error');
        exit;
    }

    public function redirect401($code)
    {
        header('HTTP/1.0 401 Not Authorized');
        exit;
    }
}