<?php

namespace App\Repositories;

use App\Models\Customer;
use App\Models\CustomerWallet;
use App\Models\MultiTenant;
use App\Models\Role;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class UserRepository
 */
class UserRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'created_at',
        //        'roles.name',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return User::class;
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function storeUser($input)
    {
        try {
            DB::beginTransaction();
            $input['password'] = Hash::make($input['password']);
            $user = $this->create($input);

            if (isset($input['createUser']) && isset($input['id'])) {
                $customer = Customer::withoutGlobalScope('tenant')->find($input['id']);
                $role = Role::where('name', 'customer')->first();
                if (!$role || !$customer) {
                    return response()->json(['message' => 'Role not found, please create role first..'], 404);
                }
                $input['role_id'] = $role->id;
                $customer->email = $user->email;
                $customer->user_id = $user->id;
                $customer->save();
                CustomerWallet::create([
                    'customer_id' => $customer->id,
                    'wallet_balance' => 0,
                ]);
            }
            if (isset($input['role_id'])) {
                $user->assignRole($input['role_id']);
            }
            if (isset($input['image']) && ! empty($input['image'])) {
                $user->addMedia($input['image'])->toMediaCollection(
                    User::PATH,
                    config('app.media_disc')
                );
            }

            if (isset($input['stores']) && !empty($input['stores']) && is_string($input['stores'])) {
                $input['stores'] = array_filter(array_map('trim', explode(',', $input['stores'])));
                $input['stores'] = array_values($input['stores']);
                UserStore::where('user_id', $user->id)->delete();
                foreach ($input['stores'] as $storeId) {
                    UserStore::create([
                        'user_id' => $user->id,
                        'store_id' => $storeId,
                    ]);
                }
            }

            if (isset($input['stores']) && $input['stores']) {
                $store = Store::find($input['stores'][0]);
                $user->update([
                    'tenant_id' => $store->tenant_id,
                ]);
            }

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function updateUser($input, $id)
    {
        try {
            DB::beginTransaction();
            $user = $this->update($input, $id);

            if (isset($input['role_id'])) {
                $user->syncRoles($input['role_id']);
            }
            if (isset($input['image']) && $input['image']) {
                $user->clearMediaCollection(User::PATH);
                $user['image_url'] = $user->addMedia($input['image'])->toMediaCollection(
                    User::PATH,
                    config('app.media_disc')
                );
            }

            if (isset($input['stores'])) {
                if (!empty($input['stores']) && is_string($input['stores'])) {
                    $input['stores'] = array_filter(array_map('trim', explode(',', $input['stores'])));
                    $input['stores'] = array_values($input['stores']);
                    UserStore::where('user_id', $user->id)->delete();
                    foreach ($input['stores'] as $storeId) {
                        UserStore::create([
                            'user_id' => $user->id,
                            'store_id' => $storeId,
                        ]);
                    }
                }
                if (!in_array($user->tenant->store_id, $input['stores'])) {
                    $tenant = MultiTenant::where('store_id', $input['stores'][0])->first();
                    $user->update([
                        'tenant_id' => $tenant->id
                    ]);
                }
            } else {
                UserStore::where('user_id', $user->id)->delete();
            }

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return User|\Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function updateUserProfile($input)
    {
        try {
            DB::beginTransaction();
            unset($input['role_id']);

            $user = Auth::user();
            $user->update($input);

            if ((! empty($input['image']))) {
                $user->clearMediaCollection(User::PATH);
                $user->media()->delete();
                $user->addMedia($input['image'])->toMediaCollection(User::PATH, config('app.media_disc'));
            }
            DB::commit();

            return $user;
        } catch (\Exception $e) {
            DB::rollBack();

            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function getUsers($perPage)
    {
        $loginUserId = Auth::id();
        $returnAll = request()->get('returnAll') == 'true';

        if (Auth::user()->hasRole(Role::ADMIN)) {
            $query = $this->withoutGlobalScope('tenant');

            if (!$returnAll) {
                $query->where('id', '!=', $loginUserId);
            }
            if ($perPage == 0) {
                return $query->get();
            }
            return $query->paginate($perPage);
        }

        $query = $this->whereHas('roles', function ($q) {
            $q->where('name', '!=', Role::ADMIN);
        });
        if (!$returnAll) {
            $query->where('id', '!=', Auth::id());
        }

        return $query->paginate($perPage);
    }

    public function updatePassword(array $input): User
    {
        /** @var User $user */
        $user = Auth::user();
        if (! Hash::check($input['current_password'], $user->password)) {
            throw new UnprocessableEntityHttpException('Current password is invalid.');
        }
        $input['password'] = Hash::make($input['new_password']);
        $user->update($input);

        return $user;
    }

    public function updateUserPassword(array $input): User
    {
        /** @var User $user */
        $currentLoggedInUser = Auth::user();
        $user = $this->withoutGlobalScope('tenant')->find(id: $input['user_id']);

        if ($user->id == $currentLoggedInUser->id) {
            throw new UnprocessableEntityHttpException(__('messages.error.user_cant_updated'));
        }
        $input['password'] = Hash::make($input['password']);
        $user->update($input);

        return $user;
    }
}
