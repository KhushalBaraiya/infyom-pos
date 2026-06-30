import React from 'react'
import { useDispatch } from 'react-redux';
import { deleteTax } from '../../../store/action/taxAction';
import DeleteModel from '../../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../../shared/sharedMethod';

const DeleteTax = (props) => {
    const { deleteModel, onClickDeleteModel, onDelete, setNotDeletedItemModal, clearSelectedDeleteItem } = props;
    const dispatch = useDispatch();

    const deleteUserClick = () => {
        dispatch(deleteTax({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem));
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && 
                <DeleteModel 
                    onClickDeleteModel={onClickDeleteModel} 
                    deleteModel={deleteModel}
                    deleteUserClick={deleteUserClick} title='Delete Tax'
                    name={getFormattedMessage('tax.title')}
                />}
        </div>
    )
}

export default DeleteTax