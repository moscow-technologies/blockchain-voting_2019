<?php

namespace App\Service\Logging;


use Monolog\Formatter\LineFormatter;

class MultilineFormatter extends LineFormatter
{
    /**
     * @param  mixed  $data В случае массива применяется обычный implode вместо json_encode
     * @return string
     */
    protected function convertToString($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key=>$val) {
                $result[] = $key .': '. $this->convertToString($val);
            }
            return implode("\n", $result);
        } else {
            return parent::convertToString($data);
        }
    }

}