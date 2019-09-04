<?php

require_once( dirname(__FILE__) . '/mgik.class.php' );

use Itb\Mpgu\Form\mgik\mgd\Service;
use Itb\Mpgu\Lib\Config\PoolConfig;
use Itb\Mpgu\Form\mgik\mgd\LogicException;
use Itb\Mpgu\Form\mgik\mgd\MgdAjaxHandler;

class MgikMgd_golosovanie extends FormMgik
{
    protected $form_id = 'mgd-golosovanie';
    protected $reg_form_id = 'mgd-golosovanie';
//    protected $form_name = 'Участие в электронном дистанционном голосовании на выборах депутатов Московской городской Думы седьмого созыва';
//    protected $service_target_title = 'Участие в электронном дистанционном голосовании на выборах депутатов Московской городской Думы седьмого созыва';
    protected $form_name = 'Тестирование дистанционного электронного голосования на выборах депутатов Московской городской Думы: каких объектов не хватает в районе';
    protected $service_target_title = 'Тестирование дистанционного электронного голосования на выборах депутатов Московской городской Думы: каких объектов не хватает в районе';

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

        $this->registerAjaxModule('mgd', new MgdAjaxHandler());
    }

    protected function beforeShow()
    {
        $this->_service->setLogger($this->getLogger(), array_merge($this->logData, $this->getExtLogData()));
        parent::beforeShow();
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

            $this->smarty->assign('security_js', $this->_config->get('service/security'));
            $this->smarty->assign('district', $userData['district']);

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
        $this->smarty->assign('hide_cutalog_button', true);

        try {
            $this->isPhoneConfirmed();

            $userData = $this->_service->checkBallot($this->client['SUDIR_ID']);
            if (! $userData) {
                return $this->getTplPath('error_user.tpl');
            }

            $guid = $this->_service->getGuid($userData);
            $host = $this->_config->get('service/election/host');

            $userData = $this->_service->getBallot($this->client['SUDIR_ID']);
            if (! $userData) {
                return $this->getTplPath('error_user.tpl');
            }

            header("Location: $host/election/check/$guid");
            die();

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

    /**
     * @return bool
     * @throws LogicException
     */
    protected function isPhoneConfirmed()
    {
        $key = "sms|confirmed|" . $this->client['SUDIR_ID'];
        $result = MemoryCache::get($key);

        if ($result !== true) {
               throw new LogicException('Телефон не был подтвержден', [
                   'errorMessage' => 'В кеше отсутствует запись о подтверждении телефона'
               ]);
        }

        MemoryCache::delete($key);

        return $result;
    }

}