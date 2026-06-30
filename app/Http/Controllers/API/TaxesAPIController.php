<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateTaxRequest;
use App\Http\Requests\UpdateTaxRequest;
use App\Http\Resources\TaxCollection;
use App\Http\Resources\TaxResource;
use Illuminate\Http\JsonResponse;
use App\Models\Tax;
use App\Repositories\TaxRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TaxesAPIController extends AppBaseController
{
    /** @var TaxRepository */
    private $taxRepository;

    public function __construct(TaxRepository $taxRepository)
    {
        $this->taxRepository = $taxRepository;
    }

    public function index(Request $request): TaxCollection
    {
        $perPage = getPageSize($request);
        $taxes = $this->taxRepository->paginate($perPage);
        TaxResource::usingWithCollection();

        return new TaxCollection($taxes);
    }

    public function store(CreateTaxRequest $request): TaxResource
    {
        try {
            DB::beginTransaction();
            $input = $request->all();
            $tax = $this->taxRepository->create([
                'name' => $input['name'],
                'number' => $input['number'],
                'status' => 0,
            ]);
            DB::commit();
            return new TaxResource($tax);
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function show($tax): TaxResource
    {
        $tax = $this->taxRepository->find($tax);

        return new TaxResource($tax);
    }

    public function update(UpdateTaxRequest $request, $tax): TaxResource
    {
        try {
            DB::beginTransaction();
            $input = $request->all();
            $tax = $this->taxRepository->update($input, $tax);
            DB::commit();
            return new TaxResource($tax);
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        if (count($ids) === 1) {
            try {
                DB::beginTransaction();
                $tax = $this->taxRepository->delete($ids[0]);
                DB::commit();
                return $this->sendSuccess('Tax deleted successfully');
            } catch (Exception $e) {
                DB::rollBack();
                return $this->sendSuccess($e->getMessage());
            }
        }

        $failed = [];

        foreach ($ids as $id) {
            try {
                DB::beginTransaction();
                $this->taxRepository->delete($id);
                DB::commit();
            } catch (Exception $e) {
                DB::rollBack();
                $failed[] = ['id' => $id];
            }
        }

        return $this->sendResponse([
            'show_model' => count($failed) > 0,
            'ids' => $failed
        ], 'Tax delete process completed.');
    }

    public function changeStatus($tax)
    {
        try {
            DB::beginTransaction();
            $taxRecord = $this->taxRepository->findOrFail($tax);
            if ($taxRecord->status == 0) {
                if (Tax::where('status', 1)->count() >= 4) {
                    return $this->sendError(__('messages.error.you_can_not_enable_more_than_4_taxes'));
                }
            }
            $taxRecord->status = !$taxRecord->status;
            $taxRecord->save();
            DB::commit();
            return $this->sendSuccess(__('messages.success.tax_status_changed'));
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
    }
}
