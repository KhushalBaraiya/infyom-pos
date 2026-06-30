<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierCollection;
use App\Http\Resources\SupplierResource;
use App\Imports\SupplierImport;
use App\Models\FiscalYear;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Repositories\SupplierRepository;
use Intervention\Image\Facades\Image;
use Mccarlosen\LaravelMpdf\Facades\LaravelMpdf as PDF;
use Barryvdh\DomPDF\Facade\Pdf as CPDF;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Prettus\Validator\Exceptions\ValidatorException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SupplierAPIController
 */
class SupplierAPIController extends AppBaseController
{
    /** @var SupplierRepository */
    private $supplierRepository;

    public function __construct(SupplierRepository $supplierRepository)
    {
        $this->supplierRepository = $supplierRepository;
    }

    public function index(Request $request): SupplierCollection
    {
        $perPage = getPageSize($request);
        $suppliers = $this->supplierRepository->paginate($perPage);
        SupplierResource::usingWithCollection();

        return new SupplierCollection($suppliers);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateSupplierRequest $request): SupplierResource
    {
        $input = $request->all();
        $supplier = $this->supplierRepository->create($input);

        return new SupplierResource($supplier);
    }

    public function show($id): SupplierResource
    {
        $supplier = $this->supplierRepository->find($id);

        return new SupplierResource($supplier);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateSupplierRequest $request, $id): SupplierResource
    {
        $input = $request->all();
        $supplier = $this->supplierRepository->update($input, $id);

        return new SupplierResource($supplier);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        $purchaseModel = [Purchase::class];

        if (count($ids) === 1) {
            if (canDelete($purchaseModel, 'supplier_id', $ids[0])) {
                return $this->sendError(__('messages.error.supplier_in_use'));
            }

            try {
                DB::beginTransaction();
                $this->supplierRepository->delete($ids[0]);
                DB::commit();

                return $this->sendSuccess('Supplier deleted successfully');
            } catch (\Exception $e) {
                DB::rollBack();
                throw new UnprocessableEntityHttpException($e->getMessage());
            }
        }

        $failed = [];

        foreach ($ids as $id) {
            try {
                $supplier = $this->supplierRepository->find($id);
                if (canDelete($purchaseModel, 'supplier_id', $id)) {
                    $failed[] = [
                        'id' => $id,
                        'name' => $supplier->name ?? '',
                    ];
                    continue;
                }

                DB::beginTransaction();
                $this->supplierRepository->delete($id);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $failed[] = ['id' => $id];
            }
        }

        return $this->sendResponse([
            'show_model' => count($failed) > 0,
            'ids' => $failed,
        ], 'Supplier delete process completed.');
        // $purchaseModel = [
        //     Purchase::class,
        // ];
        // $useSupplier = canDelete($purchaseModel, 'supplier_id', $id);
        // if ($useSupplier) {
        //     $this->sendError('Supplier can\'t be deleted.');
        // }
        // $this->supplierRepository->delete($id);

        // return $this->sendSuccess('Supplier deleted successfully');
    }

    public function importSuppliers(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv',
        ]);
        Excel::import(new SupplierImport(), request()->file('file'));

        return $this->sendSuccess('Suppliers imported successfully');
    }

    public function pdfDownload(Supplier $supplier): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $fiscalYear = null;
        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();
        }

        $supplier = $supplier->load(['purchases' => function ($query) use ($fiscalYear) {
            if ($fiscalYear) {
                $query->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }]);

        $purchasesData = [];

        $purchasesData['totalPurchase'] = $supplier->purchases->count();

        $purchasesData['totalAmount'] = $supplier->purchases->sum('grand_total');

        $data = [];

        if (Storage::exists('pdf/suppliers-report-' . $supplier->id . '.pdf')) {
            Storage::delete('pdf/suppliers-report-' . $supplier->id . '.pdf');
        }

        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.suppliers-report-pdf' : 'pdf.suppliers-report-pdf';
        if(getLoginUserLanguage() == 'ar'){
            $pdf = PDF::loadView($pdfViewPath, compact('supplier', 'companyLogo', 'purchasesData'));
        }else{
            $pdf = CPDF::loadView($pdfViewPath, compact('supplier', 'companyLogo', 'purchasesData'));
        }
        Storage::disk(config('app.media_disc'))->put('pdf/suppliers-report-' . $supplier->id . '.pdf', $pdf->output());
        $data['suppliers_report_pdf_url'] = Storage::url('pdf/suppliers-report-' . $supplier->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }
}
