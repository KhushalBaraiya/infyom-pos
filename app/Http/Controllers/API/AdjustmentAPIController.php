<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CraeteAdjustmentRequest;
use App\Http\Requests\UpdateAdjustmentRequest;
use App\Http\Resources\AdjustmentCollection;
use App\Http\Resources\AdjustmentResource;
use App\Models\Adjustment;
use App\Models\AdjustmentItem;
use App\Models\FiscalYear;
use App\Models\ManageStock;
use App\Repositories\AdjustmentRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AdjustmentAPIController extends AppBaseController
{
    /** @var AdjustmentRepository */
    private $adjustmentRepository;

    public function __construct(AdjustmentRepository $adjustmentRepository)
    {
        $this->adjustmentRepository = $adjustmentRepository;
    }

    public function index(Request $request): AdjustmentCollection
    {
        $perPage = getPageSize($request);

        $adjustments = $this->adjustmentRepository;

        if ($request->get('warehouse_id')) {
            $adjustments->where('warehouse_id', $request->get('warehouse_id'));
        }

        if (isFiscalYearFilterEnabled()) {
            $fiscalYearId = $request->input('filter.fiscal_year_id', $request->get('fiscal_year_id'));
            $fiscalYear = !empty($fiscalYearId)
                ? FiscalYear::find($fiscalYearId)
                : FiscalYear::where('is_active', true)->first();

            if ($fiscalYear) {
                $adjustments->whereDate('date', '>=', $fiscalYear->start_date)
                    ->whereDate('date', '<=', $fiscalYear->end_date);
            }
        }

        $adjustments = $adjustments->paginate($perPage);

        AdjustmentResource::usingWithCollection();

        return new AdjustmentCollection($adjustments);
    }

    public function store(CraeteAdjustmentRequest $request): AdjustmentResource
    {
        $input = $request->all();
        $adjustment = $this->adjustmentRepository->storeAdjustment($input);

        return new AdjustmentResource($adjustment);
    }

    public function show(Adjustment $adjustment): AdjustmentResource
    {
        $adjustment = $adjustment->load('adjustmentItems.product');

        return new AdjustmentResource($adjustment);
    }

    public function edit(Adjustment $adjustment): AdjustmentResource
    {
        $adjustment = $adjustment->load('adjustmentItems.product.stocks', 'warehouse');

        return new AdjustmentResource($adjustment);
    }

    public function update(UpdateAdjustmentRequest $request, $id): AdjustmentResource
    {
        $input = $request->all();
        $adjustment = $this->adjustmentRepository->updateAdjustment($input, $id);

        return new AdjustmentResource($adjustment);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $canDeleteIds = [];

        if (count($ids) === 1) {
            try {
                DB::beginTransaction();

                $adjustment = $this->adjustmentRepository
                    ->with('adjustmentItems')
                    ->where('id', $ids[0])
                    ->firstOrFail();

                foreach ($adjustment->adjustmentItems as $adjustmentItem) {
                    $oldItem = AdjustmentItem::findOrFail($adjustmentItem->id);

                    $existProductStock = ManageStock::whereWarehouseId($adjustment->warehouse_id)
                        ->whereProductId($oldItem->product_id)
                        ->first();

                    if (!$existProductStock) {
                        throw new Exception('Stock record not found.');
                    }

                    $totalQuantity = $oldItem->method_type === AdjustmentItem::METHOD_ADDITION
                        ? $existProductStock->quantity - $oldItem->quantity
                        : $existProductStock->quantity + $oldItem->quantity;

                    $existProductStock->update(['quantity' => $totalQuantity]);
                }

                $this->adjustmentRepository->delete($ids[0]);

                DB::commit();

                return $this->sendSuccess('Adjustment deleted successfully.');
            } catch (Exception $e) {
                DB::rollBack();
                return $this->sendError("Failed to delete adjustment: " . $e->getMessage());
            }
        }

        foreach ($ids as $id) {
            try {
                DB::beginTransaction();

                $adjustment = $this->adjustmentRepository
                    ->with('adjustmentItems')
                    ->where('id', $id)
                    ->first();

                if (!$adjustment) {
                    continue;
                }

                foreach ($adjustment->adjustmentItems as $adjustmentItem) {
                    $oldItem = AdjustmentItem::find($adjustmentItem->id);

                    if (!$oldItem) {
                        throw new Exception("Adjustment item not found.");
                    }

                    $existProductStock = ManageStock::whereWarehouseId($adjustment->warehouse_id)
                        ->whereProductId($oldItem->product_id)
                        ->first();

                    if (!$existProductStock) {
                        throw new Exception("Product stock not found.");
                    }

                    $totalQuantity = $oldItem->method_type === AdjustmentItem::METHOD_ADDITION
                        ? $existProductStock->quantity - $oldItem->quantity
                        : $existProductStock->quantity + $oldItem->quantity;

                    $existProductStock->update(['quantity' => $totalQuantity]);
                }

                $this->adjustmentRepository->delete($id);
                DB::commit();
            } catch (Exception $e) {
                DB::rollBack();
                $canDeleteIds[] = [
                    'id' => $id,
                    'reason' => $e->getMessage()
                ];
            }
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds
        ], 'Adjustments deleted successfully.');

        // try {
        //     DB::beginTransaction();

        //     $adjustment = $this->adjustmentRepository->with('adjustmentItems')->where('id', $id)->firstOrFail();

        //     foreach ($adjustment->adjustmentItems as $adjustmentItem) {
        //         $oldItem = AdjustmentItem::whereId($adjustmentItem->id)->firstOrFail();
        //         $existProductStock = ManageStock::whereWarehouseId($adjustment->warehouse_id)->whereProductId($oldItem->product_id)->first();

        //         if ($oldItem->method_type == AdjustmentItem::METHOD_ADDITION) {
        //             $totalQuantity = $existProductStock->quantity - $oldItem['quantity'];
        //         } else {
        //             $totalQuantity = $existProductStock->quantity + $oldItem['quantity'];
        //         }

        //         $existProductStock->update([
        //             'quantity' => $totalQuantity,
        //         ]);
        //     }

        //     $this->adjustmentRepository->delete($id);

        //     DB::commit();

        //     return $this->sendSuccess('Adjustment delete successfully');
        // } catch (Exception $e) {
        //     DB::rollBack();
        //     throw new UnprocessableEntityHttpException($e->getMessage());
        // }
    }
}
