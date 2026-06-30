<?php

namespace App\Repositories;

use App\DotenvEditor;
use App\Models\FiscalYear;
use App\Models\Setting;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SettingRepository
 */
class SettingRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'key',
        'value',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'key',
        'value',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model(): string
    {
        return Setting::class;
    }

    /**
     * @return mixed
     */
    public function updateSettings($input)
    {
        try {
            DB::beginTransaction();
            if (isset($input['logo']) && !empty($input['logo'])) {
                /** @var Setting $setting */
                $setting = Setting::where('key', '=', 'logo')->first();
                if (! $setting) {
                    $setting = Setting::create(['key' => 'logo']);
                }
                //                $setting->clearMediaCollection(Setting::PATH);
                $media = $setting->addMedia($input['logo'])->toMediaCollection(Setting::PATH, config('app.media_disc'));
                $setting = $setting->refresh();
                $setting->update(['value' => $media->getFullUrl()]);
                $input['logo'] = $setting->getLogoAttribute();
            }

            $settingInputArray = Arr::only($input, [
                'currency',
                'email',
                'company_name',
                'phone',
                'developed',
                'footer',
                'default_language',
                'default_customer',
                'default_warehouse',
                'stripe_key',
                'stripe_secret',
                'sms_gateway',
                'twillo_sid',
                'twillo_token',
                'twillo_from',
                'smtp_host',
                'smtp_port',
                'smtp_username',
                'smtp_password',
                'smtp_Encryption',
                'address',
                'show_version_on_footer',
                'country',
                'state',
                'city',
                'postcode',
                'date_format',
                'purchase_code',
                'purchase_return_code',
                'sale_code',
                'sale_return_code',
                'expense_code',
                'is_currency_right',
                'show_logo_in_receipt',
                'show_app_name_in_sidebar',
                'add_stock_while_product_creation',
                'decimal_places',
                'thousands_separator',
                'decimal_separator',
                'enable_nepali_datepicker',
            ]);

            foreach ($settingInputArray as $key => $value) {
                $setting = Setting::where('key', $key)->first();
                if ($key == 'show_version_on_footer' || $key == 'is_currency_right' || $key == 'show_logo_in_receipt' || $key == 'show_app_name_in_sidebar' || $key == 'add_stock_while_product_creation' || $key == 'enable_nepali_datepicker') {
                    if ($setting) {
                        $setting->update(['value' => $value]);
                    } else {
                        Setting::create(['key' => $key, 'value' => $value, 'tenant_id' => getActiveStore()->tenant_id,]);
                    }
                } else {
                    if ($setting) {
                        $setting->update(['value' => $value]);
                    } else {
                        Setting::create(['key' => $key, 'value' => $value, 'tenant_id' => getActiveStore()->tenant_id,]);
                    }
                }
            }
            // $input['logo'] = Setting::where('key', '=', 'logo')->first()->logo;
            DB::commit();

            return $input;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function updateReceiptSetting($input)
    {
        try {
            DB::beginTransaction();

            $settingInputArray = Arr::only($input, ['show_note', 'show_phone', 'show_customer', 'show_address', 'show_email', 'show_warehouse', 'show_tax_discount_shipping', 'show_logo_in_receipt', 'show_barcode_in_receipt', 'notes', 'show_product_code', 'show_tax', 'receipt_other_font_style', 'receipt_label_font_style', 'receipt_margin', 'receipt_paper_size', 'receipt_thermal_size', 'receipt_logo_font_style', 'receipt_logo_font_size', 'receipt_label_font_size', 'receipt_other_font_size', 'receipt_logo_font_color', 'receipt_label_font_color', 'receipt_other_font_color']);

            foreach ($settingInputArray as $key => $value) {
                $setting = Setting::where('key', $key)->first();
                if ($setting) {
                    $setting->update(['value' => $value]);
                } else {
                    $setting = new Setting();
                    $setting->key = $key;
                    $setting->value = $value;
                    $setting->save();
                }
            }
            DB::commit();

            return $input;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function updateMailEnvSetting($input)
    {
        $env = new DotenvEditor();
        $inputArr = Arr::except($input, ['_token']);
        $env->setAutoBackup(true);

        $envData = [
            'MAIL_MAILER' => (empty($inputArr['mail_mailer'])) ? '' : $inputArr['mail_mailer'],
            'MAIL_HOST' => (empty($inputArr['mail_host'])) ? '' : $inputArr['mail_host'],
            'MAIL_PORT' => (empty($inputArr['mail_port'])) ? '' : $inputArr['mail_port'],
            'MAIL_USERNAME' => (empty($inputArr['mail_username'])) ? '' : $inputArr['mail_username'],
            'MAIL_PASSWORD' => (empty($inputArr['mail_password'])) ? '' : $inputArr['mail_password'],
            'MAIL_FROM_ADDRESS' => (empty($inputArr['mail_from_address'])) ? '' : $inputArr['mail_from_address'],
            'MAIL_ENCRYPTION' => (empty($inputArr['mail_encryption'])) ? '' : $inputArr['mail_encryption'],
        ];

        foreach ($envData as $key => $value) {
            $this->createOrUpdateEnv($env, $key, $value);
        }
    }

    public function createOrUpdateEnv($env, $key, $value): bool
    {
        if (!$env->keyExists($key)) {
            $env->addData([
                $key => $value,
            ]);

            return true;
        }
        $env->changeEnv([
            $key => $value,
        ]);

        return true;
    }

    /**
     * @return mixed
     */
    public function getEnvData()
    {
        $env = new DotenvEditor();
        $key = $env->getContent();
        $data = collect($key)->only([
            'MAIL_MAILER',
            'MAIL_HOST',
            'MAIL_PORT',
            'MAIL_USERNAME',
            'MAIL_PASSWORD',
            'MAIL_FROM_ADDRESS',
            'MAIL_ENCRYPTION',
        ])->toArray();

        return [
            'mail_mailer' => $data['MAIL_MAILER'] ?? '',
            'mail_host' => $data['MAIL_HOST'] ?? '',
            'mail_port' => $data['MAIL_PORT'] ?? '',
            'mail_username' => $data['MAIL_USERNAME'] ?? '',
            'mail_password' => $data['MAIL_PASSWORD'] ?? '',
            'mail_from_address' => $data['MAIL_FROM_ADDRESS'] ?? '',
            'mail_encryption' => $data['MAIL_ENCRYPTION'] ?? '',
        ];
    }

    public function updatePosSettings($input)
    {
        try {
            DB::beginTransaction();
            if (isset($input['click_audio']) && !empty($input['click_audio'])) {
                /** @var Setting $setting */
                $setting = Setting::where('key', 'click_audio')->first();
                if (! $setting) {
                    $setting = Setting::create(['key' => 'click_audio']);
                }
                $setting->clearMediaCollection(Setting::CLICK_AUDIO);
                $media = $setting->addMedia($input['click_audio'])->toMediaCollection(Setting::CLICK_AUDIO, config('app.media_disc'));
                $setting = $setting->refresh();
                $input['click_audio'] = $media->getFullUrl();
            }

            $settingInputArray = Arr::only($input, [
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
            ]);

            foreach ($settingInputArray as $key => $value) {
                $setting = Setting::where('key', '=', $key)->first();
                if ($setting) {
                    $setting->update(['value' => $value]);
                } else {
                    Setting::create(['key' => $key, 'value' => $value]);
                }
            }
            DB::commit();

            return $input;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function updateDualScreenSettings($input)
    {
        try {
            DB::beginTransaction();

            if (!empty(array_filter([
                $input['image1'] ?? null,
                $input['image2'] ?? null,
                $input['image3'] ?? null,
                $input['image4'] ?? null,
                $input['image5'] ?? null
            ]))) {
                /** @var Setting $setting */
                $setting = Setting::firstOrCreate(['key' => 'dual_screen_images']);

                $existingMedia = $setting->getMedia(Setting::DUAL_SCREEN);
                $imageUrls = [];
                $incomingUrls = [];
                foreach (['image1', 'image2', 'image3', 'image4', 'image5'] as $field) {
                    if (!empty($input[$field])) {
                        if ($input[$field] instanceof \Illuminate\Http\UploadedFile) {
                            $media = $setting->addMedia($input[$field])
                                ->toMediaCollection(Setting::DUAL_SCREEN, config('app.media_disc'));
                            $url = $media->getFullUrl();
                            $imageUrls[] = $url;
                            $incomingUrls[] = $url;
                        } elseif (filter_var($input[$field], FILTER_VALIDATE_URL)) {
                            $imageUrls[] = $input[$field];
                            $incomingUrls[] = $input[$field];
                        }
                    }
                }
                foreach ($existingMedia as $media) {
                    if (!in_array($media->getFullUrl(), $incomingUrls)) {
                        $media->delete();
                    }
                }
                $input['dual_screen_images'] = json_encode($imageUrls);
            } else {
                /** @var Setting $setting */
                $setting = Setting::firstOrCreate(['key' => 'dual_screen_images']);
                $setting->clearMediaCollection(Setting::DUAL_SCREEN);
                $input['dual_screen_images'] = json_encode([]);
            }

            $settingInputArray = Arr::only($input, [
                'dual_screen_header_text',
                'dual_screen_images',
            ]);

            foreach ($settingInputArray as $key => $value) {
                $setting = Setting::where('key', '=', $key)->first();
                if ($setting) {
                    $setting->update(['value' => $value]);
                } else {
                    Setting::create([
                        'tenant_id' => Auth::user()->tenant_id,
                        'key' => $key,
                        'value' => $value,
                    ]);
                }
            }
            DB::commit();

            return $input;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function sendTestEmail($input)
    {
        try {
            Mail::to($input['email'])->send(new \App\Mail\TestEmail());
        } catch (Exception $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function updateFieldConfiguration($input)
    {
        try {
            DB::beginTransaction();

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

            foreach ($keyName as $key) {
                if (!isset($input[$key])) {
                    if ($key == 'customer_dob_required') {
                        $input[$key] = false;
                    } else {
                        $input[$key] = true;
                    }
                }
                $setting = Setting::where('key', $key)->first();
                if ($setting) {
                    $setting->update(['value' => $input[$key]]);
                } else {
                    $setting = new Setting();
                    $setting->key = $key;
                    $setting->value = $input[$key];
                    $setting->save();
                }
            }
            DB::commit();

            return $input;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function createFiscalYear($input)
    {
        try {
            DB::beginTransaction();

            $fiscalYear = new FiscalYear();
            $fiscalYear->name = $input['name'];
            $fiscalYear->start_date = $input['start_date'];
            $fiscalYear->end_date = $input['end_date'];
            $fiscalYear->is_active = $input['is_active'] ?? false;
            $fiscalYear->is_completed = $input['is_completed'] ?? false;
            $fiscalYear->save();

            DB::commit();

            return $fiscalYear;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function updateActiveFiscalYear($input)
    {
        try {
            DB::beginTransaction();

            $isActive = filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN);

            $fiscalYear = FiscalYear::findOrFail($input['id']);

            if ($isActive) {
                FiscalYear::query()
                    ->where('id', '!=', $fiscalYear->id)
                    ->update(['is_active' => false]);
            }

            $fiscalYear->is_active = $isActive;
            $fiscalYear->save();

            DB::commit();

            return $fiscalYear;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }
}
