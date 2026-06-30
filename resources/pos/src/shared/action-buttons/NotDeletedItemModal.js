import React, { useEffect, useState } from "react";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "react-bootstrap";
import { getFormattedMessage } from "../../shared/sharedMethod";

const NotDeletedItemModal = ({ show, data, setNotDeletedItemModal }) => {
    const [showModal, setShowModal] = useState(show);

    useEffect(() => {
        if (show) setShowModal(true);
    }, [show]);

    const handleClose = () => {
        setShowModal(false);
        setNotDeletedItemModal?.({ ...data, ids: [] });
    };

    return (
        <Modal show={showModal} onHide={handleClose} centered backdrop="static">
            <div className="delete-warning-modal">

                {/* Top-right close button */}
                <button className="close-icon-btn" onClick={handleClose}>
                    ✕
                </button>

                <div className="header">
                    <FontAwesomeIcon className="icon" icon={faExclamationTriangle}/>
                    <h3>{getFormattedMessage("cannot-delete-error.model.title")}</h3>
                </div>

                <p>
                    {getFormattedMessage("deleted.items.already.assigned.title")}
                </p>

                {/* Scrollable item area */}
                <div className="item-scroll">
                    <ul>
                        {data?.ids?.map((item, index) => (
                            <li key={item?.id || index}>{item?.name}</li>
                        ))}
                    </ul>
                </div>

                <p>{getFormattedMessage("remove-assignment.title")}</p>

                <div className="footer">
                    <button onClick={handleClose}>{getFormattedMessage("pos-close-btn.title")}</button>
                </div>
            </div>
        </Modal>
    );
};

export default NotDeletedItemModal;
