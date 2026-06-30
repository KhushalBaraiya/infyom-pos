<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.supplier') }}</title>
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
                        {{ __('messages.pdf.client') }} : {{ $supplier->name }}
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
                                <th>{{ __('messages.pdf.supplier_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ __('messages.pdf.name') }}:</b> {{ $supplier->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b> {{ $supplier->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    @if (!empty($supplier->address) || !empty($supplier->city) || !empty($supplier->country))
                                        {{ $supplier->address ?? '' }}
                                        {{ $supplier->city ?? '' }}
                                        {{ $supplier->country ?? '' }}
                                    @else
                                        N/A
                                    @endif
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ $supplier->email ?? 'N/A' }}
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
                    <th class="text-center">{{ __('messages.pdf.total_amount') }}</th>
                    <th class="text-center">{{ __('messages.pdf.payment_status') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (count($supplier->purchases) > 0)
                    @foreach ($supplier->purchases as $purchase)
                        <tr>
                            <td class="text-center">{{ getFormattedDate($purchase->date) }}</td>
                            <td class="text-center">{{ $purchase->reference_code }}</td>
                            <td class="icon-style text-center">
                                {{ currencyAlignment((float) $purchase->grand_total) }}</td>
                            <td class="text-center">
                                @if ($purchase->payment_status == \App\Models\Purchase::PAID)
                                    {{ __('messages.pdf.paid') }}
                                @elseif($purchase->payment_status == \App\Models\Purchase::PARTIAL)
                                    {{ __('messages.pdf.partial') }}
                                @else
                                    {{ __('messages.pdf.unpaid') }}
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
                <tr>
                    <td><strong>{{ __('messages.pdf.total_purchases') }}:</strong></td>
                    <td class="number-align icon-style">
                        {{ $purchasesData['totalPurchase'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td><strong>{{ __('messages.pdf.total_amount') }}:</strong></td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $purchasesData['totalAmount']) }}</td>
                </tr>
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
