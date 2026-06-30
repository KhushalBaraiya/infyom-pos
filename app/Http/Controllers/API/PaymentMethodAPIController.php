<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreatePaymentMethodRequest;
use App\Http\Requests\UpdatePaymentMethodRequest;
use App\Http\Resources\PaymentMethodCollection;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;
use App\Repositories\PaymentMethodRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PaymentMethodAPIController extends AppBaseController
{
    protected PaymentMethodRepository $paymentMethodRepository;

    public function __construct(PaymentMethodRepository $paymentMethodRepository)
    {
        $this->paymentMethodRepository = $paymentMethodRepository;
    }

    public function index(Request $request): PaymentMethodCollection
    {
        $perPage = getPageSize($request);
        $paymentMethods = $this->paymentMethodRepository->paginate($perPage);
        PaymentMethodResource::usingWithCollection();

        return new PaymentMethodCollection($paymentMethods);
    }

    public function store(CreatePaymentMethodRequest $request): PaymentMethodResource
    {
        try {
            DB::beginTransaction();
            $input = $request->all();
            $paymentMethod = $this->paymentMethodRepository->create($input);
            DB::commit();
            return new PaymentMethodResource($paymentMethod);
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function show($id): PaymentMethodResource
    {
        $paymentMethod = $this->paymentMethodRepository->find($id);
        return new PaymentMethodResource($paymentMethod);
    }

    public function update(UpdatePaymentMethodRequest $request, $id): PaymentMethodResource
    {
        try {
            DB::beginTransaction();
            $input = $request->validated();
            $paymentMethod = $this->paymentMethodRepository->find($id);
            $updatedPaymentMethod = $this->paymentMethodRepository->update($input, $paymentMethod->id);
            DB::commit();
            return new PaymentMethodResource($updatedPaymentMethod);
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $paymentMethod = $this->paymentMethodRepository->findOrFail($id);
            if ($paymentMethod->type == PaymentMethod::CUSTOMER_WALLET) {
                return $this->sendError(__('messages.error.cannot_delete_customer_wallet_payment_method'));
            }
            if (!empty($paymentMethod->sales) && $paymentMethod->sales->count() > 0) {
                return $this->sendError(__('messages.error.cannot_delete_used_payment_method', ['module' => __('messages.sales')]));
            }
            if (!empty($paymentMethod->purchases) && $paymentMethod->purchases->count() > 0) {
                return $this->sendError(__('messages.error.cannot_delete_used_payment_method', ['module' => __('messages.purchases')]));
            }
            if (!empty($paymentMethod->salesReturn) && $paymentMethod->salesReturn->count() > 0) {
                return $this->sendError(__('messages.error.cannot_delete_used_payment_method', ['module' => __('messages.sales_return')]));
            }
            if (!empty($paymentMethod->purchasesReturn) && $paymentMethod->purchasesReturn->count() > 0) {
                return $this->sendError(__('messages.error.cannot_delete_used_payment_method', ['module' => __('messages.purchases_return')]));
            }
            if (!empty($paymentMethod->salesPayments) && $paymentMethod->salesPayments->count() > 0) {
                return $this->sendError(__('messages.error.cannot_delete_used_payment_method', ['module' => __('messages.sales_payments')]));
            }

            DB::beginTransaction();
            $this->paymentMethodRepository->delete($paymentMethod->id);
            DB::commit();
            return $this->sendSuccess('Payment method deleted successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function changeStatus($id): JsonResponse
    {
        try {
            $paymentMethod = $this->paymentMethodRepository->findOrFail($id);
            if ($paymentMethod->type == PaymentMethod::CUSTOMER_WALLET) {
                return $this->sendError(__('messages.error.cannot_change_status_customer_wallet_payment_method'));
            }
            if (!empty($paymentMethod->sales) && $paymentMethod->sales->count() > 0) {
                return $this->sendError(__('messages.error.cannot_change_status_used_payment_method', ['module' => __('messages.sales')]));
            }
            if (!empty($paymentMethod->purchases) && $paymentMethod->purchases->count() > 0) {
                return $this->sendError(__('messages.error.cannot_change_status_used_payment_method', ['module' => __('messages.purchases')]));
            }
            if (!empty($paymentMethod->salesReturn) && $paymentMethod->salesReturn->count() > 0) {
                return $this->sendError(__('messages.error.cannot_change_status_used_payment_method', ['module' => __('messages.sales_return')]));
            }
            if (!empty($paymentMethod->purchasesReturn) && $paymentMethod->purchasesReturn->count() > 0) {
                return $this->sendError(__('messages.error.cannot_change_status_used_payment_method', ['module' => __('messages.purchases_return')]));
            }
            if (!empty($paymentMethod->salesPayments) && $paymentMethod->salesPayments->count() > 0) {
                return $this->sendError(__('messages.error.cannot_change_status_used_payment_method', ['module' => __('messages.sales_payments')]));
            }

            DB::beginTransaction();
            $paymentMethod->update(['status' => !$paymentMethod->status]);
            DB::commit();
            return $this->sendSuccess(__('messages.success.payment_method_status_updated'));
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
