<?php

namespace App\Providers;

use App\Service;
use Illuminate\Support\ServiceProvider;
use Monolog\Logger;

class AppServiceProvider extends ServiceProvider
{

    public function boot() {
        app()['url']->forceRootUrl(env('APP_URL'));
        app()['url']->forceScheme(env('APP_HTTP_PROTOCOL'));
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        app()['log']->info('Redis config', config('database'));
        $this->app->singleton(Service\Logging\BaseLogger::class, function ($app) {
            $grayConfig = new Service\Config\FileConfig('Graylog');
            if (!$grayConfig->get('enabled')) {
                return Service\Logging\StdoutLogger::create('stdout');
            }
            return Service\Logging\GrayLogLogger::create('Ballot');
        });

        $this->app->alias(Service\Ballot::class, 'ballot');

        $this->app->alias(Service\Logging\BaseLogger::class, 'log');

        $this->app->singleton(Service\OAuth::class, function ($app) {
            $config = new Service\Config\FileConfig('Wsregistr');
            return new Service\OAuth($config);
        });
        $this->app->alias(Service\OAuth::class, 'oauth');

        $this->app->singleton('arm_mgik_logger', function ($app) {
            if (env('ARM_ENABLED', true)) {
                return Service\Logging\ArmMgikLogger::create('ArmMgik', Logger::INFO, 'Arm');
            }
            return Service\Logging\StdoutLogger::create('stdout');
        });

        $this->app->singleton(Service\Setting::class, function ($app) {
            return new Service\Setting();
        });
        $this->app->alias(Service\Setting::class, 'setting');
        // Historically, database had all static methods, therefore we simply initialize connection
        Service\Database\Facade::initSingleton();
    }
}
