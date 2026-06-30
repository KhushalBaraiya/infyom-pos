<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.customer_pdf') }}</title>
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
    </style>
</head>

<body>
    <div>

        <table width="100%">
            <tr>
                <td></td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: dodgerblue; margin:0; padding:0; line-height:1.2;">
                        {{ __('messages.pdf.client') }} : {{ $customer->name }}
                    </h2>
                </td>
                <td></td>
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
                                    <b>{{ __('messages.pdf.name') }}:</b> {{ $customer->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b> {{ $customer->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    @if (!empty($customer->address) || !empty($customer->city) || !empty($customer->country))
                                        {{ $customer->address ?? '' }}
                                        {{ $customer->city ?? '' }}
                                        {{ $customer->country ?? '' }}
                                    @else
                                        N/A
                                    @endif
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ $customer->email ?? 'N/A' }}
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
                    <th class="text-center">{{ __('messages.pdf.date') }}</th>
                    <th class="text-center">{{ __('messages.pdf.reference') }}</th>
                    <th class="text-center">{{ __('messages.pdf.paid_amount') }}</th>
                    <th class="text-center">{{ __('messages.pdf.due_amount') }}</th>
                    <th class="text-center">{{ __('messages.pdf.payment_status') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (count($customer->sales) > 0)
                    @foreach ($customer->sales as $sale)
                        <tr>
                            <td class="text-center">{{ getFormattedDate($sale->date) }}</td>
                            <td class="text-center">{{ $sale->reference_code }}</td>
                            <td class="icon-style text-center">
                                {{ currencyAlignment((float) $sale->payments->sum('amount', 2)) }}</td>
                            <td class="icon-style text-center">
                                {{ currencyAlignment((float) $sale->grand_total - $sale->payments->sum('amount', 2)) }}
                            </td>
                            <td class="text-center">
                                @if ($sale->payment_status == \App\Models\Sale::PAID)
                                    {{ __('messages.pdf.paid') }}
                                @elseif($sale->payment_status == \App\Models\Sale::UNPAID)
                                    {{ __('messages.pdf.unpaid') }}
                                @elseif($sale->payment_status == \App\Models\Sale::PARTIAL_PAID)
                                    {{ __('messages.pdf.partial') }}
                                @endif
                            </td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>

        <!-- Summary -->
        <table class="table" style="width: 40%;float:right;">
            <tbody>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.total_sales') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ $salesData['totalSale'] ?? 0 }}</td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.total_amount') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $salesData['totalAmount']) }}</td>
                </tr>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.total_paid') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ currencyAlignment((float) $salesData['totalPaid']) }}</td>
                </tr>
                <tr>
                    <td><strong>{{ __('messages.pdf.total_sale_due') }}:</strong></td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $salesData['totalSalesDue']) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
