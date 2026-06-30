<?php

namespace App\Exports;

use App\Models\FiscalYear;
use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromView;

class SalesWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');
        if (isset($warehouseId) && $warehouseId != 'null') {
            $sales = Sale::whereWarehouseId($warehouseId)->with('warehouse', 'customer');
        } else {
            $sales = Sale::with('warehouse', 'customer');
        }

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $sales->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        $sales = $sales->get();

        return view('excel.sale-report-excel', ['sales' => $sales]);
    }
}
