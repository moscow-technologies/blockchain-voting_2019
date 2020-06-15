<?php

namespace App\Http\Controllers;

use App\Service;
use App\Service\Cache as MemoryCache;
use Illuminate;
use App\Exceptions;
use Illuminate\Http;

class Election extends Base {

    /** @var Service\Config\ConfigInterface */
    protected $_config;

    /** @var Illuminate\View\Factory */
    protected $_view;

    /** @var array */
    private $_settings = [];

    public function __construct(
        Http\Request $request,
        Http\Response $response,
        Service\Logging\BaseLogger $logger,
        Service\OAuth $oauth,
        Service\Election $electionService,
        Service\Setting $settingService,
        Service\Ballot $ballotService
    ) {
        parent::__construct($request, $response, $logger, $oauth, $settingService, $ballotService, $electionService);
        $this->_view = app()['view'];
        $this->_config = Service\Config\PoolConfig::me()->conf('Mgik');
        $this->_addTemplateVar('template_path', resource_path() . '/views/election');
    }

    public function index($guid, Illuminate\Http\Request $request) {
        try {
            if ($guid && $guid === $this->_config->get('testBallot')) {
                $userData['okrug'] = $request->get('okrug') ?? 1;
                $userData['id'] = $request->get('id') ?? 1;
                $this->_addTemplateVar('test', 1);
            } else {
                // TODO: remove test user
                $userData = $this->_electionService->checkGuid($guid);
            }
            //прогрузим настрйоки под нужное голосование
            $this->_settings = $this->_settingService->getSettings($userData['id']);
            $ru_month = array('01'=>'января', '02'=>'февраля', '03'=>'марта', '04'=>'апреля', '05'=>'мая', '06'=>'июня', '07'=>'июля', '08'=>'августа', '09'=>'сентября', '10'=>'октября', '11'=>'ноября', '12'=>'декабря' );

            $startTimeStamp = strtotime($this->_settings['startTime']);
            $endTimeStamp = strtotime($this->_settings['endTime']);
            if ($endTimeStamp-$startTimeStamp<86400) {
                //показываем лишь интервал по времени
                $timeInterval="с по ".($ru_month[date('m',$endTimeStamp)]).' '.date('Y').' года';
            }
            else {
                //показываем интервал по  полной дате
                $timeInterval="с ".date('H ч. i мин.',$startTimeStamp)." ".date('d',$startTimeStamp)." ".($ru_month[date('m',$startTimeStamp)])." по ".date('H ч. i мин.',$endTimeStamp)." ".date('d',$endTimeStamp)." ".($ru_month[date('m',$endTimeStamp)]).' '.date('Y',$endTimeStamp).' года';
            }

            $this->_addTemplateVar('guid', $guid);
            $this->_addTemplateVar('district', $userData['okrug']);
            $this->_addTemplateVar('timeInterval', $timeInterval);
            $this->_addTemplateVar('settings', $this->_settings);
            $this->_addTemplateVar('deputies', $this->_electionService->getDistrictDeputies(\params::cfgArr($this->_settings, 'ballotRef'),$userData['okrug'],\lib::NeedToRenewCache()));
            $this->_addTemplateVar('question', $this->_electionService->getDistrictQuestion(\params::cfgArr($this->_settings, 'ballotRef'),$userData['okrug']));

            $this->_addTemplateVar('dit_voting', json_encode([
                'publicKey' => \params::cfgArr($this->_settings, 'publicKey'),
                'voitingId'=> \params::cfgArr($this->_settings, 'extId')
            ], JSON_UNESCAPED_UNICODE));

            $template = mb_strtolower(\params::cfgArr($this->_settings, 'ballotRef'));
            $this->_addTemplateVar('security', $this->_config->get('security',false));
            //вдруг похачили
            if (!file_exists(resource_path() . "/views/election/{$template}.tpl")) {
                $template = 'show';
            }
            return $this->_renderTemplate($template);
        } catch (Exceptions\LogicException $e) {
            return $this->_processLogicException($e);
        } catch (Exceptions\BallotException $e) {
            $message = $this->_errorsMap[$e->getCode()][0] ?? 'Неизвестная ошибка';
            $logStdout = Service\Logging\StdoutLogger::create('MgicBallotService');
            $this->_logger->error("{$message}, {$e->getMessage()}");
            $logStdout->error("{$message}, {$e->getMessage()}");
            $this->_addTemplateVar('error_message', $message);
            return $this->_renderTemplate('error');
        }
    }

