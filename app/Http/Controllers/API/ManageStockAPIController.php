<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ManageStockCollection;
use App\Http\Resources\ManageStockResource;
use App\Models\FiscalYear;
use App\Repositories\ManageStockRepository;
use Illuminate\Http\Request;

/**
 * Class UserAPIController
 */
class ManageStockAPIController extends AppBaseController
{
    private $manageStockRepository;

    public function __construct(ManageStockRepository $manageStockRepository)
    {
        $this->manageStockRepository = $manageStockRepository;
    }

    public function stockReport(Request $request): ManageStockCollection
    {
        $request->request->remove('filter');
        $perPage = getPageSize($request);
        $search = $request->get('search');
        $warehouseId = $request->get('warehouse_id');

        $query = $this->manageStockRepository->newQuery();

        $query->where('warehouse_id', $warehouseId);

        if ($search && $search !== 'null') {
            $query->whereHas('product.productCategory', function ($q) use ($search) {
                $q->where('products.code', 'like', '%'.$search.'%')
                        ->orWhere('products.name', 'like', '%'.$search.'%')
                        ->orWhere('products.product_cost', 'like', '%'.$search.'%')
                        ->orWhere('products.product_price', 'like', '%'.$search.'%')
                        ->orWhere('products.product_price', 'like', '%'.$search.'%')
                        ->orWhere('product_categories.name', 'like', '%'.$search.'%');
            });
        }

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->get('fiscal_year_id');

            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId !== 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $query->whereDate('created_at', '>=', $fiscalYear->start_date)
                    ->whereDate('created_at', '<=', $fiscalYear->end_date);
            }
        }

        $stocks = $query->paginate($perPage);

        ManageStockResource::usingWithCollection();

        return new ManageStockCollection($stocks);
    }
}
