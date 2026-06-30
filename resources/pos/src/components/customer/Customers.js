import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import { fetchCustomers } from "../../store/action/customerAction";
import { addUser, fetchUsers } from "../../store/action/userAction";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteCustomer from "./DeleteCustomer";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import ImportCustomersModel from "./ImportCustomersModel";
import PasswordModal from "./PasswordModal";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Filters, Permissions } from "../../constants";

const Customers = (props) => {
    const { fetchCustomers, customers, totalRecord, isLoading, allConfigData, callAPIAfterImport, isCallFetchDataApi } =
        props;
    const [pageSize, setPageSize] = useState(Filters.OBJ.pageSize);   
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const navigate = useNavigate();
    const [importCustomers, setImportCustomers] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [customer, setCustomer] = useState({});
    const dispatch = useDispatch();
    const handleClose = () => {
        setImportCustomers(!importCustomers);
    };

    function onClickCreateUserBtn(item) {
        let sepratedName = item.name.split(" ")
        item.createUser = true;
        item.first_name = sepratedName[0];
        item.last_name = sepratedName.slice(1).join(" ");;
        setCustomer(item);
        setShowPasswordModal(true);
    }

    const onSubmitClick = (customer) => {
        dispatch(addUser(customer, navigate, false , setShowPasswordModal));
        let filter = {
            order_By: "created_at",
            direction: "desc",
            pageSize: pageSize,
            page: 1
        }
        setTimeout(() => {
            onChange(filter);
        }, [300]);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchCustomers(filter, true); 
    };

    const goToEditProduct = (item) => {
        const id = item.id;
        navigate(`/app/customers/edit/${id}`);
    };

    const itemsValue =
        customers.length >= 0 &&
        customers.map((customer) => ({
            date: getFormattedDate(
                customer.attributes.created_at,
                allConfigData && allConfigData
            ),
            time: moment(customer.attributes.created_at).format("LT"),
            name: customer.attributes.name,
            email: customer.attributes.email,
            phone: customer.attributes.phone ?? "-",
            country: customer.attributes.country ?? "-",
            city: customer.attributes.city ?? "-",
            dob: customer.attributes.dob ?? "-",
            address: customer.attributes.address ?? "-",
            id: customer.id,
            isUser: customer.attributes.is_user,
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
            name: getFormattedMessage("customer.title"),
            selector: (row) => row.name,
            sortField: "name",
            sortable: true,
            cell: (row) => {
                return (
                    <div>
                        <div className="text-primary">{row.name}</div>
                        <div>{row.email}</div>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("globally.input.phone-number.label"),
            selector: (row) => row.phone,
            sortField: "phone",
            sortable: true,
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        {row.date}
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
                <ActionButton
                    item={row}
                    goToEditProduct={goToEditProduct}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_CUSTOMERS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_CUSTOMERS)}
                    goToDetailScreen={() => navigate(`/app/customers/detail/${row.id}`)}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_CUSTOMERS)}
                    onClickCreateUserBtn={onClickCreateUserBtn}
                    createCustomerAsUser
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("customers.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                buttonImport={getPermission(allConfigData?.permissions, Permissions.CREATE_CUSTOMERS)}
                goToImport={handleClose}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_CUSTOMERS) &&
                {
                    to: "#/app/customers/create",
                    ButtonValue: getFormattedMessage("customer.create.title")
                }
                )}
                importBtnTitle={"customers.import.title"}
                callAPIAfterImport={callAPIAfterImport}
                isCallFetchDataApi={isCallFetchDataApi}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 0}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <DeleteCustomer
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            {importCustomers && (
                <ImportCustomersModel
                    handleClose={handleClose}
                    show={importCustomers}
                />
            )}
            {showPasswordModal && (
                <PasswordModal
                    customer={customer}
                    setCustomer={setCustomer}
                    showModal={showPasswordModal}
                    onClickShowModal={(e) => setShowPasswordModal(false)}
                    onSubmitClick={onSubmitClick}
                    />
            )}
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    );
};

const mapStateToProps = ( state ) => {
    const { callAPIAfterImport, isCallFetchDataApi, customers, totalRecord, isLoading, allConfigData, users } = state;
    return { callAPIAfterImport, isCallFetchDataApi, customers, totalRecord, isLoading, allConfigData, users };
};

export default connect(mapStateToProps, { fetchCustomers, fetchUsers })(
    Customers
);