    public function vote() {
        $rawStoreBallotTx = $this->_request->post('rawStoreBallotTx') ?? null;
        $rawTxHash = $this->_request->post('rawTxHash') ?? null;

        $guid = $this->_request->post('guid') ?? null;
        $district = $this->_request->post('district') ?? null;
        $accountAddressBlock = $this->_request->post('accountAddressBlock') ?? null;
        $keyVerificationHash = $this->_request->post('keyVerificationHash') ?? null;
        $votingId = $this->_request->post('votingId') ?? null;

        if (! ($guid && $accountAddressBlock && $keyVerificationHash && $votingId &&$district&& $rawStoreBallotTx&&$rawTxHash)) {
            return $this->_sendAjaxResponse('error');
        }
        $data = [
            'voterAddress'        => $accountAddressBlock,
            'districtId'          => $district,
            'keyVerificationHash' => $keyVerificationHash,
            'tx'                  => $rawStoreBallotTx
        ];

        try {
            $answer = $this->_electionService->sendGuid($guid, $data);
        } catch (Exceptions\BallotException $exception) {
            $answer = $this->_jsonErrorResponse($exception->getCode(), $exception->getMessage(), true);
        }
        $this->_logger->info('Send Guid result', $answer);

        $error = $answer['error'] ?? 0;

        if ($error) {
            $message = $answer['errorMessage'] ?? 'Техническая ошибка';
            return $this->_sendAjaxResponse(['status' => 'error', 'message' => $message, 'code' => 2]);
        }
        $voteHash = $answer['hash'];
        $district = $answer['district'];
        $votingId = $answer['voitingId'];
        $processInsertBallotStart = Service\ProcessDurationLogger::start('insert_ballot');
        try {
            Service\Database::insert('p_ballot', [
                'rawStoreBallotTx'    => $rawStoreBallotTx,
                'guid'                => $guid,
                'district'            => $district,
                'votingId'            => $votingId,
                'accountAddressBlock' => $accountAddressBlock,
                'keyVerificationHash' => $keyVerificationHash,
                'rawTxHash'           => $rawTxHash,
            ]);
        }
        catch (\Exception $e) {
            Service\ProcessDurationLogger::finish($processInsertBallotStart);
            $this->_logger->error($e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return $this->_sendAjaxResponse(['status' => 'error', 'message' => $e->getMessage(), 'code' => 2]);
        }
        Service\ProcessDurationLogger::finish($processInsertBallotStart);

        $sessId = $this->_session->getId();
        MemoryCache::set("tx|$sessId",$rawStoreBallotTx,180);

        $request = new Service\Task\TaskVoteRequest(['PGU_USER_ID' => 0], $voteHash,['voitingId'=>$answer['id']]);
        $processQueueTaskStart = Service\ProcessDurationLogger::start('Queue task start');
        $request->addQueueTask();
        Service\ProcessDurationLogger::finish($processQueueTaskStart);

        return $this->_sendAjaxResponse('success');
    }

    public function check($guid) {
        try {
            $url = $this->_electionService->checkSign($guid);
        } catch (Exceptions\LogicException $exception) {
            return $this->_processLogicException($exception);
        } catch (Exceptions\BallotException $e) {
            return $this->_processBallotException($e, 'Бюллетень не может быть выписан, так как подпись не корректна.');
        }
        return redirect($url);
    }

    public function error() {
        $errors = [
            1 => 'Время истекло.',
            2 => 'Бюллетень уже был отправлен или время истекло.',
        ];
        $code = $this->_request->get('code') ?? null;
        $message = $errors[$code] ?? null;

        if ($code && $message) {
            $this->_addTemplateVar('error_message', $message);
        }
        return $this->_renderTemplate('error');
    }

    public function success() {
        $sessionId =  $this->_session->getId();
        if ($sessionId) {
            $tx = MemoryCache::get("tx|$sessionId");
            $this->_addTemplateVar('tx', $tx);
        }
        $this->_addTemplateVar('mpguUrl', \lib::getMpguUrl());
        return $this->_renderTemplate('success');
    }

    private function _renderTemplate($template) {
        $templatePath = "election.{$template}";
        return view($templatePath);
    }

    private function _addTemplateVar($key, $value): void {
        $this->_view->share($key, $value);
    }

    /**
     * @param string|array $data
     */
    private function _sendAjaxResponse($data) {
        if (is_string($data)) {
            $data = ['status' => $data];
        }
        return response()->json($data, 200, ['Content-Type' => 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE);
    }

    private function _processLogicException(Exceptions\LogicException $e) {
        $data = $e->getData();
        $message = $data['errorMessage'] ?? $e->getMessage();
        if (isset($data['jsonResponse']) && is_array($data['jsonResponse'])) {
            $data['jsonResponse'] = json_encode($data['jsonResponse'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        $logStdout = Service\Logging\StdoutLogger::create('MgicBallotService');
        $this->_logger->error("{$message}, {$e->getMessage()}", $data);
        $logStdout->error("{$message}, {$e->getMessage()}", $data);
        $this->_addTemplateVar('error_message', $e->getMessage());
        return $this->_renderTemplate('error');
    }

    private function _processBallotException(Exceptions\BallotException $e, $message = 'Неизвестная ошибка') {
        $message = $this->_errorsMap[$e->getCode()][0] ?? $message;
        $logStdout = Service\Logging\StdoutLogger::create('MgicBallotService');
        $this->_logger->error("{$message}, {$e->getMessage()}");
        $logStdout->error("{$message}, {$e->getMessage()}");
        $this->_addTemplateVar('error_message', $message);
        return $this->_renderTemplate('error');
    }
}