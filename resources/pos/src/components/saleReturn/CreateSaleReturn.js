import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import SaleReturnForm from './SaleReturnForm';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import {  fetchCustomer } from '../../store/action/customerAction';
import { fetchAllWarehouses } from '../../store/action/warehouseAction';
import { addSaleReturn } from '../../store/action/salesReturnAction';
import { getFormattedMessage } from '../../shared/sharedMethod';
import { useParams } from "react-router-dom";
import { fetchSale } from "../../store/action/salesAction";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import Spinner from "../../shared/components/loaders/Spinner";
import saleReturnStatus from "./saleReturnStatus.json";

const CreateSaleReturn = ( props ) => {
    const { addSaleReturn, sales, isLoading, fetchSale, fetchCustomer, warehouses, fetchAllWarehouses } = props;

    const { id } = useParams()

    useEffect( () => {
        fetchAllWarehouses();
        fetchSale( id )
    }, [] );

    const addSaleData = ( formValue, navigate ) => {
        addSaleReturn( formValue, navigate )
    }

    const selectedStatus = sales.attributes && sales.attributes.status && saleReturnStatus.filter( ( item ) => item.value === sales.attributes.status )

    const itemsValue = sales && sales.attributes && {
        date: sales.attributes.date,
        wallet_amount: sales.attributes.customer_wallet_amount,
        warehouse_id: {
            value: sales.attributes.warehouse_id,
            label: sales.attributes.warehouse_name,
        },
        customer_id: {
            value: sales.attributes.customer_id,
            label: sales.attributes.customer_name,
        },
        tax_rate: 0,
        tax_amount: 0,
        discount: 0,
        shipping: 0,
        grand_total: 0,
        amount: sales.attributes.amount,
        payments: sales?.attributes?.payments,
        sale_items: sales.attributes.sale_items.map( ( item ) => ( {
            code: item.product && item.product.code,
            name: item.product && item.product.name,
            product_unit: item.product.product_unit,
            product_id: item.product_id,
            short_name: item.sale_unit && item.sale_unit.short_name,
            stock_alert: item.product && item.product.stock_alert,
            product_price: item.product_price,
            product_wholesale_price: item.product && item.product.product_wholesale_price,
            product_special_price: item.product && item.product.product_special_price,
            original_product_price: item.product && item.product.product_price,
            product_price_type: item.price_group,
            fix_net_unit: item.product_price,
            net_unit_price: item.product_price,
            tax_type: item.tax_type,
            tax_value: item.tax_value,
            tax_amount: item.tax_amount,
            discount_type: item.discount_type,
            discount_value: item.discount_value,
            discount_amount: item.discount_amount,
            isEdit: true,
            stock: "",
            sold_quantity: item.quantity,
            sub_total: item.sub_total,
            sale_unit: item.sale_unit && item.sale_unit.id && item.sale_unit.id,
            quantity: 0,
            id: item.id,
            sale_item_id: item.id,
            newItem: '',
            isSaleReturn: true,
        } ) ),
        id: sales.id,
        sale_id: sales.id,
        status_id: sales.attributes.status,
        // status_id: {
        //     label: selectedStatus[0] && selectedStatus[0].label,
        //     value: selectedStatus[0] && selectedStatus[0].value
        // },
        note: sales.attributes.note,
        sale_reference: sales.attributes.reference_code,
        isCreateSaleReturn: true,
    };

    useEffect( () => {
        if (sales?.attributes?.customer_id !== undefined) fetchCustomer( sales?.attributes?.customer_id );
    }, [sales] );

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle title={getFormattedMessage( 'sale-return.create.title' )} to='/app/sales' />
            {isLoading ? <Spinner /> :
                sales && <SaleReturnForm addSaleData={addSaleData} singleSale={itemsValue} id={id} warehouses={warehouses} />}
        </MasterLayout>
    )
}

const mapStateToProps = ( state ) => {
    const { customers, sales, warehouses, totalRecord, isLoading, addSaleReturn,  } = state;
    return { singleCustomer:customers, sales, warehouses, totalRecord, isLoading, addSaleReturn }
};

export default connect( mapStateToProps, { addSaleReturn, fetchSale, fetchCustomer, fetchAllWarehouses } )( CreateSaleReturn );
