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

    public static function parseDistrict() {
        $result = [];
        $districts = explode(';', env('DISTRICTS', ''));
        foreach ($districts as $district) {
            $districtData = explode('=', $district);
            if (count($districtData) !== 3) {
                continue;
            }
            $result["{$districtData[0]}"] = [
                'voteStartDate' => $districtData[1],
                'title_parent_case' => $districtData[2],
            ];
        }
        return $result;
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