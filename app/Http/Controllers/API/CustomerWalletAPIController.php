<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CustomerWalletCollection;
use App\Http\Resources\CustomerWalletResource;
use App\Http\Resources\CustomerWalletTransactionCollection;
use App\Http\Resources\CustomerWalletTransactionResource;
use App\Models\Customer;
use App\Models\CustomerWallet;
use App\Models\CustomerWalletTransaction;
use App\Models\FiscalYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Class CustomerWalletAPIController
 */
class CustomerWalletAPIController extends AppBaseController
{
    public function getWalletTransactions(Request $request)
    {
        $authId = Auth::id();
        $customer = Customer::withoutGlobalScope('tenant')
            ->where('user_id', $authId)
            ->firstOrFail();

        $wallet = CustomerWallet::where('customer_id', $customer->id)->first();

        if (!$wallet) {
            return $this->sendResponse([], 'No wallet found for this customer');
        }

        $perPage = getPageSize($request) ?? 10;

        $sort = $request->get('sort', '-created_at');
        $sortField = ltrim($sort, '-');
        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';

        $allowedSorts = ['created_at', 'amount', 'type'];

        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }

        $status = $request->input('status');           // 0,1,2
        $type   = $request->input('direction_type');   // 1=debit, 2=credit
        $search = $request->input('filter.search');

        $transactions = CustomerWalletTransaction::where('wallet_id', $wallet->id)
            ->when(isset($status), function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when(isset($type), function ($query) use ($type) {
                $query->where('direction', $type);
            })
            ->when($search, function ($query) use ($search) {
                $matchedTypes = collect(CustomerWalletTransaction::transactionTypeMap())
                    ->filter(fn($label) => str_contains($label, $search))
                    ->keys()
                    ->toArray();
                $query->where(function ($q) use ($search, $matchedTypes) {
                    if (!empty($matchedTypes)) {
                        $q->orWhereIn('transaction_type', $matchedTypes);
                    }
                    $q->orWhere('amount', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage);

        CustomerWalletTransactionResource::usingWithCollection();

        return new CustomerWalletTransactionCollection($transactions);
    }

    /**
     * Get all wallet transactions with customer details
     */
    public function getAllWalletTransactions(Request $request)
    {
        $perPage = getPageSize($request) ?? 10;

        $userId = $request->input('user_id') ?? null;
        $sort = $request->get('sort', '-created_at');
        $sortField = ltrim($sort, '-');
        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';

        $allowedSorts = [
            'created_at',
            'amount',
            'transaction_type',
            'status',
            'customers.name',
            'customers.email',
        ];

        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }

        $search     = strtolower($request->input('filter.search'));
        $status     = $request->input('status');
        $type       = $request->input('direction_type');
        $customerId = $request->input('customer_id');

        $query = CustomerWalletTransaction::query()
            ->join('customer_wallets', 'customer_wallets.id', '=', 'customer_wallet_transactions.wallet_id')
            ->join('customers', 'customers.id', '=', 'customer_wallets.customer_id')
            ->select('customer_wallet_transactions.*');

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));
            $fiscalYear = !empty($fiscalYearId)
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $query->whereDate('customer_wallet_transactions.created_at', '>=', $fiscalYear->start_date)
                    ->whereDate('customer_wallet_transactions.created_at', '<=', $fiscalYear->end_date);
            }
        }

        $query->when(
            $userId,
            fn($q) =>
            $q->where('customers.id', $userId)
        );

        // 🔹 CUSTOMER FILTER
        $query->when(
            $customerId,
            fn($q) =>
            $q->where('customers.id', $customerId)
        );

        // 🔹 STATUS FILTER
        $query->when(
            isset($status),
            fn($q) =>
            $q->where('customer_wallet_transactions.status', $status)
        );

        // 🔹 DIRECTION FILTER
        $query->when(
            isset($type),
            fn($q) =>
            $q->where('customer_wallet_transactions.direction', $type)
        );

        // 🔹 SEARCH FILTER
        $query->when($search, function ($q) use ($search) {

            $matchedTypes = collect(CustomerWalletTransaction::transactionTypeMap())
                ->filter(fn($label) => str_contains($label, $search))
                ->keys()
                ->toArray();

            $q->where(function ($sub) use ($search, $matchedTypes) {

                // customer search
                $sub->where('customers.name', 'like', "%{$search}%")
                    ->orWhere('customers.email', 'like', "%{$search}%");

                // transaction type text search
                if (!empty($matchedTypes)) {
                    $sub->orWhereIn('customer_wallet_transactions.transaction_type', $matchedTypes);
                }

                // amount search
                if (is_numeric($search)) {
                    $sub->orWhere('customer_wallet_transactions.amount', $search);
                }
            });
        });

