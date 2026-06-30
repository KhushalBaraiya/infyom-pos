<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.customer_sales_pdf') }}</title>
    <style>
        body {
            font-family: 'XBRiyaz', sans-serif;
            direction: rtl;
            margin: 0px;
            text-align: right;
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
        }

        .align-right {
            text-align: right;
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
                <td></td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: dodgerblue; margin:0; padding:0; line-height:1.2;">
                        {{ __('messages.pdf.sale_list') }}
                    </h2>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- Sales Table -->
        <table class="table" style="margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align:right; width:15%">{{ __('messages.pdf.payment_status') }}</th>
                    <th class="number-align" style="width:15%">{{ __('messages.pdf.due_amount') }}</th>
                    <th class="number-align" style="width:15%">{{ __('messages.pdf.paid_amount') }}</th>
                    <th class="text-center" style="width:20%">{{ __('messages.pdf.reference') }}</th>
                    <th class="text-center" style="width:20%">{{ __('messages.pdf.customer_name') }}</th>
                    <th class="text-center" style="width:15%">{{ __('messages.pdf.date') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (isset($customer->sales))
                    @foreach ($customer->sales as $sale)
                        <tr>
                            <td style="text-align:right;">
                                @if ($sale->payment_status == \App\Models\Sale::PAID)
                                    {{ __('messages.pdf.paid') }}
                                @elseif($sale->payment_status == \App\Models\Sale::UNPAID)
                                    {{ __('messages.pdf.unpaid') }}
                                @elseif($sale->payment_status == \App\Models\Sale::PARTIAL_PAID)
                                    {{ __('messages.pdf.partial') }}
                                @endif
                            </td>
                            <td class="number-align white-space-nowrap icon-style">
                                {{ currencyAlignment((float) $sale->grand_total - $sale->payments->sum('amount', 2)) }}
                            </td>
                            <td class="number-align white-space-nowrap icon-style">
                                {{ currencyAlignment((float) $sale->payments->sum('amount', 2)) }}
                            </td>
                            <td class="text-center">{{ $sale->reference_code }}</td>
                            <td class="text-center">{{ $customer->name }}</td>
                            <td class="text-center">{{ getFormattedDate($sale->date) }}</td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
