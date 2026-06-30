<?php

namespace App\Imports;

use App\Models\Setting;
use App\Models\Supplier;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SupplierImport implements ToCollection, WithChunkReading, WithStartRow
{
    protected array $settings;

    public function __construct()
    {
        $keys = [
            'supplier_email_required',
            'supplier_phone_number_required',
            'supplier_country_required',
            'supplier_city_required',
            'supplier_address_required',
        ];

        $this->settings = Setting::whereIn('key', $keys)
            ->pluck('value', 'key')
            ->map(fn($value) => (bool) $value)
            ->toArray();

        foreach ($keys as $key) {
            $this->settings[$key] ??= true;
        }
    }

    public function collection(Collection $rows): void
    {
        DB::transaction(function () use ($rows) {

            foreach ($rows as $index => $row) {

                $data = [
                    'name' => $row[0] ?? null,
                    'email' => $row[1] ?? null,
                    'phone' => $row[2] ?? null,
                    'country' => $row[3] ?? null,
                    'city' => $row[4] ?? null,
                    'address' => $row[5] ?? null,
                ];

                $rules = [
                    'name' => 'required|string|max:255',
                    'email' => ($this->settings['supplier_email_required'] ? 'required' : 'nullable')
                        . '|email|unique:suppliers,email,NULL,id,tenant_id,' . auth()->user()->tenant_id,
                    'phone' => ($this->settings['supplier_phone_number_required'] ? 'required' : 'nullable')
                        . '|max:20',
                    'country' => $this->settings['supplier_country_required'] ? 'required|string' : 'nullable|string',
                    'city' => $this->settings['supplier_city_required'] ? 'required|string' : 'nullable|string',
                    'address' => $this->settings['supplier_address_required'] ? 'required|string' : 'nullable|string',
                ];

                $validator = Validator::make($data, $rules);

                if ($validator->fails()) {
                    throw new UnprocessableEntityHttpException(
                        'Row ' . ($index + $this->startRow()) . ': ' . $validator->errors()->first()
                    );
                }

                Supplier::create($data);
            }
        });
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function startRow(): int
    {
        return 2;
    }
}
