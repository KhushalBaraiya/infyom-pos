<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * Class BaseUnit
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit query()
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit whereUpdatedAt($value)
 *
 * @property int $is_default
 *
 * @method static \Illuminate\Database\Eloquent\Builder|BaseUnit whereIsDefault($value)
 *
 * @mixin \Eloquent
 */
class BaseUnit extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'base_units';

    protected $fillable = [
        'tenant_id',
        'name'
    ];

    public static function rules()
    {
        return [
            'name' => 'required|unique:base_units,name,NULL,id,tenant_id,' . Auth::user()->tenant_id,
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('base-units.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $fields = ['name' => $this->name];

        return $fields;
    }
}
