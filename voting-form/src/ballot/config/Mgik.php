<?php

return [
    'debug' => true,
    'districts' => [1, 10, 30],
    'service' => [
        'deputies' => [
            'url' => 'http://example.ru',
        ],
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
    'dit_voting' => [
        'ballotRegistryAddress' => 'example-ballotRegistryAddress',
        'modules' => [
            'example-module-1',
            'example-module-2',
            'example-module-3'
        ],
        'generators' => [
            'example-generator-1',
            'example-generator-2',
            'example-generator-3'
        ],
        'publicKeys' => [
            'example-publicKeys-1',
            'example-publicKeys-2',
            'example-publicKeys-3'
        ],
    ],
    'ballot_template' => 'show',
];