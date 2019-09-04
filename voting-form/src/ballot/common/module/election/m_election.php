<?php

use db;
use lib;
use Mgd\Lib\Config\PoolConfig;
use Mgd\Lib\Cache\MemoryCache;
use Mgd\Lib\Loggers\GrayLogger;
use Mgd\Module\election\Service;
use Mgd\Module\election\TaskVoteRequest;
use Mgd\Module\election\LogicException;
use Mgd\Module\election\Settings;

header("X-XSS-Protection: 0");

class m_election extends Module{

    const DEFAULT_ACTION = 'default';

    /** @var PoolConfig */
    private $_config;

    /** @var Service */
    private $_service;

    /** @var Settings */
    private $_settings;

    /** @var string */
    private $_action;

    /** @var array */
    private $_actions = [
        'default',
        'success',
        'check',
        'vote',
        'error',
    ];

    public function content_init() 
    {
        $this->_config = PoolConfig::me()->conf('Mgik');
        $this->_service = new Service();
        $this->_settings = new Settings();

        $this->tpl = new smarty_ee_module($this);
        $this->tpl->assign('template_path', params::$params['common_data_server'] . 'module_tpl/election/default');

        try {
            $this->_action = $_GET['action'] ?? self::DEFAULT_ACTION;
            if (! in_array($this->_action, $this->_actions)) {
                $this->_action = self::DEFAULT_ACTION;
            }

            $method = "action" . ucfirst($this->_action);
            if (method_exists($this, $method)) {
                return call_user_func([$this, $method]);
            }

            return $this->body;

        } catch (LogicException $e) {
            $log = GrayLogger::create('MgicBallotService');
            $log->error($e->getData()['error'] ?? $e->getMessage(), $e->getData());

            $this->tpl->assign('error_message', $e->getMessage());
            $this->body = $this->tpl->fetch($this->tpl_dir . 'error.tpl');

        } catch (\Throwable $e) {
            $this->tpl->assign('error_message', Service::DEFAULT_ERROR_MESSAGE);
            $this->body = $this->tpl->fetch($this->tpl_dir . 'error.tpl');
        }

        return $this->body;
    }

    /**
     * @throws LogicException
     */
    private function actionDefault()
    {
        $guid = $_REQUEST['guid'] ?? null;

        $userData = $this->_service->checkGuid($guid);
   
        $this->tpl->assign('guid', $guid);
        $this->tpl->assign('district', $userData['district']);

        $this->tpl->assign('deputies', $this->_service->getDistrictDeputies($userData['district']));
        $this->tpl->assign('dit_voting', json_encode([
            'ballotsRegistryAddress' => $this->_settings->get('ballotsRegistryAddress'),
            'modulo' => $this->_settings->get('modulo'),
            'generator' => $this->_settings->get('generator'),
            'publicKey' => $this->_settings->get('publicKey'),
        ], JSON_UNESCAPED_UNICODE));

        $template = $this->_config->get('ballot_template');
        $this->tpl->assign('security', $this->_config->get('security'));
        if (! file_exists("{$this->tpl_dir}{$template}.tpl")) {
            $template = 'show';
        }

        return $this->tpl->fetch("{$this->tpl_dir}{$template}.tpl");
    }

    /**
     * @throws LogicException
     */
    private function actionCheck()
    {
        $guid = $_REQUEST['guid'] ?? null;
        $url = $this->_service->checkSign($guid);

        header("Location: $url");
        die();
    }

    private function actionError()
    {
        $errors = [
            1 => 'Время истекло.',
            2 => 'Бюллетень уже был отправлен или время истекло.',
        ];

        $code = $_GET['code'] ?? null;
        $message = $errors[$code] ?? null;

        if ($code && $message) {
            $this->tpl->assign('error_message', $message);
        }

        return $this->tpl->fetch($this->tpl_dir . "error.tpl");
    }

    private function actionSuccess()
    {
        $sessionId =  @session_id();
        if ($sessionId) {
            $tx = MemoryCache::get("tx|$sessionId");
            $this->tpl->assign('tx', $tx);
        }

        $this->tpl->assign('mpguUrl', lib::getMpguUrl());

        return $this->tpl->fetch($this->tpl_dir . "success.tpl");
    }

    /**
     * @throws LogicException
     */
    private function actionVote()
    {
        $registryAddress = $_POST['registryAddress'] ?? null;
        $guid = $_POST['guid'] ?? null;
        $voterAddress = $_POST['voterAddress'] ?? null;
        $keyVerificationHash = $_POST['keyVerificationHash'] ?? null;
        $votingId = $_POST['votingId'] ?? null;
        $tx = $_POST['tx'] ?? null;

        if (! ($guid && $voterAddress && $keyVerificationHash && $votingId && $tx)) {
            return $this->sendAjaxResponse('error');
        }

        $data = [
            'voterAddress' => $voterAddress,
            'keyVerificationHash' => $keyVerificationHash,
            'votingId' => $votingId,
            'tx' => $tx,
        ];

        $vote = $this->_service->sendGuid($guid, $data);

        if (! $vote) {
            return $this->sendAjaxResponse(['status' => 'error', 'code' => 2]);
        }

        $sessionId =  @session_id();
        if ($sessionId) {
            MemoryCache::set("tx|$sessionId", $tx);
        }

        $request = new TaskVoteRequest(['PGU_USER_ID' => 0], $vote);
        $request->addQueueTask();

        return $this->sendAjaxResponse('success');
    }

    /**
     * @param string|array $data
     */
    private function sendAjaxResponse($data)
    {
        if (is_string($data)) {
            $data = ['status' => $data];
        }

        header("Content-Type: application/json; charset=utf-8");
        die(json_encode($data,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE));
    }

}