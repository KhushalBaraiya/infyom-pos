import React, { useEffect, useState } from 'react';
import MasterLayout from '../MasterLayout';
import TopBarProgress from 'react-topbar-progress-indicator';
import Widget from '../../shared/Widget/Widget';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faMoneyBill1Wave,
  faMoneyBillTrendUp,
  faMoneyBillTransfer
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import ReactDataTable from '../../shared/table/ReactDataTable';
import { currencySymbolHandling , getFormattedMessage } from '../../shared/sharedMethod';
import Topupmodal from './Topupmodal';
import { Row } from 'react-bootstrap';
import { fetchWalletTransactions } from '../../store/action/walletactions';
import { apiBaseURL } from '../../constants';
import axiosApi from '../../config/apiConfig';
import { Button } from 'react-bootstrap-v5';

const Wallet = () => {
  const {
    frontSetting,
    allConfigData,
    walletTransactions, 
    totalRecord,
    isLoading,
  } = useSelector(state => state);

  const [topupModal, settopupModel] = useState(false);
  const currency = frontSetting?.value?.currency_symbol;
  const [dashboardData, setDashboardData] = useState({});
  const [tableArray, setTableArray] = useState([]);
  
  const amount = parseFloat(2340).toFixed(2);
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
        paid = totalAmount;
        due = 0;
      } else if (status === 2) {
        paid = 0;
        due = totalAmount;
      } else if (status === 3) {
        paid = transaction.attributes.partial_amount ?? totalAmount;
        due = totalAmount - paid;
      }

      return {
        ...transaction,
        date: moment(transaction.attributes.created_at).format('YYYY-MM-DD'),
        time: moment(transaction.attributes.created_at).format('LT'),
        paid: paid,
        due: due,
        currency: currency,
        grand_total: totalAmount,
        id: transaction.isLoading
      };
    });

  const ispending = walletTransactions.some(t => t.attributes?.status === 0);
   useEffect(() => {
     if (!itemsValue || itemsValue.length === 0) {
       setTableArray([]);
       return;
     }
   
     const totalAmount = itemsValue.reduce(
       (sum, item) => sum + Number(item.attributes?.amount || 0),
       0
     );
   
     const totalRow = {
       reference_code: "Total",
       attributes: {},
       amount: totalAmount,
       isTotal: true
     };
   
     setTableArray([...itemsValue, totalRow]);
   
   }, [walletTransactions]);

  // useEffect(() => {
  //   const fetchPendingRequests = async () => {
  //     try {
  //       const id = null;
  //       const filter = {};
  //       const data = await axiosApi.get(apiBaseURL.CUSTOMER_WALLET + `/wallet/transactions`, { id, filter });
  //       const result = data.data.data;
        
  //       if (result.length <= 0) {
  //         setIsPending(false);
  //         return;
  //       }
        
  //       const pending = result?.filter(transaction => transaction?.attributes?.status == 0);
  //       setIsPending(pending.length > 0);
  //     } catch (error) {
  //       console.error('Error fetching wallet transactions:', error);
  //       setIsPending(false);
  //     }
  //   };

  //   fetchPendingRequests();
  // }, [walletTransactions]);

  useEffect(() => {
      const loadData = async () => {
          const tempDashboardData = await axiosApi.get(apiBaseURL.DASHBOARD_DATA).then(response => response.data.data);
          setDashboardData(tempDashboardData);
      };
  
      loadData();
  }, [dispatch]);


  const widgets = [
    { name: getFormattedMessage("wallet.label.total.balance"), value: dashboardData.current_wallet_balance || 0, className: 'widget-gradient-blue', icon: faWallet },
    { name: getFormattedMessage("total.wallet.add.title"), value: dashboardData.total_added_wallet_amount, className: 'widget-gradient-purple', icon: faMoneyBill1Wave },
    { name: getFormattedMessage("wallet.total.spent.label"), value: dashboardData.total_spent_wallet_amount, className: 'widget-gradient-orange', icon: faMoneyBillTransfer }
  ];

  const onChange = (filter) =>{
    dispatch(fetchWalletTransactions(null,filter));
  }

  const HandleTopUp = () => {
    settopupModel(!topupModal);
  };

  const AddButton = (
    <Button className={`btn-primary  text-white ${ispending ? 'd-none' : ''}`} onClick={HandleTopUp}>
      {getFormattedMessage("wallet.btn.topup.used")}
    </Button>
  );

  const columns = [
    {
      name: getFormattedMessage("wallet.transactions.type.label"),
      selector: row => row.attributes?.transaction_type_label,
      cell: row => {
        if (row.isTotal) {
          return <span className="fw-bold fs-4">Total</span>;
        }

        return <span>{row?.attributes?.transaction_type_label}</span>;
      }
    },  
    {
      name: getFormattedMessage("dashboard.recentSales.paymentStatus.label"),
      sortable: true,
      sortField: 'status',
      selector: row => row.attributes.status,
      cell: row => (
        <span className={`badge ${row.attributes.status === 1 ? 'bg-light-success' : row.attributes.status === 0 ? 'bg-light-warning' : 'bg-light-danger'}`}>
          {row?.attributes.status_label}
        </span>
      )
    },
    {
    name: getFormattedMessage("expense.input.amount.label"),
    sortable: true,
    sortField: 'amount',
    selector: row => row.attributes?.amount,
    cell: row => {
      if (row.isTotal) {
        return (
          <span className="fw-bold fs-4">
            {currencySymbolHandling(allConfigData, currency, row.amount)}
          </span>
        );
      }
  
      return (
        <span>
          {currencySymbolHandling(allConfigData, currency, row?.attributes?.amount)}
        </span>
      );
    }
    },
    {
      name: getFormattedMessage("globally.type.label"),
      sortable: true,
      sortField: 'direction',
      selector: row => row.attributes.direction,
      cell: row => {
        if (row.reference_code === "Total") {
            return null;
           }
        return <span className={`badge ${row?.attributes.direction === 2 ? 'bg-light-primary' : 'bg-light-danger'}`}>
          {row?.attributes.direction === 2 ? 'Credit' : 'Debit'}
        </span>
      }
    },
    {
      name: getFormattedMessage("react-data-table.date.column.label"),
      sortable: true,
      sortField: 'created_at',
      selector: row => row.attributes.created_at,
      cell: row => {
        if (row.reference_code === "Total") {
            return null;
           }
        return <span className="badge bg-light-info">
          <div>{row.time}</div>
          <div>{row.date}</div>
        </span>
      }
    }
  ];

  return (
    <MasterLayout>
      {isLoading && <TopBarProgress />}

      <Row className="widgets-row justify-content-center g-4 mb-5">
        {widgets.map(w => (
          <Widget
            key={w.name}
            title={w.name}
            className={w.className}
            iconClass="bg-transperant"
            icon={<FontAwesomeIcon icon={w.icon} className="fs-1-xl text-white" />}
            currency={currency}
            value={w.value}
          />
        ))}
      </Row>

      <ReactDataTable
        columns={columns}
        items={tableArray || []} 
        isLoading={isLoading}
        onChange={onChange}
        totalRows={totalRecord || 0}
        AddButton={AddButton}
        isShowFilterField={true}
        isactionFilter={true}
        isdirectionFilter={true}
        oppositeDirection={true}
      />

      <Topupmodal
        show={topupModal}
        handleClose={HandleTopUp}
        currency={currency}
      />
    </MasterLayout>
  );
};

export default Wallet;