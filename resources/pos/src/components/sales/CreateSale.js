import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import SalesForm from './SalesForm';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import {addSale} from '../../store/action/salesAction';
import {fetchAllCustomer} from '../../store/action/customerAction';
import {fetchAllWarehouses} from '../../store/action/warehouseAction';
import {getFormattedMessage} from '../../shared/sharedMethod';
import { fetchPaymentMethods } from '../../store/action/paymentMethodAction';

const CreateSale = (props) => {
    const {addSale, customers, fetchAllCustomer, warehouses, fetchAllWarehouses, fetchPaymentMethods, paymentMethods} = props;
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllCustomer();
        fetchAllWarehouses();
        fetchPaymentMethods();
    }, []);

    const addSaleData = (formValue) => {
        addSale(formValue, navigate);
    };

    return (
        <MasterLayout>
            <HeaderTitle title={getFormattedMessage('sale.create.title')} to='/app/sales'/>
            <SalesForm addSaleData={addSaleData} customers={customers} warehouses={warehouses} paymentMethods={paymentMethods}/>
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const {customers, warehouses, totalRecord, paymentMethods} = state;
    return {customers, warehouses, totalRecord, paymentMethods}
};

export default connect(mapStateToProps, {addSale, fetchAllCustomer, fetchAllWarehouses, fetchPaymentMethods})(CreateSale);
