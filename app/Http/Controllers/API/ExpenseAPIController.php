<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Resources\ExpenseCollection;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Models\FiscalYear;
use App\Repositories\ExpenseRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class ExpenseAPIController
 */
class ExpenseAPIController extends AppBaseController
{
    /** @var ExpenseRepository */
    private $expenseRepository;

    public function __construct(ExpenseRepository $expenseRepository)
    {
        $this->expenseRepository = $expenseRepository;
    }

    public function index(Request $request): ExpenseCollection
    {
        $perPage = getPageSize($request);
        $expenses = Expense::with('warehouse', 'expenseCategory', 'user')->has('warehouse');

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));
            $fiscalYear = !empty($fiscalYearId)
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $expenses->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        if ($request->get('warehouse_id')) {
            $expenses->where('warehouse_id', $request->get('warehouse_id'));
        }
        $search = $request->filter['search'] ?? '';

        if (!empty($search)) {
            $expenses->where(function ($query) use ($search) {
                $query
                    ->where('title', 'LIKE', "%$search%")
                    ->orWhereHas('user', function (Builder $q) use ($search) {
                        $q->where(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%$search%");
                    })
                    ->orWhereHas('warehouse', function (Builder $q) use ($search) {
                        $q->where('name', 'LIKE', "%$search%");
                    })
                    ->orWhereHas('expenseCategory', function (Builder $q) use ($search) {
                        $q->where('name', 'LIKE', "%$search%");
                    });
            });
        }
        $expenses = $expenses->paginate($perPage);
        ExpenseResource::usingWithCollection();

        return new ExpenseCollection($expenses);
    }

    public function store(CreateExpenseRequest $request): ExpenseResource
    {
        $input = $request->all();
        $expense = $this->expenseRepository->storeExpense($input);

        return new ExpenseResource($expense);
    }

    public function show($id): ExpenseResource
    {
        $expense = $this->expenseRepository->find($id);

        return new ExpenseResource($expense);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateExpenseRequest $request, $id): ExpenseResource
    {
        $input = $request->all();
        $expense = $this->expenseRepository->update($input, $id);

        return new ExpenseResource($expense);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids)) {
            return $this->sendError('Invalid request format.');
        }

        if (count($ids) == 1) {
            $this->expenseRepository->delete($ids[0]);

            return $this->sendSuccess('Expense deleted successfully');
        }

        $canDeleteIds = [];
        foreach ($ids as $id) {
            try {
                $this->expenseRepository->delete($id);
            } catch (\Exception $e) {
                $canDeleteIds[] = [
                    'id' => $id,
                    'name' => Expense::find($id)?->reference_code ?? $id,
                ];
            }
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds
        ], __('Expenses category deleted successfully'));
        // $this->expenseRepository->delete($id);

        // return $this->sendSuccess('Expense deleted successfully');
    }
}
