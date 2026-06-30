import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { fetchSales } from "../../../store/action/salesAction";
import { totalSaleReportExcel } from "../../../store/action/totalSaleReportExcel";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import ReactSelect from "../../../shared/select/reactSelect";
import { fetchUsers } from "../../../store/action/userAction";
import moment from "moment";

const SaleReport = (props) => {
    const {
        isLoading,
        totalRecord,
        fetchSales,
        sales,
        frontSetting,
        dates,
        totalSaleReportExcel,
        allConfigData,
        users,
        fetchUsers,
        settings
    } = props;
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const [currentFilter, setCurrentFilter] = useState({});

    const [userData, setUserData] = useState({
        id: "",
        value: "",
        label: placeholderText("select.user.label"),
    });
    const [usersData, setUsersData] = useState({
        usersDataOptions: [],
        userDataOptiosType: [],
    });
    const [userId, setUserId] = useState("");
    useEffect(() => {
        fetchUsers({}, true, "?page[size]=0&returnAll=true");
    }, []);

    useEffect(() => {
        if (users?.length > 0) {
            setUsersData((data) => ({
                ...data,
                usersDataOptions: [
                    {
                        id: "",
                        value: "",
                        name: placeholderText("select.user.label"),
                    },
                    ...users?.map((user) => ({
                        id: user?.id,
                        value: user?.id,
                        name: `${user?.attributes?.first_name} ${
                            user?.attributes?.last_name
                                ? user?.attributes?.last_name
                                : ""
                        }`,
                    })),
                ],
            }));
        }
    }, [users]);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        if (isWarehouseValue === true) {
            totalSaleReportExcel(
                { ...dates, user: userData?.value },
                setIsWarehouseValue,
                { fiscal_year_id: currentFilter?.fiscal_year_id }
            );
        }
    }, [isWarehouseValue]);

    const onUserChange = (data) => {
        setUserId(data.value)
        setUserData(data);
    };

    useEffect(()=>{
     onChange({ ...dates, user_id: userId });
    },[userId])

    const itemsValue =
        currencySymbol &&
        sales.length >= 0 &&
        sales.map((sale) => ({
            date: getFormattedDate(sale.attributes.date, allConfigData),
            time: moment(sale.attributes.created_at).format("LT"),
            reference_code: sale.attributes.reference_code,
            customer_name: sale.attributes.customer_name,
            warehouse_name: sale.attributes.warehouse_name,
            status: sale.attributes.status,
            payment_status: sale.attributes.payment_status,
            grand_total: sale.attributes.grand_total,
            paid_amount: sale.attributes.paid_amount
                ? sale.attributes.paid_amount
                : (0.0).toFixed(2),
            currency: currencySymbol,
            id: sale.id,
        }));

    const columns = [
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-primary">
                        <div className="mb-1">{row.time}</div>
                        <div>{row.date}</div>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("dashboard.recentSales.reference.label"),
            sortField: "reference_code",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.reference_code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("customer.title"),
            selector: (row) => row.customer_name,
            sortField: "customer_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("purchase.select.status.label"),
            sortField: "status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.status == 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.complated.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == 2 && (
                        <span className="badge bg-light-primary">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.pending.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == 3 && (
                        <span className="badge bg-light-warning">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.ordered.label"
                                )}
                            </span>
                        </span>
                    ))
                );
            },
        },
        {
            name: getFormattedMessage("purchase.grant-total.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.grand_total
                ),
            sortField: "grand_total",
            sortable: true,
        },
        {
            name: getFormattedMessage("dashboard.recentSales.paid.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.paid_amount
                ),
            sortField: "paid_amount",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.payment.status"),
            sortField: "payment_status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.payment_status == 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "globally.detail.paid"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.payment_status == 2 && (
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "payment-status.filter.unpaid.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.payment_status == 3 && (
                        <span className="badge bg-light-warning">
                            <span>
                                {getFormattedMessage(
                                    "payment-status.filter.partial.label"
                                )}
                            </span>
                        </span>
                    ))
                );
            },
        },
    ];

    const onChange = (filter) => {
        filter = { ...filter, user_id : userId };
        setCurrentFilter(filter);
        fetchSales(filter, true);
    };

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("sale.reports.title")} />
            <div className="mx-auto d-flex justify-content-center align-items-center col-12 col-md-4">
                <div className="w-50 mb-md-0 mb-3">
                    <ReactSelect
                        multiLanguageOption={usersData?.usersDataOptions}
                        onChange={onUserChange}
                        // defaultValue={usersData?.userDataOptiosType[0]}
                        title={getFormattedMessage("users.title")}
                        errors={""}
                        placeholder={placeholderText("select.user.label")}
                        isRequired
                        value={userData}
                    />
                </div>
            </div>
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                isShowDateRangeField
                isEXCEL={itemsValue && itemsValue.length > 0}
                isShowFilterField
                isStatus
                isPaymentStatus
                onExcelClick={onExcelClick}
                isFiscalYearFilter={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
            />
        </MasterLayout>
    );
};
const mapStateToProps = (state) => {
    const {
        sales,
        frontSetting,
        isLoading,
        totalRecord,
        dates,
        allConfigData,
        users,
        settings
    } = state;
    return {
        sales,
        frontSetting,
        isLoading,
        totalRecord,
        dates,
        allConfigData,
        users,
        settings
    };
};

export default connect(mapStateToProps, {
    fetchSales,
    totalSaleReportExcel,
    fetchUsers
})(SaleReport);
