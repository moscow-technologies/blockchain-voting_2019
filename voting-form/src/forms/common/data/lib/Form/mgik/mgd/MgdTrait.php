<?php

namespace Itb\Mpgu\Form\mgik\mgd;

use db;
use params;
use Itb\Mpgu\Lib\Config\PoolConfig;
use Itb\Mpgu\Lib\ProfileLk;
use Itb\Mpgu\Form\mgik\mgd\LogicException;

/**
 * @property array $client
 * @property array $logData
 */
trait MgdTrait
{
    /** @var array */
    protected $_config;

    /** @var array Участвующие в выборах районы */
    protected $_allowed_districts;

    /** @var array Профиль участника */
    protected $_profile;

    /** @var array Ошибки валидации профиля */
    protected $_profile_errors = [];

    /**
     * @param $smarty
     */
    public function __construct($smarty)
    {
        parent::__construct($smarty);

        params::$params['services']['mostiser']['on'] = false;
        params::$params['services']['banner']['on'] = false;
        params::$params['services']['mos_ru']['widgetLive'] = false;
        params::$params['services']['elk']['elk_block_always'] = true;
        $this->download_app_file_enabled = false;

        $this->_config = PoolConfig::me()->conf('Mgik');
        $this->_allowed_districts = $this->_config->get('allowed_districts');

        $this->getRevocation()->enableRevocation([], ['1077', '1077.2']);

        $this->registerAjaxModule('mgd', new MgdAjaxHandler());
    }

    protected function show()
    {
        $this->smarty->assign('skip_try_again_later', false);
        $this->smarty->assign('allowed_districts', $this->getAllowedDistrictsAsString());

        if (isset($_GET['revocation']) && $_GET['revocation']) {
            return parent::show();
        }

        try {
            $this->validateSubmittedApps();
            $this->getProfile();
            $this->validateProfile();

            if ($this->_profile_errors) {
                $this->logError('Ошибка проверки профиля', [
                    'errors' => $this->_profile_errors,
                    'profile' => $this->_profile,
                ], $this->getProfileErrorsExtraData());

                $this->smarty->assign('hide_cutalog_button', true);
                $this->smarty->assign('profile_errors', $this->_profile_errors);
                $this->smarty->assign('profile_validators', $this->_config->get('registration/profile_validators'));

                return $this->getTplPath('error_profile.tpl');
            }

            $this->smarty->assign('security_js', $this->_config->get('service/security'));
            $this->smarty->assign('profile', [
                'flat' => $this->_profile['REG_ADDRESS']['FLAT'] ?? null,
                'unad' => $this->_profile['REG_ADDRESS']['UNAD'] ?? null,
                'unom' => $this->_profile['REG_ADDRESS']['UNOM'] ?? null,
                'gender' => mb_strtoupper($this->_profile['PERSON']['GENDER']) ?? null,
            ]);

            return parent::show();

        } catch (LogicException $e) {
            $this->logError($e->getMessage(), $e->getData());

            $this->smarty->assign('hide_cutalog_button', true);
            $this->smarty->assign('error_title', 'Произошла ошибка.');
            $this->smarty->assign('message', $e->getMessage());

            return $this->getTplPath('error_exception.tpl');

        } catch (\Exception $e) {
            $this->logError('Произошла неизвестная ошибка.', $e->getMessage() . "\n" . $e->getTraceAsString());

            $this->smarty->assign('hide_cutalog_button', true);
            $this->smarty->assign('error_title', 'Произошла ошибка.');
            $this->smarty->assign('message', 'Произошла неизвестная ошибка.');

            return $this->getTplPath('error_exception.tpl');
        }
    }

    /**
     * @param $app_id
     * @param $context
     * @return bool
     */
    protected function sendRequest($app_id, $context = null)
    {
        // Отправка заявления на регистрацию
        if (! isset($_POST['revocation'])) {
            $request = new TaskRegistrationRequest($this->client, $this->fields, $this->app);
            $request->setProfile($this->_profile);
            $request->addQueueTask();

            return true;
        }

        // Отзыв заявления
        if ($this->extra_status_send && ($this->addExtraData || $this->isRevocationAllowed())) {
            $this->sendRevocationRequest();

            $request = new TaskRevocationRequest($this->client, [], $this->app);
            $request->addQueueTask();

            return true;
        }

        return true;
    }

