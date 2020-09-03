<?php

namespace App\Service;

use App\Service\Config\PoolConfig;
use App\Service\Cache as MemoryCache;
use App\Exceptions\LogicException;
use Illuminate;

class Election
{
    const DEFAULT_ERROR_MESSAGE = 'По техническим причинам сервис временно недоступен. Пожалуйста, попробуйте позже.';

    private $_SYSTEM, $_TOKEN;

    /** @var Config\FileConfig */
    private $_config;

    /** @var array */
    protected $logData = [];

    /** @var Ballot */
    private $_ballotService;

    /** @var Illuminate\Session\Store */
    private $_session;

    public function __construct(Ballot $ballotService = null)
    {
        $this->_ballotService = $ballotService;
        $this->_config = PoolConfig::me()->conf('Mgik');
        $this->_SYSTEM = $this->_config->get('service/system', 'MGD');
        $this->_TOKEN = $this->_config->get('service/token', 'MGD');
        $this->_session = app()['session.store'];
    }

    /**
     * @param $guid
     * @return string
     * @throws LogicException
     */
    public function checkSign($guid)
    {
        $_SERVER['HTTP_SYSTEM'] = $this->_SYSTEM;
        $_SERVER['HTTP_SYSTEMTOKEN'] = $this->_TOKEN;
        return $this->_ballotService->checkSign([
            'base64body' => $guid,
        ]);
    }

    /**
     * @param $guid
     * @return array
     * @throws LogicException
     */
    public function checkGuid($guid)
    {
        $_SERVER['HTTP_SYSTEM'] = $this->_SYSTEM;
        $_SERVER['HTTP_SYSTEMTOKEN'] = $this->_TOKEN;
        $result = $this->_ballotService->checkGuid([
            'guid' => $guid,
        ]);

        $id = $result['id'] ?? null;
        $guid = $result['guid'] ?? null;
        $district = $result['okrug'] ?? null;
        $url = $result['url'] ?? null;
        $opened = $result['opened'] ?? null;
        $sessId = $result['sessId'] ?? null;
        $log = [
            'voitingId' => $id,
            'url' => $url,
            'guid' => $guid,
            'response' => $result,
        ];

        if (!$guid) {
            $exception = new LogicException('Бюллетень не существует.');
            $exception->setSystemMessage('Ballot does not exist');
            throw new LogicException('Бюллетень не существует.');
        }
        if (!$district) {
            $exception = new LogicException('Бюллетень не привязана к избирательному округу.');
            $exception->setSystemMessage('Ballot is not tied to any voting district');
            throw $exception;
        }
        if (!$url) {
            $exception = new LogicException('Не удается проверить действительность ссылки на бюллетень.');
            $exception->setSystemMessage('Unable to assess ballot link validity');
            throw $exception;
        }
        if ($opened && !empty($sessId) && $sessId !== $this->_session->getId()) {
            $exception = new LogicException('Вы уже открывали бюллетень в другом браузере, вы можете отправить голос только на той вкладке браузера');
            $exception->setSystemMessage('Already opened in another browser');
            throw $exception;
        }

        return $result;
    }

    /**
     * @param string $guid
     * @param array $ballot
     * @return string
     * @throws LogicException
     */
    public function sendGuid($guid, $ballot)
    {
        $_SERVER['HTTP_SYSTEM'] = $this->_SYSTEM;
        $_SERVER['HTTP_SYSTEMTOKEN'] = $this->_TOKEN;
        return $this->_ballotService->sendGuid([
            'guid' => $guid,
            'base64body' => base64_encode(json_encode($ballot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES))
        ]);
    }

    /**
     * Возвращает список депутатов в округе
     * @param integer|null $district_id
     * @param bool $force
     * @return array
     * @throws LogicException
     */
    public function getDistrictDeputies(string $refStrict = null, $districtId = null, bool $force = false): array
    {
        if (!empty($refStrict)) {
            $cacheKey = 'lib|refArm|'.$refStrict;
            $ref = null;
            if (!$force) {
                $ref = MemoryCache::get($cacheKey);
            }
            if (!$ref) {
                $url = PoolConfig::me()->get('Arm')->get('serviceVoiting/ref').$refStrict;
                $ch = curl_init();

                $headers = [];
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                array_push($headers, "Content-type: application/json", "Cache-Control: no-cache", "Pragma: no-cache", "Connection: keep-alive", "accept: application/json");
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
                curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
                curl_setopt($ch, CURLOPT_VERBOSE, 1);
                curl_setopt($ch, CURLOPT_TIMEOUT, PoolConfig::me()->get('Arm')->get('serviceVoiting/timeout', 10));
                curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, PoolConfig::me()->get('Arm')->get('serviceVoiting/timeout', 10));
                $content = json_decode(curl_exec($ch), true);
                $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($httpStatus != 200 || !empty($content['error'])) {
                    throw new LogicException(self::DEFAULT_ERROR_MESSAGE.'<br/>Проблемы при загрузке справочника. '.($content['errorMessage'] ?? ''));
                }
                $content = $content['result'] ?? '';
                if (!$content) {
                    throw new LogicException(self::DEFAULT_ERROR_MESSAGE.'<br/>Отсутствует справочник');
                }
                $ref = $this->formatRef($content);
                $ref['_question'] = [];
                foreach ($content as $key => $cnt) {
                    if (!empty($cnt['name'])) {
                        $ref['_question'][$key] = $cnt['name'];
                    }
                }
                MemoryCache::set($cacheKey, $ref, 86400);
            }
            if (!$ref) {
                throw new LogicException(self::DEFAULT_ERROR_MESSAGE.'<br/>Отсутствует справочник в кеше');
            }

            if ($districtId) {
                if (!isset($ref[$districtId])) {
                    throw new LogicException(self::DEFAULT_ERROR_MESSAGE.'<br/>У данного округа нет кандидатов.');
                }

                return $ref[$districtId];
            } else {
                return $ref;
            }
        } else {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE.'<br/>Отсутствует имя справочника для голосования');
        }
    }

    public function getDistrictQuestion(string $refStrict, $districtId, bool $force = false): string
    {
        $ref = $this->getDistrictDeputies($refStrict, null, $force);
        if (!isset($ref['_question'][$districtId])) {
            throw new LogicException(self::DEFAULT_ERROR_MESSAGE.'<br/>У данного округа нет вопроса.');
        }
        return $ref['_question'][$districtId];
    }


    /**
     * Форматирует список депутатов перед сохранением в кэш
     * @param array $district_deputies
     * @return array
     */
    private function formatRef(array $district_deputies)
    {
        $result = [];

        foreach ($district_deputies as $district_id => $deputies) {
            $result[$district_id] = [];

            if (isset($deputies['name'])) {
                unset($deputies['name']);
            }

            foreach ($deputies as $id => $deputy) {
                if (is_array($deputy) || strpos($deputy,'|')===false) {
                    $result[$district_id][$id] = $deputy;
                }
                else {
                    $parts = array_map('trim', explode('|', $deputy));

                    $result[$district_id][$id] = [
                        'id' => $parts[0] ?? '',
                        'last_name' => $parts[1] ?? '',
                        'first_name' => $parts[2] ?? '',
                        'middle_name' => $parts[3] ?? '',
                        'date' => $parts[4] ?? '',
                        'university' => $parts[5] ?? '',
                        'faculty' => $parts[6] ?? '',
                        'specialty' => $parts[7] ?? '',
                        'logo' => $parts[8] ?? '',
                        'photo' => $parts[9] ?? '',
                        'description' => $parts[10] ?? '',
                    ];
                }
            }
        }

        return $result;
    }
}