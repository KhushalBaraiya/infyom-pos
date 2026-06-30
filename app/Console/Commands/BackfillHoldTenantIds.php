<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillHoldTenantIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holds:sync-tenant-ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync tenant IDs for existing holds and hold items';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting backfill of tenant_id for holds and hold_items...');

        DB::transaction(function () {
            $holdsUpdated = DB::table('holds')
                ->whereNull('tenant_id')
                ->whereNotNull('warehouse_id')
                ->update([
                    'tenant_id' => DB::raw('(SELECT tenant_id FROM warehouses WHERE warehouses.id = holds.warehouse_id)'),
                ]);

            $this->info("Updated {$holdsUpdated} holds with tenant_id from warehouse");

            $holdItemsUpdated = DB::table('hold_items')
                ->whereNull('tenant_id')
                ->update([
                    'tenant_id' => DB::raw('(SELECT tenant_id FROM holds WHERE holds.id = hold_items.hold_id)'),
                ]);

            $this->info("Updated {$holdItemsUpdated} hold_items with tenant_id");
        });

        $this->info('Holds Tenant Id Sync Successfully!');

        return self::SUCCESS;
    }
}
