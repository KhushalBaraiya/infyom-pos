import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { addWalletBalance, fetchWalletTransactions } from '../../store/action/walletactions';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentMethods } from '../../store/action/paymentMethodAction';
import ReactSelect from '../../shared/select/reactSelect';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';

const TopupModal = ({ show, handleClose, currency }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const { paymentMethods } = useSelector(state => state);
  const dispatch = useDispatch();
  const presets = [500, 1000, 1500, 2000];

  useEffect(() => {
      dispatch(fetchPaymentMethods());
  }, [show]);

  useEffect(() => {
    if (!show) {
      setAmount('');
      setMethod(null);
      setAttachment(null);
      setNote('');
      setLoading(false);
    }
  }, [show]);

  const handleSetMethod = (obj) => {
    setMethod(obj.value);
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };


const isInvalid = () => {
  const numericAmount = Number(amount);

  if (!method) {
    setError((prev) => ({ ...prev, paymentMethod: "Payment method is required." }));
  }
  if (amount === "") {
    setError((prev) => ({ ...prev, amount: "Amount is required." }));
  }

  if (isNaN(numericAmount)) {
    setError((prev) => ({ ...prev, amount: "Amount must be a valid number." }));
  }

  if (numericAmount <= 0) {
    setError((prev) => ({ ...prev, amount: "Amount must be greater than 0." }));
  }

  if (!Number.isFinite(numericAmount)) {
    setError((prev) => ({ ...prev, amount: "Invalid amount value." }));
  }

  if(!method || amount === "" || isNaN(numericAmount) || numericAmount <= 0 || !Number.isFinite(numericAmount)){
    return true;
  }

  setError({});
  return false;
};


  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInvalid()) return;
    setLoading(true);

    // Using FormData to support the attachment file
    const formData = new FormData();
    formData.append('amount', Number(amount));
    formData.append('payment_method_id', method);
    formData.append('payment_method', paymentMethods.find((m) => m.id === method)?.attributes?.name);

    if (note) formData.append('notes', note);
    if (attachment) formData.append('attachment', attachment);

    dispatch(addWalletBalance(formData))
      .then(() => {
        handleClose();
      })
      .finally(() => {
        dispatch(fetchWalletTransactions(null, {}));
        setLoading(false)
      });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="md"
      backdropClassName="custom-modal-backdrop"
      className="confirm-2fa-modal"
    >
      <Modal.Body className="p-5 text-center">
        <div className="mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle shadow-sm" style={{ width: '80px', height: '80px' }}>
            <FontAwesomeIcon icon={faWallet} className="display-6 text-primary" />
          </div>
        </div>

        <h4 className="fw-bold mb-1">{getFormattedMessage('wallet.topup.title')}</h4>
        <p className="text-muted mb-4">{getFormattedMessage('wallet.topup.subtitle')}</p>

        <Form onSubmit={handleSubmit} className="text-start mb-3">
          <div className="d-flex gap-2 mb-3">
            {presets.map((val) => (
              <Button
                key={val}
                variant={Number(amount) === val ? "primary" : "outline-light"}
                className={`flex-fill fw-bold ${Number(amount) !== val ? 'text-dark border-secondary-subtle' : ''}`}
                onClick={() => setAmount(val)}
                size="sm"
              >
                {currency}{val}
              </Button>
            ))}
          </div>

         <Form.Group className="mb-4 mt-2 rounded-1">
          <Form.Label className="small">{getFormattedMessage('expense.input.amount.placeholder.label')}:<span className="required" /> </Form.Label>
           <InputGroup size="lg" className="ounded-1">
             <InputGroup.Text className="bg-white border-end-0 rounded-start text-muted">
               {currency}
             </InputGroup.Text>
             <Form.Control
               required
               type="number"
               placeholder="0.00"
               className="border-start-0 ps-0 fw-bold fs-5 rounded-end"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
             />
           </InputGroup>
         </Form.Group>
         {error?.amount && <p className="text-danger text-start fs-6">{error?.amount}</p>}


          <div className="mb-3">
            <ReactSelect
              title={getFormattedMessage("globally.payment.method.label")}
              placeholder={placeholderText("globally.payment.method.label")}
              value={method?.value}
              defaultValue={paymentMethods[0]?.id}
              data={paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1 && item.attributes.type !== 1))}
              onChange={handleSetMethod}
            />
          </div>
          {error?.paymentMethod && <p className="text-danger text-start fs-6">{error?.paymentMethod}</p>}

          <Form.Group className="mb-3">
            <Form.Label className="small">{getFormattedMessage('globally.attachment.label')} : </Form.Label>
            <InputGroup>
              <Form.Control
                type="file"
                className="border-start-0"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </InputGroup>
          </Form.Group>

          <div className="mb-4">
            <Form.Label className="small">{getFormattedMessage('purchase.placeholder.notes.input')} : </Form.Label>
            <textarea
              rows="2"
              className='form-control'
              placeholder={`${placeholderText('purchase.placeholder.notes.input')}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>
          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="fw-bold py-3 shadow-sm"
              disabled={loading || isInvalid}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />{getFormattedMessage("globally-saving-btn-label")}</>
              ) : (
                getFormattedMessage("wallet.confirm.payment.label")
              )}
            </Button>
            <Button variant="link" className="text-muted text-decoration-none" onClick={handleClose} disabled={loading}>
              {getFormattedMessage("globally.cancel-btn")}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TopupModal;