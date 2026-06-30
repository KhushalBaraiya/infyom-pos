import React from 'react';
import {connect} from 'react-redux';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {deleteSaleReturn} from '../../store/action/salesReturnAction';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeleteSaleReturn = (props) => {
    const {deleteSaleReturn, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteSaleClick = () => {
        deleteSaleReturn({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteUserClick={deleteSaleClick} name={getFormattedMessage('sale-return.title')}/>}
        </div>
    )
};

export default connect(null, {deleteSaleReturn})(DeleteSaleReturn);
