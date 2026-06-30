<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateSalePaymentRequest;
use App\Http\Resources\SalesPaymentResource;
use App\Models\CustomerWalletTransaction;
use App\Models\PaymentMethod;
use App\Models\Sale;
use App\Models\SalesPayment;
use App\Repositories\SalesPaymentRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SalesPaymentAPIController extends AppBaseController
{
    /** @var SalesPaymentRepository */
    private $salesPaymentRepository;

    /**
     * SalesPaymentAPIController constructor.
     */
    public function __construct(SalesPaymentRepository $salesPaymentRepository)
    {
        $this->salesPaymentRepository = $salesPaymentRepository;
    }

    /**
     * @return array
     */
    public function getAllPayments(Sale $sale)
    {
        $data = [
            'sale_id' => $sale->id,
            'wallet_refund_amount' => $sale->wallet_refund_amount ?? 0,
            'data' => $sale->payments,
        ];

        return $data;
    }

    public function createSalePayment(Sale $sale, CreateSalePaymentRequest $request): SalesPaymentResource
    {
        $input = $request->all();

        $salePayment = $this->salesPaymentRepository->storeSalePayment($input, $sale);

        return new SalesPaymentResource($salePayment);
    }

    public function updateSalePayment(SalesPayment $salesPayment, Request $request): SalesPaymentResource
    {
        $input = $request->all();

        $salePayment = $this->salesPaymentRepository->updateSalePayment($input, $salesPayment);

        return new SalesPaymentResource($salePayment);
    }

    public function deletePayment($id)
    {
        try {
            DB::beginTransaction();

            $salePayment = SalesPayment::whereId($id)->firstOrFail();
            $saleID = $salePayment->sale_id;

            $existAmount = SalesPayment::whereSaleId($saleID)->sum('amount') - $salePayment->amount;

            $status = $existAmount <= 0 ? Sale::UNPAID : Sale::PARTIAL_PAID;
            $sale = Sale::whereId($saleID)->firstOrFail();

            $sale->update([
                'payment_status' => $status,
                'paid_amount' => $existAmount,
            ]);

            $walletRefundAmount = $sale->wallet_refund_amount ?? 0;
            $paymentType = $salePayment->paymentMethod ?? null;
            if ($paymentType->type == PaymentMethod::CUSTOMER_WALLET) {
                $customerWallet = $sale?->customer?->wallet ?? null;
                $incrementAmount = $salePayment->amount;
                if ($walletRefundAmount > 0) {
                    $incrementAmount = $salePayment->amount - $walletRefundAmount;
                    if ($incrementAmount >= 0) {
                        $walletRefundAmount = 0;
                    } else {
                        $walletRefundAmount = abs($incrementAmount);
                    }
                }
                if ($incrementAmount > 0) {
                    $customerWallet->increment('amount', $incrementAmount);
                    // $customerWallet->update([
                    //     'amount' => $customerWallet->amount + $incrementAmount,
                    // ]);
                    $customerWallet->transactions()->create([
                        'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
                        'payment_method_id' => $paymentType->id,
                        'amount' => $incrementAmount,
                        'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_REFUND,
                        'status' => CustomerWalletTransaction::STATUS_APPROVED,
                        'notes' => 'Payment refund for sale #' . $sale->reference_code,
                    ]);
                }
            }

            SalesPayment::findOrFail($id)->delete();

            $latestPayment = SalesPayment::whereSaleId($saleID)->latest()->first();

            Sale::whereId($saleID)->update([
                'payment_type' => ! empty($latestPayment) ? $latestPayment->payment_type : null,
                'wallet_refund_amount' => $walletRefundAmount,
            ]);

            DB::commit();

            return $this->sendSuccess('Payment deleted successfully');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
