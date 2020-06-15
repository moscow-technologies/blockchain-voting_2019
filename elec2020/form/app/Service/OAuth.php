<?php

namespace App\Service;

/**
 * Description of oauth
 *
 * @author Blakkky
 */

use App\Exceptions\RedirectRequired;
use App\Service;
use Illuminate\Contracts;
use Illuminate\Support\Facades\Request;

class OAuth {

	use CurlTrait;

	private static $USER_ENV = 'OAUTH_ENV';
	public static $USER_TOKEN = 'OAUTH_TOKEN';
	private static $USER_DATA_KEY = 'oauth|';
	private static $USER_DATA_EXPIRES = 300; // 5 минут
	private static $OAUTH_ENABLED = null;
	private static $LOG_FILE = 'oauth.log';

	/** @var OAuth Инстанс класса */
    private static $instance = null;

	private $loginURL = '';
	private $tokenURL = '';
	private $userDataUrl = '';
	private $clientId = '';
	private $clientSecret = '';
	private $backURL = '';
    private $token = '';
	private $forceAuthorize = false;

	/**
	 * Конструктор
	 */
	public function __construct() {
		$this->loginURL     = \params::$params['services']['sudir_oauth']['login_url'];
		$this->tokenURL     = \params::$params['services']['sudir_oauth']['token_url'];
		$this->userDataUrl  = \params::$params['services']['sudir_oauth']['user_data'];
		$this->clientId     = \params::$params['services']['sudir_oauth']['client_id'];
		$this->clientSecret = \params::$params['services']['sudir_oauth']['client_secret'];
		$this->backURL      = \params::$params['services']['sudir_oauth']['backurl'];
        $this->token        = cfg('services/sudir_oauth/cookie_token','Ltpatoken2');
        if (!empty($_COOKIE[$this->token])) {
            $_COOKIE[$this->token] = str_replace(' ','+',$_COOKIE[$this->token]);
        }
		$this->initCurlCfg();
	}

	public function getUserDataFromServiceLegacy() {
	    if (!array_key_exists($this->token, $_COOKIE)) {
	        return null;
        }
        self::log('NETWORK', 'Читаем данные пользователя из сервиса - вход');
        $result = $this->curl($this->userDataUrl,array(),array(),array($this->token.'='.$_COOKIE[$this->token]));
        if (empty($result)) {
            return null;
        }
        $this->check_valid_answer($result);
        $userData = array_merge($this->extractUserData($result), $this->extractLegalData($result), $this->extractESIAData($result));
        return $userData;
    }

    /**
     * Вынуть из ответа СУДИР данные о пользователе
     * @param array $result
     * @return array
     */
    private function extractUserData($result) {
        self::log('INFO', 'Вынули данные пользователя из ответа');
        if (empty($result['guid'])) return array();
        return array(
            'SSO_ID' => $this->getFieldData($result, 'guid'),
            'first_name' => $this->getFieldData($result, 'firstName'),
            'last_name' => $this->getFieldData($result, 'lastName'),
            'middle_name' => $this->getFieldData($result, 'middleName'),
            'mail' => $this->getFieldData($result, 'mail'),
            'mobile' => $this->getFieldData($result, 'mobile'),
        );
    }

    /**
     * Получение значения из массива с проверкой на существование
     * @param array $result
     * @param string $name
     * @return string
     */
    private function getFieldData($result, $name)
    {
        $returnValue = '';

        if (!empty($result[$name])) {
            $returnValue = $result[$name];
        }

        return $returnValue;
    }

    /**
     * Вынуть из ответа СУДИР данные о ЕСИА-токенах
     * @param array $result
     * @return array
     */
    private function extractESIAData($result) {
        self::log('INFO', 'Вынули данные ЕСИА из ответа)');
        if (!isset($result['esiaDataVO'])||!isset($result['guid']))
            return array();
        return array(
            'SSO_ID' => $result['guid'],
            'first_name' => $result['firstName'],
            'last_name' => $result['lastName'],
            'middle_name' => $result['middleName'],
            'mail' => $result['mail'],
            'mobile' => isset($result['phone'])?$result['phone']:$result['mobile'],
            'esiaDataVO'=>$result['esiaDataVO']
        );
    }
    
