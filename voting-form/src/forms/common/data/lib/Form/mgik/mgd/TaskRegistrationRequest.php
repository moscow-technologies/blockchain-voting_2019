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
            'birth_dt' => $this->formatAsDate($this->field('declarant.birthdate')),
            'last_name' => $this->field('declarant.lastname'),
            'given_name_one' => $this->field('declarant.firstname'),
            'given_name_two' => $this->field('declarant.middlename'),
            'gender_tp_code' => $this->field('declarant.gendercode'),
            'SSO' => $this->client['SUDIR_ID'] ?? null,
            'is_confirmed_offline' => true,
            'mp_phone_mobile' => $this->formatAsNumber($this->field('declarant.mobilephone')),
        ];

        if ($this->hasPassport()) {
            $address = $this->field('declarant.address1_postofficebox', '');
            $flat = $this->field('declarant.address1_line3', '');

            $result['person_data']['reg_address'] = [
                'addr_line_one' => "$address Квартира $flat",
                'unom' => $this->field('declarant.address1_unom'),
                'residence_num' => $this->field('declarant.address1_line3'),
                'confirmed_mfc' => $this->hasConfirmedMfc(),
            ];
        }

        if ($this->hasPassport()) {
            $result['person_data']['documents'][] = [
                'id_tp_cd' => '1000016',
                'identification_series' => $this->formatAsPassportSerial($this->field('declarant.serial_number')),
                'ref_num' => $this->formatAsPassportNumber($this->field('declarant.serial_number')),
                'start_dt' => $this->formatAsDate($this->field('declarant.new_passport_date2')),
                'identification_issuer' => $this->field('declarant.new_passport_place2'),
                'identification_issuer_code' => $this->formatAsNumber($this->field('declarant.new_divisioncode2')),
                'identification_passport_birth_place' => $this->field('declarant.new_birthplace'),
            ];
        }

        $result['person_data']['documents'][] = [
            'id_tp_cd' => '2000000',
            'ref_num' => $this->app['REG_NUM'] ?? null,
            'start_dt' => $this->formatAsDate($this->app['APP_DATE'] ?? '', 'YmdHis'),
        ];

        $result['person_data']['documents'][] = [
            'id_tp_cd' => '1000015',
            'ref_num' => $this->formatAsNumber($this->field('declarant.new_snils')),

        ];

        return $result;
    }

    /**
     * @return bool
     */
    private function hasPassport()
    {
        $serialNumber = $this->fields['declarant.serial_number'] ?? false;

        return (bool) $serialNumber;
    }

    /**
     * @return bool
     */
    private function hasConfirmedMfc()
    {
        if (! $this->isAddressWasChanged() && ($this->isConfirmedMfc() || $this->isConfirmedHpsm())) {
            return true;
        }

        return false;
    }

    /**
     * @return bool
     */
    private function isConfirmedMfc()
    {
        $confirmedMfc = $this->profile['REG_ADDRESS']['CONFIRMED_MFC'] ?? null;

        return $confirmedMfc === 'true';
    }

    /**
     * @return bool
     */
    private function isConfirmedHpsm()
    {
        $district = $this->profile['REG_ADDRESS']['DISTRICTID'] ?? null;
        $validationDate = $this->profile['REG_ADDRESS']['VALIDATION_DATE'] ?? null;
        $validationStatus = $this->profile['REG_ADDRESS']['VALIDATION_STATUS'] ?? null;

        if ($district && $validationDate && $validationStatus === '1') {
            return true;
        }

        return false;
    }

    /**
     * @return bool
     */
    private function isAddressWasChanged()
    {
        $formUnad = $this->field('declarant.address1_unad');
        $formUnom = $this->field('declarant.address1_unom');
        $formFlat = $this->field('declarant.address1_line3');

        $elkUnad = $this->profile['REG_ADDRESS']['UNAD'] ?? null;
        $elkUnom = $this->profile['REG_ADDRESS']['UNOM'] ?? null;
        $elkFlat = $this->profile['REG_ADDRESS']['FLAT'] ?? null;

        if ($formUnad) {
            if ($formUnad != $elkUnad || $formUnom != $elkUnom || $formFlat != $elkFlat) {
                return true;
            }
        } else {
            if ($formUnom != $elkUnom || $formFlat != $elkFlat) {
                return true;
            }
        }

        return false;
    }
}