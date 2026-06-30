<?php

namespace App\Exports;

use App\Models\Expense;
use App\Models\FiscalYear;
use Maatwebsite\Excel\Concerns\FromView;

class ExpenseWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');

        $query = Expense::with('warehouse', 'expenseCategory', 'user')->has('warehouse');

        if (isset($warehouseId) && $warehouseId != 'null') {
            $query->whereWarehouseId($warehouseId);
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

        $expenses = $query->with([
            'warehouse',
            'expenseCategory',
            'user' => function ($query) {
                $query->withoutGlobalScope('tenant');
            }
        ])->get();

        return view('excel.expense-report-excel', ['expenses' => $expenses]);
    }
}
