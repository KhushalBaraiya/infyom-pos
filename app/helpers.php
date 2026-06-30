<?php

use Anuzpandey\LaravelNepaliDate\LaravelNepaliDate;
use App\Models\Currency;
use App\Models\ManageStock;
use App\Models\Setting;
use App\Models\Store;
use App\Models\Supplier;
use App\Utils\SmsSender;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

if (! function_exists('getPageSize')) {
    /**
     * @return mixed
     */
    function getPageSize($request)
    {
        return $request->input('page.size', 10);
    }
}

if (! function_exists('getLogoUrl')) {
    function getLogoUrl(): string
    {
        static $appLogo;

        if (empty($appLogo)) {
            $appLogo = Setting::where('key', '=', 'logo')->first();
        }

        return $appLogo ? asset($appLogo->logo) : asset('images/infycare-logo.png');
    }
}

if (! function_exists('getSettingValue')) {
    /**
     * @return mixed
     */
    function getSettingValue($keyName)
    {
        $key = 'setting' . '-' . $keyName;

        static $settingValues;

        if (isset($settingValues[$key])) {
            return $settingValues[$key];
        }

        /** @var Setting $setting */
        $setting = Setting::where('key', '=', $keyName)->first();
        $settingValues[$key] = $setting->value ?? null;

        return $settingValues[$key];
    }
}

if (! function_exists('getTenantSettingValue')) {
    /**
     * @return mixed
     */
    function getTenantSettingValue($keyName)
    {
        $key = 'setting' . '-' . $keyName;

        static $settingValues;

        if (isset($settingValues[$key])) {
            return $settingValues[$key];
        }

        /** @var Setting $setting */
        $setting = Setting::where('tenant_id', '=', Auth::user()->tenant_id)->where('key', '=', $keyName)->first();
        $settingValues[$key] = $setting->value ?? null;

        return $settingValues[$key];
    }
}

if (! function_exists('isFiscalYearFilterEnabled')) {
    function isFiscalYearFilterEnabled(): bool
    {
        return getTenantSettingValue('enable_fiscal_year_filter') == '1';
    }
}

if (! function_exists('sendSms')) {
    /**
     * Send SMS using configured provider
     *
     * @param string $to
     * @param string $message
     * @return bool
     */
    function sendSms(string $to, string $message): bool
    {
        return SmsSender::send($to, $message);
    }
}

function canDelete(array $models, string $columnName, int $id): bool
{
    foreach ($models as $model) {
        $result = $model::where($columnName, $id)->exists();

        if ($result) {
            return true;
        }
    }

    return false;
}

function getCurrencyCode()
{
    $currencyId = Setting::where('key', '=', 'currency')->first()->value;

    return Currency::whereId($currencyId)->first()->symbol;
}

function getLoginUserLanguage(): string
{
    return \Illuminate\Support\Facades\Auth::user()->language;
}

if (! function_exists('manageStock')) {
    /**
     * @param $request
     * @return mixed
     */
    function manageStock($warehouseID, $productID, $qty = 0)
    {
        $product = ManageStock::whereWarehouseId($warehouseID)
            ->whereProductId($productID)
            ->first();

        if ($product) {
            $totalQuantity = $product->quantity + $qty;

            if (($product->quantity + $qty) < 0) {
                $totalQuantity = 0;
            }
            $product->update([
                'quantity' => $totalQuantity,
            ]);
        } else {
            if ($qty < 0) {
                $qty = 0;
            }

            ManageStock::create([
                'warehouse_id' => $warehouseID,
                'product_id' => $productID,
                'quantity' => $qty,
            ]);
        }
    }
}

if (! function_exists('keyExist')) {
    function keyExist($key)
    {
        $exists = Setting::where('key', $key)->exists();

        return $exists;
    }
}

function getSupplierGrandTotalFilterIds($search)
{
    $supplierData = Supplier::with('purchases')->get();
    $ids = [];
    foreach ($supplierData as $key => $supplier) {
        $value = $supplier->purchases->sum('grand_total');
        if ($search != '') {
            if ($value == $search) {
                $ids[] = $supplier->id;
            }
        }
    }

    return $ids;
}

if (! function_exists('replaceArrayValue')) {
    function replaceArrayValue(&$array, $key, $replaceValue)
    {
        foreach ($array as $index => $value) {
            if (is_array($value)) {
                $array[$index] = replaceArrayValue($value, $key, $replaceValue);
            }
            if ($index == $key) {
                $array[$index] = $replaceValue;
            }
        }

        return $array;
    }
}

