import React from 'react'
import { useSelector } from 'react-redux';
import { Permissions } from '../../constants';
import CustomerPurchase from './CustomerPurchase';
import Sales from './Sales';

const MainSales = () => {
    const { config } = useSelector((state) => state);
    return (
      config.includes(Permissions.MANAGE_CUSTOMERS_PURCHASE) ? (
          <CustomerPurchase />
      ) : <Sales />
    );
}

export default MainSales