        $transactions = $query
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage);

        CustomerWalletTransactionResource::usingWithCollection();

        return new CustomerWalletTransactionCollection($transactions);
    }

    public function getWalletTransaction(CustomerWalletTransaction $transaction, Request $request): JsonResponse
    {
        return $this->sendResponse(new CustomerWalletTransactionResource($transaction), 'Wallet transaction retrieved successfully');
    }

    /**
     * Create add amount request (Customer)
     */
    public function createAddAmountRequest(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'notes' => 'nullable|string|max:500',
            'attachment' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:2048',
        ]);
        $authId = Auth::id();
        $customer = Customer::withoutGlobalScope('tenant')->where('user_id', $authId)->firstOrFail();

        $wallet = CustomerWallet::where('customer_id', $customer->id)->first();

        if (!$wallet) {
            $wallet = CustomerWallet::create([
                'customer_id' => $customer->id,
                'amount' => 0,
            ]);
        }

        $transaction = CustomerWalletTransaction::create([
            'wallet_id' => $wallet->id,
            'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
            'payment_method_id' => $request->payment_method_id,
            'amount' => $request->amount ?? 0,
            'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_ADD_AMOUNT,
            'status' => CustomerWalletTransaction::STATUS_PENDING,
            'notes' => $request->notes ?? null,
        ]);
        if ($request->hasFile('attachment')) {
            $transaction->addMedia($request->file('attachment'))->toMediaCollection(CustomerWalletTransaction::ATTACHMENT, config('app.media_disc'));
        }

        return $this->sendResponse(new CustomerWalletTransactionResource($transaction), 'Add amount request created successfully');
    }

    /**
     * Change status of wallet transaction (Admin)
     */
    public function changeStatus(CustomerWalletTransaction $transaction, Request $request): JsonResponse
    {
        if ($transaction->status !== CustomerWalletTransaction::STATUS_PENDING) {
            return $this->sendError('This request has already been processed');
        }
        $request->validate([
            'status' => 'required|in:1,2',
        ]);

        try {
            DB::beginTransaction();

            $transaction->update([
                'status' => $request->status === 1 ? CustomerWalletTransaction::STATUS_APPROVED : CustomerWalletTransaction::STATUS_REJECTED,
            ]);

            if ($request->status === CustomerWalletTransaction::STATUS_APPROVED) {
                $wallet = $transaction->wallet;
                $newBalance = $wallet->amount + $transaction->amount;
                $wallet->update(['amount' => $newBalance]);
            }

            DB::commit();

            return $this->sendResponse(new CustomerWalletTransactionResource($transaction), 'Request approved successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Failed to approve request: ' . $e->getMessage());
        }
    }

    /**
     * Get transaction history for admin
     */
    public function getTransactionHistory(Request $request): JsonResponse
    {
        $perPage = getPageSize($request);

        $transactions = CustomerWalletTransaction::with(['wallet.customer'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return $this->sendResponse(new CustomerWalletTransactionCollection($transactions), 'Transaction history retrieved successfully');
    }

    /**
     * Manual wallet adjustment by admin
     */
    public function adjustWallet(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric',
            'direction' => 'required|in:1,2', // 1 = debit, 2 = credit
            'notes' => 'required|string|max:500',
        ]);

        $customer = Customer::find($request->customer_id);
        $wallet = CustomerWallet::where('customer_id', $customer->id)->first();

        if (!$wallet) {
            $wallet = CustomerWallet::create([
                'customer_id' => $customer->id,
                'amount' => 0,
                'tenant_id' => Auth::user()->tenant_id,
            ]);
        }

        try {
            DB::beginTransaction();

            // Create adjustment transaction
            $transaction = CustomerWalletTransaction::create([
                'wallet_id' => $wallet->id,
                'direction' => $request->direction,
                'amount' => abs($request->amount),
                'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_ADMIN_ADJUSTMENT,
                'status' => CustomerWalletTransaction::STATUS_APPROVED,
                'notes' => $request->notes,
                'tenant_id' => Auth::user()->tenant_id,
            ]);

            // Update wallet balance
            $currentBalance = $wallet->amount;
            $newBalance = $request->direction === CustomerWalletTransaction::DIRECTION_CREDIT
                ? $currentBalance + $request->amount
                : $currentBalance - $request->amount;

            $wallet->update(['amount' => $newBalance]);

            DB::commit();

            return $this->sendResponse(new CustomerWalletTransactionResource($transaction), 'Wallet adjusted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Failed to adjust wallet: ' . $e->getMessage());
        }
    }
}
