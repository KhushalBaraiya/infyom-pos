<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Http\Resources\WarehouseCollection;
use App\Http\Resources\WarehouseResource;
use App\Models\FiscalYear;
use App\Models\ManageStock;
use App\Models\Purchase;
use App\Models\PurchaseReturn;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Repositories\WarehouseRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prettus\Validator\Exceptions\ValidatorException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class WarehouseAPIController
 */
class WarehouseAPIController extends AppBaseController
{
    /**
     * @var WarehouseRepository
     */
    private $warehouseRepository;

    public function __construct(WarehouseRepository $warehouseRepository)
    {
        $this->warehouseRepository = $warehouseRepository;
    }

    public function index(Request $request): WarehouseCollection
    {
        $perPage = getPageSize($request);
        $warehouses = $this->warehouseRepository->paginate($perPage);
        WarehouseResource::usingWithCollection();

        return new WarehouseCollection($warehouses);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateWarehouseRequest $request): WarehouseResource
    {
        $input = $request->all();
        $warehouse = $this->warehouseRepository->create($input);

        return new WarehouseResource($warehouse);
    }

    public function warehouseDetails($id)
    {
        $warehouses = ManageStock::where('warehouse_id', $id)->with('product')->get();

        $products = [];

        foreach ($warehouses as $warehouse) {
            $products[] = $warehouse->prepareWarehouseAttributes();
        }

        return $this->sendResponse($products, 'Products Retrived Successfully');
    }

    public function show($id): WarehouseResource
    {
        $warehouse = $this->warehouseRepository->find($id);

        return new WarehouseResource($warehouse);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateWarehouseRequest $request, $id): WarehouseResource
    {
        $input = $request->all();
        $warehouse = $this->warehouseRepository->update($input, $id);

        return new WarehouseResource($warehouse);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        try {
            if (count($ids) === 1) {
                DB::beginTransaction();

                if (getSettingValue('default_warehouse') == $ids[0]) {
                    return $this->sendError(__('messages.error.default_warehouse_cant_delete'));
                }

                if ($this->warehouseRepository->warehouseCanDelete($ids[0])) {
                    return $this->sendError(__('messages.error.warehouse_cant_delete'));
                }

                $this->warehouseRepository->delete($ids[0]);
                DB::commit();
                return $this->sendSuccess('Warehouse deleted successfully');
            }

            $cannotDelete = [];
            foreach ($ids as $id) {
                DB::beginTransaction();

                if (getSettingValue('default_warehouse') == $id || $this->warehouseRepository->warehouseCanDelete($id)) {
                    $cannotDelete[] = [
                        'id' => $id,
                        'name' => $this->warehouseRepository->find($id)->name ?? 'Unnamed Warehouse'
                    ];
                    DB::rollBack();
                    continue;
                }

                $this->warehouseRepository->delete($id);
                DB::commit();
            }

            return $this->sendResponse([
                'show_model' => count($cannotDelete) > 0,
                'ids' => $cannotDelete,
            ], 'Warehouse delete process completed.');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
        // if (getSettingValue('default_warehouse') == $id) {
        //     return $this->SendError(__('messages.error.default_warehouse_cant_delete'));
        // }

        // $useWarehouse = $this->warehouseRepository->warehouseCanDelete($id);
        // if ($useWarehouse) {
        //     return $this->sendError(__('messages.error.warehouse_cant_delete'));
        // }
        // $this->warehouseRepository->delete($id);

        // return $this->sendSuccess('Warehouse deleted successfully');
    }

    public function warehouseReport(Request $request)
    {
        $report = [];

        $fiscalYear = null;
        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));

            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();
        }

        $sales = Sale::query();
        $purchases = Purchase::query();
        $saleReturns = SaleReturn::query();
        $purchaseReturns = PurchaseReturn::query();

        if ($fiscalYear) {
            $sales->whereDate('date', '>=', $fiscalYear->start_date)->whereDate('date', '<=', $fiscalYear->end_date);

            $purchases->whereDate('date', '>=', $fiscalYear->start_date)->whereDate('date', '<=', $fiscalYear->end_date);

            $saleReturns->whereDate('date', '>=', $fiscalYear->start_date)->whereDate('date', '<=', $fiscalYear->end_date);

            $purchaseReturns->whereDate('date', '>=', $fiscalYear->start_date)->whereDate('date', '<=', $fiscalYear->end_date);
        }

        if ($request->get('warehouse_id') && !empty($request->get('warehouse_id')) && $request->get('warehouse_id') != 'null') {
            $warehouseId = $request->get('warehouse_id');

            $sales->whereWarehouseId($warehouseId);
            $purchases->whereWarehouseId($warehouseId);
            $saleReturns->whereWarehouseId($warehouseId);
            $purchaseReturns->whereWarehouseId($warehouseId);
        }

        $report['sale_count'] = $sales->count();
        $report['purchase_count'] = $purchases->count();
        $report['sale_return_count'] = $saleReturns->count();
        $report['purchase_return_count'] = $purchaseReturns->count();

        return $this->sendResponse($report, '');
    }
}
