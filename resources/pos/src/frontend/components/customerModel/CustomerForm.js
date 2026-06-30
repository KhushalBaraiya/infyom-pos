import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { connect, useSelector, useDispatch } from 'react-redux';
import * as EmailValidator from 'email-validator';
import { getFormattedMessage, placeholderText, phoneValidate } from '../../../shared/sharedMethod';
import { editCustomer } from '../../../store/action/customerAction';
import { fetchFieldConfiguration } from '../../../store/action/fieldConfigurationAction';
import ModelFooter from '../../../shared/components/modelFooter';
import { addCustomer } from '../../../store/action/pos/customerAction';

const CustomerForm = ( props ) => {
    const { show, hide, singleCustomer, addCustomer } = props
    const fieldConfiguration = useSelector((state) => state.fieldConfiguration);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchFieldConfiguration());
    }, [dispatch]);
    
    const [ customerValue, setCustomerValue ] = useState( {
        name: singleCustomer ? singleCustomer[ 0 ].name : '',
        email: singleCustomer ? singleCustomer[ 0 ].email : '',
        phone: singleCustomer ? singleCustomer[ 0 ].phone : '',
        country: singleCustomer ? singleCustomer[ 0 ].country : '',
        city: singleCustomer ? singleCustomer[ 0 ].city : '',
        address: singleCustomer ? singleCustomer[ 0 ].address : ''
    } );
    const [ errors, setErrors ] = useState( {
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: ''
    } );

    const disabled = singleCustomer && singleCustomer[ 0 ].phone === customerValue.phone && singleCustomer[ 0 ].name === customerValue.name && singleCustomer[ 0 ].country === customerValue.country && singleCustomer[ 0 ].city === customerValue.city && singleCustomer[ 0 ].email === customerValue.email && singleCustomer[ 0 ].address === customerValue.address

    const isFieldRequired = (fieldName) => {
        return fieldConfiguration[fieldName] == 1 || fieldConfiguration[fieldName] === true;
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if ( !customerValue[ 'name' ] ) {
            errorss[ 'name' ] = getFormattedMessage( "globally.input.name.validate.label" );
        } else if (isFieldRequired('customer_email_required') && !EmailValidator.validate( customerValue[ 'email' ] ) ) {
            if ( !customerValue[ 'email' ] ) {
                errorss[ 'email' ] = getFormattedMessage( "globally.input.email.validate.label" );
            } else {
                errorss[ 'email' ] = getFormattedMessage( "globally.input.email.valid.validate.label" );
            }
        } else if (isFieldRequired('customer_phone_number_required') && !customerValue[ 'phone' ] ) {
            errorss[ 'phone' ] = getFormattedMessage( "globally.input.phone-number.validate.label" );
        } else if (isFieldRequired('customer_country_required') && !customerValue[ 'country' ] ) {
            errorss[ 'country' ] = getFormattedMessage( "globally.input.country.validate.label" );
        } else if (isFieldRequired('customer_city_required') && !customerValue[ 'city' ] ) {
            errorss[ 'city' ] = getFormattedMessage( "globally.input.city.validate.label" );
        } else if (isFieldRequired('customer_address_required') && !customerValue[ 'address' ] ) {
            errorss[ 'address' ] = getFormattedMessage( "globally.input.address.validate.label" );
        } else {
            isValid = true;
        }
        setErrors( errorss );
        return isValid;
    };

    const onChangeInput = ( e ) => {
        e.preventDefault();
        setCustomerValue( inputs => ( { ...inputs, [ e.target.name ]: e.target.value } ) )
        setErrors( '' );
    };

    const addCustomerData = ( formValue ) => {
        addCustomer( formValue, hide );
    };

    const onSubmit = ( event ) => {
        event.preventDefault();
        const valid = handleValidation();
        if ( valid ) {
            setCustomerValue( customerValue );
            addCustomerData( customerValue );
        }
    };

    return (
        <>
            <Modal
                show={show}
                onHide={() => hide( false )}
                keyboard={true}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{getFormattedMessage( 'customer.create.title' )}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='p-0'>
                    <div className='card'>
                        <div className='card-body'>
                            <Form>
                                <div className='row'>
                                    <div className='col-md-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage( "globally.input.name.label" )}:
                                        </label>
                                        <span className='required' />
                                        <input type='text' name='name' value={customerValue.name}
                                            placeholder={placeholderText( "globally.input.name.placeholder.label" )}
                                            className='form-control' autoFocus={true}
                                            onChange={( e ) => onChangeInput( e )} />
                                        <span
                                            className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'name' ] ? errors[ 'name' ] : null}</span>
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label
                                            className='form-label'>
                                            {getFormattedMessage( "globally.input.email.label" )}:
                                        </label>
                                        {isFieldRequired('customer_email_required') && <span className='required' />}
                                        <input type='text' name='email' className='form-control'
                                            placeholder={placeholderText( "globally.input.email.placeholder.label" )}
                                            onChange={( e ) => onChangeInput( e )}
                                            value={customerValue.email} />
                                        <span
                                            className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'email' ] ? errors[ 'email' ] : null}</span>
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label
                                            className='form-label'>
                                            {getFormattedMessage( "globally.input.phone-number.label" )}:
                                        </label>
                                        {isFieldRequired('customer_phone_number_required') && <span className='required' />}
                                        <input type='text' name='phone' className='form-control'
                                            placeholder={placeholderText( "globally.input.phone-number.placeholder.label" )}
                                            onKeyPress={( event ) => phoneValidate( event )}
                                            onChange={( e ) => onChangeInput( e )}
                                            value={customerValue.phone} />
                                        <span
                                            className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'phone' ] ? errors[ 'phone' ] : null}</span>
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage( "globally.input.country.label" )}:
                                        </label>
                                        {isFieldRequired('customer_country_required') && <span className='required' />}
                                        <input type='text' name='country' className='form-control'
                                            placeholder={placeholderText( "globally.input.country.placeholder.label" )}
                                            onChange={( e ) => onChangeInput( e )}
                                            value={customerValue.country} />
                                        <span
                                            className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'country' ] ? errors[ 'country' ] : null}</span>
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label
                                            className='form-label'>
                                            {getFormattedMessage( "globally.input.city.label" )}:
                                        </label>
                                        {isFieldRequired('customer_city_required') && <span className='required' />}
                                        <input type='text' name='city' className='form-control'
                                            placeholder={placeholderText( "globally.input.city.placeholder.label" )}
                                            onChange={( e ) => onChangeInput( e )}
                                            value={customerValue.city} />
                                        <span
                                            className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'city' ] ? errors[ 'city' ] : null}</span>
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label
                                            className='form-label'>
                                            {getFormattedMessage( "globally.input.address.label" )}:
                                        </label>
                                        {isFieldRequired('customer_address_required') && <span className='required' />}
                                        <input type='text' name='address' className='form-control'
                                            placeholder={placeholderText( "globally.input.address.placeholder.label" )}
                                            onChange={( e ) => onChangeInput( e )}
                                            value={customerValue.address} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'address' ] ? errors[ 'address' ] : null}</span>
                                    </div>
                                    <ModelFooter onEditRecord={singleCustomer} onSubmit={onSubmit} editDisabled={disabled}
                                        addDisabled={!customerValue.name} link='/app/pos' modelhide={hide} />
                                </div>
                            </Form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default connect( null, { editCustomer, addCustomer } )( CustomerForm );
