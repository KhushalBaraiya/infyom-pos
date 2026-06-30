<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        DB::table('payment_methods')->insert([
            ['id' => 1, 'name' => 'Cash',         'status' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Cheque',       'status' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Bank Transfer', 'status' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Other',        'status' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
