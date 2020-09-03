<?php


namespace App\Service\Base;

/**
 * Class GenericDAO
 * @package Itb\Mpgu\DBObject
 */
abstract class GenericDAO extends Singleton
{
    private $identityMap = array();
    protected $map = array();
    protected $tablePrefix = '';

    protected $fields = [];

    /**
     * GenericDAO constructor.
     *
     * @param string $tablePrefix
     */
    public function __construct($tablePrefix = '')
    {
        $this->tablePrefix = $tablePrefix;
    }

    /**
     * @param       $id
     * @param array $fields
     *
     * @return mixed
     */
    public function getById($id, array $fields = [])
    {
        return $this->getByField($this->getPrimaryKey(), $id, $fields);
    }

    /**
     * @param       $field
     * @param       $value
     * @param array $fields
     *
     * @return mixed
     */
    public function getByField($field, $value, array $fields = [])
    {
        if (empty($fields)) {
            $fields = Field::gets($this->getMapping());
        }

        return QueryBuilder::create($this)
            ->select($fields)
            ->from($this->getTable())
            ->where(Expression::eq($field, $value))
            ->get();
    }

    /**
     * @return string
     */
    public function getTablePrefix()
    {
        return $this->tablePrefix;
    }


    /**
     * @param string $tablePrefix
     *
     * @return GenericDAO
     */
    public function setTablePrefix($tablePrefix)
    {
        $this->tablePrefix = $tablePrefix;

        return $this;
    }


    /**
     * @return string
     */
    abstract public function getTable();

    /**
     * @return string
     */
    abstract public function getPrimaryKey();

    public function take()
    {

    }

    public function merge()
    {

    }

    public function delete()
    {

    }

    /**
     * @return array
     */
    public function getIdentityMap()
    {
        return $this->identityMap;
    }

    /**
     * @param array $identityMap
     *
     * @return GenericDAO
     */
    public function setIdentityMap($identityMap)
    {
        $this->identityMap = $identityMap;

        return $this;
    }

    /**
     * @param $key
     * @param $value
     *
     * @return GenericDAO
     */
    public function addToIdentityMap($key, $value)
    {
        $this->identityMap[$key] = $value;

        return $this;
    }

    /**
     * @param $key
     *
     * @return mixed|null
     */
    public function getFromIdentityMap($key)
    {
        return isset($this->identityMap[$key]) ?: null;
    }

    /**
     * @param array $params
     *
     * @return array
     */
    public function makeQuery($params = array())
    {
        $sql = 'SELECT ' . join(', ', array_keys($this->getMapping())) . ' FROM ' . $this->getTable();
        if ($params && count($params) > 0) {
            $sql .= ' WHERE ';
            $criteria = array();
            foreach ($params as $key => $value) {
                $criteria[] = $key . '=:' . $key;
            }
            $sql .= join(' AND ', $criteria);
        }

        $returnValue = [];

        $result = \db::sql_select($sql, $params);

        if (!empty($result[0])) {
            $returnValue = $result[0];
        }

        return $returnValue;
    }

    /**
     * @return GenericDAO
     */
    public function dropIdentityMap()
    {
        $this->identityMap = array();

        return $this;
    }


    /**
     * @param $data
     * @param null $prefix
     *
     * @return GenericDAO
     */
    public function makeObjectFromData($data, $prefix = null)
    {
        $this->makeObject($data, $prefix);

        foreach ($this->getMapping() as $key => $value) {
            $name = strtolower($key);
            $nameArray = explode('_', $name);
            if (!empty($nameArray)) {
                $methodSuffix = join(array_map(function ($k) {
                    return ucfirst($k);
                }, $nameArray));

                $setter = 'set' . $methodSuffix;
                $identityMap = $this->getIdentityMap();

                if (isset($data[$this->getPrimaryKey()])
                    && array_key_exists($key, $identityMap[$this->getPrimaryKey() . ':' . $data[$this->getPrimaryKey()]])
                ) {
                    if (method_exists($this, $setter)) {
                        $this->$setter($identityMap[$this->getPrimaryKey() . ':' . $data[$this->getPrimaryKey()]][$key]);
                    } else {
                        $this->{$key} = $identityMap[$this->getPrimaryKey() . ':' . $data[$this->getPrimaryKey()]][$key];
                    }
                }
            }
        }

        return $this;
    }

