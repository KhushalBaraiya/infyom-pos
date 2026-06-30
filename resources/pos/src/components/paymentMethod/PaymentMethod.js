import React, { useState } from 'react'
import MasterLayout from '../MasterLayout'
import TopProgressBar from '../../shared/components/loaders/TopProgressBar'
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod'
import TabTitle from '../../shared/tab-title/TabTitle'
import CreatePaymentMethod from './CreatePaymentMethod'
import ActionButton from '../../shared/action-buttons/ActionButton'
import { useDispatch, useSelector } from 'react-redux'
import ReactDataTable from '../../shared/table/ReactDataTable'
import PaymentMethodForm from './PaymentMethodForm'
import DeletePaymentMethod from './DeletePaymentMethod'
import { changePaymentMethodStatus, fetchPaymentMethods } from '../../store/action/paymentMethodAction'

const PaymentMethod = () => {
    const { isLoading, paymentMethods } = useSelector(state => state);
    const dispatch = useDispatch();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState();
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);

    const itemsValue = paymentMethods.length >= 0 && paymentMethods.map(item => ({
        name: item.attributes.name,
        status: item.attributes.status == null ? true : item.attributes.status,
        type: item.attributes.type,
        id: item.id
    }));

    const onChange = (filter) => {
        dispatch(fetchPaymentMethods(filter));
    };

    const goToEditProduct = (data) => {
        setEditData(data);
        setShowEditModal(true)
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const handleStatusChange = (id, checked) => {
        dispatch(changePaymentMethodStatus(id));
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
                                onChange={(e) =>
                                    handleStatusChange(row.id, e.target.checked)
                                }
                                className="me-3 form-check-input cursor-pointer"
                                disabled={row.type === 1}
                            />
                            <div className="control__indicator" />
                        </label>
                    </div>
                );
            },
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
                    isDeleteMode={row?.type !== 1}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("payment.methods.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                AddButton={<CreatePaymentMethod />}
                isShowSearch
                pagination={false}
                title={"payment.methods.title"}
            />
            <PaymentMethodForm
                show={showEditModal}
                isEdit={true}
                data={editData}
                handleClose={() => setShowEditModal(false)}
                title={placeholderText("edit.payment.methods.title")}
            />
            <DeletePaymentMethod
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
        </MasterLayout>
    )
}

export default PaymentMethod