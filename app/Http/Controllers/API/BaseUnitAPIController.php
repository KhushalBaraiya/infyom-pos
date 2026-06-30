<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateBaseUnitRequest;
use App\Http\Requests\UpdateBaseUnitRequest;
use App\Http\Resources\BaseUnitCollection;
use App\Http\Resources\BaseUnitResource;
use App\Models\BaseUnit;
use App\Repositories\BaseUnitRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class BaseUnitAPIController
 */
class BaseUnitAPIController extends AppBaseController
{
    /**
     * @var BaseUnitRepository
     */
    private $baseUnitRepository;

    public function __construct(BaseUnitRepository $baseUnitRepository)
    {
        $this->baseUnitRepository = $baseUnitRepository;
    }

    public function index(Request $request): BaseUnitCollection
    {
        $perPage = getPageSize($request);
        $baseUnits = $this->baseUnitRepository;

        $baseUnits = $baseUnits->paginate($perPage);

        BaseUnitResource::usingWithCollection();

        return new BaseUnitCollection($baseUnits);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateBaseUnitRequest $request): BaseUnitResource
    {
        $input = $request->all();
        $baseUnit = $this->baseUnitRepository->create($input);
        BaseUnitResource::usingWithCollection();

        return new BaseUnitResource($baseUnit);
    }

    public function show($id): BaseUnitResource
    {
        $baseUnit = $this->baseUnitRepository->find($id);

        return new BaseUnitResource($baseUnit);
    }

    public function edit($id): BaseUnitResource
    {
        $baseUnit = $this->baseUnitRepository->find($id);

        return new BaseUnitResource($baseUnit);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateBaseUnitRequest $request, $id): BaseUnitResource
    {
        $input = $request->all();
        $baseUnit = $this->baseUnitRepository->update($input, $id);

        return new BaseUnitResource($baseUnit);
    }


    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $canDeleteIds = [];

        if (count($ids) == 1) {
            $baseUnit = BaseUnit::find($ids[0]);

            if ($baseUnit) {
                if ($baseUnit->is_default) {
                    return $this->sendError(__('messages.error.default_base_unit_cant_delete'));
                }

                $inUse = $this->baseUnitRepository->baseUnitCantDelete($ids[0]);
                if ($inUse) {
                    return $this->sendError(__('messages.error.base_unit_in_use'));
                }

                $this->baseUnitRepository->delete($ids[0]);

                return $this->sendSuccess('Base unit deleted successfully');
            }
        }

        foreach ($ids as $id) {
            $baseUnit = BaseUnit::find($id);
            if ($baseUnit) {
                if ($baseUnit->is_default || $this->baseUnitRepository->baseUnitCantDelete($id)) {
                    $canDeleteIds[] = [
                        'id' => $id,
                        'name' => $baseUnit->name ?? 'Unnamed'
                    ];
                    continue;
                }

                $this->baseUnitRepository->delete($id);
            }
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds
        ], 'Base units deleted successfully');

        // $defaultBaseUnit = BaseUnit::whereId($id)->where('is_default', true)->exists();

        // if ($defaultBaseUnit) {
        //     return $this->sendError('Default Base unit can\'t be deleted.');
        // }

        // $baseUnitUse = $this->baseUnitRepository->baseUnitCantDelete($id);
        // if ($baseUnitUse) {
        //     return $this->sendError('Base unit can\'t be deleted.');
        // }
        // $this->baseUnitRepository->delete($id);

        // return $this->sendSuccess('Base unit deleted successfully');
    }
}