    /**
     * Вынуть из ответа СУДИР данные о ЮЛ/ЭЦП
     * @param array $result
     * @return array
     */
    private function extractLegalData($result) {
        /*
         * {"guid":"9b3d0147-66f3-4ae5-bf97-9ecce4d3caa4","firstName":"Пользователь Первый","lastName":"Тестовый","middleName":"","phone":"","mail":"first@test.local",
         * "legalPersonVO":{
         * 	"corpid":"d39e5bee-98fe-49ab-9861-c168e6116f62",
         * 	"certificateid":”6FE2555B0000000138A7”,
         * 	"corpInn":"7702222222",
         * 	"corpOgrn":"1137702222228"
         * }}
         */

        self::log('INFO', 'Вынули данные ЮЛ/ИП из ответа');
        if (!isset($result['legalPersonVO'])||!isset($result['guid']))
            return array();
        $token = $this->parsedIdToken();

        $legalData = array(
            'SSO_ID' => $result['guid'],
            'first_name' => $result['firstName'],
            'last_name' => $result['lastName'],
            'middle_name' => $result['middleName'],
            'mail' => $result['mail'],
            'mobile' => isset($result['phone'])?$result['phone']:$result['mobile'],
            'KORP_ID' => $result['legalPersonVO']['corpId'],
            'ogrn' => $result['legalPersonVO']['corpOgrn'],
            'inn' => $result['legalPersonVO']['corpInn'],
            //'cert_serial' => $result['legalPersonVO']['certificateID'],
            'LegalisIp' => mb_strlen($result['legalPersonVO']['corpOgrn'])==15?1:0,
            'LegalName' => $token['org_name'],
            'LegalInn' => $result['legalPersonVO']['corpInn'],
            'LegalOgrn' => $result['legalPersonVO']['corpOgrn'],
            'LegalHeadPosition' => $token['org_title'],
            'LegalAddress' => $token['org_state'].','.$token['org_street'],
            'LegalCity' => $token['org_city'],
            'LegalEmail' =>$token['org_email'],

        );
        if (empty($legalData['LegalName'])) {
            if ($legalData['LegalisIp'] == 1) {
                $legalData['LegalName']= 'ИП '.$legalData['last_name'].' '.$legalData['first_name'].' '.$legalData['middle_name'];
            }
            else {
                $legalData['LegalName']='Без названия';
            }
        }
        return $legalData;
    }

