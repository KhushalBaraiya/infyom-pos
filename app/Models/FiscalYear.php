<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FiscalYear extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'fiscal_year';

    public const JSON_API_TYPE = 'fiscal_year';

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_active',
        'is_completed',
    ];

    public static $rules = [
        'name' => 'required|unique:fiscal_year,name|string|max:255',
        'start_date' => 'date|required',
        'end_date' => 'date|required',
        'is_active' => 'boolean',
        'is_completed' => 'boolean',
    ];

    public $casts = [
        'name' => 'string',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'is_completed' => 'boolean',
    ];

    public function prepareLinks(): array
    {
        return [];
    }

    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'is_active' => $this->is_active,
            'is_completed' => $this->is_completed,
        ];
    }
}
