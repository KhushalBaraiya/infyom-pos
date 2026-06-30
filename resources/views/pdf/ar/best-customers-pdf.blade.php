<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.top_customers_pdf') }}</title>
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
                        {{ __('messages.pdf.top_customers_list') }}
                    </h2>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- Customers Table -->
        <table class="table" style="margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align:right; width:20%">{{ __('messages.pdf.customer_name') }}</th>
                    <th class="text-center" style="width:15%">{{ __('messages.pdf.phone') }}</th>
                    <th class="text-center" style="width:20%">{{ __('messages.pdf.email') }}</th>
                    <th class="text-center" style="width:15%">{{ __('messages.pdf.total_sales') }}</th>
                    <th class="number-align" style="width:15%">{{ __('messages.pdf.total_amount') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (isset($topCustomers))
                    @foreach ($topCustomers as $customer)
                        <tr>
                            <td style="text-align:right;">{{ $customer->name ?? 'N/A' }}</td>
                            <td class="text-center">{{ $customer->phone ?? 'N/A' }}</td>
                            <td class="text-center">{{ $customer->email ?? 'N/A' }}</td>
                            <td class="text-center">{{ $customer->sales_count ?? 'N/A' }}</td>
                            <td class="number-align white-space-nowrap icon-style">
                                {{ currencyAlignment((float) $customer->grand_total) }}
                            </td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