    /**
	 * Получить данные пользователя из сервиса СУДИР
	 * @return array
	 */
	public function getUserDataFromService() {
        $token  = $this->token();
        if (empty($token)) {
            return null;
        }
		$headers   = array(
			'Authorization: Bearer '.$token,
		);
                //Сходим за данными
        $curl = new Curl();
        $result = $curl->get($this->userDataUrl, [], $headers);
        app()['log']->info('Getting user from service', ['response' => $result]);
        $result = json_decode($result, true);
		$this->check_valid_answer($result);
        $sso = $this->getFieldData($result, 'guid');
        if (empty($sso)) {
            return null;
        }
        $parsedToken = $this->parsedIdToken();

        $userData = array(
                'SSO_ID' => $sso,
                'first_name' => $this->getFieldData($result, 'FirstName'),
                'last_name' => $this->getFieldData($result, 'LastName'),
                'middle_name' => $this->getFieldData($result, 'MiddleName'),
                'mail' => $this->getFieldData($result, 'mail'),
                'mobile' => $this->_extractMobile($result),
                'trusted'=>$this->getFieldData($result, 'trusted'),
                'isEsia'=>in_array('externalIdps:esia:esia_1',$parsedToken['amr']),
                //'KORP_ID' => $result['legalPersonVO']['corpid'],
                'ogrn' => $this->getFieldData($result, 'org_OGRN'),
                'LegalEmail' => $this->getFieldData($result, 'org_email'),
                'LegalName' => $this->getFieldData($result, 'org_name'),
                'LegalState' => $this->getFieldData($result, 'org_state'),
                'LegalCity' => $this->getFieldData($result, 'org_city'),
                'LegalStreet' => $this->getFieldData($result, 'org_street'),
                'LegalUnit' => $this->getFieldData($result, 'org_unit'),
                'LegalTitle' => $this->getFieldData($result, 'org_title')
         );
        if ($userData['isEsia']) {
            $userData['esiaDataVO'] = array(
                'esiaAccessToken'=>'',
                'esiaAccessTokenExp'=>'',
                'esiaRefreshToken'=>'',
                'esiaPersonTrusted'=>array(),
                'esiaId'=>''
            );
        }

        $innFromToken = $parsedToken['org_INN'] ?? null;
        $userData['is_legal'] = $innFromToken !== null && strlen($innFromToken) > 0;
        app()['log']->info('User successfully authorized', ['jsonResponse' => $userData, 'jsonRequest' => $parsedToken]);
		return $userData;
	}

	private function _extractMobile(array $data) {
        if (!array_key_exists('mobile', $data)) {
            return null;
        }
        $mobile = $data['mobile'];
        if (strlen($mobile) === 11 && strpos($mobile, '7') === 0) {
            return substr($mobile, 1);
        }
        return $mobile;
    }

     /**
	 * Проверим на корректность возвращаемых данных  от курла
	 * @param mixed $result
	 * @return array
	 */
	private function check_valid_answer($result) {
		self::log('INFO', 'Проверим ответ от сервиса на валидность', $result);
		if (is_string($result)&&$this->forceAuthorize) {
			self::log('INFO', 'Строка в ответе! Очищаем сессию.', $result);
			$_SESSION[self::$USER_TOKEN]=array();

			$this->redirectToLogin();
		}
    }

    public function processAuthCodeNew(string $authCode, Contracts\Session\Session $session) {
        $postData = array(
            'redirect_uri'  => $this->backURL,
            'grant_type'    => 'authorization_code',
            'code'          => $authCode,
            'client_secret' => $this->clientSecret,
            'client_id'     => $this->clientId,
        );
        $result = $this->curl($this->tokenURL, $postData);
        app()['log']->info('Received token data from sudir', ['response' => $result]);

        $data = array(
            $this->token    => app()['request']->cookie($this->token),
            'id_token'      => $result['id_token'],
            'access_token'  => $result['access_token'],
            'expires'       => $result['expires_in'],
            'refresh_token' => $result['refresh_token'] ?? null,
        );
        $session->put(self::$USER_TOKEN, $data);
        $session->remove(User::SESSION_KEY_USER);
    }

    public function verifyCookieToken(Contracts\Session\Session $session) {
	    $isVerifyCookieToken = \params::$params['services']['sudir_oauth']['is_verify_cookie_token'] ?? false;
	    if (!$isVerifyCookieToken) {
	        return true;
        }
	    $tokenData = $session->get(self::$USER_TOKEN);
        $storedToken = $tokenData[$this->token];
        if (empty($storedToken)) {
            return true;
        }
	    $tokenFromCookie = app()['request']->cookie($this->token) ?? null;
	    return $tokenFromCookie === $storedToken;
    }

	/**
	 * Прочитать токен
	 * @return string
	 */
	private function token() {
	    return app()['session.store']->get(self::$USER_TOKEN)['access_token'] ?? null;
	}

