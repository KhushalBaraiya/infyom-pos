import React, { useEffect, useState } from 'react'
import MasterLayout from '../MasterLayout'
import TopProgressBar from '../../shared/components/loaders/TopProgressBar'
import TabTitle from '../../shared/tab-title/TabTitle'
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod'
import ReactDataTable from '../../shared/table/ReactDataTable'
import StoreForm from './StoreForm'
import AddStoreButton from './AddStoreButton'
import ActionButton from '../../shared/action-buttons/ActionButton'
import DeleteStore from './DeleteStore'
import { changeStoreStatus, fetchStore } from '../../store/action/storeAction'
import { useDispatch, useSelector } from 'react-redux'

const Store = () => {
    const dispatch = useDispatch();
    const { stores, isCallFetchDataApi, isLoading } = useSelector(state => state);
    const [deleteModel, setDeleteModel] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [editData, setEditData] = useState();
    const [localItemsValue, setLocalItemsValue] = useState([]);

    useEffect(() => {
        if (stores.length >= 0) {
            const mappedStore = stores.map((item) => ({
                name: item?.attributes?.name,
                status: item?.attributes?.status ? 1 : 0,
                active: item?.attributes?.active,
                users: item?.attributes?.users,
                id: item?.id,
            }));
            setLocalItemsValue(mappedStore);
        }
    }, [stores]);

    const onChange = (filter) => {
        dispatch(fetchStore());
    };

    const goToEditProduct = (data) => {
        setEditData(data);
        setShowEditModal(true)
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const handleStatusChange = async (id, status) => {
        if (!id) return;

        dispatch(changeStoreStatus(id));
        setLocalItemsValue((prevState) =>
            prevState.map((item) =>
                item.id === id ? { ...item, status: status ? true : false } : item
            )
        );
    };

    const columns = [
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row?.name,
            className: "",
            sortField: "name",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => row.status,
            sortable: false,
            cell: (row) => {
                return (
                    <div className="d-flex align-items-center">
                        <label className="form-check form-switch form-switch-sm">
                            <input
                                type="checkbox"
                                checked={row.status}
                                disabled={row.active}
                                onChange={(e) =>
                                    handleStatusChange(row.id, e.target.checked)
                                }
                                className="me-3 form-check-input cursor-pointer"
                            />
                            <div className="control__indicator" />
                        </label>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("users.title"),
            selector: (row) => row?.users,
            className: "",
            sortField: "users",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-primary">
                        <span>{row?.users}</span>
                    </span>
                )
            }
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "120px",
            cell: (row) => (
                <ActionButton
                    item={row}
                    goToEditProduct={() => goToEditProduct(row)}
                    isEditMode={true}
                    onClickDeleteModel={onClickDeleteModel}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("store.title")} />
            <ReactDataTable
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                pagination={false}
                isShowSearch
                AddButton={<AddStoreButton />}
                isCallFetchDataApi={isCallFetchDataApi}
            />
            <StoreForm show={showEditModal} isEdit={true} data={editData} handleClose={() => setShowEditModal(false)} title={placeholderText("edit.store.title")} />
            <DeleteStore onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel} onDelete={isDelete} />
        </MasterLayout>
    )
}

export default Store