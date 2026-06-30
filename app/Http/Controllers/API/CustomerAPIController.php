<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerCollection;
use App\Http\Resources\CustomerResource;
use App\Imports\CustomerImport;
use App\Models\Customer;
use App\Models\CustomerWalletTransaction;
use App\Models\FiscalYear;
use App\Models\Sale;
use App\Models\SalesPayment;
use App\Models\User;
use App\Repositories\CustomerRepository;
use Barryvdh\DomPDF\Facade\Pdf as CPDF;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Maatwebsite\Excel\Facades\Excel;
use Mccarlosen\LaravelMpdf\Facades\LaravelMpdf as PDF;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class CustomerAPIController
 */
class CustomerAPIController extends AppBaseController
{
    /** @var CustomerRepository */
    private $customerRepository;

    public function __construct(CustomerRepository $customerRepository)
    {
        $this->customerRepository = $customerRepository;
    }

    public function index(Request $request): CustomerCollection
    {
        $perPage = getPageSize($request);
        $customers = $this->customerRepository->paginate($perPage);
        CustomerResource::usingWithCollection();

        return new CustomerCollection($customers);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateCustomerRequest $request): CustomerResource
    {
        $input = $request->all();
        if (! empty($input['dob'])) {
            $input['dob'] = $input['dob'] ?? date('Y/m/d');
        }
        $customer = $this->customerRepository->create($input);

        return new CustomerResource($customer);
    }

    public function show($id): CustomerResource
    {
        $customer = $this->customerRepository->find($id);

        return new CustomerResource($customer);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateCustomerRequest $request, $id)
    {
        $input = $request->all();
        if (! empty($input['dob'])) {
            $input['dob'] = $input['dob'] ?? date('Y/m/d');
        }

        try {
            $customer = $this->customerRepository->find($id);
            $user = User::find($customer->user_id);
            if ($user) {
                if (empty($input['email'])) {
                    return $this->sendError('Email is required.');
                } else if (User::withoutGlobalScope('tenant')->where('email', $input['email'])->where('id', '!=', $user->id)->exists()) {
                    return $this->sendError('This email is already taken in users.');
                }
            }

            DB::beginTransaction();

            $customer = $this->customerRepository->update($input, $id);

            if ($user) {
                $user->email = $input['email'];
                $user->phone = $input['phone'] ?? null;
                $user->save();
            }

            DB::commit();
            return new CustomerResource($customer);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        if (count($ids) === 1) {
            if (getSettingValue('default_customer') == $ids[0]) {
                return $this->SendError(__('messages.error.default_customer_cant_delete'));
            }
            $this->customerRepository->delete($ids[0]);

            return $this->sendSuccess('Customer deleted successfully');
        }

        $failed = [];

        foreach ($ids as $id) {
            $customer = $this->customerRepository->find($id);

            if (getSettingValue('default_customer') == $id) {
                $failed[] = [
                    'id' => $id,
                    'name' => $customer->name ?? '',
                ];
            } else {
                $customer->delete();
            }
        }

        return $this->sendResponse([
            'show_model' => count($failed) > 0,
            'ids' => $failed,
        ], 'Customer delete process completed.');
        // if (getSettingValue('default_customer') == $id) {
        //     return $this->SendError('Default customer can\'t be deleted');
        // }
        // $this->customerRepository->delete($id);

        // return $this->sendSuccess('Customer deleted successfully');
    }

    public function bestCustomersPdfDownload(): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $month = Carbon::now()->month;
        $topCustomers = Customer::withoutGlobalScope('tenant')
            ->leftJoin('sales', 'customers.id', '=', 'sales.customer_id')
            ->whereMonth('sales.date', $month)
            ->where('customers.tenant_id', currentTenantId())
            ->select('customers.*', DB::raw('sum(sales.grand_total) as grand_total'))
            ->groupBy('customers.id')
            ->orderBy('grand_total', 'desc')
            ->latest()
            ->take(5)
            ->withCount([
                'sales' => function ($query) {
                    $query->where('sales.tenant_id', currentTenantId());
                }
            ])
            ->get();

        $data = [];

        if (Storage::exists('pdf/best-customers.pdf')) {
            Storage::delete('pdf/best-customers.pdf');
        }

        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.best-customers-pdf' : 'pdf.best-customers-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('topCustomers', 'companyLogo'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('topCustomers', 'companyLogo'));
        }

        Storage::disk(config('app.media_disc'))->put('pdf/best-customers.pdf', $pdf->output());
        $data['best_customers_pdf_url'] = Storage::url('pdf/best-customers.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function pdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $fiscalYear = null;
        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = request()->get('fiscal_year_id');
            $fiscalYear = !empty($fiscalYearId) && $fiscalYearId != 'null'
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();
        }

        $customer = $customer->load(['sales' => function ($query) use ($fiscalYear) {
            if ($fiscalYear) {
                $query->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
            $query->with('payments');
        }]);

        $salesData = [];

        $salesData['totalSale'] = $customer->sales->count();

        $salesData['totalAmount'] = $customer->sales->sum('grand_total');

        $salesData['totalPaid'] = 0;

        foreach ($customer->sales as $sale) {
            $salesData['totalPaid'] = $salesData['totalPaid'] + $sale->payments->sum('amount');
        }

        $salesData['totalSalesDue'] = $salesData['totalAmount'] - $salesData['totalPaid'];

        $data = [];

        if (Storage::exists('pdf/customers-report-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customers-report-' . $customer->id . '.pdf');
        }

        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customers-report-pdf' : 'pdf.customers-report-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('customer', 'companyLogo', 'salesData'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('customer', 'companyLogo', 'salesData'));
        }

