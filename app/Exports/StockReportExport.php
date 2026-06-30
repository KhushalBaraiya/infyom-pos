<?php

namespace App\Exports;

use App\Models\FiscalYear;
use App\Models\ManageStock;
use Maatwebsite\Excel\Concerns\FromView;

class StockReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');

        $stocks = ManageStock::whereWarehouseId($warehouseId)->with('product', 'warehouse');

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $stocks->whereDate('created_at', '>=', $fiscalYear->start_date)
                    ->whereDate('created_at', '<=', $fiscalYear->end_date);
            }
        }

        $stocks = $stocks->get();

        return view('excel.stock-report-excel', ['stocks' => $stocks]);
    }
}