     /**
	 * Прочитать или записать токен
	 * @param string $newToken
	 * @return string
	 */
	public function parsedIdToken() {
	    $idToken = app()['session.store']->get(self::$USER_TOKEN)['id_token'] ?? null;
		$parsed = array();
            if (!empty($idToken)) {
               $splited = explode('.',$idToken);
               $parsedJson =  $this->decode($splited[1]);
               $parsed = json_decode($parsedJson,true);
            }
		return $parsed;
	}

    protected function decode($input) {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $input .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }

	public function buildAuthURL($esia=false) {
                if ($esia) {
                     $this->saveEnv();
                    return $this->loginURL . '?redirect_uri=' . urlencode($this->backURL) . '&response_type=code&scope=openid+profile+contacts&bip_action_hint=used_externalIdps:esia:esia_1&prompt=login&client_id=' . $this->clientId;
                }
                else {
                    return $this->loginURL . '?redirect_uri=' . urlencode($this->backURL) . '&response_type=code&scope=openid+profile+contacts&client_id=' . $this->clientId;
                }
	}

	public function redirectToLogin($referer=false) {
		if ($referer) {
			$_SERVER['REQUEST_URI'] = $referer;
		}
		$this->saveEnv();
		self::log('NETWORK', 'Отправили вводить логин/пароль', $this->buildAuthURL());
		throw new RedirectRequired($this->buildAuthURL());
	}

	private function saveEnv() {
		if (empty($_SESSION[self::$USER_ENV]) || !is_array($_SESSION[self::$USER_ENV])) {
			$_SESSION[self::$USER_ENV] = array();
		}

                if (!empty($_REQUEST['redirect_uri'])&&($_REQUEST['login']==true)) {
                    $data = array(
                        'location' => $_REQUEST['redirect_uri'],
                        'request' => serialize($_REQUEST),
                    );
                }
                else {
                    $data = array(
                        'location' => !empty($_SERVER['X-Rewrite-URL']) ? $_SERVER['X-Rewrite-URL'] : Request::fullUrl(),
                        'request' => serialize($_REQUEST),
                    );
                }
                $sess = array(
                    'location' => (!empty($_SESSION[self::$USER_ENV]['location']))? $_SESSION[self::$USER_ENV]['location'] : '',
                    'request'  => (!empty($_SESSION[self::$USER_ENV]['request'])) ? serialize($_SESSION[self::$USER_ENV]['request']) : '',
                );
		$changed = array_diff($sess,$data);
		if (!empty($changed)) {
			$_SESSION[self::$USER_ENV] = $data;
			$this->reconstruct_url($_SESSION[self::$USER_ENV]['location']);
			self::log('INFO', 'Сохранили окружение', $_SESSION[self::$USER_ENV]);
		}
	}

	public function getRedirectionUrl(Contracts\Session\Session $session) {
		return \lib::getMainUrl() . $session->get('request_uri');
	}

	private function reconstruct_url(&$url){
		if (empty($url)) {
			$url = \lib::getMainUrl();
		}
		if (preg_match('/application\/index\.php\?org\_id\=([^\&]+)\&form\_id\=([^\&\#]+)/',$url))
			$url = preg_replace('/(.*application\/)index\.php\?org\_id\=([^\&]+)\&form\_id\=([^\&\#]+)/',"$1$2/$3",$url);

		if (preg_match('/(.*)oauth\/index\.php/',$url) && !preg_match('/return\=/',$url))
			$url = preg_replace('/(.*)oauth\/index\.php.*/',"$1",$url);

		if (preg_match('/(.*)ru\/index\.php\?/',$url))
			$url = preg_replace('/(.*)ru\/index\.php\?.*/',"$1ru",$url);

        if (preg_match('/index\.php\?*$/',$url))
                $url = preg_replace('/index\.php\?*$/',"",$url);


        if (preg_match('/index\.php\?id\=([^\&]+)/',$url))
               	$url = preg_replace('/index\.php\?id\=([^\&]+)/',"$1/",$url);

		if (strpos($url,'&')>=0&&strpos($url,'?')===false) {
			//случай, когда потеряли ?
			$url = preg_replace('/\&/', '?', $url,1);
		}

		if (!preg_match('/^http/',$url))
			$url = \lib::getMainUrl().$url;
	}


