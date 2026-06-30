import React, { useEffect, useState } from "react";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { connect } from "react-redux";
import ReactSelect from "../../../shared/select/reactSelect";
import { fetchAllWarehouses } from "../../../store/action/warehouseAction";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { fetchSuppliersReport, suppliersPdfAction } from "../../../store/action/suppliersReportAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const SuppliersReport = (props) => {
    const {
        isLoading,
        totalRecord,
        fetchAllWarehouses,
        frontSetting,
        warehouses,
        fetchSuppliersReport,
        allSupplierReport,
        allConfigData,
        suppliersPdfAction,
        settings
    } = props;

    const [warehouseValue, setWarehouseValue] = useState({
        label: "All",
        value: null,
    });
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    const itemsValue =
        currencySymbol &&
        allSupplierReport.length >= 0 &&
        allSupplierReport.map((report) => ({
            name: report.name,
            phone: report.phone ? report.phone : '-',
            purchase: report.purchases_count,
            total_amount: report.total_grand_amount,
            // paid: stockReport.attributes.product.product_price,
            // total_purchase_due: stockReport.attributes.product.product_unit,
            // total_purchase_return_due: stockReport.attributes.quantity,
            id: report.id,
            currency: currencySymbol,
        }));

    const onChange = (filter) => {
        fetchSuppliersReport(filter, true);
    };

    const onPdfClick = (item) => {
        const id = item.id;
        suppliersPdfAction(id);
    };

    const onWarehouseChange = (obj) => {
        setWarehouseValue(obj);
    };

    const onReportsClick = (item) => {
        const id = item.id;
        window.location.href = "#/app/report/suppliers/details/" + id;
    };

    const columns = [
        {
            name: getFormattedMessage("supplier.table.name.column.title"),
            sortField: "name",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.name}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("users.table.phone-number.column.title"),
            selector: (row) => row.phone,
            sortField: "phone",
            sortable: false,
        },
        {
            name: getFormattedMessage("purchases.title"),
            selector: (row) => row.purchase,
            sortField: "purchase",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="text-center w-25">{row.purchase}</span>
                );
            }
        },
        {
            name: getFormattedMessage("pos-total-amount.title"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_amount
                ),
            sortField: "total_amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "150px",
            style: {
                justifyContent: "start",
            },
            cell: (row) =>
                row.purchase > 0 ? (
                    <>
                        <button
                            className="btn btn-sm btn-primary me-3"
                            variant="primary"
                            onClick={() => onPdfClick(row)}
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                        </button>
                        <button
                            className="btn btn-sm btn-primary"
                            variant="primary"
                            onClick={() => onReportsClick(row)}
                        >
                            {getFormattedMessage("reports.title")}
                        </button>
                    </>
                ) : (
                    <span className="text-center w-50">-</span>
                ),
        },
    ];

    const array = warehouses;
    const newFirstElement = {
        attributes: { name: getFormattedMessage("report-all.warehouse.label") },
        id: null,
    };
    const newArray = [newFirstElement].concat(array);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("supplier.report.title")} />
            {/*<div className='mx-auto mb-md-5 col-12 col-md-4'>*/}
            {/*    {newArray &&*/}
            {/*    <ReactSelect data={newArray} onChange={onWarehouseChange} defaultValue={newArray[0] ? {*/}
            {/*        label: newArray[0].attributes.name,*/}
            {/*        value: newArray[0].id*/}
            {/*    } : ''}*/}
            {/*                 title={getFormattedMessage('warehouse.title')} errors={''} isRequired*/}
            {/*                 placeholder={placeholderText('purchase.select.warehouse.placeholder.label')}/>}*/}
            {/*</div>*/}
            <div className="pt-md-7">
                <ReactDataTable
                    columns={columns}
                    // warehouseValue={warehouseValue}
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isLoading}
                    totalRows={totalRecord}
                    isShowFilterField={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
                    isFiscalYearFilter={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
                />
            </div>
        </MasterLayout>
    );
};
const mapStateToProps = (state) => {
    const {
        isLoading,
        totalRecord,
        warehouses,
        frontSetting,
        allSupplierReport,
        allConfigData,
        settings
    } = state;
    return {
        isLoading,
        totalRecord,
        warehouses,
        frontSetting,
        allSupplierReport,
        allConfigData,
        settings
    };
};

export default connect(mapStateToProps, {
    fetchAllWarehouses,
    fetchSuppliersReport,
    suppliersPdfAction
})(SuppliersReport);
