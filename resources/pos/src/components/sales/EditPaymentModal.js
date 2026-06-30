import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap-v5';
import {
    currencySymbolHandling,
    decimalValidate,
    getFormattedMessage,
    getFormattedOptions,
    placeholderText
} from "../../shared/sharedMethod";
import moment from 'moment';
import { Row } from "reactstrap";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import { paymentMethodOptions } from "../../constants";
import ReactSelect from "../../shared/select/reactSelect";
import ModelFooter from "../../shared/components/modelFooter";
import { useDispatch, useSelector } from "react-redux";
import { editSalePayment } from "../../store/action/salePaymentAction";
import { fetchPaymentMethods } from '../../store/action/paymentMethodAction';
import { fetchSales } from '../../store/action/salesAction';

const EditPaymentModal = (props) => {
    const { editSaleItem, isEditModalOpen, closeModal, createPaymentItem, frontSetting, allConfigData } = props;
    const dispatch = useDispatch()
    const { paymentMethods } = useSelector((state) => state);
    const walletpaymentMethod = paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1 && item.attributes.type == 1));
    const [paymentValue, setPaymentValue] = useState({
        amount_to_pay: "",
        payment_date: new Date(),
        payment_type: "",
        amount: "",
        paid_amount: '',
        payment_id: "",
        reference: ""
    })

    const [currentWalletAmount, setCurrentWalletAmount] = useState(0);
    const [useWallet, setUseWallet] = useState(false);
    const [Refundedamount, setRefundedamount] = useState(0);
    const [updateWalletAmount, setUpdateWalletAmount] = useState(0);
    const [remainingDebitable, setRemainingDebitable] = useState(0);
    const [totalWalletUsedAmount, setTotalWalletUsedAmount] = useState(0);
    const [debitableAmount, setDebitableAmount] = useState(0);

    useEffect(() => {
        if (editSaleItem) {
            setTotalWalletUsedAmount(0);
            setUseWallet(false);
            setDebitableAmount(0);
            const paymentType = paymentMethods.length > 0 && paymentMethods?.find((method) => method.id == editSaleItem?.payment_type);
            setPaymentValue({
                amount_to_pay: editSaleItem ? editSaleItem.received_amount : "",
                payment_type: {
                    value: paymentType ? paymentType.id : "",
                    label: paymentType ? paymentType.attributes.name : "",
                    type: paymentType ? paymentType.attributes.type : ""
                },
                payment_date: editSaleItem ? moment(editSaleItem.payment_date).toDate() : '',
                // paid_amount: payment_date ? payment_date.paid_amount === "0.00" ? createPaymentItem.grand_total : createPaymentItem.paid_amount : '',
                payment_id: editSaleItem ? editSaleItem.id : "",
                amount: editSaleItem ? editSaleItem.amount : "",
                reference: editSaleItem ? editSaleItem.reference === null ? "N/A" : editSaleItem.reference : "",
            });
            if (paymentType && paymentType.attributes) {
                if (paymentType.attributes.type == 1) {
                    setUseWallet(true);
                    setTotalWalletUsedAmount(editSaleItem.amount || 0);
                } else {
                    setUseWallet(false);
                }
            }
        }
    }, [editSaleItem, isEditModalOpen])

    useEffect(() => {
        if (isEditModalOpen) dispatch(fetchPaymentMethods());
        setCurrentWalletAmount(createPaymentItem?.customer_wallet_amount || 0)
        setUpdateWalletAmount(createPaymentItem?.customer_wallet_amount || 0);
    }, [isEditModalOpen]);


    useEffect(() => {
        let debitable_amount = debitableAmount;
        let refunded_amount = createPaymentItem?.wallet_refund_amount;
        let updated_wallet_amount = currentWalletAmount;
        if (useWallet) {
            const paymentType = paymentMethods.length > 0 && paymentMethods?.find((method) => method.id == editSaleItem?.payment_type);
            if (paymentType && paymentType.attributes && paymentType.attributes.type == 1) {
                if (editSaleItem.amount > paymentValue.amount) {
                    debitable_amount = editSaleItem.amount - paymentValue.amount;
                } else {
                    debitable_amount = - (paymentValue.amount - editSaleItem.amount);
                }
            } else {
                debitable_amount = -paymentValue.amount;
            }
        }
        let incrementAmount = debitable_amount;
        if (debitable_amount > 0) {
            if (refunded_amount > 0) {
                incrementAmount = debitable_amount - refunded_amount;
                refunded_amount = (refunded_amount - debitable_amount) < 0 ? 0 : (refunded_amount - debitable_amount);
            }
            if (incrementAmount > 0) {
                updated_wallet_amount = currentWalletAmount + incrementAmount;
            } else {
                updated_wallet_amount = currentWalletAmount;
            }
        } else if (debitable_amount < 0) {
            updated_wallet_amount = currentWalletAmount + debitable_amount;
        }
        setDebitableAmount(debitable_amount);
        setRefundedamount(refunded_amount);
        setUpdateWalletAmount(updated_wallet_amount);
    }, [paymentValue, editSaleItem, useWallet])

    const paymentMethodOption = paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1));
    const paymentTypeDefaultValue = paymentMethodOption && paymentMethodOption?.filter(option => option?.attributes?.type != 1).map((option) => {
        return {
            value: option?.id,
            label: option?.attributes?.name,
            type: option?.attributes?.type,
        };
    });

    const handleCallback = (date) => {
        setPaymentValue(previousState => {
            return { ...previousState, payment_date: date }
        });
    };

    const onPaymentMethodChange = (obj) => {
        setPaymentValue(paymentValue => ({ ...paymentValue, payment_type: obj }));
    };

    const prepareFormData = (prepareData) => {
        const formValue = {
            payment_date: moment(prepareData.payment_date).locale('en').format('YYYY-MM-DD'),
            payment_type: prepareData.payment_type.value,
            amount: Number(prepareData.amount),
            payment_id: prepareData.payment_id,
            reference: prepareData.reference,
            received_amount: prepareData.amount_to_pay
        }
        return formValue
    };

    const [errors, setErrors] = useState({
        amount: '',
    });

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!paymentValue['amount']) {
            errorss['amount'] = getFormattedMessage("globally.require-input.validate.label");
        } else if ((paymentValue['amount'] && paymentValue['amount'] > paymentValue["amount_to_pay"])) {
            errorss['amount'] = getFormattedMessage("paying-amount-validate-label");
        } else if (useWallet && debitableAmount < 0 && currentWalletAmount > debitableAmount) {
            errorss['amount'] = getFormattedMessage("wallet.balance.insufficient.label");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    }

    const onSubmit = (event) => {
        event.preventDefault();
        const filters = {
            order_By: "created_at",
            direction: "desc",
            page: 1,
            pageSize: 10,
        }
        const valid = handleValidation()
        let data = prepareFormData(paymentValue)
        if (valid) {
            dispatch(editSalePayment(data));
            dispatch(fetchSales(filters));
            clearField()
        }
    };

    const clearField = () => {
        closeModal(false);
    };

    const onChangeAmount = (e) => {
        setPaymentValue(paymentValue => ({ ...paymentValue, amount: e.target.value }));
    }

    const onChangeReference = (e) => {
        setPaymentValue(paymentValue => ({ ...paymentValue, reference: e.target.value }));
    }

    const onClickUseWallet = () => {
        let isUseWallet = !useWallet;
        const paymentType = paymentMethods.length > 0 && paymentMethods?.find((method) => method.id == editSaleItem?.payment_type);
        if (isUseWallet) {
            let amount = paymentValue.amount || 0;
            if (paymentType && paymentType.attributes && paymentType.attributes.type == 1) {
                amount = editSaleItem.amount || 0;
                setDebitableAmount(0);
                isUseWallet = true;
            } else {
                if (currentWalletAmount > 0) {
                    if (currentWalletAmount > amount) {
                        setDebitableAmount(-amount);
                    } else {
                        amount = currentWalletAmount;
                        setDebitableAmount(-currentWalletAmount);
                    }
                    isUseWallet = true;
                } else {
                    isUseWallet = false;
                }
            }
            setUseWallet(isUseWallet);
            if (isUseWallet) {
                setPaymentValue(previousState => {
                    return {
                        ...previousState,
                        amount: amount,
                        payment_type: {
                            value: walletpaymentMethod[0].id,
                            label: walletpaymentMethod[0].attributes.name,
                            type: walletpaymentMethod[0].attributes.type
                        }
                    }
                });
            }
        } else {
            setUseWallet(false);
            if (paymentType && paymentType.attributes && paymentType.attributes.type == 1) {
                setDebitableAmount(editSaleItem.amount);
            } else {
                setDebitableAmount(0);
            }
            setPaymentValue(previousState => {
                return {
                    ...previousState,
                    payment_type: {
                        value: paymentTypeDefaultValue[0]?.value,
                        label: paymentTypeDefaultValue[0]?.label,
                        type: paymentTypeDefaultValue[0]?.type
                    }
                }
            });
        }
    }

    return (
        <Modal
            show={isEditModalOpen}
            onHide={closeModal} size='lg' keyboard={true}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {getFormattedMessage("edit-payment-title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    {(totalWalletUsedAmount > 0 || currentWalletAmount > 0) && (
                        <div className="col-12 mb-3">
                            <div className="card border-0 shadow-sm p-3 rounded-3">

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="useWalletCheckbox"
                                            checked={useWallet}
                                            onChange={onClickUseWallet}
                                        />
                                        <label className="form-check-label fw-semibold" htmlFor="useWalletCheckbox">
                                            {getFormattedMessage("use.wallet.balance.title")}
                                        </label>
                                    </div>
                                    <span className="px-2 border rounded-3">
                                        {getFormattedMessage("current.wallet.balance.title")}:  {currencySymbolHandling(allConfigData, frontSetting.value && frontSetting.value.currency_symbol, currentWalletAmount)}
                                    </span>
                                </div>

                                <div className="mt-3 small">
                                    {totalWalletUsedAmount > 0 && <div className="d-flex justify-content-between mb-1">
                                        <span>{getFormattedMessage("previously.used.wallet.balance.title")} : </span>
                                        <span className={`fw-semibold text-primary`}>
                                            {currencySymbolHandling(allConfigData, frontSetting.value && frontSetting.value.currency_symbol, totalWalletUsedAmount || 0)}
                                        </span>
                                    </div>}


                                    {(debitableAmount != 0) && <div className="d-flex justify-content-between mb-1">
                                        <span>{debitableAmount > 0 ? getFormattedMessage("wallet.adjust.amount.credit.title") : getFormattedMessage("wallet.adjust.amount.debit.title")}:</span>
                                        <span className={`fw-semibold ${debitableAmount > 0 ? "text-success" : "text-danger"}`}>
                                            {currencySymbolHandling(allConfigData, frontSetting.value && frontSetting.value.currency_symbol, debitableAmount || 0)}
                                        </span>
                                    </div>}


                                    {(createPaymentItem?.wallet_refund_amount > 0 && debitableAmount > 0) && <div className="d-flex justify-content-between mb-1">
                                        <span>{getFormattedMessage("refunded.wallet.amount.title")} : </span>
                                        <span className={`fw-semibold text-primary`}>
                                            {/* ${createPaymentItem?.wallet_refund_amount || 0} */}
                                            {currencySymbolHandling(allConfigData, frontSetting.value && frontSetting.value.currency_symbol, Refundedamount || 0)}
                                        </span>
                                    </div>}

                                    {(totalWalletUsedAmount > 0 || useWallet) && <>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{getFormattedMessage("updated.wallet.balance.title")}:</span>
                                            <span className={`fw-semibold ${updateWalletAmount > 0 ? "text-success" : "text-danger"}`}>
                                                {currencySymbolHandling(allConfigData, frontSetting.value && frontSetting.value.currency_symbol, (useWallet ? (updateWalletAmount) : (createPaymentItem?.wallet_refund_amount > 0 ? (updateWalletAmount) : (currentWalletAmount + (createPaymentItem?.isWalletPayment[0]?.amount || 0)))))}
                                            </span>
                                        </div>
                                    </>}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="col-4 mb-3">
                        <label className='form-label'>
                            {getFormattedMessage("react-data-table.date.column.label")} :
                        </label>
                        <ReactDatePicker onChangeDate={handleCallback} newStartDate={paymentValue.payment_date} />
                    </div>
                    <div className="col-4 mb-3">
                        <label className='form-label'>
                            {getFormattedMessage("globally.detail.reference")} :
                        </label>
                        <input type='text' name='reference'
                            placeholder={placeholderText("reference-placeholder-label")}
                            className='form-control'
                            autoFocus={true}
                            readOnly={true}
                            onChange={(e) => onChangeReference(e)}
                            value={paymentValue.reference}
                        />
                    </div>
                    <div className="col-4 mb-3">
                        <ReactSelect title={getFormattedMessage("globally.react-table.column.payment-type.label")}
                            data={paymentTypeDefaultValue}
                            value={paymentValue.payment_type}
                            defaultValue={paymentTypeDefaultValue[0]}
                            onChange={onPaymentMethodChange}
                        />
                    </div>
                    <div className="col-4">
                        <label className='form-label'>
                            {getFormattedMessage("input-Amount-to-pay-title")} :
                        </label>
                        <input type='text' name='name'
                            placeholder={placeholderText("globally.input.name.placeholder.label")}
                            className='form-control'
                            autoFocus={true}
                            readOnly={true}
                            value={paymentValue.amount_to_pay} />
                    </div>
                    <div className="col-4">
                        <label className='form-label'>
                            {getFormattedMessage("paying-amount-title")} :
                        </label>
                        <span className='required' />
                        <input type='text' name='amount'
                            className='form-control'
                            autoFocus={true}
                            placeholder={placeholderText("paying-amount-title")}
                            onKeyPress={(event) => decimalValidate(event)}
                            onChange={(e) => onChangeAmount(e)}
                            value={paymentValue.amount} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['amount'] ? errors['amount'] : null}</span>
                    </div>
                    <ModelFooter clearField={clearField} onSubmit={onSubmit} />
                </Row>
            </Modal.Body>
        </Modal>
    );
}
export default EditPaymentModal;
