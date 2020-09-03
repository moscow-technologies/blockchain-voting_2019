<?php

namespace App\Http\Controllers;

use App\Service;
use Illuminate\Http;
use Illuminate\View;
use Laravel\Lumen\Application;
use Laravel\Lumen\Routing\Controller as BaseController;

class Controller extends BaseController
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
        $templateVars = $this->_templateVars();
        $this->_addTemplateVars($templateVars);
    }

    final protected function _renderView(string $view, array $params = []) {
        $this->_assignApplicationVars();
        $content = view('base.header') . view($view, $params) . view('base.footer');
        return view('base.innerMos', ['content' => $content]);
    }

    protected function _addTemplateVars(array $vars): void {
        foreach ($vars as $key => $value) {
            $this->_addTemplateVar($key, $value);
        }
    }

    protected function _addTemplateVar($key, $value): void {
        $this->_view->share($key, $value);
    }

    protected function _templateVars(): array {
        return [
            'base_template_path' => $this->_getBaseTemplatePath(),
            'mosDesign' => '1',
        ];
    }

    protected function _assignApplicationVars(): void {
    }

    private function _getBaseTemplatePath(): string {
        return resource_path() . '/views/base';
    }
}
