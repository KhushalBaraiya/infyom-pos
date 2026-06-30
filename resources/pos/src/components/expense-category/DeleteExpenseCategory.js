import React from 'react';
import {connect} from 'react-redux';
import {deleteExpenseCategory} from '../../store/action/expenseCategoryAction';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeleteExpenseCategory = (props) => {
    const {deleteExpenseCategory, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem} = props;

    const deleteUserClick = () => {
        deleteExpenseCategory({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteUserClick={deleteUserClick} name={getFormattedMessage('expense-category.title')}/>
            }
        </div>
    )
};

export default connect(null, {deleteExpenseCategory})(DeleteExpenseCategory);
