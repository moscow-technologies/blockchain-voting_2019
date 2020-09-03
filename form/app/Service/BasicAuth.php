<?php

namespace App\Service;

use DateTime;

class BasicAuth
{
    /**
     * @var bool
     */
    protected $enabled = false;

    /**
     * @param string $value
     *
     * @return bool
     */
    public function check($value, $header)
    {
        if ($this->isEnabled()) {
            return !(empty($header) || $header != $value);
        } else {
            return true;
        }
    }

    /**
     * @param string $dateFrom
     * @param string $dateTo
     *
     * @return BasicAuth
     */
    public function setDateInterval($dateFrom, $dateTo)
    {
        if (!empty($dateFrom) && !empty($dateTo)) {
            $from = new DateTime($dateFrom);
            $to   = new DateTime($dateTo);
            $this->setEnabled(($from->getTimestamp() <= time() && $to->getTimestamp() >= time()));
        } elseif (!empty($dateFrom)) {
            $from = new DateTime($dateFrom);
            $this->setEnabled(($from->getTimestamp() <= time()));
        } elseif (!empty($dateTo)) {
            $to = new DateTime($dateTo);
            $this->setEnabled(($to->getTimestamp() >= time()));
        }

        return $this;
    }

    /**
     * @return bool
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param bool $enabled
     *
     * @return $this
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;

        return $this;
    }
}