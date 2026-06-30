<?php

namespace App\Exports;

use App\Models\FiscalYear;
use App\Models\Product;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromView;

class TopSellingProductReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $hasDateRange = request()->get('start_date') && request()->get('start_date') && request()->get('start_date') != 'null' && request()->get('start_date') != 'null';

        if ($hasDateRange) {
            $startDate = Carbon::parse(request()->get('start_date'))->toDateTimeString();
            $endDate = Carbon::parse(request()->get('end_date'))->toDateTimeString();
            $topSelling = Product::leftJoin('sale_items', 'products.id', '=', 'sale_items.product_id')
                ->whereDate('sale_items.created_at', '>=', $startDate)
                ->whereDate('sale_items.created_at', '<=', $endDate)
                ->selectRaw('products.*, COALESCE(sum(sale_items.sub_total),0) grand_total')
                ->selectRaw('products.*, COALESCE(sum(sale_items.quantity),0) total_quantity')
                ->groupBy('products.id')
                ->orderBy('total_quantity', 'desc')
                ->latest();
        } else {
            $topSelling = Product::leftJoin('sale_items', 'products.id', '=', 'sale_items.product_id')
                ->selectRaw('products.*, COALESCE(sum(sale_items.sub_total),0) grand_total')
                ->selectRaw('products.*, COALESCE(sum(sale_items.quantity),0) total_quantity')
                ->groupBy('products.id')
                ->orderBy('total_quantity', 'desc')
                ->latest();
        }

        $fiscalYear = null;
        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();
        }

        if (!$hasDateRange && $fiscalYear) {
            $topSelling->whereDate('sale_items.created_at', '>=', $fiscalYear->start_date)
                ->whereDate('sale_items.created_at', '<=', $fiscalYear->end_date);
        }

        $topSelling = $topSelling->get();

        $topSellingProducts = [];
        foreach ($topSelling as $topSelling) {
            $topSellingProducts[] = $topSelling->prepareTopSellingReport();
            // if ($topSelling->total_quantity != 0) {
            // }
        }

        return view('excel.top-selling-product-report-excel', ['topSellingProducts' => $topSellingProducts]);
    }
}
