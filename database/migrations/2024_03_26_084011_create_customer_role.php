<?php

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
        $role = [
                'name' => 'customer',
                'display_name' => 'Customer',
        ];

        $role = Role::create($role);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $role = Role::whereName('customer')->first();
        $role->delete();
    }
};
