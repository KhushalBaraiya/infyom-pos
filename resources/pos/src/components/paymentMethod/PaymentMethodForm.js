import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import { addPaymentMethod, editPaymentMethod } from '../../store/action/paymentMethodAction';
import { useDispatch, useSelector } from 'react-redux';

const PaymentMethodForm = ({ show, handleClose, title, data, isEdit }) => {
    const dispatch = useDispatch();
    const { paymentMethods } = useSelector(state => state);

    const [paymentMethodValue, setPaymentMethodValue] = useState({
        name: "",
    });
    const [errors, setErrors] = useState({
        name: '',
    });

    useEffect(() => {
        setPaymentMethodValue((prev) => ({
            ...prev,
            name: data ? data.name : '',
        }));
    }, [data])

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!paymentMethodValue.name) {
            errorss["name"] = getFormattedMessage("globally.input.name.validate.label");
        } else if (paymentMethods.length > 0 && paymentMethods?.some(item => item.attributes.name.toLowerCase() === paymentMethodValue.name.toLowerCase() &&
            (!isEdit || item.id !== data?.id))) {
            errorss["name"] = getFormattedMessage("payment.method.name.unique.validate.title");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setPaymentMethodValue(inputs => ({ ...inputs, [e.target.name]: e.target.value }))
        setErrors('');
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        if (isEdit) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const clearData = () => {
        setPaymentMethodValue({
            name: "",
        });
        setErrors({});
    }

    const handleCancleButton = () => {
        clearData();
        handleClose();
    }

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            if (isEdit) {
                dispatch(editPaymentMethod(prepareFormData(paymentMethodValue), data?.id, handleClose, clearData));
            } else {
                dispatch(addPaymentMethod(prepareFormData(paymentMethodValue), handleClose, clearData));
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <label
                        className='form-label'>{getFormattedMessage("globally.input.name.label")}: </label>
                    <span className='required' />
                    <input type='text' name='name' value={paymentMethodValue.name} maxLength={20}
                        placeholder={placeholderText("globally.input.name.placeholder.label")}
                        className='form-control' autoComplete='off'
                        onChange={(e) => onChangeInput(e)} />
                    <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['name'] ? errors['name'] : null}</span>
                </div>
            </Modal.Body>
            <Modal.Footer className='pt-0'>
                <button
                    className="btn btn-primary mt-4"
                    type="button"
                    onClick={onSubmit}
                >
                    {getFormattedMessage("globally.save-btn")}
                </button>
                <button
                    onClick={handleCancleButton}
                    className='btn btn-secondary mt-4 mx-2'
                    type='button'
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </button>
            </Modal.Footer>
        </Modal>
    );
}

export default PaymentMethodForm;