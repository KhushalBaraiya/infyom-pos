<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateExpenseCategoryRequest;
use App\Http\Requests\UpdateExpenseCategoryRequest;
use App\Http\Resources\ExpenseCategoryCollection;
use App\Http\Resources\ExpenseCategoryResource;
use App\Models\Expense;
use App\Repositories\ExpenseCategoryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class ExpenseCategoryAPIController
 */
class ExpenseCategoryAPIController extends AppBaseController
{
    /** @var ExpenseCategoryRepository */
    private $expenseCategoryRepository;

    public function __construct(ExpenseCategoryRepository $expenseCategoryRepository)
    {
        $this->expenseCategoryRepository = $expenseCategoryRepository;
    }

    public function index(Request $request): ExpenseCategoryCollection
    {
        $perPage = getPageSize($request);
        $expenseCategories = $this->expenseCategoryRepository->paginate($perPage);
        ExpenseCategoryResource::usingWithCollection();

        return new ExpenseCategoryCollection($expenseCategories);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateExpenseCategoryRequest $request): ExpenseCategoryResource
    {
        $input = $request->all();
        $expenseCategory = $this->expenseCategoryRepository->create($input);

        return new ExpenseCategoryResource($expenseCategory);
    }

    public function show($id): ExpenseCategoryResource
    {
        $expenseCategory = $this->expenseCategoryRepository->find($id);

        return new ExpenseCategoryResource($expenseCategory);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateExpenseCategoryRequest $request, $id): ExpenseCategoryResource
    {
        $input = $request->all();
        $expenseCategory = $this->expenseCategoryRepository->update($input, $id);

        return new ExpenseCategoryResource($expenseCategory);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids)) {
            return $this->sendError('Invalid request format.');
        }
        $expenseModels = [
            Expense::class,
        ];
        if (count($ids) == 1) {
            $result = canDelete($expenseModels, 'expense_category_id', $ids[0]);
            if ($result) {
                return $this->sendError(__('messages.error.expense_category_in_use'));
            }
            $this->expenseCategoryRepository->delete($ids[0]);

            return $this->sendSuccess('Expense category deleted successfully');
        }

        $canDeleteIds = [];
        foreach ($ids as $id) {
            $expense = $this->expenseCategoryRepository->find($id);
            if ($expense) {
                if (canDelete($expenseModels, 'expense_category_id', $id)) {
                    $canDeleteIds[] = [
                        'id' => $id,
                        'name' => $expense->name ?? '',
                    ];
                } else {
                    $this->expenseCategoryRepository->delete($id);
                }
            }
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds
        ], __('Expenses category deleted successfully'));
        // $expenseModels = [
        //     Expense::class,
        // ];
        // $result = canDelete($expenseModels, 'expense_category_id', $id);
        // if ($result) {
        //     return $this->sendError('Expense category can\'t be deleted.');
        // }
        // $this->expenseCategoryRepository->delete($id);

        // return $this->sendSuccess('Expense category deleted successfully');
    }
}
