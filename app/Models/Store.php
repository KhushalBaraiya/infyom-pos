<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class Store extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    const JSON_API_TYPE = 'stores';

    protected $table = 'stores';

    protected $fillable = [
        'name',
        'tenant_id',
        'status',
        'is_default',
    ];

    public static function rules(): array
    {
        return [
            'name' => 'required',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('stores.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'tenant_id' => $this->tenant_id,
            'status' => (int)$this->status,
            'is_default' => (bool)$this->is_default,
            'users' => UserStore::where('store_id', $this->id)->count(),
            'active' => Auth::user()->tenant_id === $this->tenant_id,
        ];
    }
}
