import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { InputGroup, Table } from 'react-bootstrap-v5';
import { searchPurchaseProduct } from '../../store/action/purchaseProductAction';
import { editPurchaseReturn } from '../../store/action/purchaseReturnAction';
import { fetchAllProducts, fetchProductsByWarehouse } from '../../store/action/productAction';
import PurchaseReturnTable from '../../shared/components/purchase/PurchaseTable';
import { preparePurchaseReturnArray } from './preparePurchaseReturnArray';
import { decimalValidate, getDecimalPlaces, getFormattedMessage, placeholderText, onFocusInput, getFormattedOptions } from '../../shared/sharedMethod';
import { calculateCartTotalAmount, calculateCartTotalTaxAmount, } from '../../shared/calculation/calculation';
import ModelFooter from '../../shared/components/modelFooter';
import ProductSearch from '../../shared/components/product-cart/search/ProductSearch';
import { addToast } from '../../store/action/toastAction';
import { saleStatusOptions, toastType } from '../../constants';
import ReactDatePicker from '../../shared/datepicker/ReactDatePicker';
import ProductMainCalculation from '../sales/ProductMainCalculation';
import ReactSelect from '../../shared/select/reactSelect';
import TabTitle from '../../shared/tab-title/TabTitle';
import useFiscalYearValidation from '../../utils/useFiscalYearValidation';

