<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Psr\Container\NotFoundExceptionInterface;
use Psr\Container\ContainerExceptionInterface;

/**
 * Class BaseModel
 *
 * @method static \Illuminate\Database\Eloquent\Builder|BaseModel newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BaseModel newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BaseModel query()
 *
 * @mixin Model
 */
class BaseModel extends Model
{
    /**
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     */
    public function getPerPage(): int
    {
        $pageSize = request()->get('page_size');
        if ($pageSize == 0) {
            $count = static::count();
            if ($count > 0) {
                return $count;
            }
        }

        return $this->perPage;
    }
}
