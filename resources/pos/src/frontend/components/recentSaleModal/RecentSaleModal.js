import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { currencySymbolHandling, getFormattedDate, getFormattedMessage, paymentMethodName } from '../../../shared/sharedMethod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import warning from "../../../assets/images/warning.png"
import EditHoldConfirmationModal from '../cart-product/EditHoldConfirmationModal';
import moment from "moment";

const RecentSaleModal = ({ recentSaleModal, setRecentSaleModal, sales, handleLoadMore, setSalePage }) => {
    const { totalRecord, isLoading, loadingMore, allConfigData, frontSetting, paymentMethods } = useSelector(state => state);
    const [isEdit, setIsEdit] = useState(false);
    const [isEditSale, setIsEditSale] = useState(null);

    const editSaleModel = (item) => {
        setIsEdit(true);
        setIsEditSale(item);
    }

    const onConfirm = () => {
        setIsEdit(false);
        setRecentSaleModal(false);
        setSalePage(1);
        window.open(`#/app/sales/edit/${isEditSale.id}`, '_blank');
    }

    return (
        <>
            <Modal show={recentSaleModal} onHide={() => setRecentSaleModal(false)} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>{getFormattedMessage("dashboard.recentSales.title")}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='recent-sale-modal'>
                    <Table responsive bordered hover className='m-0 registerModel holdListModel'>
                        <tbody>
                            <tr>
                                <th >{getFormattedMessage('react-data-table.date.column.label')}</th>
                                <th >{getFormattedMessage('globally.detail.reference')}</th>
                                <th >{getFormattedMessage("customer.title")}</th>
                                <th >{getFormattedMessage("globally.detail.grand.total")}</th>
                                <th >{getFormattedMessage("globally.detail.payment.status")}</th>
                                <th >{getFormattedMessage("select.payment-type.label")}</th>
                                <th >{getFormattedMessage("react-data-table.action.column.label")}</th>
                            </tr>
                            {sales && sales.length <= 0 ?
                                <tr>
                                    <td colSpan={6} className={"custom-text-center"}>{getFormattedMessage("sale.product.table.no-data.label")}</td>
                                </tr>
                                : null}
                            {sales && sales.length > 0 && sales?.map((items, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{ getFormattedDate(
                                                        items.attributes.created_at,
                                                        allConfigData && allConfigData
                                                    )} {moment(items.attributes.created_at).format("LT")}</td>
                                        <td>{items.attributes.reference_code}</td>
                                        <td>{items.attributes.customer_name}</td>
                                        <td>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                frontSetting.value &&
                                                frontSetting.value.currency_symbol,
                                                items.attributes.grand_total
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${items.attributes.payment_status == 1 ? "bg-light-success"
                                                : items.attributes.payment_status == 2 ? "bg-light-danger"
                                                    : items.attributes.payment_status == 3 ? "bg-light-warning" : ""}`}>
                                                <span>
                                                    {items.attributes.payment_status == 1 ? getFormattedMessage(
                                                        "globally.detail.paid"
                                                    ) : items.attributes.payment_status == 2 ? getFormattedMessage(
                                                        "payment-status.filter.unpaid.label"
                                                    ) : items.attributes.payment_status == 3 ? getFormattedMessage(
                                                        "payment-status.filter.partial.label"
                                                    ) : ""}
                                                </span>
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${items.attributes.payment_type == null || items.attributes.payment_type == 0 ? "text-dark" : 'bg-light-primary'}`}>
                                                <span>
                                                    {paymentMethodName(paymentMethods, items.attributes) ?? '-'}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <FontAwesomeIcon onClick={() => editSaleModel(items)} cursor={"pointer"} className={"me-3 edit"} icon={faPenToSquare} />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer className='pt-0'>
                    {sales.length < totalRecord && !isLoading && (
                        <div className="d-flex justify-content-center w-100 my-3">
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? getFormattedMessage("loading.title") : getFormattedMessage("load.more.title")}
                            </button>
                        </div>
                    )}
                    {isLoading && (
                        <div className="d-flex justify-content-center w-100 text-primary">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}
                </Modal.Footer>
            </Modal>
            {isEdit &&
                <EditHoldConfirmationModal onConfirm={onConfirm} onCancel={() => setIsEdit(false)} icon={warning} title={getFormattedMessage("pos.edit.sale.title")} itemName={getFormattedMessage("product.title")} />}
        </>

    );
}

export default RecentSaleModal;