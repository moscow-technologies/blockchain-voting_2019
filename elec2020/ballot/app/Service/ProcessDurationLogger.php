<?php

namespace App\Service;

use App\Entity\Process;

class ProcessDurationLogger {

    private const LOG_CONTEXT_KEY_DURATION = 'duration';

    public static function start($tag) {
        $process = new Process();
        $process->tag = $tag;
        $process->startTime = microtime(true);
        return $process;
    }

    public static function finish(Process $process) {
        $isLogProcessDuration = env('LOG_PROCESS_DURATION', true);
        if (!$isLogProcessDuration) {
            return;
        }
        $duration = microtime(true) - $process->startTime;
        $durationInMs = round($duration * 1000, 1);
        app()['log']->info(
            "Process: {$process->tag}, duration (ms) {$durationInMs}",
            [
                'type'        => self::LOG_CONTEXT_KEY_DURATION,
                'tag'         => $process->tag,
                'duration_ms' => $durationInMs,
                'process_id'  => Utils::getProcessId(),
            ]
        );
    }
}