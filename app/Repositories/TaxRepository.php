<?php

namespace App\Repositories;

use App\Models\Tax;

/**
 * Class TaxRepository
 */
class TaxRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'number',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'name',
        'number',
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
        return Tax::class;
    }
}
