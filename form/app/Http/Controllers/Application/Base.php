<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers;
use App\Exceptions\LogicException;
use App\Service\Config\FileConfig;
use App\Service\Config\PoolConfig;
use App\Service\ProcessDurationLogger;
use Illuminate\Http;
use Illuminate\View;

class Base extends Controllers\Base
{
    private $logData = [];
    protected $_authConf;
    protected $_client;
    private $_basicAuth;

    protected $_ruMonthMap = [
        '01'=>'января',
        '02'=>'февраля',
        '03'=>'марта',
        '04'=>'апреля',
        '05'=>'мая',
        '06'=>'июня',
        '07'=>'июля',
        '08'=>'августа',
        '09'=>'сентября',
        '10'=>'октября',
        '11'=>'ноября',
        '12'=>'декабря'
    ];

    public function __construct(Http\Request $request, Http\Response $response) {
        parent::__construct($request, $response);
        $this->_client = $this->_getClient();
        $this->_addTemplateVar('mosDesign', 1);
        $this->_basicAuth = app()['basic_auth'];
        $this->_authConf =  PoolConfig::me()->get('FormBasicAuth');
        $this->_addTemplateVar('app', []);
        $this->_addTemplateVar('application_view_path', resource_path() . '/views/application');
        app()['log']->info(route('landing'));
        $this->_addTemplateVar('url_404', route('ballot_show'));
    }

    protected function _getClient(): array {
        $user = $this->_userService->getUser($this->_request->session());
        return [
            'SSO_ID'    => $user->id,
            'TELEPHONE' => $user->phone,
            'EMAIL'     => $user->email,
        ];
    }

    public function accessDenied($orgId, $formId) {
        if ($this->_checkFormBasicAuth($orgId, $formId) == null) {
            return redirect(route('ballot_show'));
        }
        $content = view('base.header', ['app' =>[]]) . view('base.disabled', ['app' => []]);
        return view('base.innerMos', ['content' => $content, 'base_template_path' => resource_path() . '/views/base']);
    }

    final protected function _checkFormBasicAuth($org_id, $form_id)
    {
        $key = "{$org_id}/{$form_id}";
        $token = $this->_authConf->get("{$key}/token");
        $isEnabled = $this->_authConf->get("{$key}/check");

        if (!$isEnabled) {
            return null;
        }

        $key .= '/form';
        $isTokenVerified = $this->_basicAuth->setDateInterval(
            $this->_authConf->get($key .'/from'),
            $this->_authConf->get($key .'/to')
        )->check($token,$this->_request->header('form-token'));

        if ($isTokenVerified) {
            return null;
        }

        $titleKey = $key . '/title';
        $messageKey = $key . '/message';

        $this->_assignAuthErrorVars(
            $this->_authConf->get($titleKey),
            $this->_authConf->get($messageKey),
            $this->_authConf->get('skip_elk'),
            $this->_authConf->get('skip_try_again_later')
        );

        return redirect(route('access_denied', ['org_id' => $org_id, 'form_id' => $form_id]));
    }

    protected function _assignAuthErrorVars($errorTitle, $errorMessage, $skipElk, $skipLater)
    {
        $this->_addTemplateVar('error_title', $errorTitle);
        $this->_addTemplateVar('info_message_add_text', $errorMessage);
        $this->_addTemplateVar('skip_elk', $skipElk);
        $this->_addTemplateVar('skip_try_again_later', $skipLater);
        $this->_addTemplateVar('hide_cutalog_button', true);
    }

    /**
     * @param \Exception $exception
     */
    protected function logError(\Exception $exception)
    {
        $this->logData['error'] = 1;
        $this->logData['type'] = 'ballot_controller_error';
        $this->logData['errorRaw'] = $exception->getMessage();

        if ($exception instanceof LogicException) {
            $data = $exception->getData();
            $message = $data['errorMessage'] ?? $exception->getMessage();
            $this->_log($message, array_merge($this->logData, $data));
        } else {
            $this->logData['errorMessage'] = $exception->getMessage();
            $this->logData['errorTrace'] = $exception->getTraceAsString();
            $this->_log('Неизвестная ошибка', $this->logData);
        }
    }

    private function _log($message, $data = []) {
        $data['client_id'] = $this->_client['SSO_ID'] ?: 'empty';
        app()['log']->info($message, $data);
    }

    final protected function _renderApplicationView(string $view, array $params = []) {
        $viewPathPrefix = $this->_getViewPathPrefix();
        if ($viewPathPrefix !== null) {
            $view = "{$viewPathPrefix}.{$view}";
        }
        return $this->_renderView($view, $params);
    }

    protected function _getViewPathPrefix(): ?string {
        return 'application';
    }
}