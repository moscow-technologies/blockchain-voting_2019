<?php

return [
    'debug' => true,
    'registration' => [
        'start_date' => 20190724000000,
        'period' => 24,
        'statuses' => [
            'allow' => [101099, 102099, 1080, 1090],
            'disallow' => [1080, 1090]
        ],
        'profile_validators' => [
            'age' => true,
            'isConfirmed' => true,
            'gender' => true,
            'passport' => true,
            'regAddress' => true,
            'district' => true,
        ]
    ],
    'allowed_districts' => [
        1005 => "муниципальный округ Крюково",
        1009 => "муниципальный округ Матушкино",
        1010 => "муниципальное образование Савелки",
        1011 => "муниципальный округ Силино",
        315 => "муниципальный округ Северный",
        306 => "муниципальный округ Лианозово",
        304 => "муниципальный округ Бибирево",
        620 => "муниципальный округ Чертаново Центральное",
        621 => "муниципальный округ Чертаново Южное",
    ],
    'districts' => [1, 10, 30],
    'service' => [
        'mdm' => [
            'token' => 'example-token',
            'url' => [
                'check' => "http://example-host.ru",
                'get' => "http://example-host.ru",
                'flush' => "http://example-host.ru",
            ],
        ],
        'deputies' => [
            'url' => "http://example-host.ru"
        ],
        'election' => [
            'host' => 'http://example-host.ru',
            'cert' => 'example-cert',
            'secret' => 'example-secret',
            'systems' => [
                'example-system' => 'example-secret'
            ],
            'url' => [
                'get' => "http://example-host.ru",
            ]
        ],
        'decrypt' => [
            'login' => 'example-login',
            'password' => 'example-password',
            'token' => 'example-token',
            'url' => [
                'decrypt' => 'http://example-host.ru',
            ]
        ],
    ],
    'amqp' => [
        'host' => 'http://example-host.ru',
        'vhost' => 'example-host',
        'port' => 'example-post',
        'login' => 'example-login',
        'password' => 'example-password',
        'workers' => 3,
        'waitTime' => 0,
        'lifeTime' => 60 * 3,
        'queue' => [
            'registration' => 'example-queue-1',
            'revocation' => 'example-queue-1',
            'status' => 'example-queue-2',
            'vote' => 'example-queue-3',
        ],
    ],
];