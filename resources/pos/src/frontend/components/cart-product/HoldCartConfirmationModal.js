import React, { useCallback, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { getFormattedMessage, isEditHold, placeholderText } from "../../../shared/sharedMethod";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faHashtag, faInfoCircle, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

const HoldCartConfirmationModal = ( props ) => {
    const { onCancel, onConfirm, onChangeInput, hold_ref_no, HoldRefNumber, show, error, GenerateRandomId } = props;

    const escFunction = useCallback( ( event ) => {
        if ( event.keyCode === 27 ) {
            onCancel( false );
        }
    }, [onCancel] );

    useEffect( () => {
        document.addEventListener( 'keydown', escFunction, false );
        return () => {
            document.removeEventListener( 'keydown', escFunction, false );
        };
    }, [escFunction] );

    const isEdit = isEditHold(hold_ref_no, HoldRefNumber);

    return (
        <Modal 
            show={show} 
            onHide={() => onCancel(false)} 
            centered 
            className="hold-cart-modal"
            backdrop="static"
        >
            <Modal.Header className="border-0 pb-0">
                <Button variant="link" className="ms-auto text-secondary p-0" onClick={() => onCancel(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </Modal.Header>

            <Modal.Body className="text-center px-4 pt-1 pb-0">
                {/* Header Illustration */}
                <div className="mb-4 d-flex justify-content-center">
                    <div className="position-relative" style={{ width: '80px', height: '80px', backgroundColor: '#F0F2FF', borderRadius: '50%' }}>
                        <div className="position-absolute top-50 start-50 translate-middle">
                             <div className="bg-white p-2 rounded shadow-sm border border-primary">
                                <FontAwesomeIcon icon={faHashtag} className="text-primary" size="lg" />
                             </div>
                        </div>
                    </div>
                </div>

                <h3 className="fw-bold mb-2">
                    {isEdit ? getFormattedMessage("pos.edit.hold.list.title") : getFormattedMessage("pos.create.hold.list.title")}
                </h3>
                {isEdit && <p className="text-muted small mb-4">
                  {getFormattedMessage("pos.like.to.edit.this.hold.title")}
                </p> }

                {/* Input Section */}
                <Form.Group className="text-start mb-2 ">
                    <Form.Label className="fw-bold small">
                        {getFormattedMessage("hold.unique.reference.id.label")} <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup className="mb-1">
                        <InputGroup.Text className="bg-light border-end-0">
                            <FontAwesomeIcon icon={faHashtag} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            className="border-start-0 ps-2"
                            value={HoldRefNumber || ''}
                            onChange={onChangeInput}
                            placeholder={placeholderText("enter.unique.reference.id.placeholder")}
                            readOnly={isEdit}
                        />
                        {!isEdit && <InputGroup.Text className="bg-transparent border-start-0" onClick={()=>GenerateRandomId()}>
                            <FontAwesomeIcon icon={faDice} className="text-muted" />
                        </InputGroup.Text>}
                    </InputGroup>
                    {error && (
                        <div className="text-danger small mt-1">
                            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                             {error}
                        </div>
                    )}
                </Form.Group>

                {/* Info Box */}
                <div className="alert alert-primary d-flex align-items-start text-start mt-4 p-3 border-0" style={{ backgroundColor: '#F5F7FF', borderRadius: '12px' }}>
                    <FontAwesomeIcon icon={faInfoCircle} className="mt-1 me-2 text-primary" />
                    <div>
                        <div className="fw-bold text-dark small">{getFormattedMessage("pos.why.this.needed.title")}</div>
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                            {getFormattedMessage("pos.ref.id.description")}
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="border-0 justify-content-end pb-4 pt-0 gap-2">
                <Button 
                    variant="primary" 
                    className="btn px-4 py-2 d-flex align-items-center" 
                    onClick={onConfirm}
                    disabled={!HoldRefNumber || error}
                    style={{ backgroundColor: '#4F46E5', border: 'none', borderRadius: '8px' }}
                >
                    {isEdit ? getFormattedMessage("globally.edit-btn") : getFormattedMessage("globally.create.title")}
                </Button>
                <Button 
                    variant="outline-secondary" 
                    className="px-4 py-2 bg-white text-dark d-flex align-items-center" 
                    onClick={() => onCancel(false)}
                    style={{ borderRadius: '8px'}}
                >
                    {getFormattedMessage('globally.cancel-btn')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default HoldCartConfirmationModal;