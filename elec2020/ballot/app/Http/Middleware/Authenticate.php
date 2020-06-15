<?php

namespace App\Http\Middleware;

use App\Service;
use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;
use Illuminate\Http;

class Authenticate
{
    /**
     * The authentication guard factory instance.
     *
     * @var \Illuminate\Contracts\Auth\Factory
     */
    protected $auth;

    /** @var Service\Logging\BaseLogger */
    private $_logger;

    private $_config;

    public function __construct(Auth $auth, Service\Logging\BaseLogger $logger)
    {
        $this->auth = $auth;
        $this->_logger = $logger;
        $this->_config = new Service\Config\FileConfig('Wsregistr');
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        $system = $request->header('SYSTEM');
        $token = $request->header('SYSTEM_TOKEN');
        $allowedSystems = $this->_config->get('systemsAllow');

        if (empty($system) || !array_key_exists($system, $allowedSystems)) {
            return $this->_errorResponse(
                'Некорректная система',
                "Нет системы: {$system} в списках",
                $request
            );
        }

        $systemToken = $this->_config->get("systemsAllow/{$system}");
        if (empty($token) || $systemToken !== $token) {
            return $this->_errorResponse(
                'Некорректный токен системы',
                "Токен должен быть другим: {$systemToken}, а прислали {$token}",
                $request
            );
        }
        return $next($request);
    }

    private function _errorResponse($message, $logMessage, Http\Request $request) {
        $errorCode = 401;
        $logData = [
            'errorMessage' => $message,
            'errorText'    => $logMessage,
            'errorCode'    => $errorCode,
            'version'      => Service\Utils::getApiVersionByRequest($request),
            'action'       => Service\Utils::getActionByRequest($request),
            'jsonRequest'  => json_encode($request, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_SLASHES),
            'system'       => $_SERVER['HTTP_SYSTEM'] ?? '',
            'token'        => $_SERVER['HTTP_SYSTEM_TOKEN'] ?? '',
            'sess-id'      => $request->session()->getId(),
        ];
        $this->_logger->error($message, $logData);
        return response()->json([
            'error' => 1,
            'errorMessage' => $message,
            'code' => $errorCode,
            'debugMessage' => $this->_config->get('debug', false) ? $logMessage : '',
        ], 200, ['Content-Type' => 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE)->setStatusCode($errorCode);
    }
}
