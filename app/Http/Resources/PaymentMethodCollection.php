<?php

namespace App\Http\Resources;

/**
 * Class PaymentMethodCollection
 */
class PaymentMethodCollection extends BaseCollection
{
    public $collects = PaymentMethodResource::class;
}
