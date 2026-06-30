<?php

namespace App\Exports;

use App\Models\FiscalYear;
use App\Models\Purchase;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromView;

class PurchaseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $startDate = request()->get('start_date');
        $endDate = request()->get('end_date');

        $purchases = Purchase::with(['purchaseItems', 'warehouse', 'supplier']);

        $hasCustomDate =
            filled($startDate) &&
            filled($endDate) &&
            $startDate !== 'null' &&
            $endDate !== 'null';

        if ($hasCustomDate) {
            $purchases->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);
        } elseif (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');

            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId !== 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $purchases->whereBetween('date', [
                    Carbon::parse($fiscalYear->start_date)->startOfDay(),
                    Carbon::parse($fiscalYear->end_date)->endOfDay(),
                ]);
            }
        }

        $purchases = $purchases->latest()->get();

        return view('excel.all-purchase-report-excel', ['purchases' => $purchases]);
    }
}
