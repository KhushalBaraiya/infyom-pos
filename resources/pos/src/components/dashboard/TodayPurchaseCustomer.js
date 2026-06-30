import React, { useEffect, useState } from "react";
import { Col, Row, Table } from "react-bootstrap"; // Added Table
import { connect, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMoneyBillWave,
    faShoppingCart,
    faRotateLeft,
    faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { currencySymbolHandling, getFormattedDate, getFormattedMessage } from "../../shared/sharedMethod";

import Widget from "../../shared/Widget/Widget";
import { fetchDashboardData, fetchWalletTransactions } from "../../store/action/walletactions";
import moment from "moment";
import { fetchProfile } from "../../store/action/updateProfileAction";
import TopupModal from "../wallete/Topupmodal";
import axiosApi from "../../config/apiConfigWthFormData";
import { apiBaseURL } from "../../constants";

const TodayPurchaseCustomer = (props) => {
    const {
        frontSetting,
        allConfigData,
        walletTransactions,
        isLoading,
        userProfile,
        fetchDashboardData
    } = props;

    const dispatch = useDispatch();
    const [topupModal, settopupModel] = useState(false);
    const currency = frontSetting?.value?.currency_symbol;
    const [ispending, setIsPending] = useState(true);
    const [dashboardData, setDashboardData] = useState([]);

useEffect(() => {
    const loadData = async () => {
        let filter = {
            pageSize: 10,
            order_By: "-created_at",
            page: 1
        };
        dispatch(fetchProfile());
        dispatch(fetchWalletTransactions(null,filter));

        const tempDashboardData = await axiosApi.get(apiBaseURL.DASHBOARD_DATA).then(response => response.data.data);
        setDashboardData(tempDashboardData);
    };

    loadData();
}, [dispatch]);

    useEffect(() => {
        setIsPending(true);
    const fetchPendingRequests = async () => {
      try {
        const id = null;
        const filter = {};
        const data = await axiosApi.get(apiBaseURL.CUSTOMER_WALLET + `/wallet/transactions`, { id, filter });
        const result = data.data.data;
        
        if (result.length <= 0) {
          setIsPending(false);
          return;
        }
        
        const pending = result?.filter(transaction => transaction?.attributes?.status == 0);
        setIsPending(pending.length > 0);
      } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        setIsPending(false);
      }
    };

    fetchPendingRequests();
  }, [dispatch,walletTransactions]);

    const HandleTopUp = () => {
       settopupModel(!topupModal);
       dispatch(fetchWalletTransactions());
    };

    const itemsValue =
        walletTransactions?.length >= 0 &&
        walletTransactions.map((transaction) => {
            const status = transaction.attributes.status;
            const totalAmount = parseFloat(transaction.attributes.amount || 0);

            return {
                ...transaction,
                date: moment(transaction.attributes.created_at).format('YYYY-MM-DD'),
                time: moment(transaction.attributes.created_at).format('hh:mm A'),
                status_val: status, // 1: Approved, 0: Pending, 2: Rejected
                direction_val: transaction.attributes.direction, // 2: Credit
                amount: totalAmount,
                id: transaction.id,
                label: transaction.attributes.transaction_type_label
            };
        });

    const getGreeting = () => {
        const hour = moment().hour();
        if (hour >= 5 && hour < 12) return <span className="fs-3">☀️ {getFormattedMessage("globally.good.morning.title")}</span>;
        if (hour >= 12 && hour < 17) return <span className="fs-3">🌞 {getFormattedMessage("globally.good.afternoon.title")}</span>;
        if (hour >= 17 && hour < 21) return <span className="fs-3">🌆 {getFormattedMessage("globally.good.evening.title")}</span>;
        return <span className="fs-3">🌙 {getFormattedMessage("globally.good.night.title")}</span>;
    };

    let states = [
        { name: getFormattedMessage("wallet.label.total.balance"), value: dashboardData.current_wallet_balance || 0, icon: faWallet, className: "widget-gradient-blue", iconClass: "bg-transperant" },
        { name: getFormattedMessage("wallet.total.purchase.label"), value: dashboardData.total_purchases_amount || 0, icon: faShoppingCart, className: "widget-gradient-yellow", iconClass: "bg-transperant" },
        { name: getFormattedMessage("wallet.total.purchase.return.label"), value: dashboardData.total_purchases_return_amount || 0, icon: faMoneyBillWave, className: "widget-gradient-green", iconClass: "bg-transperant" },
        { name: getFormattedMessage("wallet.total.spent.label"), value: dashboardData.total_spent_wallet_amount || 0, icon: faRotateLeft, className: "widget-gradient-purple", iconClass: "bg-transperant" },
    ];

    const customerData = { status: "Active Customer" };

    return (
        <>
            <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
                <h2 className="fw-bold mb-1">
                    {getGreeting()}, <span className="text-primary fs-2">{(userProfile?.attributes?.first_name || "") + " " + (userProfile?.attributes?.last_name || "")}</span>
                </h2>
            </div>

            <Row className="mt-5">
                <Col lg={4} className="mb-4 py-6">
                    <div className="bg-white rounded-3 shadow-sm border p-4 h-100 d-flex flex-column">
                        {/* Header: Compact & Balanced */}
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle border border-primary flex-shrink-0" style={{ width: "64px", height: "64px" }}>
                                <span className="text-primary fs-3 fw-bold">{userProfile?.attributes?.first_name?.charAt(0)}</span>
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="fw-bold text-dark mb-1 text-truncate">
                                    {`${userProfile?.attributes?.first_name || ""} ${userProfile?.attributes?.last_name || ""}`}
                                </h4>
                             <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                                    {customerData.status}
                                </span>
                            </div>
                        </div>
                
                        <hr className="text-muted opacity-25 mt-0" />
                
                        {/* Body: Split Data (Balanced Weight) */}
                        <div className="flex-grow-1 my-2">
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted fs-5">{getFormattedMessage('user.input.email.label')}</span>
                                <span className="text-dark fw-semibold fs-6">{userProfile?.attributes?.email}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted fs-5">{getFormattedMessage('user.input.phone-number.label')}</span>
                                <span className="text-dark fw-semibold fs-6">{userProfile?.attributes?.phone}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted fs-5">{getFormattedMessage("member.since.label")}</span>
                                <span className="text-dark fw-semibold fs-6">{getFormattedDate(userProfile?.attributes?.created_at, allConfigData)}</span>
                            </div>
                        </div>
                
                        <hr className="text-muted opacity-25" />
                
                        {/* Footer: Symmetrical Buttons */}
                        <div className="row g-2">
                            <div className="col-6">
                                <button className="btn btn-outline-primary w-100 fw-bold py-2 small" onClick={() => {window.location.href = '/#/app/profile/edit'}}>{getFormattedMessage("edit.profile.title")}</button>
                            </div>
                            <div className="col-6">
                                <button className={`btn ${ispending ? 'btn-secondary text-white' : 'btn-primary'} w-100 fw-bold py-2 small`} onClick={!ispending ? HandleTopUp : null}>{getFormattedMessage("wallet.topup.title")}</button>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col className="col-lg-8 col-12 mb-4 rounded-3 p-4 h-100">
                    <Row className="g-md-4">
                        {states.map((state, index) => (
                            <Widget
                                key={index}
                                title={state.name}
                                allConfigData={allConfigData}
                                customClass={true}
                                currency={currency}
                                icon={<FontAwesomeIcon icon={state.icon} className="fs-1-xl text-white" />}
                                className={`${state.className}`}
                                iconClass={state.iconClass}
                                value={parseFloat(state.value).toFixed(2)}
                            />
                        ))}
                    </Row>
                </Col>
            </Row>

            {/* Custom UI Table replacing ReactDataTable */}
            <Row className="p-4 bg-white rounded-3 shadow-sm mx-0">
                <h2 className="fs-4 fw-bold mb-4 px-3 py-2">{getFormattedMessage("recent.transactions.title")}</h2>
                <div className="table-responsive">
                    <Table className="align-middle custom-wallet-table">
                        <thead>
                            <tr className="text-uppercase text-muted fw-bold small">
                                <th className="border-0 pb-3">{getFormattedMessage("wallet.transactions.type.label")}</th>
                                <th className="border-0 pb-3">{getFormattedMessage("dashboard.recentSales.paymentStatus.label")}</th>
                                <th className="border-0 pb-3">{getFormattedMessage("expense.input.amount.label")}</th>
                                <th className="border-0 pb-3">{getFormattedMessage("globally.type.label")}</th>
                                <th className="border-0 pb-3">{getFormattedMessage("react-data-table.date.column.label")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {walletTransactions && walletTransactions.length == 0 ? (
                                <tr><td colSpan="5" className="text-center py-5">{getFormattedMessage("react-data-table.no-record-found.label")}</td></tr>
                            ) : itemsValue && itemsValue.length > 0 ? (
                                itemsValue.map((row , i) => (
                                    <tr key={row.id} className={`border-top`}>
                                        <td className="py-2 text-dark fw-medium">{row.label}</td>
                                        <td className="py-2">
                                            <span className={`badge px-3 py-2 rounded-2 fw-bold ${
                                                row.status_val === 1 ? 'bg-success-subtle text-success' : 
                                                row.status_val === 0 ? 'bg-warning-subtle text-warning' : 
                                                'bg-danger-subtle text-danger'
                                            }`}>
                                                {row.attributes.status_label}
                                            </span>
                                        </td>
                                        <td className="py-2 text-dark fw-medium">
                                           {currencySymbolHandling(allConfigData,currency,row.amount)}
                                        </td>
                                        <td className="py-2">
                                            <span className={`badge px-3 py-2 rounded-2 fw-bold ${
                                                row.direction_val === 2 ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger'
                                            }`}>
                                                {row.direction_val === 2 ? 'Credit' : 'Debit'}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <div className="badge bg-info-subtle text-info d-inline-flex flex-column align-items-center px-3 py-2 rounded-2 fw-bold" style={{minWidth: '100px'}}>
                                                <span>{row.time}</span>
                                                <span className="small opacity-75">{row.date}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-4">{getFormattedMessage("sale.product.table.no-data.label")}</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Row>

                  <TopupModal
                    show={topupModal}
                    handleClose={HandleTopUp}
                    currency={currency}
                  />

            <style>{`
                .bg-success-subtle { background-color: #e8faf0 !important; color: #1fb46d !important; }
                .bg-warning-subtle { background-color: #fff8e6 !important; color: #ffad0d !important; }
                .bg-danger-subtle { background-color: #fff0f1 !important; color: #f5365c !important; }
                .bg-primary-subtle { background-color: #e7eaff !important; color: #5e72e4 !important; }
                .bg-info-subtle { background-color: #e1f5fe !important; color: #03a9f4 !important; }
                .custom-wallet-table th { font-size: 0.75rem; letter-spacing: 0.05rem; }
                .custom-wallet-table td { border-bottom: 1px solid #f8f9fa; }
            `}</style>
        </>
    );
};

const mapStateToProps = (state) => {
    const { config, allConfigData, walletTransactions, isLoading, userProfile } = state;
    return { config, allConfigData, walletTransactions, isLoading, userProfile };
};

export default connect(mapStateToProps, {fetchDashboardData})(TodayPurchaseCustomer);