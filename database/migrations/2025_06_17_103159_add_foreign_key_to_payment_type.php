<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected array $tables = [
        'sales',
        'purchases',
        'sales_return',
        'purchases_return',
        'sales_payments',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $validPaymentMethodIds = DB::table('payment_methods')->pluck('id')->toArray();

        foreach ($this->tables as $tableName) {
            DB::table($tableName)
                ->whereNotNull('payment_type')
                ->whereNotIn('payment_type', $validPaymentMethodIds)
                ->update(['payment_type' => null]);

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->unsignedBigInteger('payment_type')->nullable()->change();

                $table->foreign('payment_type', "{$tableName}_payment_type_foreign")
                    ->references('id')
                    ->on('payment_methods')
                    ->onUpdate('cascade')
                    ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropForeign("{$tableName}_payment_type_foreign");
            });
        }
    }
};
