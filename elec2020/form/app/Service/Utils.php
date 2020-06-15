<?php

namespace App\Service;

use Illuminate\Http;

class Utils {

    public static function getRouteHash(Http\Request $request) {
        // Stay classy, lumen...
        return sha1($request->route()[1]['uses']);
    }

    public static function getProcessId() {
        return getmypid();
    }

    public static function getThrottleMiddleware(): array {
        $result = [];
        foreach (config('ThrottleRequests') as $key => $attempts) {
            $limitInSeconds = self::_getLimiterSecondsByConfigKey($key);
            if ($limitInSeconds === null || $attempts === null || $attempts === '-1') {
                continue;
            }
            $result[] = "throttle:{$attempts}:{$limitInSeconds}";
        }
        return $result;
    }

    private static function _getLimiterSecondsByConfigKey($key) {
        $map = ['rps' => 1, 'rpm' => 60];
        return $map[$key] ?? null;
    }
}