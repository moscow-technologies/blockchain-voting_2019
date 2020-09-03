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

$showBallotMiddleWare = \App\Service\Utils::getThrottleMiddleware();
array_unshift($showBallotMiddleWare, 'auth');

$router->group(['middleware' => $showBallotMiddleWare], function () use ($router) {
    $router->get(env('ROUTE_SHOW'   , '/'),     ['uses' => 'Application\Election\Ballot@show', 'as' => 'ballot_show']);
    $router->get(env('ROUTE_SHOW_ME', '/my'),   'Application\Election\Ballot@show');
});

$router->group(['middleware' => 'auth'], function () use ($router) {
    $router->post(env('ROUTE_SHOW', '/'),                'Application\Election\Ballot@submit');
    $router->post('/common/ajax/confirm/{type}',           'ConfirmInputController@handle');
    $router->post('/common/ajax',                          'AjaxController@handle');
    $router->get(env('ROUTE_LAND_SHOW', '/service/cikrf'), ['uses' => 'Application\Election\Landing@show', 'as' => 'landing']);
});

$router->get(env('ROUTE_DENIED', '/denied'), [
    'uses' => 'Application\Election\Ballot@denyLegal',
    'as'   => 'deny_legal',
]);

$router->get(env('ROUTE_ACCESS_DENIED', '/application/{org_id}/{form_id}/denied'), [
    'uses' => 'Application\Base@accessDenied',
    'as'   => 'access_denied',
]);

$router->get(env('ROUTE_NOT_FOUND', '/notfound'), [
    'uses' => 'Base@notFound',
    'as'   => 'not_found',
]);

$router->get(env('ROUTE_LOGOUT', '/logout'), [
    'uses' => 'OAuthController@logout',
    'as'   => 'logout',
]);

$router->get('/change-confirm', 'Base@changeConfirm');

$router->get('/test', 'Base@test');