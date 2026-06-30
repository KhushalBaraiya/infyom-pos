<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Http\Resources\SaleCollection;
use App\Http\Resources\SaleResource;
use App\Models\Customer;
use App\Models\CustomerWallet;
use App\Models\CustomerWalletTransaction;
use App\Models\FiscalYear;
use App\Models\Hold;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SalesPayment;
use App\Models\Setting;
use App\Models\Tax;
use App\Models\Warehouse;
use App\Repositories\SaleRepository;
use Barryvdh\DomPDF\Facade\Pdf as CPDF;
use Intervention\Image\Facades\Image;
use Mccarlosen\LaravelMpdf\Facades\LaravelMpdf as PDF;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SaleAPIController
 */
class SaleAPIController extends AppBaseController
{
    /** @var saleRepository */
    private $saleRepository;

    public function __construct(SaleRepository $saleRepository)
    {
        $this->saleRepository = $saleRepository;
    }

    public function index(Request $request): SaleCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        $customer = (Customer::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        $products = (Product::where('name', 'LIKE', "%$search%")->orWhere('code', 'LIKE', "%$search%")->get()->count() != 0);

        $sales = $this->saleRepository;

        /** @var User $user */
        $user = Auth::user();
        if ($user->hasRole('customer')) {
            $customer = Customer::withoutGlobalScope('tenant')->where('user_id', $user->id)->first();
            $sales->where('customer_id', $customer->id);
        }

        if ($customer) {
            $sales->whereHas('customer', function (Builder $q) use ($search, $customer) {
                if ($customer) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            });
        }
        if ($products) {
            $sales->whereHas('saleItems', function (Builder $q) use ($search) {
                $q->whereHas('product', function (Builder $q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%")
                        ->orWhere('code', 'LIKE', "%$search%");
                });
            });
        }
        if ($warehouse) {
            $sales->whereHas('warehouse', function (Builder $q) use ($search, $warehouse) {
                if ($warehouse) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            });
        }

        if ($request->get('start_date') && $request->get('end_date')) {
            $sales->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        } elseif (!$user->hasRole('customer') && isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));
            $fiscalYear = !empty($fiscalYearId)
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $sales->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        if ($request->get('warehouse_id')) {
            $sales->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('customer_id')) {
            $sales->where('customer_id', $request->get('customer_id'));
        }

        if ($request->get('user_id')) {
            $sales->where('user_id', $request->get('user_id'));
        }

        if ($request->get('status') && $request->get('status') != 'null') {
            $sales->Where('status', $request->get('status'));
        }

        if ($request->get('payment_status') && $request->get('payment_status') != 'null') {
            $sales->where('payment_status', $request->get('payment_status'));
        }

        if ($request->get('payment_type') && $request->get('payment_type') != 'null') {
            $sales->where('payment_type', $request->get('payment_type'));
        }

        $sales = $sales->paginate($perPage);

        SaleResource::usingWithCollection();

