<?php

namespace App\Service\Database;

use PDO;

/**
 * Класс доступа к Postgre
 * аналогичного PDO Statement класса db_oracle_oci_statement_to_pdo
 *
 * author Сорокин
 */

class db_access_pgsql extends db_access
{

    function __destruct()
    {
        if ($this->dbh) $this->dbh = null;
    }

    /**
     * Базонезависимая конкатенация произвольного количества полей для postgre
     *
     * @see db_access::concat_clause()
     */
    public function concat_clause($fields, $delimiter)
    {
        if (count($fields) > 1) {
            return implode(' || \''.$delimiter.'\' ||', $fields);
        } else return $fields[0];
    }

    protected function execute_query($query, $fields, $special)
    {
        if (strpos($query, '"') === false) {
            $query = preg_replace('/\s+/', ' ', $query);
            $query = trim($query);
            $queryParts = explode(' ', $query);
//            var_dump($queryParts);

            foreach ($queryParts as &$part) {
                if ($part === ' ' || $part === '') continue;
                $needend = false;
                if (preg_match('/\,$/', $part)) {
                    $part = substr($part, 0, -1);
                    $needend = true;
                }
                if (strpos($part, '.') !== false) {

                    //проверим точку и закончим
                    $subpart = explode('.', $part);
                    $newsb = array();

                    foreach ($subpart as $sb) {
                        if (strpos($sb, '=') === false) {
                            if (preg_match('/^([0-9\:\'\(\*])(.*)/', $sb, $out)) {
                                if ($out[1] == '(') {
                                    $newsb[] = "(\"$out[2]\"";
                                } else {
                                    $newsb[] = $sb;
                                }
                            } elseif (preg_match('/([^\)]+)\)$/', $sb, $out)) {
                                $newsb[] = "\"$out[1]\")";
                            } else {
                                $newsb[] = "\"$sb\"";
                            }
                        } else {
                            $ss = explode('=', $sb);
                            $newss = array();
                            foreach ($ss as $sss) {
                                if (!preg_match('/^[0-9\:\']/', $sss)) {
                                    $newss[] = "\"$sss\"";
                                } else {
                                    $newss[] = $sss;
                                }
                            }
                            $newsb[] = implode('=', $newss);
                        }
                    }

                    $part = implode('.', $newsb);
                    if ($needend) {
                        $part .= ',';
                    }
                    continue;
                }

                if (strpos($part, ',') === false) {
                    $part = trim($part);
                    if (strpos($part, '=') === false) {
                        if (!empty($part) && !preg_match('/[\'\(\:0-9\)]/', $part) && !in_array(mb_strtoupper($part), array(
                                'SELECT',
                                'NULL',
                                'DISTINCT',
                                'CASE',
                                'IS',
                                'INNER',
                                'THEN',
                                'WHEN',
                                'END',
                                'ELSE',
                                'IN',
                                'DELETE',
                                'UPDATE',
                                'AS',
                                'CREATE',
                                '*',
                                'AND',
                                'INSERT',
                                'INTO',
                                'SET',
                                'VALUES',
                                'ON',
                                'FROM',
                                'DESC',
                                'ASC',
                                'ORDER',
                                'BY',
                                'WHERE',
                                'JOIN',
                                'LEFT',
                                'RIGHT',
                                'ON',
                                'CASE',
                                'GROUP',
                                'LIMIT',
                                'SHOW',
                                'TABLE',
                                'COLUMN',
                                'INDEX'))) {
                            $part = "\"$part\"";
                        }
                    } else {
                        $part = preg_replace('/([a-z_0-9]+)=/i', '"$1"=', $part);
                    }
                } else {
                    if (strpos($part, '=') === false) {
                        $ss = explode(',', $part);
                        foreach ($ss as &$sss) {
                            if (!preg_match('/^[0-9\:\']/', $sss)) {
                                $sss = "\"$sss\"";
                            }
                        }
                        $part = implode(',', $ss);
//                        $part = preg_replace('/([a-z_0-9]+)/i','"$1"$2',$part);
                    } else {
                        $part = preg_replace('/([a-z_0-9]+)(=)/i', '"$1"$2', $part);
                    }
                    //обработать запятые
                }
                if ($needend) {
                    $part .= ',';
                }
            }
            $query = implode(' ', $queryParts);
        }
//       var_dump($query,'<br/><br/>');
        return parent::execute_query($query, $fields, $special);
    }