    /**
     * Отзыв заявления
     * Повторяет логику из v6_1.form.crm.trait.php
     * @return void
     */
    protected function sendRevocationRequest()
    {
        if (isset($_POST['field']['internal.status'])) {
            $status_code = $_POST['field']['internal.status'];
        } elseif ($this->isExtraStatus($this->app['STATUS'])) {
            $status_code = $this->app['STATUS'];
        } else {
            $status_code = $this->app['STATUS_CODE'];
        }

        $file_str = '';

        $arg = array($this->app['APP_ID']);

        if ($this->isRevocationAllowed()) {
            $arg = array_merge($arg, array($this->get_revocation_code(), $this->get_revocation_status(), '', $this->get_revocation_name(), false, $file_str));
        } else {
            if (isset($this->extra_status_arr[$status_code])) {
                $this->extra_status_arr[$status_code][] = $file_str;
                $arg = array_merge($arg, $this->extra_status_arr[$status_code]);
            } elseif (isset($this->extra_status_arr['*'])) {
                $this->extra_status_arr['*'][] = $file_str;
                $arg = array_merge($arg, $this->extra_status_arr['*']);
            }
        }

        if (!$this->isExtraStatus($arg[1]) || $this->isRevocationAllowed()) {
            $this->app['EXTRA_INFO'] = $arg[4];
            $this->app['STATUS_CODE'] = $arg[1];
            $this->app['STATUS_TITLE'] = $arg[2];
            $this->app['MESSAGE'] = $file_str;
        }

        if ($this->finalStep) { //отправлять только при финальной отправке 18918
            if ($this->isExtraStatus($arg[1])) {
                $this->app['STATUS_CODE_ACTION'] = $arg[1];
            }

            $arg[5] = false;

            call_user_func_array(['m_application', 'update_status_by_app_id'], $arg);
        }
    }

    /**
     * Успешное заявление можно подать только 1 раз,
     * повторное заявление можно подавать 1 раз в 24 часа.
     * @return bool
     * @throws LogicException
     * @throws \Exception
     */
    protected function validateSubmittedApps()
    {
        $startDate = $this->_config->get('registration/start_date');
        $statuses = $this->_config->get('registration/statuses');
        $allowPeriod = $this->_config->get('registration/period');

        $params = [
            'client_id' => $this->client['PGU_USER_ID'],
            'form_id' => $this->form_id,
            'start_date' => $startDate
        ];

        $apps = db::sql_select('
            SELECT APP_ID, APP_DATE, STATUS_CODE 
            FROM P_APP 
            WHERE CL_CLIENT_ID = :client_id 
              AND FORM_ID = :form_id 
              AND P_LEGAL_ID IS NULL
              AND APP_DATE >= :start_date',
            $params);

        if (! $apps) {
            return true;
        }

        foreach ($apps as $app) {
            if ($statuses['allow'] && ! in_array($app['STATUS_CODE'], $statuses['allow'])) {
                throw new LogicException('У Вас уже есть поданное завление. Повторная отправка заявления не возможна.' , [
                    'params' => $params,
                    'app' => $app,
                    'statuses' => $statuses['allow'],
                ]);
            }

            if (in_array($app['STATUS_CODE'], $statuses['disallow'])) {
                $timeZone = new \DateTimeZone('Europe/Moscow');
                $nowDatetime = new \DateTime('now', $timeZone);
                $appDatetime = \DateTime::createFromFormat('YmdHis', $app['APP_DATE'], $timeZone);

                $diff = $nowDatetime->diff($appDatetime);
                $diffInHours = $diff->h + ($diff->days * 24);

                if ($diffInHours < $allowPeriod) {
                    throw new LogicException('Периодичность подачи и отзыва заявления ограничена одним заявлением в сутки. Попробуйте повторить запрос позднее.', [
                        'params' => $params,
                        'app' => $app,
                        'statuses' => $statuses['disallow'],
                        'allowPeriod' => $allowPeriod,
                        'nowDatetime' => $nowDatetime->format('d.m.y H:i:s'),
                        'appDatetime' => $appDatetime->format('d.m.y H:i:s'),
                        'diff' => $diffInHours,
                    ]);
                }
            }
        }

        return true;
    }

    /**
     * @return bool
     * @throws LogicException
     */
    protected function getProfile()
    {
        $profileLk = new ProfileLk();
        list($profile, $code) = $profileLk->get($this->client['SUDIR_ID'], ['PERSON', 'PASSPORT_RF', 'REG_DATA', 'REG_ADDRESS']);
        $this->_profile = $profile;

        if (200 !== $code) {
            throw new LogicException('Не удалось получить данные пользователя из Личного кабинета.', [
                'code' => $code,
                'sudir_id' => $this->client['SUDIR_ID'],
                'profile' => $profile,
            ]);
        }

        return true;
    }

    /**
     * @throws \Exception
     * @return bool
     */
    protected function validateProfile()
    {
        $validators = $this->_config->get('registration/profile_validators');
        $result = true;

        if (! $validators) {
            return $result;
        }

        foreach ($validators as $validator => $isEnable) {
            $method = 'validateProfile' . ucfirst($validator);

            if ($isEnable && method_exists($this, $method)) {
                $result = call_user_func_array([$this, $method], [$validator]) && $result;
            }
        }

        return $result;
    }

