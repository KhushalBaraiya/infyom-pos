import React, { useState } from 'react';
import {Dropdown} from 'react-bootstrap';
import {getFormattedMessage} from '../sharedMethod';
import {
    faEye, faFilePdf, faDollarSign, faTrash, faAngleDown, faCartShopping, faPenToSquare, faEllipsisVertical,
    faReceipt,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { Permissions } from '../../constants';
import { useSelector } from 'react-redux';

const ActionDropDownButton = (props) => {
    const {
        goToEditProduct, item, onClickDeleteModel = true, goToDetailScreen, isViewIcon = false, isPdfIcon = false,isCreateSaleReturn,onCreateSaleReturnClick,
        isCreatePayment = false, onPdfClick, title, isPaymentShow = false, onShowPaymentClick, onCreatePaymentClick, onCreateSaleClick, isCreatesSales,
        isCreatePurchaseReturn, onCreatePurchaseReturnClick, isReceiptIcon, onReceiptClick, isDeleteMode
    } = props;

    const {config} = useSelector(state => state);
    const [show, setShow] = useState(false);

    const closeDropdown = () => setShow(false);
    const toggleDropdown = (isOpen) => setShow(isOpen);

    return (
        <Dropdown show={show} onToggle={toggleDropdown} className='table-dropdown'>
            <Dropdown.Toggle id='dropdown-autoclose-true' className='text-primary hide-arrow bg-transparent border-0 p-0'>
                {/*{getFormattedMessage('react-data-table.action.column.label')}*/}
                <i className="fa-solid fa-ellipsis-vertical" />
                <FontAwesomeIcon icon={faEllipsisVertical} className="fs-1" />
                {/*<FontAwesomeIcon icon={faAngleDown} className='ms-2 pt-1'/>*/}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {isViewIcon ?
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        goToDetailScreen(item.id);
                        closeDropdown();
                    }} eventKey='1' className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faEye}
                                         className='me-2'/>{getFormattedMessage('globally.view.tooltip.label')} {title}
                    </Dropdown.Item> : null
                }
                {isPdfIcon ?
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        onPdfClick(item.id);
                        closeDropdown();
                    }} eventKey='2' className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faFilePdf}
                                         className='me-2'/> {getFormattedMessage('globally.pdf.download.label')}
                    </Dropdown.Item> : null
                }
                {isReceiptIcon ?
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        onReceiptClick(item.id);
                        closeDropdown();
                    }} eventKey='2' className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faDownload}
                            className='me-2' /> {getFormattedMessage('globally.receipt.download.label')}
                    </Dropdown.Item> : null
                }
                {item.payment_status !== 2 && isPaymentShow  ?
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        onShowPaymentClick(item);
                        closeDropdown();
                    }} eventKey='5' className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faDollarSign}
                                         className='me-2'/> {getFormattedMessage('globally.show.payment.label')}
                    </Dropdown.Item> : null
                }
                {isCreatePayment && item.payment_status !== 1 ?
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        onCreatePaymentClick(item);
                        closeDropdown();
                    }} eventKey='6' className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faDollarSign}
                                         className='me-2'/>
                        {getFormattedMessage("create-payment-title")}
                    </Dropdown.Item> : null
                }
                {isCreatesSales && !item.is_sale_created  ?
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        onCreateSaleClick(item);
                        closeDropdown();
                    }} eventKey='6' className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faCartShopping}
                                         className='me-2'/>
                        {getFormattedMessage("sale.create.title")}
                        {/*{getFormattedMessage('globally.show.payment.label')}*/}
                    </Dropdown.Item> : null
                }
                {config && config.includes(Permissions.MANAGE_SALE_RETURN) && isCreateSaleReturn  ?
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        onCreateSaleReturnClick(item);
                        closeDropdown();
                    }} eventKey='6' className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faCartShopping}
                                         className='me-2'/>
                        {item.is_return === 1 ? getFormattedMessage("sale-return.edit.title") : getFormattedMessage("sale-return.create.title")}
                        {/*{getFormattedMessage('globally.show.payment.label')}*/}
                    </Dropdown.Item> : null
                }
                {isCreatePurchaseReturn &&
                    <Dropdown.Item onClick={(e) => {
                        e.stopPropagation();
                        onCreatePurchaseReturnClick(item);
                    }} className='py-3 px-4 d-flex align-items-center fs-6'>
                        <FontAwesomeIcon icon={faReceipt} className='me-2' />
                        {item.is_return === 1 ? getFormattedMessage("purchase.return.edit.title") : getFormattedMessage("purchase.return.create.title")}
                </Dropdown.Item>}
                {goToEditProduct && !item.is_sale_created && item.is_return !== 1 &&
                <Dropdown.Item onClick={(e) => {
                    e.stopPropagation();
                    goToEditProduct(item);
                    closeDropdown();
                }} eventKey='3' className='py-3 px-4 d-flex align-items-center fs-6'>
                    <FontAwesomeIcon icon={faPenToSquare}
                                     className='me-2'/>{getFormattedMessage('globally.edit.tooltip.label')} {title}
                </Dropdown.Item>}
                {isDeleteMode && <Dropdown.Item onClick={(e) => {
                    e.stopPropagation();
                    onClickDeleteModel(item);
                    closeDropdown();
                }} eventKey='4' className='py-3 px-4 d-flex align-items-center fs-6'>
                    <FontAwesomeIcon icon={faTrash}
                                     className='me-2'/> {getFormattedMessage('globally.delete.tooltip.label')} {title}
                </Dropdown.Item>}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default ActionDropDownButton;
