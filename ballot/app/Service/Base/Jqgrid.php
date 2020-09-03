<?php
/**
 * Описание класса Jqgrid
 *
 * @author Сорокин Константин Николаевич
 * @date 17.02.2020 15:11:41
 * @description класс для обработки модели таблиц
 */

namespace App\Service\Base;

use Arm\Lib\Interfaces\Implement;
use params;

require_once(params::$params['common_data_server'].'/lib/db/db.php');

use db,
    db_access;
use Arm\Module\user\User;
use DBDebugException;
use Arm\Module\module\BaseModule;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class Jqgrid extends BaseModule implements Implement
{
    protected $perPage = 30;
    protected $rowList = [100, 200, 500, 1000];
    protected $defaultAcl = [1, 2, 3];
    protected $table = '';
    protected $editable = true; //возможность редактировать поля
    protected $searchable = true; //возможность фильтровать
    protected $sortable = true; //возможность фильтровать
    protected $model = [];
    protected $client, $action, $config;
    protected $defaultSort = 'ASC';
    protected $defaultField = ''; //сортировачный ключ по умолчанию
    protected $idField = ''; // главное поле в бд
    protected $idKeyFromUrl = ''; // поле по которому в урле можен фильтр приходить в поле id
    protected $errorsMap = [
        1 => 'Не указан id для совершения действия',
        2 => 'Неожиданный метод',
        3 => 'Нет такой записи',
        4 => 'У Вас нет доступа к данному модулю'
    ];
    protected $defaultFormatOptions = [
        "editbutton" => true,
        "delbutton" => true,
        "restoreAfterError" => true,
        "keys" => true,
    ];

    function __construct()
    {
        $this->client = User::getCurrent();
    }

    public function handle($action)
    {
        $this->action = $action;
        if (!empty($_GET['id']) && empty($_GET['block'])) {
            $id = (int) $_GET['id'];
            $block = null;
            $postfix = "$id/";
        } elseif (!empty($_GET['id']) && !empty($_GET['block'])) {
            $block = $_GET['block'];
            $id = (int) $_GET['id'];
            $postfix = "{$_GET['block']}/$id/";
        } else {
            $id = null;
            $block = null;
            $postfix = '';
        }

        if (!$this->checkAccess($this->defaultAcl)) {
            return $this->sendError(4);
        }
        $result = [];
        switch ($action) {
            case 'model':
                array_unshift($this->rowList, $this->perPage);
                $result = [
                    'url' => params::$domen.'/ws/ajax/'.$_REQUEST['ajaxModule'].'/data/'.$postfix,
                    "datatype" => "json",
                    'colModel' => $this->model,
                    'rowNum' => $this->perPage,
                    'rowList' => $this->rowList,
//                    onSelectRow: editRow,
                    'sortable' => $this->sortable
                ];
                if ($this->searchable) {
                    $result['searching'] = [
                        'defaultSearch' => "cn"];
                }
                $result['colModel'] = array_values($result['colModel']);
                if ($this->editable) {

                    $result['editurl'] = params::$domen.'/ws/ajax/'.$_REQUEST['ajaxModule'].'/edit/'.$postfix;
                    array_unshift($result['colModel'], [
                        'name' => 'act',
                        'label' => '',
                        'width' => '44px',
                        "resizable" => false,
                        "sortable" => false,
                        "search" => false,
                        "align" => "center",
                        "editable" => false,
                        "viewable" => false,
                        "fixed" => true,
                        "formatter" => 'actions',
                        "formatoptions" => $this->defaultFormatOptions
                    ]);
                }

                break;
            case 'count':
                $result = $this->getCount($id);
                break;
            case 'download':
                if (empty($block)) {
                    $this->sendError(1);
                }
                $result = $this->download($id, $block);
                break;
            case 'data':


                //дефолтовая страница


                list($cnt, $whereSQL, $whereBinds) = $this->getCount($id, true);

                $curPage = !empty($_REQUEST['page']) ? (int) $_REQUEST['page'] : 1;
                $this->perPage = (int) $_REQUEST['rows'] ?? $this->perPage;
                if ($cnt) {


                    if (!empty($_REQUEST['sord'])) {
                        $sortDist = $_REQUEST['sord'] == 'desc' ? 'DESC' : $this->defaultSort; //сортировка
                        $sortField = !empty($_REQUEST['sidx']) ? (string) $_REQUEST['sidx'] : $this->defaultField;
                    } else {
                        $sortDist = $this->defaultSort;
                        $sortField = $this->model[0]['name'];
                    }
                    $orderSQL = " ORDER BY \"$sortField\" $sortDist";

                    $records = $cnt;
                    $totalPages = ceil($records / $this->perPage);
                    if ($curPage > $totalPages) { //нехрен хитрить тут нам
                        $curPage = 1;
                    }
                    $offset = ($curPage - 1) * $this->perPage;
                    $modelKeys = array_column($this->model, 'name');
                    $limitSql = " LIMIT {$this->perPage}  OFFSET $offset";
                    $query = "select \"{$this->idField}\" as id,\"".implode('","', $modelKeys)."\" from \"{$this->table}\" ".$whereSQL.$orderSQL.$limitSql;
                    $items = db::sql_select($query, $whereBinds);
                } else {
                    //какая то ошибка произошла
                    $totalPages = 0;
                    $records = 0;
                    $items = [];
                }



                $result = [
                    "records" => $records,
                    "page" => $curPage,
                    "total" => $totalPages,
                    "rows" => $items
                ];
                break;
            case 'edit':

                switch ($_POST["oper"]) {
                    case "add":

                        $data = $this->modifyTypesToBd($_POST);
                        // do mysql insert statement here
                        if (!empty($id)) {
                            $data[$this->idKeyFromUrl] = $id;
                        }
                        try {
                            db::insert_record($this->table, $data);
                            list($result,$message) = $this->callbackPreChange('add', $id, $data);
                            if ($result) {
                                $id = db::get_insert_id($this->table, $this->idField);
                                $this->callbackChange('add', $id, $data);
                                $result = ['result' => true, 'message' => 'Добавили запись'];
                            } else {
                                $result = ['result' => false, 'message' => $message];
                            }
                        } catch (DBDebugException $e) {
                            $result = ['result' => false, 'message' => 'Запись уже сущесвует', 'debugMessage' => $e->getMessage()];
                        }
                        break;
                    case "edit":
                        // do mysql update statement here
                        $groupid = $id;
                        $editId = $_POST['id'] ?? 0;
                        if (!$id) {
                            return $this->sendError(1);
                        }
                        //сначало проверим, что запись есть и значения другие
                      
                        $data = $this->modifyTypesToBd($_POST);
                          if (!empty($id)) {
                            $data[$this->idKeyFromUrl] = $id;
                        }
                        $dataToSave = $data;
                           
                        $query = "select \"".implode('","', array_keys($data))."\" from \"{$this->table}\" where \"{$this->idField}\"=:{$this->idField}";
                     
                        $row = db::sql_select($query, array($this->idField => $editId));
                        if (empty($row[0])) {
                            return $this->sendError(3);
                        }

                        foreach ($data as $key => $value) {
                            if (!array_key_exists($key, $row[0]) || $row[0][$key] == $value) {
                                unset($data[$key]);
                            }
                        }
                        if (!empty($data)) {
                            list($result,$message) = $this->callbackPreChange('upd', $editId, $dataToSave);
                            if ($result) {
                                $resultUpd = db::update_record($this->table, $data, [], [$this->idField => $editId]);
                                $this->callbackChange('upd', $editId, $dataToSave);
                                $result = ['result' => $resultUpd, 'message' => 'Обновили'];
                            } else {
                                $result = ['result' => false, 'message' => $message];
                            }
                        } else {
                            list($result,$message) = $this->callbackPreChange('upd', $editId, $dataToSave);
                            if ($result) {
                                $this->callbackChange('upd', $editId, $dataToSave);
                                //нечего обновлять уже
                                $result = ['result' => true, 'message' => 'Нечего обновлять'];
                            } else {
                                $result = ['result' => false, 'message' => $message];
                            }
                        }


                        break;
                    case "del":
                        // do mysql delete statement here
                        $id = $_POST['id'] ?? null;
                        if (!$id) {
                            return $this->sendError(1);
                        }
                        $data = [];
                        if (!empty($id)) {
                            $data[$this->idKeyFromUrl] = $id;
                        }
                        list($result,$message) = $this->callbackPreChange('del', $id, $data);
                        if ($result) {
                            $resultDel = db::delete_record($this->table, [$this->idField => $id]);
                            $this->callbackChange('del', $id, $data);
                            $result = ['result' => $resultDel, 'message' => 'Обновили'];
                        } else {
                            $result = ['result' => false, 'message' => $message];
                        }
                        break;
                }

                break;

            default:
                return $this->sendError(2);
                break;
        }


        return $this->sendOk($result);
    }

    public function getDataFromId(int $id):array
    {
        $result =  db::sql_select("select * from \"$this->table\" where \"$this->idField\"=:id", ['id'=>$id]);
        return $result[0]??[];
    }

    public function getCount($id = null, $returnWidthBinds = false)
    {

        $whereSQL = '';
        $whereBinds = [];
        $whereSQLBinds = [];

        if (!empty($id) && !empty($this->idKeyFromUrl)) {
            $whereBinds[$this->idKeyFromUrl] = $id;
            $whereSQLBinds[] = "\"{$this->idKeyFromUrl}\"=:{$this->idKeyFromUrl}";
        }

        if (!empty($_REQUEST['_search']) && $_REQUEST['_search'] === 'true') {
            //обработаем запрос поиска по таблице
            //вычленим поля, которые мы ищем
            $data = $this->modifyTypesToBd($_GET);
            foreach ($data as $name => $value) {
                $whereBinds[$name] = $value;
                $whereSQLBinds[] = "\"{$name}\"=:{$name}";
            }
            if (!empty($whereBinds)) {
                $whereSQL = ' where '.implode(' AND ', $whereSQLBinds);
            }

            $queryCount = "select count(\"{$this->idField}\") as cnt from \"{$this->table}\" ".$whereSQL;
        } else {
            if (!empty($whereBinds)) {
                $whereSQL = ' where '.implode(' AND ', $whereSQLBinds);
            }
            $queryCount = "select count(\"{$this->idField}\") as cnt from \"{$this->table}\" ".$whereSQL;
        }

        $resultCount = db::sql_select($queryCount, $whereBinds);
        if ($returnWidthBinds) {
            return [$resultCount[0]['cnt'] ?? 0, $whereSQL, $whereBinds];
        } else {
            return $resultCount[0]['cnt'] ?? 0;
        }
    }

    public function download($id = null, string $type = 'csv')
    {
        list($total, $whereSql, $whereBinds) = $this->getCount($id, true);

        $headers = [];
        foreach ($this->model as $index => $mdl) {
            if (!empty($mdl['label']) && (empty($mdl['hidden']) || !empty($mdl['download']))) {
                $headers[$mdl['name']] = $mdl['label'];
            }
        }
        $items = [];
        if ($total > 0) {
            if (!empty($_REQUEST['sord'])) {
                $sortDist = $_REQUEST['sord'] == 'desc' ? 'DESC' : $this->defaultSort; //сортировка
                $sortField = !empty($_REQUEST['sidx']) ? (string) $_REQUEST['sidx'] : $this->defaultField;
            } else {
                $sortDist = $this->defaultSort;
                $sortField = $this->model[0]['name'];
            }
            $orderSQL = " ORDER BY \"$sortField\" $sortDist";

            $query = "select \"".implode('","', array_keys($headers))."\" from \"{$this->table}\" ".$whereSql.$orderSQL;
            $items = db::sql_select($query, $whereBinds);
        }
        array_unshift($items, $headers);
        switch ($type) {
            case 'csv':
                $fileName = 'export-'.date('Y-m-d\TH:i:s').'.csv';
                header("Expires: 0");
                header('Charset=UTF-8;');
                header('Content-Disposition: attachment;filename='.$fileName.';');
                header("Content-Transfer-Encoding: binary ");
                $out = fopen('php://output', 'w');
                foreach ($items as &$it) {
                    fputcsv($out, $it, ';');
                }
                fclose($out);
                exit();

                break;
            case 'xlsx':
                $fileName = 'export-'.date('Y-m-d\TH:i:s').'.xlsx';
                $spreadsheet = new Spreadsheet();
                $spreadsheet->getActiveSheet()->getDefaultColumnDimension()->setWidth(25);
                $spreadsheet->getActiveSheet()->fromArray($items);
                $spreadsheet->getActiveSheet()->setAutoFilter($spreadsheet->getActiveSheet()->calculateWorksheetDimension()); //добавим фильтры
                foreach ($spreadsheet->getActiveSheet()->getColumnDimensions() as &$columnDimension) {
                    $columnDimension->setAutoSize(true);
                }
                $writer = new Xlsx($spreadsheet);
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment;filename="'.$fileName.'"');
                header('Cache-Control: max-age=0');
                $writer->save('php://output');
                exit();
                break;
            case 'pdf':


                break;
            default:
                break;
        }
    }
    /*
     * $actionType принимает значения del/upd/add
     * $id идентификатор затрагиваемой записи
     * $data обновленные данные
     */

    protected function callbackChange(string $actionType, int $id, array $data = [])
    {
        
    }

    protected function callbackPreChange(string $actionType, int $id, array $data = [])
    {
        return [true,'Текст ошибки']; //успешно, можно обновлять
    }

    //функция провери и приведения типов
    protected function modifyTypesToBd(array $data = [])
    {

        //соберем данные из запроса внешнего по модели
        $resultData = [];
        foreach ($this->model as $model) {
            if (array_key_exists($model['name'], $data)) {
                if (array_key_exists('template', $model)) {
                    switch ($model['template']) {
                        case 'booleanCheckbox':
                            $resultData[$model['name']] = $data[$model['name']] === 'true' ? 1 : 0;
                            break;
                        default:
                            $resultData[$model['name']] = $data[$model['name']];
                    }
                } else {
                    $resultData[$model['name']] = $data[$model['name']];
                }
            }
        }
        //теперь перепроверим по бд
        $tableFields = db::get_columns($this->table);
        foreach ($resultData as $key => &$field) {
            if (isset($tableFields[$key])) {

                switch ($tableFields[$key]['type']) {
                    case 'date':
                        //обновим формат даты
                        $field = preg_replace('|(\d{2})\.(\d{2})\.(\d{4})|', '$3-$2-$1', $field);
                        if ($field == '') {
                            $field = null;
                        }
                        break;
                    case 'numeric':
                        $field = (int) $field;
                        break;
                }
            } elseif ($genException) {
                unset($resultData[$key]);
            }
        }
        return $resultData;
    }

    //функция отправки ошибки в таблицу
    protected function sendError(int $code, array $data = [])
    {
        if (array_key_exists($code, $this->errorsMap)) {
            $message = $this->errorsMap[$code];
        } else {
            $message = 'Техническая ошибка';
        }
        if ($code == 4) {
            header('HTTP/1.0 401 Not Access');
        } else {
            header('HTTP/1.0 403 Forbidden');
        }
        //['error'=>1,'errorCode'=>$code,'errorMessage'=>$message,'data'=>$data]
        return [
            'text' => $message,
            'logData' => [
                'error' => 1,
                'errorCode' => $code,
                'errorMessage' => $message,
                'data' => $data]];
    }

    //функция отправки успеха в таблицу
    protected function sendOk($data = [])
    {
        return $data;
    }

    public function checkAccess(array $aclArr = [1, 2, 3]): bool
    {
        if (empty($aclArr)) {
            $aclArr = $this->defaultAcl;
        }
        if (!empty($this->client)) {
            if (empty($this->client['ACL']) || !in_array($this->client['ACL'], $aclArr)) {
                return false;
            }
        } else {
            if (empty($_SERVER['HTTP_SYSTEM']) || !array_key_exists($_SERVER['HTTP_SYSTEM'], $this->config->get('systemAllow', []))) {
                return false;
            }

            if (empty($_SERVER['HTTP_SYSTEMTOKEN']) || $_SERVER['HTTP_SYSTEMTOKEN'] != $this->config->get('systemAllow', [])[$_SERVER['HTTP_SYSTEM']]) {
                return false;
            }
            if (!empty($methods) && !in_array($this->action, $this->config->get("rules/{$_SERVER['HTTP_SYSTEM']}", []))) {
                return false;
            }
        }

        return true;
    }
}