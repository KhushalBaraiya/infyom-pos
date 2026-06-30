<?php

namespace App\Http\Requests;

use App\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Class UpdateUnitRequest
 */
class UpdateUnitRequest extends FormRequest
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
        $rules = Unit::rules();
        // $rules['name'] = 'required|unique:units,name,' . $this->route('unit');
        $rules['name'] = 'required|unique:units,name,' . $this->unit . ',id,tenant_id,' . Auth::user()->tenant_id;

        return $rules;
    }
}