    /**
     * @param \Itb\Mpgu\DBObject\AbstractProtoClass $proto
     */
    public function makeObjectByProto($proto, $data, $prefix = null)
    {
        $this->makeProtoObject($data, $prefix);

        foreach ($proto->getPropertyList() as $key => $value) {
            $name = strtolower($key);
            $setter = 'set' . $this->camelCase($name, true);
            $identityMap = $this->getIdentityMap();
            $keyAliased = $proto->getAliasedPropertyByName($key);

            if (isset($data[$this->getPrimaryKey()])
                && array_key_exists($keyAliased, $identityMap[$this->getPrimaryKey() . ':' . $data[$this->getPrimaryKey()]])
            ) {
                if (method_exists($proto, $setter)) {
                    $proto->$setter($identityMap[$this->getPrimaryKey() . ':' . $data[$this->getPrimaryKey()]][$keyAliased]);
                } else {
                    $proto->{$key} = $identityMap[$this->getPrimaryKey() . ':' . $data[$this->getPrimaryKey()]][$keyAliased];
                }
            }
        }

        return $proto;
    }

    protected function camelCase($value, $capitalize = true)
    {
        $result = str_replace(' ', '', ucwords(strtolower(str_replace(array('-', '_'), ' ', $value))));

        if ($capitalize) $result = ucfirst($result);

        return $result;
    }

    /**
     * @return string
     */
    protected function getIdentityMapPrimaryKey()
    {

        return '';
    }

    /**
     * @param $array
     * @param null $prefix
     *
     * @return mixed
     */
    public function makeObject($array, $prefix = null)
    {
        $idName = $prefix . $this->getPrimaryKey();

        if (isset($this->identityMap[$idName]) && (isset($array[$idName]))) {
            return $this->identityMap[$idName . ':' . $array[$idName]];
        }

        if (isset($array[$idName])) {
            return $this->identityMap[$idName . ':' . $array[$idName]] = $array;
        }

        return $this->identityMap[$idName] = $array;
    }

    /**
     * @param $array
     * @param null $prefix
     *
     * @return mixed
     */
    public function makeProtoObject(&$array, $prefix = null)
    {
        if (!method_exists($this, "getProto")) {
            return array();
        }

        $idName = $prefix . $this->getPrimaryKey();
        $proto = $this->getProto();

        foreach ($array as $key => $value) {
            if (strpos($key, ".") === false) {
                $newKey = $proto->getAliasedPropertyByName($key);
                $array[$newKey] = $value;
                unset($array[$key]);
            }
        }

        if (isset($this->identityMap[$idName]) && (isset($array[$idName]))) {
            return $this->identityMap[$idName . ':' . $array[$idName]];
        }

        if (isset($array[$idName])) {
            return $this->identityMap[$idName . ':' . $array[$idName]] = $array;
        }

        return $this->identityMap[$idName] = $array;
    }

    /**
     * @return array
     */
    public function getMapping()
    {
        return is_array($this->map) ? $this->map : array();
    }

    /**
     * @param $name
     *
     * @return mixed
     * @throws \Exception
     */
    public function __get($name)
    {
        if (array_key_exists($name, $this->fields)) {
            return $this->fields[$name];
        }

        throw new \Exception('Key not found: ' . $name);
    }

    /**
     * @param $name
     * @param $value
     */
    public function __set($name, $value)
    {
        $this->fields[$name] = $value;
    }

    /**
     * @param $name
     *
     * @return mixed
     */
    public function getFiled($name)
    {
        return $this->getField($name);
    }

    /**
     * @return array
     */
    public function getFileds()
    {
        return $this->getFields();
    }

    /**
     * @param $name
     *
     * @return mixed
     */
    public function getField($name)
    {
        return $this->{$name};
    }

    /**
     * @return array
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * @param $name
     *
     * @return bool
     */
    public function hasField($name)
    {
        try {
            return (bool)$this->getFiled($name);
        } catch (\Exception $e) {
            return false;
        }
    }
}
