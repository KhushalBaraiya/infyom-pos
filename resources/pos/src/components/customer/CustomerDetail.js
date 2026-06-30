import React, { useEffect, useState } from 'react'
import MasterLayout from '../MasterLayout'
import HeaderTitle from '../header/HeaderTitle'
import { currencySymbolHandling, getAvatarName, getFormattedDate, getFormattedMessage } from '../../shared/sharedMethod'
import { useParams } from 'react-router'
import { connect, useDispatch } from 'react-redux'
import { fetchCustomer } from '../../store/action/customerAction'
import ReactDataTable from '../../shared/table/ReactDataTable'
import Widget from '../../shared/Widget/Widget';
import ReactSelect from '../../shared/select/reactSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill1Wave, faMoneyBillTransfer, faMoneyBillTrendUp, faMoneyBillWave, faRotateLeft, faShoppingCart, faWallet } from '@fortawesome/free-solid-svg-icons'
import { Row } from 'react-bootstrap'
import { fetchFrontSetting } from '../../store/action/frontSettingAction'
import { fetchAllWalletTransactions } from '../../store/action/walletactions'
import moment from 'moment'
import axiosApi from '../../config/apiConfig'
import { apiBaseURL } from '../../constants'

const CustomerDetail = (props) => {
    const { id } = useParams()
    const { singleCustomer,frontSetting , walletTransactions, isLoading , fetchWalletTransactions,allConfigData } = props;
    const [DashboardData, setDashboardData] = useState([]);
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchCustomer(id))

        const loadData = async () => {;
            const tempDashboardData = await axiosApi.get(apiBaseURL.DASHBOARD_DATA + `/${id}`).then(response => response.data.data);
            setDashboardData(tempDashboardData);
        };
    
        loadData();
    }, [dispatch, id])

    const customerData = singleCustomer[0]?.attributes;
    
    const itemsValue =
      frontSetting.value && frontSetting.value.currency_symbol &&
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
         currency: frontSetting.value && frontSetting.value.currency_symbol,
         grand_total: totalAmount,
         id: transaction.id
       };
    });

    const onchange = (filter) => {
       filter = {...filter,user_id:id,direction_type:""}
       dispatch(fetchAllWalletTransactions(filter));
    }

      let states = [
          { name: getFormattedMessage("wallet.label.total.balance"), value: DashboardData.current_wallet_balance || 0, icon: faWallet, className: "widget-gradient-blue", iconClass: "bg-transperant" },
          { name: getFormattedMessage("wallet.total.purchase.label"), value: DashboardData.total_purchases_amount || 0, icon: faShoppingCart, className: "widget-gradient-yellow", iconClass: "bg-transperant" },
          { name: getFormattedMessage("wallet.total.purchase.return.label"), value: DashboardData.total_purchases_return_amount || 0, icon: faMoneyBillWave, className: "widget-gradient-green", iconClass: "bg-transperant" },
          { name: getFormattedMessage("wallet.total.spent.label"), value: DashboardData.total_spent_wallet_amount || 0, icon: faRotateLeft, className: "widget-gradient-purple", iconClass: "bg-transperant" },
        ];

    // Static Columns for Data Table
  const columns = [
    {
      name: getFormattedMessage("wallet.transactions.type.label"),
      selector: row => row.attributes.transaction_type_label,
      sortField: 'transaction_type',
      cell: row => <span>{row?.attributes.transaction_type_label}</span>
    },
    {
      name: getFormattedMessage("dashboard.recentSales.status.label"),
      sortable: true,
      sortField: 'status',
      selector: row => row.attributes.status,
      cell: row => (
        <span className={`badge ${row.attributes.status === 1 ? 'bg-light-success' : 'bg-light-warning'}`}>
          {row?.attributes.status_label == "Approved" ? getFormattedMessage("wallet.approved.label") : getFormattedMessage("wallet.rejected.label")}
        </span>
      )
    },
    {
      name: getFormattedMessage("expense.input.amount.label"),
      sortable: true,
      sortField: 'amount',
      selector: row => row.attributes.amount,
      cell: row => <span>{currencySymbolHandling(allConfigData, frontSetting.value && frontSetting.value.currency_symbol, row?.attributes.amount || 0)}</span>
    },
    {
      name: getFormattedMessage("wallet.type.label"),
      sortable: true,
      sortField: 'direction',
      selector: row => row.attributes.direction,
      cell: row => (
        <span className={`badge ${row?.attributes.direction === 2 ? 'bg-light-primary' : 'bg-light-danger'}`}>
          {row?.attributes.direction === 2 ? getFormattedMessage("wallet.credit.label") : getFormattedMessage("wallet.debit.label")}
        </span>
      )
    },
    {
      name: getFormattedMessage("react-data-table.date.column.label"),
      sortable: true,
      sortField: 'created_at',
      selector: row => row.attributes.created_at,
      cell: row => (
        <span className="badge bg-light-info">
          <div>{row.time}</div>
          <div>{row.date}</div>
        </span>
      )
    }
  ];


    if (!customerData) {
        return (
            <MasterLayout>
                <div className='d-flex justify-content-center mt-5'>
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            </MasterLayout>
        )
    }

    return (
        <MasterLayout>
            <HeaderTitle title={getFormattedMessage('customer.details.title')} to='/app/customers' />

            <div className='container-fluid px-3'>
                <div className='card border-0 mb-4 shadow-sm'>
                    <div className='card-body p-4'>
                        <div className='row align-items-center'>
                            <div className='col-md-6 d-flex align-items-center mb-3 mb-md-0'>
                                <div className='rounded-circle d-flex align-items-center justify-content-center me-4'
                                    style={{ width: '80px', height: '80px', backgroundColor: '#5867f2' }}>
                                    <span className='text-white fw-bold h3 mb-0'>
                                       {getAvatarName(customerData.name)}
                                    </span>
                                </div>
                                <div>
                                    <div className="mb-1">
                                        <span className="badge bg-light-success text-success fw-bold px-2 py-1" style={{ fontSize: '11px' }}>{getFormattedMessage("active.status.lable")}</span>
                                    </div>
                                    <h4 className='fw-bolder mb-0 text-dark'>{customerData.name}</h4>
                                    <span className='text-muted fs-6'>{customerData.email}</span>
                                </div>
                            </div>
                             
                            <div className='col-md-6'>
                                <div className='d-flex justify-content-md-start gap-5'>
                                    <div className='text-start text-md-start'>
                                        <div className='mb-2'>
                                            <span className='text-muted fw-bold' style={{ fontSize: '0.9rem' }}>{getFormattedMessage("pos-sale.detail.Phone.info")} : </span>
                                            <span className='text-dark fw-medium'>{customerData.phone || 'N/A'}</span>
                                        </div>
                                        <div className='mb-2'>
                                            <span className='text-muted fw-bold' style={{ fontSize: '0.9rem' }}>{getFormattedMessage("globally.input.country.label")} : </span>
                                            <span className='text-dark fw-medium'>{customerData.country || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className='text-muted fw-bold' style={{ fontSize: '0.9rem' }}>{getFormattedMessage("users.table.date.column.title")} : </span>
                                            <span className='text-dark fw-medium'>{getFormattedDate(customerData.created_at, allConfigData )|| 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-'></div>
            <Row className="widgets-row justify-content-center g-4 mb-5">
                {states.map((state, index) => (
                            <Widget
                                key={index}
                                title={state.name}
                                allConfigData={allConfigData}
                                currency={frontSetting.value && frontSetting.value.currency_symbol}
                                icon={<FontAwesomeIcon icon={state.icon} className="fs-1-xl text-white" />}
                                className={`${state.className}`}
                                iconClass={state.iconClass}
                                value={state.value}
                            />
                        ))}
            </Row>  
            <ReactDataTable
                columns={columns}
                items={itemsValue || []}
                isLoading={isLoading}
                totalRows={walletTransactions?.length || 0}
                onChange={onchange}
            />

        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    return {
        isLoading : state.isLoading,
        frontSetting : state.frontSetting,
        singleCustomer: state.customers.singleCustomer || state.customers,
        walletTransactions: state.walletTransactions,
        allConfigData: state.allConfigData
    };
};  

export default connect(mapStateToProps, { fetchCustomer , fetchFrontSetting , fetchAllWalletTransactions })(CustomerDetail);