import React, { useEffect } from "react";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { connect } from "react-redux";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    fetchCustomersReport,
    customerPdfAction,
} from "../../../store/action/customerReportAction";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SuppliersReport = (props) => {
    const {
        isLoading,
        totalRecord,
        frontSetting,
        allCustomerReport,
        fetchCustomersReport,
        customerPdfAction,
        allConfigData,
        settings,
    } = props;

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const itemsValue =
        currencySymbol &&
        allCustomerReport.length >= 0 &&
        allCustomerReport.map((report) => ({
            name: report.name,
            phone: report.phone ? report.phone : '-',
            total_sale: report.sales_count,
            total_amount: report.total_grand_amount,
            total_paid_amount: report.total_paid_amount,
            total_due_amount: report.total_due_amount,
            id: report.id,
            currency: currencySymbol,
        }));

    // featch all
    const onChange = (filter) => {
        fetchCustomersReport(filter, true);
    };

    // get customer report deatils page
    const onReportsClick = (item) => {
        const id = item.id;
        window.location.href = "#/app/report/customers/details/" + id;
    };

    //onClick pdf function
    const onPdfClick = (item) => {
        const id = item.id;
        customerPdfAction(id);
    };

    const columns = [
        {
            name: getFormattedMessage("customer.title"),
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
            name: getFormattedMessage("total.sales.title"),
            selector: (row) => row.total_sale,
            sortField: "total_sale",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="text-center w-50">{row.total_sale}</span>
                );
            }
        },
        {
            name: getFormattedMessage("expense.input.amount.label"),
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
            name: getFormattedMessage("dashboard.recentSales.paid.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_paid_amount
                ),
            sortField: "total_paid_amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("dashboard.recentSales.due.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_due_amount
                ),
            sortField: "total_due_amount",
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
                row.total_sale > 0 ? (
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

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("customer.report.title")} />
            <div className="pt-md-7">
                <ReactDataTable
                    columns={columns}
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
        frontSetting,
        allCustomerReport,
        allConfigData,
        settings,
    } = state;
    return {
        isLoading,
        totalRecord,
        frontSetting,
        allCustomerReport,
        allConfigData,
        settings,
    };
};

export default connect(mapStateToProps, {
    fetchCustomersReport,
    customerPdfAction,
})(SuppliersReport);
