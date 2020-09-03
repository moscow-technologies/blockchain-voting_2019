<?php

namespace App\Service;

use Carbon\Carbon;

class Guid {

    private const TABLE_NAME = 'p_guid';

    public function getGuids(): array {
        $res = Database::executeChain([
            'table' => 'p_guid',
            'select' => '*',
            'get' => null,
            'all' => null,
        ]);
        return array_map(function ($stdClass) {
            return (array)$stdClass;
        }, $res);
    }

    public function storeGuid($guid, $id, $extId, $district, $sessionId, $voteEnd): void {
        Database::insert(self::TABLE_NAME, [
            'vote_id'     => $id,
            'vote_ext_id' => $extId,
            'guid'        => $guid,
            'district'    => $district,
            'session_id'  => $sessionId,
            'vote_end'    => Carbon::createFromTimestamp($voteEnd),
            'created_at'  => Carbon::now(),
        ]);
    }

    public function removeGuid(string $guid): void {
        Database::executeChain([
            'table' => 'p_guid',
            'where' => ['args' => ['guid', $guid]],
            'delete' => null,
        ]);
    }

    public function updateGuid(string $guid, array $fields): void {
        $fields['updated_at'] = Carbon::now();
        Database::executeChain([
            'table' => 'p_guid',
            'where' => ['args' => ['guid', $guid]],
            'update' => $fields
        ]);
    }
}