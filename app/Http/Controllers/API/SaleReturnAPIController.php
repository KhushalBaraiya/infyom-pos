<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateSaleReturnRequest;
use App\Http\Requests\UpdateSaleReturnRequest;
use App\Http\Resources\SaleReturnCollection;
use App\Http\Resources\SaleReturnResource;
use App\Models\Customer;
use App\Models\CustomerWallet;
use App\Models\CustomerWalletTransaction;
use App\Models\FiscalYear;
use App\Models\ManageStock;
use App\Models\PaymentMethod;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\Setting;
use App\Models\Tax;
use App\Models\Warehouse;
use App\Repositories\SaleReturnRepository;
use Barryvdh\DomPDF\Facade\Pdf as CPDF;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Mccarlosen\LaravelMpdf\Facades\LaravelMpdf as PDF;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SaleReturnAPIController extends AppBaseController
{
    /**
     * @var SaleReturnRepository
     */
    private $saleReturnRepository;

    /**
     * SaleReturnAPIController constructor.
     */
    public function __construct(SaleReturnRepository $saleReturnRepository)
    {
        $this->saleReturnRepository = $saleReturnRepository;
    }

    public function index(Request $request): SaleReturnCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        $customer = (Customer::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        $salesReturn = $this->saleReturnRepository;

        /** @var User $user */
        $user = Auth::user();
        if ($user->hasRole('customer')) {
            $customer = Customer::withoutGlobalScope('tenant')->where('user_id', $user->id)->first();
            $salesReturn->where('customer_id', $customer->id);
        }

        if ($customer || $warehouse) {
            $salesReturn->whereHas('customer', function (Builder $q) use ($search, $customer) {
                if ($customer) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            })->whereHas('warehouse', function (Builder $q) use ($search, $warehouse) {
                if ($warehouse) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            });
        }

        if ($request->get('start_date') && $request->get('end_date')) {
            $salesReturn->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        } elseif (!$user->hasRole('customer') && isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));
            $fiscalYear = !empty($fiscalYearId)
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $salesReturn->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        if ($request->get('warehouse_id')) {
            $salesReturn->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('customer_id')) {
            $salesReturn->where('customer_id', $request->get('customer_id'));
        }

        if ($request->get('status') && $request->get('status') != 'null') {
            $salesReturn->Where('status', $request->get('status'));
        }

        if ($request->get('payment_status') && $request->get('payment_status') != 'null') {
            $salesReturn->where('payment_status', $request->get('payment_status'));
        }

        $salesReturn = $salesReturn->paginate($perPage);

        SaleReturnResource::usingWithCollection();

        return new SaleReturnCollection($salesReturn);
    }

    public function store(CreateSaleReturnRequest $request): SaleReturnResource
    {
        $input = $request->all();
        $saleReturn = $this->saleReturnRepository->storeSaleReturn($input);

        return new SaleReturnResource($saleReturn);
    }

    public function show($id): SaleReturnResource
    {
        $saleReturn = $this->saleReturnRepository->find($id);

        return new SaleReturnResource($saleReturn);
    }

    public function edit(SaleReturn $salesReturn): SaleReturnResource
    {
        $salesReturn = $salesReturn->load('saleReturnItems.product', 'warehouse');

        return new SaleReturnResource($salesReturn);
    }

    public function editBySale($saleId)
    {
        $salesReturn = SaleReturn::where('sale_id', $saleId)->first();
        if (empty($salesReturn)) {
            return $this->sendError('Sale Return is not created');
        }
        $salesReturn = $salesReturn->load('saleReturnItems', 'saleReturnItems.product', 'warehouse');

        return new SaleReturnResource($salesReturn);
    }

    public function update(UpdateSaleReturnRequest $request, $id): SaleReturnResource
    {
        $input = $request->all();
        $saleReturn = $this->saleReturnRepository->updateSaleReturn($input, $id);

        return new SaleReturnResource($saleReturn);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $canDeleteIds = [];

        foreach ($ids as $id) {
            try {
                DB::beginTransaction();

                $saleReturn = SaleReturn::with(['saleReturnItems.product', 'sale'])->where('id', $id)->first();

                if (!$saleReturn) {
                    throw new UnprocessableEntityHttpException(__('Sale Return not found.'));
                }

                if ($saleReturn->sale) {
                    $sale = $saleReturn->sale;
                    $customerId = $saleReturn->sale->customer_id;
                    $customerWallet = CustomerWallet::where('customer_id', $customerId)->first();
                    if ($customerWallet && $sale->wallet_refund_amount > 0) {
                        if ($customerWallet->amount < $sale->wallet_refund_amount) {
                            throw new UnprocessableEntityHttpException('Insufficient wallet balance, available balance: ' . $customerWallet->amount . ' #' . $saleReturn->reference_code);
                        }
                        $walletPaymentMethod = PaymentMethod::where('type', PaymentMethod::CUSTOMER_WALLET)->first();
                        $customerWallet->decrement('amount', $sale->wallet_refund_amount);
                        $customerWallet->transactions()->create([
                            'direction' => CustomerWalletTransaction::DIRECTION_DEBIT,
                            'payment_method_id' => $walletPaymentMethod->id,
                            'amount' => $sale->wallet_refund_amount,
                            'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_PURCHASE,
                            'status' => CustomerWalletTransaction::STATUS_APPROVED,
                            'notes' => 'Sale return deleted #' . $saleReturn->reference_code . ', refund amount: ' . $sale->wallet_refund_amount,
                        ]);
                    }
                    $saleReturn->sale->update([
                        'is_return' => 0,
                        'wallet_refund_amount' => 0
                    ]);
                }

                foreach ($saleReturn->saleReturnItems as $item) {
                    $product = ManageStock::whereWarehouseId($saleReturn->warehouse_id)
                        ->whereProductId($item['product_id'])
                        ->first();

                    if ($product) {
                        if ($product->quantity >= $item['quantity']) {
                            $product->update([
                                'quantity' => $product->quantity - $item['quantity'],
                            ]);
                        } else {
                            throw new UnprocessableEntityHttpException(__('messages.error.sale_return_available_quantity', [
                                'sr_code' => $saleReturn->reference_code ?? 'Unnamed',
                                'product_name' => $item?->product?->name ?? 'Product not found'
                            ]));
                        }
                    }
                }

                $saleReturn->delete();

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $canDeleteIds[] = [
                    'id' => $id,
                    'name' => $e->getMessage(),
                ];
            }
        }

        if (count($ids) === 1) {
            if (count($canDeleteIds) > 0) {
                return $this->sendError($canDeleteIds[0]['name'] ?? 'Sale Return not deleted');
            }
            return $this->sendSuccess('Sale Return deleted successfully.');
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds,
        ], 'Sale Returns delete process completed.');

        // try {
        //     DB::beginTransaction();
        //     $saleReturn = $this->saleReturnRepository->with('saleReturnItems')->where('id', $id)->first();
        //     $sale = Sale::whereId($saleReturn->sale_id)->first();
        //     if ($sale) {
        //         $sale->update(['is_return' => 0]);
        //     }
        //     foreach ($saleReturn->saleReturnItems as $saleReturnItem) {
        //         $product = ManageStock::whereWarehouseId($saleReturn->warehouse_id)->whereProductId($saleReturnItem['product_id'])->first();
        //         if ($product) {
        //             if ($product->quantity >= $saleReturnItem['quantity']) {
        //                 $totalQuantity = $product->quantity - $saleReturnItem['quantity'];
        //                 $product->update([
        //                     'quantity' => $totalQuantity,
        //                 ]);
        //             }
        //         }
        //     }
        //     $this->saleReturnRepository->delete($id);
        //     DB::commit();

        //     return $this->sendSuccess('Sale Return Deleted successfully');
        // } catch (Exception $e) {
        //     DB::rollBack();
        //     throw new UnprocessableEntityHttpException($e->getMessage());
        // }
    }

    public function saleReturnInfo($id): JsonResponse
    {
        $salesReturn = SaleReturn::withoutGlobalScopes()
            ->with(['saleReturnItems.product', 'warehouse', 'customer'])
            ->findOrFail($id);

        $salesReturn = $salesReturn->load('saleReturnItems.product', 'warehouse', 'customer');
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
        $salesReturn['company_info'] = $company_info;

        return $this->sendResponse($salesReturn, 'Sale Return information retrieved successfully');
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(SaleReturn $saleReturn): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $saleReturn = $saleReturn->load('customer', 'saleReturnItems.product');
        $data = [];
        if (Storage::exists('pdf/sale_return-' . $saleReturn->reference_code . '.pdf')) {
            Storage::delete('pdf/sale_return-' . $saleReturn->reference_code . '.pdf');
        }
        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $taxes = Tax::where('status', 1)->get();

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.sale-return-pdf' : 'pdf.sale-return-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('saleReturn', 'companyLogo', 'taxes'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('saleReturn', 'companyLogo', 'taxes'));
        }
        Storage::disk(config('app.media_disc'))->put(
            'pdf/sale_return-' . $saleReturn->reference_code . '.pdf',
            $pdf->output()
        );
        $data['sale_return_pdf_url'] = Storage::url('pdf/sale_return-' . $saleReturn->reference_code . '.pdf');

        return $this->sendResponse($data, 'Sale return pdf retrieved Successfully');
    }

    public function getSaleReturnProductReport(Request $request): SaleReturnCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $saleReturns = $this->saleReturnRepository->whereHas('saleReturnItems', function ($q) use ($productId) {
            $q->where('product_id', '=', $productId);
        })->with(['saleReturnItems.product', 'customer']);

        $saleReturns = $saleReturns->paginate($perPage);

        SaleReturnResource::usingWithCollection();

        return new SaleReturnCollection($saleReturns);
    }
}
