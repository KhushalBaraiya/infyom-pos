import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import MasterLayout from "../MasterLayout";
import ReactDataTable from "../../shared/table/ReactDataTable";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchPurchasesReturn } from "../../store/action/purchaseReturnAction";
import DeletePurchaseReturn from "./DeletePurchaseReturn";
import { fetchAllSuppliers } from "../../store/action/supplierAction";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import {
    currencySymbolHandling,
    getPermission,
    getFormattedDate,
    placeholderText,
} from "../../shared/sharedMethod";
import { getFormattedMessage } from "../../shared/sharedMethod";
import ActionDropDownButton from "../../shared/action-buttons/ActionDropDownButton";
import { purchaseReturnPdfAction } from "../../store/action/purchaseReturnPdfAction";
import ShowPayment from "../../shared/showPayment/ShowPayment";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";

const PurchaseReturn = (props) => {
    const {
        fetchPurchasesReturn,
        fetchAllWarehouses,
        fetchAllSuppliers,
        purchaseReturn,
        totalRecord,
        isLoading,
        suppliers,
        purchaseReturnPdfAction,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        settings
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isShowPaymentModel, setIsShowPaymentModel] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchAllSuppliers();
        fetchAllWarehouses();
        fetchPurchasesReturn(filter, true);
    };

    const goToEditProduct = (item) => {
        const id = item.id;
        window.location.href = "#/app/purchase-return/edit/" + id;
    };

    const goToPurchaseReturn = (ProductId) => {
        window.location.href = "#/app/purchase-return/detail/" + ProductId;
    };

    //onClick pdf function
    const onPurchaseReturnPdf = (id) => {
        purchaseReturnPdfAction(id);
    };

    const onShowPaymentClick = () => {
        setIsShowPaymentModel(!isShowPaymentModel);
    };

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const itemsValue =
        currencySymbol &&
        purchaseReturn.length >= 0 &&
        purchaseReturn.map((purchase) => {
            const supplier = suppliers.filter(
                (supplier) => supplier.id === purchase.attributes.supplier_id
            );
            const supplierName =
                supplier[0] &&
                supplier[0].attributes &&
                supplier[0].attributes.name;
            return {
                reference_code: purchase.attributes.reference_code,
                supplier: supplierName,
                warehouse: purchase.attributes.warehouse_name,
                status: purchase.attributes.status,
                date: getFormattedDate(
                    purchase.attributes.date,
                    allConfigData && allConfigData
                ),
                time: moment(purchase.attributes.created_at).format("LT"),
                grand_total: purchase.attributes.grand_total,
                id: purchase.id,
                currency: currencySymbol,
            };
        });

    const handleSelectedRowsChange = ({ selectedRows }) => {
        const ids = selectedRows.map(row => row.id);
        setSelectedIds(ids);
    };

    const handleDeleteMultiples = () => {
        setDeleteModel(!deleteModel);
        setIsDelete(selectedIds);
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
                return (
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
                    (row.status === 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.received.label"
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
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "date",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        <div>{row.date}</div>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <ActionDropDownButton
                    isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_PURCHASE_RETURN)}
                    goToDetailScreen={goToPurchaseReturn}
                    item={row}
                    onClickDeleteModel={onClickDeleteModel}
                    isPdfIcon={true}
                    goToEditProduct={getPermission(allConfigData?.permissions, Permissions.EDIT_PURCHASE_RETURN) && goToEditProduct}
                    title={getFormattedMessage("purchases.return.title")}
                    onPdfClick={onPurchaseReturnPdf}
                    onShowPaymentClick={onShowPaymentClick}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_PURCHASE_RETURN)}
                    // isPaymentShow={true}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("purchases.return.title")} />
            <div className="purchases_return_table">
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isLoading}
                    {...(getPermission(allConfigData?.permissions, Permissions.CREATE_PURCHASE_RETURN) &&
                    {
                        to: "#/app/purchase-return/create",
                        ButtonValue: getFormattedMessage("purchase.return.create.title")
                    }
                    )}
                    totalRows={totalRecord}
                    isShowDateRangeField
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
            <DeletePurchaseReturn
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
        purchaseReturn,
        totalRecord,
        isLoading,
        warehouses,
        suppliers,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        settings
    } = state;
    return {
        purchaseReturn,
        totalRecord,
        isLoading,
        warehouses,
        suppliers,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
        settings
    };
};

export default connect(mapStateToProps, {
    fetchPurchasesReturn,
    fetchAllWarehouses,
    purchaseReturnPdfAction,
    fetchAllSuppliers,
})(PurchaseReturn);
