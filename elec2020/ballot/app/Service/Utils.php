<?php

namespace App\Service;

use Illuminate\Http;

class Utils {

    public static function getActionByRequest(Http\Request $request) {
        $requestUri = $request->getRequestUri();
        $requestUriParts = explode('/', $requestUri);
        return end($requestUriParts);
    }

    public static function getApiVersionByRequest(Http\Request $request) {
        preg_match('|api\/([^\/]+)\/v([0-9\.]+)|', $request->getRequestUri(), $matches);
        return $matches[2] ?? '1';
    }

    public static function getProcessId() {
        return getmypid();
    }
}