import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchAllWarehouses } from '../../store/action/warehouseAction';
import { useParams } from 'react-router-dom'
import HeaderTitle from '../header/HeaderTitle';
import MasterLayout from '../MasterLayout';
import PurchaseForm from './PurchaseForm';
import { fetchAllSuppliers } from '../../store/action/supplierAction';
import { fetchPurchase } from '../../store/action/purchaseAction';
import { editPrepareArray } from '../../shared/prepareArray/editPrepareArray';
import { getFormattedMessage, getFormattedOptions, paymentMethodName } from '../../shared/sharedMethod';
import Spinner from "../../shared/components/loaders/Spinner";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { purchaseStatusOptions } from '../../constants';
import paymentStatus from '../../shared/option-lists/paymentStatus.json';
import { fetchPaymentMethods } from '../../store/action/paymentMethodAction';

const EditPurchase = ( props ) => {
    const { fetchPurchase, purchases, warehouses, fetchAllSuppliers, fetchPaymentMethods, suppliers, fetchAllWarehouses, isLoading, paymentMethods } = props;
    const { id } = useParams();

    useEffect( () => {
        fetchAllWarehouses();
        fetchAllSuppliers();
        fetchPaymentMethods();
        fetchPurchase( id );
    }, [] );

    const supplierId = purchases && purchases.attributes && purchases.attributes.supplier_id
    const warehouseId = purchases && purchases.attributes && purchases.attributes.warehouse_id

    const supplier = suppliers && suppliers.filter( ( supplier ) => supplier.id === supplierId );
    const supplierName = supplier[ 0 ] && supplier[ 0 ].attributes && supplier[ 0 ].attributes.name

    const warehouse = warehouses.filter( ( warehouse ) => warehouse.id === warehouseId );
    const warehouseName = warehouse[ 0 ] && warehouse[ 0 ].attributes && warehouse[ 0 ].attributes.name

    purchases && purchases.attributes && purchases.attributes.purchase_items.forEach( ( item ) => {
        item.fix_net_unit = item.product_cost
        item.stock_alert = item.product && item.product.stock_alert
        item.short_name = item.purchase_unit.short_name
        item.newItem = ''
        item.purchase_item_id = item.id
        item.code = item.product && item.product.code
        item.name = item.product && item.product.name
    } );

    const statusFilterOptions = getFormattedOptions( purchaseStatusOptions )
    const statusDefaultValue = purchases.attributes && purchases.attributes.status && statusFilterOptions.filter( ( item ) => item.id == purchases.attributes.status );
    const currentPaymentStatus = purchases.attributes && purchases.attributes.payment_status != null
        ? purchases.attributes.payment_status
        : 2;
    const selectedPayment = paymentStatus.filter((item) => item.value == currentPaymentStatus);
    const purchasesItemsId = purchases && purchases.attributes && purchases.attributes.purchase_items && purchases.attributes.purchase_items.map( ( item ) => item.id );

    const itemsValue = purchases && purchases.attributes && {
        date: purchases.attributes.date,
        warehouse_id: {
            value: purchases.attributes.warehouse_id,
            label: warehouseName,
        },
        supplier_id: {
            value: purchases.attributes.supplier_id,
            label: supplierName,
        },
        discount: purchases.attributes.discount,
        tax_rate: purchases.attributes.tax_rate,
        shipping: purchases.attributes.shipping,
        notes: purchases.attributes.notes,
        purchase_items: editPrepareArray( purchases.attributes.purchase_items, purchases.attributes.warehouse_id ),
        newItem: '',
        purchase_item_id: purchasesItemsId ? purchasesItemsId[ 0 ] : '',
        id: purchases.id,
        status_id: {
            label: statusDefaultValue[ 0 ] && statusDefaultValue[ 0 ].name,
            value: statusDefaultValue[ 0 ] && statusDefaultValue[ 0 ].id
        },
        payment_status: {
            label: selectedPayment && selectedPayment[ 0 ] && selectedPayment[ 0 ].label,
            value: selectedPayment && selectedPayment[ 0 ] && selectedPayment[ 0 ].value
        },
        payment_type: {
            value: purchases.attributes.payment_type,
            label: paymentMethodName(paymentMethods, purchases && purchases.attributes),
        },
        tax_amount: purchases.attributes.tax_amount,
        partial_amount: purchases.attributes.partial_amount,
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle title={getFormattedMessage( 'purchase.edit.title' )} to='/app/purchases' />
            {isLoading ? <Spinner /> :
                <PurchaseForm singlePurchase={itemsValue} id={id} warehouses={warehouses} suppliers={suppliers} paymentMethods={paymentMethods} />}
        </MasterLayout>
    )
};

const mapStateToProps = ( state ) => {
    const { purchases, warehouses, suppliers, isLoading, paymentMethods} = state;
    return { purchases, warehouses, suppliers, isLoading, paymentMethods }
};

export default connect( mapStateToProps, { fetchPurchase, fetchAllSuppliers, fetchAllWarehouses, fetchPaymentMethods } )( EditPurchase );

