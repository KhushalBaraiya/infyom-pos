import React, { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap-v5";
import * as EmailValidator from "email-validator";
import { getFormattedMessage, placeholderText } from "../../shared/sharedMethod";

const PasswordModal = (props) => {
    const {
        customer,
        showModal,
        onClickShowModal,
        setCustomer,
        onSubmitClick,
    } = props;


    const isHasEmail = customer.email;
    const [email,setemail] = useState(( isHasEmail ? isHasEmail : ''));
    const [passwordInputs, setPasswordInputs] = useState({
        password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({
        email : "",
        password: "",
        confirm_password: "",
    });

    const handleChangePassword = (e) => {
        const { name, value } = e.target;
        setPasswordInputs((inputs) => ({
            ...inputs,
            [name]: value,
        }));
        setCustomer((prevCustomer) => ({
            ...prevCustomer,
            [name]: value,
        }));
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;
        if(!EmailValidator.validate(email)){
         if (!email) {
                  errorss.email = getFormattedMessage(
                  "globally.input.email.validate.label"
            )
            isValid = false
            }else {
                    errorss.email = getFormattedMessage(
                        "globally.input.email.valid.validate.label"
                    );
            isValid = false
            }
        } else {
            isValid = true;
        }
        
        if (!passwordInputs.password) {
            errorss.password = getFormattedMessage(
                "change-password.input.new.validate.label"
            );
            isValid = false;
        }
        if (!passwordInputs.confirm_password) {
            errorss.confirm_password = getFormattedMessage(
                "change-password.input.confirm.validate.label"
            );
            isValid = false;
        }
        if (
            passwordInputs.password &&
            passwordInputs.confirm_password &&
            passwordInputs.password !== passwordInputs.confirm_password
        ) {
            errorss.confirm_password = getFormattedMessage(
                "change-password.input.confirm.valid.validate.label"
            );
            isValid = false;
        }
        setErrors(errorss);
        return isValid;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (handleValidation()) {
                const customerWithEmail = {...customer, email: email};
                onSubmitClick(customerWithEmail);
        }
    };

    return (
        <Modal
            show={showModal}
            onHide={() => onClickShowModal(false)}
            keyboard={true}
            onShow={() => {
                document.getElementById("formBasicCurrent_password").focus();
            }}
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
                        {getFormattedMessage("header.customer-password.label")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                      <div className="col-md-12 mb-5">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "user.input.email.label"
                                )}
                                :
                            </label>
                            <span className="required" />
                            <input
                                id="formBasicCurrent_email"
                                type="email"
                                name="email"
                                placeholder={placeholderText(
                                    "user.input.email.placeholder.label"
                                )}
                                autoComplete="off"
                                className="form-control"
                                onChange={(e) => setemail(e.target.value)}
                                value={email}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors.email ? errors.email : null}
                            </span>
                        </div>
                        <div className="col-md-12 mb-5">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "user.input.password.label"
                                )}
                                :
                            </label>
                            <span className="required" />
                            <input
                                id="formBasicCurrent_password"
                                type="password"
                                name="password"
                                placeholder={placeholderText(
                                    "user.input.password.placeholder.label"
                                )}
                                autoComplete="off"
                                className="form-control"
                                onChange={handleChangePassword}
                                value={passwordInputs.password}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors.password ? errors.password : null}
                            </span>
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "change-password.input.confirm.label"
                                )}
                                :
                            </label>
                            <span className="required" />
                            <input
                                type="password"
                                name="confirm_password"
                                placeholder={placeholderText(
                                    "change-password.input.confirm.placeholder.label"
                                )}
                                autoComplete="off"
                                className="form-control"
                                onChange={handleChangePassword}
                                value={passwordInputs.confirm_password}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors.confirm_password
                                    ? errors.confirm_password
                                    : null}
                            </span>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-start pt-0">
                    <button
                        type="button"
                        className="btn btn-primary m-0"
                        onClick={onSubmit}
                    >
                        {placeholderText("globally.save-btn")}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary my-0 ms-5 me-0"
                        data-bs-dismiss="modal"
                        onClick={() => onClickShowModal(false)}
                    >
                        {getFormattedMessage("globally.cancel-btn")}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default PasswordModal;