    public function insert_record($table, $fields = array(), $special = array())
    {
        $columns = array();
        $values = array();
        foreach ($fields as $key => $value) {
            $columns[] = $key;
            $specialValue = $special[$key] ?? null;
            if ($specialValue == 'pure') $values[] = $value;
            else $values[] = $this->set_parameter_colon($key);
        }
        $sth = $this->execute_query('INSERT INTO "'.$table.'" ("'.implode('","', $columns).'") VALUES ('.implode(',', $values).')', $fields, $special);
        return;
    }

    public function get_insert_id($table, $fieldId)
    {
        $sequence_name = "{$table}_{$fieldId}_seq";
        return $this->last_insert_id($sequence_name);
    }

    public function last_insert_id($sequence_name)
    {
        $pos = strpos($sequence_name, '_SEQ');
        if ($pos !== false) {
            $query = "SELECT last_value FROM \"pg_sequences\" where sequencename like '".str_replace('_SEQ', '_%_seq', $sequence_name)."'";
        } else {
            $query = "SELECT last_value FROM \"{$sequence_name}\"";
        }
        try {
            $sth = $this->execute_query($query, array(), array());
        } catch (\Exception $e) {
            throw $e;
        }
        $result = $sth->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($result[0]['last_value'])) {
            $result = $result[0]['last_value'];
        } else {
            $result = 0;
        }
        return $result;
    }

    /**
     * Изменение записи или записей в таблице с ограничением по значениям некоторых полей
     *
     * $table, $fields, $special такие же как у {@link db_access::insert_record()}
     *
     * @param array $where		перечень полей для кляузы WHERE БЕЗ двоеточия: array("TABLE_ID"=>"value1","LANG_ID"=>"value2")
     */
    public function update_record($table, $fields = array(), $special = array(), $where = array())
    {
        if (!$fields || !$where) return;


        foreach ($fields as $key => $value) {
            if (!empty($special[$key]) && $special[$key] == 'pure') $pairs[] = '"'.$key.'"='.$value;
            else $pairs[] = '"'.$key.'"='.$this->set_parameter_colon($key);
        }
        $pairs = implode(',', $pairs);

        foreach ($where as $key => $value) {
            $ands[] = '"'.$key.'"=:ands_'.$key;
            $fields['ands_'.$key] = $value;
        }
        $ands = implode(' AND ', $ands);

        $sth = $this->execute_query('UPDATE "'.$table.'" SET '.$pairs.' WHERE '.$ands, $fields, $special);
        return $sth->rowCount();
    }

    /**
     * Удаление записи или записей из таблицы с ограничением по значениям некоторых полей
     *
     * $table, $where такие же как у {@link db_access::update_record()}
     */
    public function delete_record($table, $where = array())
    {
        if (!is_array($where) || !count($where)) return 0;

        foreach ($where as $key => $value) {
            $ands[] = "\"{$key}\"=:ands_{$key}";
            $fields["ands_".$key] = $value;
        }
        $ands = implode(' AND ', $ands);

        $query = "DELETE FROM \"{$table}\" WHERE {$ands}";
        $sth = $this->execute_query($query, $fields, array());
        return $sth->rowCount();
    }

    public function get_columns($tableName)
    {
        $query ="SELECT column_name, udt_name, is_nullable FROM information_schema.\"columns\" WHERE CAST(\"table_name\" AS text) = '$tableName'";
        $sth = $this->execute_query($query, $fields, array());
        $fields = $sth->fetchAll(PDO::FETCH_ASSOC);
        $result = array();
        if (!empty($fields)) {
            foreach ($fields as $field) {
                $result[$field['column_name']] = array('type'=>$field['udt_name'],'required'=>$field['is_nullable']=='YES'?false:true);
            }
        }

        return $result;
    }



}