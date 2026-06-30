<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.sale_pdf') }}</title>
    <style>
        body {
            font-family: "Arial-unicode-ms"
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
            border: none !important;
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

        <table width="100%">
            <tr>
                <td width="35%" style="line-height: 1; vertical-align: top; padding: 0px;margin: 0px;">
                    <img src="{{ $companyLogo }}" alt="Company Logo" width="80px" style="margin: 0px;padding: 0px;">
                </td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: dodgerblue; margin:0; padding:0; line-height:1.2;">
                        {{ $sale->reference_code }}
                    </h2>
                </td>
                <td width="35%" style="line-height: 1; vertical-align: top;">
                    <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding: 0px;">
                                {{ __('messages.pdf.date') }}:
                            </td>
                            <td class="fw-light vi-light-text" style="padding: 0px;">
                                {{ getFormattedDate($sale->created_at) }}
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding:0px;">
                                {{ __('messages.pdf.number') }}:
                            </td>
                            <td class="fw-light vi-light-text" style="padding: 0px;">
                                {{ $sale->reference_code }}
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding:0px;">
                                {{ __('messages.pdf.payment_status') }}:
                            </td>
                            <td class="fw-light vi-light-text 
                                {{ $sale->payment_status == \App\Models\Sale::PAID
                                    ? 'text-success'
                                    : ($sale->payment_status == \App\Models\Sale::PARTIAL_PAID
                                        ? 'text-warning'
                                        : 'text-danger') }}"
                                style="padding: 0px;">

                                {{ $sale->payment_status == \App\Models\Sale::PAID
                                    ? __('messages.pdf.paid')
                                    : ($sale->payment_status == \App\Models\Sale::PARTIAL_PAID
                                        ? __('messages.pdf.partial')
                                        : __('messages.pdf.unpaid')) }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- From / To / Quote Info -->
        <table style="width:100%; margin-top:20px; border-collapse: collapse;">
            <tr>
                <!-- Customer Info -->
                <td style="width:48%; vertical-align: top;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ __('messages.pdf.customer_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ __('messages.pdf.name') }}:</b> {{ $sale->customer->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b> {{ $sale->customer->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    @if (!empty($sale->customer->address) || !empty($sale->customer->city) || !empty($sale->customer->country))
                                        {{ $sale->customer->address ?? '' }}
                                        {{ $sale->customer->city ?? '' }}
                                        {{ $sale->customer->country ?? '' }}
                                    @else
                                        N/A
                                    @endif
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ $sale->customer->email ?? 'N/A' }}
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
                                    @if ($taxes->count() > 0)
                                        @foreach ($taxes as $tax)
                                            <p style="margin: 0; padding: 0;">
                                                <b>{{ $tax->name }}</b>
                                                <b>:</b>
                                                <span style="color: grey; padding: 0;">{{ $tax->number }}</span>
                                            </p>
                                        @endforeach
                                    @endif
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
                    <th style="text-align: left; width:35%">{{ __('messages.pdf.product') }}</th>
                    <th style="width:15%" class="text-center">{{ __('messages.pdf.unit_price') }}</th>
                    <th style="width:8%" class="text-center">{{ __('messages.pdf.quantity') }}</th>
                    <th style="width:12%" class="text-center">{{ __('messages.heading_discount') }}</th>
                    <th style="width:12%" class="text-center">{{ __('messages.pdf.tax') }}</th>
                    <th style="width:18%" class="number-align">{{ __('messages.heading_total') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($sale->saleItems as $saleItem)
                    <tr>
                        <td>
                            {{ $saleItem->product->name }} ({{ $saleItem->product->code }})
                        </td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $saleItem->net_unit_price) }}
                        </td>
                        <td class="text-center">{{ $saleItem->quantity }}</td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $saleItem->discount_amount) }}
                        </td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $saleItem->tax_amount) }}
                        </td>
                        <td class="icon-style align-right white-space-nowrap">
                            {{ currencyAlignment((float) $saleItem->sub_total) }}
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
                        {{ currencyAlignment((float) $sale->tax_amount) }}
                    </td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.discount') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $sale->discount) }}
                    </td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.shipping') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $sale->shipping) }}
                    </td>
                </tr>
                @if ($sale->payment_status == \App\Models\Sale::PAID)
                    <tr class="border">
                        <td class="border"><strong>{{ __('messages.pdf.paid_amount') }}:</strong></td>
                        <td class="number-align icon-style border">
                            {{ currencyAlignment((float) $sale->payments->sum('amount', 2)) }}
                        </td>
                    </tr>
                @endif
                <tr>
                    <td><strong>{{ __('messages.pdf.total') }}:</strong></td>
                    <td class="number-align icon-style">
                        <b>{{ currencyAlignment((float) $sale->grand_total) }}</b>
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
