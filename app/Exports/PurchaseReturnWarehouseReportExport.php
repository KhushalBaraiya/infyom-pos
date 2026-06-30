<?php

namespace App\Exports;

use App\Models\FiscalYear;
use App\Models\PurchaseReturn;
use Maatwebsite\Excel\Concerns\FromView;

class PurchaseReturnWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');
        $supplierId = request()->get('supplier_id');
        if (isset($warehouseId) && $warehouseId != 'null') {
            $purchaseReturns = PurchaseReturn::whereWarehouseId($warehouseId)->with('warehouse', 'supplier');
        } elseif (isset($supplierId) && $supplierId != 'null') {
            $purchaseReturns = PurchaseReturn::whereSupplierId($supplierId)->with('warehouse', 'supplier');
        } else {
            $purchaseReturns = PurchaseReturn::with('warehouse', 'supplier');
        }

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $purchaseReturns->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        $purchaseReturns = $purchaseReturns->get();

        return view('excel.purchase-return-report-excel', ['purchaseReturns' => $purchaseReturns]);
    }
}
