<?php
/**
 * Диспетчер асинхронной гарантированной доставки
 * Использует таблицы P_TASK_BUFFER (буфер) и P_TASK_LOG (журнал попыток).
 * Для рассылки используется задача common/data/tools/tasks/1m#startTaskManager.php
 */

namespace App\Service\Task;

use App\Service\Config\PoolConfig;
use Exception;
use App\Service\Database;

/**
 * Интерфейс модуля для синхронной или асинхронной отправки данных.
 * Модули должны находиться в каталоге ./taskPlugins/<имя-модуля>.class.php
 * Имя класса плагина - <имя-модуля>
 */

/**
 * Отправка данных.
 * Плагин должен:
 * - вернуть true или вызвать stopTask в случае успеха (прекращение доставки, удаление данных из буфера)
 * - кинуть исключение или вызвать requeueTask (будет запланирован повтор доставки)
 * - вызвать setExtIdAndWait в случае работы с асинхронным веб-сервисом (будет запланирован повтор доставки на случай отсутствия подтверждения)
 */
class TaskManager
{
    protected $bufferID = false; //номер задачки
    private $attemptNo = 0;
    public static $message = false; //сообщение ошибки, может подменяться
    public static $result = false; //сообщение ошибки, может подменяться
    public static $jsonResponse = ''; //чистый ответ внешний системы
    public static $logData = array(); //данные для логирование
    private $hasDecision = false;
    private $fromCron = false;
    private $userID, $pluginName, $graylog, $data, $params; // храним промежуточные данные

    public function getLogger()
    {
        return app()['log'];
    }

    public function getConfig()
    {
        return PoolConfig::me()->get('TaskManager');
    }

