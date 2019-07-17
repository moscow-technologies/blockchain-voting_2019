<?php

require_once( dirname(__FILE__) . '/mgik.class.php' );

use Itb\Mpgu\Form\mgik\mgd\Service;
use Itb\Mpgu\Lib\Config\PoolConfig;

/**
 * @property array $client
 */
class MgikMgd_golosovanie extends FormMgik {

    /** @var string */
    protected $form_id = 'mgd-golosovanie';

    /** @var string */
    protected $reg_form_id = 'mgd-golosovanie';

    /** @var string заголовок формы */
    protected $form_name = 'Участие в электронном дистанционном голосовании на выборах депутатов Московской городской Думы седьмого созыва';

    /** @var string название услуги */
    protected $service_target_title = 'Участие в электронном дистанционном голосовании на выборах депутатов Московской городской Думы седьмого созыва';

    /** @var PoolConfig */
    protected $_config;

    /** @var Service */
    protected $_service;

    /** @var array */
    protected $_userData;

    public function __construct($smarty) {
        parent::__construct($smarty);

        params::$params['services']['elk']['elkEditConfirmField'] = [];
        params::$params['services']['mostiser']['on'] = false;
        params::$params['services']['banner']['on'] = false;
        params::$params['services']['mos_ru']['widgetLive'] = false;

        $this->_config = PoolConfig::me()->conf('Mgik');
        $this->_service = new Service();
    }

    protected function show()
    {
        $this->smarty->assign('hide_cutalog_button', true);

        if (isset($_REQUEST['action']) && $_REQUEST['action'] === 'send') {
            return parent::show();
        }

        try {
            $userData = $this->_service->checkBallot($this->client['SUDIR_ID']);

            if (! $userData) {
                return $this->getTplPath('error_user.tpl');
            }

            $this->smarty->assign('district', $userData['district']);

            return parent::show();

        } catch (\LogicException $e) {
            $this->smarty->assign('message', $e->getMessage());

            return $this->getTplPath('error_exception.tpl');
        }
    }

    protected function send()
    {
        $this->smarty->assign('hide_cutalog_button', true);

        try {
            $userData = $this->_service->getBallot($this->client['SUDIR_ID']);

            if (! $userData) {
                return $this->getTplPath('error_user.tpl');
            }

            $guid = $this->_service->getGuid($userData);
            $host = $this->_config->get('service/election/host');

            header("Location: $host/election/check/$guid");
            die();

        } catch (\LogicException $e) {
            $this->smarty->assign('message', $e->getMessage());

            return $this->getTplPath('error_exception.tpl');

        } catch (\Exception $e) {
            $this->smarty->assign('message', 'Неизвестная ошибка.');

            return $this->getTplPath('error_exception.tpl');
        }
    }

}