import React from 'react';
import { currencySymbolHandling, getFormattedDate, getFormattedMessage } from '../../shared/sharedMethod';

export default function TransactionDetailsModal({ show, onClose, transactionData, allConfigData, frontSetting }) {
  if (!show || !transactionData) return null;


  const details = transactionData?.data?.attributes;    

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-light">
              <h5 className="modal-title">
                {getFormattedMessage("transaction-details.title")} #{details?.id} - {details?.transaction_type_label}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            
            <div className="modal-body">
              <div className="row">

                <div className="col-md-6 border-end">
                  <h6 className="text-muted text-uppercase small fw-bold">{getFormattedMessage("transaction-details.title")}</h6>
                  <p><strong>{getFormattedMessage("expense.input.amount.label")}:</strong> <span className="text-primary fs-5">{currencySymbolHandling(allConfigData , frontSetting?.value?.currency_symbol, details?.amount)}</span></p>
                  <p><strong>{getFormattedMessage("wallet.transactions.type.label")}:</strong> <span className="badge bg-info">{details?.direction_label}</span></p>
                  <p><strong>{getFormattedMessage("globally.detail.status")}:</strong> 
                    <span className={`ms-2 badge ${details?.status_label === 'Rejected' ? 'bg-danger' : 'bg-success'}`}>
                      {details?.status_label}
                    </span>
                  </p>
                  <p><strong>{getFormattedMessage("react-data-table.date.column.label")}:</strong> {getFormattedDate(details?.created_at, allConfigData)}</p>
                </div>


                <div className="col-md-6 ps-md-4">
                  <h6 className="text-muted text-uppercase small fw-bold">{getFormattedMessage("customer.details.title")}</h6>
                  <p className="mb-1"><strong>{getFormattedMessage("globally.input.name.label")}:</strong> {details?.customer?.name || 'N/A'}</p>
                  <p className="mb-1"><strong>{getFormattedMessage("globally.input.email.label")}:</strong> {details?.customer?.email || 'N/A'}</p>
                  <p className="mb-1"><strong>{getFormattedMessage("pos-sale.detail.Phone.info")}:</strong> {details?.customer?.phone || 'N/A'}</p>
                  <p className="mb-1"><strong>{getFormattedMessage("globally.input.city.label")}:</strong> {details?.customer?.city || 'N/A'}</p>
                </div>
              </div>

              <hr />

              {/* <div className="mb-4">
                <h6 className="text-muted text-uppercase small fw-bold">{getFormattedMessage("globally.attachment.label")}:</h6>
                {details?.attachment ? (
                  <div className="mt-2">
                    <a href={details.attachment} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary mb-2">
                      <i className="bi bi-download me-1"></i> View Full Attachment
                    </a>
                    <div className="border rounded p-2 bg-light text-center">
                      <img 
                        src={details.attachment} 
                        alt="Transaction Proof" 
                        style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} 
                        onError={(e) => e.target.style.display='none'} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-light border rounded text-muted small">
                    {getFormattedMessage("no.attachment.label")}
                  </div>
                )}
              </div> */}

              {/* <div className="mt-3">
                <h6 className="text-muted text-uppercase small fw-bold">{getFormattedMessage("globally.input.notes.label")}</h6>
                <div className="p-3 bg-light rounded italic border-start border-3 border-info">
                  {details?.notes || getFormattedMessage("no.notes.label")}
                </div>
              </div> */}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}