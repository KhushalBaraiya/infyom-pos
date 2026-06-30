<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $customerRole = Role::firstOrCreate(
            ['name' => 'customer'],
            ['display_name' => 'Customer', 'guard_name' => 'web']
        );

        $permissions = [
            ['name' => 'manage_customer_dashboard', 'display_name' => 'Manage Customer Dashboard'],
            ['name' => 'view_customer_dashboard', 'display_name' => 'View Customer Dashboard'],
            ['name' => 'manage_customer_purchases', 'display_name' => 'Manage Customer Purchases'],
            ['name' => 'view_customer_purchases', 'display_name' => 'View Customer Purchases'],
            ['name' => 'manage_wallet', 'display_name' => 'Manage Wallet'],
            ['name' => 'view_wallet', 'display_name' => 'View Wallet'],
            ['name' => 'create_wallet', 'display_name' => 'Create Wallet'],
        ];

        foreach ($permissions as $permissionData) {
            $permission = Permission::create($permissionData);

            $customerRole->givePermissionTo($permission->id);
        }
    }
};
