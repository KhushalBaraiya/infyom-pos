import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { connect, useSelector, useDispatch } from "react-redux";
import * as EmailValidator from "email-validator";
import { useNavigate } from "react-router-dom";
import {
    getFormattedMessage,
    placeholderText,
    numValidate,
    phoneValidate,
} from "../../shared/sharedMethod";
import { editCustomer, fetchCustomer } from "../../store/action/customerAction";
import { fetchFieldConfiguration } from "../../store/action/fieldConfigurationAction";
import ModelFooter from "../../shared/components/modelFooter";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import moment from "moment";
import TabTitle from "../../shared/tab-title/TabTitle";

const CustomerForm = (props) => {
    const { addCustomerData, id, editCustomer, singleCustomer, isEdit } = props;
    const navigate = useNavigate();
    const fieldConfiguration = useSelector((state) => state.fieldConfiguration);
    const dispatch = useDispatch();
    
    
    useEffect(() => {
     dispatch(fetchFieldConfiguration());
    }, [dispatch]);

    useEffect(() => {
        if (id) {
           isEdit && dispatch(fetchCustomer(id));
        } else {
            // Extract customer ID from URL if not passed as prop
            const pathSegments = window.location.pathname.split('/');
            const customerIdIndex = pathSegments.indexOf('customers');
            if (customerIdIndex !== -1 && pathSegments[customerIdIndex + 1]) {
                const customerId = pathSegments[customerIdIndex + 1];
                if (customerId && !isNaN(customerId)) {
                   isEdit &&  dispatch(fetchCustomer(customerId));
                }
            }
        }
    }, [id, dispatch]);

    const [customerValue, setCustomerValue] = useState({
        name: isEdit && singleCustomer ? singleCustomer[0].attributes.name : "",
        dob: isEdit && singleCustomer
            ? singleCustomer[0].dob === null
                ? null
                : moment(singleCustomer[0].dob).toDate()
            : null,
        email: isEdit && singleCustomer ? singleCustomer[0].attributes.email : "",
        phone: isEdit && singleCustomer ? singleCustomer[0].attributes.phone : "",
        country: isEdit && singleCustomer ? singleCustomer[0].attributes.country : "",
        city: isEdit && singleCustomer ? singleCustomer[0].attributes.city : "",
        address: isEdit && singleCustomer ? singleCustomer[0].attributes.address : "",
        password: '',
        confirm_password: '',
        createUser: isEdit && singleCustomer ? singleCustomer[0].attributes.is_user : false,
    });

    const [errors, setErrors] = useState({
        dob: "",
        name: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        address: "",
        password: '',
        confirm_password: '',
    });

    const disabled =
        (singleCustomer && isEdit) &&
        singleCustomer[0].attributes.dob === customerValue.dob &&
        singleCustomer[0].attributes.phone === customerValue.phone &&
        singleCustomer[0].attributes.name === customerValue.name &&
        singleCustomer[0].attributes.country === customerValue.country &&
        singleCustomer[0].attributes.city === customerValue.city &&
        singleCustomer[0].attributes.email === customerValue.email &&
        singleCustomer[0].attributes.address === customerValue.address;

    const isFieldRequired = (fieldName) => {
        return fieldConfiguration[fieldName] == 1 || fieldConfiguration[fieldName] === true;
    };

const handleValidation = () => {
    let errorss = {};
    let isValid = true;

    // NAME
    if (!customerValue.name?.trim()) {
        setErrors = getFormattedMessage(
            "globally.input.name.validate.label"
        );
        isValid = false;
    }

    // EMAIL
    if (
        isFieldRequired("customer_email_required") ||
        customerValue.createUser === true
    ) {
        if (!customerValue.email?.trim()) {
            errorss.email = getFormattedMessage(
                "globally.input.email.validate.label"
            );
            isValid = false;
        } else if (!EmailValidator.validate(customerValue.email)) {
            errorss.email = getFormattedMessage(
                "globally.input.email.valid.validate.label"
            );
            isValid = false;
        }
    }

    // PHONE
    if (
        isFieldRequired("customer_phone_number_required") &&
        !customerValue.phone?.trim()
    ) {
        errorss.phone = getFormattedMessage(
            "globally.input.phone-number.validate.label"
        );
        isValid = false;
    }

    // COUNTRY
    if (
        isFieldRequired("customer_country_required") &&
        !customerValue.country?.trim()
    ) {
        errorss.country = getFormattedMessage(
            "globally.input.country.validate.label"
        );
        isValid = false;
    }

    // CITY
    if (
        isFieldRequired("customer_city_required") &&
        !customerValue.city?.trim()
    ) {
        errorss.city = getFormattedMessage(
            "globally.input.city.validate.label"
        );
        isValid = false;
    }

    // ADDRESS
    if (
        isFieldRequired("customer_address_required") &&
        !customerValue.address?.trim()
    ) {
        errorss.address = getFormattedMessage(
            "globally.input.address.validate.label"
        );
        isValid = false;
    }

    // DOB
    if (
        isFieldRequired("customer_dob_required") &&
        !customerValue.dob
    ) {
        errorss.dob = getFormattedMessage(
            "globally.input.dob.validate.label"
        );
        isValid = false;
    }

    // PASSWORD
        if ((!isEdit && !customerValue.password && customerValue.createUser == true)) {
            errorss.password = getFormattedMessage(
                "user.input.password.validate.label"
            );
            isValid = false;
        } else if (!isEdit && customerValue.password.length < 8 && customerValue.createUser == true) {
            errorss.password = getFormattedMessage(
                "user.input.password.valid.validate.label"
            );
            isValid = false;
        }

        if (!isEdit && !customerValue.confirm_password && customerValue.createUser == true) {
            errorss.confirm_password = getFormattedMessage(
                "user.input.confirm-password.validate.label"
            );
            isValid = false;
        } else if (
            !isEdit && customerValue.password !== customerValue.confirm_password && customerValue.createUser == true
        ) {
            errorss.confirm_password = getFormattedMessage(
                "change-password.input.confirm.valid.validate.label"
            );
            isValid = false;
        }

    setErrors(errorss);
    return isValid;
};


    const handleCallback = (date) => {
        setCustomerValue((previousState) => {
            return { ...previousState, dob: date };
        });
        setErrors("");
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setCustomerValue((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
        setErrors("");
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (isEdit && singleCustomer && valid) {
            if (!disabled) {
                setCustomerValue(customerValue);
                editCustomer(id, customerValue, navigate);
            }
        } else {
            if (valid) {
                setCustomerValue(customerValue);
                addCustomerData(customerValue);
            }
        }
    };

    const handleChanged = (event, key) => {
        let checked = event.target.checked;
        setCustomerValue((customerValue) => ({
            ...customerValue,
            [key]: checked,
        }));
    }

    return (
        <div className="card">
            <TabTitle title={placeholderText(singleCustomer ? "customer.edit.title" : "customer.create.title")} />
            <div className="card-body">
                <Form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "globally.input.name.label"
                                )}
                                :
                            </label>
                            <span className="required" />
                            <input
                                type="text"
                                name="name"
                                value={customerValue.name}
                                placeholder={placeholderText(
                                    "globally.input.name.placeholder.label"
                                )}
                                className="form-control"
                                autoFocus={true}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["name"] ? errors["name"] : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "globally.input.email.label"
                                )}
                                :
                            </label>
                            {(isFieldRequired('customer_email_required') || customerValue.createUser == true || customerValue.createUser == true ) && <span className="required" />}
                            <input
                                type="text"
                                name="email"
                                className="form-control"
                                placeholder={placeholderText(
                                    "globally.input.email.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={customerValue.email}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["email"] ? errors["email"] : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "globally.input.phone-number.label"
                                )}
                                :
                            </label>
                            {isFieldRequired('customer_phone_number_required') && <span className="required" />}
                            <input
                                type="text"
                                name="phone"
                                className="form-control"
                                placeholder={placeholderText(
                                    "globally.input.phone-number.placeholder.label"
                                )}
                                onKeyPress={(event) => phoneValidate(event)}
                                onChange={(e) => onChangeInput(e)}
                                value={customerValue.phone}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["phone"] ? errors["phone"] : null}
                            </span>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("DOB.input.label")}:
                            </label>
                            {isFieldRequired('customer_dob_required') && <span className="required" />}
                            <div className="position-relative">
                                <ReactDatePicker
                                    onChangeDate={handleCallback}
                                    newStartDate={customerValue.dob}
                                    readOnlyref={false}
                                    placeholder={placeholderText("select.date.of.birth")}
                                />
                            </div>
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["dob"] ? errors["dob"] : null}
                            </span>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "globally.input.country.label"
                                )}
                                :
                            </label>
                            {isFieldRequired('customer_country_required') && <span className="required" />}
                            <input
                                type="text"
                                name="country"
                                className="form-control"
                                placeholder={placeholderText(
                                    "globally.input.country.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={customerValue.country}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["country"] ? errors["country"] : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "globally.input.city.label"
                                )}
                                :
                            </label>
                            {isFieldRequired('customer_city_required') && <span className="required" />}
                            <input
                                type="text"
                                name="city"
                                className="form-control"
                                placeholder={placeholderText(
                                    "globally.input.city.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={customerValue.city}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["city"] ? errors["city"] : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "globally.input.address.label"
                                )}
                                :
                            </label>
                            {isFieldRequired('customer_address_required') && <span className="required" />}
                            <textarea
                                type="text"
                                rows="4"
                                cols="50"
                                name="address"
                                className="form-control"
                                placeholder={placeholderText(
                                    "globally.input.address.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={customerValue.address}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["address"] ? errors["address"] : null}
                            </span>
                        </div>
                        {!isEdit &&
                            <div className="col-lg-6 mb-3 my-auto">
                                <div className="col-md-6">
                                    <label className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label">
                                        <input
                                            type="checkbox"
                                            name="createUser"
                                            value={1}
                                            checked={customerValue.createUser}
                                            onChange={(event) =>
                                                handleChanged(
                                                    event,
                                                    "createUser"
                                                )
                                            }
                                            className="me-3 form-check-input cursor-pointer"
                                        />
                                        <div className="control__indicator" />{" "}
                                        {getFormattedMessage(
                                            "user.input.create-customer-as-user.label"
                                        )}
                                    </label>
                                </div>
                            </div>
                        }
                        {!isEdit && customerValue.createUser &&
                            <>
                                <div className='col-md-6 mb-3'>
                                    <label className='form-label'>
                                        {getFormattedMessage("user.input.password.label")}:
                                    </label>
                                    <span className='required' />
                                    <input type='password' name='password'
                                        placeholder={placeholderText("user.input.password.placeholder.label")}
                                        className='form-control' value={customerValue.password}
                                        onChange={(e) => onChangeInput(e)} />
                                    <span
                                        className='text-danger d-block fw-400 fs-small mt-2'>{errors['password'] ? errors['password'] : null}</span>
                                </div>
                                <div className='col-md-6 mb-3'>
                                    <label
                                        className='form-label'>
                                        {getFormattedMessage("user.input.confirm-password.label")}:
                                    </label>
                                    <span className='required' />
                                    <input type='password' name='confirm_password' className='form-control'
                                        placeholder={placeholderText("user.input.confirm-password.placeholder.label")}
                                        onChange={(e) => onChangeInput(e)}
                                        value={customerValue.confirm_password} />
                                    <span
                                        className='text-danger d-block fw-400 fs-small mt-2'>{errors['confirm_password'] ? errors['confirm_password'] : null}</span>
                                </div>
                            </>
                        }

                        <ModelFooter
                            onEditRecord={singleCustomer}
                            onSubmit={onSubmit}
                            editDisabled={disabled}
                            addDisabled={!customerValue.name}
                            link="/app/customers"
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { customers } = state;
    return {
        singleCustomer: customers,
    };
};

export default connect(mapStateToProps, { editCustomer, fetchCustomer })(CustomerForm);