    public function log($message = '')
    {
        self::$logData['bufferID'] = $this->bufferID;
        self::$logData['attemptNumber'] = $this->attemptNo;
        self::$logData['userid'] = $this->userID;
        self::$logData['pluginName'] = $this->pluginName;

        self::$logData['jsonRequest'] = json_encode($this->data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        self::$logData['params'] = json_encode($this->params, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        self::$logData['jsonResponse'] = self::$jsonResponse;


        if (!self::$result) {
            if (empty($message)) {
                $message = self::$message;
            }
            self::$logData['errorMessage'] = self::$message;

            self::getLogger()->error($message, self::$logData);
        } else {
            if (!empty($message)) {
                self::$logData['errorMessage'] = $message;
            } else {
                $message = 'OK';
                self::$logData['errorMessage'] = self::$message;
            }
            self::getLogger()->info($message, self::$logData);
        }
    }

    /**
     * Запуск доставки данных.
     * Параметры:
     * - priority: приоритет задачи на асинхронную отправку, по умолчанию 0 (самый низкий)
     * - execute_now: пытаться ли выполнить синхронно, по умолчанию false
     * - ext_id: внешний идентификатор записи для использования плагином, по умолчанию не установлен
     * - max_attempts: максимальное количество попыток отправки до блокировки, по умолчанию params['task_mgr_max_attempts'], либо бесконечно
     * - time_to_try: лимит времени в секундах на попытки отправки до блокировки, по умолчанию params['task_mgr_time_to_try'], либо бесконечно
     * Ничего не возвращает, либо кидает исключение.
     */
    public static function queueTask($userID, $pluginName, $data, $params = array())
    {
//echo 'queueTask: ', $userID, ' ', $pluginName, ' ', $data, ' ', print_r($params, true), "\n";
        if (isset($params['execute_now']) && $params['execute_now']) {
            $id = false;
            if (isset($params['store_in_buffer']) && $params['store_in_buffer']) {
                $params['exec_result'] = 2; //копия заявки
                $id = self::storeDataInBuffer($userID, $pluginName, $data, $params);
            }
            $mgr = new TaskManager();
            $mgr->execute($id, 1, $userID, $data, $pluginName, $params);
        } else return self::storeDataInBuffer($userID, $pluginName, $data, $params);
        return self::$message; //false = успех
    }

    public static function taskBufferTableName()
    {
        return 'p_task_buffer';
    }

    /**
     * Завершение задачи по внешнему идентификатору записи (поддержка асинхронных веб-сервисов).
     */
    public static function stopTaskByExtID($pluginName, $extID, $remove = true)
    {
        if ($pluginName == null || $pluginName == 'ALL') {
            $row = Database\Facade::sql_select('SELECT p_task_buffer_id FROM '.self::taskBufferTableName().' WHERE ext_id=:extID', array(
                    'extID' => $extID));
        } else {
            $row = Database\Facade::sql_select('SELECT p_task_buffer_id FROM '.self::taskBufferTableName().' WHERE plugin_name=:pluginName AND ext_id=:extID', array(
                    'pluginName' => $pluginName,
                    'extID' => $extID));
        }
        if (!empty($row[0]['p_task_buffer_id'])) {
            for ($i = 0, $len = sizeof($row); $i < $len; ++$i) {
                $bufferID = $row[$i]['p_task_buffer_id'];
                if ($remove) {
                    Database\Facade::delete_record(self::taskBufferTableName(), array(
                        'p_task_buffer_id' => $bufferID));
                    $message = 'задача завершена и удалена';
                } else {
                    Database\Facade::update_record(self::taskBufferTableName(), array(
                        'failed' => 0,
                        'try_till' => time(),
                        'message' => null
                        ), array(), array(
                        'p_task_buffer_id' => $bufferID)
                    );
                    $message = 'задача завершена';
                }
                $mgr->log($message);
                self::$message = 'OK';
                self::$result = true;
            }
        }
    }

    private static function storeDataInBuffer($userID, $pluginName, $data, $params)
    {
        $mgr = new TaskManager();
//echo 'storeDataInBuffer: ', $userID, ' ', $pluginName, ' ', print_r($data, true), ' ', print_r($params, true), "\n";
        $fields = array(
            'pgu_user_id' => $userID,
            'plugin_name' => $pluginName,
            'ext_id' => isset($params['ext_id']) ? $params['ext_id'] : NULL,
            'app_id' => isset($params['app_id']) ? $params['app_id'] : NULL,
            'data' => serialize($data),
            'task_priority' => isset($params['priority']) ? $params['priority'] : 0,
            'attempts' => 0,
            'created_at' => time(),
            'next_attempt_time' => isset($params['startTime']) ? $params['startTime'] : 0, // исполнить ASAP
            // Columns added by myself, to comply with postgress tables restrictions
            'failed' => 0,
            'message' => '',
        );
        if (isset($params['exec_result'])) $fields['failed'] = $params['exec_result'];




        if (isset($params['max_attempts'])) {
            $fields['max_attempts'] = $params['max_attempts'];
        } else {
            $fields['max_attempts'] = $mgr->getConfig()->get("plugin/$pluginName/max_attempts", $mgr->getConfig()->get("max_attempts", 10));
        }

        if (isset($params['time_to_try'])) {
            $fields['try_till'] = time() + $params['time_to_try'];
        } else {

            $fields['try_till'] = time() + $mgr->getConfig()->get("plugin/$pluginName/attempts_sleep_time", $mgr->getConfig()->get("attempts_sleep_time", 120));
        }

        if (!empty($fields['ext_id']) && !empty($fields['app_id'])) {
            Database\Facade::delete_record(self::taskBufferTableName(), array(
                'ext_id' => $fields['ext_id'],
                'app_id' => $fields['app_id']));
        }


        Database\Facade::insert_record(self::taskBufferTableName(), $fields);
        return Database\Facade::last_insert_id('p_task_buffer_SEQ');
    }

    public function __construct($from_cron = false)
    {
        $this->fromCron = $from_cron;
        self::$message = false; //успешная отправка по умолчанию
    }

    private function execute($bufferID, $attemptNo, $userID, $data, $pluginName, $params)
    {
        if ($this->fromCron) echo 'execute: ', $bufferID, ' ', $attemptNo, ' ', $userID, ' ', print_r($data, true), ' ', $pluginName, ' ', print_r($params, true), "\n";
        $this->attemptNo = $attemptNo;
        if ($bufferID) $this->bufferID = $bufferID;
        else {
            $this->userID = $userID;
            $this->pluginName = $pluginName;
            $this->data = $data;
            $this->params = $params;
        }

        try {
            //$pluginName = preg_replace('/[^A-z0-9\_]/', '', $pluginName); // поставим защиту от хакеров
            //$pluginFile = __DIR__.'/Plugin/'.$pluginName.'.php';
            //if (!file_exists($pluginFile)) throw new Exception('Отсутствует файл плагина '.$pluginName.' для диспетчера задач');
            //if (!include_once($pluginFile)) throw new Exception('Ошибка при подключении плагина '.$pluginName.' для диспетчера задач');
            //if (!class_exists($pluginName)) throw new Exception('Ошибка при создании плагина '.$pluginName.' для диспетчера задач - нет нужного класса');
            //if (!in_array('TaskPlugin', class_implements($pluginName))) throw new Exception('Ошибка при создании плагина '.$pluginName.' для диспетчера задач - нет нужного интерфейса');
            $namespace = "App\Service\Task\Plugin";
            $pluginFullName = "{$namespace}\\$pluginName";
            $plugin = new $pluginFullName();

            self::$message = '';
            $plugin->executeTask($this, $attemptNo, $userID, $data, isset($params['ext_id']) ? $params['ext_id'] : NULL);
            if (!$this->hasDecision) throw new Exception('Неизвестен результат исполнения задачи');
        } catch (Exception $e) {
            self::$message = $e->getMessage();
            self::log('PLUGIN ERROR: '.$e->getMessage());
            $this->requeueTask("Message {$e->getMessage()}, trace: {$e->getTraceAsString()}");
        }
    }

    /**
     * Метод для плагина: успешное завершение задачи
     * @param boolean $remove Удалять ли задачу
     */
    public function stopTask(bool $success = true, bool $remove = true, string $message = NULL)
    {


        if ($this->fromCron) echo 'stopTask ', $this->bufferID, "\n";
        if (empty($message)) {
            self::$message = $message; //сигнализируем о ошибке
        }
        if ($success) {
            self::$message = '';
        }


        self::$result = $success;

        $this->hasDecision = true;
        if ($this->bufferID) {
            if ($success && $remove && !$message) {

                Database\Facade::delete_record(self::taskBufferTableName(), array(
                    'p_task_buffer_id' => $this->bufferID));
            } else {
                if (!$success && empty($message)) {
                    $message = 'Завершили задачу с ошибкой '.$this->attemptNo;
                }
                Database\Facade::update_record(self::taskBufferTableName(), array(
                    'failed' => ($success ? 0 : 1),
                    'message' => $message,
                    'try_till' => time()
                    ), array(), array(
                    'p_task_buffer_id' => $this->bufferID));
            }
            $this->log($message);
        }
    }

    /**
     * Метод для плагина: планируем повтор задачи
     * $nextAttemptAt - unix-штамп времени для следующего исполения задачи
     */
    public function requeueTask($message, $nextAttemptAt = NULL)
    {
        if ($this->fromCron) echo 'requeueTask ', $this->bufferID, ', "', $message, '", повтор через ', $nextAttemptAt === NULL ? $this->attemptNo * 60 : $nextAttemptAt - time(), ' секунд', "\n";
        if (!$this->bufferID) $this->bufferID = self::storeDataInBuffer($this->userID, $this->pluginName, $this->data, $this->params);

        $this->hasDecision = true;
        Database\Facade::update_record(self::taskBufferTableName(), array(
            'unlock_time' => NULL, // разблокируем запись
            'next_attempt_time' => $nextAttemptAt === NULL ? time() + $this->attemptNo * 60 : $nextAttemptAt, // по умолчанию откладываем следующую попытку
            'attempts' => $this->attemptNo, // сохраняем номер попытки
            'process_id' => NULL,
            'message' => $message,
            'failed'=>0
            ), array(), array(
            'p_task_buffer_id' => $this->bufferID));
        self::$result = false;
        self::$message = 'задача на переотправке. Попытка '.$this->attemptNo;
        $this->log('задача на переотправке. Попытка '.$this->attemptNo);
    }

    /**
     * Метод для плагина: запланировать следующее выполнение задачи в случае работы с асинхронным веб-сервисом
     * $nextAttemptAt - unix-штамп времени для следующего исполения задачи
     */
    public function setExtIdAndWait($extID, $message = false, $nextAttemptAt = NULL)
    {

        if ($this->fromCron) echo 'setExtIdAndWait ', $this->bufferID, ', ', $extID, ', "', $message, '", повтор через ', $nextAttemptAt === NULL ? $this->attemptNo * 60 : $nextAttemptAt - time(), ' секунд', "\n";
        if (!$this->bufferID && !empty($this->data)) $this->bufferID = self::storeDataInBuffer($this->userID, $this->pluginName, $this->data, $this->params);
        elseif (!$this->bufferID && $extID) {
            //найдем
        }
        self::$result = false;

        self::$message = $message ? '' : $message;
        $this->hasDecision = true;
        if (!$this->bufferID && $extID) {
            //найдем
            $searchData = array(
                'ext_id' => $extID);
        } else $searchData = array(
                'p_task_buffer_id' => $this->bufferID);

        $data = array(
            'ext_id' => $extID, // установим внешний идентификатор
            'unlock_time' => NULL, // разблокируем запись
            'next_attempt_time' => $nextAttemptAt !== NULL ? $nextAttemptAt : (time() + $this->attemptNo * 60), // по умолчанию откладываем следующую попытку
            'process_id' => NULL,
            'failed' => NULL,
            'message' => $message
        );
        if ($this->attemptNo) $data['attempts'] = $this->attemptNo;
        Database\Facade::update_record(self::taskBufferTableName(), $data, array(), $searchData);
        $this->log('задача на переотправке. Попытка '.$this->attemptNo);
    }

    public function getBufferID()
    {
        return $this->bufferID;
    }

    public function executeCronTask($bufferID, $attemptNo, $userID, $data, $pluginName, $params)
    {
        return $this->execute($bufferID, $attemptNo, $userID, $data, $pluginName, $params);
    }
}