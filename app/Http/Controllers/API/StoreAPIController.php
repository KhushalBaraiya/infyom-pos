<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateStoreRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Http\Resources\StoreCollection;
use App\Http\Resources\StoreResource;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use App\Repositories\StoreRepository;
use Exception;
use Illuminate\Support\Facades\Auth;

class StoreAPIController extends AppBaseController
{
    /** @var StoreRepository */
    private $storeRepository;

    public function __construct(StoreRepository $storeRepository)
    {
        $this->storeRepository = $storeRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): StoreCollection
    {
        $perPage = getPageSize($request);
        $userStores = UserStore::where('user_id', auth()->id())->pluck('store_id')->toArray();
        if (!empty($userStores)) {
            $stores = $this->storeRepository->whereIn('id', $userStores)->paginate($perPage);
        } else {
            $stores = $this->storeRepository->paginate($perPage);
        }

        StoreResource::usingWithCollection();

        return new StoreCollection($stores);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateStoreRequest $request)
    {
        $input = $request->all();

        $store = $this->storeRepository->store($input);

        return new StoreResource($store);
    }

    /**
     * Display the specified resource.
     */
    public function show(Store $store)
    {
        return new StoreResource($store);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStoreRequest $request, Store $store)
    {
        $input = $request->all();

        $store = $this->storeRepository->updateStore($input, $store->id);

        return new StoreResource($store);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Store $store)
    {
        try {
            $this->storeRepository->deleteStore($store->id);

            return $this->sendSuccess(__('messages.success.store_deleted'));
        } catch (Exception $exception) {
            return $this->sendError($exception->getMessage());
        }
    }

    public function changeStore(Store $store)
    {
        try {
            User::find(auth()->id())->update(['tenant_id' => $store->tenant_id]);

            return $this->sendSuccess(__('messages.success.active_store_changed'));
        } catch (Exception $exception) {
            return $this->sendError($exception->getMessage());
        }
    }

    public function changeStatus(Store $store)
    {
        try {
            if ($store->tenant_id == Auth::user()->tenant_id) {
                return $this->sendError(__('messages.error.cannot_deactivate_active_store'));
            }

            if ($store->status) {
                $userStore = UserStore::where('store_id', $store->id)->exists();
                if ($userStore) {
                    return $this->sendError(__('messages.error.cannot_disable_already_assigned_store'));
                }
            }

            $store->status = !$store->status;
            $store->save();
            clearStoreCache($store->tenant_id);

            return $this->sendSuccess(__('messages.success.store_status_changed'));
        } catch (Exception $exception) {
            return $this->sendError($exception->getMessage());
        }
    }

    public function changeDefaultStore(Store $store)
    {
        try {
            $previousDefaultStore = getDefaultStore();
            Store::where('id', '!=', $store->id)->where('is_default', true)->update(['is_default' => false]);
            $store->is_default = true;
            $store->status = true;
            $store->save();
            clearStoreCache($store->tenant_id);
            if ($previousDefaultStore?->tenant_id && $previousDefaultStore->tenant_id !== $store->tenant_id) {
                clearStoreCache($previousDefaultStore->tenant_id);
            }
            return $this->sendSuccess(__('Default store changed successfully'));
        } catch (Exception $exception) {
            return $this->sendError($exception->getMessage());
        }
    }
}
