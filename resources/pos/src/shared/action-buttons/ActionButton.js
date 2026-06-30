import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClone,
    faEye,
    faPenToSquare,
    faTrash,
    faUserPlus,
    faKey
} from "@fortawesome/free-solid-svg-icons";
import { placeholderText } from "../sharedMethod";

const ActionButton = (props) => {
    const {
        goToEditProduct,
        item,
        onClickDeleteModel = true,
        isDeleteMode = true,
        isEditMode = true,
        goToDetailScreen,
        isViewIcon = false,
        createCustomerAsUser = false,
        onClickCreateUserBtn,
        isPasswordShow = false,
        goToChangePassword,
        isDuplicateShow = false,
        onClickDuplicate,
    } = props;

    return (
        <>
            {!item?.isUser && createCustomerAsUser && (
                <button
                    title={placeholderText(
                        "user.input.create-customer-as-user.label"
                    )}
                    className="btn text-success px-2 fs-3 ps-0 border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClickCreateUserBtn(item);
                    }}
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            )}

            {isPasswordShow ? (
                <button
                    title={placeholderText("user.input.password.label")}
                    className="btn text-warning fs-3 px-1 border-0"
                    onClick={(e) => {
                        goToChangePassword(item.id);
                    }}
                >
                    <FontAwesomeIcon icon={faKey} />
                </button>
            ) : null}
            {isDuplicateShow ? (
                <button
                    title={placeholderText("user.input.duplicate.label")}
                    className="btn text-warning fs-3 px-1 border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClickDuplicate(item.id);
                    }}
                >
                    <FontAwesomeIcon icon={faClone} />
                </button>
            ) : null}
            {isViewIcon ?
                <button title={placeholderText('globally.view.tooltip.label')}
                        className='btn text-success fs-3 px-1 border-0'
                        onClick={(e) => {
                            e.stopPropagation();
                            goToDetailScreen(item.id)
                        }}>
                    <FontAwesomeIcon icon={faEye}/>
                </button> : null
            }
            {isEditMode && (
                <button title={placeholderText('globally.edit.tooltip.label')}
                        className='btn text-primary fs-3 px-1 border-0'
                        onClick={(e) => {
                            e.stopPropagation();
                            goToEditProduct(item);
                        }}
                >
                    <FontAwesomeIcon icon={faPenToSquare}/>
                </button>)
            }
            {isDeleteMode === false ? null :
                <button title={placeholderText('globally.delete.tooltip.label')}
                        className='btn text-danger fs-3 px-1 border-0'
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickDeleteModel(item);
                        }}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            }
        </>
)};
export default ActionButton;
