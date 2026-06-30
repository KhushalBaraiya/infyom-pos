<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.purchase_pdf') }}</title>
    <style>
        body {
            font-family: 'Arial-unicode-ms';
            font-size: 14px;
            color: #333;
            margin: 0px;
        }

        .icon-style {
            font-family: DejaVu Sans, sans-serif !important;
        }

        .text-center {
            text-align: center;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .table th,
        .table td {
            border-bottom: 1px solid #ccc;
            border-top: 1px solid #ccc;
            border-left: none;
            border-right: none;
            padding: 8px;
            vertical-align: top;
        }

        .table th {
            background: #f3f4f6;
        }

        .logo img {
            max-width: 120px;
            max-height: 70px;
        }

        .mt-20 {
            margin-top: 20px;
        }

        .number-align {
            text-align: right;
        }

        .align-right {
            text-align: right;
        }

        .border {
            border: 0px solid black !important;
        }

        .white-space-nowrap {
            white-space: nowrap !important;
        }

        .text-success {
            color: green;
        }

        .text-danger {
            color: red;
        }

        .text-warning {
            color: purple;
        }
    </style>
</head>

<body>
    <div>

        <!-- Header -->
        <table width="100%">
            <tr>
                <td width="35%" style="line-height: 1; vertical-align: top; padding: 0px;margin: 0px;">
                    <img src="{{ $companyLogo }}" alt="Company Logo" width="80px" style="margin: 0px;padding: 0px;">
                </td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: dodgerblue; margin:0; padding:0; line-height:1.2;">
                        {{ $purchase->reference_code }}
                    </h2>
                </td>
                <td width="35%" style="line-height: 1; vertical-align: top;">
                    <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                        <tr>
                            <td><b>{{ __('messages.pdf.date') }}:</b></td>
                            <td>{{ getFormattedDate($purchase->created_at) }}</td>
                        </tr>
                        <tr>
                            <td><b>{{ __('messages.pdf.number') }}:</b></td>
                            <td>{{ $purchase->reference_code }}</td>
                        </tr>
                        <tr>
                            <td><b>{{ __('messages.pdf.status') }}:</b></td>
                            <td>
                                @if ($purchase->status == \App\Models\Purchase::RECEIVED)
                                    {{ __('messages.pdf.received') }}
                                @elseif($purchase->status == \App\Models\Purchase::PENDING)
                                    {{ __('messages.pdf.pending') }}
                                @else
                                    {{ __('messages.pdf.ordered') }}
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td><b>{{ __('messages.pdf.payment_status') }}:</b></td>
                            <td class="fw-light vi-light-text 
                                {{ $purchase->payment_status == \App\Models\Purchase::PAID
                                    ? 'text-success'
                                    : ($purchase->payment_status == \App\Models\Purchase::PARTIAL
                                        ? 'text-warning'
                                        : 'text-danger') }}"
                                style="padding: 0px;">

                                {{ $purchase->payment_status == \App\Models\Purchase::PAID
                                    ? __('messages.pdf.paid')
                                    : ($purchase->payment_status == \App\Models\Purchase::PARTIAL
                                        ? __('messages.pdf.partial')
                                        : __('messages.pdf.unpaid')) }}
                            </td>
                        </tr>
                        @if (
                            $purchase->payment_status == \App\Models\Purchase::PAID ||
                                $purchase->payment_status == \App\Models\Purchase::PARTIAL)
                            <tr>
                                <td><b>{{ __('messages.pdf.payment_type') }}:</b></td>
                                <td>
                                    {{ $purchase->payment_type_name }}
                                </td>
                            </tr>
                        @endif
                    </table>
                </td>
            </tr>
        </table>

        <!-- Supplier & Company Info -->
        <table style="width:100%; margin-top:20px; border-collapse: collapse;">
            <tr>
                <!-- Supplier Info -->
                <td style="width:48%; vertical-align: top;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ __('messages.pdf.supplier_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ __('messages.pdf.name') }}:</b> {{ $purchase->supplier->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b>
                                    {{ $purchase->supplier->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    @if (!empty($purchase->supplier->address) || !empty($purchase->supplier->city) || !empty($purchase->supplier->country))
                                        {{ $purchase->supplier->address ?? '' }}
                                        {{ $purchase->supplier->city ?? '' }}
                                        {{ $purchase->supplier->country ?? '' }}
                                    @else
                                        N/A
                                    @endif
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ $purchase->supplier->email ?? 'N/A' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>

                <td style="width:4%"></td> <!-- gap -->

                <!-- Company Info -->
                <td style="width:48%; vertical-align: top;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ __('messages.pdf.company_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ getActiveStoreName() }}</b><br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    {{ getSettingValue('address') ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b> {{ getSettingValue('phone') ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ getSettingValue('email') ?? 'N/A' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Products Table -->
        <table class="table" style="width:100%; margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align: left">{{ __('messages.pdf.product') }}</th>
                    <th class="text-center">{{ __('messages.pdf.unit_cost') }}</th>
                    <th class="text-center" style="width:12%">{{ __('messages.pdf.quantity') }}</th>
                    <th class="text-center" style="width:12%">{{ __('messages.heading_discount') }}</th>
                    <th class="text-center" style="width:12%">{{ __('messages.pdf.tax') }}</th>
                    <th class="number-align" style="width:18%">{{ __('messages.heading_total') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($purchase->purchaseItems as $purchaseItem)
                    <tr>
                        <td>{{ $purchaseItem->product->name }} ({{ $purchaseItem->product->code }})</td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $purchaseItem->net_unit_cost) }}
                        </td>
                        <td class="text-center">{{ $purchaseItem->quantity }}</td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $purchaseItem->discount_amount) }}
                        </td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $purchaseItem->tax_amount) }}
                        </td>
                        <td class="icon-style align-right white-space-nowrap">
                            {{ currencyAlignment((float) $purchaseItem->sub_total) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        <table class="table mt-20" style="width:40%; float:right; margin-left: auto">
            <tbody>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.order_tax') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $purchase->tax_amount) }}
                    </td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.discount') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $purchase->discount) }}
                    </td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.shipping') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $purchase->shipping) }}
                    </td>
                </tr>
                @if (
                    $purchase->payment_status == \App\Models\Purchase::PAID ||
                        $purchase->payment_status == \App\Models\Purchase::PARTIAL)
                    <tr class="border">
                        <td class="border"><strong>{{ __('messages.pdf.paid_amount') }}:</strong></td>
                        <td class="number-align icon-style border">
                            @if ($purchase->payment_status == \App\Models\Purchase::PAID)
                                {{ currencyAlignment((float) $purchase->grand_total) }}
                            @else
                                {{ currencyAlignment((float) $purchase->partial_amount) }}
                            @endif
                        </td>
                    </tr>
                @endif
                <tr>
                    <td><strong>{{ __('messages.pdf.total') }}:</strong></td>
                    <td class="number-align icon-style">
                        <b>{{ currencyAlignment((float) $purchase->grand_total) }}</b>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Notes -->
        @if ($purchase->notes)
            <div
                style="clear: both; margin-top: 30px; padding: 10px; border-left: 3px solid dodgerblue; background: #f8f8f8;">
                <b>{{ __('messages.pdf.notes') }}:</b><br>
                {{ $purchase->notes }}
            </div>
        @endif

        <div style="clear: both;"></div>
    </div>
</body>

</html>
