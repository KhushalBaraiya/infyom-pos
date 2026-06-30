<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.customer_quotations_pdf') }}</title>
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
                        {{ __('messages.pdf.quotation_list') }}
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
                    <th>{{ __('messages.pdf.customer_name') }}</th>
                    <th>{{ __('messages.pdf.reference') }}</th>
                    <th style="width:15%">{{ __('messages.pdf.total_amount') }}</th>
                    <th style="width:15%" class="text-center">{{ __('messages.pdf.status') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (isset($customer->quotations))
                    @foreach ($customer->quotations as $quotation)
                        <tr>
                            <td class="text-center" width="20%">{{ getFormattedDate($quotation->date) }}</td>
                            <td class="text-center">{{ $customer->name }}</td>
                            <td class="text-center">{{ $quotation->reference_code }}</td>
                            <td class="icon-style text-center">
                                {{ currencyAlignment((float) $quotation->grand_total) }}</td>
                            <td class="text-center">
                                @if ($quotation->status == \App\Models\Quotation::SENT)
                                    {{ __('messages.pdf.sent') }}
                                @elseif($quotation->status == \App\Models\Quotation::PENDING)
                                    {{ __('messages.pdf.pending') }}
                                @else
                                    -
                                @endif
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
