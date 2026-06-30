<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerWallet extends Model
{
    use HasFactory, HasJsonResourcefulData;

    protected $fillable = [
        'customer_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'double',
    ];

    public function prepareLinks(): array
    {
        return [
            // 'self' => 
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'amount' => $this->amount,
            'balance' => $this->balance,
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id')->withoutGlobalScope('tenant');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CustomerWalletTransaction::class, 'wallet_id');
    }

    public function getBalanceAttribute(): float
    {
        return $this->amount ?? 0;
    }
}
