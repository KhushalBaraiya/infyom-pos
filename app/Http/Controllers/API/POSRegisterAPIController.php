<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreatePOSRegisterRequest;
use App\Http\Resources\POSRegisterCollection;
use App\Http\Resources\POSRegisterResource;
use App\Models\FiscalYear;
use App\Models\PaymentMethod;
use App\Models\POSRegister;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SalesPayment;
use App\Repositories\POSRegisterRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class POSRegisterAPIController extends AppBaseController
{
    public $posReg;

    public function __construct(POSRegisterRepository $posReg)
    {
        $this->posReg = $posReg;
    }

    public function entry(CreatePOSRegisterRequest $request)
    {
        $input = $request->all();
        $input['user_id'] = Auth::id();

        POSRegister::create($input);

        return $this->sendSuccess('Register entry added successfully.');
    }

    public function closeRegister(Request $request)
    {
        $input = $request->all();
        $register = POSRegister::where('user_id', Auth::id())
            ->whereNull('closed_at')
            ->first();

        if (! $register) {
            return $this->sendError('Register entry not found.');
        }

        $startDate = $register->created_at->toDateTimeString();
        $endDate = Carbon::now()->endOfDay()->toDateTimeString();
        $data = $this->getRegisterData($startDate, $endDate);

        $register->closed_at = Carbon::now();
        $register->cash_in_hand_while_closing = $input['cash_in_hand_while_closing'];
        // Set payment method amounts dynamically with backward compatibility
        $register->bank_transfer = $data['today_sales_bank_transfer_payment'] ?? 0;
        $register->cheque = $data['today_sales_cheque_payment'] ?? 0;
        $register->other = $data['today_sales_other_payment'] ?? 0;
        $register->total_sale = $data['today_sales_amount'];
        $register->total_return = $data['today_sales_return_amount'];
        $register->total_amount = $data['today_sales_payment_amount'];
        $register->notes = $input['notes'];
        $register->save();

        return $this->sendSuccess('Register entry updated successfully.');
    }

    public function getRegisterDetails(Request $request, $pos = null)
    {
        $register = $pos ? POSRegister::where('id', $pos) : POSRegister::where('user_id', Auth::id());

        if (! $pos) {
            $register->whereNull('closed_at');
        }

        $register = $register->first();

        $startDate = Carbon::now()->startOfDay()->toDateTimeString();
        $endDate = Carbon::now()->endOfDay()->toDateTimeString();

        if (! empty($register)) {
            $startDate = $register->created_at->toDateTimeString();
            if ($pos) {
                $endDate = $register->closed_at->toDateTimeString();
            }
        }

        if (!$pos && isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $startDate = Carbon::parse($fiscalYear->start_date)->startOfDay()->toDateTimeString();
                $endDate = Carbon::parse($fiscalYear->end_date)->endOfDay()->toDateTimeString();
            }
        }

        if ($pos) {
            $data = $this->getRegisterData($startDate, $endDate, $register->user_id);
        }else{
            $data = $this->getRegisterData($startDate, $endDate);
        }

        $data['cash_in_hand'] = $register->cash_in_hand ?? 0;
        $data['total_cash_amount'] = $data['cash_in_hand'] + ($data['todays_specific_sales_cash_payment'] ?? 0);
        $data['total_payment_amount'] = ($data['total_paid_amount'] ?? 0)
            - ($data['refunded_cash'] ?? 0);

        return $this->sendResponse($data, 'Details retrieved successfully');
    }

    public function registerReport(Request $request)
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        $input = $request->all();

        $register = $this->posReg;

        if (! empty($input['user_id'])) {
            $register->where('user_id', $input['user_id']);
        }

        if (! empty($input['start_date'])) {
            $register->whereDate('created_at', '>=', $input['start_date']);
        }

        if (! empty($input['end_date'])) {
            $register->whereDate('closed_at', '<=', $input['end_date']);
        }

        if (empty($input['start_date']) && empty($input['end_date']) && isFiscalYearFilterEnabled()) {

            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));

            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $register->whereDate('created_at', '>=', $fiscalYear->start_date)
                    ->whereDate('closed_at', '<=', $fiscalYear->end_date);
            }
        }

        $register->orderByDesc('created_at')->whereNotNull('closed_at');

        $register = $register->paginate($perPage);

        POSRegisterResource::usingWithCollection();

        return new POSRegisterCollection($register);
    }

    public function getRegisterData($startDate, $endDate, $user_id = null)
    {
        $totalGrandTotalAmount = Sale::where('user_id', $user_id ?? Auth::id())
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('grand_total');

        $saleIds = Sale::where('user_id', Auth::id())
            ->whereBetween('created_at', [$startDate, $endDate])
            ->pluck('id')
            ->toArray();

        // Get all active payment methods dynamically
        $paymentMethods = PaymentMethod::where('status', true)->get();

        // Initialize payment methods array for dynamic display
        $data['payment_methods'] = [];

        // Initialize default values to prevent undefined key errors
        $data['today_sales_cash_payment'] = 0;
        $data['todays_specific_sales_cash_payment'] = 0;
        $data['today_sales_cheque_payment'] = 0;
        $data['today_sales_bank_transfer_payment'] = 0;
        $data['today_sales_other_payment'] = 0;

        // Find cash payment method by checking common cash identifiers or the first payment method as fallback
        $cashPaymentMethod = $paymentMethods->first(function ($method) {
            $name = strtolower($method->name);
            return in_array($name, ['cash', 'efectivo', 'contant', 'bargeld', 'gotówka', 'наличные']);
        }) ?? $paymentMethods->first(); // Use first payment method as fallback if no cash found

        // Calculate totals for each payment method
        foreach ($paymentMethods as $paymentMethod) {
            $paymentAmount = SalesPayment::whereIn('sale_id', $saleIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_type', $paymentMethod->id)
                ->sum('amount');

            // Add to payment methods array
            $data['payment_methods'][] = [
                'id' => $paymentMethod->id,
                'name' => $paymentMethod->name,
                'amount' => $paymentAmount
            ];

            // For backward compatibility with existing POS register fields
            // Use the identified cash payment method or fallback logic
            if ($cashPaymentMethod && $paymentMethod->id === $cashPaymentMethod->id) {
                $data['today_sales_cash_payment'] = $paymentAmount;
                $data['todays_specific_sales_cash_payment'] = $paymentAmount;
            } elseif (strtolower($paymentMethod->name) === 'cheque') {
                $data['today_sales_cheque_payment'] = $paymentAmount;
            } elseif (strtolower($paymentMethod->name) === 'bank transfer') {
                $data['today_sales_bank_transfer_payment'] = $paymentAmount;
            } elseif (strtolower($paymentMethod->name) === 'other') {
                $data['today_sales_other_payment'] = $paymentAmount;
            }
        }

        $data['today_sales_amount'] = $totalGrandTotalAmount;

        $data['today_sales_return_amount'] = SaleReturn::whereIn('sale_id', $saleIds)
            ->sum('grand_total');

        $data['today_sales_payment_amount'] = SalesPayment::whereIn('sale_id', $saleIds)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');

        $data['today_sales_payment_amount'] = $data['today_sales_amount'] - $data['today_sales_return_amount'];
        $data['refunded_cash'] = SaleReturn::whereIn('sale_id', $saleIds)
            ->whereHas('sale', function (Builder $query) {
                $query->where('payment_type', Sale::CASH);
            })
            ->sum('grand_total');

        $paymentAmount = SalesPayment::whereIn('sale_id', $saleIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount');

        // Calculate unpaid amount
        $data['total_unpaid_amount'] = Sale::where('user_id', $user_id ?? Auth::id())
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', Sale::UNPAID)
            ->sum('grand_total');
        $data['total_paid_amount'] = $paymentAmount;

        return $data;
    }
}
