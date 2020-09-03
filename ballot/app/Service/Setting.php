<?php
/**
 * Описание класса Setting
 *
 * @author Сорокин Константин Николаевич
 * @date 21.02.2020 18:22:29
 */

namespace App\Service;

use App\Service\Cache as MemoryCache;

class Setting
{
    protected $table = 'p_settings';
    protected $_cacheTime = 86400;
    public function getSettings(int $idVoiters,$force=false) :array {
        $settingsGetProcess = ProcessDurationLogger::start('get_settings');
        $cacheKey = "voit|$idVoiters";
        if ($force) {
            $result = [];
        }
        else {
            $result = MemoryCache::get($cacheKey);
        }
        if (empty($result)){
            $settingQuery  = "select * from {$this->table} where id=:id limit 1";
            $result = Database::select($settingQuery, ['id'=>$idVoiters]);
            $result = array_map(function ($item) {
                return (array)$item;
            }, $result);
            if (!empty($result[0])) {
                $result = $result[0];
                MemoryCache::set($cacheKey,$result,$this->_cacheTime);
            }
        }
        ProcessDurationLogger::finish($settingsGetProcess);
        return $result;
    }

    public function getAllSettings(): array
    {
        $getAllSettingsProcess = ProcessDurationLogger::start('get_settings_all');
        $settingQuery = "select * from {$this->table}";
        $result = Database::select($settingQuery, []);
        $result = array_map(function ($item) {
            return (array)$item;
        }, $result);
        ProcessDurationLogger::finish($getAllSettingsProcess);
        return $result;
    }

    public function setSettings(int $idVoiters,$data) : bool {
        $setSettingsProcess = ProcessDurationLogger::start('set_settings');
        $result = Database::table($this->table)->where('id', $idVoiters)->update($data);
        $this->getSettings($idVoiters,true);
        ProcessDurationLogger::finish($setSettingsProcess);
        return $result;
    }

    public function deleteSettings(int $idVoiters) : bool {
        $deleteSettingsProcess = ProcessDurationLogger::start('delete_settings');
        $result = Database::table($this->table)->delete($idVoiters);
        MemoryCache::delete("voit|$idVoiters");
        ProcessDurationLogger::finish($deleteSettingsProcess);
        return $result;
    }

    public function addSettings($data) : bool {
        $result = Database::table($this->table)->insert($data);
        $this->getSettings($data['id'],true);
        return $result;
    }

    private static $_instance;
    static public function me() : Setting{
        if (empty(self::$_instance)){
            self::$_instance = new Setting();
        }
        return self::$_instance;
    }
}