import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, InputGroup } from 'react-bootstrap-v5';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { fetchProductsByWarehouse } from '../../store/action/productAction';
import { editSale } from '../../store/action/salesAction';
import ProductSearch from '../../shared/components/product-cart/search/ProductSearch';
import ProductRowTable from '../../shared/components/sales/ProductRowTable';
import { placeholderText, getFormattedMessage, decimalValidate, onFocusInput, getFormattedOptions, getDecimalPlaces } from '../../shared/sharedMethod';
import ReactDatePicker from '../../shared/datepicker/ReactDatePicker';
import ProductMainCalculation from './ProductMainCalculation';
import { calculateCartTotalAmount, calculateCartTotalTaxAmount } from '../../shared/calculation/calculation';
import { prepareSaleProductArray } from '../../shared/prepareArray/prepareSaleArray';
import ModelFooter from '../../shared/components/modelFooter';
import { addToast } from '../../store/action/toastAction';
import { quotationStatusOptions, toastType } from '../../constants';
import ReactSelect from '../../shared/select/reactSelect';
import { editQuotation } from '../../store/action/quotationAction';
import TabTitle from '../../shared/tab-title/TabTitle';
import useFiscalYearValidation from '../../utils/useFiscalYearValidation';

const QuotationForm = ( props ) => {
    const {
        addQuoationData,
        id,
        customers,
        warehouses,
        singleQuotation,
        customProducts,
        products,
        fetchProductsByWarehouse,
        frontSetting,
        editQuotation,
        allConfigData,
        settings,
        isLoading,
    } = props;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ updateProducts, setUpdateProducts ] = useState( [] );
    const [ quantity, setQuantity ] = useState( 0 );
    const [ newCost, setNewCost ] = useState( '' );
    const [ newDiscount, setNewDiscount ] = useState( '' );
    const [ newTax, setNewTax ] = useState( '' );
    const [ subTotal, setSubTotal ] = useState( '' );
    const [ newSaleUnit, setNewSaleUnit ] = useState( '' );
    const [isInitialized, setIsInitialized] = useState(false);
    const decimalPlaces = getDecimalPlaces(settings);

    const isFiscalYearEnabled = parseInt(settings.attributes?.enable_fiscal_year_filter) === 1;
    const { validateDate: validateFiscalDate } = useFiscalYearValidation();

    const [ saleValue, setSaleValue ] = useState( {
        date: new Date(),
        customer_id: '',
        warehouse_id: '',
        tax_rate: parseFloat(0).toFixed(decimalPlaces),
        tax_amount: parseFloat(0).toFixed(decimalPlaces),
        discount: parseFloat(0).toFixed(decimalPlaces),
        shipping: parseFloat(0).toFixed(decimalPlaces),
        grand_total: parseFloat(0).toFixed(decimalPlaces),
        notes: singleQuotation ? singleQuotation.notes : '',
        received_amount: 0,
        paid_amount: 0,
        status_id: { label: getFormattedMessage( 'status.filter.sent.label' ), value: 1 }
    } );
    const [ errors, setErrors ] = useState( {
        date: '',
        customer_id: '',
        warehouse_id: '',
        status_id: ''
    } );

    useEffect( () => {
        setUpdateProducts( updateProducts )
    }, [ updateProducts, quantity, newCost, newDiscount, newTax, subTotal, newSaleUnit ] )

    useEffect( () => {
        updateProducts.length >= 1 ? dispatch( { type: 'DISABLE_OPTION', payload: true } ) : dispatch( { type: 'DISABLE_OPTION', payload: false } )
    }, [ updateProducts ] )

    useEffect( () => {
        if ( singleQuotation && !isInitialized ) {
            setSaleValue( {
                date: singleQuotation ? moment( singleQuotation.date ).toDate() : '',
                customer_id: singleQuotation ? singleQuotation.customer_id : '',
                warehouse_id: singleQuotation ? singleQuotation.warehouse_id : '',
                tax_rate: singleQuotation ? singleQuotation.tax_rate.toFixed( decimalPlaces ) : parseFloat(0).toFixed( decimalPlaces ),
                tax_amount: singleQuotation ? singleQuotation.tax_amount.toFixed( decimalPlaces ) : parseFloat(0).toFixed( decimalPlaces ),
                discount: singleQuotation ? singleQuotation.discount.toFixed( decimalPlaces ) : parseFloat(0).toFixed( decimalPlaces ),
                shipping: singleQuotation ? singleQuotation.shipping.toFixed( decimalPlaces ) : parseFloat(0).toFixed( decimalPlaces ),
                grand_total: singleQuotation ? singleQuotation.grand_total.toFixed( decimalPlaces ) : parseFloat(0).toFixed( decimalPlaces ),
                status_id: singleQuotation ? singleQuotation.status_id : ''
            } )
            setUpdateProducts( singleQuotation.quotation_items );
            setIsInitialized(true);
        }
    }, [ singleQuotation ] );

    useEffect( () => {
        saleValue.warehouse_id.value && fetchProductsByWarehouse( saleValue?.warehouse_id?.value )
    }, [ saleValue.warehouse_id.value ] )

    const handleValidation = () => {
        let error = {};
        let isValid = false;
        if ( !saleValue.date ) {
            error[ 'date' ] = getFormattedMessage( 'globally.date.validate.label' );
        } else if (validateFiscalDate(saleValue.date)) {
            error[ 'date' ] = validateFiscalDate(saleValue.date);
        } else if ( !saleValue.warehouse_id ) {
            error[ 'warehouse_id' ] = getFormattedMessage( 'product.input.warehouse.validate.label' );
        } else if ( !saleValue.customer_id ) {
            error[ 'customer_id' ] = getFormattedMessage( 'sale.select.customer.validate.label' );
        } else if ( updateProducts.length < 1 ) {
            dispatch( addToast( { text: getFormattedMessage( 'purchase.product-list.validate.message' ), type: toastType.ERROR } ) )
        } else if ( !saleValue.status_id ) {
            error[ 'status_id' ] = getFormattedMessage( "globally.status.validate.label" )
        } else {
            isValid = true;
        }
        setErrors( error );
        return isValid;
    };

    const onWarehouseChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, warehouse_id: obj } ) );
        setErrors( '' );
    };

    const onCustomerChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, customer_id: obj } ) );
        setErrors( '' );
    };

        const onChangeInput = (e) => {
        const { name, value } = e.target;

        // Allow clearing input
        if (value === '') {
            setSaleValue(inputs => ({ ...inputs, [name]: value }));
            return;
        }

        // Allow only digits with ONE decimal
        if (!/^\d*\.?\d*$/.test(value)) {
            return;
        }
  
        // Enforce decimal places
        const parts = value.split('.');
        if (parts[1]?.length > decimalPlaces) {
            return;
        }

        // Order tax must not exceed 100
        if (name === 'tax_rate' && parseFloat(value) > 100) {
            return;
        }

        setSaleValue(inputs => ({
            ...inputs,
            [name]: value,
        }));
    };

    const onNotesChangeInput = ( e ) => {
        e.preventDefault();
        setSaleValue( inputs => ( { ...inputs, notes: e.target.value } ) );
    };

    const onStatusChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, status_id: obj } ) );
    };

    const updatedQty = ( qty ) => {
        setQuantity( qty );
    };

    const updateCost = ( cost ) => {
        setNewCost( cost );
    };

    const updateDiscount = ( discount ) => {
        setNewDiscount( discount );
    };

    const updateTax = ( tax ) => {
        setNewTax( tax );
    };

    const updateSubTotal = ( subTotal ) => {
        setSubTotal( subTotal );
    };

    const updateSaleUnit = ( saleUnit ) => {
        setNewSaleUnit( saleUnit );
    };

    const handleCallback = ( date ) => {
        setSaleValue( previousState => {
            return { ...previousState, date: date }
        } );
        const fiscalError = validateFiscalDate(date);
        if (fiscalError) {
            setErrors({ date: fiscalError });
        } else {
            setErrors( '' );
        }
    };

    const quotationStatusFilterOptions = getFormattedOptions( quotationStatusOptions )

    const prepareFormData = ( prepareData ) => {
        const formValue = {
            date: moment( prepareData.date ).locale('en').toDate(),
            customer_id: prepareData.customer_id.value ? prepareData.customer_id.value : prepareData.customer_id,
            warehouse_id: prepareData.warehouse_id.value ? prepareData.warehouse_id.value : prepareData.warehouse_id,
            discount: prepareData.discount,
            tax_rate: prepareData.tax_rate,
            tax_amount: calculateCartTotalTaxAmount( updateProducts, saleValue ),
            quotation_items: updateProducts,
            shipping: prepareData.shipping,
            grand_total: calculateCartTotalAmount( updateProducts, saleValue ),
            received_amount: 0,
            paid_amount: 0,
            note: prepareData.notes,
            status: prepareData.status_id.value ? prepareData.status_id.value : prepareData.status_id,
        }
        return formValue
    };

    const onSubmit = ( event ) => {
        event.preventDefault();
        const valid = handleValidation();
        if ( valid ) {
            if ( singleQuotation ) {
                editQuotation( id, prepareFormData( saleValue ), navigate );
            } else {
                addQuoationData( prepareFormData( saleValue ) );
                setSaleValue( saleValue );
            }
        }
    };

    const onBlurInput = ( el ) => {
        if ( el.target.value === '' ) {
            if ( el.target.name === "shipping" ) {
                 setSaleValue( { ...saleValue, shipping: parseFloat(0).toFixed(decimalPlaces) } );
            }
            if ( el.target.name === "discount" ) {
                setSaleValue( { ...saleValue, discount: parseFloat(0).toFixed(decimalPlaces) } );
            }
            if ( el.target.name === "tax_rate" ) {
               setSaleValue( { ...saleValue, tax_rate: parseFloat(0).toFixed(decimalPlaces) } );
            }
        }
    }

    return (
        <div className='card'>
            <TabTitle title={placeholderText(singleQuotation ? "edit-quotation.title" : "create-quotation.title")} />
            <div className='card-body'>
                {/*<Form>*/}
                <div className='row'>
                    <div className='col-md-4'>
                        <label className='form-label'>
                            {getFormattedMessage( 'react-data-table.date.column.label' )}:
                        </label>
                        <span className='required' />
                        <div className='position-relative'>
                            <ReactDatePicker onChangeDate={handleCallback} {...(!isFiscalYearEnabled && { newStartDate: saleValue.date })} FixedFiscalYearDate={true} />
                        </div>
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'date' ] ? errors[ 'date' ] : null}</span>
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect name='warehouse_id' data={warehouses} onChange={onWarehouseChange}
                            title={getFormattedMessage( 'warehouse.title' )} errors={errors[ 'warehouse_id' ]}
                            defaultValue={saleValue.warehouse_id} value={saleValue.warehouse_id} addSearchItems={singleQuotation}
                            isWarehouseDisable={true}
                            placeholder={placeholderText( 'purchase.select.warehouse.placeholder.label' )} />
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect name='customer_id' data={customers} onChange={onCustomerChange}
                            title={getFormattedMessage( 'customer.title' )} errors={errors[ 'customer_id' ]}
                            defaultValue={saleValue.customer_id} value={saleValue.customer_id}
                            placeholder={placeholderText( 'sale.select.customer.placeholder.label' )} />
                    </div>
                    <div className='mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage( 'product.title' )}:
                        </label>
                        <ProductSearch values={saleValue} products={products} handleValidation={handleValidation}
                            updateProducts={updateProducts} isAllProducts={true}
                            setUpdateProducts={setUpdateProducts} customProducts={customProducts} isLoading={isLoading} />
                    </div>
                    <div>
                        <label className='form-label'>
                            {getFormattedMessage( 'purchase.order-item.table.label' )}:
                        </label>
                        <span className='required' />
                        <ProductRowTable updateProducts={updateProducts} setUpdateProducts={setUpdateProducts}
                            updatedQty={updatedQty} frontSetting={frontSetting}
                            updateCost={updateCost} updateDiscount={updateDiscount}
                            updateTax={updateTax} updateSubTotal={updateSubTotal}
                            updateSaleUnit={updateSaleUnit}
                        />
                    </div>
                    <div className='col-12'>
                         <ProductMainCalculation decimalPlaces={decimalPlaces} inputValues={saleValue} allConfigData={allConfigData} updateProducts={updateProducts} frontSetting={frontSetting} />
                    </div>
                    <div className='col-md-4 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage( 'purchase.input.order-tax.label' )}: </label>
                        <InputGroup>
                            <input aria-label='Dollar amount'
                                className='form-control'
                                type='text' name='tax_rate' value={saleValue.tax_rate}
                                 onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces)}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => {
                                    onChangeInput( e )
                                }} />
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <Form.Label
                            className='form-label'>{getFormattedMessage( 'purchase.order-item.table.discount.column.label' )}: </Form.Label>
                        <InputGroup>
                            <input aria-label='Dollar amount'
                                className='form-control'
                                type='text' name='discount' value={saleValue.discount}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces)}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => onChangeInput( e )}
                            />
                            <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage( 'purchase.input.shipping.label' )}: </label>
                        <InputGroup>
                            <input aria-label='Dollar amount' type='text'
                                className='form-control'
                                name='shipping' value={saleValue.shipping}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces)}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => onChangeInput( e )}
                            />
                            <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect multiLanguageOption={quotationStatusFilterOptions} name='status_id' onChange={onStatusChange}
                            title={getFormattedMessage( 'purchase.select.status.label' )}
                            value={saleValue.status_id} errors={errors[ 'status_id' ]}
                            placeholder={placeholderText( 'purchase.select.status.placeholder.label' )} />
                    </div>
                    <div className='mb-3 mt-2'>
                        <label className='form-label'>
                            {getFormattedMessage( 'globally.input.notes.label' )}: </label>
                        <textarea name='notes' className='form-control' value={saleValue.notes}
                            placeholder={placeholderText( 'globally.input.notes.placeholder.label' )}
                            onChange={( e ) => onNotesChangeInput( e )}
                        />
                    </div>
                    <ModelFooter onEditRecord={singleQuotation} onSubmit={onSubmit} link='/app/quotations' />
                </div>
                {/*</Form>*/}
            </div>
        </div>
    )
}

const mapStateToProps = ( state ) => {
    const { purchaseProducts, products, frontSetting, allConfigData, settings, isLoading } = state;
    return { customProducts: prepareSaleProductArray( products ), purchaseProducts, products, frontSetting, allConfigData, settings, isLoading }
}

export default connect( mapStateToProps, { editSale, editQuotation, fetchProductsByWarehouse } )( QuotationForm )

