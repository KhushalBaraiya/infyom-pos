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
        Schema::table('units', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
        Schema::table('base_units', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
        Schema::table('brands', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });
        Schema::table('variations', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['code']);
        });
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->unique('name');
        });
        Schema::table('base_units', function (Blueprint $table) {
            $table->unique('name');
        });
        Schema::table('brands', function (Blueprint $table) {
            $table->unique('name');
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->unique('email');
        });
        Schema::table('suppliers', function (Blueprint $table) {
            $table->unique('email');
        });
        Schema::table('variations', function (Blueprint $table) {
            $table->unique('name');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->unique('code');
        });
        Schema::table('product_categories', function (Blueprint $table) {
            $table->unique('name');
        });
        Schema::table('warehouses', function (Blueprint $table) {
            $table->unique('email');
        });
    }
};
