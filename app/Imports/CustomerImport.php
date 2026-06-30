<?php

namespace App\Imports;

use App\Models\Customer;
use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CustomerImport implements ToCollection, WithChunkReading, WithStartRow
{
    protected array $settings;

    public function __construct()
    {
        $defaults = [
            'customer_email_required'        => true,
            'customer_phone_number_required' => true,
            'customer_country_required'      => true,
            'customer_city_required'         => true,
            'customer_address_required'      => true,
        ];

        $this->settings = Setting::whereIn('key', array_keys($defaults))
            ->pluck('value', 'key')
            ->map(fn($value) => (bool) $value)
            ->toArray();

        foreach ($defaults as $key => $default) {
            $this->settings[$key] ??= $default;
        }
    }

    public function collection(Collection $rows): void
    {
        DB::transaction(function () use ($rows) {

            foreach ($rows as $index => $row) {

                $data = [
                    'name'    => $row[0] ?? null,
                    'email'   => $row[1] ?? null,
                    'phone'   => $row[2] ?? null,
                    'country' => $row[4] ?? null,
                    'city'    => $row[5] ?? null,
                    'address' => $row[6] ?? null,
                ];

                $rules = [
                    'name' => 'required|string|max:255',

                    'email' => ($this->settings['customer_email_required'] ? 'required' : 'nullable')
                        . '|email|unique:customers,email,NULL,id,tenant_id,' . auth()->user()->tenant_id,

                    'phone' => ($this->settings['customer_phone_number_required'] ? 'required' : 'nullable')
                        . '|max:20',

                    'country' => $this->settings['customer_country_required']
                        ? 'required|string'
                        : 'nullable|string',

                    'city' => $this->settings['customer_city_required']
                        ? 'required|string'
                        : 'nullable|string',

                    'address' => $this->settings['customer_address_required']
                        ? 'required|string'
                        : 'nullable|string',
                ];

                $validator = Validator::make($data, $rules);

                if ($validator->fails()) {
                    throw new UnprocessableEntityHttpException(
                        'Row ' . ($index + $this->startRow()) . ': ' . $validator->errors()->first()
                    );
                }

                Customer::create($data);
            }
        });
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function startRow(): int
    {
        return 2; // skip header
    }
}
