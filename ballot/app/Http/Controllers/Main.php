<?php

namespace App\Http\Controllers;

use App\Exceptions;

class Main extends Base {

    public function auth() {
        $this->_oauth->initToken();
        $url = $this->_config->get('crypt/service').'/documents/encrypt';
        $params = [
            "Content" => base64_encode('Тестовый запрос'),
            "Encryption" => [
                "Type" => 0,
                "Parameters" => new \stdClass(),
                "Certificates" => [
                    $this->_config->get('crypt/cert'),
                ],
            ],
        ];
        $params = json_encode($params);
        $curlOptions = [
            CURLOPT_POST => 1,
            CURLOPT_POSTFIELDS => $params,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8'],
        ];
        list($resultJson, $http, $error) = $this->_oauth->requestJson($url, $curlOptions);
        $result = json_decode($resultJson, true);
        $url = $this->_config->get('crypt/service').'/documents/decrypt/parse';
        $params = array(
            "Content" => $result,
            "Decryption" => [
                "Type" => 0,
                "CertificateId" => 0,
            ],
        );
        $params = json_encode($params);
        $curlOptions = array(
            CURLOPT_POST => 1,
            CURLOPT_POSTFIELDS => $params,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json; charset=utf-8'
            )
        );
        list($resultJson, $http, $error) = $this->_oauth->requestJson($url, $curlOptions);
        $result = json_decode($resultJson, true);
        return $this->_jsonSuccessResponse('Токен получен. id сертификата '.$result[0]);
    }

    public function getGuid() {
        $data = $this->_data();
        try {
            $response = $this->_ballotService->getGuid($data);
        } catch (Exceptions\BallotException $exception) {
            return $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage());
        }
        return $this->_jsonSuccessResponse(['result' => $response]);
    }

    public function decrypt() {
        $data = $this->_data();
        try {
            $response = $this->_ballotService->decrypt($data);
        } catch (Exceptions\BallotException $exception) {
            return $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage());
        }
        return $this->_jsonSuccessResponse(['result' => $response]);
    }

    public function crypt() {
        $data = $this->_data();
        try {
            $response = $this->_ballotService->crypt($data);
        } catch (Exceptions\BallotException $exception) {
            return $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage());
        }
        return $this->_jsonSuccessResponse(['result' => $response]);
    }

    public function checkGuid() {
        $data = $this->_data();
        try {
            $response = $this->_ballotService->checkGuid($data);
        } catch (Exceptions\BallotException $exception) {
            return $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage());
        }
        return $this->_jsonSuccessResponse(['result' => $response]);
    }

    public function receiveGuid() {
        $data = $this->_data();
        try {
            $response = $this->_ballotService->receiveGuid($data);
        } catch (Exceptions\BallotException $exception) {
            return $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage());
        }
        return $this->_jsonSuccessResponse(['result' => $response]);
    }

    public function sendGuid() {
        $data = $this->_data();
        try {
            $response = $this->_ballotService->sendGuid($data);
        } catch (Exceptions\BallotException $exception) {
            return $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage());
        }
        return $this->_jsonSuccessResponse(['result' => $response]);
    }

    public function checkSign() {
        $data = $this->_data();
        try {
            $response = $this->_ballotService->checkSign($data);
        } catch (Exceptions\BallotException $exception) {
            return $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage());
        }
        return $this->_jsonSuccessResponse(['result' => $response]);
    }

    private function _data() {
        $requestParams = $this->_request->all();
        return array_key_exists('data', $requestParams) ? $requestParams['data'] : $requestParams;
    }
}