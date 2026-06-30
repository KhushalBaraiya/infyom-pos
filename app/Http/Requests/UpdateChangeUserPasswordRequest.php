<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChangeUserPasswordRequest extends FormRequest
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
        return [
            'user_id' => 'required|exists:users,id',
            'password' => 'required|min:6|same:confirm_password',
            'confirm_password' => 'required|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => __('messages.error.user_id_required'),
            'user_id.exists' => __('messages.error.user_with_id_not_found'),
            'password.same' => __('messages.error.password_confirm_password_same'),
            'password.min' => __('messages.error.password_length'),
            'confirm_password.min' => __('messages.error.password_length'),
        ];
    }
}
