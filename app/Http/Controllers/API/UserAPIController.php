<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateChangePasswordRequest;
use App\Http\Requests\UpdateChangeUserPasswordRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\Customer;
use App\Models\POSRegister;
use App\Models\Role;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use App\Repositories\UserRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class UserAPIController
 */
class UserAPIController extends AppBaseController
{
    /** @var UserRepository */
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function index(Request $request): UserCollection
    {
        $perPage = getPageSize($request);
        $users = $this->userRepository->getUsers($perPage);
        UserResource::usingWithCollection();

        return new UserCollection($users);
    }

    public function store(CreateUserRequest $request): UserResource
    {
        $input = $request->all();
        $user = $this->userRepository->storeUser($input);

        return new UserResource($user);
    }

    public function show($id): UserResource
    {
        $user = $this->userRepository->withoutGlobalScope('tenant')->find($id);

        return new UserResource($user);
    }

    /**
     * @return UserResource|JsonResponse
     */
    public function update(UpdateUserRequest $request, $id)
    {
        $user = $this->userRepository->withoutGlobalScope('tenant')->find($id);

        if (Auth::id() == $user->id) {
            return $this->sendError('User can\'t be updated.');
        }
        $input = $request->all();
        $customer = Customer::withoutGlobalScope('tenant')->where('user_id', $user->id)->first();
        if ($customer) {
            if (Customer::withoutGlobalScope('tenant')->where('email', $input['email'])->where('id', '!=', $customer->id)->exists()) {
                return $this->sendError('This email is already taken in customers.');
            }
            $customer->email = $input['email'];
            $customer->phone = $input['phone'] ?? null;
            $customer->save();
        }
        $user = $this->userRepository->updateUser($input, $user->id);

        return new UserResource($user);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        $failed = [];

        foreach ($ids as $id) {
            $user = User::withoutGlobalScope('tenant')->find($id);
            if (empty($user)) {
                $failed[] = [
                    'id' => $id,
                    'name' => 'We can\'t find a user ' . $id,
                ];
                continue;
            }
            if (Auth::id() == $id) {
                $failed[] = [
                    'id' => $id,
                    'name' => $user->full_name ?? '',
                ];
                continue;
            }

            $user->delete();
        }

        if (count($ids) == 1 && count($failed) > 0) {
            return $this->sendError(__('messages.error.user_cant_delete'));
        }

        $message = count($ids) == 1 ? 'User deleted successfully.' : 'Users deleted successfully.';

        return $this->sendResponse([
            'show_model' => count($failed) > 0,
            'ids' => $failed,
        ], $message);

        // $user = $this->userRepository->withoutGlobalScope('tenant')->find($id);

        // if (Auth::id() == $user->id) {
        //     return $this->sendError('User can\'t be deleted.');
        // }
        // $this->userRepository->delete($user->id);

        // return $this->sendSuccess('User deleted successfully');
    }

    public function editProfile(): UserResource
    {
        $user = Auth::user();

        return new UserResource($user);
    }

    public function updateProfile(UpdateUserProfileRequest $request): UserResource
    {
        $input = $request->all();
        $updateUser = $this->userRepository->updateUserProfile($input);

        return new UserResource($updateUser);
    }

    public function changePassword(UpdateChangePasswordRequest $request): JsonResponse
    {
        $input = $request->all();
        try {
            $this->userRepository->updatePassword($input);

            return $this->sendSuccess('Password updated successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    public function changeUserPassword(UpdateChangeUserPasswordRequest $request): JsonResponse
    {
        $input = $request->all();
        try {
            $this->userRepository->updateUserPassword($input);

            return $this->sendSuccess('Password updated successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    public function updateLanguage(Request $request): JsonResponse
    {
        $language = $request->get('language');

        /** @var User $user */
        $user = Auth::user();
        $user->update([
            'language' => $language,
        ]);

        return $this->sendResponse($user->language, 'Language Updated Successfully');
    }

    public function config(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->hasRole(Role::ADMIN)) {
            $storeModal = false;
        } else {
            if (Store::where('tenant_id', $user->tenant_id)->where('status', 1)->exists()) {
                $storeModal = false;
            } else {
                $userStores = UserStore::where('user_id', $user->id)->get();
                if ($userStores->count() > 0) {
                    foreach ($userStores as $userStore) {
                        if ($userStore->store->status == 1) {
                            $storeModal = false;
                            $user->update([
                                'tenant_id' => $userStore->store->tenant_id
                            ]);
                            break;
                        } else {
                            $userStore->delete();
                            $storeModal = true;
                        }
                    }
                } else {
                    $storeModal = true;
                }
            }
        }

        $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();

        $composerFile = file_get_contents('../composer.json');
        $composerData = json_decode($composerFile, true);
        $currentVersion = isset($composerData['version']) ? $composerData['version'] : '';
        $dateFormat = getSettingValue('date_format');

        $openRegister = POSRegister::where('user_id', Auth::id())
            ->whereNull('closed_at')
            ->exists();

        return $this->sendResponse([
            'store_name' => getActiveStoreName(),
            'store_logo' => getLogoUrl(),
            'permissions' => $userPermissions,
            'version' => $currentVersion,
            'date_format' => $dateFormat,
            'store_modal' => $storeModal,
            'is_version' => getSettingValue('show_version_on_footer'),
            'is_currency_right' => getSettingValue('is_currency_right'),
            'thousands_separator' => getSettingValue('thousands_separator'),
            'decimal_separator' => getSettingValue('decimal_separator'),
            'decimal_places' => getSettingValue('decimal_places'),
            'open_register' => $openRegister ? false : true,
            'enable_nepali_datepicker' => (getSettingValue('enable_nepali_datepicker') ?? false),
        ], 'Config retrieved successfully.');
    }
}