    /**
     * Валидация возраста
     * @param string $field
     * @return bool
     * @throws \Exception
     */
    protected function validateProfileAge(string $field)
    {
        if (! isset($this->_profile['PERSON']['BIRTHDATE'])) {
            $this->_profile_errors[$field] = false;

            return false;
        }

        $tz = new \DateTimeZone('Europe/Moscow');
        $birthday = \DateTime::createFromFormat('d.m.Y',  $this->_profile['PERSON']['BIRTHDATE'], $tz);

        if (! $birthday) {
            $this->_profile_errors[$field] = false;

            return false;
        }

        $birthday->setTime(0, 0, 0);

        $target = (new \DateTime(static::START_DATE, $tz))
            ->setTime(0, 0, 0);

        if (self::MIN_AGE > $target->diff($birthday)->y) {
            $this->_profile_errors[$field] = false;

            return false;
        }

        return true;
    }

    /**
     * Валидация признака подтверждения в МФЦ
     * @param string $field
     * @return bool
     */
    protected function validateProfileIsConfirmed(string $field)
    {
        if (! isset($this->_profile['REG_DATA']['IS_CONFIRMED_OFFLINE']) || $this->_profile['REG_DATA']['IS_CONFIRMED_OFFLINE'] !== 'true') {
            $this->_profile_errors[$field] = false;

            return false;
        }

        return true;
    }

    /**
     * Валидация пола
     * @param string $field
     * @return bool
     */
    protected function validateProfileGender(string $field)
    {
        $gender = $this->_profile['PERSON']['GENDER'] ?? null;
        $genders = ['m', 'f'];

        if (! $gender || ! in_array(mb_strtolower($gender), $genders)) {
            $this->_profile_errors[$field] = false;

            return false;
        }

        return true;
    }

    /**
     * Валидация паспорта
     * @param string $field
     * @return bool
     */
    protected function validateProfilePassport(string $field)
    {
        if (! isset($this->_profile['PASSPORT_RF']['NUMBER']) || ! $this->_profile['PASSPORT_RF']['NUMBER']) {
            $this->_profile_errors[$field] = false;

            return false;
        }

        if (! isset($this->_profile['PASSPORT_RF']['VERIFY_DATE']) || ! $this->_profile['PASSPORT_RF']['VERIFY_DATE']) {
            $this->_profile_errors[$field] = false;

            return false;
        }

        return true;
    }

    /**
     * Валидация адреса регистрации
     * @param string $field
     * @return bool
     */
    protected function validateProfileRegAddress(string $field)
    {
        $district = $this->_profile['REG_ADDRESS']['DISTRICTID'] ?? null;
        $verifyDate = $this->_profile['REG_ADDRESS']['VERIFY_DATE'] ?? null;

        $validationDate = $this->_profile['REG_ADDRESS']['VALIDATION_DATE'] ?? null;
        $validationStatus = $this->_profile['REG_ADDRESS']['VALIDATION_STATUS'] ?? null;

        if ($district && $verifyDate) {
            return true;
        }

        if ($district && $validationDate && $validationStatus === '1') {
            return true;
        }

        $this->_profile_errors[$field] = false;

        return false;
    }

    /**
     * Валидация района
     * @param string $field
     * @return bool
     */
    protected function validateProfileDistrict(string $field)
    {
        if (empty($this->_allowed_districts)) {
            return true;
        }

        $district = (int) $this->_profile['REG_ADDRESS']['DISTRICTID'] ?? null;

        if (! $district || ! isset($this->_allowed_districts[$district])) {
            $this->_profile_errors[$field] = false;

            return false;
        }

        return true;
    }

    /**
     * @param string $separator
     * @return string
     */
    protected function getAllowedDistrictsAsString($separator = ';')
    {
        return implode($separator, array_map(function($value) {
            return preg_replace('/\s+/', '', $value);
        }, array_values($this->_allowed_districts)));
    }

    /**
     * @param string $message
     * @param mixed $data
     * @param array $extraFields
     */
    protected function logError(string $message, $data, $extraFields = [])
    {
        $this->logData['error'] = 1;
        $this->logData['errorMessage'] = $data;

        if ($extraFields) {
            $this->logData = array_merge($this->logData, $extraFields);
        }

        $this->logTrait($message, $this->logData);
    }

    protected function getProfileErrorsExtraData()
    {
        $fields = [];
        foreach ($this->_profile_errors as $field => $value) {
            $fields["error" . ucfirst($field)] = true;
        }

        return $fields;
    }

}