<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.customer_quotations_pdf') }}</title>
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
                        {{ __('messages.pdf.quotation_list') }}
                    </h2>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- Quotations Table -->
        <table class="table" style="margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align:right; width:20%">{{ __('messages.pdf.status') }}</th>
                    <th class="number-align" style="width:15%">{{ __('messages.pdf.total_amount') }}</th>
                    <th class="text-center" style="width:20%">{{ __('messages.pdf.reference') }}</th>
                    <th class="text-center" style="width:25%">{{ __('messages.pdf.customer_name') }}</th>
                    <th class="text-center" style="width:20%">{{ __('messages.pdf.date') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (isset($customer->quotations))
                    @foreach ($customer->quotations as $quotation)
                        <tr>
                            <td style="text-align:right;">
                                @if ($quotation->status == \App\Models\Quotation::SENT)
                                    {{ __('messages.pdf.sent') }}
                                @elseif($quotation->status == \App\Models\Quotation::PENDING)
                                    {{ __('messages.pdf.pending') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="number-align white-space-nowrap icon-style">
                                {{ currencyAlignment((float) $quotation->grand_total) }}
                            </td>
                            <td class="text-center">{{ $quotation->reference_code }}</td>
                            <td class="text-center">{{ $customer->name }}</td>
                            <td class="text-center">{{ getFormattedDate($quotation->date) }}</td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
