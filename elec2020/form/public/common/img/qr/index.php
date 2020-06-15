<?php
/**
 * Подготовка QR-картинок на основе memcached-информации.
 * Предварительно информация должна быть записана в ключ "QR-data|<guid>"
 * для генерации идентификаторов можно использовать lib::create_guid()
 */
require_once(__DIR__.'/../../../data/config/params.php');
require_once(params::$params['common_data_server']['value'].'lib/phpqrcode.php');
require_once(params::$params['common_data_server']['value'].'lib/memory_cache.php');

if (isset($_GET['id'])) {
	$text = MemoryCache::get('QR-data|'.$_GET['id']);
	if ($text === false) {
		$text = MemoryCache::get('mpgu3|QR-data|'.$_GET['id']);
	}
	if ($text === false) {
		header('404 Not Found');
		die;
	}
	$size = isset($_GET['size']) ? (int)$_GET['size'] : 1;
	header('Content-type: image/png');
	QRcode::png($text, NULL, QR_ECLEVEL_L, $size ? $size : 1);
}
else
	header('400 Bad Request');
?>