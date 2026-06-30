<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * Class CustomSearchFilter
 */
class CustomSearchFilter implements Filter
{
    public $searchableFields;

    public function __construct($searchableFields)
    {
        $this->searchableFields = $searchableFields;
        $filterSearchFields = request()->get('filter')['search_fields'] ?? [];
        if (! empty($filterSearchFields)) {
            $this->searchableFields = explode(',', $filterSearchFields);
        }
    }

    public function __invoke(Builder $query, $value, string $property): Builder
    {
        $query->where(function (Builder $q) use ($value) {
            if (is_array($value)) {
                foreach ($this->searchableFields as $searchableField) {
                    foreach ($value as $string) {
                        $q->orWhere($searchableField, 'LIKE', '%'.$string.'%');
                    }
                }
            } else {
                foreach ($this->searchableFields as $searchableField) {
                    $q->orWhere($searchableField, 'LIKE', '%'.$value.'%');
                }
            }
        });

        return $query;
    }
}
