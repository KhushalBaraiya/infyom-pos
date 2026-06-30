<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class CustomerWalletTransaction extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasJsonResourcefulData;

    public const ATTACHMENT = 'wallet_transaction';

    const TRANSACTION_TYPE_ADD_AMOUNT = 1;
    const TRANSACTION_TYPE_PURCHASE = 2;
    const TRANSACTION_TYPE_REFUND = 3;
    const TRANSACTION_TYPE_ADMIN_ADJUSTMENT = 4;

    const DIRECTION_DEBIT = 1;  // minus
    const DIRECTION_CREDIT = 2; // plus

    const STATUS_PENDING = 0;
    const STATUS_APPROVED = 1;
    const STATUS_REJECTED = 2;

    protected $fillable = [
        'wallet_id',
        'direction',
        'payment_method_id',
        'amount',
        'transaction_type',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'double',
        'direction' => 'integer',
        'transaction_type' => 'integer',
        'status' => 'integer',
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
            'wallet_id' => $this->wallet_id,
            'wallet' => $this->wallet->prepareAttributes(),
            'customer' => $this->wallet->customer->prepareAttributes(),
            'direction' => $this->direction,
            'direction_label' => $this->direction_label,
            'amount' => $this->amount,
            'transaction_type_label' => $this->transaction_type_label,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'notes' => $this->notes,
            'attachment' => $this->attachment,
            'created_at' => $this->created_at,
        ];
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(CustomerWallet::class, 'wallet_id');
    }

    public function getTransactionTypeLabelAttribute(): string
    {
        return match ($this->transaction_type) {
            self::TRANSACTION_TYPE_ADD_AMOUNT => 'Add Amount Request',
            self::TRANSACTION_TYPE_PURCHASE => 'Purchase',
            self::TRANSACTION_TYPE_REFUND => 'Refund',
            self::TRANSACTION_TYPE_ADMIN_ADJUSTMENT => 'Admin Adjustment',
            default => 'Unknown',
        };
    }

    public static function transactionTypeMap(): array
    {
        return [
            self::TRANSACTION_TYPE_ADD_AMOUNT => 'add amount',
            self::TRANSACTION_TYPE_PURCHASE => 'purchase',
            self::TRANSACTION_TYPE_REFUND => 'refund',
            self::TRANSACTION_TYPE_ADMIN_ADJUSTMENT => 'admin adjustment',
        ];
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_REJECTED => 'Rejected',
            default => 'Unknown',
        };
    }

    public function getDirectionLabelAttribute(): string
    {
        return $this->direction === self::DIRECTION_CREDIT ? 'Credit' : 'Debit';
    }

    public function getAttachmentAttribute()
    {
        return $this->getFirstMediaUrl(self::ATTACHMENT) ?? null;
    }
}
