<?php

namespace App\Http\Controllers\Application\Election;

use App\Service;
use App\Http\Controllers\Application;
use App\Service\Config\FileConfig;
use Illuminate\Http;

class Base extends Application\Base
{
    protected $_org_id;
    protected $_form_id;
    protected $_config;
    protected $_votingId;

    /** @var Service\Mgik */
    protected $_mgikService;

    /** @var Service\Logging\ArmMgikLogger */
    protected $_armMgikLogger;

    public function __construct(Http\Request $request, Http\Response $response, Service\Mgik $mgikService, $org_id, $form_id) {
        parent::__construct($request, $response);
        $this->_org_id = $org_id;
        $this->_form_id = $form_id;
        $this->_mgikService = $mgikService;
        $this->_armMgikLogger = app()['arm_mgik_logger'];
        $this->_config = new FileConfig('Mgik');
        $this->_votingId = $this->_config->get('voitingId', 1);
    }

    protected function _getViewPathPrefix(): string {
        return parent::_getViewPathPrefix() . '.election';
    }
}