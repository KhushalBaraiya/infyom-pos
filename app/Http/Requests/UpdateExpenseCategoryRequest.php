<?php

namespace App\Http\Requests;

use App\Models\ExpenseCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Class UpdateExpenseCategoryRequest
 */
class UpdateExpenseCategoryRequest extends FormRequest
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
        $rules = ExpenseCategory::rules();
        $rules['name'] = 'required|unique:expense_categories,name,' . $this->route('expense_category') . ',id,tenant_id,' . Auth::user()->tenant_id;

        return $rules;
    }
}
