<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SaleCollection;
use App\Http\Resources\SaleResource;
use App\Models\Customer;
use App\Models\Sale;
use App\Repositories\SaleRepository;
use Illuminate\Support\Facades\Auth;

class CustomerSellController extends AppBaseController
{
    /** @var saleRepository */
    private $saleRepository;

    public function __construct(SaleRepository $saleRepository)
    {
        $this->saleRepository = $saleRepository;
    }

    public function purchaseProduct(Request $request)
    {
        $perPage = getPageSize($request);
        // $search = $request->filter['search'] ?? '';
        $customerId = Customer::whereEmail(Auth::user()->email)->first()->id;
        $sales = $this->saleRepository->where('customer_id', $customerId)->get();
        // if(!empty($search)){
        //     $sales = $this->saleRepository->where('customer_id', $customerId)->where('product_name', 'LIKE', "%$search%")->get();
        // }

        $data = $this->saleRepository->paginate($perPage);

        SaleResource::usingWithCollection();

        return new SaleCollection($data);
    }
}
