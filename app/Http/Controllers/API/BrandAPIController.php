<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Resources\BrandCollection;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Models\Product;
use App\Repositories\BrandRepository;
use Illuminate\Http\Request;

class BrandAPIController extends AppBaseController
{
    /** @var BrandRepository */
    private $brandRepository;

    public function __construct(BrandRepository $brandRepository)
    {
        $this->brandRepository = $brandRepository;
    }

    public function index(Request $request): BrandCollection
    {
        $perPage = getPageSize($request);
        $sort = null;
        if ($request->sort == 'product_count') {
            $sort = 'asc';
            $request->request->remove('sort');
        } elseif ($request->sort == '-product_count') {
            $sort = 'desc';
            $request->request->remove('sort');
        }
        $brands = $this->brandRepository->withCount('products')->when(
            $sort,
            function ($q) use ($sort) {
                $q->orderBy('products_count', $sort);
            }
        )->paginate($perPage);

        BrandResource::usingWithCollection();

        return new BrandCollection($brands);
    }

    public function store(CreateBrandRequest $request): BrandResource
    {
        $input = $request->all();
        $brand = $this->brandRepository->storeBrand($input);

        BrandResource::usingWithCollection();

        return new BrandResource($brand);
    }

    public function show($id): BrandResource
    {
        $brand = Brand::withCount('products')->findOrFail($id);

        return new BrandResource($brand);
    }

    public function update(UpdateBrandRequest $request, $id)
    {
        $input = $request->all();

        $brand = $this->brandRepository->updateBrand($input, $id);

        return new BrandResource($brand);
    }

    public function destroy(Request $request)
    {
        $ids = $request->id;

        if (!is_array($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $productModels = [
            Product::class,
        ];
        $canDeleteIds = [];

        if (count($ids) == 1) {
            $brand = Brand::find($ids[0]);
            if ($brand) {
                $productResult = canDelete($productModels, 'brand_id', $ids[0]);
                if ($productResult) {
                    return $this->sendError(__('messages.error.brand_in_use'));
                } else {
                    $brand->delete();
                }
                return $this->sendSuccess(__('Brand deleted successfully.'));
            }
        }

        foreach ($ids as $id) {
            $brand = Brand::find($id);
            if ($brand) {
                $productResult = canDelete($productModels, 'brand_id', $id);
                if ($productResult) {
                    $canDeleteIds[] = [
                        'id' => $id,
                        'name' => $brand->name
                    ];
                } else {
                    if ($brand) {
                        $brand->delete();
                    }
                }
            }
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds
        ], 'Brands deleted successfully');

        // $productModels = [
        //     Product::class,
        // ];
        // $productResult = canDelete($productModels, 'brand_id', $id);

        // if ($productResult) {
        //     return $this->sendError('Brand can\'t be deleted.');
        // }

        // Brand::findOrFail($id)->delete();

        // return $this->sendSuccess('Brand deleted successfully');
    }
}
