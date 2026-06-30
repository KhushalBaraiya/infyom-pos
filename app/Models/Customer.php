<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * App\Models\Customer
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $phone
 * @property string $country
 * @property string $city
 * @property string $address
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer query()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereUpdatedAt($value)
 *
 * @property string|null $dob
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Quotation[] $quotations
 * @property-read int|null $quotations_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Sale[] $sales
 * @property-read int|null $sales_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\SaleReturn[] $salesReturns
 * @property-read int|null $sales_returns_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Customer whereDob($value)
 *
 * @mixin \Eloquent
 */
class Customer extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'customers';

    const JSON_API_TYPE = 'customers';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'name',
        'email',
        'phone',
        'country',
        'city',
        'address',
        'dob',
    ];

    public static function rules(): array
    {
        return [
            'name' => 'required',
            'email' => 'required|email|unique:customers,email,NULL,id,tenant_id,' . Auth::user()->tenant_id,
            'phone' => 'required|string|max:20',
            'country' => 'required',
            'city' => 'required',
            'address' => 'required',
            'dob' => 'nullable|date',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('customers.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $fields = [
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'country' => $this->country,
            'city' => $this->city,
            'address' => $this->address,
            'dob' => $this->dob,
            'created_at' => $this->created_at,
            'is_user' => $this->user_id != null,
            'wallet_amount' => $this->wallet ? $this->wallet->amount : 0,
        ];

        return $fields;
    }

    public function prepareCustomers(): array
    {
        $fields = [
            'id' => $this->id,
            'name' => $this->name,
        ];

        return $fields;
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'customer_id', 'id');
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class, 'customer_id', 'id');
    }

    public function salesReturns(): HasMany
    {
        return $this->hasMany(SaleReturn::class, 'customer_id', 'id');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(CustomerWallet::class, 'customer_id', 'id');
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }
}
