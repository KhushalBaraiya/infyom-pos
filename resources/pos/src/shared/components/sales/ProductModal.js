import React, {useEffect, useState} from 'react';
import {Button, Form, InputGroup, Modal, Row} from 'react-bootstrap-v5';
import {subTotalCount, discountAmountMultiply, taxAmountMultiply, amountBeforeTax} from '../../calculation/calculation';
import {decimalValidate, getFormattedMessage, placeholderText, getFormattedOptions} from '../../sharedMethod';
import ReactSelect from '../../select/reactSelect';
import { taxMethodOptions, discountMethodOptions, Product_Price_Types } from '../../../constants';

const ProductModal = (props) => {
    const {
        product,
        setIsShowModal,
        isShowModal,
        onProductUpdateInCart,
        updateCost,
        updateDiscount,
        updateTax,
        updateSubTotal,
        productSales,
        updateSaleUnit,
        frontSetting,
        decimalPlaces
    } = props;

    const [productModalData, setProductModalData] = useState(product);
    const [netUnit, setNetUnit] = useState(product.fix_net_unit);
    const [taxValue, setTaxValue] = useState(product.tax_value);
    const [taxType, setTaxType] = useState(product.tax_type);
    const [discountValue, setDiscountValue] = useState(product.discount_value);
    const [productUnit, setProductUnit] = useState('0');
    const [selectedSaleUnit, setSelectedSaleUnit] = useState(null);
    const [errors, setErrors] = useState({
        taxValue: '',
        discountValue: '',
        netUnit: ''
    });

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
                // Retail: check preserved original price
                return originalRetailPrice !== null && originalRetailPrice !== undefined && originalRetailPrice !== '' && Number(originalRetailPrice) !== 0;
            }
            const field = priceTypeFieldMap[option.id];
            const priceVal = product[field];
            return priceVal !== null && priceVal !== undefined && priceVal !== '' && Number(priceVal) !== 0;
        })
        .map((option) => ({
            value: option.id,
            label: option.name
        }));


    const defaultPriceTypeOption = productPriceTypeFilterOptions.find(
        opt => opt.value === (product.product_price_type ? Number(product.product_price_type) : null)
    ) || productPriceTypeFilterOptions[0];

    const [productPriceType, setProductPriceType] = useState(defaultPriceTypeOption || null);

    const onProductPriceTypeChange = (obj) => {
        setProductPriceType(obj);
        if (obj.value === 1) {
            if (Number(originalRetailPrice) !== 0) {
                setNetUnit(parseFloat(Number(originalRetailPrice)).toFixed(decimalPlaces));
            }
        } else {
            const field = priceTypeFieldMap[obj.value];
            if (field) {
                const priceVal = product[field];
                if (priceVal !== null && priceVal !== undefined && priceVal !== '' && Number(priceVal) !== 0) {
                    setNetUnit(parseFloat(Number(priceVal)).toFixed(decimalPlaces));
                }
            }
        }
    };

    // tax type dropdown functionality
    const taxTypeFilterOptions = getFormattedOptions(taxMethodOptions)
    // discount type dropdown functionality
    const discountTypeFilterOptions = getFormattedOptions(discountMethodOptions)
    const [discountType, setDiscountType] = useState(product.discount_type);
    const onDiscountTypeChange = (obj) => {
        setDiscountType(obj);
    };

    useEffect(() => {
        setSelectedSaleUnit(productSales.length && productSales.filter((item) =>
            Number(item.id) === Number(product.sale_unit && product.sale_unit.value ? product.sale_unit.value : product.sale_unit)).map((item) => {
            return ({label: item.attributes.name, value: item.id})
        }))
        setProductUnit(product.sale_unit);
    }, [productSales]);

    const defaultTaxType = product.tax_type === '1' || product.tax_type === 1 ? {value: taxTypeFilterOptions[0].id, label: taxTypeFilterOptions[0].name} : {
        value: taxTypeFilterOptions[1].id, label: taxTypeFilterOptions[1].name
    }

    const defaultDiscountType = product.discount_type === '1' || product.discount_type === 1 ? {
        value: discountTypeFilterOptions[0].id,
        label: discountTypeFilterOptions[0].name
    } : {value: discountTypeFilterOptions[1].id, label: discountTypeFilterOptions[1].name}

    useEffect(() => {
        setProductModalData(product);
         setNetUnit(netUnit ? parseFloat(netUnit).toFixed(decimalPlaces) : parseFloat(product.fix_net_unit.toFixed(decimalPlaces)));
         setTaxValue(product.tax_value ? parseFloat(product.tax_value).toFixed(decimalPlaces) : parseFloat(0).toFixed(decimalPlaces))
        setTaxType(product.tax_type === '1' || product.tax_type === 1 ? {value: taxTypeFilterOptions[0].id, label: taxTypeFilterOptions[0].name} : {
            value: taxTypeFilterOptions[1].id, label: taxTypeFilterOptions[1].name
        });
        setDiscountValue(product.discount_value ? parseFloat(product.discount_value).toFixed(decimalPlaces) : parseFloat(0).toFixed(decimalPlaces))
        setDiscountType(product.discount_type === '1' || product.discount_type === 1 ? {
            value: 1,
            label: getFormattedMessage('discount-type.filter.percentage.label')
        } : {value: 2, label: getFormattedMessage('discount-type.filter.fixed.label')});
        // Re-determine available price type options and default selection when product changes
        const availableOption = productPriceTypeFilterOptions.find(
            opt => opt.value === (product.product_price_type ? Number(product.product_price_type) : null)
        ) || productPriceTypeFilterOptions[0];
        setProductPriceType(availableOption || null);
        product.sub_total = Number(subTotalCount(product))
    }, [productModalData]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (taxValue > 100) {
            errorss['taxValue'] = getFormattedMessage('globally.tax-length.validate.label');
        } else if (discountType.value === 1 && Number(discountValue) > 100) {
            errorss['discountValue'] = getFormattedMessage('globally.discount-length.validate.label');
        } else if (discountType.value === 2 && Number(discountValue) >= netUnit) {
            errorss['discountValue'] = getFormattedMessage('globally.discount-price-length.validate.label');
        } else if (netUnit === null) {
            errorss['netUnit'] = getFormattedMessage('globally.require-input.validate.label');
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onChangePrice = (e) => {
        const value = e.target.value;

        // allow clearing
        if (value === '') {
            setNetUnit(value);
            return;
        }

        // only digits + ONE decimal
        if (!/^\d*\.?\d*$/.test(value)) return;

        // decimal places limit
        const parts = value.split('.');
        if (parts[1]?.length > decimalPlaces) return;

        setNetUnit(value);

        const typedPrice = Number(value);
        if (isNaN(typedPrice)) return;

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

    const onTaxTypeChange = (obj) => {
        setTaxType(obj);
    };

    const onChangeTax = (e) => {
      const value = e.target?.value ?? parseFloat(0).toFixed(decimalPlaces);

        if (value === '') {
            setTaxValue(value);
            setErrors('');
            return;
        }
        if (!/^\d*\.?\d*$/.test(value)) return;

        const parts = value.split('.');
        if (parts[1]?.length > decimalPlaces) return;

        if (parseFloat(value) > 100) return;

        setTaxValue(value);
        setErrors('');
    };



    const onChangeDiscount = (e) => {
        const value = e.target?.value ?? parseFloat(0).toFixed(decimalPlaces);

        if (value === '') {
            setDiscountValue(value);
            setErrors('');
            return;
        }
         if (!/^\d*\.?\d*$/.test(value)) return;

        const parts = value.split('.');
        if (parts[1]?.length > decimalPlaces) return;

        // % discount must not exceed 100
        if (discountType?.value === 1 && parseFloat(value) > 100) return;
         setDiscountValue(value);
         setErrors('')
    }

    const onSaleUnitChange = (newlySelectedUnit) => {
        setProductUnit(newlySelectedUnit)
        setSelectedSaleUnit(newlySelectedUnit)
    };

    const onSaveDetailModal = (e) => {
        e.preventDefault();
        const valid = handleValidation();
        if (valid) {
            const newProduct = product;
            newProduct.original_product_price = originalRetailPrice;
            newProduct.product_price = Number(netUnit);
            newProduct.fix_net_unit = Number(netUnit);
            newProduct.product_price_type = productPriceType ? productPriceType.value : null;
            newProduct.net_unit_price = amountBeforeTax(product);
            newProduct.tax_type = taxType.value.toString();
            newProduct.tax_value = Number(taxValue);
            newProduct.tax_amount = taxAmountMultiply(product);
            newProduct.discount_type = discountType.value.toString();
            newProduct.discount_value = Number(discountValue);
            newProduct.discount_amount = discountAmountMultiply(product);
            newProduct.sub_total = subTotalCount(product);
            if (productUnit) {
                newProduct.sale_unit = productUnit.value ? productUnit.value : productUnit;
            }
            onProductUpdateInCart(newProduct);
            setIsShowModal(false);
            setErrors('')
            updateCost(newProduct.net_unit_price = amountBeforeTax(product))
            updateTax(newProduct.tax_value = taxValue)
            updateDiscount(newProduct.discount_value = discountValue)
            updateSaleUnit(newProduct.sale_unit = productUnit.value ? productUnit.value : productUnit)
            updateSubTotal(subTotalCount(product))
        }
    };

    const clearField = () => {
        setIsShowModal(!isShowModal);
        setErrors('');
    };

    return (
        <Modal show={isShowModal} onHide={clearField} keyboard={true}>
            <Form onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    onSaveDetailModal(e)
                }
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{product.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pb-3'>
                    <Row>
                        {productPriceTypeFilterOptions.length > 1 && (
                        <div className='col-md-12 mb-5'>
                            <ReactSelect title={getFormattedMessage('product.input.product-price-type.label')}
                                         data={productPriceTypeFilterOptions}
                                         onChange={onProductPriceTypeChange}
                                         errors={''}
                                         value={productPriceType}
                                         placeholder={placeholderText('product.input.product-price-type.placeholder')}
                            />
                        </div>
                        )}
                        <div className='col-md-12 mb-5'>
                            <label className='form-label'>
                                {getFormattedMessage('product.input.product-price.label')}:
                            </label>
                            <span className='required'/>
                            <InputGroup>
                                <input type='text' name='product_price' className='form-control'
                                              onKeyPress={(event) => decimalValidate(event)}
                                              onChange={onChangePrice} value={netUnit}
                                              placeholder={placeholderText('product.input.product-price.placeholder.label')}
                                              readOnly={productPriceType ? productPriceType.value !== 4 : true}
                                />
                                <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                            </InputGroup>
                            <span
                                className='text-danger d-block fw-400 fs-small mt-2'>{errors['netUnit'] ? errors['netUnit'] : null}</span>
                        </div>
                        <div className='col-md-12 mb-5'>
                            {defaultTaxType && <ReactSelect title={getFormattedMessage('product.input.tax-type.label')}
                                                            multiLanguageOption={taxTypeFilterOptions}
                                                            onChange={onTaxTypeChange} errors={''}
                                                            defaultValue={defaultTaxType}
                                                            placeholder={placeholderText("product.input.tax-type.placeholder.label")}
                            />}
                        </div>
                        <div className='col-md-12 mb-5'>
                            <label className='form-label'>
                                {getFormattedMessage('purchase.input.order-tax.label')}:
                            </label>
                            <InputGroup>
                                <input type='text' name='taxValue' className='form-control'
                                              value={taxValue} onKeyPress={(event) => decimalValidate(event)}
                                              onChange={onChangeTax}/>
                                <InputGroup.Text>%</InputGroup.Text>
                            </InputGroup>
                            <span
                                className='text-danger d-block fw-400 fs-small mt-2'>{errors['taxValue'] ? errors['taxValue'] : null}</span>
                        </div>
                        <div className='col-md-12 mb-5'>
                            <ReactSelect  title={getFormattedMessage('purchase.product-modal.select.discount-type.label')}
                                    multiLanguageOption={discountTypeFilterOptions} onChange={onDiscountTypeChange} errors={''}
                                    defaultValue={defaultDiscountType}
                                    placeholder={placeholderText("pos-sale.select.discount-type.placeholder")}
                            />
                        </div>
                        <div className='col-md-12 mb-5'>
                            <label
                                className='form-label'>{getFormattedMessage('purchase.order-item.table.discount.column.label')}:</label>
                            <span className='required'/>
                            <input type='text' name='discountValue' className='form-control'
                                          onChange={onChangeDiscount}
                                          onKeyPress={(event) => decimalValidate(event)} value={discountValue}/>
                            <span
                                className='text-danger d-block fw-400 fs-small mt-2'>{errors['discountValue'] ? errors['discountValue'] : null}</span>
                        </div>
                        {product.newItem !== '' &&
                        <div className='col-md-12 mb-5'>
                            <ReactSelect title={getFormattedMessage('product.input.sale-unit.label')}
                                         defaultValue={selectedSaleUnit} value={selectedSaleUnit}
                                         data={productSales} onChange={onSaleUnitChange} errors={''}
                                         placeholder={placeholderText("product.input.sale-unit.placeholder.label")}
                            />
                        </div>
                        }
                    </Row>
                </Modal.Body>
                <Modal.Footer children='justify-content-start' className='pt-0'>
                    <div className='d-flex'>
                        <Button className='btn btn-primary me-2' type='submit'
                                onClick={(e) => onSaveDetailModal(e)}>
                            {getFormattedMessage('globally.save-btn')}
                        </Button>
                        <Button onClick={(e) => {
                            e.stopPropagation();
                            setIsShowModal(false)
                        }}
                                type='reset' variant='light' className='btn btn-secondary'>
                            {getFormattedMessage('globally.cancel-btn')}
                        </Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    )
};

export default ProductModal;
