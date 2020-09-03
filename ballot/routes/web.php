<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->group(['prefix' => '/election/'], function () use ($router) {
    $router->get('check/{guid:.*}', 'Election@check');
    $router->post('vote',           'Election@vote');
    $router->get('error',           'Election@error');
    $router->get('success',         'Election@success');
    $router->get('{guid:.*}', ['uses' => 'Election@index', 'as' => 'election_show']);
});

$router->group(['prefix' => '/api/registr/v1/'], function () use ($router) {
    include __DIR__ . '/ballot.php';
});

$router->group(['prefix' => '/crypt/api/registr/v1'], function () use ($router) {
    include __DIR__ . '/ballot.php';
});

$router->group(['prefix' => '/crypto/api/registr/v1'], function () use ($router) {
    include __DIR__ . '/ballot.php';
});

// ajax routes
$router->group(['prefix' => '/crypto/api/ajax/v1'], function () use ($router) {
    foreach (['post', 'get'] as $method) {
        $router->$method('/service/hit',    'Ajax@hit');
        $router->$method('/service/update', 'Ajax@update');
        $router->$method('/service/lib',    'Ajax@lib');
        $router->$method('/service/reset',  'Ajax@reset');
    }
});

$router->get('/test', 'Base@test');