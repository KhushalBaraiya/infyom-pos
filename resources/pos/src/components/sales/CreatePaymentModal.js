import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap-v5";
import {
    currencySymbolHandling,
    decimalValidate,
    getFormattedMessage,
    getFormattedOptions,
    placeholderText,
} from "../../shared/sharedMethod";
import moment from "moment";
import { Row } from "reactstrap";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import { paymentMethodOptions } from "../../constants";
import ReactSelect from "../../shared/select/reactSelect";
import ModelFooter from "../../shared/components/modelFooter";
import { useDispatch, useSelector } from "react-redux";
import { createSalePayment } from "../../store/action/salePaymentAction";
import { fetchPaymentMethods } from "../../store/action/paymentMethodAction";

const CreatePaymentModal = (props) => {
    const {
        onCreatePaymentClick,
        isCreatePaymentOpen,
        createPaymentItem,
        setIsCreatePaymentOpen,
        allConfigData,
        frontSetting, 
    } = props;
    const dispatch = useDispatch();
    const { paymentMethods } = useSelector((state) => state);
    const [useWallet, setUseWallet] = useState(false);
    const [paymentValue, setPaymentValue] = useState({
        reference: "",
        payment_date: new Date(),
        payment_type: "",
        amount: "",
        paid_amount: "",
        sale_id: "",
        amount_to_pay: "",
    });

    const paymentMethodOption = paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1));
    const customerWalletMethod = paymentMethodOption && paymentMethodOption.find(method => method.attributes.type == 1);
    const walletBalance = Number(createPaymentItem?.customer_wallet_amount || 0);
    const amountToPay = Number(paymentValue?.amount_to_pay || 0);
    const walletUsedAmount = useWallet ? Math.min(walletBalance, amountToPay) : 0;
    const remainingWallet = walletBalance - (paymentValue.amount ? Number(paymentValue.amount) : 0);
    const paymentTypeDefaultValue = paymentMethodOption && paymentMethodOption?.filter(option => option?.attributes?.type != 1)?.map((option) => {
        return {
            value: option?.id,
            label: option?.attributes?.name,
            type: option?.attributes?.type,
        };
    });

    useEffect(() => {
        if (createPaymentItem) {
            setPaymentValue({
                payment_type:
                    paymentTypeDefaultValue && paymentTypeDefaultValue[0],
                payment_date: moment(createPaymentItem?.date, moment.ISO_8601, true).isValid()
                    ? moment(createPaymentItem?.date).toDate()
                    : new Date(),
                amount_to_pay: createPaymentItem
                    ? Number(createPaymentItem?.grand_total || 0) -
                    Number(createPaymentItem?.paid_amount || 0)
                    : 0,
                sale_id: createPaymentItem ? createPaymentItem?.id : "",
                amount: createPaymentItem
                    ? Number(createPaymentItem?.grand_total || 0) -
                    Number(createPaymentItem?.paid_amount || 0)
                    : 0,
            });
        }
    }, [createPaymentItem]);

    useEffect(() => {
        if (isCreatePaymentOpen) {
            dispatch(fetchPaymentMethods());  
        }
        setUseWallet(false)
    }, [isCreatePaymentOpen]);

    const handleCallback = (date) => {
        setPaymentValue((previousState) => {
            return { ...previousState, payment_date: date };
        });
    };

    const onPaymentMethodChange = (obj) => {
        setPaymentValue((paymentValue) => ({
            ...paymentValue,
            payment_type: obj,
        }));
    };

    const [errors, setErrors] = useState({
        amount: "",
    });

    const handleValidation = () => {
        let error = {};
        let isValid = true;

        const enteredAmount = Number(paymentValue.amount || 0);
        const payableAmount = Number(paymentValue.amount_to_pay || 0);

        if (!paymentValue.amount) {
            error["amount"] = getFormattedMessage(
                "globally.require-input.validate.label"
            );
            isValid = false;
        } else if (isNaN(enteredAmount)) {
            error["amount"] = "Invalid amount";
            isValid = false;
        } else if (enteredAmount <= 0) {
            error["amount"] = "Amount must be greater than 0";
            isValid = false;
        } else if (enteredAmount > payableAmount) {
            error["amount"] = getFormattedMessage(
                "paying-amount-validate-label"
            );
            isValid = false;
        } else if (useWallet && enteredAmount > walletBalance) {
            error["amount"] = "Amount exceeds wallet balance";
            isValid = false;
        }
        setErrors(error);
        return isValid;
    };

    const prepareFormData = (prepareData) => {
        const formValue = {
            reference: prepareData.reference,
            payment_date: moment(prepareData.payment_date).locale('en').format("YYYY-MM-DD"),
            payment_type: prepareData.payment_type.value,
            amount: prepareData.amount,
            sale_id: prepareData.sale_id,
            received_amount: prepareData.amount_to_pay,
        };
        return formValue;
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            dispatch(createSalePayment(prepareFormData(paymentValue)));
            // clearField()
            setIsCreatePaymentOpen(false);
        }
    };

    const clearField = () => {
        setIsCreatePaymentOpen(false);
    };

    const onChangeAmount = (e) => {
        setPaymentValue((paymentValue) => ({
            ...paymentValue,
            amount: e.target.value,
        }));
    };

    const onChangeReference = (e) => {
        setPaymentValue((paymentValue) => ({
            ...paymentValue,
            reference: e.target.value,
        }));
    };

    const onChangeUseWallet = (e) => {
        const checked = e.target.checked;
        setUseWallet(checked);

        dispatch({
            type: 'DISABLE_OPTION',
            payload: checked
        });

        if (checked && customerWalletMethod) {
            const usedAmount = Math.min(walletBalance, amountToPay);

            setPaymentValue((prev) => ({
                ...prev,
                amount: usedAmount,
                payment_type: {
                    value: customerWalletMethod.id,
                    label: customerWalletMethod.attributes.name,
                },
            }));
        } else {
            setPaymentValue((prev) => ({
                ...prev,
                amount: amountToPay,
                payment_type: paymentTypeDefaultValue[0] || [],
            }));
        }
    };

    return (
        <Modal
            show={isCreatePaymentOpen}
            onHide={onCreatePaymentClick}
            size="lg"
            keyboard={true}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {getFormattedMessage("create-payment-title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    {customerWalletMethod && createPaymentItem && walletBalance > 0 && (
                        <div className="col-12 mb-3">
                            <div className="card border-0 shadow-sm p-3 rounded-3">

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="useWalletCheckbox"
                                            checked={useWallet}
                                            onChange={onChangeUseWallet}
                                        />
                                        <label className="form-check-label fw-semibold" htmlFor="useWalletCheckbox">
                                          {getFormattedMessage("use.wallet.balance.title")}
                                        </label>
                                    </div>
                                    <span className="px-2 rounded-3">
                                        {getFormattedMessage("current.wallet.balance.title")} :  { currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,walletBalance) }
                                    </span>
                                </div>

                                {useWallet && (
                                    <div className="mt-3 small">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{getFormattedMessage("wallet.used.title")}:</span>
                                            <span className="fw-semibold text-primary">
                                                 {currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,paymentValue.amount ? paymentValue.amount : 0)}
                                            </span>
                                        </div>

                                        <hr className="my-2" />

                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{getFormattedMessage("updated.wallet.balance.title")}:</span>
                                            <span className="fw-semibold text-success">
                                                {currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol,remainingWallet)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="col-4 mb-3">
                        <label className="form-label">
                            {getFormattedMessage(
                                "react-data-table.date.column.label"
                            )}{" "}
                            :
                        </label>
                        <ReactDatePicker
                            onChangeDate={handleCallback}
                            newStartDate={
                                paymentValue.payment_date
                                    ? paymentValue.payment_date
                                    : new Date()
                            }
                        />
                    </div>
                    <div className="col-4 mb-3">
                        <label className="form-label">
                            {getFormattedMessage("globally.detail.reference")} :
                        </label>
                        {/*<span className='required'/>*/}
                        <input
                            type="text"
                            name="reference"
                            placeholder={placeholderText(
                                "reference-placeholder-label"
                            )}
                            className="form-control"
                            autoFocus={true}
                            onChange={(e) => onChangeReference(e)}
                            value={paymentValue.reference}
                        />
                    </div>
                    <div className="col-4 mb-3">
                        <ReactSelect
                            title={getFormattedMessage(
                                "globally.react-table.column.payment-type.label"
                            )}
                            // placeholder={placeholderText("payment-type-options.placeholder.label")}
                            data={paymentTypeDefaultValue}
                            value={paymentValue.payment_type}
                            isDisabled={useWallet}
                            isOptionDisabled={useWallet}
                            isWarehouseDisable={useWallet}
                            onChange={onPaymentMethodChange}
                        // errors={errors['base_unit']}
                        />
                    </div>
                    <div className="col-4">
                        <label className="form-label">
                            {getFormattedMessage("input-Amount-to-pay-title")} :
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter Reference"
                            className="form-control"
                            autoFocus={true}
                            readOnly={true}
                            onChange={(e) => onChangeInput(e)}
                            value={paymentValue.amount_to_pay}
                        />
                    </div>
                    <div className="col-4">
                        <label className="form-label">
                            {getFormattedMessage("paying-amount-title")} :
                        </label>
                        <span className="required" />
                        <input
                            type="text"
                            name="amount"
                            // placeholder={placeholderText("globally.input.name.placeholder.label")}
                            placeholder={placeholderText("paying-amount-title")}
                            className="form-control"
                            autoFocus={true}
                            onKeyPress={(event) => decimalValidate(event)}
                            onChange={(e) => onChangeAmount(e)}
                            value={paymentValue.amount}
                        />
                        <span className="text-danger d-block fw-400 fs-small mt-2">
                            {errors["amount"] ? errors["amount"] : null}
                        </span>
                    </div>
                    <ModelFooter clearField={clearField} onSubmit={onSubmit} />
                </Row>
            </Modal.Body>
        </Modal>
    );
};
export default CreatePaymentModal;
