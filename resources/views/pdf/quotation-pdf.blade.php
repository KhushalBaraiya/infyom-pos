<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.quotation_pdf') }}</title>
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
            table-layout: fixed;
            width: 100%;
        }

        .table th,
        .table td {
            border-bottom: 1px solid #ccc;
            border-top: 1px solid #ccc;
            border-left: none;
            border-right: none;
            padding: 8px;
            vertical-align: top;
            overflow: hidden;
            text-overflow: ellipsis;
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
                        {{ $quotation->reference_code }}
                    </h2>
                </td>
                <td width="35%" style="line-height: 1; vertical-align: top;">
                    <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding: 0px;">
                                {{ __('messages.pdf.date') }}:
                            </td>
                            <td class="fw-light vi-light-text" style="padding: 0px;">
                                {{ getFormattedDate($quotation->created_at) }}
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding:0px;">
                                {{ __('messages.pdf.number') }}:
                            </td>
                            <td class="fw-light vi-light-text" style="padding: 0px;">
                                {{ $quotation->reference_code }}
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding:0px;">
                                {{ __('messages.pdf.status') }}:
                            </td>
                            <td class="fw-light vi-light-text" style="padding: 0px;">
                                {{ $quotation->status == \App\Models\Quotation::SENT ? __('messages.pdf.sent') : __('messages.pdf.pending') }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Customer & Company Info -->
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
                                    <b>{{ __('messages.pdf.name') }}:</b>
                                    {{ $quotation->customer->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b>
                                    {{ $quotation->customer->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    @if (
                                        !empty($quotation->customer->address) ||
                                            !empty($quotation->customer->city) ||
                                            !empty($quotation->customer->country))
                                        {{ $quotation->customer->address ?? '' }}
                                        {{ $quotation->customer->city ?? '' }}
                                        {{ $quotation->customer->country ?? '' }}
                                    @else
                                        N/A
                                    @endif
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ $quotation->customer->email ?? 'N/A' }}
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
                    <th style="text-align: left">{{ __('messages.pdf.product') }}</th>
                    <th class="text-center">{{ __('messages.pdf.unit_price') }}</th>
                    <th style="width:12%" class="text-center">{{ __('messages.pdf.quantity') }}</th>
                    <th style="width:12%" class="text-center">{{ __('messages.heading_discount') }}</th>
                    <th style="width:12%" class="text-center">{{ __('messages.pdf.tax') }}</th>
                    <th style="width:18%" class="number-align">{{ __('messages.heading_total') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($quotation->quotationItems as $quotationItem)
                    <tr>
                        <td>{{ $quotationItem->product->name }} ({{ $quotationItem->product->code }})</td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $quotationItem->net_unit_price) }}
                        </td>
                        <td class="text-center">{{ $quotationItem->quantity }}</td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $quotationItem->discount_amount) }}
                        </td>
                        <td class="icon-style text-center white-space-nowrap">
                            {{ currencyAlignment((float) $quotationItem->tax_amount) }}
                        </td>
                        <td class="icon-style align-right white-space-nowrap">
                            {{ currencyAlignment((float) $quotationItem->sub_total) }}
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
                        {{ currencyAlignment((float) $quotation->tax_amount) }}
                    </td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.discount') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $quotation->discount) }}
                    </td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.shipping') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $quotation->shipping) }}
                    </td>
                </tr>
                <tr class="border">
                    <td><strong>{{ __('messages.pdf.total') }}:</strong></td>
                    <td class="number-align icon-style">
                        <b>{{ currencyAlignment((float) $quotation->grand_total) }}</b>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Notes -->
        @if ($quotation->note)
            <div
                style="clear: both; margin-top: 30px; padding: 10px; border-left: 3px solid dodgerblue; background: #f8f8f8;">
                <b>{{ __('messages.pdf.notes') }}:</b><br>
                {{ $quotation->note }}
            </div>
        @endif

        <div style="clear: both;"></div>
    </div>
</body>

</html>
