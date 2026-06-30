<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentMethod extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'payment_methods';

    const JSON_API_TYPE = 'payment-methods';

    protected $fillable = [
        'name',
        'status',
        'type',
    ];

    const CUSTOMER_WALLET = 1;

    public static function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:payment_methods,name',
            'status' => 'sometimes|boolean',
        ];
    }

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
            'status' => $this->status,
            'type' => $this->type ?? 0,
        ];
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'payment_type', 'id');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'payment_type', 'id');
    }

    public function salesReturn()
    {
        return $this->hasMany(SaleReturn::class, 'payment_type', 'id');
    }

    public function purchasesReturn()
    {
        return $this->hasMany(PurchaseReturn::class, 'payment_type', 'id');
    }

    public function salesPayments()
    {
        return $this->hasMany(SalesPayment::class, 'payment_type', 'id');
    }
}
