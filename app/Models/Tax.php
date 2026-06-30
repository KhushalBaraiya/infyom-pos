<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Tax extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, Multitenantable, BelongsToTenant;

    protected $table = 'taxes';

    const JSON_API_TYPE = 'taxes';

    protected $fillable = [
        'name',
        'number',
        'status',
    ];

    public static $rules = [
        'name' => 'required',
        'number' => 'required',
    ];

    public function prepareLinks(): array
    {
        return [
            // 'self' => route('products.show', $this->id),
        ];
    }


    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'number' => $this->number,
            'status' => $this->status,
        ];
    }
}
