<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\FiscalYearCollection;
use App\Http\Resources\FiscalYearResource;
use App\Http\Resources\SettingResource;
use App\Models\Country;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\FiscalYear;
use App\Models\Setting;
use App\Models\State;
use App\Models\Store;
use App\Models\Warehouse;
use App\Models\PaymentMethod;
use App\Repositories\SettingRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Class SettingAPIController
 */
class SettingAPIController extends AppBaseController
{
    /** @var SettingRepository */
    private $settingRepository;

    public function __construct(SettingRepository $productRepository)
    {
        $this->settingRepository = $productRepository;
    }

    public function index(Request $request): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        $settings['logo'] = getLogoUrl();
        $activeStoreName = getActiveStoreName();
        $settings['store_name'] = $activeStoreName ?: ($settings['store_name'] ?? null);
        $settings['add_stock_while_product_creation'] = isset($settings['add_stock_while_product_creation']) ? $settings['add_stock_while_product_creation'] : '1';
        $settings['warehouse_name'] = Warehouse::whereId($settings['default_warehouse'])->first()->name ?? '';
        $settings['customer_name'] = Customer::whereId($settings['default_customer'])->first()->name ?? '';
        $settings['currency_symbol'] = Currency::whereId($settings['currency'])->first()->symbol ?? '';
        $settings['countries'] = Country::all();
        $settings['decimal_places'] = $settings['decimal_places'] ?? "2";
        $settings['thousands_separator'] = $settings['thousands_separator'] ?? "2";
        $settings['decimal_separator'] = $settings['decimal_separator'] ?? "1";
        $settings['receipt_other_font_style'] = $settings['receipt_other_font_style'] ?? 0;
        $settings['receipt_label_font_style'] = $settings['receipt_label_font_style'] ?? 1;
        $settings['receipt_margin'] = $settings['receipt_margin'] ?? 0;
        $settings['receipt_paper_size'] = $settings['receipt_paper_size'] ?? 1;
        $settings['receipt_thermal_size'] = $settings['receipt_thermal_size'] ?? 1;
        $settings['enable_nepali_datepicker'] = $settings['enable_nepali_datepicker'] ?? "0";
        $settings['enable_fiscal_year_filter'] = $settings['enable_fiscal_year_filter'] ?? "0";
        $settings['receipt_logo_font_style'] = $settings['receipt_logo_font_style'] ?? 2;
        $settings['receipt_logo_font_size'] = $settings['receipt_logo_font_size'] ?? 1;
        $settings['receipt_label_font_size'] = $settings['receipt_label_font_size'] ?? 0;
        $settings['receipt_other_font_size'] = $settings['receipt_other_font_size'] ?? 0;
        $settings['receipt_logo_font_color'] = $settings['receipt_logo_font_color'] ?? 0;
        $settings['receipt_label_font_color'] = $settings['receipt_label_font_color'] ?? 0;
        $settings['receipt_other_font_color'] = $settings['receipt_other_font_color'] ?? 0;
        $settings['enable_quick_payment'] = $settings['enable_quick_payment'] ?? false;
        $settings['quick_payment_method'] = $settings['quick_payment_method'] ?? PaymentMethod::first()?->id;
        $settings['pos_shortcut_f1'] = $settings['pos_shortcut_f1'] ?? 100;
        $settings['pos_shortcut_f2'] = $settings['pos_shortcut_f2'] ?? 200;
        $settings['pos_shortcut_f3'] = $settings['pos_shortcut_f3'] ?? 500;
        $settings['pos_shortcut_f4'] = $settings['pos_shortcut_f4'] ?? 1000;
        $settings['pos_shortcut_f5'] = $settings['pos_shortcut_f5'] ?? 2000;

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            'Setting data retrieved successfully.'
        );
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        $input = $request->all();
        $settings = $this->settingRepository->updateSettings($input);

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            'Setting data updated successfully'
        );
    }

    public function clearCache(): JsonResponse
    {
        Artisan::call('cache:clear');

        return $this->sendSuccess(__('messages.success.cache_clear_successfully'));
    }

    public function getFrontSettingsValue(): JsonResponse
    {
        $keyName = [
            'currency',
            'email',
            'company_name',
            'phone',
            'developed',
            'footer',
            'default_language',
            'default_customer',
            'default_warehouse',
            'address',
            'show_app_name_in_sidebar',
            'enable_nepali_datepicker'
        ];

        $settings = Setting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        $settings['logo'] = getLogoUrl();
        $settings['warehouse_name'] = Warehouse::whereId($settings['default_warehouse'])->first()->name ?? '';
        $settings['customer_name'] = Customer::whereId($settings['default_customer'])->first()->name ?? '';
        $settings['currency_symbol'] = Currency::whereId($settings['currency'])->first()->symbol ?? '';

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'value' => $settings]),
            'Setting value retrieved successfully.'
        );
    }

    public function getFrontCms(): JsonResponse
    {
        $store = getDefaultStore();
        $keyName = [
            'currency',
            'email',
            'company_name',
            'phone',
            'developed',
            'footer',
            'default_language',
            'default_customer',
            'default_warehouse',
            'address',
            'show_app_name_in_sidebar'
        ];

        if ($store) {
            $settings = Setting::where('tenant_id', $store->tenant_id)->whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        } else {
            $settings = Setting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        }
        $settings['logo'] = getLogoUrl();
        $settings['warehouse_name'] = Warehouse::whereId($settings['default_warehouse'])->first()->name ?? '';
        $settings['customer_name'] = Customer::whereId($settings['default_customer'])->first()->name ?? '';
        $settings['currency_symbol'] = Currency::whereId($settings['currency'])->first()->symbol ?? '';
        $settings['enable_nepali_datepicker'] = $settings['enable_nepali_datepicker'] ?? "0";

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'value' => $settings]),
            'Setting value retrieved successfully.'
        );
    }

    public function getStates($countryId): JsonResponse
    {
        $states = State::whereCountryId($countryId)->pluck('name');

        return $this->sendResponse(
            new SettingResource(['type' => 'states', 'value' => $states]),
            'States retrieved successfully.'
        );
    }

    public function getMailSettings()
    {
        $envData = $this->settingRepository->getEnvData();

        return $this->sendResponse($envData, 'Mail Credential Retrieved Successfully');
    }

    public function updateMailSettings(Request $request): JsonResponse
    {
        $request->validate([
            'mail_mailer',
            'mail_host',
            'mail_port',
            'mail_username',
            'mail_password',
            'mail_from_address',
            'mail_encryption',
        ]);
        $this->settingRepository->updateMailEnvSetting($request->all());

        Artisan::call('optimize:clear');
        Artisan::call('config:cache');

        return $this->sendSuccess('Mail Settings Save Successfully');
    }

    public function updateReceiptSetting(Request $request)
    {
        $settings = $this->settingRepository->updateReceiptSetting($request->all());

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            'Setting data updated successfully'
        );
    }

    public function getPosSettings(): JsonResponse
    {
        $getArray = [
            'enable_pos_click_audio',
            'click_audio',
            'show_pos_stock_product',
            'refresh_interval_seconds',
            'auto_refresh_products',
            'enable_quick_payment',
            'quick_payment_method',
            'pos_shortcut_f1',
            'pos_shortcut_f2',
            'pos_shortcut_f3',
            'pos_shortcut_f4',
            'pos_shortcut_f5',
        ];

        $settings = Setting::whereIn('key', $getArray)->pluck('value', 'key')->toArray();
        $settings['enable_pos_click_audio'] = $settings['enable_pos_click_audio'] ?? false;
        $settings['show_pos_stock_product'] = $settings['show_pos_stock_product'] ?? false;
        $settings['enable_quick_payment'] = $settings['enable_quick_payment'] ?? false;
        $settings['quick_payment_method'] = $settings['quick_payment_method'] ?? PaymentMethod::first()?->id;
        $settings['pos_shortcut_f1'] = $settings['pos_shortcut_f1'] ?? 100;
        $settings['pos_shortcut_f2'] = $settings['pos_shortcut_f2'] ?? 200;
        $settings['pos_shortcut_f3'] = $settings['pos_shortcut_f3'] ?? 500;
        $settings['pos_shortcut_f4'] = $settings['pos_shortcut_f4'] ?? 1000;
        $settings['pos_shortcut_f5'] = $settings['pos_shortcut_f5'] ?? 2000;
        if (!isset($settings['click_audio'])) {
            $settings['click_audio'] = asset('images/click_audio.mp3');
            Setting::updateOrCreate(['key' => 'click_audio'], ['value' => $settings['click_audio']]);
        }

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            'POS Setting data retrieved successfully.'
        );
    }

    public function updatePosSettings(Request $request): JsonResponse
    {
        $request->validate([
            'click_audio' => 'nullable|file|mimes:mp3,audio/mp3|max:2048',
        ]);

        $input = $request->all();
        $this->settingRepository->updatePosSettings($input);
        return $this->sendSuccess(__('messages.success.pos_settings_updated'));
    }

    public function getDualScreenSettings(): JsonResponse
    {
        $getArray = [
            'dual_screen_header_text',
            'dual_screen_images',
        ];

        $settings = Setting::whereIn('key', $getArray)->pluck('value', 'key')->toArray();
        if (isset($settings['dual_screen_images'])) {
            $settings['dual_screen_images'] = json_decode($settings['dual_screen_images'], true);
        } else {
            $settings['dual_screen_images'] = [];
        }
        $settings['dual_screen_header_text'] = $settings['dual_screen_header_text'] ?? null;

        return $this->sendResponse(
            new SettingResource(['type' => 'dual-screen', 'attributes' => $settings]),
            'POS Setting data retrieved successfully.'
        );
    }

    public function updateDualScreenSettings(Request $request): JsonResponse
    {
        $input = $request->all();
        $this->settingRepository->updateDualScreenSettings($input);
        return $this->sendSuccess(__('messages.success.dual_screen_settings_updated'));
    }

    public function sendTestEmail()
    {
        // Get the logged-in user's email
        $userEmail = auth()->user()->email;

        // Send test email to the logged-in user
        $this->settingRepository->sendTestEmail(['email' => $userEmail]);

        return $this->sendSuccess("Test email sent successfully to {$userEmail}");
    }

    public function backupDatabase(): JsonResponse|BinaryFileResponse
    {
        try {
            // Get database configuration
            $dbHost = config('database.connections.mysql.host');
            $dbPort = config('database.connections.mysql.port');
            $dbName = config('database.connections.mysql.database');
            $dbUser = config('database.connections.mysql.username');
            $dbPass = config('database.connections.mysql.password');

            // Create backup filename with timestamp
            $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
            $filepath = storage_path('app/backups/' . $filename);

            // Ensure backup directory exists
            if (!file_exists(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            // Try to find the mysqldump executable
            $mysqldumpPath = $this->findMysqldump();

            if (!$mysqldumpPath) {
                return $this->sendError('mysqldump command not found. Please install MySQL client tools.');
            }

            // Execute mysqldump command
            $command = "{$mysqldumpPath} --host={$dbHost} --port={$dbPort} --user={$dbUser} --password={$dbPass} {$dbName} > {$filepath}";

            $result = null;
            $output = [];
            exec($command . ' 2>&1', $output, $result);

            if ($result !== 0) {
                return $this->sendError('Database backup failed: ' . implode("\n", $output));
            }

            // Check if file was created
            if (!file_exists($filepath)) {
                return $this->sendError('Database backup file was not created');
            }

            // Return the file for download
            return response()->download($filepath, $filename);
        } catch (\Exception $e) {
            return $this->sendError('Database backup failed: ' . $e->getMessage());
        }
    }

    /**
     * Find the mysqldump executable in common locations
     */
    private function findMysqldump(): string|null
    {
        // Common locations for mysqldump on different systems
        $possiblePaths = [
            '/usr/bin/mysqldump',      // Standard Linux location
            '/usr/local/bin/mysqldump', // Homebrew on macOS
            '/opt/homebrew/bin/mysqldump', // Newer Homebrew on Apple Silicon
            '/Applications/MAMP/Library/bin/mysqldump', // MAMP on macOS
            '/Applications/XAMPP/bin/mysqldump', // XAMPP on macOS
            '/usr/local/mysql-9.5.0-macos15-x86_64/bin/mysqldump', // MySQL Community Server on macOS
            '/usr/local/mysql/bin/mysqldump', // MySQL installation on macOS
            'mysqldump', // In PATH
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path) && is_executable($path)) {
                return $path;
            }
        }

        // If not found in specific paths, try to locate using 'which'
        $whichOutput = [];
        $whichResult = null;
        exec('which mysqldump 2>/dev/null', $whichOutput, $whichResult);

        if ($whichResult === 0 && !empty($whichOutput[0])) {
            $path = trim($whichOutput[0]);
            if (file_exists($path) && is_executable($path)) {
                return $path;
            }
        }

        // Finally, try to execute directly (might work if in PATH)
        $testOutput = [];
        $testResult = null;
        exec('mysqldump --version 2>/dev/null', $testOutput, $testResult);

        if ($testResult === 0) {
            return 'mysqldump';
        }

        return null;
    }

    public function getFieldConfiguration(): JsonResponse
    {
        $keyName = [
            'customer_email_required',
            'customer_phone_number_required',
            'customer_dob_required', // false
            'customer_country_required',
            'customer_city_required',
            'customer_address_required',
            'supplier_email_required',
            'supplier_phone_number_required',
            'supplier_country_required',
            'supplier_city_required',
            'supplier_address_required',
        ];

        $settings = Setting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();

        foreach ($keyName as $key) {
            if (!isset($settings[$key])) {
                if ($key == 'customer_dob_required') {
                    $settings[$key] = false;
                } else {
                    $settings[$key] = true;
                }
            }
        }

        return $this->sendResponse(['type' => 'settings', 'value' => $settings], 'Field configuration retrieved successfully.');
    }

    public function updateFieldConfiguration(Request $request): JsonResponse
    {
        $request->validate([
            'customer_email_required' => 'nullable|boolean',
            'customer_phone_number_required' => 'nullable|boolean',
            'customer_dob_required' => 'nullable|boolean',
            'customer_country_required' => 'nullable|boolean',
            'customer_city_required' => 'nullable|boolean',
            'customer_address_required' => 'nullable|boolean',
            'supplier_email_required' => 'nullable|boolean',
            'supplier_phone_number_required' => 'nullable|boolean',
            'supplier_country_required' => 'nullable|boolean',
            'supplier_city_required' => 'nullable|boolean',
            'supplier_address_required' => 'nullable|boolean',
        ]);

        $input = $request->all();
        $this->settingRepository->updateFieldConfiguration($input);

        return $this->sendSuccess('Field configuration updated successfully.');
    }

    public function getFiscalYears(Request $request): FiscalYearCollection
    {
        $perPage = getPageSize($request);
        $search = $request->input('filter.search', $request->get('search'));

        $fiscalYears = FiscalYear::query()
            ->when(! empty($search), function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'LIKE', '%' . $search . '%');
                });
            })
            ->paginate($perPage);

        FiscalYearResource::usingWithCollection();

        return new FiscalYearCollection($fiscalYears);
    }
    public function updateFiscalYearFilterSetting(Request $request): JsonResponse
    {
        $request->validate([
            'enable_fiscal_year_filter' => 'required|boolean',
        ]);

        $input = $request->all();

        Setting::updateOrCreate(
            ['key' => 'enable_fiscal_year_filter'],
            ['value' => (int) $input['enable_fiscal_year_filter']]
        );

        return $this->sendResponse([
            'enable_fiscal_year_filter' => (bool) $input['enable_fiscal_year_filter'],
        ], 'Fiscal year filter setting updated successfully.');
    }

    public function createFiscalYear(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|unique:fiscal_year,name|max:255',
            'start_date' => 'required|date',
            'end_date' => [
                'required',
                'date',
                function ($attribute, $value, $fail) use ($request) {

                    if (! $request->filled('start_date')) {
                        return;
                    }

                    $startDate = Carbon::parse($request->start_date)->toDateString();

                    $endDate = Carbon::parse($value)->toDateString();

                    // Check fiscal year duration
                    $expectedEndDate = Carbon::parse($startDate)
                        ->addYear()
                        ->subDay()
                        ->toDateString();

                    if ($endDate !== $expectedEndDate) {
                        $fail("The {$attribute} must be one year minus one day after the start date.");
                        return;
                    }

                    // Check overlapping fiscal years
                    $isExists = FiscalYear::where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q) use ($startDate, $endDate) {
                                $q->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    })->exists();

                    if ($isExists) {
                        $fail('This fiscal year date range already exists or overlaps with another fiscal year.');
                    }
                },
            ],
            'is_active' => [
                'nullable',
                function ($attribute, $value, $fail) {

                    if ($value) {
                        $activeFiscalYearExists = FiscalYear::where('is_active', true)->exists();

                        if ($activeFiscalYearExists) {
                            $fail('Only one fiscal year can be active at a time.');
                        }
                    }
                },
            ],
        ]);

        $input = $request->all();

        $fiscalYear = $this->settingRepository->createFiscalYear($input);
        FiscalYearResource::usingWithCollection();

        return $this->sendResponse(new FiscalYearResource($fiscalYear), 'Fiscal year created successfully.');
    }

    public function updateActiveFiscalYear(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|exists:fiscal_year,id',
            'is_active' => 'required',
        ]);

        $input = $request->all();

        $fiscalYear = $this->settingRepository->updateActiveFiscalYear($input);
        FiscalYearResource::usingWithCollection();

        return $this->sendResponse(new FiscalYearResource($fiscalYear), 'Fiscal active updated successfully.');
    }
}
