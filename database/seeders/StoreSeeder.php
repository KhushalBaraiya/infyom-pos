<?php

namespace Database\Seeders;

use App\Models\MultiTenant;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ini_set('memory_limit', '1G');
        ini_set('max_execution_time', 300); // 5 minutes

        $admin = User::whereHas('roles', function ($query) {
            $query->where('name', Role::ADMIN);
        })->first();
        $allStores = Store::all();

        if ($admin && !$allStores->count()) {
            $setting = Setting::where('key', 'company_name')->first();
            $store = Store::create([
                'name' => $setting->value ?? 'My Store',
            ]);
            $tenant = MultiTenant::create(['store_id' => $store->id]);
            $store->update(['tenant_id' => $tenant->id]);
            $admin->update(['tenant_id' => $tenant->id]);

            $users = User::withWhereHas('roles', function ($query) {
                $query->where('name', '!=', Role::ADMIN);
            })->get();
            if ($users) {
                foreach ($users as $user) {
                    UserStore::create([
                        'user_id' => $user->id,
                        'store_id' => $store->id
                    ]);
                    $user->update(['tenant_id' => $tenant->id]);
                }
            }

            $adjustments = \App\Models\Adjustment::all();
            if ($adjustments) {
                foreach ($adjustments as $adjustment) {
                    $adjustment->update(['tenant_id' => $tenant->id]);
                }
            }

            $baseUnits = \App\Models\BaseUnit::all();
            if ($baseUnits) {
                foreach ($baseUnits as $baseUnit) {
                    $baseUnit->update(['tenant_id' => $tenant->id]);
                }
            }

            $brands = \App\Models\Brand::all();
            if ($brands) {
                foreach ($brands as $brand) {
                    $brand->update(['tenant_id' => $tenant->id]);
                }
            }

            $customers = \App\Models\Customer::all();
            if ($customers) {
                foreach ($customers as $customer) {
                    $customer->update(['tenant_id' => $tenant->id]);
                }
            }

            $expenseCategories = \App\Models\ExpenseCategory::all();
            if ($expenseCategories) {
                foreach ($expenseCategories as $expenseCategory) {
                    $expenseCategory->update(['tenant_id' => $tenant->id]);
                }
            }

            $mailTemplates = \App\Models\MailTemplate::all();
            if ($mailTemplates) {
                foreach ($mailTemplates as $mailTemplate) {
                    $mailTemplate->update(['tenant_id' => $tenant->id]);
                }
            }

            $mainProducts = \App\Models\MainProduct::all();
            if ($mainProducts) {
                foreach ($mainProducts as $mainProduct) {
                    $mainProduct->update(['tenant_id' => $tenant->id]);
                }
            }

            $posRegisters = \App\Models\POSRegister::all();
            if ($posRegisters) {
                foreach ($posRegisters as $posRegister) {
                    $posRegister->update(['tenant_id' => $tenant->id]);
                }
            }

            $products = \App\Models\Product::all();
            if ($products) {
                foreach ($products as $product) {
                    $product->update(['tenant_id' => $tenant->id]);
                }
            }

            $productCategories = \App\Models\ProductCategory::all();
            if ($productCategories) {
                foreach ($productCategories as $productCategory) {
                    $productCategory->update(['tenant_id' => $tenant->id]);
                }
            }

            $quotations = \App\Models\Quotation::all();
            if ($quotations) {
                foreach ($quotations as $quotation) {
                    $quotation->update(['tenant_id' => $tenant->id]);
                }
            }

            $sales = \App\Models\Sale::all();
            if ($sales) {
                foreach ($sales as $sale) {
                    $sale->update(['tenant_id' => $tenant->id]);
                }
            }

            $settings = \App\Models\Setting::all();
            if ($settings) {
                foreach ($settings as $setting) {
                    $setting->update(['tenant_id' => $tenant->id]);
                }
            }

            $smsSettings = \App\Models\SmsSetting::all();
            if ($smsSettings) {
                foreach ($smsSettings as $smsSetting) {
                    $smsSetting->update(['tenant_id' => $tenant->id]);
                }
            }

            $smsTemplates = \App\Models\SmsTemplate::all();
            if ($smsTemplates) {
                foreach ($smsTemplates as $smsTemplate) {
                    $smsTemplate->update(['tenant_id' => $tenant->id]);
                }
            }

            $suppliers = \App\Models\Supplier::all();
            if ($suppliers) {
                foreach ($suppliers as $supplier) {
                    $supplier->update(['tenant_id' => $tenant->id]);
                }
            }

            $transfers = \App\Models\Transfer::all();
            if ($transfers) {
                foreach ($transfers as $transfer) {
                    $transfer->update(['tenant_id' => $tenant->id]);
                }
            }

            $units = \App\Models\Unit::all();
            if ($units) {
                foreach ($units as $unit) {
                    $unit->update(['tenant_id' => $tenant->id]);
                }
            }

            $variations = \App\Models\Variation::all();
            if ($variations) {
                foreach ($variations as $variation) {
                    $variation->update(['tenant_id' => $tenant->id]);
                }
            }

            $warehouses = \App\Models\Warehouse::all();
            if ($warehouses) {
                foreach ($warehouses as $warehouse) {
                    $warehouse->update(['tenant_id' => $tenant->id]);
                }
            }

            $taxes = \App\Models\Tax::all();
            if ($taxes) {
                foreach ($taxes as $tax) {
                    $tax->update(['tenant_id' => $tenant->id]);
                }
            }
        }
    }
}
