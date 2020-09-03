<?php

namespace App\Providers;

use App\Service;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot() {
        $backURL = \params::$params['services']['sudir_oauth']['backurl'];
        $parsedUrl = parse_url($backURL);
        app()['router']->get($parsedUrl['path'], 'App\Http\Controllers\OAuthController@handle');
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        require_once(resource_path() . '/include/params.php');
        require_once(resource_path() . '/include/lib.php');

        app()['log']->info('Redis config', config('database'));
        $this->app->singleton(Service\Logging\BaseLogger::class, function ($app) {
            $grayConfig = new Service\Config\FileConfig('Graylog');
            if (!$grayConfig->get('enabled')) {
                return Service\Logging\StdoutLogger::create('stdout');
            }
            return Service\Logging\GrayLogLogger::create('Election container');
        });

        $this->app->alias(Service\Logging\BaseLogger::class, 'log');

        $this->app->singleton(Service\Logging\ArmMgikLogger::class, function ($app) {
            if (env('ARM_ENABLED', true)) {
                return new Service\Logging\ArmMgikLogger();
            }
            return Service\Logging\StdoutLogger::create('stdout');
        });

        $this->app->alias(Service\Logging\ArmMgikLogger::class, 'arm_mgik_logger');

        $this->app->singleton(Service\User::class, function ($app) {
            return new Service\User();
        });

        $this->app->alias(Service\User::class, 'user');

        $this->app->singleton(Service\BasicAuth::class, function ($app) {
            return new Service\BasicAuth();
        });
        $this->app->alias(Service\BasicAuth::class, 'basic_auth');
    }
}
