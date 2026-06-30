<?php

namespace App\Http\Requests;

use App\Models\Customer;
use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Class UpdateCustomerRequest
 */
class UpdateCustomerRequest extends FormRequest
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
            'customer_email_required',
            'customer_phone_number_required',
            'customer_dob_required', // false
            'customer_country_required',
            'customer_city_required',
            'customer_address_required',
        ];
        $settings = Setting::whereIn('key', $keyName)->pluck('value', 'key')->map(fn($value) => (bool) $value)->toArray();
        foreach ($keyName as $key) {
            if (!isset($settings[$key])) {
                if ($key == 'customer_dob_required') {
                    $settings[$key] = false;
                } else {
                    $settings[$key] = true;
                }
            }
        }
        $rules = Customer::rules();
        $rules['email'] = 'required|email|unique:customers,email,' . $this->route('customer') . ',id,tenant_id,' . Auth::user()->tenant_id;

        if (!$settings['customer_email_required']) {
            $rules['email'] = 'nullable|email|unique:customers,email,' . $this->route('customer') . ',id,tenant_id,' . Auth::user()->tenant_id;
        }
        if (!$settings['customer_phone_number_required']) {
            $rules['phone'] = 'nullable|string|max:20';
        }
        if ($settings['customer_dob_required']) {
            $rules['dob'] = 'required|date';
        }
        if (!$settings['customer_country_required']) {
            $rules['country'] = 'nullable';
        }
        if (!$settings['customer_city_required']) {
            $rules['city'] = 'nullable';
        }
        if (!$settings['customer_address_required']) {
            $rules['address'] = 'nullable';
        }

        return $rules;
    }
}
