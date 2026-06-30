<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreatePurchaseReturnRequest;
use App\Http\Requests\UpdatePurchaseReturnRequest;
use App\Http\Resources\PurchaseReturnCollection;
use App\Http\Resources\PurchaseReturnResource;
use App\Models\FiscalYear;
use App\Models\PurchaseReturn;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Repositories\PurchaseReturnRepository;
use Barryvdh\DomPDF\Facade\Pdf as CPDF;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Mccarlosen\LaravelMpdf\Facades\LaravelMpdf as PDF;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PurchaseReturnAPIController extends AppBaseController
{
    /** @var PurchaseReturnRepository */
    private $purchaseReturnRepository;

    /**
     * PurchaseReturnAPIController constructor.
     */
    public function __construct(PurchaseReturnRepository $purchaseReturnRepository)
    {
        $this->purchaseReturnRepository = $purchaseReturnRepository;
    }

    public function index(Request $request): PurchaseReturnCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        $supplier = (Supplier::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        $purchasesReturn = $this->purchaseReturnRepository;
        if ($supplier || $warehouse) {
            $purchasesReturn->whereHas('supplier', function (Builder $q) use ($search, $supplier) {
                if ($supplier) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            })->whereHas('warehouse', function (Builder $q) use ($search, $warehouse) {
                if ($warehouse) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            });
        }

        if ($request->get('start_date') && $request->get('end_date')) {
            $purchasesReturn->whereBetween(
                'date',
                [$request->get('start_date'), $request->get('end_date')]
            );
        } elseif (isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));
            $fiscalYear = !empty($fiscalYearId)
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $purchasesReturn->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        if ($request->get('warehouse_id')) {
            $purchasesReturn->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('status')) {
            $purchasesReturn->where('status', $request->get('status'));
        }

        $purchasesReturn = $purchasesReturn->paginate($perPage);
        PurchaseReturnResource::usingWithCollection();

        return new PurchaseReturnCollection($purchasesReturn);
    }

    public function store(CreatePurchaseReturnRequest $request): PurchaseReturnResource
    {
        $input = $request->all();
        $purchaseReturn = $this->purchaseReturnRepository->storePurchaseReturn($input);

        return new PurchaseReturnResource($purchaseReturn);
    }

    public function show($id): PurchaseReturnResource
    {
        $purchaseReturn = $this->purchaseReturnRepository->find($id);

        return new PurchaseReturnResource($purchaseReturn);
    }

    public function edit(PurchaseReturn $purchasesReturn): PurchaseReturnResource
    {
        $purchasesReturn = $purchasesReturn->load('purchaseReturnItems.product.stocks', 'warehouse');

        return new PurchaseReturnResource($purchasesReturn);
    }

    public function editByPurchase($purchaseId)
    {
        $purchaseReturn = PurchaseReturn::where('purchase_id', $purchaseId)->first();
        if (empty($purchaseReturn)) {
            return $this->sendError('Purchase Return is not created');
        }
        $purchaseReturn = $purchaseReturn->load('purchaseReturnItems', 'purchaseReturnItems.product.stocks', 'warehouse');

        return new PurchaseReturnResource($purchaseReturn);
    }

    public function update(UpdatePurchaseReturnRequest $request, $id): PurchaseReturnResource
    {
        $input = $request->all();
        $purchaseReturn = $this->purchaseReturnRepository->updatePurchaseReturn($input, $id);

        return new PurchaseReturnResource($purchaseReturn);
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

                $purchaseReturn = $this->purchaseReturnRepository
                    ->with('purchaseReturnItems', 'purchase')
                    ->where('id', $id)
                    ->first();

                if (!$purchaseReturn) {
                    $canDeleteIds[] = [
                        'id' => $id,
                        'name' => 'Purchase Return not found',
                    ];
                    DB::rollBack();
                    continue;
                }

                foreach ($purchaseReturn->purchaseReturnItems as $item) {
                    manageStock(
                        $purchaseReturn->warehouse_id,
                        $item['product_id'],
                        $item['quantity']
                    );
                }

                if ($purchaseReturn->purchase) {
                    $purchaseReturn->purchase->update(['is_return' => 0]);
                }

                $this->purchaseReturnRepository->delete($purchaseReturn->id);

                DB::commit();
            }

            if (count($ids) === 1) {
                return $this->sendSuccess('Purchase Return Deleted successfully');
            }

            return $this->sendResponse([
                'show_model' => count($canDeleteIds) > 0,
                'ids' => $canDeleteIds,
            ], 'Purchase Return(s) delete process completed.');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError('Something went wrong: ' . $e->getMessage());
        }
        // try {
        //     DB::beginTransaction();
        //     $purchaseReturn = $this->purchaseReturnRepository->where('id', $id)->with('purchaseReturnItems')->first();
        //     foreach ($purchaseReturn->purchaseReturnItems as $purchaseReturnItem) {
        //         manageStock(
        //             $purchaseReturn->warehouse_id,
        //             $purchaseReturnItem['product_id'],
        //             $purchaseReturnItem['quantity']
        //         );
        //     }
        //     if ($purchaseReturn->purchase) {
        //         $purchaseReturn->purchase->update(['is_return' => 0]);
        //     }
        //     $this->purchaseReturnRepository->delete($purchaseReturn->id);
        //     DB::commit();

        //     return $this->sendSuccess('Purchase Return Deleted successfully');
        // } catch (Exception $e) {
        //     DB::rollBack();
        //     throw new UnprocessableEntityHttpException($e->getMessage());
        // }
    }

    public function purchaseReturnInfo(PurchaseReturn $purchaseReturn): JsonResponse
    {
        $purchaseReturn = $purchaseReturn->load(['purchaseReturnItems.product', 'warehouse', 'supplier']);
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

        $purchaseReturn['company_info'] = $company_info;
        return $this->sendResponse($purchaseReturn, 'Purchase Return information retrieved successfully');
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(PurchaseReturn $purchaseReturn): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $purchaseReturn = $purchaseReturn->load('purchaseReturnItems.product', 'supplier');

        $data = [];
        if (Storage::exists('pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf')) {
            Storage::delete('pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf');
        }

        $companyLogo = getLogoUrl();
        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.purchase-return-pdf' : 'pdf.purchase-return-pdf';
        if(getLoginUserLanguage() == 'ar'){
            $pdf = PDF::loadView($pdfViewPath, compact('purchaseReturn', 'companyLogo'));
        }else{
            $pdf = CPDF::loadView($pdfViewPath, compact('purchaseReturn', 'companyLogo'));
        }

        Storage::disk(config('app.media_disc'))->put(
            'pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf',
            $pdf->output()
        );
        $data['purchase_return_pdf_url'] = Storage::url('pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf');

        return $this->sendResponse($data, 'purchase return pdf retrieved Successfully');
    }

    public function getPurchaseReturnProductReport(Request $request): PurchaseReturnCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $purchaseReturn = $this->purchaseReturnRepository->whereHas(
            'purchaseReturnItems',
            function ($q) use ($productId) {
                $q->where('product_id', '=', $productId);
            }
        )->with(['purchaseReturnItems.product', 'supplier']);

        $purchaseReturn = $purchaseReturn->paginate($perPage);
        PurchaseReturnResource::usingWithCollection();

        return new PurchaseReturnCollection($purchaseReturn);
    }
}
