<?php

use Mgd\Lib\Cache\MemoryCacheMutex;
use Mgd\Lib\Loggers\GrayLogger;
use Mgd\Module\election\UpdateDitVotingSettingsCommand;
use Mgd\Module\election\LogicException;

require_once(__DIR__.'/../../../config/params.php');
require_once(__DIR__.'/../../../common/lib/Cache/MemoryCache.php');

$logger = GrayLogger::create('UpdateDitVotingSettings');

$mutex = new MemoryCacheMutex([
    'key' => 'UpdateDitVotingSettings',
    'lockTriesInterval' => 1,
    'keyLifetime' => 600,
    'timeToWait' => 0
]);

if (isset($argv[1]) && $argv[1] === 'release') {
    $mutex->release();
}

try {
    if (!$mutex->lock()) {
        $logger->debug('Процесс уже запущен');
        exit('Процесс уже запущен');
    }

    $command = new UpdateDitVotingSettingsCommand($logger);
    $command->handle();

} catch (LogicException $e) {
    $data = $e->getData();
    $message = $data['errorMessage'] ?? $e->getMessage();

    $logger->error($message, array_merge($data, [
        'error' => 1
    ]));

    echo "$message\n";
    print_r($data);

} catch (\Throwable $e) {
    $logger->error($e->getMessage(), [
        'error' => 1,
        'errorMessage' => $e->getMessage(),
        'errorTrace' => $e->getTrace(),
    ]);

    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

$mutex->release();