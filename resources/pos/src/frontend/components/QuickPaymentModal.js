import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { currencySymbolHandling, getFormattedMessage } from '../../shared/sharedMethod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';

export default function QuickPaymentModal({grandTotal,quickPayAmount,quickSaleConfirm,setquickSaleConfirm,onCashPayment,allConfigData,frontSetting}) {
    const changeReturn = quickPayAmount > grandTotal ? (quickPayAmount - grandTotal) : '0.00';
    const due = quickPayAmount < grandTotal ? (grandTotal - quickPayAmount).toFixed(2) : '0.00';
    useEffect(() => {
      const handleKeyPress = (event) => {
        if (event.key === "Enter") {
         onCashPayment(event, true, 0)
         setquickSaleConfirm(false);
         return;
        }
      }
      window.addEventListener("keydown", handleKeyPress)
    
      return () => {
        window.removeEventListener("keydown", handleKeyPress)
      }
    }, [])

    return (
        <Modal  
            show={quickSaleConfirm}
            onHide={() => setquickSaleConfirm(false)}
            size="md"
            className="pos-modal">
            <Modal.Header>
                <div class="w-100">
                    <div className='w-100 d-flex align-items-center'>
                        <FontAwesomeIcon icon={faMoneyBill} className='mx-auto text-primary fs-1 rounded-circle' />
                    </div>
                    <h2 class="modal-title font-weight-bold mb-1 fs-3 text-center mt-2">{getFormattedMessage("confirm-quick-sale.title")}</h2>
                    <p class="text-muted small mb-0 fs-5 text-center">{getFormattedMessage("confirm-quick-sale.description")}</p>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div class="bg-light p-3 rounded">
                    <div class="d-flex justify-content-between align-items-center pb-2 mb-2">
                        <span class="text-dark font-weight-medium">{getFormattedMessage("paying-amount-title")}:</span>
                        <span class="h4 mb-0 font-weight-bold text-dark">
                            {currencySymbolHandling(
                                allConfigData,  
                                frontSetting.value &&
                                frontSetting.value.currency_symbol,
                                quickPayAmount ? quickPayAmount : "0.00"
                            )}
                        </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                        <span class="text-dark font-weight-medium">{getFormattedMessage("globally.detail.grand.total")}:</span>
                        <span class="h4 mb-0 font-weight-bold text-dark">{
                            currencySymbolHandling(
                                allConfigData,
                                frontSetting.value &&
                                frontSetting.value.currency_symbol,
                                grandTotal ? grandTotal : "0.00"
                            )}</span>
                    </div>
                    {due > 0 && <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted small">{getFormattedMessage('dashboard.recentSales.due.label')}:</span>
                        <span class="font-weight-bold text-danger">
                            {
                            currencySymbolHandling(
                                allConfigData,
                                frontSetting.value &&
                                frontSetting.value.currency_symbol,
                                due
                            )}
                        </span>
                    </div>}
                    {changeReturn > 0 && <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted small">{getFormattedMessage('pos.change-return.label')}</span>
                        <span class="font-weight-bold text-success">
                            {
                            currencySymbolHandling(
                                allConfigData,
                                frontSetting.value &&
                                frontSetting.value.currency_symbol,
                                changeReturn
                            )}
                        </span>
                    </div>}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" class="btn btn-link text-secondary text-decoration-none" data-bs-dismiss="modal">{getFormattedMessage("quick-sale.esc-to-cancel.title")}</button>
                <button type="button" class="btn btn-primary px-4 shadow-sm">{getFormattedMessage("quick-sale.enter-to-complete.title")}</button>
            </Modal.Footer>
        </Modal>
    )
}
