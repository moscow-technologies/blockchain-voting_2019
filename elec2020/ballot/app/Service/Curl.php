<?php
/** @author Alexey Loginov <a.loginov@inform-tb.ru> */

namespace App\Service;

class Curl {

    public function request(string $url, string $postData, array $getParams, string $method, array $headers = []) {
        return $method === 'POST' ? $this->post($url, $postData, $getParams, $headers) : $this->get($url, $getParams, $headers);
    }

    public function post(string $url, string $postData, array $queryParams, array $headers = []) {
        if (count($queryParams) > 0) {
            $url = "{$url}?" . http_build_query($queryParams);
        }
        $curlHandler = curl_init($url);
        $this->_setDefaultCurlOptions($curlHandler, $headers);
        curl_setopt($curlHandler, CURLOPT_POST, true);
        curl_setopt($curlHandler, CURLOPT_POSTFIELDS, $postData);
        return curl_exec($curlHandler);
    }

    public function get(string $url, array $params, array $headers = []) {
        $query = http_build_query($params);
        $curlHandler = curl_init("{$url}?{$query}");
        $this->_setDefaultCurlOptions($curlHandler, $headers);
        return curl_exec($curlHandler);
    }

    private function _setDefaultCurlOptions($curlHandler, array $headers) {
        curl_setopt($curlHandler, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curlHandler, CURLOPT_RETURNTRANSFER, true);
    }
}