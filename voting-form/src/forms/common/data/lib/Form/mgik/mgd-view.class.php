<?php

require_once( dirname(__FILE__) . '/mgik.class.php' );

use Itb\Mpgu\Form\mgik\mgd\Service;
use Itb\Mpgu\Lib\Config\PoolConfig;
use Itb\Mpgu\Form\mgik\mgd\LogicException;

class MgikMgd_view extends FormMgik
{
    protected $form_id = 'mgd-view';
    protected $reg_form_id = 'mgd-view';
    protected $form_name = 'Проверка голоса на выборах депутатов Московской городской Думы седьмого созыва';
    protected $service_target_title = 'Проверка голоса на выборах депутатов Московской городской Думы седьмого созыва';

    /** @var PoolConfig */
    protected $config;

    /** @var Service */
    protected $service;

    public function __construct($smarty) {
        parent::__construct($smarty);

        params::$params['services']['mostiser']['on'] = false;
        params::$params['services']['banner']['on'] = false;
        params::$params['services']['mos_ru']['widgetLive'] = false;

        $this->config = PoolConfig::me()->conf('Mgik');
        $this->service = new Service();
    }

    protected function show()
    {
        $this->smarty->assign('hide_cutalog_button', true);

        try {
            $this->service->setLogger($this->getLogger(), array_merge($this->logData, $this->getExtLogData()));

            $userData = $this->service->hasBallot($this->client['SUDIR_ID']);

            if (! $userData) {
                return $this->getTplPath('error_user.tpl');
            }

            return parent::show();

        } catch (LogicException $e) {
            $this->logExceptionError($e);
            $this->smarty->assign('message', $e->getMessage());

            return $this->getTplPath('error_exception.tpl');

        } catch (\Exception $e) {
            $this->logExceptionError($e);
            $this->smarty->assign('message', 'Неизвестная ошибка.');

            return $this->getTplPath('error_exception.tpl');
        }
    }

    protected function send()
    {
        header("Location: http://" . CFG_HOST_NAME . "/ru/app/{$this->org_id}/{$this->form_id}");
        die();
    }
}