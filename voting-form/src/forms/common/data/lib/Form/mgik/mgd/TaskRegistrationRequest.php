<?php

namespace Itb\Mpgu\Form\mgik\mgd;

/**
 * Запрос регистрации на выборы
 */
class TaskRegistrationRequest extends TaskRequest
{
    /**
     * @return string
     */
    public function queueName()
    {
        return $this->config['queue']['registration'];
    }

    /**
     * @return array
     */
    public function asArray()
    {
        $result = [];
        $result['message_type'] = '1';
        $result['person_data'] = [
            'birth_dt' => $this->formatAsDate($this->fields['declarant.birthdate'] ?? ''),
            'last_name' => $this->fields['declarant.lastname'] ?? '',
            'given_name_one' => $this->fields['declarant.firstname'] ?? '',
            'given_name_two' => $this->fields['declarant.middlename'] ?? '',
            'gender_tp_code' => $this->fields['declarant.gendercode'] ?? '',
            'SSO' => $this->client['SUDIR_ID'] ?? '',
            'is_confirmed_offline' => true,
            'mp_phone_mobile' => $this->formatAsNumber($this->fields['declarant.mobilephone'] ?? ''),
        ];

        if ($this->hasPassport()) {
            $result['person_data']['reg_address'] = [
                'addr_line_one' => $this->fields['declarant.address1_postofficebox'] . ' Квартира ' . $this->fields['declarant.address1_line3'],
                'unom' => $this->fields['declarant.address1_unom'] ?? '',
                'residence_num' => $this->fields['declarant.address1_line3'] ?? ''
            ];
        }

        if ($this->hasPassport()) {
            $result['person_data']['documents'][] = [
                'id_tp_cd' => '1000016',
                'identification_series' => $this->formatAsPassportSerial($this->fields['declarant.serial_number'] ?? ''),
                'ref_num' => $this->formatAsPassportNumber($this->fields['declarant.serial_number'] ?? ''),
                'start_dt' => $this->formatAsDate($this->fields['declarant.new_passport_date2'] ?? ''),
                'identification_issuer' => $this->fields['declarant.new_passport_place2'] ?? '',
                'identification_issuer_code' => $this->formatAsNumber($this->fields['declarant.new_divisioncode2'] ?? ''),
                'identification_passport_birth_place' => $this->fields['declarant.new_birthplace'] ?? '',
            ];
        }

        $result['person_data']['documents'][] = [
            'id_tp_cd' => '2000000',
            'ref_num' => $this->app['REG_NUM'] ?? '',
            'start_dt' => $this->formatAsDate($this->app['APP_DATE'] ?? '', 'YmdHis'),
        ];

        $result['person_data']['documents'][] = [
            'id_tp_cd' => '1000015',
            'ref_num' => $this->formatAsNumber($this->fields['declarant.new_snils'] ?? ''),

        ];

        return $result;
    }

    private function hasPassport()
    {
        $serialNumber = $this->fields['declarant.serial_number'] ?? false;

        return (bool) $serialNumber;
    }
}