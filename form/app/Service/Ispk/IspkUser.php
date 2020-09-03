<?php

namespace App\Service\Ispk;

use InvalidArgumentException;
use stdClass;

class IspkUser
{
    /** @var int */
    protected $pguUserId = 0;

    /** @var string */
    protected $ssoid = '';

    /** @var string */
    protected $email = '';

    /** @var string */
    protected $surname = '';

    /** @var string */
    protected $name = '';

    /** @var string */
    protected $patronymic = '';

    /**
     * @param stdClass $attributes
     */
    public function __construct(stdClass $attributes=null)
    {
        if (!empty($attributes->ssoid)) {
            $this->ssoid = $attributes->ssoid;
        } else {
            throw new InvalidArgumentException('Не передан ssoid');
        }

        if (!empty($attributes->email)) {
            $this->email = $attributes->email;
        } else {
            throw new InvalidArgumentException('Не передан email');
        }

        if (!empty($attributes->surname)) {
            $this->surname = $attributes->surname;
        } else {
            throw new InvalidArgumentException('Не передан surname');
        }

        if (!empty($attributes->name)) {
            $this->name = $attributes->name;
        } else {
            throw new InvalidArgumentException('Не передан name');
        }

        if (property_exists($attributes, 'patronymic')) {
            $this->patronymic = $attributes->patronymic;
        } else {
            throw new InvalidArgumentException('Не передан patronymic');
        }
    }

    /**
     * @return int
     */
    public function getPguUserId()
    {
        return $this->pguUserId;
    }

    /**
     * @return string
     */
    public function getSsoid()
    {
        return $this->ssoid;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @return string
     */
    public function getSurname()
    {
        return $this->surname;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getPatronymic()
    {
        return $this->patronymic;
    }

    /**
     * @return string
     */
    public function getNamePatronymic()
    {
        $returnValue = $this->getName();
        $pName = $this->getPatronymic();

        if (!empty($pName)) {
            $returnValue.= ' '. $pName;
        }

        return $returnValue;
    }
}