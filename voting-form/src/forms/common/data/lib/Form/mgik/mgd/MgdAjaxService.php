<?php

namespace Itb\Mpgu\Form\mgik\mgd;

use params;
use AjaxModule;
use User;
use Itb\Mpgu\Core\Base\HighloadCacheAjax;
use Itb\Mpgu\Lib\Config\PoolConfig;

require_once params::$params['common_data_server']['value'].'module/client/bti.interface.php';
require_once params::$params['common_data_server']['value'].'include/user.class.php';

/**
 * @property array $result
 */
class MgdAjaxService extends HighloadCacheAjax implements AjaxModule
{
    /** @var string */
    protected $action;

    /** @var array  */
    protected $allowedActions = [
        'view',
    ];

    /** @var PoolConfig */
    protected $config;

    public function handle($action, $form)
    {
        $this->action = $action;
        $method = "action" . ucfirst($action);

        $user = User::get_current_client();
        if (! $user) {
            return $this->error('Вы не авторизованы. Пожалуйста, перезайдите.');
        }

        if (in_array($action, $this->allowedActions) && method_exists($this, $method)) {
            $this->config = PoolConfig::me()->conf('Mgik');

            return call_user_func([$this, $method]);
        }

        return $this->error('Метод не доступен. Попробуйте повторить запрос позднее.');
    }

    protected function actionView()
    {
        $tx = $_REQUEST['tx'] ?? null;
        if (! $tx) {
            return $this->error('Укажите обязательный параметр "Секретный ключ"');
        }

        try {
            $service = new Service;
            $result = $service->decryptTx($tx);
            $deputies = $service->getDistrictDeputies($result['districtId']);
            $deputy = $deputies[$result['deputyId']] ?? null;

            if (! $deputy) {
                return $this->error();
            }

            $this->result = $deputy;

            return json_encode($this->result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } catch (LogicException $e) {
            $this->result['logData'] = $e->getData();

            return $this->error($e->getMessage());
        }
    }

    private function error(string $message = '')
    {
        $this->result['error'] = 1;
        $this->result['errorMessage'] = $message ? $message : 'Произошла непредвиденная ошибка. Попробуйте повторить запрос позднее.';
        $this->result['headerSended'] = true;

        return json_encode($this->result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

}