<?php

namespace App\Repositories;

use App\Models\Hold;
use App\Models\HoldItem;
use App\Models\Product;
use App\Models\Sale;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class HoldRepository
 */
class HoldRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'reference_code',
        'date',
        'tax_rate',
        'tax_amount',
        'discount',
        'shipping',
        'grand_total',
        'received_amount',
        'paid_amount',
        'note',
        'created_at',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'reference_code',
        'date',
        'tax_rate',
        'tax_amount',
        'discount',
        'shipping',
        'grand_total',
        'received_amount',
        'note',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model(): string
    {
        return Hold::class;
    }

    public function storeHold($input): Hold
    {
        try {
            DB::beginTransaction();

            $existReference = Hold::whereReferenceCode($input['reference_code'])->first();

            if (! empty($existReference)) {
                $existReference->delete();
            }

            $input['date'] = $input['date'] ?? date('Y/m/d');
            $holdInputArray = Arr::only($input, [
                'reference_code', 'customer_id', 'warehouse_id', 'tax_rate', 'tax_amount', 'discount', 'shipping',
                'grand_total',
                'received_amount', 'paid_amount', 'payment_type', 'note', 'date', 'status', 'payment_status','discount_type',
                'discount_value',
            ]);

            /** @var Hold $hold */
            $hold = Hold::create($holdInputArray);

            $hold = $this->storeHoldItems($hold, $input);

            DB::commit();

            return $hold;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function storeHoldItems($hold, $input)
    {
        foreach ($input['hold_items'] as $holdItem) {
            $item = $this->calculationHoldItems($holdItem);
            $holdItem = new HoldItem($item);
            $hold->holdItems()->save($holdItem);
        }

        $subTotalAmount = $hold->holdItems()->sum('sub_total');

        if ($input['discount'] <= $subTotalAmount) {
            $input['grand_total'] = $subTotalAmount - $input['discount'];
        } else {
            throw new UnprocessableEntityHttpException('Discount amount should not be greater than total.');
        }
        if ($input['tax_rate'] <= 100 && $input['tax_rate'] >= 0) {
            $input['tax_amount'] = $input['grand_total'] * $input['tax_rate'] / 100;
        } else {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100.');
        }
        $input['grand_total'] += $input['tax_amount'];
        if ($input['shipping'] <= $input['grand_total'] && $input['shipping'] >= 0) {
            $input['grand_total'] += $input['shipping'];
        } else {
            throw new UnprocessableEntityHttpException(__('messages.error.shipping_amount_not_be_greater'));
        }

        $hold->update($input);

        return $hold;
    }

    /**
     * @return mixed
     */
    public function calculationHoldItems($holdItem)
    {
        $holdItem = $this->resolveHoldItemPrice($holdItem);
        $validator = Validator::make($holdItem, HoldItem::rules());
        if ($validator->fails()) {
            throw new UnprocessableEntityHttpException($validator->errors()->first());
        }

        //discount calculation
        $perItemDiscountAmount = 0;
        $holdItem['net_unit_price'] = $holdItem['product_price'];
        if ($holdItem['discount_type'] == Sale::PERCENTAGE) {
            if ($holdItem['discount_value'] <= 100 && $holdItem['discount_value'] >= 0) {
                $holdItem['discount_amount'] = ($holdItem['discount_value'] * $holdItem['product_price'] / 100) * $holdItem['quantity'];
                $perItemDiscountAmount = $holdItem['discount_amount'] / $holdItem['quantity'];
                $holdItem['net_unit_price'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException('Please enter discount value between 0 to 100.');
            }
        } elseif ($holdItem['discount_type'] == Sale::FIXED) {
            if ($holdItem['discount_value'] <= $holdItem['product_price'] && $holdItem['discount_value'] >= 0) {
                $holdItem['discount_amount'] = $holdItem['discount_value'] * $holdItem['quantity'];
                $perItemDiscountAmount = $holdItem['discount_amount'] / $holdItem['quantity'];
                $holdItem['net_unit_price'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException("Please enter  discount's value between product's price.");
            }
        }

        //tax calculation
        $perItemTaxAmount = 0;
        if ($holdItem['tax_value'] <= 100 && $holdItem['tax_value'] >= 0) {
            if ($holdItem['tax_type'] == Sale::EXCLUSIVE) {
                $holdItem['tax_amount'] = (($holdItem['net_unit_price'] * $holdItem['tax_value']) / 100) * $holdItem['quantity'];
                $perItemTaxAmount = $holdItem['tax_amount'] / $holdItem['quantity'];
            } elseif ($holdItem['tax_type'] == Sale::INCLUSIVE) {
                $holdItem['tax_amount'] = ($holdItem['net_unit_price'] * $holdItem['tax_value']) / (100 + $holdItem['tax_value']) * $holdItem['quantity'];
                $perItemTaxAmount = $holdItem['tax_amount'] / $holdItem['quantity'];
                $holdItem['net_unit_price'] -= $perItemTaxAmount;
            }
        } else {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100 ');
        }
        $holdItem['sub_total'] = ($holdItem['net_unit_price'] + $perItemTaxAmount) * $holdItem['quantity'];

        return $holdItem;
    }

    /**
     * Resolve the unit price for a hold item based on the selected price group.
     */
    protected function resolveHoldItemPrice(array $holdItem): array
    {
        $product = Product::whereId($holdItem['product_id'])->first();
        if (! $product) {
            throw new UnprocessableEntityHttpException('Selected product not found.');
        }

        $requestedPrice = array_key_exists('product_price', $holdItem) ? $holdItem['product_price'] : null;
        $requestedPrice = ($requestedPrice === '' || $requestedPrice === null) ? null : (float) $requestedPrice;
        $priceGroup = $holdItem['price_group'] ?? null;
        $priceMatches = function ($candidate, $expected) {
            if ($candidate === null || $expected === null || $expected === '') {
                return false;
            }

            return abs((float) $candidate - (float) $expected) < 0.00001;
        };

        if ($priceGroup === null || $priceGroup === '') {
            if ($requestedPrice !== null) {
                if ($priceMatches($requestedPrice, $product->product_price)) {
                    $priceGroup = HoldItem::PRICE_GROUP_PRODUCT_PRICE;
                } elseif ($priceMatches($requestedPrice, $product->product_wholesale_price)) {
                    $priceGroup = HoldItem::PRICE_GROUP_WHOLESALE_PRICE;
                } elseif ($priceMatches($requestedPrice, $product->product_special_price)) {
                    $priceGroup = HoldItem::PRICE_GROUP_SPECIAL_PRICE;
                } else {
                    $priceGroup = HoldItem::PRICE_GROUP_CUSTOM_PRICE;
                }
            } else {
                $priceGroup = HoldItem::PRICE_GROUP_PRODUCT_PRICE;
            }
        }

        $priceGroup = (int) $priceGroup;
        if (! in_array($priceGroup, [
            HoldItem::PRICE_GROUP_PRODUCT_PRICE,
            HoldItem::PRICE_GROUP_WHOLESALE_PRICE,
            HoldItem::PRICE_GROUP_SPECIAL_PRICE,
            HoldItem::PRICE_GROUP_CUSTOM_PRICE,
        ], true)) {
            throw new UnprocessableEntityHttpException('Invalid price group selected.');
        }
        $holdItem['price_group'] = $priceGroup;
        switch ($priceGroup) {
            case HoldItem::PRICE_GROUP_PRODUCT_PRICE:
                $holdItem['product_price'] = (float) $product->product_price;
                break;
            case HoldItem::PRICE_GROUP_WHOLESALE_PRICE:
                if ($product->product_wholesale_price === null || $product->product_wholesale_price === '') {
                    throw new UnprocessableEntityHttpException('Wholesale price is not set for this product.');
                }
                $holdItem['product_price'] = (float) $product->product_wholesale_price;
                break;
            case HoldItem::PRICE_GROUP_SPECIAL_PRICE:
                if ($product->product_special_price === null || $product->product_special_price === '') {
                    throw new UnprocessableEntityHttpException('Special price is not set for this product.');
                }
                $holdItem['product_price'] = (float) $product->product_special_price;
                break;
            case HoldItem::PRICE_GROUP_CUSTOM_PRICE:
                if (! isset($holdItem['product_price']) || $holdItem['product_price'] === '' || $holdItem['product_price'] === null) {
                    throw new UnprocessableEntityHttpException('Custom price is required for the selected price group.');
                }
                $holdItem['product_price'] = (float) $holdItem['product_price'];
                break;
        }

        return $holdItem;
    }

    /**
     * @return mixed
     */
    public function updateHold($input, $id)
    {
        try {
            DB::beginTransaction();
            $hold = Hold::findOrFail($id);
            $holdItemIds = HoldItem::whereHoldId($id)->pluck('id')->toArray();
            $HoldItmOldIds = [];
            foreach ($input['hold_items'] as $key => $holdItem) {
                //get different ids & update
                $HoldItmOldIds[$key] = $holdItem['hold_item_id'];
                $holdItemArray = Arr::only($holdItem, [
                    'hold_item_id', 'product_id', 'price_group', 'product_price', 'net_unit_price', 'tax_type', 'tax_value',
                    'tax_amount', 'discount_type', 'discount_value', 'discount_amount', 'sale_unit', 'quantity',
                    'sub_total',
                ]);
                $this->updateItem($holdItemArray, $input['warehouse_id']);
                //create new product items
                if (is_null($holdItem['hold_item_id'])) {
                    $holdItem = $this->calculationHoldItems($holdItem);
                    $holdItemArray = Arr::only($holdItem, [
                        'product_id', 'price_group', 'product_price', 'net_unit_price', 'tax_type', 'tax_value', 'tax_amount',
                        'discount_type', 'discount_value', 'discount_amount', 'sale_unit', 'quantity', 'sub_total',
                    ]);
                    $hold->holdItems()->create($holdItemArray);
                }
            }
            $removeItemIds = array_diff($holdItemIds, $HoldItmOldIds);
            //delete remove product
            if (! empty(array_values($removeItemIds))) {
                HoldItem::whereIn('id', array_values($removeItemIds))->delete();
            }
            $hold = $this->updateHoldCalculation($input, $id);
            DB::commit();

            return $hold;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function updateItem($holdItem, $warehouseId): bool
    {
        try {
            $holdItem = $this->calculationHoldItems($holdItem);

            $item = HoldItem::whereId($holdItem['hold_item_id']);

            unset($holdItem['hold_item_id']);
            $item->update($holdItem);

            return true;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function updateHoldCalculation($input, $id)
    {
        $hold = Hold::findOrFail($id);
        $subTotalAmount = $hold->holdItems()->sum('sub_total');

        if ($input['discount'] > $subTotalAmount || $input['discount'] < 0) {
            throw new UnprocessableEntityHttpException('Discount amount should not be greater than total.');
        }
        $input['grand_total'] = $subTotalAmount - $input['discount'];
        if ($input['tax_rate'] > 100 || $input['tax_rate'] < 0) {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100.');
        }
        $input['tax_amount'] = $input['grand_total'] * $input['tax_rate'] / 100;

        $input['grand_total'] += $input['tax_amount'];

        if ($input['shipping'] > $input['grand_total'] || $input['shipping'] < 0) {
            throw new UnprocessableEntityHttpException(__('messages.error.shipping_amount_not_be_greater'));
        }

        $input['grand_total'] += $input['shipping'];

        $hold->first();

        $holdInputArray = Arr::only($input, [
            'reference_code', 'customer_id', 'warehouse_id', 'tax_rate', 'tax_amount', 'discount', 'shipping',
            'grand_total',
            'received_amount', 'paid_amount', 'note', 'date', 'status',
        ]);
        $hold->update($holdInputArray);

        return $hold;
    }
}
