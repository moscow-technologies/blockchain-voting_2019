<?php

namespace App\Http\Controllers;

use App\Service;
use Illuminate\Http;
use Illuminate\View;
use Laravel\Lumen\Application;
use Laravel\Lumen\Routing\Controller as BaseController;

class Base extends BaseController
{
    /** @var View\Factory */
    private $_view;

    /** @var Http\Request */
    protected $_request;

    /** @var Http\Response */
    protected $_response;

    /** @var Application */
    protected $_app;

    /** @var Service\User */
    protected $_userService;

    public function __construct(Http\Request $request, Http\Response $response) {
        $this->_app = app();
        $this->_userService = $this->_app['user'];
        $this->_view = $this->_app['view'];
        $this->_request = $request;
        $this->_response = $response;
        $this->_addTemplateVar('base_template_path', $this->_getBaseTemplatePath());
        $this->_addTemplateVar('elk_host', \params::$elk);
    }

    public function test() {
        return 'Test OK!';
    }

    public function changeConfirm() {
        $session = app()['session.store'];
        $confirmType = $session->get('confirmType');
        if ($confirmType === 'sms' || !$confirmType) {
            $session->put('confirmType', 'email');
        } else {
            $session->put('confirmType', 'sms');
        }
        return redirect(route('ballot_show'));
    }

    public function notFound() {
        $content = view('base.404');
        return view('base.innerMos', ['content' => $content,'base_template_path' => resource_path() . '/views/base']);
    }

    protected function _addTemplateVar($key, $value): void {
        $this->_view->share($key, $value);
    }

    protected function _renderView($view, array $params = []) {

        $content = view('base.header') . view($view, $params) . view('base.footer');
        return view('base.innerMos', ['content' => $content]);
    }

    private function _getBaseTemplatePath(): string {
        return resource_path() . '/views/base';
    }
}
