<?php

namespace App\Repositories;

use App\Mail\MailSender;
use App\Models\Customer;
use App\Models\CustomerWallet;
use App\Models\CustomerWalletTransaction;
use App\Models\MailTemplate;
use App\Models\ManageStock;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalesPayment;
use App\Models\SmsSetting;
use App\Models\SmsTemplate;
use App\Utils\SmsSender;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Picqer\Barcode\BarcodeGeneratorPNG;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SaleRepository
 */
class SaleRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'date',
        'grand_total',
        'paid_amount',
        'created_at',
        'reference_code'
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'date',
        'grand_total',
        'paid_amount',
        'created_at',
        'reference_code'
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
        return Sale::class;
    }

    public function storeSale($input): Sale
    {
        try {
            DB::beginTransaction();

            $input['date'] = $input['date'] ?? date('Y/m/d');
            $input['is_sale_created'] = $input['is_sale_created'] ?? false;
            $QuotationId = $input['quotation_id'] ?? false;
            $saleInputArray = Arr::only($input, [
                'customer_id',
                'tax_rate',
                'tax_amount',
                'discount',
                'discount_type',
                'discount_value',
                'shipping',
                'grand_total',
                'received_amount',
                'paid_amount',
                'payment_type',
                'note',
                'date',
                'status',
                'payment_status',
                'warehouse_id'
            ]);
            $saleInputArray['user_id'] = Auth::id();

            /** @var Sale $sale */
            $sale = Sale::create($saleInputArray);

            if ($input['is_sale_created'] && $QuotationId) {
                $quotation = Quotation::find($QuotationId);
                $quotation->update([
                    'is_sale_created' => true,
                ]);
            }

            $sale = $this->storeSaleItems($sale, $input);
            $reference_code = getSettingValue('sale_code') . '_111' . $sale->id;
            $this->generateBarcode($reference_code);
            $sale['barcode_image_url'] = Storage::url('sales/barcode-' . $reference_code . '.png');

            foreach ($input['sale_items'] as $saleItem) {
                $warehouseId = $saleItem['warehouse_id'] ?? $saleInputArray['warehouse_id'];
                $product = ManageStock::whereWarehouseId($warehouseId)
                    ->whereProductId($saleItem['product_id'])
                    ->first();

                if ($product && $product->quantity >= $saleItem['quantity']) {
                    $totalQuantity = $product->quantity - $saleItem['quantity'];
                    $product->update([
                        'quantity' => $totalQuantity,
                    ]);
                } else {
                    throw new UnprocessableEntityHttpException('Quantity must be less than Available quantity.');
                }
            }

            $mailTemplate = MailTemplate::where('type', MailTemplate::MAIL_TYPE_SALE)->first();
            $smsTemplate = SmsTemplate::where('type', SmsTemplate::SMS_TYPE_SALE)->first();

            $subject = 'Customer sale';

            $customer = Customer::whereId($sale->customer_id)->first();

            $search = [
                '{customer_name}',
                '{sales_id}',
                '{sales_date}',
                '{sales_amount}',
                '{paid_amount}',
                '{due_amount}',
                '{app_name}',
            ];

            $totalPayAmount = SalesPayment::whereSaleId($sale->id)->sum('amount');
            $dueAmount = $sale->grand_total - $totalPayAmount;

            $payAmount = 0;

            if (($dueAmount < 0) || ($sale->payment_status == Sale::PAID)) {
                $dueAmount = 0;
                $payAmount = $sale->grand_total;
            }

            $payAmount = number_format($payAmount, 2);
            $dueAmount = number_format($dueAmount, 2);

            $replace = [
                $customer->name,
                $sale->reference_code,
                $sale->date,
                number_format($sale->grand_total, 2),
                $payAmount,
                $dueAmount,
                getActiveStoreName(),
            ];

            if (!empty($customer->email) && !empty($mailTemplate) && $mailTemplate->status == MailTemplate::ACTIVE) {
                $data['data'] = str_replace($search, $replace, $mailTemplate->content);

                Mail::to($customer->email)
                    ->send(new MailSender('emails.mail-sender', $subject, $data));
            }

            // Send sale confirmation SMS
            if (!empty($customer->phone) && !empty($smsTemplate) && $smsTemplate->status == SmsTemplate::ACTIVE) {
                $sender = new SmsSender();
                $message = str_replace($search, $replace, $smsTemplate->content);
                $sender->send($customer->phone, $message);

                // $client = new \GuzzleHttp\Client();
                // $url = SmsSetting::where('key', 'url')->value('value');
                // // $token = SmsSetting::where('key', 'token')->value('value');
                // //          $url = "https://xrjv8e.api.infobip.com/sms/2/text/advanced";

                // $data = SmsSetting::where('key', 'payload')->value('value');
                // $data = preg_replace('/\s/', '', $data);
                // $data = json_decode($data, true);

                // $toKey = SmsSetting::where('key', 'mobile_key')->value('value');
                // $number = $customer->phone;

                // $messageKey = SmsSetting::where('key', 'message_key')->value('value');

                // $data = replaceArrayValue($data, $toKey, $number);
                // $data = replaceArrayValue($data, $messageKey, $message);

                // $response = $client->post($url, [
                //     'headers' => [
                //         'Content-Type' => 'application/json',
                //         'Accept' => 'application/json',
                //     ],
                //     'form_params' => [$data],
                // ]);
            }

            DB::commit();

            return $sale;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function calculationSaleItems($saleItem)
    {
        $saleItem = $this->resolveSaleItemPrice($saleItem);
        $validator = Validator::make($saleItem, SaleItem::rules());
        if ($validator->fails()) {
            throw new UnprocessableEntityHttpException($validator->errors()->first());
        }

        //discount calculation
        $perItemDiscountAmount = 0;
        $saleItem['net_unit_price'] = $saleItem['product_price'];
        if ($saleItem['discount_type'] == Sale::PERCENTAGE) {
            if ($saleItem['discount_value'] <= 100 && $saleItem['discount_value'] >= 0) {
                $saleItem['discount_amount'] = ($saleItem['discount_value'] * $saleItem['product_price'] / 100) * $saleItem['quantity'];
                $perItemDiscountAmount = $saleItem['discount_amount'] / $saleItem['quantity'];
                $saleItem['net_unit_price'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException('Please enter discount value between 0 to 100.');
            }
        } elseif ($saleItem['discount_type'] == Sale::FIXED) {
            if ($saleItem['discount_value'] <= $saleItem['product_price'] && $saleItem['discount_value'] >= 0) {
                $saleItem['discount_amount'] = $saleItem['discount_value'] * $saleItem['quantity'];
                $perItemDiscountAmount = $saleItem['discount_amount'] / $saleItem['quantity'];
                $saleItem['net_unit_price'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException("Please enter  discount's value between product's price.");
            }
        }

        //tax calculation
        $perItemTaxAmount = 0;
        if ($saleItem['tax_value'] <= 100 && $saleItem['tax_value'] >= 0) {
            if ($saleItem['tax_type'] == Sale::EXCLUSIVE) {
                $saleItem['tax_amount'] = (($saleItem['net_unit_price'] * $saleItem['tax_value']) / 100) * $saleItem['quantity'];
                $perItemTaxAmount = $saleItem['tax_amount'] / $saleItem['quantity'];
            } elseif ($saleItem['tax_type'] == Sale::INCLUSIVE) {
                $saleItem['tax_amount'] = ($saleItem['net_unit_price'] * $saleItem['tax_value']) / (100 + $saleItem['tax_value']) * $saleItem['quantity'];
                $perItemTaxAmount = $saleItem['tax_amount'] / $saleItem['quantity'];
                $saleItem['net_unit_price'] -= $perItemTaxAmount;
            }
        } else {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100 ');
        }
        $subTotal = ($saleItem['net_unit_price']  + $perItemTaxAmount) * $saleItem['quantity'];
        $saleItem['sub_total'] = round($subTotal, 2);

        return $saleItem;
    }

    protected function resolveSaleItemPrice(array $saleItem): array
    {
        $product = Product::whereId($saleItem['product_id'])->first();
        if (! $product) {
            throw new UnprocessableEntityHttpException('Selected product not found.');
        }

        $requestedPrice = array_key_exists('product_price', $saleItem) ? $saleItem['product_price'] : null;
        $requestedPrice = ($requestedPrice === '' || $requestedPrice === null) ? null : (float) $requestedPrice;
        $priceGroup = $saleItem['price_group'] ?? null;
        $priceMatches = function ($candidate, $expected) {
            if ($candidate === null || $expected === null || $expected === '') {
                return false;
            }

            return abs((float) $candidate - (float) $expected) < 0.00001;
        };

        if ($priceGroup === null || $priceGroup === '') {
            if ($requestedPrice !== null) {
                if ($priceMatches($requestedPrice, $product->product_price)) {
                    $priceGroup = SaleItem::PRICE_GROUP_PRODUCT_PRICE;
                } elseif ($priceMatches($requestedPrice, $product->product_wholesale_price)) {
                    $priceGroup = SaleItem::PRICE_GROUP_WHOLESALE_PRICE;
                } elseif ($priceMatches($requestedPrice, $product->product_special_price)) {
                    $priceGroup = SaleItem::PRICE_GROUP_SPECIAL_PRICE;
                } else {
                    $priceGroup = SaleItem::PRICE_GROUP_CUSTOM_PRICE;
                }
            } else {
                $priceGroup = SaleItem::PRICE_GROUP_PRODUCT_PRICE;
            }
        }

        $priceGroup = (int) $priceGroup;
        if (! in_array($priceGroup, [
            SaleItem::PRICE_GROUP_PRODUCT_PRICE,
            SaleItem::PRICE_GROUP_WHOLESALE_PRICE,
            SaleItem::PRICE_GROUP_SPECIAL_PRICE,
            SaleItem::PRICE_GROUP_CUSTOM_PRICE,
        ], true)) {
            throw new UnprocessableEntityHttpException('Invalid price group selected.');
        }
        $saleItem['price_group'] = $priceGroup;
        switch ($priceGroup) {
            case SaleItem::PRICE_GROUP_PRODUCT_PRICE:
                $saleItem['product_price'] = (float) $product->product_price;
                break;
            case SaleItem::PRICE_GROUP_WHOLESALE_PRICE:
                if ($product->product_wholesale_price === null || $product->product_wholesale_price === '') {
                    throw new UnprocessableEntityHttpException('Wholesale price is not set for this product.');
                }
                $saleItem['product_price'] = (float) $product->product_wholesale_price;
                break;
            case SaleItem::PRICE_GROUP_SPECIAL_PRICE:
                if ($product->product_special_price === null || $product->product_special_price === '') {
                    throw new UnprocessableEntityHttpException('Special price is not set for this product.');
                }
                $saleItem['product_price'] = (float) $product->product_special_price;
                break;
            case SaleItem::PRICE_GROUP_CUSTOM_PRICE:
                if (! isset($saleItem['product_price']) || $saleItem['product_price'] === '' || $saleItem['product_price'] === null) {
                    throw new UnprocessableEntityHttpException('Custom price is required for the selected price group.');
                }
                $saleItem['product_price'] = (float) $saleItem['product_price'];
                break;
        }

        return $saleItem;
    }

    /**
     * @return mixed
     */
    public function storeSaleItems($sale, $input)
    {
        foreach ($input['sale_items'] as $saleItem) {
            $product = Product::whereId($saleItem['product_id'])->first();

            if (! empty($product) && isset($product->quantity_limit) && $saleItem['quantity'] > $product->quantity_limit) {
                throw new UnprocessableEntityHttpException('Please enter less than ' . $product->quantity_limit . ' quantity of ' . $product->name . ' product.');
            }
            $item = $this->calculationSaleItems($saleItem);
            $saleItem = new SaleItem($item);
            $sale->saleItems()->save($saleItem);
        }

        $subTotalAmount = $sale->saleItems()->sum('sub_total');

        if ($input['discount'] <= $subTotalAmount) {
            $input['grand_total'] = round($subTotalAmount - $input['discount'], 2);
        } else {
            throw new UnprocessableEntityHttpException('Discount amount should not be greater than total.');
        }
        if ($input['tax_rate'] <= 100 && $input['tax_rate'] >= 0) {
            $input['tax_amount'] = round($input['grand_total'] * $input['tax_rate'] / 100, 2);
        } else {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100.');
        }
        $input['grand_total'] += $input['tax_amount'];
        if ($input['shipping'] <= $input['grand_total'] && $input['shipping'] >= 0) {
            $input['grand_total'] += $input['shipping'];
        } else {
            throw new UnprocessableEntityHttpException(__('messages.error.shipping_amount_not_be_greater'));
        }

        if ($input['payment_status'] == Sale::UNPAID) {
            $input['paid_amount'] = null;
            $input['payment_type'] = null;
            SalesPayment::whereSaleId($sale->id)->delete();
        } else {
            $paymentDetails = $input['payment_details'] ?? [];
            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return floatval($detail['amount'] ?? 0);
            });
            if (!empty($paymentDetails) && is_array($paymentDetails)) {
                foreach ($paymentDetails as $paymentDetail) {
                    $paymentMethod = PaymentMethod::whereId($paymentDetail['payment_type']['value'])->first();
                    if ($paymentDetail['amount'] > 0 && !empty($paymentMethod)) {
                        SalesPayment::create([
                            'sale_id' => $sale->id,
                            'reference' => $paymentDetail['reference'] ?? null,
                            'payment_date' => $paymentDetail['date'] ?? Carbon::now(),
                            'amount' => (float) $paymentDetail['amount'] ?? 0,
                            'received_amount' => (float) $input['grand_total'] ?? 0,
                            'payment_type' => (int) $paymentDetail['payment_type']['value'] ?? 0,
                        ]);
                        if ($paymentMethod->type == PaymentMethod::CUSTOMER_WALLET) {
                            $customerWallet = CustomerWallet::whereCustomerId($sale->customer_id)->first();
                            if (!empty($customerWallet)) {
                                CustomerWalletTransaction::create([
                                    'wallet_id' => $customerWallet->id,
                                    'direction' => CustomerWalletTransaction::DIRECTION_DEBIT,
                                    'payment_method_id' => $paymentMethod->id,
                                    'amount' => (float) $paymentDetail['amount'] ?? 0,
                                    'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_PURCHASE,
                                    'status' => CustomerWalletTransaction::STATUS_APPROVED,
                                ]);
                                $customerWallet->update([
                                    'amount' => $customerWallet->balance - (float) $paymentDetail['amount'] ?? 0,
                                ]);
                            }
                        }
                    }
                }
            }
            $input['paid_amount'] = $totalAmount;
            $input['payment_type'] = SalesPayment::whereSaleId($sale->id)->latest()->first()->payment_type ?? null;
            if (round($totalAmount, 2) == round($input['grand_total'], 2)) {
                $input['payment_status'] = Sale::PAID;
            } elseif ($totalAmount > $input['grand_total']) {
                $input['payment_status'] = Sale::PAID;
            } else {
                $input['payment_status'] = Sale::PARTIAL_PAID;
            }
        }

        $input['reference_code'] = getSettingValue('sale_code') . '_111' . $sale->id;
        $sale->update($input);

        return $sale;
    }

    /**
     * @return mixed
     */
    public function updateSale($input, $id)
    {
        try {
            DB::beginTransaction();
            $sale = Sale::findOrFail($id);
            if ($sale->is_return == 1) {
                throw new UnprocessableEntityHttpException('You can not update this sale, because it is a return sale.');
            }
            $saleItemIds = SaleItem::whereSaleId($id)->pluck('id')->toArray();
            $saleItmOldIds = [];
            foreach ($input['sale_items'] as $key => $saleItem) {
                $product = Product::whereId($saleItem['product_id'])->first();

                if (! empty($product) && isset($product->quantity_limit) && $saleItem['quantity'] > $product->quantity_limit) {
                    throw new UnprocessableEntityHttpException('Please enter less than ' . $product->quantity_limit . ' quantity of ' . $product->name . ' product.');
                }

                //get different ids & update
                $saleItmOldIds[$key] = $saleItem['sale_item_id'];
                $saleItemArray = Arr::only($saleItem, [
                    'sale_item_id',
                    'product_id',
                    'price_group',
                    'product_price',
                    'net_unit_price',
                    'tax_type',
                    'tax_value',
                    'tax_amount',
                    'discount_type',
                    'discount_value',
                    'discount_amount',
                    'sale_unit',
                    'quantity',
                    'sub_total',
                ]);
                $this->updateItem($saleItemArray, $input['warehouse_id']);
                //create new product items
                if (is_null($saleItem['sale_item_id'])) {
                    $saleItem = $this->calculationSaleItems($saleItem);
                    $saleItemArray = Arr::only($saleItem, [
                        'product_id',
                        'price_group',
                        'product_price',
                        'net_unit_price',
                        'tax_type',
                        'tax_value',
                        'tax_amount',
                        'discount_type',
                        'discount_value',
                        'discount_amount',
                        'sale_unit',
                        'quantity',
                        'sub_total',
                    ]);
                    $sale->saleItems()->create($saleItemArray);
                    $product = ManageStock::whereWarehouseId($input['warehouse_id'])->whereProductId($saleItem['product_id'])->first();
                    if ($product) {
                        if ($product->quantity >= $saleItem['quantity']) {
                            $product->update([
                                'quantity' => $product->quantity - $saleItem['quantity'],
                            ]);
                        } else {
                            throw new UnprocessableEntityHttpException('Quantity must be less than Available quantity.');
                        }
                    }
                }
            }
            $removeItemIds = array_diff($saleItemIds, $saleItmOldIds);
            //delete remove product
            if (! empty(array_values($removeItemIds))) {
                foreach ($removeItemIds as $removeItemId) {
                    // remove quantity manage storage
                    $oldProduct = SaleItem::whereId($removeItemId)->first();
                    $productQuantity = ManageStock::whereWarehouseId($input['warehouse_id'])->whereProductId($oldProduct->product_id)->first();
                    if ($productQuantity) {
                        if ($oldProduct) {
                            $productQuantity->update([
                                'quantity' => $productQuantity->quantity + $oldProduct->quantity,
                            ]);
                        }
                    } else {
                        ManageStock::create([
                            'warehouse_id' => $input['warehouse_id'],
                            'product_id' => $oldProduct->product_id,
                            'quantity' => $oldProduct->quantity,
                        ]);
                    }
                }
                SaleItem::whereIn('id', array_values($removeItemIds))->delete();
            }
            $this->generateBarcode($sale->reference_code);
            $sale['barcode_image_url'] = Storage::url('sales/barcode-' . $sale->reference_code . '.png');
            $sale = $this->updateSaleCalculation($input, $id);
            DB::commit();

            return $sale;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function updateItem($saleItem, $warehouseId): bool
    {
        try {
            $saleItem = $this->calculationSaleItems($saleItem);
            $item = SaleItem::whereId($saleItem['sale_item_id']);
            $product = ManageStock::whereWarehouseId($warehouseId)->whereProductId($saleItem['product_id'])->first();
            $oldItem = SaleItem::whereId($saleItem['sale_item_id'])->first();
            if ($oldItem && $oldItem->quantity != $saleItem['quantity']) {
                $totalQuantity = 0;
                if ($oldItem->quantity > $saleItem['quantity']) {
                    if ($product) {
                        $totalQuantity = $product->quantity + ($oldItem->quantity - $saleItem['quantity']);
                        $product->update([
                            'quantity' => $totalQuantity,
                        ]);
                    } else {
                        ManageStock::create([
                            'warehouse_id' => $warehouseId,
                            'product_id' => $saleItem['product_id'],
                            'quantity' => $totalQuantity,
                        ]);
                    }
                } elseif ($oldItem->quantity < $saleItem['quantity']) {
                    $totalQuantity = $product->quantity - ($saleItem['quantity'] - $oldItem->quantity);
                    if ($product->quantity < ($saleItem['quantity'] - $oldItem->quantity)) {
                        throw new UnprocessableEntityHttpException('Quantity must be less than Available quantity.');
                    }
                    $product->update([
                        'quantity' => $totalQuantity,
                    ]);
                }
            }
            unset($saleItem['sale_item_id']);
            $item->update($saleItem);

            return true;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function updateSaleCalculation($input, $id)
    {
        $sale = Sale::findOrFail($id);
        $subTotalAmount = $sale->saleItems()->sum('sub_total');

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

        $sale->first();
        $saleExistGrandTotal = $sale->grand_total;

        // if ($input['payment_status'] == Sale::PAID && $input['grand_total'] > $saleExistGrandTotal) {
        //     $input['payment_status'] = Sale::PARTIAL_PAID;
        // } else if ($input['payment_status'] == Sale::PAID && $input['grand_total'] == $saleExistGrandTotal) {
        //     $input['payment_status'] = Sale::PAID;
        // }

        $alreadyWalletPaid = SalesPayment::whereSaleId($id)
            ->whereHas('paymentMethod', function (Builder $q) {
                $q->where('type', PaymentMethod::CUSTOMER_WALLET);
            })->sum('amount');
        $input['wallet_refund_amount'] = $sale->wallet_refund_amount ?? 0;
        $paymentWalletAmount = 0;
        $isCustomerChanged = $sale->customer_id != $input['customer_id'];

        if ($input['payment_status'] == Sale::UNPAID) {
            $input['paid_amount'] = null;
            $input['payment_type'] = null;
            SalesPayment::whereSaleId($sale->id)->delete();
        } else {
            $paymentDetails = $input['payment_details'] ?? [];
            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return $detail['amount'] ?? 0;
            });
            if (!empty($paymentDetails) && is_array($paymentDetails)) {
                $newPaymentIds = [];
                foreach ($paymentDetails as $paymentDetail) {
                    if ($paymentDetail['amount'] > 0) {
                        $payment = SalesPayment::create([
                            'sale_id' => $sale->id,
                            'reference' => $paymentDetail['reference'] ?? null,
                            'payment_date' => $paymentDetail['date'] ?? Carbon::now(),
                            'amount' => $paymentDetail['amount'] ?? 0,
                            'received_amount' => $input['grand_total'] ?? 0,
                            'payment_type' => $paymentDetail['payment_type']['value'] ?? 0,
                        ]);
                        $newPaymentIds[] = $payment->id;
                        if ($payment->paymentMethod->type == PaymentMethod::CUSTOMER_WALLET) {
                            $paymentWalletAmount += $payment->amount;
                        }
                    }
                }
                SalesPayment::whereSaleId($sale->id)->whereNotIn('id', $newPaymentIds)->delete();
            }
            $input['paid_amount'] = $totalAmount;
            $input['payment_type'] = SalesPayment::whereSaleId($sale->id)->latest()->first()->payment_type ?? null;
            if (round($totalAmount, 2) == round($input['grand_total'], 2)) {
                $input['payment_status'] = Sale::PAID;
            } elseif (round($totalAmount, 2) <= 0) {
                $input['payment_status'] = Sale::UNPAID;
            } else {
                $input['payment_status'] = Sale::PARTIAL_PAID;
            }
        }

        $walletPaymentType = PaymentMethod::whereType(PaymentMethod::CUSTOMER_WALLET)->first();
        $customerWallet = CustomerWallet::whereCustomerId($input['customer_id'])->first();
        if ($isCustomerChanged) {
            $oldCustomerWallet = CustomerWallet::whereCustomerId($sale->customer_id)->first();
            if ($oldCustomerWallet) {
                $oldCustomerWallet->increment('amount', $alreadyWalletPaid);
                $oldCustomerWallet->transactions()->create([
                    'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
                    'payment_method_id' => $walletPaymentType->id,
                    'amount' => $alreadyWalletPaid,
                    'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_REFUND,
                    'status' => CustomerWalletTransaction::STATUS_APPROVED,
                    'notes' => 'Payment refund for sale #' . $sale->reference_code,
                ]);
            }
            if ($input['payment_status'] != Sale::UNPAID) {
                $customerWallet->decrement('amount', $paymentWalletAmount);
                $customerWallet->transactions()->create([
                    'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
                    'payment_method_id' => $walletPaymentType->id,
                    'amount' => $paymentWalletAmount,
                    'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_PURCHASE,
                    'status' => CustomerWalletTransaction::STATUS_APPROVED,
                    'notes' => 'Payment for sale #' . $sale->reference_code,
                ]);
            }
        } else {
            if ($input['payment_status'] != Sale::UNPAID) {
                $differenceAmount = $paymentWalletAmount - $alreadyWalletPaid;
                if ($differenceAmount > 0) {
                    $customerWallet->decrement('amount', $differenceAmount);
                    $customerWallet->transactions()->create([
                        'direction' => CustomerWalletTransaction::DIRECTION_DEBIT,
                        'payment_method_id' => $walletPaymentType->id,
                        'amount' => $differenceAmount,
                        'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_PURCHASE,
                        'status' => CustomerWalletTransaction::STATUS_APPROVED,
                        'notes' => 'Payment for sale #' . $sale->reference_code,
                    ]);
                } else if ($differenceAmount < 0) {
                    $incrementAmount = abs($differenceAmount);
                    if ($incrementAmount > 0) {
                        $customerWallet->increment('amount', $incrementAmount);
                        $customerWallet->transactions()->create([
                            'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
                            'payment_method_id' => $walletPaymentType->id,
                            'amount' => $incrementAmount,
                            'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_REFUND,
                            'status' => CustomerWalletTransaction::STATUS_APPROVED,
                            'notes' => 'Payment refund for sale #' . $sale->reference_code,
                        ]);
                    }
                }
            } else {
                if ($alreadyWalletPaid > 0) {
                    $customerWallet->increment('amount', $alreadyWalletPaid);
                    $customerWallet->transactions()->create([
                        'direction' => CustomerWalletTransaction::DIRECTION_CREDIT,
                        'payment_method_id' => $walletPaymentType->id,
                        'amount' => $alreadyWalletPaid,
                        'transaction_type' => CustomerWalletTransaction::TRANSACTION_TYPE_REFUND,
                        'status' => CustomerWalletTransaction::STATUS_APPROVED,
                        'notes' => 'Payment refund for sale #' . $sale->reference_code,
                    ]);
                }
            }
        }

        $saleInputArray = Arr::only($input, [
            'customer_id',
            'warehouse_id',
            'tax_rate',
            'tax_amount',
            'discount',
            'discount_type',
            'discount_value',
            'shipping',
            'grand_total',
            'received_amount',
            'paid_amount',
            'payment_type',
            'note',
            'date',
            'status',
            'payment_status',
        ]);
        $sale->update($saleInputArray);

        return $sale;
    }

    /**
     * @param $input
     */
    public function generateBarcode($code): bool
    {
        $generator = new BarcodeGeneratorPNG();
        $barcodeType = $generator::TYPE_CODE_128;

        Storage::disk(config('app.media_disc'))->put(
            'sales/barcode-' . $code . '.png',
            $generator->getBarcode($code, $barcodeType, 4, 70)
        );

        return true;
    }
}
