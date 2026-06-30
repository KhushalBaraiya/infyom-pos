<?php

namespace App\Exports;

use App\Models\FiscalYear;
use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromView;

class SaleReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $startDate = request()->get('start_date');
        $endDate = request()->get('end_date');
        $userId = request()->get('user_id');

        $query = Sale::with(['saleItems', 'warehouse', 'customer', 'payments']);

        if ($startDate != 'null' && $endDate != 'null' && $startDate && $endDate) {
            $query = $query->whereDate('created_at', '>=', $startDate)
                ->whereDate('created_at', '<=', $endDate);
        }

        if ($userId != 'null' && $userId) {
            $query = $query->where('user_id', $userId);
        }

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $query->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        $sales = $query->get();

        return view('excel.all-sale-report-excel', ['sales' => $sales]);
    }
}
