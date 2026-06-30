import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShoppingCart,
    faCartPlus,
    faArrowRight,
    faArrowLeft,
    faDollar,
    faSquareMinus,
    faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { currencySymbolHandling, getFormattedMessage, getPermission } from "../../shared/sharedMethod";
import { todaySalePurchaseCount } from "../../store/action/dashboardAction";
import { useNavigate } from "react-router-dom";
import { fetchAllSalePurchaseCount } from "../../store/action/allSalePurchaseAction";
import DateRangePicker from "../../shared/datepicker/DateRangePicker";
import { dateFormat, Permissions } from "../../constants";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap-v5";

const TodaySalePurchaseCount = (props) => {
    const {
        todaySalePurchaseCount,
        todayCount,
        frontSetting,
        config,
        allSalePurchase,
        fetchAllSalePurchaseCount,
        allConfigData,
        loginUser,
        settings
    } = props;
    const navigate = useNavigate();

    const [selectDate, setSelectDate] = useState();
    const startMonth = moment().startOf("month").format(dateFormat.NATIVE);
    const today = moment().format(dateFormat.NATIVE);

    useEffect(() => {
        todaySalePurchaseCount();
    }, []);

    useEffect(() => {
        onChangeDidMount();
    }, [selectDate]);

    const onChange = (filter) => {
        fetchAllSalePurchaseCount(filter);
    };

    const onDateSelector = (date) => {
        setSelectDate(date.params);
    };

    const onChangeDidMount = () => {
        const filters = {
            search: "",
            start_date: selectDate == undefined ? startMonth : selectDate.start_date ? selectDate.start_date : "",
            end_date: selectDate == undefined ? today : selectDate.end_date ? selectDate.end_date : "",
        };
        onChange(filters);
    };

    const getGreeting = () => {
        const hour = moment().hour();

        if (hour >= 5 && hour < 12) return <span className="fs-3">☀️ {getFormattedMessage("globally.good.morning.title")}</span>;
        if (hour >= 12 && hour < 17) return <span className="fs-3">🌞 {getFormattedMessage("globally.good.afternoon.title")}</span>;
        if (hour >= 17 && hour < 21) return <span className="fs-3">🌆 {getFormattedMessage("globally.good.evening.title")}</span>;
        return <span className="fs-3">🌙 {getFormattedMessage("globally.good.night.title")}</span>;
    };

    const widgetData = [
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE) ? [{
            title: getFormattedMessage("sales.title"),
            value: allSalePurchase.all_sales_count ? parseFloat(allSalePurchase.all_sales_count).toFixed(2) : "0.00",
            redirect: "app/sales",
            permission: "manage_sale",
            className: "widget-gradient-blue",
            iconClass: "bg-pink-700",
            icon: faShoppingCart,
            currency: true,
        }] : []),
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_PURCHASE) ? [{
            title: getFormattedMessage("purchases.title"),
            value: allSalePurchase.all_purchases_count ? parseFloat(allSalePurchase.all_purchases_count).toFixed(2) : "0.00",
            redirect: "app/purchases",
            permission: "manage_purchase",
            className: "widget-gradient-purple",
            iconClass: "bg-red-300",
            icon: faCartPlus,
            currency: true,
        }] : []),
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE_RETURN) ? [{
            title: getFormattedMessage("sales-return.title"),
            value: allSalePurchase.all_sale_return_count ? parseFloat(allSalePurchase.all_sale_return_count).toFixed(2) : "0.00",
            redirect: 'app/sale-return',
            permission: "manage_sale_return",
            className: "widget-gradient-orange",
            iconClass: "bg-purple-700",
            icon: faArrowRight,
            currency: true,
        }] : []),
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_PURCHASE_RETURN) ? [{
            title: getFormattedMessage("purchases.return.title"),
            value: allSalePurchase.all_purchase_return_count ? parseFloat(allSalePurchase.all_purchase_return_count).toFixed(2) : "0.00",
            redirect: 'app/purchase-return',
            permission: "manage_purchase_return",
            className: "widget-gradient-lightblue",
            iconClass: "bg-blue-300",
            icon: faArrowLeft,
            currency: true,
        }] : []),
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE) ? [{
            title: getFormattedMessage("dashboard.widget.today-total-sales.label"),
            value: todayCount.today_sales ? parseFloat(todayCount.today_sales).toFixed(2) : "0.00",
            redirect: 'app/sales',
            permission: "manage_sale",
            className: "widget-gradient-yellow",
            iconClass: "bg-green-300",
            icon: faDollar,
            currency: true,
        }] : []),
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE) ? [{
            title: getFormattedMessage("dashboard.widget.today-payment-received.label"),
            value: todayCount.today_sales_received_count ? parseFloat(todayCount.today_sales_received_count).toFixed(2) : "0.00",
            redirect: "app/sales",
            permission: "manage_sale",
            className: "widget-gradient-green",
            iconClass: "bg-blue-300",
            icon: faMoneyBill,
            currency: true,
        }] : []),
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_PURCHASE) ? [{
            title: getFormattedMessage("dashboard.widget.today-total-purchases.label"),
            value: todayCount.today_purchases ? parseFloat(todayCount.today_purchases).toFixed(2) : "0.00",
            redirect: "app/purchases",
            permission: "manage_purchase",
            className: "widget-gradient-red",
            iconClass: "bg-blue-300",
            icon: faCartPlus,
            currency: true,
        }] : []),
        ...(getPermission(allConfigData?.permissions, Permissions.MANAGE_EXPENSES) ? [{
            title: getFormattedMessage("dashboard.widget.today-total-expense.label"),
            value: todayCount.today_expense_count ? parseFloat(todayCount.today_expense_count).toFixed(2) : "0.00",
            redirect: 'app/expenses',
            permission: "manage_expenses",
            className: "widget-gradient-pink",
            iconClass: "bg-cyan-300",
            icon: faSquareMinus,
            currency: true,
        }] : [])
    ];

    const renderTooltip = (msg) => (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {msg}
        </Tooltip>
    );

    const handleClick = (redirect, permission) => {
        if (
            config &&
            config.filter((item) => item === permission).length !== 0
        ) {
            navigate(`/${redirect}`);
        }
    };

    return (
        <>
            <div className="row align-items-center mb-1">
                {/* Greeting Section */}
                <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
                    <h2 className="fw-bold  mb-1">
                        {getGreeting()}, <span className="text-primary fs-2">{loginUser?.user?.first_name + " " + loginUser?.user?.last_name}</span>
                    </h2>
                </div>
                <div className="col-12 col-md-6 d-flex justify-content-end">
                    <DateRangePicker
                        onDateSelector={onDateSelector}
                        selectDate={selectDate}
                        isProfitReport={true}
                        allConfigData={allConfigData}
                        isFiscalYearFilter = {settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
                    />
                </div>
            </div>

            <Row className="my-3">
                {widgetData.map((w, idx) => (
                    <Col key={idx} xxl={3} xl={4} sm={6} className="mb-2">
                        <div
                            className={`widget-card ${w.className}`}
                            style={{ minHeight: "120px" }}
                            type={w.redirect ? "button" : ""}
                            onClick={() =>
                                handleClick(w.redirect, w.permission)
                            }
                        >
                            <div>
                                <h2 className="fw-normal text-white mb-1">{w.title}</h2>
                                <h2 className="fw-bold text-white mb-0">
                                    <OverlayTrigger
                                        placement="bottom"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={renderTooltip(
                                            w.currency
                                                ? currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, w.value) ?? 0
                                                : w.value ?? 0
                                        )}
                                    >
                                        <span>
                                             {w.currency
                                                ? currencySymbolHandling(allConfigData, frontSetting?.value?.currency_symbol, w.value, true) ?? 0
                                                : w.value ?? 0}
                                        </span>
                                    </OverlayTrigger>
                                </h2>
                            </div>
                            <div className=" text-white opacity-100">
                                <FontAwesomeIcon icon={w.icon} className="dashboard-widget-icon " />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    );
};
const mapStateToProps = (state) => {
    const { todayCount, allSalePurchase, config, allConfigData, loginUser,settings } = state;
    return { todayCount, allSalePurchase, config, allConfigData, loginUser, settings };
};

export default connect(mapStateToProps, {
    todaySalePurchaseCount,
    fetchAllSalePurchaseCount,
})(TodaySalePurchaseCount);
