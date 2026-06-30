import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import SalesForm from './SalesForm';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import { editSale, fetchSale } from '../../store/action/salesAction';
import { fetchAllCustomer } from '../../store/action/customerAction';
import { fetchAllWarehouses } from '../../store/action/warehouseAction';
import { getFormattedMessage, getFormattedOptions, paymentMethodName } from '../../shared/sharedMethod';
import paymentStatus from '../../shared/option-lists/paymentStatus.json';
import Spinner from "../../shared/components/loaders/Spinner";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { saleStatusOptions } from '../../constants';
import { fetchPaymentMethods } from '../../store/action/paymentMethodAction';

const EditSale = ( props ) => {
    const { fetchSale, sales, customers, fetchAllCustomer, warehouses, fetchAllWarehouses, isLoading, fetchPaymentMethods, paymentMethods } = props;
    const { id } = useParams();

    useEffect( () => {
        fetchAllCustomer();
        fetchAllWarehouses();
        fetchPaymentMethods();
        fetchSale( id );
    }, [] );

    const statusFilterOptions = getFormattedOptions( saleStatusOptions )
    const statusDefaultValue = sales.attributes && sales.attributes.status && statusFilterOptions.filter( ( option ) => option.id == sales.attributes.status )
    const selectedPayment = sales.attributes && sales.attributes.payment_status && paymentStatus.filter( ( item ) => item.value == sales.attributes.payment_status )

    const itemsValue = sales && sales.attributes && {
        date: sales.attributes.date,
        warehouse_id: {
            value: sales.attributes.warehouse_id,
            label: sales.attributes.warehouse_name,
        },
        customer_id: {
            value: sales.attributes.customer_id,
            label: sales.attributes.customer_name,
        },
        tax_rate: sales.attributes.tax_rate,
        tax_amount: sales.attributes.tax_amount,
        discount: sales.attributes.discount,
        discount_type: sales.attributes.discount_type,
        discount_value: sales.attributes.discount_value,
        shipping: sales.attributes.shipping,
        grand_total: sales.attributes.grand_total,
        amount: sales.attributes.amount,
        sale_items: sales.attributes.sale_items.map( ( item ) => ( {
            code: item.product && item.product.code,
            name: item.product && item.product.name,
            product_unit: item.product.product_unit,
            product_id: item.product_id,
            short_name: item.sale_unit && item.sale_unit.short_name && item.sale_unit.short_name,
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
            stock: item.product && item.product.stocks.filter( item => item.warehouse_id === sales.attributes.warehouse_id ),
            sub_total: item.sub_total,
            sale_unit: item.sale_unit && item.sale_unit.id && item.sale_unit.id,
            quantity: item.quantity,
            id: item.id,
            sale_item_id: item.id,
            newItem: '',
            quantity_limit:item.product.quantity_limit
        } ) ),
        id: sales.id,
        notes: sales.attributes.note,
        is_Partial: sales.attributes.payment_status,
        payment_status: {
            label: selectedPayment && selectedPayment[ 0 ] && selectedPayment[ 0 ].label,
            value: selectedPayment && selectedPayment[ 0 ] && selectedPayment[ 0 ].value
        },
        payment_type: {
            value: sales.attributes.payment_type,
            label: paymentMethodName(paymentMethods, sales && sales.attributes),
        },
        status_id: {
            label: statusDefaultValue && statusDefaultValue[ 0 ] && statusDefaultValue[ 0 ].name,
            value: statusDefaultValue && statusDefaultValue[ 0 ] && statusDefaultValue[ 0 ].id
        },
        payment_details: sales.attributes.payments?.map(payment => {
            const isWalletPayment = payment.payment_method?.type == 1;
            if (isWalletPayment) {
                return {
                    amount: payment.amount,
                    date: new Date(payment.payment_date),
                    reference: payment.reference || '',
                    payment_type: payment.payment_method ? 
                        { value: payment.payment_method.id, type: payment.payment_method?.type, label: payment.payment_method.name } : 
                        { value: payment.payment_type, type: payment.payment_method?.type, label: payment.payment_method?.name || 'Unknown' },
                };
            } else {
                return {
                    amount: payment.amount,
                    date: new Date(payment.payment_date),
                    reference: payment.reference || '',
                    payment_type: payment.payment_method ? 
                        { value: payment.payment_method.id, label: payment.payment_method.name } : 
                        { value: payment.payment_type, label: payment.payment_method?.name || 'Unknown' }
                };
            }
        }) || []
      
    };
    const isWalletUsed = sales.attributes?.payments?.some( payment => payment.payment_method?.type === 1 );
    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle title={getFormattedMessage( 'sale.edit.title' )} to='/app/sales' />
            {!sales ? <Spinner /> :
                <SalesForm singleSale={itemsValue} id={id} customers={customers} warehouses={warehouses} paymentMethods={paymentMethods} isWalletUsed={isWalletUsed} />}
        </MasterLayout>
    )
};

const mapStateToProps = ( state ) => {
    const { sales, customers, warehouses, isLoading, paymentMethods } = state;
    return { sales, customers, warehouses, isLoading, paymentMethods }
};

export default connect( mapStateToProps, { fetchSale, editSale, fetchAllCustomer, fetchAllWarehouses, fetchPaymentMethods} )( EditSale );