    /**
     * Получить Инстанс класса
     * @return OAuth
     */
    public static function getInstance()
    {
        if (self::checkOAuthEnabled() && empty(self::$instance)) {
            self::$instance = new OAuth();
        }

        return self::$instance;
    }

    private static function log($type, $message, $data = null) {
        app()['log']->info($message, ['data' => $data]);
//		$actions = array();
//		if (cfg('services/sudir_oauth/debug',false)) $actions[]='debug';
//		if (in_array(session_id(),cfg('services/sudir_oauth/log_session',array()))) $actions[]='session';
//        if ($type == 'CURL-ERROR') {
//            $actions[]='CURL-ERROR';
//        }
//		if (empty($actions)) return false; //ничего не пишем в логи,если полный и частичный выключены
//
//		$logfile = \params::$params['services']['sudir_oauth']['log_dir'];
//		if (!file_exists($logfile)) mkdir($logfile, 0777, true);
//
//		$logstr = '['.posix_getpid().'][' . date('Y-m-d H:i:s') . '] ' . ($type ? strtoupper($type) : 'INFO') . ': ' . $message;
//		if ($data !== null)
//			$logstr .= "; " . 'DATA: ' . str_replace(array("\n", "\t", "  ", "  ", "  "), array(" ", " ", " ", " ", " "), var_export($data, true));
//		$logstr .= "\n";
//		//$logstr .= "\t" . 'DATA: ' . var_export($data, true) . "\n";
//		if (in_array('debug',$actions)) {
//			$logfile1 = $logfile . self::$LOG_FILE;
//			file_put_contents($logfile1, $logstr, FILE_APPEND);
//			@chmod($logfile1, 0666);
//		}
//		if (in_array('session',$actions)) {
//			$logfile2 = $logfile .session_id().'.log';
//			file_put_contents($logfile2, $logstr, FILE_APPEND);
//			@chmod($logfile2, 0666);
//        }
//		if (in_array('CURL-ERROR', $actions)) {
//			$logfile3 = $logfile .'curl-error.log';
//			file_put_contents($logfile3, $logstr, FILE_APPEND);
//			@chmod($logfile3, 0666);
//		}
//		return true;
    }

    /**
     * Проверить, включен ли oAuth?
     * @return boolean
     */
    public static function checkOAuthEnabled() {
        return true;

        if (cfg('services/sudir_oauth/allways',false)) {
            return true;
        }
        if (!empty($_SERVER['HTTP_NOT_IGNORE'])&&!empty($_SERVER['HTTP_IV_USER'])&&md5($_SERVER['HTTP_IV_USER'].\params::$params['reset-cache'])) return false;


        if (self::$OAUTH_ENABLED === null) {
            // временный код: загружаем параметр из системной таблицы
            $sql   = "SELECT VALUE FROM SYSTEM_GLOBAL_PARAMS WHERE SYSTEM_NAME='use_sudir_oauth'";
            $key   = md5($sql);
            $param = Service\Cache::get($key);

            if (!$param) {

                $param = db::sql_select($sql);
                if ($param) {

                    $param = $param[0]['VALUE'];
                    self::log('DEBUG', 'Проверка в бд oAuth: ' . ($param?1:0)/* , debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS) */);
                    Service\Cache::set($key, $param, 60);
                }
            }
            else {
                self::log('DEBUG', 'Проверка в кеше oAuth: ' . ($param?1:0)/* , debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS) */);

            }

            \params::$params['use_sudir_oauth']['value'] = $param;
            self::$OAUTH_ENABLED = (bool) cfg('use_sudir_oauth/value',false);
        }
        return self::$OAUTH_ENABLED;
    }
}
