import React from 'react'
import { useDispatch } from 'react-redux';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../shared/sharedMethod';
import { deletePaymentMethod } from '../../store/action/paymentMethodAction';

const DeletePaymentMethod = (props) => {
    const { deleteModel, onClickDeleteModel, onDelete } = props;
    const dispatch = useDispatch();

    const deleteClick = () => {
        dispatch(deletePaymentMethod(onDelete.id));
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                deleteUserClick={deleteClick} name={getFormattedMessage('payment.method.title')} />}
        </div>
    )
}

export default DeletePaymentMethod