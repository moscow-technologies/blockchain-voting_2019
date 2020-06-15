<?php

namespace App\Http\Controllers\Application\Election;

use App\Service;
use Illuminate\Http;

class Landing extends Base
{
    private $org_id  = 'cikrf';
    private $form_id = 'service';

    public function __construct(Http\Request $request, Http\Response $response, Service\Mgik $mgikService) {
        parent::__construct($request, $response, $mgikService, $this->org_id, $this->form_id);
        $this->_assignLandingVars();
    }

    public function show() {
        if ($redirection = $this->_checkFormBasicAuth($this->_org_id, $this->_form_id)) {
            return $redirection;
        }
        return $this->_renderApplicationView('show');
    }

    protected function _assignLandingVars(): void {
        $this->_addTemplateVar('app', []);
        $this->_addTemplateVar('client', $this->_getClient());
        $this->_addTemplateVar('hide_cutalog_button', true);
        $this->_addTemplateVar('title',  $this->_config->get($this->_org_id.'/'.$this->_form_id.'/title'));
        $this->_addTemplateVar('text',  $this->_config->get($this->_org_id.'/'.$this->_form_id.'/text'));
        $this->_addTemplateVar('buttonText',  $this->_config->get($this->_org_id.'/'.$this->_form_id.'/buttonText'));
        $this->_addTemplateVar('formUrl',  $this->_config->get($this->_org_id.'/'.$this->_form_id.'/formUrl'));
    }

    protected function _getViewPathPrefix(): string {
        return parent::_getViewPathPrefix() . '.landing';
    }
}