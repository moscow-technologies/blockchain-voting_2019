<?php

namespace App\Service;

use App\Service\Cache as MemoryCache;
use App\Exceptions;
use Illuminate;

class Ballot {

    /** @var Logging\BaseLogger*/
    private $_armMgikLogger;

    /** @var Config\ConfigInterface */
    private $_config;

    /** @var Setting */
    private $_settingsService;

    /** @var Guid */
    private $_guidService;

    /** @var Illuminate\Session\Store */
    private $_session;

    public function __construct(Setting $settingService, Guid $guidService) {
        $this->_armMgikLogger = app()['arm_mgik_logger'];
        $this->_settingsService = $settingService;
        $this->_guidService = $guidService;
        $this->_session = app()['session.store'];
        $this->_config        = Config\PoolConfig::me()->get('Wsregistr');
    }

    public function getGuid(array $data) {
        $processGetGuidStart = ProcessDurationLogger::start('get_guid');
        $checkHashGroup = $this->_config->get('checkHashGroup', array());
        if (!empty($checkHashGroup)) {
            #проверим хэши
            foreach ($checkHashGroup as $group => $secret) {
                if (empty($data[$group])) {
                    throw new Exceptions\BallotException("Validation group missing: $group", 7);
                }

                if (empty($data[$group]['hash']) || empty($data[$group]['random']) || empty($data[$group]['timestamp'])) {
                    throw new Exceptions\BallotException('Group is invalid or lacking one of: hash,random,timestamp', 7);
                }

                $hash = hash('sha256', $data[$group]['timestamp'].'|'.$data[$group]['random'].'|'.$secret);
                if ($data[$group]['hash'] !== $hash) {
                    throw new Exceptions\BallotException("Hash did not match hash $hash group $group", 9);
                }
            }
        }

        if (empty($data['okrug'])) {
            throw new Exceptions\BallotException('Field missing or empty: okrug', 3);
        }
        if (empty($data['id'])) {
            throw new Exceptions\BallotException('Voting id is not specified', 13);
        }
        $idVoiters = $data['id'] ?? null;

        //проверим, что есть такое голосование у нас
        $settings = $this->_settingsService->getSettings($idVoiters);
        if (empty($settings)) {
            throw new Exceptions\BallotException('No such voting', 14);
        }
        $now = time();
        //проверим что голосование началось
        if (strtotime($settings['startTime']) > $now) { //||$settings['status']!==1
            throw new Exceptions\BallotException('Voting has not started yet', 15);
        }
        //проверим что голосование не закончилось
        if ($this->_guidIssueEndDate($settings) < $now) {
            throw new Exceptions\BallotException('Voting is already over', 15);
        }

        while (true) {
            $guid = \lib::create_guid();
            if (!MemoryCache::get('g|'.$guid)) { //проверим на уникальность, как заставили делать
                break;
            }
        }
        app()['session.store']->put('district', $data['okrug']);
        //будет жить пока голосование не закончится
        $endTime = strtotime($settings['endTime']);
        $lifeTo = $endTime - $now;
        app()['log']->info('guid_set', ['type' => 'guid_set', 'guid' => $guid]);
        $okrug = $data['okrug'];
        $this->_guidService->storeGuid(
            $guid,
            $settings['id'],
            $settings['extId'],
            $okrug,
            $this->_session->getId(),
            $endTime
        );
        MemoryCache::set('g|'.$guid, array(
            'id' => $settings['id'],
            'extId' => $settings['extId'],
            'okrug' => $okrug,
            'sessId' => null,
            'lifeTo' => $lifeTo,
            'finishTime' => $endTime,
            'createTime' => $now,
//            'hash' => $hguid,
            'opened' => 0), $lifeTo);

        //TODO шифровать

        $hguid = $this->crypt(array(
            'base64body' => base64_encode($guid))); //зашифровали типо
//        MemoryCache::set('h|'.$hguid, $guid, $cachePreLife);
        $data = array(
            'url' => $hguid,
            'cert' => null,
            'hash' => null,
            'hashMac' => null
        );
        #нужно поля заполнить  недостующие для 2 метода реализовав слепую подпись на другом сервере
        if ($this->_config->get('debug_guid', false)) {
            $data['cert'] = $this->_config->get('cert');
            $data['hash'] = hash('stribog512', json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            $data['hashMac'] = hash_hmac('gost', json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $data['cert']);
        }
        $this->_armMgikLogger->info('Создан бюллетень', [
                'action' => 'mgd_created',
                'guid' => $guid,
                'sessId' => $this->_session->getId(),
                'voitingId' => $settings['id'],
                'serverTime' => $now,
                'district'   => $okrug,
            ]
        );
        ProcessDurationLogger::finish($processGetGuidStart);
        return base64_encode(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    public function decrypt(array $data = []) {
        /*
        код удален по соображениям безопасности
        расшифровывает данные
        */
        $string = '';
        return $string;
    }

    public function crypt(array $data = []) {
        /*
        код удален по соображениям безопасности
        зашифровывает данные
        */
        $string = '';
        return $string;
    }

    public function checkGuid(array $data = []) {
        $checkGuidProcessStart = ProcessDurationLogger::start('check_guid');
        if (empty($data['guid'])) {
            throw new Exceptions\BallotException('Field missing or empty: guid', 3);
        }
        $guid = $data['guid'];

        #проверим в кеше и найдем гуидик
        $data = MemoryCache::get('g|'.$guid);
        if (empty($data)) {
            app()['log']->error('Guid not found', ['type' => 'guid_no_found' , 'guid' => $guid, 'tag' => 'check', 'again' => MemoryCache::get('g|'.$guid)]);
            throw new Exceptions\BallotException("Not data for guid: $guid", 11);
        }
        $time = time();
        if (empty($data['finishTime']) || $data['finishTime'] < $time) {
            throw new Exceptions\BallotException("Time's up, $guid expired".($time - $data['finishTime'])." seconds ago", 11);
        }
        app()['log']->info("Session id : {$this->_session->getId()}", $data);
        //проверим сессию
        if (!empty($data['sessId']) && $this->_session->getId() !== $data['sessId']) {
            throw new Exceptions\BallotException("You've accessed through different browser, from which ballot was opened.", 11);
        }

        $data['guid'] = $guid;
        $data['url'] = route('election_show', ['guid' => $guid]);

        ProcessDurationLogger::finish($checkGuidProcessStart);
        return $data;
    }

    public function receiveGuid(array $data = []) {
        $now = time();
        $guid = $data['guid'] ?? null;
        app()['log']->info('guid_receive', ['guid' => $guid]);

        if (!$guid) {
            throw new Exceptions\BallotException('Field missing or empty: guid', 3);
        }
        #сделаем хак для тестового бюллетеня
        if ($guid === Config\PoolConfig::me()->conf('Mgik')->get('testBallot')) {
            $settings = $this->_settingsService->getSettings(1);

            $endTime = 0;
            $endTime = strtotime($settings['endTime']);
            //проверим что голосование не закончилось
            if ($endTime < $now) {
                $endTime = $now + 86400;
            }
            $this->_armMgikLogger->info('Загружен тестовый бюллетень', [
                'action' => 'mgd_test',
                'guid' => $guid,
                'sessId' => $this->_session->getId(),
                'voitingId' => $settings['id'],
                'serverTime' => $now,
                'district' => $data['okrug'] ?? '',
            ]);
            $response = $endTime - $now;
        } else {
            $data = MemoryCache::get('g|'.$guid);

            if (empty($data)) {
                app()['log']->error('Guid not found', ['type' => 'guid_no_found', 'tag' => 'receive', 'guid' => $guid , 'again' => MemoryCache::get('g|'.$guid)]);
                throw new Exceptions\BallotException("No data for guid: $guid", 11);
            }

            if (empty($data['finishTime']) || $data['finishTime'] < $now) {
                throw new Exceptions\BallotException("Time's up, guid: $guid expired ".($now - $data['finishTime'])." seconds ago", 11);
            }
            if (empty($data['opened'])) {

                $data['opened'] = 1;
                $data['sessId'] = $this->_session->getId();
                MemoryCache::set('g|'.$guid, $data, $data['finishTime'] - $now);
                $this->_guidService->updateGuid($guid, ['opened' => 'true', 'session_id' => $this->_session->getId()]);
                $this->_armMgikLogger->info('Загружен бюллетень', [
                    'action' => 'mgd_loaded',
                    'guid' => $guid,
                    'voitingId' => $data['id'],
                    'sessId' => $data['sessId'],
                    'serverTime' => $now,
                    'spendTime' => $now - $data['createTime'],
                    'district' => $data['okrug'] ?? '',
                ]);
                $response = $data['finishTime'] - $now;
            } else {
                $this->_armMgikLogger->info('Загружен повторно бюллетень', [
                    'action' => 'mgd_loaded_twice',
                    'guid' => $guid,
                    'voitingId' => $data['id'],
                    'sessId' => $data['sessId'],
                    'serverTime' => $now,
                    'spendTime' => $now - $data['createTime'],
                    'district' => $data['okrug'] ?? '',
                ]);
                $response = $data['finishTime'] - $now;
            }
        }
        return $response;
    }

    public function sendGuid(array $data = []) {
        $sendGuidProcess = ProcessDurationLogger::start('send_guid');
        $cdata = $this->checkguid($data);

        if (!empty($cdata['error'])) {
            return $cdata;
        }

        $hash = $this->crypt($data);
        $now = time();
        app()['log']->info('guid_send', ['guid' => $data['guid'], 'type' => 'guid_delete']);
        //больше ключ не действителен
        MemoryCache::delete('g|'.$data['guid']);
        $this->_guidService->removeGuid($data['guid']);
        $this->_armMgikLogger->info('Отправлен бюллетень', [
            'action' => 'mgd_sended',
            'guid' => $data['guid'],
            'voitingId' => $cdata['id'],
            'sessId' => $cdata['sessId'] ?? '',
            'serverTime' => $now,
            'spendTime' => $now - $cdata['createTime'],
            'district' => $data['districtId'] ?? '',
        ]);

        ProcessDurationLogger::finish($sendGuidProcess);
        return array('hash' => $hash, 'voitingId' => $cdata['extId'], 'district' => $cdata['okrug'], 'id' => $cdata['id']);
    }

    public function checkSign(array $data = []) {
        $processCheckSignStart = ProcessDurationLogger::start('check_sign');
        $time = time();
        if (empty($data['base64body'])) {
            throw new Exceptions\BallotException('Field empty or not present: base64body', 3);
        }
        $hguid = $data['base64body'];
        $jsonString = base64_decode($hguid, true);
        if (empty($jsonString) || base64_encode($jsonString) !== $hguid) {
            throw new Exceptions\BallotException("base64body unable to unpack: $hguid", 10);
        }
        $data = json_decode($jsonString, true);
        #проверим подпись мпгу
        if (empty($data)) {
            throw new Exceptions\BallotException("Invalid json in string: $jsonString", 10);
        }


        if (empty($data['cert']) || $this->_config->get('cert') != $data['cert']) {
            throw new Exceptions\BallotException("Field missing or invalid: cert $jsonString", 3);
        } elseif (empty($data['hash'])) {
            throw new Exceptions\BallotException("Field missing: hash $jsonString", 3);
        } elseif (empty($data['hashMac'])) {
            throw new Exceptions\BallotException("Field missing: hashMac $jsonString", 3);
        } elseif (empty($data['url'])) {
            throw new Exceptions\BallotException("Field missing: url $jsonString", 3);
        }

        $hashMac = $data['hashMac'];
        $data['hashMac'] = null;
        $jsonTest = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (hash_hmac('gost', $jsonTest, $data['cert']) !== $hashMac) {
            throw new Exceptions\BallotException("hashMac does not match $jsonTest, cyphering with base64", 10);
        }
        $hash = $data['hash'];
        $data['hash'] = null;
        $jsonTest = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (hash('stribog512', $jsonTest) !== $hash) {
            throw new Exceptions\BallotException("hash does not match $jsonTest, cyphering stribog512 GOST R 34.11-2012 512 bit hash function", 10);
        }

        $hguid = $data['url'];
        $guid = $this->decrypt(array('base64body' => $hguid));
        #проверим в кеше и найдем гуидик
        $data = MemoryCache::get('g|'.$guid);
        if (empty($data)) {
            app()['log']->error('Guid not found', ['type' => 'guid_no_found' , 'guid' => $guid , 'again' => MemoryCache::get('g|'.$guid)]);
            throw new Exceptions\BallotException("Not data for guid: $guid", 11);
        }

        if (empty($data['finishTime']) || $data['finishTime'] < $time) {
            throw new Exceptions\BallotException("Time's up $guid expired ".($time - $data['finishTime'])." seconds ago", 11);
        }
        ProcessDurationLogger::finish($processCheckSignStart);
        return route('election_show', ['guid' => $guid]);
    }

    private function _guidIssueEndDate(array $settings): string {
        return strtotime($settings['endTime']) - 900; // 15 minutes
    }
}