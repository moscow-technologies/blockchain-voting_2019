<?php

namespace Mgd\Module\election;

use Mgd\Lib\Loggers\GrayLogger;
use Mgd\Lib\Config\PoolConfig;
use Mgd\Module\election\Service;
use Mgd\Module\election\LogicException;

class UpdateDitVotingSettingsCommand
{
    /** @var GrayLogger */
    protected $logger;

    /** @var PoolConfig */
    protected $config;

    /** @var Service */
    protected $service;

    /** @var Settings */
    protected $settings;

    /** @var array */
    protected $logData;

    /**
     * @param GrayLogger $logger
     */
    public function __construct(GrayLogger $logger)
    {
        $this->logger = $logger;
        $this->config = PoolConfig::me()->conf('Mgik');
        $this->service = new Service();
        $this->settings = new Settings();
    }

    /**
     * @throws LogicException|\Exception
     */
    public function handle()
    {
        $this->logger->info('Начало работы');

        $token = $this->service->getBlockchainAuthenticate();
        $this->logger->info('Успешное получение токена', ['data' => $token]);

        $ballotsRegistryAddress = $this->service->getBlockchainRegistryAddress($token);
        $this->logger->info('Успешное получение адреса', ['data' => $ballotsRegistryAddress]);

        $encryptionKeys = $this->service->getBlockchainEncryptionKeys($token);
        $this->logger->info('Успешное получение ключей', ['data' => $encryptionKeys]);

        $this->settings->resetCache();
        $this->createLogData($ballotsRegistryAddress, $encryptionKeys);

        if (! $this->isChanged($ballotsRegistryAddress, $encryptionKeys)) {
            $this->logger->info('Адрес и ключи совпадают (изменение не требуется)', ['data' => $this->logData]);
            $this->logger->info('Успешное завершение работы');

            return false;
        }

        $this->settings->setArray([
            'ballotsRegistryAddress' => $ballotsRegistryAddress,
            'modulo' => $encryptionKeys->modulo,
            'generator' => $encryptionKeys->generator,
            'publicKey' => $encryptionKeys->publicKey,
        ]);

        $this->logger->info('Адрес и ключи успешно обновлены', ['data' => $this->logData]);
        $this->logger->info('Успешное завершение работы');

        return true;
    }

    /**
     * @param string $ballotsRegistryAddress
     * @param object $encryptionKeys
     * @throws \Exception
     */
    private function createLogData(string $ballotsRegistryAddress, $encryptionKeys)
    {
        $this->logData = [
            'new' => [
                'ballotsRegistryAddress' => $ballotsRegistryAddress,
                'modulo' => $encryptionKeys->modulo,
                'generator' => $encryptionKeys->generator,
                'publicKey' => $encryptionKeys->publicKey,
            ],
            'old' => [
                'ballotsRegistryAddress' => $this->settings->get('ballotsRegistryAddress'),
                'modulo' => $this->settings->get('modulo'),
                'generator' => $this->settings->get('generator'),
                'publicKey' => $this->settings->get('publicKey'),
            ]
        ];
    }

    /**
     * @param string $ballotsRegistryAddress
     * @param object $encryptionKeys
     * @return bool
     * @throws \Exception
     */
    private function isChanged(string $ballotsRegistryAddress, $encryptionKeys)
    {
        $currentRegistryAddress = $this->settings->get('ballotsRegistryAddress');
        $currentModulo = $this->settings->get('modulo');
        $currentGenerator = $this->settings->get('generator');
        $currentPublicKey = $this->settings->get('publicKey');

        $isChanged = false;
        $messages = [];

        if (! ($currentRegistryAddress && $currentModulo && $currentGenerator && $currentPublicKey)) {
            $messages[] = 'Настойки адреса или ключей отсутствуют в базе дынных';
            $isChanged = true;
        }

        if ($currentRegistryAddress != $ballotsRegistryAddress) {
            $messages[] = 'Новый адрес отличается от старого';
            $isChanged = true;
        }

        if ($currentModulo != $encryptionKeys->modulo ||
            $currentGenerator != $encryptionKeys->generator ||
            $currentPublicKey != $encryptionKeys->publicKey)
        {
            $messages[] = 'Новые ключи отличаются от старых';
            $isChanged = true;
        }

        if ($isChanged) {
            $this->logger->info('Получен новый адрес или ключи (требуется изменение)', [
                'data' => $this->logData,
                'info' => implode("\n", $messages)
            ]);
        }

        return $isChanged;
    }

}