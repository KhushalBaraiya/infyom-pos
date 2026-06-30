<?php

namespace App\Repositories;

use App\Models\CustomerWalletTransaction;
use App\Models\PaymentMethod;
use App\Models\Sale;
use App\Models\SalesPayment;
use Exception;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SalesPaymentRepository
 */
class SalesPaymentRepository extends BaseRepository
{
    /**
     * @var string[]
     */
    protected $fieldSearchable = [
        'payment_date',
        'payment_type',
        'amount',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'sale_id',
        'payment_date',
        'payment_type',
        'amount',
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
        return SalesPayment::class;
    }

    /**
     * @return mixed
     */
    public function storeSalePayment($input, $sale)
    {
        try {
            DB::beginTransaction();

            $paymentType = PaymentMethod::whereId($input['payment_type'])->firstOrFail();
            if ($paymentType->type == PaymentMethod::CUSTOMER_WALLET) {
                $sale = Sale::whereId($sale->id)->firstOrFail();
                $customerWallet = $sale?->customer?->wallet ?? null;
                if (!$customerWallet) {
                    throw new UnprocessableEntityHttpException('Customer wallet not found');
                }
                if ($customerWallet->amount < $input['amount']) {
                    throw new UnprocessableEntityHttpException('Insufficient wallet amount for this payment');
                }
                // if ($sale->due_amount < $input['amount']) {
                //     throw new UnprocessableEntityHttpException('Insufficient due amount for this payment');
                // }
                $customerWallet->update([
                    'amount' => $customerWallet->amount - $input['amount'],
                ]);
                $customerWallet->transactions()->create([
                    'direction' => CustomerWalletTransaction::DIRECTION_DEBIT,
                    'payment_method_id' => $paymentType->id,
                    'amount' => $input['amount'],
                    'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_PURCHASE,
                    'status' => CustomerWalletTransaction::STATUS_APPROVED,
                    'notes' => 'Payment for sale #' . $sale->reference_code,
                ]);
            }

            $salePayments = SalesPayment::with('paymentMethod')->whereSaleId($sale->id)->get();
            $existAnySalePayment = $salePayments->isNotEmpty();
            // $firstWalletPayment = SalesPayment::where('sale_id', $sale->id)->whereHas('paymentMethod', function ($q) {
            //     $q->where('type', PaymentMethod::CUSTOMER_WALLET);
            // })->first();

            $existAmount = 0;

            if ($existAnySalePayment) {
                $existAmount = SalesPayment::whereSaleId($sale->id)->sum('amount');
            }

            $saleAmount = $sale->grand_total;
            $payAmount = $input['amount'];
            $paidAmount = $existAmount + $payAmount;

            $paymentStatus = Sale::PARTIAL_PAID;

            if (($payAmount > 0) && ($paidAmount >= $saleAmount)) {
                $paymentStatus = Sale::PAID;
            }

            $sale->update([
                'payment_status' => $paymentStatus,
                'paid_amount' => $paidAmount,
                'payment_type' => $input['payment_type'],
            ]);

            $input['sale_id'] = $sale->id;
            // if ($paymentType->type == PaymentMethod::CUSTOMER_WALLET && $firstWalletPayment) {
            //     $input['amount'] = $firstWalletPayment->amount + $input['amount'];
            //     $firstWalletPayment->update($input);
            //     $salePayment = $firstWalletPayment;
            // } else {
            $salePayment = SalesPayment::create($input);
            // }

            DB::commit();

            return $salePayment;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function updateSalePayment($input, $salesPayment)
    {
        try {
            DB::beginTransaction();

            $paymentType = PaymentMethod::whereId($input['payment_type'])->firstOrFail();
            $beforePaymentType = $salesPayment->paymentMethod ?? null;
            $beforePaymentTypeisWallet = $beforePaymentType?->type == PaymentMethod::CUSTOMER_WALLET;

            $existAmount = SalesPayment::whereSaleId($salesPayment->sale_id)->sum('amount');
            $sale = Sale::whereId($salesPayment->sale_id)->firstOrFail();
            $saleAmount = $sale->grand_total;
            $payAmount = $input['amount'];
            $paidAmount = ($existAmount - $salesPayment->amount) + $payAmount;
            $walletRefundAmount = $sale->wallet_refund_amount ?? 0;
            if ($paymentType->type == PaymentMethod::CUSTOMER_WALLET || $beforePaymentTypeisWallet) {
                $diffAmount = $input['amount'] - $salesPayment->amount;
                $customerWallet = $sale?->customer?->wallet ?? null;
                if (!$customerWallet) {
                    throw new UnprocessableEntityHttpException('Customer wallet not found');
                }
                if ($paymentType->type != PaymentMethod::CUSTOMER_WALLET && $beforePaymentTypeisWallet) {
                    $diffAmount = -$salesPayment->amount;
                }
                if ($diffAmount != 0) {
                    if ($diffAmount > 0) {
                        if ($customerWallet->amount < $diffAmount) {
                            throw new UnprocessableEntityHttpException('Insufficient wallet amount for this payment');
                        }
                        // if ($sale->due_amount < $input['amount']) {
                        //     throw new UnprocessableEntityHttpException('Insufficient due amount for this payment');
                        // }
                        $customerWallet->decrement('amount', $diffAmount);
                        // $customerWallet->update([
                        //     'amount' => $customerWallet->amount - $diffAmount,
                        // ]);
                        $customerWallet->transactions()->create([
                            'direction' => CustomerWalletTransaction::DIRECTION_DEBIT,
                            'payment_method_id' => $beforePaymentType->id,
                            'amount' => $diffAmount,
                            'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_PURCHASE,
                            'status' => CustomerWalletTransaction::STATUS_APPROVED,
                            'notes' => 'Payment for sale #' . $sale->reference_code,
                        ]);
                    } else {
                        $incrementAmount = abs($diffAmount);
                        if ($walletRefundAmount > 0) {
                            $incrementAmount = $incrementAmount - $walletRefundAmount;
                            if ($incrementAmount >= 0) {
                                $walletRefundAmount = 0;
                            } else {
                                $walletRefundAmount = abs($incrementAmount);
                            }
                        }
                        $customerWallet->increment('amount', abs($incrementAmount));
                        // $customerWallet->update([
                        //     'amount' => $customerWallet->amount + abs($diffAmount),
                        // ]);
                        $customerWallet->transactions()->create([
                            'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
                            'payment_method_id' => $beforePaymentType->id,
                            'amount' => abs($incrementAmount),
                            'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_REFUND,
                            'status' => CustomerWalletTransaction::STATUS_APPROVED,
                            'notes' => 'Payment refund for sale #' . $sale->reference_code,
                        ]);
                    }
                }
            }

            $paymentStatus = Sale::PARTIAL_PAID;

            if (($payAmount > 0) && ($paidAmount >= $saleAmount)) {
                $paymentStatus = Sale::PAID;
            }

            $salesPayment->update($input);

            $sale->update([
                'payment_type' => SalesPayment::whereSaleId($sale->id)->latest()->first()->payment_type ?? null,
                'payment_status' => $paymentStatus,
                'paid_amount' => $paidAmount,
                'wallet_refund_amount' => $walletRefundAmount,
            ]);

            DB::commit();

            return $salesPayment;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
