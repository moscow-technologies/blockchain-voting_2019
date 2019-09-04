<?php

return [
    'debug' => !empty(cfgEnv('SITE_DEBUG', false)) ? true : false,
    'districts' => [1, 10, 30],
    'service' => [
        'election' => [
            'url' => [
                'get' => "http://example.ru",
                'check' => "http://example.ru",
                'check_sign' => "http://example.ru",
                'send' => "http://example.ru",
                'crypt' => "http://example.ru",
                'decrypt' => "http://example.ru",
            ]
        ],
        'blockchain' => [
            'login' => 'example-login',
            'password' => 'example-password',
            'host' => 'http://example.ru',
            'url' => [
                'authenticate' => "http://example.ru",
                'addresses' => 'http://example.ru',
                'keys' => 'http://example.ru',
            ]
        ],
        'system'=>'example-system',
        'token'=>'example-token'
    ],
    'amqp' => [
        'host' => 'http://example.ru',
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
    'security'=>'https://sp.mos.ru/build/main_156_9dd32210_247_899.js',
    'ballot_template' => 'show',
];