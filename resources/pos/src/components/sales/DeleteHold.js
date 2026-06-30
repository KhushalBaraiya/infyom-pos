import React from 'react';
import {connect} from 'react-redux';
import {deleteHoldItem} from '../../store/action/pos/HoldListAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeleteHold = (props) => {
    const {deleteHoldItem, onDelete, deleteModel, onClickDeleteModel} = props;

    const deleteHoldClick = () => {
        deleteHoldItem(onDelete);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteUserClick={deleteHoldClick} name={getFormattedMessage('hold.title')} />}
        </div>
    )
};

export default connect(null, {deleteHoldItem})(DeleteHold);