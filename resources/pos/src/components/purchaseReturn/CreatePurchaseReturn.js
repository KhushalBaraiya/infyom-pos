import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {useNavigate, useParams} from 'react-router-dom';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import {fetchAllWarehouses} from '../../store/action/warehouseAction';
import {fetchAllSuppliers} from '../../store/action/supplierAction';
import PurchaseReturnForm from './PurchaseReturnForm';
import {addPurchaseReturn} from '../../store/action/purchaseReturnAction';
import {getFormattedMessage, getFormattedOptions} from '../../shared/sharedMethod';
import { fetchPurchase } from '../../store/action/purchaseAction';
import { saleStatusOptions } from '../../constants';
import { editPurchaseReturnArray } from './editPurchaseReturnArray';

const CreatePurchaseReturn = (props) => {
    const {addPurchaseReturn, warehouses, fetchAllWarehouses, fetchAllSuppliers, suppliers, purchases, fetchPurchase} = props;
    const navigate = useNavigate();
    const { id } = useParams();
    const createPurchaseReturn = true

    useEffect(() => {
        fetchAllWarehouses();
        fetchAllSuppliers();
        id && fetchPurchase( id );
    }, []);

    const addPurchaseReturnData = (formValue) => {
        addPurchaseReturn(formValue, navigate);
    };

    const supplierId = purchases && purchases.attributes && purchases.attributes.supplier_id
    const warehouseId = purchases && purchases.attributes && purchases.attributes.warehouse_id
    const supplier = suppliers && suppliers.filter( ( supplier ) => supplier.id === supplierId );
    const supplierName = supplier[ 0 ] && supplier[ 0 ].attributes && supplier[ 0 ].attributes.name
    const warehouse = warehouses.filter( ( warehouse ) => warehouse.id === warehouseId );
    const warehouseName = warehouse[ 0 ] && warehouse[ 0 ].attributes && warehouse[ 0 ].attributes.name

    const statusFilterOptions = getFormattedOptions( saleStatusOptions )
    const statusDefaultValue = purchases && purchases.attributes && purchases.attributes.status && statusFilterOptions.filter( ( item ) => item.id == purchases.attributes.status )

    const itemsValue = purchases && purchases.attributes && {
        date: purchases.attributes.date,
        warehouse_id: {
            label: warehouseName,
            value: purchases.attributes.warehouse_id,
        },
        supplier_id: {
            label: supplierName,
            value: purchases.attributes.supplier_id,
        },
        discount: purchases.attributes.discount,
        orderTax: purchases.attributes.tax_rate,
        shipping: purchases.attributes.shipping,
        notes: purchases.attributes.notes,
        purchase_return_items: editPurchaseReturnArray( purchases?.attributes?.purchase_items, purchases?.attributes?.warehouse_id, createPurchaseReturn ),
        newItem: '',
        id: purchases.id,
        purchase_id: purchases.id,
        status_id: {
            label: statusDefaultValue[ 0 ] && statusDefaultValue[ 0 ].name,
            value: statusDefaultValue[ 0 ] && statusDefaultValue[ 0 ].id
        }
    };

    return (
        <MasterLayout>
            <HeaderTitle title={getFormattedMessage('purchase.return.create.title')} to='/app/purchase-return'/>
            <PurchaseReturnForm {...(id && { createSinglePurchase: itemsValue })} addPurchaseReturnData={addPurchaseReturnData} warehouses={warehouses}
                                suppliers={suppliers}/>
        </MasterLayout>
    );
}

const mapStateToProps = (state) => {
    const {warehouses, suppliers, totalRecord, purchases} = state;
    return {warehouses, suppliers, totalRecord, purchases}
};

export default connect(mapStateToProps, {
    addPurchaseReturn,
    fetchAllWarehouses,
    fetchAllSuppliers,
    fetchPurchase
})(CreatePurchaseReturn);
