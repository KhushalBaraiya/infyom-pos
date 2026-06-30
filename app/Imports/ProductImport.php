<?php

namespace App\Imports;

use App\Models\BaseUnit;
use App\Models\Brand;
use App\Models\MainProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\Warehouse;
use App\Models\Variation;
use App\Models\VariationType;
use App\Models\VariationProduct;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Picqer\Barcode\BarcodeGeneratorPNG;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ProductImport implements ToCollection, WithChunkReading, WithStartRow, WithValidation
{
    public function collection(Collection $rows): void
    {
        $collection = $rows->toArray();
        ini_set('max_execution_time', 36000000);
        foreach ($collection as $key => $row) {
            try {
                DB::beginTransaction();

                $taxType = null;

                // Determine product type based on variation columns first
                $isVariationProduct = !empty($row[18]) || !empty($row[19]);

                // For variation products, only check product code uniqueness
                // For single products, check both name and code uniqueness
                if (!$isVariationProduct) {
                    $productName = Product::whereName($row[0])->exists();
                    if ($productName) {
                        throw new UnprocessableEntityHttpException('Product Name ' . $row[0] . ' is already exist.');
                    }
                }
                
                $productCode = Product::Where('code', $row[1])->exists();
                if ($productCode) {
                    throw new UnprocessableEntityHttpException('Product Code ' . $row[1] . ' is already exist.');
                }

                $productCategory = ProductCategory::whereName($row[2])->first();
                $brand = Brand::whereName($row[3])->first();

                $baseUnit = BaseUnit::whereName(strtolower($row[7]))->first();

                if ($baseUnit) {
                    $productUnitId = $baseUnit->id;
                } else {
                    throw new UnprocessableEntityHttpException('Product unit ' . $row[7] . ' is not found.');
                }

                $saleUnit = Unit::whereName(strtolower($row[8]))->whereBaseUnit($productUnitId)->first();
                $purchaseUnit = Unit::whereName(strtolower($row[9]))->whereBaseUnit($productUnitId)->first();
                if (!$saleUnit) {
                    throw new UnprocessableEntityHttpException('Sale unit ' . $row[8] . ' is not found.');
                }
                if (!$purchaseUnit) {
                    throw new UnprocessableEntityHttpException('Purchase unit ' . $row[9] . ' is not found.');
                }

                if ($productCategory) {
                    $productCategoryId = $productCategory->id;
                } else {
                    $productCategory = ProductCategory::create(['name' => $row[2]]);
                    $productCategoryId = $productCategory->id;
                }

                if ($brand) {
                    $brandId = $brand->id;
                } else {
                    $brand = Brand::create(['name' => $row[3]]);
                    $brandId = $brand->id;
                }

                if ($row[4] == 'CODE128') {
                    $barcodeSymbol = 1;
                } elseif ($row[4] == 'CODE39') {
                    $barcodeSymbol = 2;
                } else {
                    throw new UnprocessableEntityHttpException('Product barcode symbol ' . $row[4] . ' is not found.');
                }

                if (strtolower($row[12]) == 'exclusive') {
                    $taxType = 1;
                } elseif (strtolower($row[12]) == 'inclusive') {
                    $taxType = 2;
                } else {
                    throw new UnprocessableEntityHttpException('Tax type ' . $row[12] . ' is not found.');
                }

                // Product type already determined above
                $productType = $isVariationProduct ? MainProduct::VARIATION_PRODUCT : MainProduct::SINGLE_PRODUCT;

                // Check if MainProduct already exists for variation products
                $mainProduct = null;
                if ($isVariationProduct && !empty($row[18])) {
                    $mainProduct = MainProduct::where('name', $row[0])
                        ->where('product_type', MainProduct::VARIATION_PRODUCT)
                        ->first();
                }

                if (!$mainProduct) {
                    $mainProduct = MainProduct::create([
                        'name' => $row[0],
                        'code' => (string) $row[1],
                        'product_unit' => $productUnitId,
                        'product_type' => $productType,
                    ]);
                }

                $productData = [
                    'name' => $row[0],
                    'code' => (string) $row[1],
                    'product_code' => (string) $row[1],
                    'product_category_id' => $productCategoryId,
                    'brand_id' => $brandId,
                    'barcode_symbol' => $barcodeSymbol,
                    'product_cost' => $row[5],
                    'product_price' => $row[6],
                    'product_unit' => $productUnitId,
                    'sale_unit' => !empty($saleUnit) ? $saleUnit->id : null,
                    'purchase_unit' => !empty($purchaseUnit) ? $purchaseUnit->id : null,
                    'stock_alert' => isset($row[10]) ? $row[10] : null,
                    'order_tax' => isset($row[11]) ? $row[11] : null,
                    'tax_type' => $taxType,
                    'notes' => isset($row[13]) ? $row[13] : null,
                    'main_product_id' => $mainProduct->id,
                ];

                $product = Product::create($productData);

                // Handle variation product creation
                if ($isVariationProduct && !empty($row[18]) && !empty($row[19])) {
                    // Find or create variation
                    $variation = Variation::firstOrCreate(['name' => $row[18]]);
                    
                    // Find or create variation type
                    $variationType = VariationType::firstOrCreate([
                        'name' => $row[19],
                        'variation_id' => $variation->id
                    ]);
                    
                    // Create variation product relationship
                    VariationProduct::create([
                        'main_product_id' => $mainProduct->id,
                        'product_id' => $product->id,
                        'variation_id' => $variation->id,
                        'variation_type_id' => $variationType->id,
                    ]);
                }

                $reference_code = 'PR_' . $product->id;

                if (!empty($row[14]) || !empty($row[15]) || !empty($row[16])) {
                    if (empty($row[14])) {
                        throw new UnprocessableEntityHttpException('Warehouse name is required if you want to import quantity.');
                    }
                    if (empty($row[15])) {
                        throw new UnprocessableEntityHttpException('Supplier name is required if you want to import quantity.');
                    }
                    if (empty($row[16])) {
                        throw new UnprocessableEntityHttpException('Quantity is required if you want to import stock.');
                    }

                    $purchaseStock = [
                        'warehouse' => trim($row[14]),
                        'supplier' => trim($row[15]),
                        'quantity' => trim($row[16]),
                    ];
                    $warehouse = Warehouse::whereRaw('LOWER(name) = ?', [strtolower($purchaseStock['warehouse'])])->first();
                    $supplier = Supplier::whereRaw('LOWER(name) = ?', [strtolower($purchaseStock['supplier'])])->first();

                    if (!$warehouse) {
                        throw new UnprocessableEntityHttpException('Warehouse ' . $purchaseStock['warehouse'] . ' is not found.');
                    }
                    if (!$supplier) {
                        throw new UnprocessableEntityHttpException('Supplier ' . $purchaseStock['supplier'] . ' is not found.');
                    }

                    manageStock($warehouse->id, $product->id, $purchaseStock['quantity']);
                    $status = isset($row[17]) ? trim($row[17]) : 'received';
                    if ($status == 'received') {
                        $status = 1;
                    } elseif ($status == 'ordered') {
                        $status = 3;
                    } else {
                        $status = 2;
                    }

                    $purchaseInputArray = [
                        'supplier_id' => $supplier->id,
                        'warehouse_id' => $warehouse->id,
                        'date' => Carbon::now()->format('Y-m-d'),
                        'status' => $status,
                    ];

                    $purchase = Purchase::create($purchaseInputArray);

                    $purchaseItemInputs = [
                        'purchase_id' => $purchase->id,
                        'product_id' => $product->id,
                        'product_cost' => $product->product_cost,
                        'net_unit_cost' => $product->product_cost,
                        'tax_type' => $product->tax_type,
                        'tax_value' => $product->order_tax,
                        'tax_amount' => 0,
                        'discount_type' => Purchase::FIXED,
                        'discount_value' => 0,
                        'discount_amount' => 0,
                        'purchase_unit' => $product->purchase_unit,
                        'quantity' => $purchaseStock['quantity'],
                        'sub_total' => $product->product_cost * $purchaseStock['quantity'],
                    ];

                    PurchaseItem::create($purchaseItemInputs);

                    $purchase->update([
                        'reference_code' => getSettingValue('purchase_code') . '_111' . $purchase->id,
                        'grand_total' => $purchaseItemInputs['sub_total'],
                    ]);
                }

                $barcodeType = null;
                $generator = new BarcodeGeneratorPNG();
                switch ($barcodeSymbol) {
                    case Product::CODE128:
                        $barcodeType = $generator::TYPE_CODE_128;
                        break;
                    case Product::CODE39:
                        $barcodeType = $generator::TYPE_CODE_39;
                        break;
                    case Product::EAN8:
                        $barcodeType = $generator::TYPE_EAN_8;
                        break;
                    case Product::EAN13:
                        $barcodeType = $generator::TYPE_EAN_13;
                        break;
                    case Product::UPC:
                        $barcodeType = $generator::TYPE_UPC_A;
                        break;
                }

                Storage::disk(config('app.media_disc'))->put(
                    'product_barcode/barcode-' . $reference_code . '.png',
                    $generator->getBarcode($row[1], $barcodeType, 4, 70)
                );

                DB::commit();
            } catch (Exception $e) {
                DB::rollBack();
                throw new UnprocessableEntityHttpException($e->getMessage());
            }
        }
    }

    public function chunkSize(): int
    {
        return 1;
    }

    public function startRow(): int
    {
        return 2;
    }

    public function rules(): array
    {
        return [
            '0' => 'required',
            '1' => 'required',
            '2' => 'required',
            '3' => 'required',
            '4' => 'required',
            '5' => 'required|numeric',
            '6' => 'required|numeric',
            '7' => 'required',
            '8' => 'required',
            '9' => 'required',
            '10' => 'nullable|numeric',
            '11' => 'nullable|numeric',
            '12' => 'required',
            '18' => 'nullable|string', // Variation name
            '19' => 'nullable|string', // Variation type name
        ];
    }

    public function customValidationMessages()
    {
        return [
            '0.required' => 'Name field is required',
            '1.required' => 'Code field is required',
            '2.required' => 'Category field is required',
            '3.required' => 'Brand field is required',
            '4.required' => 'Barcode symbol field is required',
            '5.required' => 'Product cost field is required',
            '5.numeric' => 'Product cost field must be a number',
            '6.required' => 'Product price is required',
            '6.numeric' => 'Product price field must be a number',
            '7.required' => 'Product unit field is required',
            '8.required' => 'Sale unit field is required',
            '9.required' => 'Purchase unit field is required',
            '10.nullable|numeric' => 'Stock alert field must be a number',
            '11.nullable|numeric' => 'Order tax percentage must be a number',
            '12.required' => 'Tax type field is required',
            '18.string' => 'Variation name must be a string',
            '19.string' => 'Variation type name must be a string',
        ];
    }
}
