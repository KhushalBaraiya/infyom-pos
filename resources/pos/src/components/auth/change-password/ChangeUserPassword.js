import React, { useState } from 'react'
import { Form, Modal } from "react-bootstrap-v5";
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import { ROLES } from '../../../constants';
import { changePasswordAdmin } from '../../../store/action/adminUsersAction';



const ChangeUserPassword = (props) => {
    const { show, handleClose, userDetails, role } = props;
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false,
    });

    const [passwordInputs, setPasswordInputs] = useState({
        new_password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({
        new_password: "",
        confirm_password: "",
    });

    const handleChangePassword = (e) => {
        setPasswordInputs((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!passwordInputs["new_password"]) {
            errorss["new_password"] = getFormattedMessage(
                "change-password.input.new.validate.label"
            );
        } else if (!passwordInputs["confirm_password"]) {
            errorss["confirm_password"] = getFormattedMessage(
                "user.input.confirm-password.placeholder.label"
            );
        } else if (
            passwordInputs["new_password"] !==
            passwordInputs["confirm_password"]
        ) {
            errorss["confirm_password"] = getFormattedMessage(
                "change-password.input.confirm.valid.validate.label"
            );
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const handleHideShowPassword = (type) => {
        if (type === "new") {
            setShowPassword({ ...showPassword, new: !showPassword.new });
        } else if (type === "confirm") {
            setShowPassword({
                ...showPassword,
                confirm: !showPassword.confirm,
            });
        }
    };

    const prepareData = {
        user_id: userDetails,
        password: passwordInputs.new_password,
        confirm_password: passwordInputs.confirm_password,
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const valid = handleValidation();
        if (valid) {
            if (role == ROLES.SUPER_ADMIN) {
                dispatch(changePasswordAdmin(prepareData, handleClose))
            } else {
                dispatch(changePasswordAdmin(prepareData, handleClose))
            }
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            keyboard={true}
        >
            <Form
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        onSubmit(e);
                    }
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {getFormattedMessage(
                            "header.profile-menu.change-password.label"
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-12 mb-5">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "change-password.input.new.label"
                                )}
                                :
                            </label>
                            <span className="required" />
                            <div className="input-group">
                                <input
                                    type={
                                        showPassword.new ? "text" : "password"
                                    }
                                    name="new_password"
                                    placeholder={placeholderText(
                                        "change-password.input.new.placeholder.label"
                                    )}
                                    autoComplete="off"
                                    className="form-control"
                                    onChange={(e) => handleChangePassword(e)}
                                    value={passwordInputs.new_password}
                                />
                                <span
                                    className="showpassword"
                                    onClick={() =>
                                        handleHideShowPassword("new")
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={showPassword.new ? faEye : faEyeSlash}
                                        className="top-0 m-0 fa"
                                    />
                                </span>
                            </div>
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["new_password"]
                                    ? errors["new_password"]
                                    : null}
                            </span>
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "user.input.confirm-password.label"
                                )}
                                :
                            </label>
                            <span className="required" />
                            <div className="input-group">
                                <input
                                    type={
                                        showPassword.confirm ? "text" : "password"
                                    }
                                    name="confirm_password"
                                    placeholder={placeholderText(
                                        "user.input.confirm-password.placeholder.label"
                                    )}
                                    autoComplete="off"
                                    className="form-control"
                                    onChange={(e) => handleChangePassword(e)}
                                    value={passwordInputs.confirm_password}
                                />
                                <span
                                    className="showpassword"
                                    onClick={() =>
                                        handleHideShowPassword("confirm")
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={showPassword.confirm ? faEye : faEyeSlash}
                                        className="top-0 m-0 fa"
                                    />
                                </span>
                            </div>
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["confirm_password"]
                                    ? errors["confirm_password"]
                                    : null}
                            </span>
                        </div>
                    </div>
                </Modal.Body>
            </Form>
            <Modal.Footer children="justify-content-start" className="pt-0">
                <button
                    type="button"
                    className="btn btn-primary m-0"
                    onClick={(event) => onSubmit(event)}
                >
                    {placeholderText("globally.save-btn")}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary my-0 ms-5 me-0"
                    data-bs-dismiss="modal"
                    onClick={handleClose}
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default ChangeUserPassword