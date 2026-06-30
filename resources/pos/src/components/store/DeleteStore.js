import React from 'react';
import {connect} from 'react-redux';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import { getFormattedMessage } from '../../shared/sharedMethod';
import { deleteStore } from '../../store/action/storeAction';

const DeleteStore = (props) => {
    const {deleteStore, onDelete, deleteModel, onClickDeleteModel} = props;

    const deleteUserClick = () => {
        deleteStore(onDelete.id);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteUserClick={deleteUserClick} title='Delete Store'
                                         name={getFormattedMessage('store.title')}/>}
        </div>
    )
};

export default connect(null, {deleteStore})(DeleteStore);
