<?php

namespace App\Service;

class Config {

    public static function getConfig($name) {
        return config($name);
    }
}