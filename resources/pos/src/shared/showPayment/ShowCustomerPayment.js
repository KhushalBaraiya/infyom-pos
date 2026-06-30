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
import { deleteSalePayment } from "../../store/action/salePaymentAction";
import { fetchConfig } from "../../store/action/configAction";
import { Permissions } from "../../constants";

const ShowCustomerPayment = (props) => {
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
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ShowCustomerPayment;
