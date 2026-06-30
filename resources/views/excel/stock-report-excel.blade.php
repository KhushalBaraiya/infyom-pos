<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title> Sale return report pdf</title>
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/favicon.ico') }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <!-- Fonts -->
    <!-- General CSS Files -->
    <link href="{{ asset('assets/css/bootstrap.min.css') }}" rel="stylesheet" type="text/css"/>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="10" style="margin-top: 40px;">
    <thead>
    <tr style="background-color: dodgerblue;">
        <th style="width: 200%">{{ __('messages.pdf.warehouse') }}</th>
        <th style="width: 200%">{{ __('messages.pdf.code') }}</th>
        <th style="width: 300%">{{ __('messages.pdf.name') }}</th>
        <th style="width: 200%">{{ __('messages.pdf.cost') }}</th>
        <th style="width: 200%">{{ __('messages.pdf.price') }}</th>
        <th style="width: 250%">{{ __('messages.pdf.current_stock') }}</th>
        <th style="width: 250%;font-weight: bold;">Total Cost</th>
        <th style="width: 250%;font-weight: bold;">Total Value</th>
        <th style="width: 250%;font-weight: bold;">Profit</th>
    </tr>
    </thead>
    <tbody>
    @php
        $totalStock = 0;
        $totalCostSum = 0;
        $totalValueSum = 0;
        $totalProfitSum = 0;
    @endphp
    @foreach($stocks  as $stock)
        @php
            $cost = (float) $stock->product->product_cost;
            $price = (float) $stock->product->product_price;
            $qty = (int) $stock->quantity;
            $totalCost = $cost * $qty;
            $totalValue = $price * $qty;
            $profit = ($price - $cost) * $qty;
            $totalStock += $qty;
            $totalCostSum += $totalCost;
            $totalValueSum += $totalValue;
            $totalProfitSum += $profit;
        @endphp
        <tr align="center">
            <td>{{$stock->warehouse->name}}</td>
            <td>{{$stock->product->code}}</td>
            <td>{{$stock->product->name}}</td>
            <td>{{ currencyAlignment((float) $cost, 2) }}</td>
            <td>{{ currencyAlignment((float) $price, 2) }}</td>
            <td style="text-align: left">{{ $qty }}</td>
            <td>{{ currencyAlignment((float) $totalCost, 2) }}</td>
            <td>{{ currencyAlignment((float) $totalValue, 2) }}</td>
            <td>{{ currencyAlignment((float) $profit, 2) }}</td>
        </tr>
    @endforeach
    <tr style="font-weight: bold; background-color: #f2f2f2;" align="center">
    </tr>
    <tr style="font-weight: bold; background-color: #f2f2f2;" align="center">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td style="text-align: right;font-weight: bold;">Total :</td>
        {{-- <td style="text-align: left">{{ $totalStock }}</td> --}}
        <td>{{ currencyAlignment((float) $totalCostSum, 2) }}</td>
        <td>{{ currencyAlignment((float) $totalValueSum, 2) }}</td>
        <td>{{ currencyAlignment((float) $totalProfitSum, 2) }}</td>
    </tr>
    </tbody>
</table>
</body>
</html>
