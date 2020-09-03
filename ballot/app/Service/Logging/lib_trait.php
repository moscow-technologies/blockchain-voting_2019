<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Service\Logging;

trait lib_trait
{

    public static function clientIP()
    {
        return isset($_SERVER['HTTP_IV_REMOTE_ADDRESS']) ? $_SERVER['HTTP_IV_REMOTE_ADDRESS'] :
            (isset($_SERVER['HTTP_X_REAL_IP']) ? $_SERVER['HTTP_X_REAL_IP'] : (!empty($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : ''));
    }

    public static function serverIP()
    {
//		if (preg_match_all('/inet addr: ?([^ ]+)/', `ifconfig`, $ips))
//			return $ips[1][0];
        if (isset($_SERVER['SERVER_ADDR'])) return $_SERVER['SERVER_ADDR'];
        else return '';
    }
}