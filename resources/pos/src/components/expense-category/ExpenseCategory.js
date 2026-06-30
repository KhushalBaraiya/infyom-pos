import React, {useEffect, useState} from 'react';
import MasterLayout from '../MasterLayout';
import {connect} from 'react-redux';
import ReactDataTable from '../../shared/table/ReactDataTable';
import DeleteExpenseCategory from './DeleteExpenseCategory';
import {fetchExpenseCategories} from '../../store/action/expenseCategoryAction';
import CreateExpenseCategory from './CreateExpenseCategory';
import EditExpenseCategory from './EditExpenseCategory';
import TabTitle from '../../shared/tab-title/TabTitle';
import {getFormattedMessage, getPermission, placeholderText} from '../../shared/sharedMethod';
import ActionButton from '../../shared/action-buttons/ActionButton';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal';
import { Permissions } from '../../constants';

const ExpenseCategory = (props) => {
    const {fetchExpenseCategories, expenseCategories, totalRecord, isLoading, isCallFetchDataApi, allConfigData} = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [editModel, setEditModel] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState();
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const handleClose = (item) => {
        setEditModel(!editModel)
        setExpenseCategory(item);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchExpenseCategories(filter, true);
    };

    const itemsValue = expenseCategories.length >= 0 && expenseCategories.map(expense => ({
        name: expense.attributes.name,
        id: expense.id
    }));

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
            name: getFormattedMessage('globally.input.name.label'),
            selector: row => row.name,
            sortField: 'name',
            sortable: true,
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_EXPENSE_CATEGORIES) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_EXPENSE_CATEGORIES)
        ) ? [
            {
                name: getFormattedMessage('react-data-table.action.column.label'),
                right: true,
                ignoreRowClick: true,
                allowOverflow: true,
                button: true,
                cell: row =>
                    <ActionButton
                        item={row}
                        goToEditProduct={handleClose}
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_EXPENSE_CATEGORIES)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_EXPENSE_CATEGORIES)}
                    />
            }] : []),
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('expense-categories.title')}/>
                <ReactDataTable 
                    columns={columns} 
                    items={itemsValue} 
                    onChange={onChange} 
                    isLoading={isLoading}
                    AddButton={getPermission(allConfigData?.permissions, Permissions.CREATE_EXPENSE_CATEGORIES) && <CreateExpenseCategory />}
                    isCallFetchDataApi={isCallFetchDataApi}
                    totalRows={totalRecord}
                    selectableRows
                    onSelectedRowsChange={handleSelectedRowsChange}
                    isShowDeleteButton={selectedIds.length > 0}
                    handleDeleteMultiples={handleDeleteMultiples}
                    clearSelectedRows={clearSelectedRows}
                />
                <EditExpenseCategory handleClose={handleClose} show={editModel} expenseCategory={expenseCategory}/>
                <DeleteExpenseCategory clearSelectedDeleteItem={clearSelectedDeleteItem} onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                       onDelete={isDelete} setNotDeletedItemModal={setNotDeletedItemModal} />
                <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const {expenseCategories, totalRecord, isLoading, isCallFetchDataApi, allConfigData} = state;
    return {expenseCategories, totalRecord, isLoading, isCallFetchDataApi, allConfigData}
};

export default connect(mapStateToProps, {fetchExpenseCategories})(ExpenseCategory);