const PurchaseReturnForm = ( props ) => {
    const { addPurchaseReturnData, id, editPurchaseReturn, customProducts, singlePurchase, warehouses, suppliers,
        fetchProductsByWarehouse, products, frontSetting, allConfigData, createSinglePurchase, settings, isLoading
    } = props;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ newCost, setNewCost ] = useState( '' );
    const [ newDiscount, setNewDiscount ] = useState( '' );
    const [ newTax, setNewTax ] = useState( '' );
    const [ newPurchaseUnit, setNewPurchaseUnit ] = useState( '' );
    const [ subTotal, setSubTotal ] = useState( '' );
    const [ updateProducts, setUpdateProducts ] = useState( [] );
    const [ quantity, setQuantity ] = useState( 0 );
    const [purchaseValueUpdated, setPurchaseValueUpdated] = useState(false);
    const decimalPlaces = getDecimalPlaces(settings);

    const isFiscalYearEnabled = parseInt(settings.attributes?.enable_fiscal_year_filter) === 1;
    const { validateDate: validateFiscalDate } = useFiscalYearValidation();

    const [purchaseValue, setPurchaseValue] = useState({
        date: new Date(),
        warehouse_id: '',
        supplier_id: '',
        tax_rate: parseFloat(0).toFixed(decimalPlaces),
        tax_amount: parseFloat(0).toFixed(decimalPlaces),
        discount: parseFloat(0).toFixed(decimalPlaces),
        shipping: parseFloat(0).toFixed(decimalPlaces),
        grand_total: parseFloat(0).toFixed(decimalPlaces),
        notes: '',
        status_id: { label: getFormattedMessage("status.filter.received.label"), value: 1 },
    });

    useEffect(() => {
        if (singlePurchase && !purchaseValueUpdated) {
            const data = singlePurchase;
            setPurchaseValue({
                date: moment(data.date).toDate(),
                warehouse_id: data.warehouse_id,
                supplier_id: data.supplier_id,
                tax_rate: parseFloat(data.orderTax)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                tax_amount: data.tax_amount || parseFloat(0).toFixed(decimalPlaces),
                discount: parseFloat(data.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                shipping: parseFloat(data.shipping)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                grand_total: data.grand_total || '0.00',
                notes: data.notes || '',
                status_id: data.status_id || { label: getFormattedMessage("status.filter.received.label"), value: 1 },
            });
            setUpdateProducts(data.purchase_return_items);
            setPurchaseValueUpdated(true);
        }
    }, [singlePurchase]);

    useEffect(() => {
        if (createSinglePurchase && !purchaseValueUpdated) {
            const data = createSinglePurchase;
            setPurchaseValue({
                date: moment(data.date).toDate(),
                warehouse_id: data.warehouse_id,
                supplier_id: data.supplier_id,
                tax_rate: data.orderTax?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                tax_amount: data.tax_amount || parseFloat(0).toFixed(decimalPlaces),
                discount: data.discount?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                shipping: data.shipping?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                grand_total: data.grand_total || parseFloat(0).toFixed(decimalPlaces),
                notes: data.notes || '',
                status_id: data.status_id || { label: getFormattedMessage("status.filter.received.label"), value: 1 },
                purchase_id: data.purchase_id,
            });
            setUpdateProducts(data.purchase_return_items);
            setPurchaseValueUpdated(true);
        }
    }, [createSinglePurchase]);

    const [errors, setErrors] = useState({
        date: '',
        warehouse_id: '',
        supplier_id: '',
        details: '',
        tax_rate: '',
        discount: '',
        shipping: '',
        status_id: ''
    });

    // useEffect( () => {
    //     setUpdateProducts( updateProducts );
    // }, [ updateProducts, quantity, newCost, newDiscount, newTax, subTotal, newPurchaseUnit ] );

    useEffect(() => {
        updateProducts.length >= 1 ? dispatch({ type: 'DISABLE_OPTION', payload: true }) : dispatch({ type: 'DISABLE_OPTION', payload: false })
    }, [updateProducts])

    useEffect(() => {
        purchaseValue.warehouse_id.value ? fetchProductsByWarehouse(purchaseValue?.warehouse_id?.value) : null
    }, [purchaseValue.warehouse_id])

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;

        const hasValidQuantity = updateProducts.some(
            (product) => product.quantity > 0
        );

        if (!purchaseValue.date) {
            errorss['date'] = getFormattedMessage('globally.date.validate.label');
        } else if (validateFiscalDate(purchaseValue.date)) {
            errorss['date'] = validateFiscalDate(purchaseValue.date);
        } else if (!purchaseValue.warehouse_id) {
            errorss['warehouse_id'] = getFormattedMessage('purchase.select.warehouse.validate.label')
        } else if (!purchaseValue.supplier_id) {
            errorss['supplier_id'] = getFormattedMessage('purchase.select.supplier.validate.label')
        } else if (!hasValidQuantity) {
            dispatch(addToast({
                text: getFormattedMessage('globally.product-quantity.validate.message'),
                type: toastType.ERROR
            }))
        } else if (updateProducts.length < 1) {
            dispatch(addToast({
                text: getFormattedMessage('purchase.product-list.validate.message'),
                type: toastType.ERROR
            }))
        } else if (!purchaseValue.status_id) {
            errorss['status_id'] = getFormattedMessage("globally.status.validate.label")
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onWarehouseChange = (obj) => {
        setPurchaseValue(inputs => ({ ...inputs, warehouse_id: obj }))
        setErrors('')
    };

    const onSupplierChange = (obj) => {
        setPurchaseValue(inputs => ({ ...inputs, supplier_id: obj }))
        setErrors('');
    };

    const onStatusChange = (obj) => {
        setPurchaseValue(inputs => ({ ...inputs, status_id: obj }))
    };

    const updateCost = (item) => {
        setNewCost(item);
    };

    const updateDiscount = (item) => {
        setNewDiscount(item);
    };

    const updateTax = (item) => {
        setNewTax(item);
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;

        // Allow clearing the field
        if (value === '') {
            setPurchaseValue(inputs => ({ ...inputs, [name]: value }));
            return;
        }
        if (!/^\d*\.?\d*$/.test(value)) return;

        // Enforce decimal places limit
        const parts = value.split('.');
        if (parts[1]?.length > decimalPlaces) return;

        // Tax must not exceed 100
        if (name === 'tax_rate' && parseFloat(value) > 100) return;

        setPurchaseValue(inputs => ({
            ...inputs,
            [name]: value,
        }));
    };

    const onNotesChangeInput = (e) => {
        e.preventDefault();
        setPurchaseValue(inputs => ({ ...inputs, notes: e.target.value }))
    }

    const handleCallback = (date) => {
        setPurchaseValue(previousState => {
            return { ...previousState, date: date }
        });
        const fiscalError = validateFiscalDate(date);
        if (fiscalError) {
            setErrors({ date: fiscalError });
        } else {
            setErrors('')
        }
    };

    const updatedQty = (qty) => {
        setQuantity(qty);
    };

    const updateSubTotal = (item) => {
        setSubTotal(item);
    };

    const updatePurchaseUnit = (item) => {
        setNewPurchaseUnit(item);
    };

    const statusFilterOptions = getFormattedOptions(saleStatusOptions)
    const statusDefaultValue = statusFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name
        }
    })

    const prepareData = (prepareData) => {
        const formValue = {
            date: moment(prepareData.date).locale('en').toDate(),
            warehouse_id: prepareData.warehouse_id.value ? prepareData.warehouse_id.value : prepareData.warehouse_id,
            supplier_id: prepareData.supplier_id.value ? prepareData.supplier_id.value : prepareData.supplier_id,
            discount: prepareData.discount,
            tax_rate: prepareData.tax_rate,
            tax_amount: calculateCartTotalTaxAmount(updateProducts, purchaseValue),
            purchase_return_items: updateProducts,
            shipping: prepareData.shipping,
            grand_total: calculateCartTotalAmount(updateProducts, purchaseValue),
            received_amount: '',
            paid_amount: '',
            payment_type: null,
            notes: prepareData.notes,
            reference_code: '',
            status: prepareData.status_id.value ? prepareData.status_id.value : prepareData.status_id,
            payment_status: 2,
            purchase_id: prepareData.purchase_id ? prepareData.purchase_id : '',
        }
        return formValue
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            if (singlePurchase) {
                editPurchaseReturn(id, prepareData(purchaseValue), navigate);
            } else {
                addPurchaseReturnData(prepareData(purchaseValue));
                setPurchaseValue(purchaseValue);
            }
        }
    };

    const onBlurInput = (el) => {
        if (el.target.value === '') {
            if (el.target.name === "shipping") {
                setPurchaseValue( { ...purchaseValue, shipping: parseFloat(0).toFixed(decimalPlaces) } )
            }
            if (el.target.name === "discount") {
                 setPurchaseValue( { ...purchaseValue, discount: parseFloat(0).toFixed(decimalPlaces) } )
            }
            if (el.target.name === "tax_rate") {
                setPurchaseValue( { ...purchaseValue, tax_rate: parseFloat(0).toFixed(decimalPlaces) } )
            }
        }
    }

    return (
        <div className='card'>
            <TabTitle title={placeholderText(singlePurchase ? "purchase.return.edit.title" : "purchase.return.create.title")} />
            <div className='card-body'>
                {/*<Form>*/}
                <div className='row'>
                    <div className='col-md-4'>
                        <label className='form-label'>
                            {getFormattedMessage('react-data-table.date.column.label')}:
                        </label>
                        <span className='required' />
                        <div className='position-relative'>
                            <ReactDatePicker onChangeDate={handleCallback} {...(!isFiscalYearEnabled && { newStartDate: purchaseValue.date })} FixedFiscalYearDate={true} />
                        </div>
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['date'] ? errors['date'] : null}</span>
                    </div>
                    <div className='col-md-4 mb-5'>
                        <ReactSelect data={warehouses} onChange={onWarehouseChange}
                            defaultValue={purchaseValue.warehouse_id} addSearchItems={singlePurchase}
                            isWarehouseDisable={true}
                            value={purchaseValue.warehouse_id}
                            title={getFormattedMessage('warehouse.title')} errors={errors['warehouse_id']}
                            placeholder={placeholderText('purchase.select.warehouse.placeholder.label')} />
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect data={suppliers} onChange={onSupplierChange}
                            defaultValue={purchaseValue.supplier_id}
                            value={purchaseValue.supplier_id}
                            title={getFormattedMessage('supplier.title')} errors={errors['supplier_id']}
                            placeholder={placeholderText('purchase.select.supplier.placeholder.label')} />
                    </div>
                    {!singlePurchase && !createSinglePurchase && <div className='col-md-12 mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage('dashboard.stockAlert.product.label')}:
                        </label>
                        <ProductSearch values={purchaseValue} products={products} isAllProducts={true}
                            handleValidation={handleValidation} updateProducts={updateProducts}
                            setUpdateProducts={setUpdateProducts} customProducts={customProducts} isLoading={isLoading} />
                    </div>}
                    <div className='col-12 md-12'>
                        <label className='form-label'>
                            {getFormattedMessage('purchase.order-item.table.label')}:
                        </label>
                        <span className='required ' />
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>{getFormattedMessage('dashboard.stockAlert.product.label')}</th>
                                    <th>{getFormattedMessage('purchase.order-item.table.net-unit-cost.column.label')}</th>
                                    <th>{getFormattedMessage('purchase.order-item.table.stock.column.label')}</th>
                                    <th>{getFormattedMessage('purchase.order-item.table.qty.column.label')}</th>
                                    <th>{getFormattedMessage('purchase.order-item.table.discount.column.label')}</th>
                                    <th>{getFormattedMessage('purchase.order-item.table.tax.column.label')}</th>
                                    <th>{getFormattedMessage('purchase.order-item.table.sub-total.column.label')}</th>
                                    <th>{getFormattedMessage('react-data-table.action.column.label')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {updateProducts && updateProducts.map((singleProduct, index) => {
                                    return <PurchaseReturnTable singleProduct={singleProduct} index={index}
                                        updateQty={updatedQty} updateProducts={updateProducts}
                                        updateCost={updateCost} updateDiscount={updateDiscount}
                                        updateSubTotal={updateSubTotal}
                                        frontSetting={frontSetting} updateTax={updateTax}
                                        setUpdateProducts={setUpdateProducts}
                                        updatePurchaseUnit={updatePurchaseUnit}
                                        purchaseItem={singlePurchase && singlePurchase.purchase_return_items}
                                    />
                                })}
                                {!updateProducts.length && <tr>
                                    <td colSpan={8} className='fs-5 px-3 py-6 custom-text-center'>
                                        {getFormattedMessage('sale.product.table.no-data.label')}
                                    </td>
                                </tr>
                                }
                            </tbody>
                        </Table>
                    </div>
                    <div className='col-12'>
                        <ProductMainCalculation inputValues={purchaseValue} allConfigData={allConfigData} updateProducts={updateProducts} frontSetting={frontSetting} />
                    </div>
                    <div className='col-md-4 mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage('purchase.input.order-tax.label')}:
                        </label>
                        <InputGroup>
                            <input aria-label='Dollar amount'
                                value={purchaseValue.tax_rate} type='text' name='tax_rate'
                                onKeyPress={(event) => decimalValidate(event)}
                                className='form-control'
                               onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onChange={(e) => {
                                    onChangeInput(e)
                                }} />
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['orderTax'] ? errors['orderTax'] : null}</span>
                    </div>
                    <div className='col-md-4 mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage('purchase.order-item.table.discount.column.label')}:
                        </label>
                        <InputGroup>
                            <input aria-label='Dollar amount'
                                value={purchaseValue.discount} type='text' name='discount'
                                className='form-control'
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={(event) => decimalValidate(event)}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                        </InputGroup>
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['discount'] ? errors['discount'] : null}</span>
                    </div>
                    <div className='col-md-4 mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage('purchase.input.shipping.label')}:
                        </label>
                        <InputGroup>
                            <input aria-label='Dollar amount'
                                type='text' value={purchaseValue.shipping} name='shipping'
                                className='form-control'
                               onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={(event) => decimalValidate(event)}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                        </InputGroup>
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['shipping'] ? errors['shipping'] : null}</span>
                    </div>
                    <div className='col-md-4 mb-5'>
                        <ReactSelect multiLanguageOption={statusFilterOptions} onChange={onStatusChange} name='status'
                            title={getFormattedMessage('purchase.select.status.label')}
                            value={purchaseValue.status_id} errors={errors['status_id']}
                            defaultValue={statusDefaultValue[0]}
                            placeholder={getFormattedMessage('purchase.select.status.label')} />
                    </div>
                    <div className='col-md-12 mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage('globally.input.notes.label')}:
                        </label>
                        <textarea name='notes' className='form-control' value={purchaseValue.notes}
                            placeholder={placeholderText('purchase.placeholder.notes.input')}
                            onChange={(e) => onNotesChangeInput(e)}

                        />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['notes'] ? errors['notes'] : null}</span>
                    </div>
                    <ModelFooter onEditRecord={singlePurchase} onSubmit={onSubmit} link='/app/purchase-return' />
                </div>
                {/*</Form>*/}
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
        const { purchaseProducts, products, frontSetting, allConfigData, settings, isLoading } = state;
    return { customProducts: preparePurchaseReturnArray( products ), purchaseProducts, products, frontSetting, allConfigData, settings, fetchAllProducts, isLoading }
};

export default connect(mapStateToProps, { editPurchaseReturn, fetchProductsByWarehouse, searchPurchaseProduct, fetchAllProducts })(PurchaseReturnForm);
