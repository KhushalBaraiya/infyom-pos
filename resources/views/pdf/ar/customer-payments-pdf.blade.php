<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.customer_payments_pdf') }}</title>
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
                        {{ __('messages.pdf.payment_list') }}
                    </h2>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- Payments Table -->
        <table class="table" style="margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align:right; width:20%">{{ __('messages.pdf.payment_type') }}</th>
                    <th class="number-align" style="width:15%">{{ __('messages.pdf.paid_amount') }}</th>
                    <th class="text-center" style="width:20%">{{ __('messages.pdf.sale_reference') }}</th>
                    <th class="text-center" style="width:15%">{{ __('messages.pdf.date') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($payments as $payment)
                    <tr>
                        <td style="text-align:right;">
                            {{ $payment->paymentMethod->name }}
                        </td>
                        <td class="number-align white-space-nowrap icon-style">
                            {{ currencyAlignment((float) $payment->amount) }}
                        </td>
                        <td class="text-center">{{ $payment->sale->reference_code }}</td>
                        <td class="text-center">{{ getFormattedDate($payment->payment_date) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
