import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputGroup } from "react-bootstrap-v5";
import moment from "moment";
import { connect, useDispatch } from "react-redux";
import { fetchProductsByWarehouse } from "../../store/action/productAction";
import ProductRowTable from "../../shared/components/sales/ProductRowTable";
import {
    decimalValidate,
    getFormattedMessage,
    getDecimalPlaces,
    placeholderText,
    onFocusInput,
    getFormattedOptions,
    currencySymbolHandling,
} from "../../shared/sharedMethod";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import ProductMainCalculation from "../../components/sales/ProductMainCalculation";
import {
    calculateCartTotalAmount,
    calculateCartTotalTaxAmount,
} from "../../shared/calculation/calculation";
import { prepareSaleProductArray } from "../../shared/prepareArray/prepareSaleArray";
import ModelFooter from "../../shared/components/modelFooter";
import { editSaleReturn } from "../../store/action/salesReturnAction";
import { addToast } from "../../store/action/toastAction";
import { toastType } from "../../constants";
import { saleReturnStatusOptions } from "../../constants";
import ReactSelect from "../../shared/select/reactSelect";
import TabTitle from "../../shared/tab-title/TabTitle";
import useFiscalYearValidation from "../../utils/useFiscalYearValidation";

const SaleReturnForm = (props) => {
    const {
        addSaleData,
        editSaleReturn,
        id,
        singleSale,
        fetchProductsByWarehouse,
        frontSetting,
        allConfigData,
        isEdit,
        settings,
    } = props;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [updateProducts, setUpdateProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [newCost, setNewCost] = useState("");
    const [newDiscount, setNewDiscount] = useState("");
    const [newTax, setNewTax] = useState("");
    const [subTotal, setSubTotal] = useState("");
    const [newSaleUnit, setNewSaleUnit] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);
     const decimalPlaces = getDecimalPlaces(settings);
     const [Refundable, setRefundable] = useState(false);
     const [RefundableWalletBalance, setRefundableWalletBalance] = useState(0);
     const [updatedBalance, setUpdatedBalance] = useState(0);

     const isFiscalYearEnabled = parseInt(settings.attributes?.enable_fiscal_year_filter) === 1;
     const { validateDate: validateFiscalDate } = useFiscalYearValidation();
    
    const [saleReturnValue, setSaleReturnValue] = useState({
        date: new Date(),
        customer_id: "",
        warehouse_id: "",
        tax_rate: "0.00",
        tax_amount: "0.00",
        discount: "0.00",
        shipping: "0.00",
        grand_total: 0.0,
        notes: "",
        received_amount: 0,
        payment_type: 1,
        paid_amount: 0,
        status: "",
        sale_reference: "",
    });
    const [errors, setErrors] = useState({
        date: "",
        customer_id: "",
        warehouse_id: "",
        status: "",
    });
    const walletPayment = singleSale ? singleSale.payments?.filter((payment) => payment.payment_method && payment.payment_method.type == 1) : [];
    const walletAmount = walletPayment
    ? walletPayment.reduce((acc, payment) => acc + (payment?.amount || 0), 0)
    : singleSale?.wallet_payment_amount || 0;

    useEffect(()=>{
        if (Refundable) {
            setRefundableWalletBalance(
                (!isEdit) ? ((walletAmount < Number(calculateCartTotalAmount(updateProducts, saleReturnValue))) ? walletAmount : Number(calculateCartTotalAmount(updateProducts, saleReturnValue)).toFixed(decimalPlaces)) : (singleSale.refunded_amount == 0) ? (singleSale.wallet_payment_amount < Number(calculateCartTotalAmount(updateProducts, saleReturnValue)) ? singleSale.wallet_payment_amount : Number(calculateCartTotalAmount(updateProducts, saleReturnValue)).toFixed(decimalPlaces)) : singleSale.refunded_amount 
            );
        } else {
            setRefundableWalletBalance(0);
        }
    },[Refundable,updateProducts])

    useEffect(()=>{
        setUpdatedBalance(Number(singleSale?.wallet_amount) + (isEdit ? (RefundableWalletBalance > singleSale?.refunded_amount) ? (RefundableWalletBalance - singleSale?.refunded_amount) : (- (singleSale?.refunded_amount - RefundableWalletBalance)) :( Number(RefundableWalletBalance))))
    },[RefundableWalletBalance,singleSale])

    useEffect(() => {
        setUpdateProducts(updateProducts);
    }, [
        updateProducts,
        quantity,
        newCost,
        newDiscount,
        newTax,
        subTotal,
        newSaleUnit,
    ]);

    useEffect(() => {
        updateProducts.length >= 1
            ? dispatch({ type: "DISABLE_OPTION", payload: true })
            : dispatch({ type: "DISABLE_OPTION", payload: false });
    }, [updateProducts]);

    useEffect(() => {
        if (singleSale) {
            setSaleReturnValue({
                date: singleSale ? moment(singleSale.date).toDate() : "",
                customer_id: singleSale ? singleSale.customer_id : "",
                warehouse_id: singleSale ? singleSale.warehouse_id : "",
               tax_rate: singleSale ? parseFloat(singleSale.tax_rate).toFixed(decimalPlaces) : "0.00",
                tax_amount: singleSale
                    ? parseFloat(singleSale.tax_amount).toFixed(decimalPlaces)
                    : "0.00",
               discount: singleSale ? parseFloat(singleSale.discount).toFixed(decimalPlaces) : "0.00",
               shipping: singleSale ? parseFloat(singleSale.shipping).toFixed(decimalPlaces) : "0.00",
                grand_total: Number(
                    singleSale ? singleSale.grand_total : "0.00"
                ),
                status: singleSale
                    ? singleSale.status_id === 1
                        ? {
                              label: getFormattedMessage(
                                  "status.filter.received.label"
                              ),
                              value: 1,
                          }
                        : {
                              label: getFormattedMessage(
                                  "status.filter.pending.label"
                              ),
                              value: 2,
                          }
                    : "",
                notes: singleSale
                    ? singleSale.note === null
                        ? ""
                        : singleSale.note
                    : "",
                sale_id: singleSale ? singleSale.sale_id : "",
                sale_reference: singleSale ? singleSale.sale_reference : "",
            });
        }
    }, [singleSale]);

    useEffect(() => {
    if (singleSale?.refunded_amount && RefundableWalletBalance === 0) {
        setRefundableWalletBalance(singleSale.refunded_amount);
        setRefundable(true);
    }
}, [singleSale]);

    useEffect(() => {
        if (singleSale && !isInitialized) {
            setUpdateProducts(singleSale.sale_items);
            setIsInitialized(true);
        }
    }, [singleSale]);

    useEffect(() => {
        saleReturnValue.warehouse_id.value &&
            fetchProductsByWarehouse(saleReturnValue?.warehouse_id?.value);
    }, [saleReturnValue.warehouse_id.value]);

    const handleValidation = () => {
        let error = {};
        let isValid = false;

        // Check for products with quantity > 0
        const hasValidQuantity = updateProducts.some(
            (product) => product.quantity > 0
        );

        if (!saleReturnValue.date) {
            error["date"] = getFormattedMessage("globally.date.validate.label");
        } else if (validateFiscalDate(saleReturnValue.date)) {
            error["date"] = validateFiscalDate(saleReturnValue.date);
        } else if (!saleReturnValue.warehouse_id) {
            error["warehouse_id"] = getFormattedMessage(
                "product.input.warehouse.validate.label"
            );
        } else if (!saleReturnValue.customer_id) {
            error["customer_id"] = getFormattedMessage(
                "sale.select.customer.validate.label"
            );
        } else if (!hasValidQuantity) {
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "globally.product-quantity.validate.message"
                    ),
                    type: toastType.ERROR,
                })
            );
        } else if (updateProducts.length < 1) {
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "purchase.product-list.validate.message"
                    ),
                    type: toastType.ERROR,
                })
            );
        } else if (!saleReturnValue.status) {
            error["status"] = getFormattedMessage(
                "globally.status.validate.label"
            );
        } else {
            isValid = true;
        }

        setErrors(error);
        return isValid;
    };

    const updatedQty = (qty) => {
        setQuantity(qty);
    };

    const updateCost = (cost) => {
        setNewCost(cost);
    };

    const updateDiscount = (discount) => {
        setNewDiscount(discount);
    };

    const updateTax = (tax) => {
        setNewTax(tax);
    };

    const updateSubTotal = (subTotal) => {
        setSubTotal(subTotal);
    };

    const updateSaleUnit = (saleUnit) => {
        setNewSaleUnit(saleUnit);
    };

    const handleCallback = (date) => {
        setSaleReturnValue((previousState) => {
            return { ...previousState, date: date };
        });
        const fiscalError = validateFiscalDate(date);
        if (fiscalError) {
            setErrors({ date: fiscalError });
        } else {
            setErrors("");
        }
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;

        // Allow clearing the input
        if (value === '') {
            setSaleReturnValue(inputs => ({
                ...inputs,
                [name]: value,
            }));
            return;
        }
        
        // Allow only digits with ONE decimal point
        if (!/^\d*\.?\d*$/.test(value)) return;

        // Enforce decimal places
        const parts = value.split('.');
        if (parts[1]?.length > decimalPlaces) return;

        setSaleReturnValue(inputs => ({
            ...inputs,
          [e.target.name]: value && value,
          [name]: value,
        }));
    };

    const onStatusChange = (obj) => {
        setSaleReturnValue((inputs) => ({ ...inputs, status: obj }));
    };

    const prepareFormData = (prepareData) => {
        const formValue = {
            date: moment(prepareData.date).locale('en').toDate(),
            customer_id: prepareData.customer_id.value
                ? prepareData.customer_id.value
                : prepareData.customer_id,
            warehouse_id: prepareData.warehouse_id.value
                ? prepareData.warehouse_id.value
                : prepareData.warehouse_id,
            discount: prepareData.discount,
            tax_rate: prepareData.tax_rate,
            tax_amount: calculateCartTotalTaxAmount(
                updateProducts,
                saleReturnValue
            ),
            sale_return_items: updateProducts,
            shipping: prepareData.shipping,
            grand_total: Number(
                calculateCartTotalAmount(updateProducts, saleReturnValue)
            ),
            received_amount: 0,
            payment_type: null,
            paid_amount: 0,
            status: prepareData.status.value,
            note: prepareData.notes,
            sale_id: prepareData.sale_id,
            sale_reference: prepareData.sale_reference,
            wallet_refund_amount: Refundable ? RefundableWalletBalance : 0,
            is_wallet_refund: Refundable,
        };
        return formValue;
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            if (singleSale.isCreateSaleReturn) {
                addSaleData(prepareFormData(saleReturnValue), navigate);
            } else {
                editSaleReturn(id, prepareFormData(saleReturnValue), navigate);
                setSaleReturnValue(saleReturnValue);
            }
        }
    };

    const onNotesChangeInput = (e) => {
        e.preventDefault();
        setSaleReturnValue((inputs) => ({ ...inputs, notes: e.target.value }));
    };

    const onBlurInput = (el) => {
        if (el.target.value === "") {
            if (el.target.name === "shipping") {
                setSaleReturnValue({ ...saleReturnValue, shipping: "0.00" });
            }
            if (el.target.name === "discount") {
                setSaleReturnValue({ ...saleReturnValue, discount: "0.00" });
            }
            if (el.target.name === "tax_rate") {
                setSaleReturnValue({ ...saleReturnValue, tax_rate: "0.00" });
            }
        }
    };

    const saleReturnStatusFilterOptions = getFormattedOptions(
        saleReturnStatusOptions
    );
    const saleReturnStatusDefaultValue = saleReturnStatusFilterOptions.map(
        (option) => {
            return {
                value: option.id,
                label: option.name,
            };
        }
    );

    return (
        <div className="card">
            <TabTitle title={placeholderText(isEdit ? "sale-return.edit.title" : "sale-return.create.title")} />
            <div className="card-body">
                {/*<Form>*/}
                <div className="row">
                    <div className="col-md-4">
                        <label className="form-label">
                            {getFormattedMessage(
                                "react-data-table.date.column.label"
                            )}
                            :
                        </label>
                        <span className="required" />
                        <div className="position-relative">
                            <ReactDatePicker
                                onChangeDate={handleCallback}
                                {...(!isFiscalYearEnabled && { newStartDate: saleReturnValue.date })} FixedFiscalYearDate={true}
                            />
                        </div>
                        <span className="text-danger d-block fw-400 fs-small mt-2">
                            {errors["date"] ? errors["date"] : null}
                        </span>
                    </div>
                    <div className="col-md-4 mb-5">
                        <label className="form-label">
                            {getFormattedMessage("sale-reference.title")}:
                            {/* Sale Reference */}
                        </label>
                        <span className="required" />
                        <input
                            type="type"
                            name="title"
                            className="form-control"
                            // onChange={(e) => onChangeInput(e)}
                            readOnly={true}
                            value={saleReturnValue.sale_reference}
                        />
                        <span className="text-danger d-block fw-400 fs-small mt-2">
                            {errors["title"] ? errors["title"] : null}
                        </span>
                    </div>
                    <div className="col-md-4 mb-5">
                        <label className="form-label">
                            {getFormattedMessage(
                                "purchase.select.status.label"
                            )}
                            :{" "}
                        </label>
                        <span className="required" />
                        <ReactSelect
                            multiLanguageOption={saleReturnStatusFilterOptions}
                            name="status"
                            value={saleReturnValue.status}
                            isRequired
                            placeholder={placeholderText(
                                "purchase.select.status.placeholder.label"
                            )}
                            defaultValue={saleReturnStatusDefaultValue[0]}
                            onChange={onStatusChange}
                        />
                        <span className="text-danger d-block fw-400 fs-small mt-2">
                            {errors["status"] ? errors["status"] : null}
                        </span>
                    </div>
                    <div>
                        <label className="form-label">
                            {getFormattedMessage(
                                "purchase.order-item.table.label"
                            )}
                            :
                        </label>
                        <span className="required" />
                        <ProductRowTable
                            updateProducts={updateProducts}
                            setUpdateProducts={setUpdateProducts}
                            updatedQty={updatedQty}
                            frontSetting={frontSetting}
                            isSaleReturn={true}
                            updateCost={updateCost}
                            updateDiscount={updateDiscount}
                            updateTax={updateTax}
                            updateSubTotal={updateSubTotal}
                            updateSaleUnit={updateSaleUnit}
                        />
                    </div>
                    <div className="col-12">
                        <ProductMainCalculation
                            inputValues={saleReturnValue}
                            updateProducts={updateProducts}
                            frontSetting={frontSetting}
                            allConfigData={allConfigData}
                        />
                    </div>
                    {(walletPayment?.length > 0 || singleSale?.wallet_payment_amount > 0) && (
                        <div className="col-12 mb-3">
                            <div className="card border-0 shadow-sm p-3 rounded-3">

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="useWalletCheckbox"
                                            checked={Refundable}
                                            onChange={() => setRefundable(!Refundable)}
                                        />
                                        <label className="form-check-label fw-semibold" htmlFor="useWalletCheckbox">
                                            {getFormattedMessage("refund.wallet.balance.title")}
                                        </label>
                                    </div>
                                    <span className="rounded-3 border px-2">
                                        {getFormattedMessage("wallet.used.in.this.sale.title")} :  {currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,walletAmount)}
                                    </span>
                                </div>

                                {Refundable && (
                                    <div className="mt-3 small">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{getFormattedMessage("current.wallet.balance.title")}:</span>
                                            <span className="fw-semibold text-primary">
                                                {currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,singleSale.wallet_amount)}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{isEdit ? getFormattedMessage("refunded.wallet.amount.title") : getFormattedMessage("refundable.amount.title")}:</span>
                                            <span className="fw-semibold text-primary">
                                                {currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,isEdit ? (singleSale.refunded_amount) :  (RefundableWalletBalance))}
                                            </span>
                                        </div>
                                        
                                        {( (isEdit) && (parseFloat(RefundableWalletBalance) !== parseFloat(singleSale.refunded_amount))) && <div className="d-flex justify-content-between mb-1">
                                            <span>{( RefundableWalletBalance > singleSale.refunded_amount ) ? getFormattedMessage("amount.to.be.refunded.title") : getFormattedMessage("amount.to.be.debited.title")}:</span>
                                            <span className={`fw-semibold ${RefundableWalletBalance > singleSale.refunded_amount ? 'text-success' : 'text-danger'}`}>
                                                 {(RefundableWalletBalance > singleSale.refunded_amount) ? ` + ${currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,(RefundableWalletBalance - singleSale.refunded_amount))}`: ` - ${currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,(singleSale.refunded_amount - RefundableWalletBalance))}`}
                                            </span>
                                        </div>}

                                        <hr className="my-2" />

                                        <div className="d-flex justify-content-between">
                                            <span>{getFormattedMessage("updated.wallet.balance.title")}:</span>
                                            <span className={`fw-bold ${updatedBalance > 0 ? 'text-success' : 'text-danger'}`}>
                                                {currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,updatedBalance)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {((walletPayment?.length > 0 && Refundable) || (singleSale?.wallet_payment_amount > 0 && Refundable)) && <div className="col-md-3 mb-5">
                        <label className="form-label">
                            {getFormattedMessage(
                                "refundable.wallet.balance.title"
                            )}
                            :{" "}
                        </label>
                        <InputGroup>
                            <input
                                aria-label="Dollar amount"
                                className="form-control"
                                type="text"
                                name="Wallet_Balance"
                                value={RefundableWalletBalance}
                                onBlur={(event) => onBlurInput(event)}
                                onFocus={(event) => onFocusInput(event, decimalPlaces)}
                                onKeyPress={(event) => {
                                    decimalValidate(event);
                                }}
                                onChange={(e) => {
                                    let value = Number(e.target.value);
                        
                                    const maxTotal = Number(calculateCartTotalAmount(updateProducts, saleReturnValue) || 0);
                                    let target_amount = (walletAmount < maxTotal) ? walletAmount : maxTotal;
                                    if (value < 0) value = 0;
                                    if (value > target_amount) value = target_amount;
                                    setRefundableWalletBalance(value);
                                }}
                            />
                            <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                        </InputGroup>
                    </div>}
                    <div className={`${Refundable ? 'col-md-3' : 'col-md-4'} mb-5`}>
                        <label className="form-label">
                            {getFormattedMessage(
                                "purchase.input.order-tax.label"
                            )}
                            :{" "}
                        </label>
                        <InputGroup>
                            <input
                                aria-label="Dollar amount"
                                className="form-control"
                                type="text"
                                name="tax_rate"
                                value={saleReturnValue.tax_rate}
                                onBlur={(event) => onBlurInput(event)}
                                onFocus={(event) => onFocusInput(event, decimalPlaces)}
                                onKeyPress={(event) => {
                                    decimalValidate(event);
                                }}
                                onChange={(e) => {
                                    onChangeInput(e);
                                }}
                            />
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className={`${Refundable ? 'col-md-3' : 'col-md-4'} mb-5`}>
                        <label className="form-label">
                            {getFormattedMessage(
                                "purchase.order-item.table.discount.column.label"
                            )}
                            :{" "}
                        </label>
                        <InputGroup>
                            <input
                                aria-label="Dollar amount"
                                className="form-control"
                                type="text"
                                name="discount"
                                value={saleReturnValue.discount}
                                onBlur={(event) => onBlurInput(event)}
                                 onFocus={(event) => onFocusInput(event, decimalPlaces)}
                                onKeyPress={(event) => decimalValidate(event)}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <InputGroup.Text>
                                {frontSetting.value &&
                                    frontSetting.value.currency_symbol}
                            </InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className={`${Refundable ? 'col-md-3' : 'col-md-4'} mb-5`}>
                        <label className="form-label">
                            {getFormattedMessage(
                                "purchase.input.shipping.label"
                            )}
                            :{" "}
                        </label>
                        <InputGroup>
                            <input
                                aria-label="Dollar amount"
                                className="form-control"
                                type="text"
                                name="shipping"
                                value={saleReturnValue.shipping}
                                onBlur={(event) => onBlurInput(event)}
                                onFocus={(event) => onFocusInput(event, decimalPlaces)}
                                onKeyPress={(event) => decimalValidate(event)}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <InputGroup.Text>
                                {frontSetting.value &&
                                    frontSetting.value.currency_symbol}
                            </InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className="mb-5">
                        <label className="form-label">
                            {getFormattedMessage("globally.input.notes.label")}:{" "}
                        </label>
                        <textarea
                            name="notes"
                            className="form-control"
                            onChange={(e) => onNotesChangeInput(e)}
                            value={saleReturnValue.notes}
                            placeholder={placeholderText(
                                "globally.input.notes.placeholder.label"
                            )}
                        />
                    </div>
                    <ModelFooter
                        onEditRecord={singleSale}
                        onSubmit={onSubmit}
                        link={
                            singleSale?.isCreateSaleReturn === true ||
                            isEdit === true
                                ? "/app/sales"
                                : "/app/sale-return"
                        }
                    />
                </div>
                {/*</Form>*/}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { purchaseProducts, products, frontSetting, allConfigData , settings} = state;
    return {
        customProducts: prepareSaleProductArray(products),
        purchaseProducts,
        products,
        frontSetting,
        allConfigData,
        settings
    };
};

export default connect(mapStateToProps, {
    editSaleReturn,
    fetchProductsByWarehouse,
})(SaleReturnForm);