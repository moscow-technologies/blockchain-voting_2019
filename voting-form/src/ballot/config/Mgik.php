<?php

return [
    'debug' => !empty(cfgEnv('SITE_DEBUG', false)) ? true : false,
    'districts' => [1, 10, 30],
    'service' => [
        'election' => [
            'url' => [
                'get' => "http://example-host.ru",
                'check' => "http://example-host.ru",
                'check_sign' => "http://example-host.ru",
                'send' => "http://example-host.ru",
                'crypt' => "http://example-host.ru",
                'decrypt' => "http://example-host.ru",
            ]
        ],
        'blockchain' => [
            'login' => 'example-login',
            'password' => 'example-password',
            'host' => 'http://example-host.ru',
            'url' => [
                'authenticate' => "http://example-host.ru",
                'addresses' => 'http://example-host.ru',
                'keys' => 'http://example-host.ru',
            ]
        ],
        'system'=>'example-system',
        'token'=>'example-token'
    ],
    'amqp' => [
        'host' => 'http://example-host.ru',
        'vhost' => 'example-vhost',
        'port' => 'example-post',
        'login' => 'example-login',
        'password' => 'example-password',
        'queue' => [
            'registration' => 'example-queue-1',
            'revocation' => 'example-queue-1',
            'status' => 'example-queue-2',
            'vote' => 'example-queue-3',
        ]
    ],
    'ballot_template' => cfgEnv('BALLOT_TEMPLATE', 'show'),
    'show_tx_result' => cfgEnv('SHOW_TX_RESULT', false),
];