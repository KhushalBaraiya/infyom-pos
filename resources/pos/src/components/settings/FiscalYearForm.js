import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from 'react-bootstrap-v5';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import ReactDatePicker from '../../shared/datepicker/ReactDatePicker';
import moment from 'moment';
import { createFiscalYear } from '../../store/action/FiscalYearAction';
import { useDispatch, useSelector } from 'react-redux';

const FiscalYearForm = ({ handleClose, show }) => {
    const dispatch = useDispatch();
    const fiscalYears = useSelector(state => state.fiscalYears);

    const currentYear = new Date().getFullYear();

    const [fiscalYearName, setFiscalYearName] = useState('');
    const [FiscalDates, setFiscalDates] = useState({
        startDate: new Date(currentYear, 3, 1),
        endDate: new Date(currentYear + 1, 2, 31),
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            const cy = new Date().getFullYear();
            setFiscalYearName('');
            setFiscalDates({
                startDate: new Date(cy, 3, 1),
                endDate: new Date(cy + 1, 2, 31),
            });
            setErrors({});
        }
    }, [show]);

    useEffect(() => {
        const start = new Date(FiscalDates.startDate);
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        setFiscalDates(prev => ({
            ...prev,
            endDate: end,
        }));
    }, [FiscalDates.startDate]);

    const handleCreate = (e) => {
        e.preventDefault();
        setErrors({});

        if (!fiscalYearName) {
            setErrors({ name: getFormattedMessage("globally.require-input.validate.label") });
            return;
        }

        const payload = {
            name: fiscalYearName,
            start_date: moment(FiscalDates.startDate).locale('en').format("YYYY-MM-DD"),
            end_date: moment(FiscalDates.endDate).locale('en').format("YYYY-MM-DD"),
            is_completed: moment(FiscalDates.endDate).isBefore(moment(), 'day'),
            is_active: (fiscalYears?.length || 0) === 0 ? true : false,
        };

        dispatch(createFiscalYear(payload, handleClose));
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
            <Modal.Title>
                {getFormattedMessage("fiscal.year.settings.title")}
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <div className="row">
                        <div className="col-md-4">
                            <label className="form-label">
                                {getFormattedMessage("enter.fiscal.year.name.placeholder")}
                                <span className="required"/>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder='Ex. april2023-march2024'
                                value={fiscalYearName}
                                onChange={(e) => setFiscalYearName(e.target.value)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors['name'] ? errors['name'] : null}
                            </span>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">
                                {getFormattedMessage("enter.fiscal.year.start.date.placeholder")}
                                <span className="required"/>
                            </label>
                            <ReactDatePicker
                                newStartDate={FiscalDates.startDate}
                                onChangeDate={(date) => setFiscalDates({ ...FiscalDates, startDate: date })}
                                className="form-control"
                                placeholder='Ex. april2023-march2024'
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {/* {errors['name'] ? errors['name'] : null} */}
                            </span>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">
                                {getFormattedMessage("enter.fiscal.year.end.date.placeholder")}
                                <span className="required"/>
                            </label>
                            <ReactDatePicker
                                newStartDate={FiscalDates.endDate}
                                onChange={(date) => setFiscalDates({ ...FiscalDates, endDate: date })}
                                className="form-control"
                                placeholder='Ex. april2023-march2024'
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {/* {errors['name'] ? errors['name'] : null} */}
                            </span>
                        </div>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    {getFormattedMessage("globally.cancel-btn")}
                </Button>
                <Button variant="primary" onClick={handleCreate}>
                    {getFormattedMessage('globally.create.title')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FiscalYearForm;
