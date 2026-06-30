import React, {useEffect, useState} from 'react';
import {Modal, Button} from 'react-bootstrap';
import {Form, InputGroup} from 'react-bootstrap-v5';
import Select from 'react-select';
import {connect} from 'react-redux';
import {decimalValidate, getFormattedMessage, placeholderText, getFormattedOptions, getDecimalPlaces} from '../../shared/sharedMethod';
import {productUnitDropdown} from '../../store/action/productUnitAction';
import ReactSelect from '../../shared/select/reactSelect';
import {calculateProductCost} from './SharedMethod';
import { taxMethodOptions, discountMethodOptions, Product_Price_Types } from '../../constants';

const ProductDetailsModel = (props) => {
    const {
        openProductDetailModal,
        isOpenCartItemUpdateModel,
        cartProduct,
        onProductUpdateInCart,
        productModelId,
        updateCost,
        productUnitDropdown,
        productUnits,
        frontSetting,
        settings,
        saleunitDisalbed
    } = props;


    const decimalPlaces = getDecimalPlaces(settings);
    const [product, setProduct] = useState(cartProduct);
    const [unitPrice, setUnitPrice] = useState(0);
    const [saleUnitType, setSaleUnitType] = useState(null);
    const [discount, setDiscount] = useState('0');
    const [orderTax, setOrderTax] = useState(Number(product.tax_value));
    const [errors, setErrors] = useState({
        product_cost: '',
        discount: '',
        orderTax: ''
    });

    const saleUnitsOption = productUnits && productUnits.length && productUnits.map((productUnit) => {
        return {value: productUnit.id, label: productUnit.attributes.name}
    });
    if (!cartProduct) {
        return ''
    }

    useEffect(() => {
        setSaleUnitType(productUnits && productUnits.length && productUnits.filter((item) =>
            Number(item.id) === Number(product.sale_unit && product.sale_unit.value ? product.sale_unit.value : product.sale_unit)).map((item) => {
            return ({
                label: item.attributes.name,
                value: item.id
            })
        }))
    }, [productUnits]);

    useEffect(() => {
        productUnitDropdown(product.product_unit);
    }, []);

    useEffect(() => {
        setProduct(cartProduct);
    }, [cartProduct]);


    const originalRetailPrice = product.original_product_price ?? product.product_price;

    const priceTypeFieldMap = {
        1: null,
        2: 'product_wholesale_price',
        3: 'product_special_price',
    };

    const productPriceTypeFilterOptions = Product_Price_Types
        .filter(option => {
            if (option.id === 4) return true;
            if (option.id === 1) {
                return originalRetailPrice !== null && originalRetailPrice !== undefined && originalRetailPrice !== '' && Number(originalRetailPrice) !== 0;
            }
            const field = priceTypeFieldMap[option.id];
            const priceVal = cartProduct[field];
            return priceVal !== null && priceVal !== undefined && priceVal !== '' && Number(priceVal) !== 0;
        })
        .map((option) => ({
            value: option.id,
            label: option.name
        }));

    // Determine default price type: use saved value if available in filtered options, else first option
    const defaultPriceTypeOption = productPriceTypeFilterOptions.find(
        opt => opt.value === (cartProduct.product_price_type ? Number(cartProduct.product_price_type) : null)
    ) || productPriceTypeFilterOptions[0];

    const [productPriceType, setProductPriceType] = useState(defaultPriceTypeOption || null);

    const onProductPriceTypeChange = (obj) => {
        setProductPriceType(obj);
        if (obj.value === 1) {
            if (Number(originalRetailPrice) !== 0) {
                setUnitPrice(parseFloat(Number(originalRetailPrice)).toFixed(2));
            }
        } else {
            const field = priceTypeFieldMap[obj.value];
            if (field) {
                const priceVal = product[field];
                if (priceVal !== null && priceVal !== undefined && priceVal !== '' && Number(priceVal) !== 0) {
                    setUnitPrice(parseFloat(Number(priceVal)).toFixed(2));
                }
            }
        }
    };

    useEffect(() => {
        setUnitPrice(product.product_price && parseFloat(product.product_price).toFixed(2));
        setDiscount(product.discount_value ? parseFloat(product.discount_value).toFixed(2) : discount);
        setOrderTax(parseFloat(Number(product.tax_value)).toFixed(2));
        // Re-determine available price options and default selection when product changes
        const availableOption = productPriceTypeFilterOptions.find(
            opt => opt.value === (product.product_price_type ? Number(product.product_price_type) : null)
        ) || productPriceTypeFilterOptions[0];
        setProductPriceType(availableOption || null);
        setTaxType(product.tax_type === 1 || product.tax_type === '1' ? {
            value: 1, label:  getFormattedMessage("tax-type.filter.exclusive.label")
        } : {
            value: 2, label: getFormattedMessage("tax-type.filter.inclusive.label")
        } || product.tax_type === 2 || product.tax_type === '2' ? {
            value: 2, label: getFormattedMessage("tax-type.filter.inclusive.label")
        } : {value: 1,  label: getFormattedMessage("tax-type.filter.exclusive.label")});

        setDiscountType(product.discount_type === 1 ? {
            value: 1, label: getFormattedMessage("discount-type.filter.percentage.label")
        } : {value: 2, label: getFormattedMessage("discount-type.filter.fixed.label")} || product.discount_type === 2 ? {
            value: 2, label: getFormattedMessage("discount-type.filter.fixed.label")
        } : {value: 1, label: getFormattedMessage("discount-type.filter.percentage.label")});
    },[product]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!unitPrice) {
            errorss['product_cost'] = 'Please enter price';
        } else if (discountType.value === 1 && discount > 100) {
            errorss['discount'] = 'The Discount must not be greater than 100';
        } else if (discountType.value === 2 && discount > Number(unitPrice)) {
            errorss['discount'] = 'The Discount must not be greater than product price';
        } else if (taxType.value === '1' && Number(orderTax) > 100) {
            errorss['orderTax'] = 'The Tax must not be greater than 100';
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onChangeUnitPrice = (e) => {
        const {value} = e.target;
        setUnitPrice(e.target.value);

        const typedPrice = Number(value);
        if (value === '' || isNaN(typedPrice)) return;

        const priceMatches = (candidate, expected) => {
            if (candidate === null || candidate === undefined || expected === null || expected === '') return false;
            return Math.abs(Number(candidate) - Number(expected)) < 0.00001;
        };

        const retailPrice = originalRetailPrice;
        const wholesalePrice = product.product_wholesale_price;
        const specialPrice = product.product_special_price;

        if (priceMatches(typedPrice, retailPrice) && Number(retailPrice) !== 0) {
            setProductPriceType({ value: 1, label: getFormattedMessage("price.group.retail.title") });
        } else if (priceMatches(typedPrice, wholesalePrice) && Number(wholesalePrice) !== 0) {
            setProductPriceType({ value: 2, label: getFormattedMessage("price.group.wholesale.title") });
        } else if (priceMatches(typedPrice, specialPrice) && Number(specialPrice) !== 0) {
            setProductPriceType({ value: 3, label: getFormattedMessage("price.group.special.title") });
        } else {
            setProductPriceType({ value: 4, label: getFormattedMessage("price.group.custom.title") });
        }
    };

    //onChange tax field
const onChangeTax = (e) => {
    let { value } = e.target;

    if (value === "") {
        setOrderTax("");
        return;
    }

    if (!/^\d*\.?\d*$/.test(value)) {
        return;
    }
    
    const effectiveLimit = decimalPlaces > 0 ? decimalPlaces : 2;
    if(value > 100) return;

    if (value.includes('.')) {
        const [, decimal] = value.split('.');
        if ((decimal && decimal.length > effectiveLimit)) {
            return; // Block input if it exceeds the limit
        }
    }

    setOrderTax(value);
};

    // tax type dropdown functionality
    const taxTypeFilterOptions = getFormattedOptions(taxMethodOptions)
    const [taxType, setTaxType] = useState(product.tax_type == 1 ? {
        value: 1, label: getFormattedMessage("tax-type.filter.exclusive.label")
    } : {
        value: 2, label: getFormattedMessage("tax-type.filter.inclusive.label")
    } || product.tax_type == 2 ? {
        value: 2, label: getFormattedMessage("tax-type.filter.inclusive.label")
    } : {
        value: 1, label: getFormattedMessage("tax-type.filter.exclusive.label")
    });
    const onTaxTypeChange = (obj) => {
        setTaxType(obj);
    };

    // discount type dropdown functionality
    const discountTypeFilterOptions = getFormattedOptions(discountMethodOptions)
    const [discountType, setDiscountType] = useState(product.discount_type === 1 ? {
        value: 1, label: getFormattedMessage("discount-type.filter.percentage.label")
    } : {value: 2, label: getFormattedMessage("discount-type.filter.fixed.label")} || product.discount_type === 2 ? {value: 2, label: getFormattedMessage("discount-type.filter.fixed.label")} : {
        value: 1, label: getFormattedMessage("discount-type.filter.percentage.label")
    });
    const onDiscountTypeChange = (obj) => {
        setDiscountType(obj);
    };

    const onChangeSaleUnitType = (obj) => {
        setSaleUnitType(obj);
    };

    //onChange discount field
    const onChangeDiscount = (e) => {
        const {value} = e.target;
        
        if(value == ""){
            setDiscount("");
            return;
        }


        if (value.match(/\./g)) {
            const [, decimal] = value.split('.');
            // restrict value to only 2 decimal places
            if (decimal?.length > ((decimalPlaces == 0 ) ? 2 : decimalPlaces)) {
                return;
            }
        }
        setDiscount(value);
    };

    //discount amount function
    const discountAmount = (price) => {
        const priceVal = Number(price);
        let dis = 0;

        if (discount > 0) {
            if (discountType.value === 2 || discountType.value === '2') {
                dis = Number(discount);
            } else if (discountType.value === 1 || discountType.value === '1') {
                dis = (priceVal * Number(discount)) / 100;
            }
        }

        return parseFloat(dis.toFixed(2));
    };

    //tax amount function
    const taxAmount = (unitPrice) => {
        const price = Number(unitPrice);
        const discountAmt = discountAmount(price);
        const total = price - discountAmt;
        let tax = 0;

        if (orderTax > 0) {
            if (taxType.value === 1 || taxType.value === '1') {
                tax = (total * Number(orderTax)) / 100;
            } else if (taxType.value === 2 || taxType.value === '2') {
                tax = total - (total / (1 + Number(orderTax) / 100));
            }
        }

        return parseFloat(tax.toFixed(2));
    };

    //product details save button function
    const onSaveDetailModal = () => {
        const newProduct = product;
        const Valid = handleValidation();
        if (Valid) {
            if (productModelId === product.id) {
                newProduct.net_unit_cost = calculateProductCost(product);
                newProduct.original_product_price = originalRetailPrice;
                newProduct.product_price = Number(unitPrice);
                newProduct.product_price_type = productPriceType ? productPriceType.value : null;
                newProduct.discount_amount = discountAmount(product.product_price);
                newProduct.discount_value = Number(discount);
                newProduct.discount_type = (discountType.value);
                newProduct.tax_amount = taxAmount(Number(product.product_price));
                newProduct.tax_value = Number(orderTax);
                newProduct.tax_type = Number(taxType.value);
                newProduct.sale_unit = saleUnitType[0] ? saleUnitType[0].value : saleUnitType || saleUnitType ? saleUnitType.value : saleUnitType;
                onProductUpdateInCart(newProduct);
            }
            updateCost(newProduct.net_unit_cost = calculateProductCost(unitPrice));
            openProductDetailModal(false);
        }
    };

    return (
        <Modal show={isOpenCartItemUpdateModel} onHide={() => openProductDetailModal(false)} className="pos-modal">
            <Modal.Header closeButton>
                <Modal.Title className="text-capitalize">{product.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <div className='col-12'>
                        <Form.Group className='col-md-12 mb-3' controlId='formBasicProductCost'>
                            <Form.Label>{getFormattedMessage('product.input.product-price.label')}: </Form.Label>
                            <InputGroup>
                                <Form.Control type='text' name='product_cost' min='0' step='.01' placeholder='0.00'
                                              onKeyPress={(event) => decimalValidate(event)}
                                              className='form-control-solid' value={unitPrice}
                                              onChange={(e) => onChangeUnitPrice(e)}
                                              readOnly={productPriceType ? productPriceType.value !== 4 : true}
                                    />
                                <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                        <div className='col-md-12 mb-3'>
                            <ReactSelect title={getFormattedMessage('product.input.product-price-type.label')}
                                         data={productPriceTypeFilterOptions}
                                         onChange={onProductPriceTypeChange}
                                         errors={''}
                                         value={productPriceType}
                                         placeholder={placeholderText('product.input.product-price-type.placeholder')}
                            />
                        </div>
                        <div className='col-md-12 mb-3'>
                            <ReactSelect  title={getFormattedMessage('product.input.tax-type.label')}
                                    multiLanguageOption={taxTypeFilterOptions} onChange={onTaxTypeChange} errors={''}
                                     defaultValue={taxType}
                                     placeholder={placeholderText("product.input.tax-type.placeholder.label")}
                            />
                        </div>

                        <Form.Group className='col-md-12 mb-3' controlId='formBasicOrderTax'>
                            <Form.Label>{getFormattedMessage("product.product-details.tax.label")}: </Form.Label>
                            <InputGroup>
                                <Form.Control type='text' name='orderTax' className='form-control-solid'
                                              onKeyPress={(event) => decimalValidate(event)}
                                              onChange={onChangeTax}  value={orderTax ? orderTax === 'NaN' ? 0.00 : orderTax : 0.00}/>
                                <InputGroup.Text>%</InputGroup.Text>
                            </InputGroup>
                            <span className='text-danger'>{errors['orderTax'] ? errors['orderTax'] : null}</span>
                        </Form.Group>
                        <div className='col-md-12 mb-3'>
                            <ReactSelect  title={getFormattedMessage('purchase.product-modal.select.discount-type.label')}
                                    multiLanguageOption={discountTypeFilterOptions} onChange={onDiscountTypeChange} errors={''}
                                    defaultValue={discountType}
                                    placeholder={placeholderText("pos-sale.select.discount-type.placeholder")}
                            />
                        </div>
                        <Form.Group className='col-md-12 mb-3' controlId='formBasicDiscount'>
                            <Form.Label>{getFormattedMessage('globally.detail.discount')}: </Form.Label>
                            <Form.Control type='text' name='discount' min='0'
                                          onKeyPress={(event) => decimalValidate(event)}
                                          className='form-control-solid' max='100'
                                          onChange={onChangeDiscount} value={discount ? discount : ''}/>
                            <span
                                className='text-danger'>{errors['discount'] ? errors['discount'] : null}</span>
                        </Form.Group>
        
                        { !saleunitDisalbed &&<Form.Group className='col-md-12' controlId='formBasicUnit'>
                            <Form.Label>{getFormattedMessage('product.input.sale-unit.label')}: </Form.Label>
                            <Select name='sale_unit' placeholder={placeholderText('pos-sale.select.sale-unit-type.placeholder')} value={saleUnitType}
                                    onChange={onChangeSaleUnitType} options={saleUnitsOption} noOptionsMessage={() => getFormattedMessage('no-option.label')}
                            />
                        </Form.Group>}
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer className="pt-0">
                <Button variant='primary' onClick={() => onSaveDetailModal()}>
                    {getFormattedMessage("globally.save-btn")}
                </Button>
                <Button variant='secondary' className='me-0'
                        onClick={() => openProductDetailModal(false)}>
                    {getFormattedMessage('globally.cancel-btn')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
};

const mapStateToProps = (state) => {
    const {productUnits} = state;
    return {productUnits}
};

export default connect(mapStateToProps, {productUnitDropdown})(ProductDetailsModel);