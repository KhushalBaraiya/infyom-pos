import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
} from "../../../shared/sharedMethod";
import { fetchExpenses } from "../../../store/action/expenseAction";
import { expenseExcelAction } from "../../../store/action/expenseExcelAction";

const ExpensesTab = (props) => {
    const {
        isLoading,
        totalRecord,
        fetchExpenses,
        expenses,
        expenseExcelAction,
        frontSetting,
        warehouseValue,
        allConfigData,
        settings
    } = props;
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const [currentFilter, setCurrentFilter] = useState({});

    useEffect(() => {
        if (isWarehouseValue === true) {
            expenseExcelAction(warehouseValue.value, setIsWarehouseValue, currentFilter);
        }
    }, [isWarehouseValue]);

    const itemsValue =
        currencySymbol &&
        expenses.length >= 0 &&
        expenses.map((expense) => ({
            date: getFormattedDate(
                expense.attributes.date,
                allConfigData && allConfigData
            ),
            time: moment(expense.attributes.created_at).format("LT"),
            reference_code: expense.attributes.reference_code,
            title: expense.attributes.title,
            user_name: expense.attributes.user_name ? expense.attributes.user_name : "-",
            warehouse_name: expense.attributes.warehouse_name,
            expense_category_name: expense.attributes.expense_category_name,
            amount: expense.attributes.amount,
            details: expense.attributes.details,
            currency: currencySymbol,
            id: expense.id,
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
            name: getFormattedMessage("expense.input.title.label"),
            selector: (row) => row.title,
            sortField: "title",
            sortable: false,
        },
        {
            name: getFormattedMessage("users.table.user.column.title"),
            selector: (row) => row.user_name,
            sortField: "user_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse_name,
            sortField: "warehouse_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("expense-category.title"),
            selector: (row) => row.expense_category_name,
            sortField: "expense_category_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("expense.input.amount.label"),
            selector: (row) =>
                currencySymbolHandling(allConfigData, row.currency, row.amount),
            sortField: "amount",
            sortable: true,
        },
    ];

    const onChange = (filter) => {
        fetchExpenses(filter, true);
        setCurrentFilter(filter);
    };

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    return (
        <ReactDataTable
            columns={columns}
            items={itemsValue}
            isEXCEL={itemsValue && itemsValue.length > 0}
            onChange={onChange}
            isLoading={isLoading}
            warehouseValue={warehouseValue}
            totalRows={totalRecord}
            onExcelClick={onExcelClick}
            isFiscalYearFilter={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
            isShowFilterField={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
            
        />
    );
};
const mapStateToProps = (state) => {
    const { isLoading, totalRecord, expenses, frontSetting, settings } = state;
    return { isLoading, totalRecord, expenses, frontSetting, settings };
};

export default connect(mapStateToProps, {
    fetchExpenses,
    expenseExcelAction,
})(ExpensesTab);
