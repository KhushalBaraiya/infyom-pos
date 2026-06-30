import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import ReactDataTable from "../../shared/table/ReactDataTable";
import ModalAction from "../../shared/action-buttons/ActionButton";
import { fetchRoles } from "../../store/action/roleAction";
import DeleteRole from "./DeleteRole";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";

const Role = (props) => {
    const { roles, fetchRoles, totalRecord, isLoading, allConfigData, isCallFetchDataApi } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const itemsValue =
        roles.length >= 0 &&
        roles.map((role) => ({
            date: getFormattedDate(
                role.attributes.created_at,
                allConfigData && allConfigData
            ),
            name: role.attributes.name,
            id: role.id,
        }));

    const onChange = (filter) => {
        fetchRoles(filter, true);
    };

    const goToEdit = (item) => {
        const id = item.id;
        window.location.href = "#/app/roles/edit/" + id;
    };

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
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            sortable: true,
            sortField: "name",
        },
        {
            name: getFormattedMessage("react-data-table.date.column.label"),
            selector: (row) => row.date,
            sortField: "date",
            sortable: false,
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_ROLES) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_ROLES)
        ) ? [
            {
                name: getFormattedMessage("react-data-table.action.column.label"),
                right: true,
                ignoreRowClick: true,
                allowOverflow: true,
                button: true,
                cell: (row) => (
                    row.name != 'customer' && row.name != 'admin' ? <ModalAction
                        item={row}
                        goToEditProduct={goToEdit}
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_ROLES)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_ROLES)}
                    /> : ''
                ),
            }] : []),
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("roles.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_ROLES) &&
                {
                    to: "#/app/roles/create",
                    ButtonValue: getFormattedMessage("role.create.title")
                }
                )}
                totalRows={totalRecord}
                isLoading={isLoading}
                isCallFetchDataApi={isCallFetchDataApi}
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 0}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <DeleteRole
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal} />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { roles, totalRecord, isLoading, allConfigData, isCallFetchDataApi } = state;
    return { roles, totalRecord, isLoading, allConfigData, isCallFetchDataApi };
};
export default connect(mapStateToProps, { fetchRoles })(Role);
