import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import { addTax, editTax } from '../../../store/action/taxAction';
import { useDispatch, useSelector } from 'react-redux';

const TaxesForm = ({ handleClose, show, title, isEdit, data }) => {
    const dispatch = useDispatch();
    const { taxes } = useSelector(state => state);
    const [taxValue, setTaxValue] = useState({
        name: "",
        number: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        number: "",
    });

    useEffect(() => {
        setTaxValue({
            name: data?.name ? data?.name : "",
            number: data?.number ? data?.number : "",
        })
        setErrors('')
    }, [data, show]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!taxValue.name) {
            errorss["name"] = getFormattedMessage("tax.name.validate.title");
        } else if (taxes.length > 0 &&  taxes?.some(item => item.attributes.name.toLowerCase() === taxValue.name.toLowerCase() &&
            (!isEdit || item.id !== data?.id))) {
            errorss["name"] = getFormattedMessage("tax.name.unique.validate.title");
        } else if (!taxValue.number) {
            errorss["number"] = getFormattedMessage("tax.value.validate.title");
        } else if (taxes.length > 0 &&  taxes?.some(item => item.attributes.number === taxValue.number &&
            (!isEdit || item.id !== data?.id))) {
            errorss["number"] = getFormattedMessage("tax.value.unique.validate.title");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("number", data.number);
        if (isEdit) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setTaxValue(inputs => ({
            ...inputs,
            [e.target.name]: e.target.value
        }))
        setErrors('');
    }

    const clearData = () => {
        setTaxValue({
            name: "",
            number: "",
        });
        setErrors({});
    }

    const handleCancleButton = () => {
        clearData();
        handleClose();
    }

    const onSubmit = () => {
        const valid = handleValidation();
        if (valid) {
            if (isEdit) {
                dispatch(editTax(prepareFormData(taxValue), data?.id, handleClose));
            } else {
                dispatch(addTax(prepareFormData(taxValue), handleClose, clearData));
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='pb-0'>
                <div className='row'>
                    <div className='col-md-12 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage("tax.name.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='name'
                            value={taxValue.name}
                            placeholder={placeholderText("tax.name.placeholder.title")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['name'] ? errors['name'] : null}</span>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage("tax.value.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='number'
                            value={taxValue.number}
                            placeholder={placeholderText("tax.value.placeholder.title")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['number'] ? errors['number'] : null}</span>
                    </div>
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

export default TaxesForm;