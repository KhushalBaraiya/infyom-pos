<?php

namespace App\Http\Requests;

use App\Models\Setting;
use App\Models\Supplier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Class CreateSupplierRequest
 */
class CreateSupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $keyName = [
            'supplier_email_required',
            'supplier_phone_number_required',
            'supplier_country_required',
            'supplier_city_required',
            'supplier_address_required',
        ];
        $settings = Setting::whereIn('key', $keyName)->pluck('value', 'key')->map(fn($value) => (bool) $value)->toArray();
        foreach ($keyName as $key) {
            if (!isset($settings[$key])) {
                $settings[$key] = true;
            }
        }
        $rules = Supplier::rules();
        if (!$settings['supplier_email_required']) {
            $rules['email'] = 'nullable|email|unique:suppliers,email,NULL,id,tenant_id,' . Auth::user()->tenant_id;
        }
        if (!$settings['supplier_phone_number_required']) {
            $rules['phone'] = 'nullable|string|max:20';
        }
        if (!$settings['supplier_country_required']) {
            $rules['country'] = 'nullable';
        }
        if (!$settings['supplier_city_required']) {
            $rules['city'] = 'nullable';
        }
        if (!$settings['supplier_address_required']) {
            $rules['address'] = 'nullable';
        }

        return $rules;
    }
}
