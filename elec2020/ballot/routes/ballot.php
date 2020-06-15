<?php

$router->group(['middleware' => 'auth'], function () use ($router) {
    foreach (['post', 'get'] as $method) {
        $router->$method('getGuid',      'Main@getGuid');
        $router->$method('decrypt',      'Main@decrypt');
        $router->$method('crypt',        'Main@crypt');
        $router->$method('checkGuid',    'Main@checkGuid');
        $router->$method('receiveGuid',  'Main@receiveGuid');
        $router->$method('sendguid',     'Main@sendGuid');
        $router->$method('checksign',    'Main@checkSign');
        $router->$method('updatevoiting', 'Main@updateVoting');
    }
});

$router->get('auth', 'Main@auth');
