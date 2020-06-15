<?php

namespace App\Http\Controllers;

use App\Service;
use Illuminate\Http;

class OAuthController extends Base
{
    /** @var Service\OAuth */
    private $_oAuth;

    public function __construct(Http\Request $request, Http\Response $response, Service\OAuth $oAuth) {
        parent::__construct($request, $response);
        $this->_oAuth = $oAuth;
    }

    public function handle() {
        $code = $this->_request->get('code');
        $session = $this->_request->session();
        $location = $this->_oAuth->getRedirectionUrl($session);
        try {
            $obtainTokenProcess = Service\ProcessDurationLogger::start('SUDIR: obtain token');
            $this->_oAuth->processAuthCodeNew($code, $session);
            Service\ProcessDurationLogger::finish($obtainTokenProcess);
            $getUserProcess = Service\ProcessDurationLogger::start('SUDIR: get user');
            $this->_userService->getUser($session);
            Service\ProcessDurationLogger::finish($getUserProcess);
        } catch (\Exception $e) {
            app()['log']->error($e->getMessage(), ['class' => get_class($e), 'trace' => $e->getTraceAsString()]);
            // caught exception indicates code deprecation, so we simply redirect back
        }
        return redirect($location);
    }

    public function logout() {
        $this->_userService->clearUserSession();
        return redirect(env('SUDIR_LOGOUT_URL', 'https://login.2020og.ru/sps2/login/logout?post_logout_redirect_uri=https://2020og.ru/'));
    }
}