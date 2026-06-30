import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect, useDispatch, useSelector } from "react-redux";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteSale from "./DeleteSale";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    paymentMethodName,
    placeholderText,
} from "../../shared/sharedMethod";
import { customerSalePdfAction } from "../../store/action/salePdfAction";
import ActionDropDownButton from "../../shared/action-buttons/ActionDropDownButton";
import { fetchFrontSetting } from "../../store/action/frontSettingAction";
import ShowPayment from "../../shared/showPayment/ShowPayment";
import { fetchCustomerSalePayments, fetchSalePayments } from "../../store/action/salePaymentAction";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { fetchCustomerPurchases } from "../../store/action/purchaseAction";
import { OverlayTrigger, Tooltip } from "react-bootstrap-v5";
import { fetchPaymentMethods } from "../../store/action/paymentMethodAction";
import ShowCustomerPayment from "../../shared/showPayment/ShowCustomerPayment";

const CustomerPurchase = (props) => {
    const {
        purchases,
        fetchCustomerPurchases,
        totalRecord,
        isLoading,
        customerSalePdfAction,
        fetchFrontSetting,
        frontSetting,
        isCallSaleApi,
        allConfigData,
        fetchPaymentMethods,
        paymentMethods
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isShowPaymentModel, setIsShowPaymentModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [createPaymentItem, setCreatePaymentItem] = useState({});
    const { allSalePayments } = useSelector((state) => state);
    const [tableArray, setTableArray] = useState([]);
    useEffect(() => {
        fetchFrontSetting();
        fetchPaymentMethods();
    }, []);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const onChange = (filter) => {
        fetchCustomerPurchases(filter, true);
    };

    // delete sale function
    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };
    const dispatch = useDispatch();

    const onShowPaymentClick = (item) => {
        setIsShowPaymentModel(!isShowPaymentModel);
        setCreatePaymentItem(item);
        if (item) {
            dispatch(fetchCustomerSalePayments(item.id));
        }
    };

    //sale details function
    const goToDetailScreen = (ProductId) => {
        window.location.href = "#/app/purchases/detail/" + ProductId;
    };

    //onClick pdf function
    const onPdfClick = (id) => {
        customerSalePdfAction(id);
    };

    const itemsValue =
        currencySymbol &&
        purchases && purchases.length >= 0 &&
        purchases.map((sale) => {
            // Get the last payment method name
            let lastPaymentMethodName = '';
            let paymentCount = 0;
            
            if (sale.attributes.payments && sale.attributes.payments.length > 0) {
                paymentCount = sale.attributes.payments.length;
                const lastPayment = sale.attributes.payments[sale.attributes.payments.length - 1];
                lastPaymentMethodName = lastPayment.payment_method ? lastPayment.payment_method.name : '';
            } else if (paymentMethods && sale.attributes) {
                lastPaymentMethodName = paymentMethodName(paymentMethods, sale && sale.attributes);
            }
            
            return {
                date: getFormattedDate(
                    sale.attributes.created_at,
                    allConfigData && allConfigData
                ),
                // date_for_payment: sale.attributes.date,
                time: moment(sale.attributes.created_at).format("LT"),
                reference_code: sale.attributes.reference_code,
                customer_name: sale.attributes.customer_name,
                customer_wallet_amount: sale.attributes.customer_wallet_amount || 0,
                user_name: sale.attributes.user_name,
                warehouse_name: sale.attributes.warehouse_name,
                status: sale.attributes.status,
                payment_status: sale.attributes.payment_status,
                payment_type: sale.attributes.payment_type,
                payment_type_name: {
                    value: sale.attributes.payment_type,
                    label: lastPaymentMethodName
                },
                payment_count: paymentCount,
                payments: sale.attributes.payments || [],
                grand_total: sale.attributes.grand_total,
                paid_amount: sale.attributes.paid_amount
                    ? sale.attributes.paid_amount
                    : (0.0).toFixed(2),
                id: sale.id,
                currency: currencySymbol,
                is_return: sale.attributes.is_return,
                due_amount: sale.attributes.due_amount
            }
        });

    useEffect(() => {
        const grandTotalSum = () => {
            let x = 0;
            itemsValue.length &&
                itemsValue.map((item) => {
                    x = x + Number(item.grand_total);
                    return x;
                });
            return x;
        };
        const paidTotalSum = (itemsValue) => {
            let x = 0;
            itemsValue.length &&
                itemsValue.map((item) => {
                    x = x + Number(item.paid_amount);
                    return x;
                });
            return x;
        };
        if (purchases.length) {
            const newObject = itemsValue.length && {
                date: "",
                time: "",
                reference_code: "Total",
                customer_name: "",
                warehouse_name: "",
                status: "",
                payment_status: "",
                payment_type: "",
                grand_total: grandTotalSum(itemsValue),
                paid_amount: paidTotalSum(itemsValue),
                id: "",
                currency: currencySymbol,
            };
            const newItemValue =
                itemsValue.length && newObject && itemsValue.concat(newObject);
            const latestArray = newItemValue.map((item) => item);
            newItemValue.length && setTableArray(latestArray);
        } else {
            setTableArray([]);
        }
    }, [purchases]);

    const columns = [
        {
            name: getFormattedMessage("dashboard.recentSales.reference.label"),
            sortField: "reference_code",
            sortable: false,
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {getFormattedMessage("pos-total.title")}
                    </span>
                ) : (
                    <span className="badge bg-light-danger">
                        <span>{row.reference_code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse_name,
            sortField: "warehouse_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("purchase.select.status.label"),
            sortField: "status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.status === 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.complated.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status === 2 && (
                        <span className="badge bg-light-primary">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.pending.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status === 3 && (
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
            sortField: "grand_total",
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.grand_total
                        )}
                    </span>
                ) : (
                    <span>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.grand_total
                        )}
                    </span>
                );
            },
            sortable: true,
        },
        {
            name: getFormattedMessage("dashboard.recentSales.paid.label"),
            sortField: "paid_amount",
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.paid_amount
                        )}
                    </span>
                ) : (
                    <span>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.paid_amount
                        )}
                    </span>
                );
            },
            sortable: true,
        },
        {
            name: getFormattedMessage(
                "dashboard.recentSales.paymentStatus.label"
            ),
            sortField: "payment_status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.payment_status === 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "payment-status.filter.paid.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.payment_status === 2 && (
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "payment-status.filter.unpaid.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.payment_status === 3 && (
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
        {
            name: getFormattedMessage("select.payment-type.label"),
            sortField: "payment_type",
            sortable: false,
            cell: (row) => {
                if (row.reference_code === "Total") {
                    return null;
                }
                
                // Create tooltip content showing all payments
                const renderPaymentTooltip = (props) => {
                    return (
                        <Tooltip id="payment-tooltip" {...props}>
                            <div className="text-start">
                                <ul className="mb-0">
                                    {row.payments.map((payment, index) => (
                                        <li key={index}>
                                            {payment.payment_method?.name}: {currencySymbolHandling(
                                                allConfigData,
                                                row.currency,
                                                payment.amount
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Tooltip>
                    );
                };
                
                const hasPayments = row.payments && row.payments.length > 0;
                
                if (row.payment_type == 0 || row.payment_type == null) {
                    return (
                        <span className="w-50 fw-bold text-center">
                            <span>-</span>
                        </span>
                    );
                } else if (row.payment_status != 2 && row.payment_type >= 1) {
                    const paymentElement = (
                        <span className="badge bg-light-primary">
                            <span>
                                {row?.payment_type_name?.label}
                                {row.payment_count > 1 && ` +${row.payment_count - 1}`}
                            </span>
                        </span>
                    );
                    
                    return hasPayments ? (
                        <OverlayTrigger
                            placement="top"
                            overlay={renderPaymentTooltip}
                        >
                            {paymentElement}
                        </OverlayTrigger>
                    ) : paymentElement;
                }
                
                return null;
            },
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "date",
            sortable: true,
            cell: (row) => {
                return (
                    row.date && (
                        <span className="badge bg-light-info">
                            <div className="mb-1">{row.time}</div>
                            <div>{row.date}</div>
                        </span>
                    )
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) =>
                row.reference_code === "Total" ? null : (
                    <ActionDropDownButton
                        item={row}
                        isEditMode={true}
                        isDeleteMode={false}
                        isPdfIcon={true}
                        onPdfClick={onPdfClick}
                        title={getFormattedMessage("purchase.title")}
                        isPaymentShow={true}
                        isViewIcon={true}
                        goToDetailScreen={goToDetailScreen}
                        onShowPaymentClick={onShowPaymentClick}
                        isCreateSaleReturn={true}
                    />
                ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("purchase.title")} />
            <div className="sale_table">
                <ReactDataTable
                    columns={columns}
                    items={tableArray}
                    isShowPaymentModel={isShowPaymentModel}
                    isCallSaleApi={isCallSaleApi}
                    isShowDateRangeField
                    onChange={onChange}
                    totalRows={totalRecord}
                    isLoading={isLoading}
                    isShowFilterField
                    isPaymentStatus
                    isStatus
                    isPaymentType
                />
            </div>
            <DeleteSale
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
            <ShowCustomerPayment
                allConfigData={allConfigData}
                setIsShowPaymentModel={setIsShowPaymentModel}
                currencySymbol={currencySymbol}
                allSalePayments={allSalePayments}
                createPaymentItem={createPaymentItem}
                onShowPaymentClick={onShowPaymentClick}
                isShowPaymentModel={isShowPaymentModel}
                paymentMethods={paymentMethods}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        purchases,
        totalRecord,
        isLoading,
        frontSetting,
        isCallSaleApi,
        allConfigData,
        paymentMethods,
    } = state;
    return {
        purchases,
        totalRecord,
        isLoading,
        frontSetting,
        isCallSaleApi,
        allConfigData,
        paymentMethods,
    };
};

export default connect(mapStateToProps, {
    fetchCustomerPurchases,
    customerSalePdfAction,
    fetchFrontSetting,
    fetchPaymentMethods,
})(CustomerPurchase);
