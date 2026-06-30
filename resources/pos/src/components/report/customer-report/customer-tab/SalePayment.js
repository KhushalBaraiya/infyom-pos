import React, { useEffect } from "react";
import moment from "moment";
import { connect } from "react-redux";
import ReactDataTable from "../../../../shared/table/ReactDataTable";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    paymentMethodName,
} from "../../../../shared/sharedMethod";
import {
    fetchCustomerSalePayment,
    customerSalePaymentReportPDF,
} from "../../../../store/action/customerReportAction";
import { useParams } from "react-router";
import { fetchPaymentMethods } from "../../../../store/action/paymentMethodAction";

const SalePayment = (props) => {
    const {
        totalRecord,
        isLoading,
        frontSetting,
        isCallSaleApi,
        allConfigData,
        customerId,
        customerPayment,
        fetchCustomerSalePayment,
        customerSalePaymentReportPDF,
        paymentMethods,
        fetchPaymentMethods
    } = props;
    const { id } = useParams();

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    // fetch all sale payment
    const onChange = (filter) => {
        fetchCustomerSalePayment(filter, true, id);
    };

    //onClick pdf function
    const onReportPdfClick = (id) => {
        customerSalePaymentReportPDF(id);
    };

    const itemsValue =
        currencySymbol &&
        customerPayment.length >= 0 &&
        customerPayment.map((sale) => ({
            date: getFormattedDate(
                sale.sale.date,
                allConfigData && allConfigData
            ),
            time: moment(sale.sale.created_at).format("LT"),
            reference_code: sale.sale.reference_code,
            payment_type: sale.sale.payment_type,
            payment_type_name: paymentMethodName(paymentMethods, sale && sale.sale),
            amount: sale.sale.paid_amount,
            id: sale.sale.id,
            currency: currencySymbol,
        }));

    const columns = [
        {
            name: getFormattedMessage("sale-reference.title"),
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
            name: getFormattedMessage("select.payment-type.label"),
            sortField: "payment_type",
            sortable: false,
            cell: (row) => {
                return (
                    (row.payment_type_name ?
                        <span className="badge bg-light-primary">
                            <span>{row.payment_type_name}</span>
                        </span> : "-"
                    )
                );
            },
        },
        {
            name: getFormattedMessage("dashboard.recentSales.paid.label"),
            selector: (row) =>
                currencySymbolHandling(allConfigData, row.currency, row.amount),
            sortField: "grand_total",
            sortable: false,
        },
        {
            name: getFormattedMessage("react-data-table.date.column.label"),
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
    ];

    return (
        <ReactDataTable
            columns={columns}
            items={itemsValue}
            isCallSaleApi={isCallSaleApi}
            onChange={onChange}
            totalRows={totalRecord}
            isLoading={isLoading}
            isReportPdf={customerPayment.length > 0 ? true : false}
            customerId={customerId}
            onReportPdfClick={() => onReportPdfClick(customerId)}
        />
    );
};

const mapStateToProps = (state) => {
    const {
        totalRecord,
        isLoading,
        frontSetting,
        isCallSaleApi,
        allConfigData,
        customerPayment,
        paymentMethods
    } = state;
    return {
        totalRecord,
        isLoading,
        frontSetting,
        isCallSaleApi,
        allConfigData,
        customerPayment,
        paymentMethods
    };
};

export default connect(mapStateToProps, {
    fetchCustomerSalePayment,
    customerSalePaymentReportPDF,
    fetchPaymentMethods
})(SalePayment);
