<?php

namespace App\Http\Controllers;

use App\Service;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http;

class Base extends BaseController {

    /** @var Http\Request */
    protected $_request;

    /** @var Http\Response */
    protected $_response;

    /** @var Service\Logging\BaseLogger */
    protected $_logger;

    /** @var Service\Config\ConfigInterface */
    protected $_config;

    /** @var Service\OAuth */
    protected $_oauth;

    /** @var Service\Setting */
    protected $_settingService;

    /** @var Service\Logging\BaseLogger */
    protected $_armMgikLogger;

    /** @var \Illuminate\Session\Store */
    protected $_session;

    /** @var Service\Ballot */
    protected $_ballotService;

    /** @var Service\Election */
    protected $_electionService;

    public function __construct(
        Http\Request $request,
        Http\Response $response,
        Service\Logging\BaseLogger $logger,
        Service\OAuth $auth,
        Service\Setting $setting,
        Service\Ballot $ballotService,
        Service\Election $electionService
    ) {
        $this->_request         = $request;
        $this->_response        = $response;
        $this->_logger          = $logger;
        $this->_oauth           = $auth;
        $this->_settingService  = $setting;
        $this->_ballotService   = $ballotService;
        $this->_electionService = $electionService;
        $this->_session         = $request->session();
        $this->_armMgikLogger   = app()['arm_mgik_logger'];
        $this->_config          = Service\Config\PoolConfig::me()->get('Wsregistr');
    }

    protected $_errorsMap = [
        1 => ['Пользователь не авторизован', 401],
        2 => ['Неподдерживаемый метод', 405],
        3 => ['Некорректные параметры', 400],
        4 => ['Некорректная система', 401],
        5 => ['Некорректный токен системы', 401],
        6 => ['Доступ этой системы к методу запрещен', 401],
        7 => ['Данные защиты переданы не в полном составе', 403],
        8 => ['Данные округа не переданы', 401],
        9 => ['Данные защиты переданы некорректны', 401],
        10 => ['Данные не валидно зашифрованы или сжаты', 403],
        11 => ['Запрошен несуществующий бюллетень', 404],
        12 => ['Технический сбой при работе сервиса шифрования', 400],
        13 => ['Попытка взлома голосования сервиса шифрования', 400],
        14 => ['Попытка захода на несуществующее голосование', 400],
        15 => ['Попытка захода на несуществующее голосование', 400],
    ];

    protected function _jsonSuccessResponse($response, bool $isLog = true) {
        $response = array(
            'error' => 0,
            'data' => $response
        );
        $data = json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        $mainLogData = array(
            'jsonResult'  => $data,
            'version'     => Service\Utils::getApiVersionByRequest($this->_request),
            'action'      => $this->_request->get('action'),
            'jsonRequest' => json_encode($this->_request->all(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'system'      => env('HTTP_SYSTEM', ''),
        );
        if (!empty($this->logData)) {
            $mainLogData = array_merge($mainLogData, $this->logData);
        }
        if ($isLog) {
            $this->_logger->info('Ок', $mainLogData);
        }
        return response()->json($response, 200, ['Content-Type' => 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE);
    }

    protected function _jsonErrorResponse($code, $debugMessage = null, bool $isReturnError = false) {
        if (isset($this->_errorsMap[$code])) {
            $message = (string)$this->_errorsMap[$code][0];
            if (isset($this->_errorsMap[$code][1])) {
                $httpcode = (int)$this->_errorsMap[$code][1];
            } else {
                $httpcode = 400;
            }
        } else {
            $message = 'Произошла непредвиденная ошибка';
            $httpcode = 500;
        }

        $mainLogData = array(
            'errorMessage' => $message,
            'errorText' => $debugMessage,
            'errorCode' => $code,
            'version' => Service\Utils::getApiVersionByRequest($this->_request),
            'action' => $_REQUEST['action'] ?? '',
            'jsonRequest' => json_encode($this->_request->all(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_SLASHES),
            'system' => $_SERVER['HTTP_SYSTEM'] ?? '',
            'token' => $_SERVER['HTTP_SYSTEM_TOKEN'] ?? '',
            'sess-id' => $this->_session->getId(),
        );

        if (!empty($this->logData)) {
            $mainLogData = array_merge($mainLogData, $this->logData);
        }
        $this->_logger->error($message, $mainLogData);

        if (!$isReturnError) {
            return response()->json([
                'error' => 1,
                'errorMessage' => $message,
                'code' => $code,
                'debugMessage' => $this->_config->get('debug', false) ? $debugMessage : '',
            ], 200, ['Content-Type' => 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE)->setStatusCode($httpcode);
        } else {
            return [
                'error'        => 1,
                'errorMessage' => $message,
                'code'         => $code,
                'debugMessage' => $this->_config->get('debug', false) ? $debugMessage : ''
            ];
        }
    }

    protected function _requestParam($key) {
        return $this->_request->get($key) ?: $this->_request->post($key);
    }
}