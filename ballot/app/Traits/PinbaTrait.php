<?php
/**
 * Created by PhpStorm.
 * User: artiom
 * Date: 30.03.17
 * Time: 22:52
 */

namespace App\Traits;

trait PinbaTrait
{
    /**
     * @var Pinba
     */
    protected $monitoring = null;

    /**
     * @return Pinba
     */
    protected function getMonitoring()
    {
        return $this->monitoring;
    }

    /**
     * @param Pinba $monitoring
     *
     * @return $this
     */
    public function setMonitoring($monitoring)
    {
        $this->monitoring = $monitoring;

        return $this;
    }

    /**
     * @param string $name
     * @param array $tags
     *
     * @return $this
     */
    protected function timerStart($name, array $tags)
    {
        $monitoring = $this->getMonitoring();
        if ($monitoring) {
            $monitoring->timerStart($name, $tags);
        }

        return $this;
    }

    /**
     * @param string $name
     *
     * @return $this
     */
    protected function timerStop($name)
    {
        $monitoring = $this->getMonitoring();
        if ($monitoring) {
            $monitoring->timerStop($name);
        }

        return $this;
    }

    /**
     * @return $this
     */
    protected function timerFlush()
    {
        $monitoring = $this->getMonitoring();
        if ($monitoring) {
            $monitoring->flush();
        }

        return $this;

    }
}