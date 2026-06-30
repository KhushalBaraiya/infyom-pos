<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.sale_pdf') }}</title>
    <style>
        body {
            font-family: 'XBRiyaz', sans-serif;
            direction: rtl;
            text-align: right;
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
            text-align: right;
        }

        .table th,
        .table td {
            border-bottom: 1px solid #ccc;
            border-top: 1px solid #ccc;
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
            text-align: left;
            /* numbers align left in RTL */
        }

        .align-right {
            text-align: right;
        }

        .border {
            border: none !important;
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
                <!-- Logo (right in RTL) -->
                <td width="30%" style="text-align: right; vertical-align: top;">
                    <img src="{{ $companyLogo }}" alt="Company Logo" width="80px">
                </td>

                <!-- Reference Code Center -->
                <td width="40%" style="text-align: center; vertical-align: middle;">
                    <h2 style="color: dodgerblue; margin:0; padding:0; line-height:1.2;">
                        {{ $sale->reference_code }}
                    </h2>
                </td>

                <!-- Sale Info (left in RTL) -->
                <td width="30%" style="text-align: right;">
                    <table style="width:100%; border-collapse: collapse;">
                        <tr>
                            <td><b>{{ __('messages.pdf.date') }}</b> :
                                {{ getFormattedDate($sale->created_at) }}
                            </td>
                        </tr>
                        <tr>
                            <td><b>{{ __('messages.pdf.number') }}</b> : {{ $sale->reference_code }}</td>
                        </tr>
                        <tr>
                            <td><b>{{ __('messages.pdf.payment_status') }}</b> :
                                <span
                                    class="{{ $sale->payment_status == \App\Models\Sale::PAID
                                        ? 'text-success'
                                        : ($sale->payment_status == \App\Models\Sale::PARTIAL_PAID
                                            ? 'text-warning'
                                            : 'text-danger') }}">
                                    {{ $sale->payment_status == \App\Models\Sale::PAID
                                        ? __('messages.pdf.paid')
                                        : ($sale->payment_status == \App\Models\Sale::PARTIAL_PAID
                                            ? __('messages.pdf.partial')
                                            : __('messages.pdf.unpaid')) }}
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Company & Customer Info -->
        <table style="width:100%; margin-top:20px; border-collapse: collapse;">
            <tr>
                <!-- Company Info -->
                <td style="width:48%; vertical-align: top;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="text-align:right;">{{ __('messages.pdf.company_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ __('messages.pdf.name') }}</b> : {{ getActiveStoreName() }} <br>
                                    @if ($taxes->count() > 0)
                                        @foreach ($taxes as $tax)
                                            <p style="margin: 0; padding: 0;">
                                                <span style="color: grey;">{{ $tax->number }}</span> :
                                                <b>{{ $tax->name }}</b>
                                            </p>
                                        @endforeach
                                    @endif
                                    <b>{{ __('messages.pdf.address') }}</b> :
                                    {{ getSettingValue('address') ?? 'N/A' }}
                                    <br>
                                    <b>{{ __('messages.pdf.phone') }}</b> : {{ getSettingValue('phone') ?? 'N/A' }}
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}</b> : {{ getSettingValue('email') ?? 'N/A' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>

                <td style="width:4%"></td>

                <!-- Customer Info -->
                <td style="width:48%; vertical-align: top;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="text-align:right;">{{ __('messages.pdf.customer_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ __('messages.pdf.name') }}</b> : {{ $sale->customer->name ?? 'N/A' }} <br>
                                    <b>{{ __('messages.pdf.phone') }}</b> : {{ $sale->customer->phone ?? 'N/A' }} <br>
                                    <b>{{ __('messages.pdf.address') }}</b> :
                                    @if (!empty($sale->customer->address) || !empty($sale->customer->city) || !empty($sale->customer->country))
                                        {{ $sale->customer->address ?? '' }}
                                        {{ $sale->customer->city ?? '' }}
                                        {{ $sale->customer->country ?? '' }}
                                    @else
                                        N/A
                                    @endif
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}</b> : {{ $sale->customer->email ?? 'N/A' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Products Table -->
        <table class="table" style="margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align: right; width:35%">{{ __('messages.pdf.product') }}</th>
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
                        <td style="text-align: right;">{{ $saleItem->product->name }}</td>
                        <td class="text-center icon-style">
                            {{ currencyAlignment((float) $saleItem->net_unit_price) }}
                        </td>
                        <td class="text-center">{{ $saleItem->quantity }}</td>
                        <td class="text-center icon-style">
                            {{ currencyAlignment((float) $saleItem->discount_amount) }}
                        </td>
                        <td class="text-center icon-style">
                            {{ currencyAlignment((float) $saleItem->tax_amount) }}
                        </td>
                        <td class="number-align icon-style">
                            {{ currencyAlignment((float) $saleItem->sub_total) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        <table class="table" style="width: 40%; margin-top: 20px; float: left;">
            <tbody>
                <tr>
                    <td><strong>{{ __('messages.pdf.order_tax') }}</strong> :</td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $sale->tax_amount) }}</td>
                </tr>
                <tr>
                    <td><strong>{{ __('messages.pdf.discount') }}</strong> :</td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $sale->discount) }}</td>
                </tr>
                <tr>
                    <td><strong>{{ __('messages.pdf.shipping') }}</strong> :</td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $sale->shipping) }}</td>
                </tr>
                @if ($sale->payment_status == \App\Models\Sale::PAID)
                    <tr>
                        <td><strong>{{ __('messages.pdf.paid_amount') }}</strong> :</td>
                        <td class="number-align icon-style">
                            {{ currencyAlignment((float) $sale->payments->sum('amount', 2)) }}
                        </td>
                    </tr>
                @endif
                <tr>
                    <td><strong>{{ __('messages.pdf.total') }}</strong> :</td>
                    <td class="number-align icon-style">
                        <b>{{ currencyAlignment((float) $sale->grand_total) }}</b>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Notes -->
        @if ($sale->note)
            <div
                style="text-align: right; clear: both; margin-top: 30px; padding: 10px 20px; border-right: 3px solid dodgerblue; background: #f8f8f8;">
                <b>{{ __('messages.pdf.notes') }}:</b><br>
                {{ $sale->note }}
            </div>
        @endif

        <div style="clear: both;"></div>
    </div>
</body>

</html>
