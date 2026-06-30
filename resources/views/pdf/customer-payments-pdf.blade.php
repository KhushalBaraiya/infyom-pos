<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.customer_payments_pdf') }}</title>
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
    </style>
</head>

<body>
    <div>

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


        <!-- Products Table -->
        <table class="table" style="width:100%; margin-top: 40px;">
            <thead>
                <tr>
                    <th>{{ __('messages.pdf.date') }}</th>
                    <th>{{ __('messages.pdf.sale_reference') }}</th>
                    <th style="width:15%">{{ __('messages.pdf.paid_amount') }}</th>
                    <th style="width:20%">{{ __('messages.pdf.payment_type') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($payments as $payment)
                    <tr>
                        <td class="text-center" width="20%">{{ getFormattedDate($payment->payment_date) }}</td>
                        <td class="text-center">{{ $payment->sale->reference_code }}</td>
                        <td class="icon-style text-center">
                            {{ currencyAlignment((float) $payment->amount) }}</td>
                        <td class="text-center">
                            {{ $payment->paymentMethod->name }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
