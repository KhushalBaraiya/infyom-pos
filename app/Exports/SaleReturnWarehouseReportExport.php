<?php

namespace App\Exports;

use App\Models\FiscalYear;
use App\Models\SaleReturn;
use Maatwebsite\Excel\Concerns\FromView;

class SaleReturnWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');
        if (isset($warehouseId) && $warehouseId != 'null') {
            $saleReturns = SaleReturn::whereWarehouseId($warehouseId)->with('warehouse', 'customer');
        } else {
            $saleReturns = SaleReturn::with('warehouse', 'customer');
        }

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $saleReturns->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        $saleReturns = $saleReturns->get();

        return view('excel.sale-return-report-excel', ['saleReturns' => $saleReturns]);
    }
}
