<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\DatabaseConfig;
use Stancl\Tenancy\Events\{
    CreatingTenant,
    DeletingTenant,
    SavingTenant,
    TenantDeleted,
    TenantSaved,
    TenantUpdated,
    UpdatingTenant
};

class MultiTenant extends BaseTenant implements TenantWithDatabase
{
    use HasFactory;

    protected $table = 'tenants';

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'store_id',
        ];
    }

    protected $casts = [
        'data' => 'array',
    ];

    protected $dispatchesEvents = [
        'saving' => SavingTenant::class,
        'saved' => TenantSaved::class,
        'creating' => CreatingTenant::class,
        'updating' => UpdatingTenant::class,
        'updated' => TenantUpdated::class,
        'deleting' => DeletingTenant::class,
        'deleted' => TenantDeleted::class,
    ];

    public function database(): DatabaseConfig
    {
        return new DatabaseConfig($this);
    }

    public function deleteDatabaseIfExists()
    {
        $dbName = $this->database()->getName();
        $dbExists = DB::select("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [$dbName]);

        if (!empty($dbExists)) {
            $this->database()->manager()->dropDatabase($dbName);
        }
    }
}
