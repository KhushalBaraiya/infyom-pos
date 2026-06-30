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
        Permission::create([
            'name' => 'manage_customer_wallets',
            'display_name' => 'Manage Customer Wallets',
        ]);
        Permission::create([
            'name' => 'view_customer_wallets',
            'display_name' => 'View Customer Wallets',
        ]);

        Role::whereName(Role::ADMIN)->first()->givePermissionTo('manage_customer_wallets');
        Role::whereName(Role::ADMIN)->first()->givePermissionTo('view_customer_wallets');

        Schema::create('customer_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->double('amount')->nullable()->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_wallets');
    }
};
