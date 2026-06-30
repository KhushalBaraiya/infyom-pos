import React from "react";
import { connect } from "react-redux";
import { deleteCustomer } from "../../store/action/customerAction";
import DeleteModel from "../../shared/action-buttons/DeleteModel";
import { getFormattedMessage } from "../../shared/sharedMethod";

const DeleteCustomer = (props) => {
    const { deleteCustomer, onDelete, deleteModel, onClickDeleteModel, setNotDeletedItemModal, clearSelectedDeleteItem } = props;

    const deleteUserClick = () => {
        deleteCustomer({ id: onDelete }, setNotDeletedItemModal, clearSelectedDeleteItem);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && (
                <DeleteModel
                    onClickDeleteModel={onClickDeleteModel}
                    deleteModel={deleteModel}
                    deleteUserClick={deleteUserClick}
                    title={getFormattedMessage("customer.title")}
                    name={getFormattedMessage("customer.title")}
                />
            )}
        </div>
    );
};

export default connect(null, { deleteCustomer })(DeleteCustomer);