if (! function_exists('getLogo')) {
    function getLogo()
    {
        /** @var Setting $setting */
        $logoImage = Setting::where('key', '=', 'logo')->first()->value;

        $logo = '';
        if (File::exists(asset($logoImage))) {
            $logo = base64_encode(file_get_contents(asset($logoImage)));
        }

        return 'data:image/png;base64,' . $logo;
    }
}


if (! function_exists('currencyAlignment')) {
    function currencyAlignment($amount)
    {
        if ($amount === null || $amount === '') {
            $amount = 0;
        }

        // Clean amount (remove commas, spaces etc.)
        $amount = preg_replace('/[^\d.-]/', '', $amount);
        $amount = (float) $amount; // convert to float safely

        // Settings maps
        $thousandsMap = [
            1 => ".",
            2 => ",",
            3 => " ",
            4 => "",
        ];

        $decimalMap = [
            1 => ".",
            2 => ",",
        ];

        // Get settings
        $decimal_places     = (int) (getSettingValue('decimal_places') ?? 2);
        $decimal_separator  = (int) (getSettingValue('decimal_separator') ?? 1);
        $thousands_separator = (int) (getSettingValue('thousands_separator') ?? 2);

        $decimalSep  = $decimalMap[$decimal_separator] ?? ".";
        $thousandSep = $thousandsMap[$thousands_separator] ?? ",";

        // Format number
        $formatted = number_format($amount, $decimal_places, $decimalSep, $thousandSep);

        // Currency placement
        if (getSettingValue('is_currency_right') != 1) {
            return getCurrencyCode() . ' ' . $formatted;
        }

        return $formatted . ' ' . getCurrencyCode();
    }
}

// if (! function_exists('currencyAlignment')) {
//     function currencyAlignment($amount)
//     {
//         if (getSettingValue('is_currency_right') != 1) {
//             return getCurrencyCode() . ' ' . $amount;
//         }

//         return $amount . ' ' . getCurrencyCode();
//     }
// }


if (! function_exists('currentTenantId')) {
    function currentTenantId()
    {
        if (Auth::check()) {
            return Auth::user()->tenant_id;
        }
        return null;
    }
}

if (!function_exists('getActiveStore')) {
    function getActiveStore()
    {
        if (Auth::check() && Auth::user()->tenant_id) {
            $tenantId = (int) Auth::user()->tenant_id;
            $key = 'stores.tenant.' . ($tenantId ?? 'guest');

            return Cache::remember(
                $key,
                now()->addMinutes(5),
                fn() => Store::where('tenant_id', $tenantId)->first()
            );
        }
        return null;
    }
}

if (! function_exists('getDefaultStore')) {
    function getDefaultStore()
    {
        return Cache::remember(
            'stores.default',
            now()->addMinutes(5),
            fn() => Store::where('is_default', true)->first()
        );
    }
}

if (! function_exists('clearStoreCache')) {
    function clearStoreCache(?int $tenantId = null): void
    {
        Cache::forget('stores.default');

        if ($tenantId !== null) {
            $key = 'stores.tenant.' . ($tenantId ?? 'guest');
            Cache::forget($key);
        }
    }
}

if (!function_exists('getActiveStoreName')) {
    function getActiveStoreName()
    {
        if ($store = getActiveStore()) {
            return $store->name ?? (getSettingValue('store_name') ?? null);
        }
        return getSettingValue('store_name') ?? null;
    }
}

if (!function_exists('getFormattedDate')) {
    function getFormattedDate($date)
    {
        $format = getSettingValue('date_format') ?? 'Y-m-d';

        if (empty($date)) {
            return '';
        }

        try {
            $carbonDate = \Carbon\Carbon::parse($date);
        } catch (\Exception $e) {
            return $date;
        }

        $enableNepali = getSettingValue('enable_nepali_datepicker') === "1" || getSettingValue('enable_nepali_datepicker') === true;

        if ($enableNepali) {
            $bsDate = LaravelNepaliDate::from($carbonDate->format('Y-m-d'))->toNepaliDate();

            [$y, $m, $d] = explode('-', $bsDate);

            $map = [
                'd-m-y' => "$d-$m-$y",
                'm-d-y' => "$m-$d-$y",
                'y-m-d' => "$y-$m-$d",
                'm/d/y' => "$m/$d/$y",
                'd/m/y' => "$d/$m/$y",
                'y/m/d' => "$y/$m/$d",
                'm.d.y' => "$m.$d.$y",
                'd.m.y' => "$d.$m.$y",
                'y.m.d' => "$y.$m.$d",
            ];

            return $map[$format] ?? $bsDate;
        }

        return $carbonDate->format($format);
    }
}
