<?php

namespace App\Service\Task\Plugin;

use App\Service\Ispk;
use App\Service\Config\FileConfig;

class ispkSend implements TaskPlugin {

	protected $debug = false;
	protected $logging = true;
	protected $logFile = 'ispkSend.log';

	public function executeTask($taskManager, $attemptNumber, $userID, $data, $extID) {
        $ispkConf = $this->getConfig();
        $IspkHandler = new Ispk($ispkConf);
        list($result,$message) = $IspkHandler->sendEvent($data,$attemptNumber,$taskManager->getBufferID(),$extID);
		if ($result) {
			$taskManager->stopTask(true);
		}
	}

    /**
     * @return FileConfig
     */
    public function getConfig()
    {
        return new FileConfig('Ispk');
    }
}

?>