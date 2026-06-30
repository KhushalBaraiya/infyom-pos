<?php

namespace App\Repositories;

use App\Models\Permission;
use Illuminate\Support\Str;

/**
 * Class PermissionRepository
 */
class PermissionRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'display_name',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'name',
        'description',
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
    public function model(): string
    {
        return Permission::class;
    }

    public function getPermission($perPage)
    {
        $managePermissions = $this->model
            ->where('name', 'like', 'manage_%')
            ->whereNotIn('name', ['manage_customer_dashboard', 'manage_customer_purchases'])
            ->paginate($perPage);

        $allPermissions = Permission::all(['id', 'name']);

        $managePermissions->getCollection()->each(function ($permission) use ($allPermissions) {
            $module = Str::after($permission->name, 'manage_');

            $childPermissions = collect(['edit', 'create', 'view', 'delete'])->map(function ($action) use ($module, $allPermissions) {
                $name = "{$action}_{$module}";
                $match = $allPermissions->firstWhere('name', $name);

                if ($match) {
                    return [
                        'id' => $match->id,
                        'name' => $name,
                        'selected' => false,
                    ];
                }

                return null;
            })->filter()->values();

            $permission->child_permissions = $childPermissions;
        });

        return $managePermissions;
    }
}
