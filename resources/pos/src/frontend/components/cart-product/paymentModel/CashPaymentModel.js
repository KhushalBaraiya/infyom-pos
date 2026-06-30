import React, { useEffect, useState } from "react";
import { Modal, Form, Table } from "react-bootstrap";
import {
    currencySymbolHandling,
    decimalValidate,
    getFormattedMessage,
    getFormattedOptions,
    numFloatValidate,
    placeholderText,
} from "../../../../shared/sharedMethod";
import ReactSelect from "../../../../shared/select/reactSelect";
import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import { addToast } from "../../../../store/action/toastAction";
import { paymentStatusOptionsConstant, salePaymentStatusOptions, toastType } from "../../../../constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const CashPaymentModel = (props) => {
    const {
        handleCashPayment,
        cashPaymentValue,
        onPaymentStatusChange,
        cashPayment,
        onChangeInput,
        onCashPayment,
        grandTotal,
        totalQty,
        cartItemValue,
        taxTotal,
        settings,
        subTotal,
        errors,
        paymentTypeFilterOptions,
        allConfigData,
        onChangeReturnChange,
        handlePaymentDetailChange,
        handleAddPayment,
        handleRemovePayment,
        decimalPlaces,
        isWalletBalance,
        setisWalletBalance,
        walletBalance,
        walletBalanceUsed,
        selectedCustomer,
        walletpaymentMethod,
        setWalletBalanceUsed
    } = props;

    const [summation, setSummation] = useState(0);
    const [remainingWalletBalance, setRemainingWalletBalance] = useState(walletBalance);
    const [dynamicWalletAmountUsed, setDynamicWalletAmountUsed] = useState(0);
    const dispatch = useDispatch();
    const intl = useIntl();

    useEffect(() => {
        if (cashPaymentValue?.payment_status?.value === paymentStatusOptionsConstant.PAID || cashPaymentValue?.payment_status?.value === paymentStatusOptionsConstant.PARTIAL) {
            let totalCashReceived = cashPaymentValue.payment_details?.reduce((sum, payment) => {
                const amount = parseFloat(payment.amount) || 0;
                return sum + Math.max(0, amount);
            }, 0) || 0;
            

            const walletAmountUsed = cashPaymentValue.payment_details?.reduce((sum, payment) => {
                if (payment.payment_type?.value === walletpaymentMethod[0]?.attributes?.label || payment.payment_type === walletpaymentMethod[0]?.attributes?.label || 
                    payment.payment_type?.label?.toLowerCase() === walletpaymentMethod[0]?.attributes?.label || 
                    payment.payment_type?.label?.toLowerCase() === walletpaymentMethod[0]?.attributes?.label?.toLowerCase()) {
                    return sum + (parseFloat(payment.amount) || 0);
                }
                return sum;
            }, 0) || 0;
            

            
            const totalToPayWithCash = Math.max(0, Number(grandTotal) - Number(walletAmountUsed));
            
           
            const calculatedChange = Number(totalCashReceived) - Number(totalToPayWithCash);
            setSummation(calculatedChange);
        } else {

            if (cashPaymentValue.received_amount !== undefined) {
                const received = Number(parseFloat(cashPaymentValue.received_amount)) || 0;
                setSummation(received - Number(grandTotal));
            }
        }
    }, [cashPaymentValue.received_amount, cashPaymentValue.payment_details, grandTotal, isWalletBalance, walletBalanceUsed, cashPaymentValue?.payment_status?.value]);

    useEffect(() => {
        onChangeReturnChange(summation);
    }, [summation]);

    useEffect(() => {
        if (isWalletBalance && cashPaymentValue.payment_details) {
            const walletAmountUsed = cashPaymentValue.payment_details?.reduce((sum, payment) => {
                if (payment.payment_type?.value === walletpaymentMethod[0]?.id || payment.payment_type === walletpaymentMethod[0]?.attributes?.name || 
                    payment.payment_type?.label?.toLowerCase() === walletpaymentMethod[0]?.attributes?.name ){
                    return sum + (parseFloat(payment.amount) || 0);
                }
                return sum;
            }, 0) || 0;
            
            setDynamicWalletAmountUsed(walletAmountUsed);
            
            const remaining = Math.max(0, Number(walletBalance) - Number(walletAmountUsed));
            setRemainingWalletBalance(remaining);
        } else {

            setRemainingWalletBalance(walletBalance);
            setDynamicWalletAmountUsed(0);
        }
    }, [cashPaymentValue.payment_details, isWalletBalance, walletBalance]);

    const validatePaymentDetails = () => {
        const paymentErrors = [];
        let totalAmount = 0;
        const isMultiplePayments = cashPaymentValue.payment_details?.length > 1;
        
        const totalAmounts = cashPaymentValue.payment_details?.reduce((sum, item) => {
               
                if (item.payment_type?.value === walletpaymentMethod[0]?.attributes?.name || item.payment_type === walletpaymentMethod[0]?.attributes?.name || 
                    item.payment_type?.label?.toLowerCase() === walletpaymentMethod[0]?.attributes?.name || 
                    item.payment_type?.label?.toLowerCase() === walletpaymentMethod[0]?.attributes?.name?.toLowerCase()) {
                    return sum;
                }
                const amount = parseFloat(item.amount)?.toFixed(decimalPlaces);
                return !isNaN(amount) && amount > 0 ? sum + amount : sum;
            }, 0) || 0;

        cashPaymentValue.payment_details?.forEach((item, index) => {
            const entryError = {};
            
            // Skip validation for wallet payments
            if (item.payment_type?.value === walletpaymentMethod[0]?.attributes?.name || item.payment_type === walletpaymentMethod[0]?.attributes?.name || 
                item.payment_type?.label?.toLowerCase() === walletpaymentMethod[0]?.attributes?.name || 
                item.payment_type?.label?.toLowerCase() === walletpaymentMethod[0]?.attributes?.name.toLowerCase()) {
                paymentErrors.push({});
                return;
            }

            // Only validate payment methods with actual amounts > 0
            const amount = parseFloat(item.amount) || 0;
            if (amount > 0) {
                if (!item.payment_type || !item.payment_type.value) {
                    entryError.payment_type = intl.formatMessage({
                        id: 'globally.payment.type.validate.label',
                        defaultMessage: 'Please select payment type',
                    });
                } else {
                    totalAmount += amount;
                }
                
                // Validate amount exceeds total only for non-zero amounts
                if (totalAmounts > grandTotal) {
                    entryError.amount = intl.formatMessage({
                        id: 'pos.payment.amount.exceeds.total.error',
                        defaultMessage: 'Payment amount cannot exceed the total amount',
                    });
                }
            }
            // Skip validation for zero amounts - they're optional

            paymentErrors.push(entryError);
        });

        return paymentErrors;
    };

    const paymentStatusFilterOptions = getFormattedOptions(
        salePaymentStatusOptions
    );
    const paymentStatusDefaultValue = paymentStatusFilterOptions.map(
        (option) => {
            return {
                value: option.id,
                label: option.name,
            };
        }
    );
    
    const handleSave = (event, shouldPrint = false) => {
        if (
            cashPaymentValue?.payment_status?.value === paymentStatusOptionsConstant.PAID ||
            cashPaymentValue?.payment_status?.value === paymentStatusOptionsConstant.PARTIAL
        ) {
            const { paymentErrors } = validatePaymentDetails();

            const hasErrors = paymentErrors?.some(error => Object.keys(error).length > 0);
            if (hasErrors) {
                paymentErrors.forEach((error, index) => {
                    const errorFields = Object.entries(error);
                    errorFields.forEach(([field, message]) => {
                        dispatch(
                            addToast({
                                text: `Payment ${index + 1} - ${message}`,
                                type: toastType.ERROR,
                            })
                        );
                    });
                });
                return;
            }
        }

        onCashPayment(event, shouldPrint,dynamicWalletAmountUsed);

        
    };
    return (
        <Modal
            show={cashPayment}
            onHide={handleCashPayment}
            size="xl"
            className="pos-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {getFormattedMessage("pos-make-Payment.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    <div className="col-lg-8 col-12">
                        <div className="row">
                          {((cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PAID || cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PARTIAL) && selectedCustomer?.attributes && selectedCustomer?.attributes?.wallet_amount > 0) && <div className="wallet-points-selection d-flex align-items-center justify-content-between px-4">
                            <label className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label">
                                <input
                                    type="checkbox"
                                    name="use_wallet_points_checkbox"
                                    className="me-3 form-check-input cursor-pointer"
                                    checked={isWalletBalance}
                                    onChange={()=>setisWalletBalance(!isWalletBalance)}
                                />
                                <div className="control__indicator" />{" "}
                               {getFormattedMessage("use.wallet.balance.title")}
                            </label>
                            <div className="wallet-points-count h-75 px-5 py-1 rounded-3 border d-flex justify-content-center align-items-center me-12">
                             {getFormattedMessage("available.wallet.balance.title")} : {remainingWalletBalance.toFixed(2)}
                            </div>
                            </div>}
                            {(cashPaymentValue?.payment_status?.value === 1 ||
                                cashPaymentValue?.payment_status?.value ===
                                    3) && (
                                <div className="col-md-12">
                                    {cashPaymentValue?.payment_details?.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                className="row mb-3"
                                            >
                                                <div className="col-md-5">
                                                    <label className="form-label">
                                                        {getFormattedMessage(
                                                            "expense.input.amount.label"
                                                        )}
                                                        :
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="amount"
                                                        value={item.amount}
                                                        placeholder={placeholderText(
                                                            "expense.input.amount.placeholder.label"
                                                        )}
                                                        onKeyPress={(event) =>
                                                            decimalValidate(
                                                                event
                                                            )
                                                        }
                                                        onChange={(e) =>
                                                            handlePaymentDetailChange(
                                                                index,
                                                                "amount",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.payment_details?.[
                                                        index
                                                    ]?.amount && (
                                                        <span className="text-danger">
                                                            {
                                                                errors
                                                                    .payment_details[
                                                                    index
                                                                ].amount
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="col-md-5">
                                                    <ReactSelect
                                                        data={
                                                            paymentTypeFilterOptions
                                                        }
                                                        isdisabled={item.payment_type?.label == walletpaymentMethod[0]?.attributes?.name }
                                                        onChange={(value) =>
                                                            handlePaymentDetailChange(
                                                                index,
                                                                "payment_type",
                                                                value
                                                            )
                                                        }
                                                        defaultValue={
                                                            item.payment_type
                                                        }
                                                        value={
                                                            item.payment_type
                                                        }
                                                        title={getFormattedMessage(
                                                            "select.payment-type.label"
                                                        )}
                                                        placeholder={placeholderText(
                                                            "sale.select.payment-type.placeholder"
                                                        )}
                                                    />
                                                    {errors.payment_details?.[
                                                        index
                                                    ]?.payment_type && (
                                                        <span className="text-danger">
                                                            {
                                                                errors
                                                                    .payment_details[
                                                                    index
                                                                ].payment_type
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="col-md-2">
                                                    <div className="d-flex gap-2 pt-5 mt-2">
                                                        {cashPaymentValue
                                                            .payment_details
                                                            .length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger py-2 px-3"
                                                                    onClick={() =>
                                                                        handleRemovePayment(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faTrash}
                                                                    />
                                                                </button>
                                                            )}
                                                        {index ===
                                                            cashPaymentValue
                                                                .payment_details
                                                                .length -
                                                            1 && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-secondary py-2 px-3"
                                                                    onClick={
                                                                        handleAddPayment
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faPlus}
                                                                    />
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                            <Form.Group
                                className="mb-3 col-12"
                                controlId="formBasicNotes"
                            >
                                <Form.Label>
                                    {getFormattedMessage(
                                        "globally.input.notes.label"
                                    )}
                                    :{" "}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    className="form-control-solid"
                                    name="notes"
                                    rows={3}
                                    onChange={(e) => onChangeInput(e)}
                                    placeholder={placeholderText(
                                        "globally.input.notes.placeholder.label"
                                    )}
                                    value={cashPaymentValue.notes}
                                />
                                <span className="text-danger">
                                    {errors["notes"] ? errors["notes"] : null}
                                </span>
                            </Form.Group>
                            <Form.Group
                                className="mb-3 col-12"
                                controlId="formBasicPaymentStatus"
                            >
                                <ReactSelect
                                    multiLanguageOption={
                                        paymentStatusFilterOptions
                                    }
                                    onChange={onPaymentStatusChange}
                                    name="payment_status"
                                    title={getFormattedMessage(
                                        "dashboard.recentSales.paymentStatus.label"
                                    )}
                                    value={cashPaymentValue.payment_status}
                                    errors={errors["payment_status"]}
                                    defaultValue={paymentStatusDefaultValue[1]}
                                    placeholder={placeholderText(
                                        "sale.select.payment-status.placeholder"
                                    )}
                                />
                            </Form.Group>

                        </div>
                    </div>
                    <div className="col-lg-4 col-12">
                        <div className="card custom-cash-card">
                            <div className="card-body p-6">
                                <Table
                                    striped
                                    bordered
                                    hover
                                    className="mb-0 text-nowrap"
                                >
                                    <tbody>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "dashboard.recentSales.total-product.label"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                <span className="btn btn-primary cursor-default rounded-md total-qty-text d-flex align-items-center justify-content-center p-2">
                                                    {totalQty}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "pos-total-amount.title"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    subTotal ? subTotal : "0.00"
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "globally.detail.order.tax"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    taxTotal ? taxTotal : "0.00"
                                                )}{" "}
                                                (
                                                {cartItemValue.tax
                                                    ? parseFloat(
                                                          cartItemValue.tax
                                                      ).toFixed(2)
                                                    : "0.00"}{" "}
                                                %)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "purchase.order-item.table.discount.column.label"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    cartItemValue.discount
                                                        ? cartItemValue.discount
                                                        : "0.00"
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "purchase.input.shipping.label"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    cartItemValue.shipping
                                                        ? cartItemValue.shipping
                                                        : "0.00"
                                                )}
                                            </td>
                                        </tr>
                                        {isWalletBalance && <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage("wallet.balance.title")}
                                            </td>
                                            <td className="px-3">
                                             - {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    dynamicWalletAmountUsed
                                                )}
                                            </td>
                                        </tr>}
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "purchase.grant-total.label"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    grandTotal
                                                )}
                                            </td>
                                        </tr>
                                        {(cashPaymentValue?.payment_status?.value === paymentStatusOptionsConstant.PAID || cashPaymentValue?.payment_status?.value === paymentStatusOptionsConstant.PARTIAL) ?<tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "pos.change-return.label"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    Number(summation).toFixed(2)
                                                )}
                                            </td>
                                        </tr> : ''}
                                        {(cashPaymentValue?.payment_status?.value === paymentStatusOptionsConstant.UNPAID) ?<tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "globally.detail.due"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    grandTotal
                                                )}
                                            </td>
                                        </tr> : ''}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="mt-0">
                <button className="btn btn-primary" type="button" onClick={(e) => {handleSave(e); setisWalletBalance(false); setWalletBalanceUsed(0);}}>
                    {getFormattedMessage("globally.submit-btn")}
                </button>
                <button className="btn btn-primary" type="button" onClick={(e) => {handleSave(e, true); setisWalletBalance(false); setWalletBalanceUsed(0);}}>
                    {getFormattedMessage("globally.submit-and-print-button")}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary me-0"
                    onClick={() => {
                        setisWalletBalance(false);
                        handleCashPayment();
                    }}
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </button>
            </Modal.Footer>
        </Modal>
    );
};
export default CashPaymentModel;
