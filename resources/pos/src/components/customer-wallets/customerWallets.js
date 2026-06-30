import React, { useEffect, useState } from 'react';
import MasterLayout from '../MasterLayout';
import TopBarProgress from 'react-topbar-progress-indicator';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import ReactDataTable from '../../shared/table/ReactDataTable';
import { fetchAllWalletTransactions, WalletStatusChange } from '../../store/action/walletactions';
import ReactSelect from '../../shared/select/reactSelect';
import { currencySymbolHandling, getFormattedDate, getFormattedMessage, getPermission, placeholderText } from '../../shared/sharedMethod';
import { fetchSingleWalletTransaction } from '../../store/action/SingleWalletAction';
import TransactionDetailsModal from './TransactionDetailsModal';
import ActionButton from '../../shared/action-buttons/ActionButton';
import { Permissions } from '../../constants';

const CustomerWallets = () => {
  const {
    frontSetting,
    walletTransactions, 
    isLoading,
    allConfigData,
    singleWalletTransaction,
    settings
  } = useSelector(state => state);
  
  const currency = frontSetting?.value?.currency_symbol;
  const [transactionModal, setTransactionModal] = useState(false);
  const dispatch = useDispatch();


  const itemsValue =
    currency &&
    walletTransactions?.length >= 0 &&
    walletTransactions.map((transaction) => {
      let paid = 0;
      let due = 0;
      const status = transaction.attributes.status;
      const totalAmount = parseFloat(transaction.attributes.amount || 0);

      if (status === 1) {
        paid = totalAmount; due = 0;
      } else if (status === 2) {
        paid = 0; due = totalAmount;
      } else if (status === 3) {
        paid = transaction.attributes.partial_amount ?? totalAmount;
        due = totalAmount - paid;
      }

      return {
        ...transaction,
        date: getFormattedDate(transaction.attributes.created_at, allConfigData && allConfigData),
        time: moment(transaction.attributes.created_at).format('LT'),
        customer_name: transaction.attributes.customer?.name,
        email: transaction.attributes.customer?.email,
        note: transaction.attributes.notes || '-',
        attachment: transaction.attributes.attachment,
        paid: paid,
        due: due,
        currency: currency,
        grand_total: totalAmount,
        id: transaction.id,
        customerID: transaction.attributes?.wallet?.customer_id,
      };
    });

  const onChange = (filter) => {
    dispatch(fetchAllWalletTransactions(filter));
  }

  const HandleWalletStatusChange = (id, statusValue) => {
    dispatch(WalletStatusChange(id, statusValue));
  };

  const handleViewCustomer = (id) => {
    window.location.href = `#/app/customers/detail/${id}`;
  };

  const HandleViewTransaction = (id) => {
     dispatch(fetchSingleWalletTransaction(id))
     setTransactionModal(true)
  };

  const columns = [
    {
      name: getFormattedMessage('customer.name.label'),
      selector: row => row.customer_name,
      sortField: 'transaction_type',
      cell: row =>   <div>
                        <div className="text-primary cursor-pointer" onClick={() => handleViewCustomer(row.customerID)}>{row.customer_name}</div>
                        <div>{row.email}</div>
                    </div>
    },
    {
      name: getFormattedMessage('wallet.transactions.type.label'),
      selector: row => row.attributes.transaction_type_label,
      sortField: 'transaction_type',
      cell: row => <span>{row?.attributes.transaction_type_label}</span>
    },
    {
      name: getFormattedMessage('globally.amount.label'),
      sortable: true,
      sortField: 'amount',
      selector: row => row.attributes.amount,
      cell: row => <span>{currencySymbolHandling(allConfigData, currency, row?.attributes.amount || 0)}</span>
    },
    {
      name: getFormattedMessage('wallet.type.label'),
      sortable: true,
      sortField: 'direction',
      selector: row => row.attributes.direction,
      cell: row => (
        <span className={`badge ${row?.attributes.direction === 2 ? 'bg-light-primary' : 'bg-light-danger'}`}>
          {row?.attributes.direction === 2 ? getFormattedMessage('wallet.credit.label') : getFormattedMessage('wallet.debit.label')}
        </span>
      )
    },
    {
      name: getFormattedMessage('globally.react-table.column.created-date.label'),
      sortable: true,
      sortField: 'created_at',
      selector: row => row.attributes.created_at,
      cell: row => (
        <span className="badge bg-light-info">
          <div>{row.time}</div>
          <div>{row.date}</div>
        </span>
      )
    },
    {
      name: getFormattedMessage('react-data-table.action.column.label'),
      width: '200px',
      cell: row => {
        return row.attributes.status === 0 ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'  }}>
            <ReactSelect
              data={[
                { label: getFormattedMessage('wallet.approve.label'), value: 1 },
                { label: getFormattedMessage('wallet.reject.label'), value: 2 },
              ]}
              onChange={(e) => HandleWalletStatusChange(row.id, e.value)}
              placeholder={getFormattedMessage('wallet.select-status.placeholder')}
              defaultValue={null}
              isRequired={true}
            />
          </div>
        ) : (
          <span className={` badge ${row.attributes.status === 1 ? 'bg-light-success' : 'bg-light-danger'}`}>
            {row.attributes.status === 1 ? getFormattedMessage('wallet.approved.label') : getFormattedMessage('wallet.rejected.label')}
          </span>
        );
      }
    },
    {
    name: placeholderText('globally.view.tooltip.label'),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    cell: (row) => (
        <ActionButton
            isViewIcon={getPermission(allConfigData?.permissions, Permissions.MANAGE_CUSTOMERS)}
            isEditMode={false}
            isDeleteMode={false}
            goToDetailScreen={HandleViewTransaction}
            item={row}
        />
    ),
    },
  ];

  return (
    <MasterLayout>
      {isLoading && <TopBarProgress />}
      <ReactDataTable
        isShowFilterField={true}
        isactionFilter={true}
        columns={columns}
        items={itemsValue || []}
        isLoading={isLoading}
        onChange={onChange}
        totalRows={walletTransactions?.length || 0}
        creditdirection={true}
       isFiscalYearFilter={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
      />
      {
        transactionModal &&  <TransactionDetailsModal show={transactionModal} onClose={() => setTransactionModal(false)} transactionData={singleWalletTransaction} allConfigData={allConfigData} frontSetting={frontSetting}/>
      }
    </MasterLayout>
  );
};

export default CustomerWallets;