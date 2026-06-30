<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromView;

class ProductExcelExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        if (isset(request()->id)) {
            $products = Product::with([
                'productCategory', 
                'brand', 
                'stock',
                'variationProduct.variation',
                'variationProduct.variationType'
            ])->where('product_unit', request()->id)->get();
        } else {
            $products = Product::with([
                'productCategory', 
                'brand', 
                'stock',
                'variationProduct.variation',
                'variationProduct.variationType'
            ])->get();
        }

        return view('excel.product-excel-export', ['products' => $products]);
    }
}
