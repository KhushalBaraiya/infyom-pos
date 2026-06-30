<?php

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
        $tables = [
            'adjustments',
            'base_units',
            'brands',
            'customers',
            'expense_categories',
            'mail_templates',
            'main_products',
            'pos_register',
            'products',
            'product_categories',
            'quotations',
            'sales',
            'settings',
            'sms_settings',
            'sms_templates',
            'suppliers',
            'transfers',
            'units',
            'users',
            'variations',
            'warehouses',
            'taxes',
        ];
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('tenant_id')->nullable()->after('id');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'adjustments',
            'base_units',
            'brands',
            'customers',
            'expense_categories',
            'mail_templates',
            'main_products',
            'pos_register',
            'products',
            'product_categories',
            'quotations',
            'sales',
            'settings',
            'sms_settings',
            'sms_templates',
            'suppliers',
            'transfers',
            'units',
            'users',
            'variations',
            'warehouses',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('tenant_id');
                });
            }
        }
    }
};
