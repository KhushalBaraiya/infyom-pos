<?php

namespace App\Models;

use App\Models\Permission;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Traits\HasJsonResourcefulData;
use Spatie\Permission\Models\Role as roleModal;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * App\Models\Role
 *
 * @property int $id
 * @property string $name
 * @property string|null $display_name
 * @property string $guard_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\Spatie\Permission\Models\Permission[] $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $users
 * @property-read int|null $users_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Role permission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereDisplayName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Role extends roleModal
{
    use HasFactory, HasJsonResourcefulData;

    protected $table = 'roles';

    const JSON_API_TYPE = 'roles';

    public $guard_name = 'web';

    protected $fillable = [
        'name',
        'display_name',
        'guard_name',
    ];

    const ADMIN = 'admin';
    
    const CUSTOMER = 'customer';

    public static $rules = [
        'name' => 'required|unique:roles',
        'permissions' => 'required',
    ];

    public function prepareLinks(): array
    {
        return [
            'self' => route('roles.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $fields = [
            'name' => $this->name,
            'display_name' => $this->display_name,
            'permissions' => $this->permissions,
            'created_at' => $this->created_at,
        ];

        if ($this->relationLoaded('permissions')) {
            $assignedPermissions = $this->permissions->keyBy('id');
            $assignedPermissionIds = $assignedPermissions->keys()->all();

            $allChildPermissions = Permission::whereIn('name', function ($query) {
                $query->select(DB::raw("DISTINCT name"))
                    ->from('permissions')
                    ->where('name', 'regexp', '^(edit|create|view|delete)_');
            })->get()->keyBy('name');

            $managePermissions = $this->permissions->filter(function ($permission) {
                return Str::startsWith($permission->name, 'manage_');
            });

            $groupedPermissions = $managePermissions->map(function ($permission) use ($assignedPermissionIds, $assignedPermissions, $allChildPermissions) {
                $module = Str::after($permission->name, 'manage_');
                $actions = ['edit', 'create', 'view', 'delete'];

                $childPermissions = collect($actions)->map(function ($action) use ($module, $assignedPermissionIds, $assignedPermissions, $allChildPermissions) {
                    $permissionName = "{$action}_{$module}";
                    $perm = $allChildPermissions->get($permissionName);

                    if (!$perm) return null;

                    $isAssigned = in_array($perm->id, $assignedPermissionIds);

                    $data = [
                        'id' => $perm->id,
                        'name' => $permissionName,
                        'selected' => $isAssigned,
                    ];

                    if ($isAssigned && isset($assignedPermissions[$perm->id]->pivot)) {
                        $data['pivot'] = [
                            'role_id' => $assignedPermissions[$perm->id]->pivot->role_id,
                            'permission_id' => $assignedPermissions[$perm->id]->pivot->permission_id,
                        ];
                    }

                    return $data;
                })->filter();

                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'guard_name' => $permission->guard_name,
                    'child_permissions' => $childPermissions->values(),
                ];
            });

            $fields['permissions'] = $groupedPermissions->values();
        }

        return $fields;
    }
}
