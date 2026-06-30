import React, { useEffect, useRef, useState } from "react";
import MasterLayout from "../MasterLayout";
import { connect } from "react-redux";
import moment from "moment";
import ReactDataTable from "../../shared/table/ReactDataTable";
import ActionDropDownButton from "../../shared/action-buttons/ActionDropDownButton";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchPurchases } from "../../store/action/purchaseAction";
import DeletePurchase from "./DeletePurchase";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import {
    currencySymbolHandling,
    getPermission,
    getFormattedDate,
    paymentMethodName,
    placeholderText,
} from "../../shared/sharedMethod";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { purchasePdfAction } from "../../store/action/purchasePdfAction";
import ShowPayment from "../../shared/showPayment/ShowPayment";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { useNavigate } from "react-router";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { fetchPaymentMethods } from "../../store/action/paymentMethodAction";
import { Permissions } from "../../constants";

const Product = (props) => {
    const {
        fetchPurchases,
        fetchAllWarehouses,
        purchases,
        totalRecord,
        isLoading,
        purchasePdfAction,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        fetchPaymentMethods,
        paymentMethods,
        settings
    } = props;
    const selectedIdsRef = useRef([]);
    const navigate = useNavigate();
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isShowPaymentModel, setIsShowPaymentModel] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;
    const [tableArray, setTableArray] = useState([]);
    useEffect(() => {
        fetchPaymentMethods();
    }, []);
    
    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchAllWarehouses();
        fetchPurchases(filter, true);
    };

    const goToEditProduct = (item) => {
        const id = item.id;
        window.location.href = "#/app/purchases/edit/" + id;
    };

    const goToDetailScreen = (ProductId) => {
        window.location.href = "#/app/purchases/detail/" + ProductId;
    };

    const onShowPaymentClick = () => {
        setIsShowPaymentModel(!isShowPaymentModel);
    };

    //onClick pdf function
    const onPdfClick = (id) => {
        purchasePdfAction(id);
    };

    const itemsValue =
        currencySymbol &&
        purchases.length >= 0 &&
        purchases.map((purchase) => {
            let paid = 0;
            let due = 0;
            let partial = 0;

            const status = purchase.attributes.payment_status == null ? 2 : purchase.attributes.payment_status;

            if (status == 1) {
                paid = purchase.attributes.grand_total;
                due = 0;
                partial = 0;
            } else if (status == 2) {
                paid = 0;
                due = purchase.attributes.grand_total;
                partial = 0;
            } else if (status == 3) {
                partial = purchase.attributes.partial_amount ?? purchase.attributes.paid_amount ?? 0;
                paid = partial;
                due = purchase.attributes.grand_total - partial;
            }
            return {
                reference_code: purchase.attributes.reference_code,
                supplier: purchase.attributes.supplier_name ?? '-',
                warehouse: purchase.attributes.warehouse_name,
                status: purchase.attributes.status,
                paid: paid,
                due: due,
                payment_status: purchase.attributes.payment_status ? purchase.attributes.payment_status : 2,
                payment_type: purchase.attributes.payment_type,
                payment_type_name: {
                    value: purchase.attributes.payment_type,
                    label: paymentMethodName(paymentMethods, purchases && purchase.attributes)
                },
                date: getFormattedDate(
                    purchase.attributes.date,
                    allConfigData && allConfigData
                ),
                time: moment(purchase.attributes.created_at).format("LT"),
                grand_total: purchase.attributes.grand_total,
                currency: currencySymbol,
                id: purchase.id,
                is_return: purchase.attributes.is_return,
            };
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
        const sumField = (field) => {
            return itemsValue.reduce((acc, item) => acc + Number(item[field] || 0), 0);
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
                paid: sumField("paid"),
                due: sumField("due"),
                id: "totalRows",
                payment: "",
                currency: currencySymbol,
            };
            const newItemValue =
                itemsValue.length && newObject && itemsValue.concat(newObject);
            const latestArray = newItemValue.map((item) => item);
            newItemValue && newItemValue.length && setTableArray(latestArray);
        }
    }, [purchases]);

    const onCreatePurchaseReturnClick = (item) => {
        const id = item.id;
        navigate(
            item.is_return === 1
                ? "/app/purchases/return/edit/" + id
                : "/app/purchases/return/" + id
        );
    };

    useEffect(() => {
        if (purchases.length === 0) {
            setTableArray([]);
        }
    }, [purchases]);

    const handleSelectedRowsChange = ({ selectedRows }) => {
        const ids = selectedRows.map(row => row.id);
        selectedIdsRef.current = ids;
        setSelectedIds(ids);
    };

    const handleDeleteMultiples = () => {
        setIsDelete([...selectedIdsRef.current]);
        setDeleteModel(!deleteModel);
    };

    const clearSelectedDeleteItem = () => {
        setClearSelectedRows(true);
        setSelectedIds([]);
    };

    useEffect(() => {
        if (clearSelectedRows) {
            setClearSelectedRows(false);
        }
    }, [clearSelectedRows]);

    const columns = [
        {
            name: getFormattedMessage("dashboard.recentSales.reference.label"),
            sortField: "reference_code",
            sortable: true,
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
            name: getFormattedMessage("supplier.title"),
            selector: (row) => row.supplier,
            sortField: "supplier",
            sortable: false,
        },
        {
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse,
            sortField: "warehouse",
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
                                    "status.filter.received.label"
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
            // selector: row => row.currency + ' ' + parseFloat(row.grand_total).toFixed(2),
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
        // {
        //     name: getFormattedMessage('dashboard.recentSales.paid.label'),
        //     // selector: row => row.currency + ' ' + parseFloat(row.paid).toFixed(2),
        //     sortField: 'paid',
        //     cell: row => {
        //         return row.reference_code === "Total" ? <span
        //                 className="fw-bold fs-4">{currencySymbolHandling(allConfigData, row.currency, row.paid)}</span> :
        //             <span>{currencySymbolHandling(allConfigData, row.currency, row.paid)}</span>
        //     },
        //     sortable: false,
        // },
        // {
        //     name: getFormattedMessage('dashboard.recentSales.due.label'),
        //     cell: row => {
        //         return row.reference_code === "Total" ? <span
        //                 className="fw-bold fs-4">{currencySymbolHandling(allConfigData, row.currency, row.due)}</span> :
        //             <span>{currencySymbolHandling(allConfigData, row.currency, row.due)}</span>
        //     },
        //     sortField: 'due',
        //     sortable: false,
        // },
        {
            name: getFormattedMessage("globally.detail.paid"),
            sortField: "paid",
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.paid
                        )}
                    </span>
                ) : (
                    <span>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.paid
                        )}
                    </span>
                );
            },
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.due"),
            sortField: "due",
            cell: (row) => {
                return row.reference_code === "Total" ? (
                    <span className="fw-bold fs-4">
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.due
                        )}
                    </span>
                ) : (
                    <span>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.due
                        )}
                    </span>
                );
            },
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "dashboard.recentSales.paymentStatus.label"
            ),
            sortField: "payment_status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.payment_status == 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "payment-status.filter.paid.label"
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
        {
            name: getFormattedMessage("select.payment-type.label"),
            sortField: "payment_type",
            sortable: false,
            cell: (row) => {
                if (row.reference_code === "Total") {
                    return null;
                }
                return (
                    ((row.payment_type == 0 || row.payment_type == null) && (
                        <span className="w-50 fw-bold text-center">
                            <span>-</span>
                        </span>
                    )) ||
                    (row.payment_status != 2 && row.payment_type >= 1 && (
                        <span className="badge bg-light-primary">
                            <span>{row.payment_type_name.label}</span>
                        </span>
                    ))
                );
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
                        goToEditProduct={getPermission(allConfigData?.permissions, Permissions.EDIT_PURCHASE) && goToEditProduct}
                        isPdfIcon={true}
                        onClickDeleteModel={onClickDeleteModel}
                        isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_PURCHASE || Permissions.MANAGE_CUSTOMER_DASHBOARD)}
                        onPdfClick={onPdfClick}
                        goToDetailScreen={goToDetailScreen}
                        onShowPaymentClick={onShowPaymentClick}
                        // isPaymentShow={true}
                        title={getFormattedMessage("purchase.title")}
                        isCreatePurchaseReturn={getPermission(allConfigData?.permissions, Permissions.EDIT_PURCHASE_RETURN) || getPermission(allConfigData?.permissions, Permissions.CREATE_PURCHASE_RETURN)}
                        onCreatePurchaseReturnClick={onCreatePurchaseReturnClick}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_PURCHASE)}
                    />
                ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("purchases.title")} />
            <div className="purchases_table">
                <ReactDataTable
                    columns={columns}
                    items={tableArray}
                    onChange={onChange}
                    isLoading={isLoading}
                    isShowDateRangeField
                    {...(getPermission(allConfigData?.permissions, Permissions.CREATE_PURCHASE) &&
                    {
                        to: "#/app/purchases/create",
                        ButtonValue: getFormattedMessage("purchase.create.title")
                    }
                    )}
                    totalRows={totalRecord}
                    isShowFilterField
                    isStatus
                    isCallFetchDataApi={isCallFetchDataApi}
                    selectableRows
                    onSelectedRowsChange={handleSelectedRowsChange}
                    isShowDeleteButton={selectedIds.length > 0}
                    handleDeleteMultiples={handleDeleteMultiples}
                    clearSelectedRows={clearSelectedRows}
                    isFiscalYearFilter={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
                />
            </div>
            <DeletePurchase
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            <ShowPayment
                onShowPaymentClick={onShowPaymentClick}
                isShowPaymentModel={isShowPaymentModel}
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        purchases,
        totalRecord,
        isLoading,
        warehouses,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        paymentMethods,
        settings
    } = state;
    return {
        purchases,
        totalRecord,
        isLoading,
        warehouses,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        paymentMethods,
        settings
    };
};

export default connect(mapStateToProps, {
    fetchPurchases,
    fetchAllWarehouses,
    purchasePdfAction,
    fetchPaymentMethods
})(Product);
