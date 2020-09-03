<?php

namespace App\Http\Middleware;

use Illuminate\Http;

class LogRequestDuration
{
    private static $_bootTime;

    public function handle($request, \Closure $next)
    {
        self::$_bootTime = microtime(true);
        return $next($request);
    }

    public function terminate($request, $response) {
        if ($request instanceof Http\Request) {
            $durationRaw = microtime(true) - self::$_bootTime;
            $duration = round($durationRaw * 1000, 2);
            app()['log']->info("Request duration: {$duration}", [
                'method'  => $request->getMethod(),
                'uri'     => $request->getRequestUri(),
                'ms'      => $duration,
                'type'    => 'duration',
                'version' => 6,
            ]);
        }
        $request->getRequestUri();
    }
}