        Storage::disk(config('app.media_disc'))->put('pdf/customers-report-' . $customer->id . '.pdf', $pdf->output());
        $data['customers_report_pdf_url'] = Storage::url('pdf/customers-report-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerSalesPdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customer = $customer->load('sales.payments');

        $data = [];

        if (Storage::exists('pdf/customer-sales-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customer-sales-' . $customer->id . '.pdf');
        }

        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-sales-pdf' : 'pdf.customer-sales-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('customer', 'companyLogo'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('customer', 'companyLogo'));
        }

        Storage::disk(config('app.media_disc'))->put('pdf/customer-sales-' . $customer->id . '.pdf', $pdf->output());
        $data['customers_sales_pdf_url'] = Storage::url('pdf/customer-sales-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerQuotationsPdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customer = $customer->load('quotations');

        $data = [];

        if (Storage::exists('pdf/customer-quotations-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customer-quotations-' . $customer->id . '.pdf');
        }

        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-quotations-pdf' : 'pdf.customer-quotations-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('customer', 'companyLogo'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('customer', 'companyLogo'));
        }
        Storage::disk(config('app.media_disc'))->put('pdf/customer-quotations-' . $customer->id . '.pdf', $pdf->output());
        $data['customers_quotations_pdf_url'] = Storage::url('pdf/customer-quotations-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerReturnsPdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customer = $customer->load('salesReturns');

        $data = [];

        if (Storage::exists('pdf/customer-returns-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customer-returns-' . $customer->id . '.pdf');
        }

        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-returns-pdf' : 'pdf.customer-returns-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('customer', 'companyLogo'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('customer', 'companyLogo'));
        }
        Storage::disk(config('app.media_disc'))->put('pdf/customer-returns-' . $customer->id . '.pdf', $pdf->output());
        $data['customers_returns_pdf_url'] = Storage::url('pdf/customer-returns-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerPaymentsPdfDownload($id): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $saleIds = [];

        $sales = Sale::whereCustomerId($id)->get();

        foreach ($sales as $sale) {
            $saleIds[] = $sale->id;
        }

        $payments = SalesPayment::whereIn('sale_id', $saleIds)->with('sale')->get();

        $data = [];

        if (Storage::exists('pdf/customer-payments-' . $id . '.pdf')) {
            Storage::delete('pdf/customer-payments-' . $id . '.pdf');
        }

        $companyLogo = getLogoUrl();

        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-payments-pdf' : 'pdf.customer-payments-pdf';
        if (getLoginUserLanguage() == 'ar') {
            $pdf = PDF::loadView($pdfViewPath, compact('payments', 'companyLogo'));
        } else {
            $pdf = CPDF::loadView($pdfViewPath, compact('payments', 'companyLogo'));
        }

        Storage::disk(config('app.media_disc'))->put('pdf/customer-payments-' . $id . '.pdf', $pdf->output());
        $data['customers_payments_pdf_url'] = Storage::url('pdf/customer-payments-' . $id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function importCustomers(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv',
        ]);
        Excel::import(new CustomerImport(), request()->file('file'));

        return $this->sendSuccess('Customers imported successfully');
    }

    public function getDashboardData(Request $request, $id = null)
    {
        $authid = Auth::id();
        $customer = Customer::withoutGlobalScope('tenant')->where('user_id', $authid)->first();
        if ($id) {
            $customer = Customer::withoutGlobalScope('tenant')->where('id', $id)->first();
        }

        if (!$customer) {
            return $this->sendError('Customer not found');
        }

        $totalPurchasesAmount = $customer->sales()->sum('grand_total');

        $totalPurchasesReturnAmount = $customer->salesReturns()->sum('grand_total');

        $wallet = $customer->wallet;
        $currentWalletBalance = $wallet ? $wallet->amount : 0;

        $totalSpentWalletAmount = 0;
        if ($wallet) {
            $totalSpentWalletAmount = $wallet->transactions()
                ->where('direction', CustomerWalletTransaction::DIRECTION_DEBIT)
                ->where('status', CustomerWalletTransaction::STATUS_APPROVED)
                ->sum('amount');
        }

        // 5. Total Added Wallet Amount (CREDIT transactions)
        $totalAddedWalletAmount = 0;
        if ($wallet) {
            $totalAddedWalletAmount = $wallet->transactions()
                ->where('direction', CustomerWalletTransaction::DIRECTION_CREDIT)
                ->where('status', CustomerWalletTransaction::STATUS_APPROVED)
                ->sum('amount');
        }

        $dashboardData = [
            'total_purchases_amount' => (float) $totalPurchasesAmount,
            'total_purchases_return_amount' => (float) $totalPurchasesReturnAmount,
            'current_wallet_balance' => (float) $currentWalletBalance,
            'total_spent_wallet_amount' => (float) $totalSpentWalletAmount,
            'total_added_wallet_amount' => (float) $totalAddedWalletAmount,
        ];

        return $this->sendResponse($dashboardData, 'Dashboard data retrieved successfully');
    }
}
