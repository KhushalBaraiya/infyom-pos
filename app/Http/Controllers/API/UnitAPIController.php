<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Http\Resources\UnitCollection;
use App\Http\Resources\UnitResource;
use App\Repositories\UnitRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class UnitAPIController
 */
class UnitAPIController extends AppBaseController
{
    /**
     * @var UnitRepository
     */
    private $unitRepository;

    public function __construct(UnitRepository $unitRepository)
    {
        $this->unitRepository = $unitRepository;
    }

    public function index(Request $request): UnitCollection
    {
        $perPage = getPageSize($request);
        $units = $this->unitRepository;

        if ($request->get('base_unit')) {
            $units->where('base_unit', $request->get('base_unit'));
        }

        $units = $units->paginate($perPage);

        UnitResource::usingWithCollection();

        return new UnitCollection($units);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateUnitRequest $request): UnitResource
    {
        $input = $request->all();
        $unit = $this->unitRepository->create($input);

        return new UnitResource($unit);
    }

    public function show($id): UnitResource
    {
        $unit = $this->unitRepository->find($id);

        return new UnitResource($unit);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateUnitRequest $request, $id): UnitResource
    {
        $input = $request->all();
        $unit = $this->unitRepository->update($input, $id);

        return new UnitResource($unit);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $canDeleteIds = [];

        if (count($ids) === 1) {
            $inUse = $this->unitRepository->unitCantDelete($ids[0]);

            if ($inUse) {
                return $this->sendError(__('messages.error.unit_in_use'));
            }

            $this->unitRepository->delete($ids[0]);

            return $this->sendSuccess('Unit deleted successfully');
        }

        foreach ($ids as $id) {
            $inUse = $this->unitRepository->unitCantDelete($id);
            $unit = $this->unitRepository->find($id);
            if ($inUse) {
                $canDeleteIds[] = [
                    'id' => $id,
                    'name' => $unit->name
                ];
            } else {
                $this->unitRepository->delete($id);
            }
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds
        ], 'Units deleted successfully');

        // $unitUse = $this->unitRepository->unitCantDelete($id);
        // if ($unitUse) {
        //     return $this->sendError('Unit can\'t be deleted.');
        // }

        // $this->unitRepository->delete($id);

        // return $this->sendSuccess('Unit deleted successfully');
    }
}
