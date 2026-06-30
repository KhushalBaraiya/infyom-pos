<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.supplier') }}</title>
    <style>
        body {
            font-family: 'XBRiyaz', sans-serif;
            direction: rtl;
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
                <td></td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: dodgerblue; margin:0; padding:0; line-height:1.2;">
                        <b>{{ __('messages.pdf.client') }}</b> : {{ $supplier->name }}
                    </h2>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- Supplier & Company Info -->
        <table style="width:100%; margin-top:20px; border-collapse: collapse;">
            <tr>
                <!-- Supplier Info -->
                <td style="width:48%; vertical-align: top;">
                    <table class="table align-right">
                        <thead>
                            <tr>
                                <th>{{ __('messages.pdf.supplier_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ __('messages.pdf.name') }}</b>: {{ $supplier->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}</b>: {{ $supplier->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}</b>:
                                    @if (!empty($supplier->address) || !empty($supplier->city) || !empty($supplier->country))
                                        {{ $supplier->address ?? '' }}
                                        {{ $supplier->city ?? '' }}
                                        {{ $supplier->country ?? '' }}
                                    @else
                                        N/A
                                    @endif
                                    <br>
                                    <b>{{ __('messages.pdf.email') }}</b>: {{ $supplier->email ?? 'N/A' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>

                <td style="width:4%"></td> <!-- gap -->

                <!-- Company Info -->
                <td style="width:48%; vertical-align: top;">
                    <table class="table align-right">
                        <thead>
                            <tr>
                                <th>{{ __('messages.pdf.company_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ getActiveStoreName() }}</b><br>
                                    <b>{{ __('messages.pdf.address') }}</b>:
                                    {{ getSettingValue('address') ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}</b>: {{ getSettingValue('phone') ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.email') }}</b>: {{ getSettingValue('email') ?? 'N/A' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Purchases Table -->
        <table class="table align-right" style="width:100%; margin-top: 40px;">
            <thead>
                <tr>
                    <th class="text-center">{{ __('messages.pdf.payment_status') }}</th>
                    <th class="text-center">{{ __('messages.pdf.total_amount') }}</th>
                    <th class="text-center">{{ __('messages.pdf.reference') }}</th>
                    <th class="text-center">{{ __('messages.pdf.date') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (count($supplier->purchases) > 0)
                    @foreach ($supplier->purchases as $purchase)
                        <tr>
                            <td
                                class="text-center
                                {{ $purchase->payment_status == \App\Models\Purchase::PAID
                                    ? 'text-success'
                                    : ($purchase->payment_status == \App\Models\Purchase::PARTIAL
                                        ? 'text-warning'
                                        : 'text-danger') }}">
                                @if ($purchase->payment_status == \App\Models\Purchase::PAID)
                                    {{ __('messages.pdf.paid') }}
                                @elseif($purchase->payment_status == \App\Models\Purchase::PARTIAL)
                                    {{ __('messages.pdf.partial') }}
                                @else
                                    {{ __('messages.pdf.unpaid') }}
                                @endif
                            </td>
                            <td class="icon-style text-center icon-style">
                                {{ currencyAlignment((float) $purchase->grand_total) }}
                            </td>
                            <td class="text-center">{{ $purchase->reference_code }}</td>
                            <td class="text-center">{{ getFormattedDate($purchase->date) }}</td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>

        <!-- Summary -->
        <table class="table align-right" style="width: 50%; float:left;">
            <tbody>
                <tr>
                    <td class="number-align icon-style">
                        <b>{{ $purchasesData['totalPurchase'] ?? 0 }}</b>
                    </td>
                    <td><strong>: {{ __('messages.pdf.total_purchases') }}</strong></td>
                </tr>
                <tr>
                    <td class="number-align icon-style">
                        <b>{{ currencyAlignment((float) $purchasesData['totalAmount']) }}</b>
                    </td>
                    <td><strong>: {{ __('messages.pdf.total_amount') }}</strong></td>
                </tr>
            </tbody>
        </table>

        <div style="clear: both;"></div>
    </div>
</body>

</html>
