import React, {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import {connect, useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import * as EmailValidator from 'email-validator';
import {editSupplier} from '../../store/action/supplierAction';
import {fetchFieldConfiguration} from '../../store/action/fieldConfigurationAction';
import {getFormattedMessage, phoneValidate, placeholderText} from '../../shared/sharedMethod';
import ModelFooter from '../../shared/components/modelFooter';
import TabTitle from '../../shared/tab-title/TabTitle';

const SupplierForm = (props) => {
    const {addSupplierData, id, editSupplier, singleSupplier} = props;
    const navigate = useNavigate();
    const fieldConfiguration = useSelector((state) => state.fieldConfiguration);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchFieldConfiguration());
    }, [dispatch]);

    const [supplierValue, setSupplierValue] = useState({
        name: singleSupplier ? singleSupplier[0].name : '',
        email: singleSupplier ? singleSupplier[0].email : '',
        phone: singleSupplier ? singleSupplier[0].phone : '',
        country: singleSupplier ? singleSupplier[0].country : '',
        city: singleSupplier ? singleSupplier[0].city : '',
        address: singleSupplier ? singleSupplier[0].address : ''
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: ''
    });

    const disabled = singleSupplier && singleSupplier[0].name === supplierValue.name && singleSupplier[0].country === supplierValue.country && singleSupplier[0].city === supplierValue.city && singleSupplier[0].email === supplierValue.email && singleSupplier[0].address === supplierValue.address && singleSupplier[0].phone === supplierValue.phone

    const isFieldRequired = (fieldName) => {
        return fieldConfiguration[fieldName] == 1 || fieldConfiguration[fieldName] === true;
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!supplierValue['name']) {
            errorss['name'] = getFormattedMessage("globally.input.name.validate.label");
        } else if (isFieldRequired('supplier_email_required') && !EmailValidator.validate(supplierValue['email'])) {
            if (!supplierValue['email']) {
                errorss['email'] = getFormattedMessage("globally.input.email.validate.label");
            } else {
                errorss['email'] = getFormattedMessage("globally.input.email.valid.validate.label");
            }
        } else if (isFieldRequired('supplier_phone_number_required') && !supplierValue['phone']) {
            errorss['phone'] = getFormattedMessage("globally.input.phone-number.validate.label");
        } else if (isFieldRequired('supplier_country_required') && !supplierValue['country']) {
            errorss['country'] = getFormattedMessage("globally.input.country.validate.label");
        } else if (isFieldRequired('supplier_city_required') && !supplierValue['city']) {
            errorss['city'] = getFormattedMessage("globally.input.city.validate.label");
        } else if (isFieldRequired('supplier_address_required') && !supplierValue['address']) {
            errorss['address'] = getFormattedMessage("globally.input.address.validate.label");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setSupplierValue(inputs => ({...inputs, [e.target.name]: e.target.value}))
        setErrors('');
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (singleSupplier && valid) {
            if (!disabled) {
                editSupplier(id, supplierValue, navigate);
            }
        } else {
            if (valid) {
                setSupplierValue(supplierValue);
                addSupplierData(supplierValue);
            }
        }
    };

    return (
        <div className='card'>
            <TabTitle title={placeholderText(singleSupplier ? "supplier.edit.title" : "supplier.create.title")} />
            <div className='card-body'>
                <Form>
                    <div className='row'>
                        <div className='col-md-6 mb-3'>
                            <label className='form-label'>
                                {getFormattedMessage("globally.input.name.label")}:
                            </label>
                            <span className='required'/>
                            <input type='text' name='name'
                                   placeholder={placeholderText("globally.input.name.placeholder.label")}
                                   className='form-control'
                                   autoFocus={true}
                                   onChange={(e) => onChangeInput(e)}
                                   value={supplierValue.name}/>
                            <span
                                className='text-danger d-block fw-400 fs-small mt-2'>{errors['name'] ? errors['name'] : null}</span>
                        </div>
                        <div className='col-md-6 mb-3'>
                                <label
                                    className='form-label'>
                                    {getFormattedMessage("globally.input.email.label")}:
                                </label>
                                {isFieldRequired('supplier_email_required') && <span className='required'/>}
                                <input type='text' name='email'
                                       placeholder={placeholderText("globally.input.email.placeholder.label")}
                                       className='form-control'
                                       onChange={(e) => onChangeInput(e)}
                                       value={supplierValue.email}/>
                                <span
                                    className='text-danger d-block fw-400 fs-small mt-2'>{errors['email'] ? errors['email'] : null}</span>
                        </div>
                        <div className='col-md-6 mb-3'>
                            <label
                                className='form-label'>
                                {getFormattedMessage("globally.input.phone-number.label")}:
                            </label>
                            {isFieldRequired('supplier_phone_number_required') && <span className='required'/>}
                            <input type='text' name='phone'
                                   placeholder={placeholderText("globally.input.phone-number.label")}
                                   className='form-control'
                                   onKeyPress={(event) => phoneValidate(event)}
                                   onChange={(e) => onChangeInput(e)}
                                   value={supplierValue.phone}/>
                            <span
                                className='text-danger d-block fw-400 fs-small mt-2'>{errors['phone'] ? errors['phone'] : null}</span>
                        </div>
                        <div className='col-md-6 mb-3'>
                            <label className='form-label'>
                                {getFormattedMessage("globally.input.country.label")}:
                            </label>
                            {isFieldRequired('supplier_country_required') && <span className='required'/>}
                            <input type='text' name='country'
                                   placeholder={placeholderText("globally.input.country.placeholder.label")}
                                   className='form-control'
                                   onChange={(e) => onChangeInput(e)}
                                   value={supplierValue.country}/>
                            <span
                                className='text-danger d-block fw-400 fs-small mt-2'>{errors['country'] ? errors['country'] : null}</span>
                        </div>
                        <div className='col-md-6 mb-3'>
                                <label
                                    className='form-label'>
                                    {getFormattedMessage("globally.input.city.label")}:
                                </label>
                                {isFieldRequired('supplier_city_required') && <span className='required'/>}
                                <input type='text' name='city'
                                              placeholder={placeholderText("globally.input.city.placeholder.label")}
                                              className='form-control'
                                              onChange={(e) => onChangeInput(e)}
                                              value={supplierValue.city}/>
                                <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['city'] ? errors['city'] : null}</span>
                        </div>
                        <div className='col-md-6 mb-3'>
                                <label
                                    className='form-label'>
                                    {getFormattedMessage("globally.input.address.label")}:
                                </label>
                                {isFieldRequired('supplier_address_required') && <span className='required'/>}
                                <input type='text' name='address'
                                              placeholder={placeholderText("globally.input.address.placeholder.label")}
                                              className='form-control'
                                              onChange={(e) => onChangeInput(e)}
                                              value={supplierValue.address}
                                />
                                <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['address'] ? errors['address'] : null}</span>
                        </div>
                        <ModelFooter onEditRecord={singleSupplier} onSubmit={onSubmit} editDisabled={disabled}
                                     link='/app/suppliers' addDisabled={!supplierValue.name}/>
                    </div>
                </Form>
            </div>
        </div>
    )
};

export default connect(null, {editSupplier})(SupplierForm);
