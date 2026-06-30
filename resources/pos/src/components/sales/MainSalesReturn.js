import React from 'react'
import { useSelector } from 'react-redux';
import { Permissions } from '../../constants';
import CustomerPurchaseReturn from './CustomerPurchaseReturn';
import SaleReturn from '../saleReturn/SaleReturn';

const MainSalesReturn = () => {
    const { config } = useSelector((state) => state);
    return (
      config.includes(Permissions.MANAGE_CUSTOMERS_PURCHASE) ? (
          <CustomerPurchaseReturn />
      ) : <SaleReturn />
    );
}

export default MainSalesReturn