        return new SaleCollection($sales);
    }

    public function store(CreateSaleRequest $request): SaleResource
    {
        if (isset($request->hold_ref_no)) {
            $holdExist = Hold::whereReferenceCode($request->hold_ref_no)->first();
            if (!empty($holdExist)) {
                $holdExist->delete();
            }
        }
        $input = $request->all();

        if (isset($input['payment_status']) && $input['payment_status'] != Sale::UNPAID) {
            $grand_total = floatval($input['grand_total'] ?? 0);
            $paymentDetails = $input['payment_details'] ?? [];

            if (empty($paymentDetails) || !is_array($paymentDetails)) {
                throw new UnprocessableEntityHttpException('Payment details are required when payment status is PAID.');
            }

            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return floatval($detail['amount'] ?? 0);
            });

            $customerWallet = CustomerWallet::whereCustomerId($input['customer_id'])->first();
            $paymentWalletAmount = 0;
            foreach ($paymentDetails as $detail) {
                $paymentMethod = PaymentMethod::find($detail['payment_type']['value']);
                if (!$paymentMethod) {
                    throw new UnprocessableEntityHttpException('Invalid payment method.');
                }
                if ($paymentMethod->type == PaymentMethod::CUSTOMER_WALLET) {
                    if (!$customerWallet) {
                        throw new UnprocessableEntityHttpException('Customer wallet not found.');
                    }
                    $paymentWalletAmount += (floatval($detail['amount'] ?? 0));
                }
            }
            if ($customerWallet && $customerWallet->amount < $paymentWalletAmount) {
                throw new UnprocessableEntityHttpException('Insufficient balance in customer wallet.');
            }

            // if ($totalAmount > $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount cannot be greater than the grand total.');
            // }

            // if ($totalAmount < $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount should be equal to grand total.');
            // }
        }

        $sale = $this->saleRepository->storeSale($input);

        return new SaleResource($sale);
    }

    public function show($id): SaleResource
    {
        $sale = $this->saleRepository->find($id);

        return new SaleResource($sale);
    }

    public function edit(Sale $sale): SaleResource
    {
        $sale = $sale->load('saleItems.product.stocks', 'warehouse');

        return new SaleResource($sale);
    }

    public function update(UpdateSaleRequest $request, $id): SaleResource
    {
        $input = $request->all();

        if (isset($input['payment_status']) && $input['payment_status'] != Sale::UNPAID) {
            $grand_total = floatval($input['grand_total'] ?? 0);
            $paymentDetails = $input['payment_details'] ?? [];

            if (empty($paymentDetails) || !is_array($paymentDetails)) {
                throw new UnprocessableEntityHttpException('Payment details are required when payment status is PAID.');
            }

            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return floatval($detail['amount'] ?? 0);
            });

            $customerWallet = CustomerWallet::whereCustomerId($input['customer_id'])->first();
            $paymentWalletAmount = 0;
            foreach ($paymentDetails as $detail) {
                $paymentMethod = PaymentMethod::find($detail['payment_type']['value']);
                if (!$paymentMethod) {
                    throw new UnprocessableEntityHttpException('Invalid payment method.');
                }
                if ($paymentMethod->type == PaymentMethod::CUSTOMER_WALLET) {
                    if (!$customerWallet) {
                        throw new UnprocessableEntityHttpException('Customer wallet not found.');
                    }
                    $paymentWalletAmount += (floatval($detail['amount'] ?? 0));
                }
            }
            $alreadyWalletPaid = SalesPayment::whereSaleId($id)
                ->whereHas('sale', function (Builder $q) use ($input) {
                    $q->where('customer_id', $input['customer_id']);
                })
                ->whereHas('paymentMethod', function (Builder $q) {
                    $q->where('type', PaymentMethod::CUSTOMER_WALLET);
                })->sum('amount');
            $differenceAmount = $paymentWalletAmount - $alreadyWalletPaid;
            if ($differenceAmount > 0 && $customerWallet && $customerWallet->amount < $differenceAmount) {
                throw new UnprocessableEntityHttpException('Insufficient balance in customer wallet.');
            }

            // if ($totalAmount > $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount cannot be greater than the grand total.');
            // }

            // if ($totalAmount < $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount should be equal to grand total.');
            // }
        }

        $sale = $this->saleRepository->updateSale($input, $id);

        return new SaleResource($sale);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $canDeleteIds = [];

        try {
            foreach ($ids as $id) {
                DB::beginTransaction();

                $sale = $this->saleRepository->with('saleItems')->where('id', $id)->first();

                if (!empty($sale->payments)) {
                    $walletPayments = $sale->payments
                        ->filter(
                            fn($payment) =>
                            $payment->paymentMethod->type == PaymentMethod::CUSTOMER_WALLET
                        );

                    $customerWallet = $sale->customer?->wallet;
                    if ($customerWallet && $walletPayments->isNotEmpty()) {
                        foreach ($walletPayments as $payment) {
                            $paymentDate = \Carbon\Carbon::parse($payment->payment_date)->toDateString();
                            $transaction = $customerWallet->transactions()
                                ->where('direction', CustomerWalletTransaction::DIRECTION_DEBIT)
                                ->where('transaction_type', CustomerWalletTransaction::TRANSACTION_TYPE_PURCHASE)
                                ->where('amount', $payment->amount)
                                ->whereDate('created_at', $paymentDate)
                                ->first();
                            if ($transaction) {
                                $customerWallet->increment('amount', $payment->amount);
                                $customerWallet->transactions()->create([
                                    'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
                                    'payment_method_id' => $payment->payment_type,
                                    'amount' => $payment->amount,
                                    'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_REFUND,
                                    'status' => CustomerWalletTransaction::STATUS_APPROVED,
                                    'notes' => 'Refund on sale delete #' . $sale->id,
                                ]);
                            }
                        }
                    }
                }

                if (!$sale) {
                    $canDeleteIds[] = ['id' => $id, 'name' => 'Sale not found'];
                    DB::rollBack();
                    continue;
                }

                foreach ($sale->saleItems as $saleItem) {
                    manageStock($sale->warehouse_id, $saleItem['product_id'], $saleItem['quantity']);
                }

                $barcodePath = Storage::path('sales/barcode-' . $sale->reference_code . '.png');
                if (File::exists($barcodePath)) {
                    File::delete($barcodePath);
                }

                $this->saleRepository->delete($id);

                DB::commit();
            }

            if (count($ids) === 1) {
                return $this->sendSuccess('Sale Deleted successfully');
            }

            return $this->sendResponse([
                'show_model' => count($canDeleteIds) > 0,
                'ids' => $canDeleteIds,
            ], 'Sale(s) delete process completed.');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
        // try {
        //     DB::beginTransaction();
        //     $sale = $this->saleRepository->with('saleItems')->where('id', $id)->first();
        //     foreach ($sale->saleItems as $saleItem) {
        //         manageStock($sale->warehouse_id, $saleItem['product_id'], $saleItem['quantity']);
        //     }
        //     if (File::exists(Storage::path('sales/barcode-' . $sale->reference_code . '.png'))) {
        //         File::delete(Storage::path('sales/barcode-' . $sale->reference_code . '.png'));
        //     }
        //     $this->saleRepository->delete($id);
        //     DB::commit();

        //     return $this->sendSuccess('Sale Deleted successfully');
        // } catch (Exception $e) {
        //     DB::rollBack();
        //     throw new UnprocessableEntityHttpException($e->getMessage());
        // }
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(Sale $sale): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $sale = $sale->load('customer', 'saleItems.product', 'payments');
        $data = [];
        if (Storage::exists('pdf/Sale-' . $sale->reference_code . '.pdf')) {
            Storage::delete('pdf/Sale-' . $sale->reference_code . '.pdf');
        }
        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $taxes = Tax::where('status', 1)->get();

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.sale-pdf' : 'pdf.sale-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('sale', 'companyLogo', 'taxes'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('sale', 'companyLogo', 'taxes'));
        }
        Storage::disk(config('app.media_disc'))->put('pdf/Sale-' . $sale->reference_code . '.pdf', $pdf->output());
        $data['sale_pdf_url'] = Storage::url('pdf/Sale-' . $sale->reference_code . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function saleInfo(Sale $sale): JsonResponse
    {
        $sale = $sale->load('saleItems.product', 'warehouse', 'customer', 'payments');
        $keyName = [
            'email',
            'company_name',
            'phone',
            'address',
        ];
        $company_info = Setting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        if (getActiveStoreName()) {
            $company_info['company_name'] = getActiveStoreName();
        }

        $sale['company_info'] = $company_info;
        $sale['barcode_url'] = Storage::url('sales/barcode-' . $sale->reference_code . '.png');
        return $this->sendResponse($sale, 'Sale information retrieved successfully');
    }

    public function getSaleProductReport(Request $request): SaleCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $sales = $this->saleRepository->whereHas('saleItems', function ($q) use ($productId) {
            $q->where('product_id', '=', $productId);
        })->with(['saleItems.product', 'customer']);

        $sales = $sales->paginate($perPage);

        SaleResource::usingWithCollection();

        return new SaleCollection($sales);
    }
}
