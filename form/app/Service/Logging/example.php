<?php
/*
$options = array(
    'hostname' => '10.32.201.192',
    'port' => '12202',
    'chunk_size' => '8154',
    'bubble' => false,
);


try {

    LoggerPool::me()
        ->add('grayLog', GrayLogLogger::create('MPGU11', $options))
        ->add('grayLog2', GrayLogLogger::create('MPGU22', $options))
        ->add('grayLog3', GrayLogLogger::create('MPGU33', $options))
    ;

    LoggerPool::me()->exception(new \InvalidArgumentException('Invalid argument exception'));
    LoggerPool::me()->info('Hello from Info', array());

    $logger = LoggerPool::me()->get('grayLog2');

    $logger->info('aaa',array());

} catch (\Exception $e) {
    print_r($e->getMessage());
}
*/