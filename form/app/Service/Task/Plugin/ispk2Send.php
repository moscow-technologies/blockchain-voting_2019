<?php

namespace App\Service\Task\Plugin;

use App\Service\Config\FileConfig;

class ispk2Send extends ispkSend
{
    /**
     * @return FileConfig
     */
    public function getConfig()
    {
        return new FileConfig('Ispk2');
    }
}

?>