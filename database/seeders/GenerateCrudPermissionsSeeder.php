<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class GenerateCrudPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            'adjustments',
            'transfers',
            'roles',
            'brands',
            'warehouses',
            'units',
            'product_categories',
            'products',
            'suppliers',
            'customers',
            'users',
            'expense_categories',
            'expenses',
            'setting',
            'dashboard',
            'pos_screen',
            'purchase',
            'sale',
            'purchase_return',
            'sale_return',
            'email_templates',
            'reports',
            'quotations',
            'sms_templates',
            'sms_apis',
            'variations',
            'language',
            'currency',
        ];

        $viewOnlyModules = ['dashboard', 'pos_screen'];

        $editOnlyModules = ['reports', 'sms_templates', 'email_templates', 'sms_apis', 'setting'];

        $guard = config('auth.defaults.guard', 'web');

        foreach ($modules as $module) {
            if (in_array($module, $viewOnlyModules)) {
                $actions = ['view'];
            } elseif (in_array($module, $editOnlyModules)) {
                $actions = ['edit'];
            } else {
                $actions = ['create', 'edit', 'view', 'delete'];
            }

            foreach ($actions as $action) {
                $name = "{$action}_{$module}";
                $displayName = ucfirst($action) . ' ' . ucwords(str_replace('_', ' ', $module));

                if (!Permission::where('name', $name)->exists()) {
                    Permission::create([
                        'name' => $name,
                        'display_name' => $displayName,
                        'guard_name' => $guard,
                    ]);
                }
            }
        }

        $roles = Role::with('permissions')->get();

        foreach ($roles as $role) {
            $crudToAssign = [];

            foreach ($modules as $module) {
                $managePermission = "manage_{$module}";

                if ($role->hasPermissionTo($managePermission)) {
                    if (in_array($module, $viewOnlyModules)) {
                        $actions = ['view'];
                    } elseif (in_array($module, $editOnlyModules)) {
                        $actions = ['edit'];
                    } else {
                        $actions = ['create', 'view', 'edit', 'delete'];
                    }

                    foreach ($actions as $action) {
                        $permName = "{$action}_{$module}";
                        $permission = Permission::where('name', $permName)->first();

                        if ($permission) {
                            $crudToAssign[] = $permission->id;
                        }
                    }
                }
            }

            if (!empty($crudToAssign)) {
                $role->permissions()->syncWithoutDetaching($crudToAssign);
            }
        }
    }
}
