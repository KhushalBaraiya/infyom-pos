<?php

namespace App\Repositories;

use App\Models\PaymentMethod;

/**
 * Class PaymentMethodRepository
 */
class PaymentMethodRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'name',
        'status',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model(): string
    {
        return PaymentMethod::class;
    }
}
