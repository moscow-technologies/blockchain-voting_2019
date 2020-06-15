<?php

namespace App\Service\Logging;

use App\Service\Config;
use Gelf\Encoder\JsonEncoder;
use Gelf\Publisher;
use Gelf\Transport\UdpTransport;
use Gelf\Transport\AmqpTransport;

require_once(base_path() . '/app/Service/Broker/AMQPExchange.php');
require_once(base_path() .'/app/Service/Broker/AMQPQueue.php');
use App\Service\Broker\BrokerAmqp;
use Monolog\Formatter\GelfMessageFormatter;
use Monolog\Logger;
use Monolog\Handler\GelfHandler;

/**
 * Class GrayLogLogger
 * @package Itb\Mpgu\Logger
 */
class GrayLogLogger extends BaseLogger
{

    use lib_trait;

    /**
     * @var string
     */
    protected $hostname = '127.0.0.1';

    /**
     * @var string
     */
    protected $port = '12201';

    /**
     * @var int
     */
    protected $logLevel = Logger::INFO;

    /**
     * @var bool
     */
    protected $bubble = true;

    /**
     * @var null
     */
    protected $encoder = null;
    protected $facility = null;

    /**
     * GrayLogLogger constructor.
     * @param string $facility
     * @param array $options
     * @param array|\callable[]|int $logLevel
     */
    public function __construct($facility, $logLevel = Logger::INFO, $confFile = 'Graylog')
    {
        $this->logger = new Logger($facility);
        if (empty($this->facility)) {
            $this->facility = $facility;
        }
        $options = Config::getConfig($confFile);
        $this->setEncoder(new JsonEncoder());

        if (is_array($options) && $logLevel) {
            $this->setLogLevel($logLevel);
            $this->setHostname($options['connstring']['host']??$options['hostname']);
            $this->setPort($options['connstring']['port']??$options['port']);
            $this->setBubble($options['bubble']);

            $publisher = new Publisher();
            if (empty($options['transport'])) $options['transport'] = 'udp';
            $options['transport'] = strtolower($options['transport']);
            switch ($options['transport']){
                case 'stomp':

                    $broker = new StompLogger("tcp://{$options['connstring']['host']}:{$options['connstring']['port']}",$options['connstring']['queue'],$options['connstring']['exchange']??'',$options['connstring']['vhost']??'/',$options['connstring']['login'],$options['connstring']['pass']);
                    $publisher->addTransport($broker->setMessageEncoder($this->getEncoder()));
                    break;
                case 'amqp':
                    $exchange = new \AMQPExchange();
                    $exchange->setOptions($options);
                    $exchange->setQueue($options['connstring']['queue']??'');
                    $queue = new \AMQPQueue($options['connstring']['queue']??'');
                    $AmqpTransport = new AmqpTransport($exchange,$queue);
                    $publisher->addTransport($AmqpTransport->setMessageEncoder($this->getEncoder()));


                    break;

                case 'udp':
                default:
                    $UdpTransport = new UdpTransport(
                        $this->getHostname(),
                        $this->getPort(),
                        UdpTransport::CHUNK_SIZE_LAN
                    );
                    $publisher->addTransport($UdpTransport->setMessageEncoder($this->getEncoder()));
                    break;
            }

            $gelfHandler = new GelfHandler($publisher, $this->getLogLevel(), $this->getBubble());
            $gelfHandler->setFormatter(new GelfMessageFormatter(null, null, ''));
            $this->logger->pushHandler($gelfHandler);
        }
    }


    /**
     * Создать инстанс
     *
     * @param $facility
     * @param array $options
     * @param int $logLevel
     * @return GrayLogLogger
     */
    public static function create($facility, $logLevel = Logger::INFO, $confFile = 'Graylog')
    {
        $hostname = explode('/', \params::$mainHost);
        $facilityWithHostname = $facility.' ['.$hostname[0].']';
        $instance = new self($facilityWithHostname, $logLevel,$confFile);
        $instance->setFacility($facility);
        return $instance;
    }

    public function getMainContext(array $context=array()){
        return array_merge($context,
            array(
                'referer'=>$_SERVER['HTTP_REFERER'] ?? '',
                'pid'=> posix_getpid(),
                'global'=>'ELEC_FORM',
                'sessid'=> app()['session.store']->getId(),
                'ip'=>self::clientIP(),
                'serverIp'=>self::serverIP(),
                'type'=>$this->facility
            ));
    }

    /**
     * @return string
     */
    public function getHostname()
    {
        return $this->hostname;
    }

    /**
     * @param string $hostname
     * @return GrayLogLogger
     */
    public function setHostname($hostname)
    {
        $this->hostname = $hostname;
        return $this;
    }
    public function setFacility($facility)
    {
        $this->facility = $facility;
        return $this;
    }

    /**
     * @return string
     */
    public function getPort()
    {
        return $this->port;
    }

    /**
     * @param string $port
     * @return GrayLogLogger
     */
    public function setPort($port)
    {
        $this->port = $port;
        return $this;
    }

    /**
     * @return int
     */
    public function getLogLevel()
    {
        return $this->logLevel;
    }

    /**
     * @param int $logLevel
     * @return GrayLogLogger
     */
    public function setLogLevel($logLevel)
    {
        $this->logLevel = $logLevel;
        return $this;
    }

    /**
     * @return bool
     */
    public function getBubble()
    {
        return $this->bubble;
    }

    /**
     * @return bool
     */
    public function isBubble()
    {
        return $this->bubble;
    }

    /**
     * @param bool $bubble
     * @return GrayLogLogger
     */
    public function setBubble($bubble)
    {
        $this->bubble = $bubble;
        return $this;
    }

    /**
     * @return null
     */
    public function getEncoder()
    {
        return $this->encoder;
    }

    /**
     * @param null $encoder
     * @return GrayLogLogger
     */
    public function setEncoder($encoder)
    {
        $this->encoder = $encoder;
        return $this;
    }

}
