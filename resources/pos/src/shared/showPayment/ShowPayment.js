import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap-v5";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../sharedMethod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import EditPaymentModal from "../../components/sales/EditPaymentModal";
import { deleteSalePayment } from "../../store/action/salePaymentAction";
import { fetchConfig } from "../../store/action/configAction";
import { Permissions } from "../../constants";

const ShowPayment = (props) => {
    const {
        onShowPaymentClick,
        isShowPaymentModel,
        allSalePayments,
        currencySymbol,
        setIsShowPaymentModel,
        createPaymentItem,
        allConfigData,
        paymentMethods,
        frontSetting
    } = props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSaleItem, setEditSaleItem] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        fetchConfig();
    }, []);


    const onEditClick = (item) => {
        setIsEditModalOpen(true);
        setEditSaleItem(item);
        setIsShowPaymentModel(false);
    };

    const closeModal = () => {
        setIsEditModalOpen(false);
        setIsShowPaymentModel(false);
    };

    const onDeletClick = (paymentId) => {
        dispatch(deleteSalePayment(paymentId));
    };

    return (
        <>
            <Modal
                show={isShowPaymentModel}
                onHide={onShowPaymentClick}
                size="lg"
                keyboard={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {getFormattedMessage("globally.show.payment.label")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>
                                    {getFormattedMessage(
                                        "react-data-table.date.column.label"
                                    )}
                                </th>
                                <th className="ps-3">
                                    {getFormattedMessage(
                                        "globally.detail.reference"
                                    )}
                                </th>
                                <th className="ps-3">
                                    {getFormattedMessage(
                                        "expense.input.amount.label"
                                    )}
                                </th>
                                <th className="ps-3">
                                    {getFormattedMessage(
                                        "pos-sale.detail.paid-by.title"
                                    )}
                                </th>
                                <th>
                                    {getFormattedMessage(
                                        "react-data-table.action.column.label"
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {allSalePayments &&
                                allSalePayments.length !== 0 &&
                                allSalePayments.map((item) => {
                                    return (
                                        <tr className="align-middle">
                                            <td>
                                                {getFormattedDate(
                                                    item?.payment_date,
                                                    allConfigData &&
                                                        allConfigData
                                                )}
                                            </td>
                                            <td>
                                                {item.reference
                                                    ? item.reference
                                                    : "N/A"}
                                            </td>
                                            <td>
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    currencySymbol,
                                                    item.amount
                                                )}
                                            </td>
                                            <td>
                                                {paymentMethods && paymentMethods
                                                    .find((method) => method.id == item.payment_type)?.attributes?.name
                                                }
                                            </td>
                                            <td>
                                                {getPermission(allConfigData?.permissions, Permissions.EDIT_SALE) && <Button
                                                    type="button"
                                                    title={placeholderText(
                                                        "globally.edit.tooltip.label"
                                                    )}
                                                    variant="light"
                                                    onClick={() =>
                                                        onEditClick(item)
                                                    }
                                                    className="text-success btn-sm me-1"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPencil}
                                                    />
                                                </Button>}
                                                {getPermission(allConfigData?.permissions, Permissions.DELETE_SALE) && <Button
                                                    type="button"
                                                    title={placeholderText(
                                                        "globally.delete.tooltip.label"
                                                    )}
                                                    variant="light"
                                                    onClick={() =>
                                                        onDeletClick(item.id)
                                                    }
                                                    className="btn-sm text-danger"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />
                                                </Button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
            <EditPaymentModal
                createPaymentItem={createPaymentItem}
                isEditModalOpen={isEditModalOpen}
                closeModal={closeModal}
                editSaleItem={editSaleItem}
                allConfigData={allConfigData}
                frontSetting={frontSetting}
            />
        </>
    );
};

export default ShowPayment;
