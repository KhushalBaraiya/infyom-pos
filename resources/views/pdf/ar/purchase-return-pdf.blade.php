<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta charset="UTF-8">
    <title>{{ __('messages.purchase_return_pdf') }}</title>
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

        .number-align {
            text-align: left;
            /* numbers align left in RTL */
        }

        .text-center {
            text-align: center;
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
    <!-- Header -->
    <table width="100%">
        <tr>
            <!-- Logo (right in RTL) -->
            <td width="30%" style="text-align: right;">
                <img src="{{ $companyLogo }}" alt="Company Logo" width="80px">
            </td>

            <!-- Reference Code Center -->
            <td width="40%" style="text-align: center; vertical-align: middle;">
                <h2 style="color: dodgerblue; margin:0; padding:0;">
                    {{ $purchaseReturn->reference_code }}
                </h2>
            </td>

            <!-- Return Info (left in RTL) -->
            <td width="30%" style="text-align: right;">
                <table style="width:100%; border-collapse: collapse;">
                    <tr>
                        <td><b>{{ __('messages.pdf.date') }}</b> :
                            {{ getFormattedDate($purchaseReturn->created_at) }}
                        </td>
                    </tr>
                    <tr>
                        <td><b>{{ __('messages.pdf.number') }}</b> : {{ $purchaseReturn->reference_code }}</td>
                    </tr>
                    <tr>
                        <td><b>{{ __('messages.pdf.status') }}</b> :
                            @if ($purchaseReturn->status == \App\Models\Purchase::RECEIVED)
                                {{ __('messages.pdf.received') }}
                            @elseif($purchaseReturn->status == \App\Models\Purchase::PENDING)
                                {{ __('messages.pdf.pending') }}
                            @else
                                {{ __('messages.pdf.ordered') }}
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Company & Supplier Info -->
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
                                <b>{{ __('messages.pdf.address') }}</b> : {{ getSettingValue('address') ?? 'N/A' }}
                                <br>
                                <b>{{ __('messages.pdf.phone') }}</b> : {{ getSettingValue('phone') ?? 'N/A' }} <br>
                                <b>{{ __('messages.pdf.email') }}</b> : {{ getSettingValue('email') ?? 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>

            <td style="width:4%"></td>

            <!-- Supplier Info -->
            <td style="width:48%; vertical-align: top;">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="text-align:right;">{{ __('messages.pdf.supplier_info') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <b>{{ __('messages.pdf.name') }}</b> : {{ $purchaseReturn->supplier->name ?? 'N/A' }}
                                <br>
                                <b>{{ __('messages.pdf.phone') }}</b> :
                                {{ $purchaseReturn->supplier->phone ?? 'N/A' }} <br>
                                <b>{{ __('messages.pdf.address') }}</b> :
                                @if (
                                    !empty($purchaseReturn->supplier->address) ||
                                        !empty($purchaseReturn->supplier->city) ||
                                        !empty($purchaseReturn->supplier->country))
                                    {{ $purchaseReturn->supplier->address ?? '' }}
                                    {{ $purchaseReturn->supplier->city ?? '' }}
                                    {{ $purchaseReturn->supplier->country ?? '' }}
                                @else
                                    N/A
                                @endif
                                <br>
                                <b>{{ __('messages.pdf.email') }}</b> :
                                {{ $purchaseReturn->supplier->email ?? 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <!-- Products Table (RTL) -->
    <table class="table" style="margin-top: 40px;">
        <thead>
            <tr>
                <th style="text-align: right;">{{ __('messages.pdf.product') }}</th>
                <th class="text-center">{{ __('messages.pdf.unit_cost') }}</th>
                <th class="text-center">{{ __('messages.pdf.quantity') }}</th>
                <th class="text-center">{{ __('messages.heading_discount') }}</th>
                <th class="text-center">{{ __('messages.pdf.tax') }}</th>
                <th class="number-align">{{ __('messages.heading_total') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($purchaseReturn->purchaseReturnItems as $item)
                <tr>
                    <td style="text-align: right;">{{ $item->product->name }}</td>
                    <td class="text-center icon-style">
                        {{ currencyAlignment((float) $item->net_unit_cost) }}
                    </td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-center icon-style">
                        {{ currencyAlignment((float) $item->discount_amount) }}
                    </td>
                    <td class="text-center icon-style">
                        {{ currencyAlignment((float) $item->tax_amount) }}</td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $item->sub_total) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Summary -->
    <table class="table" style="width:40%; margin-top: 20px; float: left;">
        <tbody>
            <tr>
                <td><strong>{{ __('messages.pdf.order_tax') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $purchaseReturn->tax_amount) }}
                </td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.discount') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $purchaseReturn->discount) }}
                </td>
            </tr>
            <tr>
                <td><strong>{{ __('messages.pdf.shipping') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ currencyAlignment((float) $purchaseReturn->shipping) }}
                </td>
            </tr>
            @if (!empty($purchaseReturn->received_amount))
                <tr>
                    <td><strong>{{ __('messages.pdf.paid_amount') }}</strong> :</td>
                    <td class="number-align icon-style">
                        {{ currencyAlignment((float) $purchaseReturn->received_amount) }}
                    </td>
                </tr>
            @endif
            <tr>
                <td><strong>{{ __('messages.pdf.total') }}</strong> :</td>
                <td class="number-align icon-style">
                    <b>{{ currencyAlignment((float) $purchaseReturn->grand_total) }}</b>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Notes -->
    @if ($purchaseReturn->notes)
        <div
            style="text-align: right; clear: both; margin-top: 30px; padding: 10px 20px;
                   border-right: 3px solid dodgerblue; background: #f8f8f8;">
            <b>{{ __('messages.pdf.notes') }}:</b><br>
            {{ $purchaseReturn->notes }}
        </div>
    @endif
</body>

</html>
