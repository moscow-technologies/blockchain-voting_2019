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

    /** @var Illuminate\Session\Store */
    private $_session;

    public function __construct(Setting $settingService) {
        $this->_armMgikLogger = app()['arm_mgik_logger'];
        $this->_settingsService = $settingService;
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
                    throw new Exceptions\BallotException("Не передана группа защиты $group", 7);
                }

                if (empty($data[$group]['hash']) || empty($data[$group]['random']) || empty($data[$group]['timestamp'])) {
                    throw new Exceptions\BallotException('Либо группа не та, либо нет hash,random,timestamp', 7);
                }

                $hash = hash('....................скрыли логику генерации хэша......................................');
                if ($data[$group]['hash'] !== $hash) {
                    throw new Exceptions\BallotException("Хэш не совпал в поле hash $hash group $group", 9);
                }
            }
        }

        if (empty($data['okrug'])) {
            throw new Exceptions\BallotException('Нет поля или пустое okrug', 3);
        }
        if (empty($data['id'])) {
            throw new Exceptions\BallotException('Не указан идентификатор голосования', 13);
        }
        $idVoiters = $data['id'] ?? null;

        //проверим, что есть такое голосование у нас
        $settings = $this->_settingsService->getSettings($idVoiters);
        if (empty($settings)) {
            throw new Exceptions\BallotException('Нет такого голосования', 14);
        }
        $now = time();
        //проверим что голосование началось
        if (strtotime($settings['startTime']) > $now) { //||$settings['status']!==1
            throw new Exceptions\BallotException('Голосование не началось еще', 15);
        }
        $endTime = strtotime($settings['endTime']);
        //проверим что голосование не закончилось
        if ($endTime < $now) {
            throw new Exceptions\BallotException('Голосование закончилось уже', 15);
        }

        while (true) {
            $guid = \lib::create_guid();
            if (!MemoryCache::get('g|'.$guid)) { //проверим на уникальность, как заставили делать
                break;
            }
        }
        //будет жить пока голосование не закончится
        $lifeTo = $endTime - $now;
        MemoryCache::set('g|'.$guid, array(
            'id' => $settings['id'],
            'extId' => $settings['extId'],
            'okrug' => $data['okrug'],
            'sessId' => null,
            'lifeTo' => $lifeTo,
            'finishTime' => $endTime,
            'createTime' => $now,
//            'hash' => $hguid,
            'opened' => 0), $lifeTo);

        //TODO шифровать

        $hguid = $this->crypt(array('base64body' => base64_encode($guid)));
        $data = array(
            'url' => $hguid,
            'cert' => null,
            'hash' => null,
            'hashMac' => null
        );
        #нужно поля заполнить  недостующие для 2 метода реализовав слепую подпись на другом сервере
        if ($this->_config->get('debug_guid', false)) {
            $data['cert'] = $this->_config->get('cert');
            $data['hash'] = hash('....................скрыли логику генерации хэша......................................');
            $data['hashMac'] = hash_hmac('....................скрыли логику генерации хэша......................................');
        }
        $this->_armMgikLogger->info('Создан бюллетень', [
                'action' => 'mgd_created',
                'guid' => $guid,
                'sessId' => $this->_session->getId(),
                'voitingId' => $settings['id'],
                'serverTime' => $now]
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
            throw new Exceptions\BallotException('Нет поля или пустое guid', 3);
        }
        $guid = $data['guid'];

        #проверим в кеше и найдем гуидик
        $data = MemoryCache::get('g|'.$guid);
        if (empty($data)) {
            throw new Exceptions\BallotException("Нет данных по гуиду $guid", 11);
        }
        $time = time();
        if (empty($data['finishTime']) || $data['finishTime'] < $time) {
            throw new Exceptions\BallotException("Время вышло, гуид $guid протух ".($time - $data['finishTime'])." сек. как", 11);
        }
        app()['log']->info("Session id : {$this->_session->getId()}", $data);
        //проверим сессию
        if (!empty($data['sessId']) && $this->_session->getId() !== $data['sessId']) {
            throw new Exceptions\BallotException("Вы зашли в другом браузере, нежели там где впервые открыли бюллетень.", 11);
        }

        $data['guid'] = $guid;
        $data['url'] = route('election_show', ['guid' => $guid]);

        ProcessDurationLogger::finish($checkGuidProcessStart);
        return $data;
    }

    public function receiveGuid(array $data = []) {
        $now = time();
        $guid = $data['guid'] ?? null;

        if (!$guid) {
            throw new Exceptions\BallotException('Нет поля или пустое guid', 3);
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
                'serverTime' => $now
            ]);
            $response = $endTime - $now;
        } else {
            $data = MemoryCache::get('g|'.$guid);

            if (empty($data)) {
                throw new Exceptions\BallotException("Нет данных по гуиду $guid", 11);
            }

            if (empty($data['finishTime']) || $data['finishTime'] < $now) {
                throw new Exceptions\BallotException("Время вышло, гуид $guid протух ".($now - $data['finishTime'])." сек. как", 11);
            }
            if (empty($data['opened'])) {

                $data['opened'] = 1;
                $data['sessId'] = $this->_session->getId();
                MemoryCache::set('g|'.$guid, $data, $data['finishTime'] - $now);
                $this->_armMgikLogger->info('Загружен бюллетень', [
                    'action' => 'mgd_loaded',
                    'guid' => $guid,
                    'voitingId' => $data['id'],
                    'sessId' => $data['sessId'],
                    'serverTime' => $now,
                    'spendTime' => $now - $data['createTime']
                ]);
                $response = $data['finishTime'] - $now;
            } else {
                $this->_armMgikLogger->info('Загружен повторно бюллетень', [
                    'action' => 'mgd_loaded_twice',
                    'guid' => $guid,
                    'voitingId' => $data['id'],
                    'sessId' => $data['sessId'],
                    'serverTime' => $now,
                    'spendTime' => $now - $data['createTime']
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
        //больше ключ не действителен
        MemoryCache::delete('g|'.$data['guid']);
        $this->_armMgikLogger->info('Отправлен бюллетень', [
            'action' => 'mgd_sended',
            'guid' => $data['guid'],
            'voitingId' => $cdata['id'],
            'sessId' => $cdata['sessId'] ?? '',
            'serverTime' => $now,
            'spendTime' => $now - $cdata['createTime']]);

        ProcessDurationLogger::finish($sendGuidProcess);
        return array('hash' => $hash, 'voitingId' => $cdata['extId'], 'district' => $cdata['okrug'], 'id' => $cdata['id']);
    }

    public function checkSign(array $data = []) {
        $processCheckSignStart = ProcessDurationLogger::start('check_sign');
        $time = time();
        if (empty($data['base64body'])) {
            throw new Exceptions\BallotException('Нет поля или пустое base64body', 3);
        }
        $hguid = $data['base64body'];
        $jsonString = base64_decode($hguid, true);
        if (empty($jsonString) || base64_encode($jsonString) !== $hguid) {
            throw new Exceptions\BallotException("base64body не распаковывается: $hguid", 10);
        }
        $data = json_decode($jsonString, true);
        #проверим подпись мпгу
        if (empty($data)) {
            throw new Exceptions\BallotException("Битый json в строке $jsonString", 10);
        }


        if (empty($data['cert']) || $this->_config->get('cert') != $data['cert']) {
            throw new Exceptions\BallotException("Отсутствует поле или чужой  cert $jsonString", 3);
        } elseif (empty($data['hash'])) {
            throw new Exceptions\BallotException("Отсутствует поле hash $jsonString", 3);
        } elseif (empty($data['hashMac'])) {
            throw new Exceptions\BallotException("Отсутствует поле hashMac $jsonString", 3);
        } elseif (empty($data['url'])) {
            throw new Exceptions\BallotException("Отсутствует поле url c гуидом шифрованным $jsonString", 3);
        }

        $hashMac = $data['hashMac'];
        $data['hashMac'] = null;
        $jsonTest = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (hash_hmac('gost', $jsonTest, $data['cert']) !== $hashMac) {
            throw new Exceptions\BallotException("hashMac не бьется по  $jsonTest, шифруем сертификатом в base64", 10);
        }
        $hash = $data['hash'];
        $data['hash'] = null;
        $jsonTest = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (hash('....................скрыли логику генерации хэша......................................') !== $hash) {
            throw new Exceptions\BallotException("hash   не бьется по  $jsonTest", 10);
        }

        $hguid = $data['url'];
        $guid = $this->decrypt(array('base64body' => $hguid));
        app()['log']->info("Trying to find guid in cache: {$guid}");
        #проверим в кеше и найдем гуидик
        $data = MemoryCache::get('g|'.$guid);
        if (empty($data)) {
            throw new Exceptions\BallotException("Нет данных по гуиду $guid", 11);
        }

        if (empty($data['finishTime']) || $data['finishTime'] < $time) {
            throw new Exceptions\BallotException("Время вышло, гуид $guid протух ".($time - $data['finishTime'])." сек. как", 11);
        }
        ProcessDurationLogger::finish($processCheckSignStart);
        return route('election_show', ['guid' => $guid]);
    }
}