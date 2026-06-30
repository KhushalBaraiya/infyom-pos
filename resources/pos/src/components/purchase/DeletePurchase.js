import React, { useEffect } from 'react';
import {connect} from 'react-redux';
import {deletePurchase} from '../../store/action/purchaseAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeletePurchase = (props) => {
    const {deletePurchase, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteUserClick = () => {
        deletePurchase({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteUserClick={deleteUserClick}
                                         name={getFormattedMessage('purchase.title')}/>}
        </div>
    )
};

export default connect(null, {deletePurchase})(DeletePurchase);
