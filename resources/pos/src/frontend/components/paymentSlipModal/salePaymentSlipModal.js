import React from "react";
import { Modal, Table, Image } from "react-bootstrap";
import { calculateProductCost } from "../../shared/SharedMethod";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    paymentMethodName,
} from "../../../shared/sharedMethod";
import { paymentStatusOptionsConstant, Tokens } from "../../../constants";

const SalePaymentSlipModal = (props) => {
    const {
        settings,
        modalShowPaymentSlip,
        setModalShowPaymentSlip,
        updateProducts,
        printPaymentReceiptPdf,
        frontSetting,
        allConfigData,
        setIsShowPdf,
        taxes,
        paymentMethods
    } = props;
    const currency =
        settings && settings.attributes && settings.attributes.currency_symbol;

    const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);
    const isRTL = updatedLanguage === "ar";

    return (
        <Modal
            show={modalShowPaymentSlip}
            onHide={() => {
                setModalShowPaymentSlip(false);
                setIsShowPdf(false);
            }}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="pos-modal"
        >
            <Modal.Header closeButton className="pb-3">
                <Modal.Title id="contained-modal-title-vcenter">
                    {getFormattedMessage("pos-sale.detail.invoice.info")} POS
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0 pb-3">
                <div className="mt-4 mb-4 text-black text-center fs-1">
                    {settings.attributes &&
                    parseInt(settings.attributes.show_logo_in_receipt) == 1 ? (
                        <img
                            src={settings.attributes.logo}
                            alt=""
                            width="100px"
                        />
                    ) : (
                        ""
                    )}
                </div>
                <div className="mt-4 mb-4 text-black text-center">
                    {updateProducts?.receipt_no}
                </div>
                <div className="mt-4 mb-4 text-black text-center fs-1">
                    {settings?.attributes?.store_name}
                </div>
                <div className="mb-2">
                    {taxes?.length > 0 &&
                        taxes
                            ?.filter((tax) => tax.attributes.status == 1)
                            ?.map((tax, index) => (
                                <div
                                    key={index}
                                    className="fw-semibold"
                                    style={{
                                        textAlign: "center",
                                        width: "100%",
                                    }}
                                >
                                    <p
                                        className="fs-6 text-body-tertiary mb-0"
                                        style={{
                                            margin: 0,
                                            textAlign: "center",
                                            direction: isRTL ? "rtl" : "ltr",
                                            display: "inline-block",
                                        }}
                                    >
                                        {tax.attributes.name && (
                                            <>
                                                <span>{tax.attributes.name}</span>
                                                <span>
                                                    {isRTL ? "\u061B" : ":"}
                                                </span>
                                            </>
                                        )}
                                        {tax.attributes.number && (
                                            <span className="fs-6">{" "}{tax.attributes.number}</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                </div>
                <Table>
                    <tbody>
                        <tr>
                            <td scope="row" className="p-0">
                                <span>
                                    {getFormattedMessage(
                                        "react-data-table.date.column.label"
                                    )}
                                    :
                                </span>
                                <span className="ms-2 font-label">
                                    {getFormattedDate(
                                        updateProducts?.created_at,
                                        allConfigData && allConfigData
                                    )}
                                </span>
                            </td>
                        </tr>
                        {parseInt(settings.attributes?.show_address) == 1 && (
                            <tr>
                                <td scope="row" className="p-0">
                                    <span className="address__label d-inline-block">
                                        {getFormattedMessage(
                                            "supplier.table.address.column.title"
                                        )}
                                        :
                                    </span>
                                    <span className="ms-2 address__value d-inline-block font-label">
                                        {frontSetting?.value &&
                                            frontSetting?.value?.address}
                                    </span>
                                </td>
                            </tr>
                        )}
                        {parseInt(settings.attributes?.show_email) == 1 && (
                            <tr>
                                <td scope="row" className="p-0">
                                    <span>
                                        {getFormattedMessage(
                                            "globally.input.email.label"
                                        )}
                                        :
                                    </span>
                                    <span className="ms-2 font-label">
                                        {frontSetting.value &&
                                            frontSetting.value.email}
                                    </span>
                                </td>
                            </tr>
                        )}
                        {parseInt(settings.attributes?.show_phone) == 1 && (
                            <tr>
                                <td scope="row" className="p-0">
                                    <span>
                                        {getFormattedMessage(
                                            "pos-sale.detail.Phone.info"
                                        )}
                                        :
                                    </span>
                                    <span className="ms-2 font-label">
                                        {frontSetting.value &&
                                            frontSetting.value.phone}
                                    </span>
                                </td>
                            </tr>
                        )}
                        {parseInt(settings.attributes?.show_customer) == 1 && (
                            <tr>
                                <td scope="row" className="p-0">
                                    <span>
                                        {" "}
                                        {getFormattedMessage(
                                            "dashboard.recentSales.customer.label"
                                        )}
                                        :{" "}
                                    </span>
                                    <span className="ms-2 font-label">
                                        {updateProducts?.customer?.name}
                                    </span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                {updateProducts?.sale_items &&
                    updateProducts?.sale_items?.map((productName, index) => {
                        return (
                            <div key={index + 1}>
                                <div>
                                    {productName.product.name}{" "}
                                    {parseInt(settings?.attributes?.show_product_code) == 1 ? <span>({productName.product.code})</span> : ''}
                                </div>
                                {settings?.attributes?.show_tax == "1" && <div className="d-flex justify-content-between">
                                    <p className="m-0 ws-6">{getFormattedMessage("product.table.price.column.label")}: {currencySymbolHandling(allConfigData, currency, productName.product.product_price)}</p>
                                    <p className="m-0 ws-6">{getFormattedMessage("globally.detail.tax")}: {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        productName.tax_amount
                                    )} ({productName.tax_value} %) </p>
                                </div>}
                                <div className="product-border">
                                    <div className="border-0 d-flex justify-content-between">
                                        <span dir="ltr" className="text-black">
                                            {updatedLanguage === "ar"
                                                ? `${currencySymbolHandling(
                                                    allConfigData,
                                                    currency,
                                                    parseFloat(calculateProductCost(productName)).toFixed(2))} X ${parseFloat(productName.quantity).toFixed(2)} ${productName?.sale_unit?.short_name}`
                                                : `${parseFloat(productName.quantity).toFixed(2)} ${productName?.sale_unit?.short_name} X ${currencySymbolHandling(
                                                    allConfigData,
                                                    currency,
                                                    parseFloat(calculateProductCost(productName)).toFixed(2)) }`
                                            }
                                        </span>
                                        <span className="text-end">
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName?.quantity *
                                                    calculateProductCost(
                                                        productName
                                                    )
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                <div className="d-flex product-border">
                    <div>{getFormattedMessage("pos-total-amount.title")}:</div>
                    <div className="text-end ms-auto">
                        {currency}{" "}
                        {parseFloat(
                            updateProducts?.grand_total -
                            (updateProducts?.tax_amount -
                                updateProducts?.discount) -
                            updateProducts?.shipping
                        )?.toFixed(2)}
                    </div>
                </div>

                {parseInt(settings.attributes?.show_tax_discount_shipping) ==
                    1 && (
                    <div className="d-flex product-border">
                        <div>
                            {getFormattedMessage("globally.detail.order.tax")}:
                        </div>
                        <div className="text-end ms-auto">
                            {" "}
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                updateProducts?.tax_amount
                                    ? updateProducts?.tax_amount
                                    : "0.00"
                            )}{" "}
                            (
                            {updateProducts
                                ? parseFloat(updateProducts?.tax_rate).toFixed(2)
                                : "0.00"}{" "}
                            %)
                        </div>
                    </div>
                )}
                {parseInt(settings.attributes?.show_tax_discount_shipping) ==
                    1 && (
                    <div className="d-flex product-border">
                        <div>
                            {getFormattedMessage(
                                "purchase.order-item.table.discount.column.label"
                            )}
                            :
                        </div>
                        <div className="text-end ms-auto">
                            {" "}
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                updateProducts
                                    ? updateProducts?.discount
                                    : "0.00"
                            )}
                        </div>
                    </div>
                )}
                {parseInt(settings.attributes?.show_tax_discount_shipping) ==
                    1 && updateProducts?.shipping ? (
                    <div className="d-flex product-border">
                        <div>Shipping:</div>
                        <div className="text-end ms-auto">
                            {" "}
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                updateProducts
                                    ? updateProducts?.shipping
                                    : "0.00"
                            )}
                        </div>
                    </div>
                ) : (
                    ""
                )}
                <div className="d-flex product-border">
                    <div>
                        {getFormattedMessage("purchase.grant-total.label")}:
                    </div>
                    <div className="text-end ms-auto">
                        {" "}
                        {currencySymbolHandling(
                            allConfigData,
                            currency,
                            updateProducts?.grand_total
                        )}
                    </div>
                </div>
                {updateProducts?.payment_status == paymentStatusOptionsConstant.PAID &&
                    <div className="d-flex product-border">
                        <div>
                            {getFormattedMessage("pos.change-return.label")}:
                        </div>
                        <div className="text-end ms-auto">
                            {" "}
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                updateProducts.changeReturn || 0
                            )}
                        </div>
                    </div>}
                {updateProducts?.payment_status == paymentStatusOptionsConstant.PARTIAL &&
                    <div className="d-flex product-border">
                        <div>
                            {getFormattedMessage("globally.detail.due")}:
                        </div>
                        <div className="text-end ms-auto">
                            {" "}
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                (parseFloat(updateProducts.grand_total) - parseFloat(updateProducts.paid_amount) || 0)
                            )}
                        </div>
                    </div>}
                {updateProducts?.payment_status == paymentStatusOptionsConstant.PAID ? <Table striped className="mb-0">
                    <thead>
                        <tr>
                            <th className="py-2 px-0">
                                {getFormattedMessage(
                                    "pos-sale.detail.paid-by.title"
                                )}
                            </th>
                            <th className="text-end py-2 px-0">
                                {getFormattedMessage(
                                    "expense.input.amount.label"
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {updateProducts?.payments && updateProducts?.payments?.length > 0 ? (
                            updateProducts?.payments.map((payment, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-0">
                                        {payment?.payment_method?.name}
                                    </td>
                                    <td className="text-end py-2 px-0">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            currency,
                                            payment?.amount
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="py-2 px-0">
                                    {" "}
                                    {paymentMethodName(paymentMethods, updateProducts)}
                                </td>
                                <td className="text-end py-2 px-0">
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        updateProducts?.grand_total
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table> : ""}
                {updateProducts?.payment_status == paymentStatusOptionsConstant.PARTIAL ? <Table striped className="mb-0">
                    <thead>
                        <tr>
                            <th className="py-2 px-0">
                                {getFormattedMessage(
                                    "pos-sale.detail.paid-by.title"
                                )}
                            </th>
                            <th className="text-end py-2 px-0">
                                {getFormattedMessage(
                                    "globally.detail.paid"
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {updateProducts?.payments && updateProducts?.payments?.length > 0 ? (
                            updateProducts?.payments.map((payment, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-0">
                                        {payment?.payment_method?.name}
                                    </td>
                                    <td className="text-end py-2 px-0">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            currency,
                                            payment?.amount
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="py-2 px-0">
                                    {" "}
                                    {paymentMethodName(paymentMethods, updateProducts)}
                                </td>
                                <td className="text-end py-2 px-0">
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        updateProducts?.paid_amount
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table> : ''}
                {updateProducts?.payment_status == paymentStatusOptionsConstant.UNPAID ?
                    <div style={{
                        textAlign: "center",
                        margin: "10px 0"
                    }}>
                        <h5 style={{
                            color: "#dc3545",
                            fontWeight: "bold",
                            margin: "0"
                        }}>
                            {getFormattedMessage("payment-status.filter.unpaid.label")}
                        </h5>
                        <div style={{
                            color: "#6c757d"
                        }}>
                            {getFormattedMessage("sale-Due.total.amount.title")}: {currencySymbolHandling(
                                allConfigData,
                                currency,
                                updateProducts?.grand_total
                            )}
                        </div>
                    </div> : ''}
                {updateProducts && updateProducts?.note ? (
                    <div className="d-flex product-border mb-5">
                        <div className="fw-bolder">
                            {getFormattedMessage(
                                "globally.input.notes.label"
                            )}:
                        </div>
                        <div className="ms-2 mb-2 product-border__product-width">
                            {updateProducts && updateProducts?.note}
                        </div>
                    </div>
                ) : (
                    ""
                )}
                {parseInt(settings.attributes?.show_note) == 1 && (
                    <h5 className="text-center notes-text">
                        {settings.attributes?.notes
                            ? settings.attributes?.notes
                            : getFormattedMessage("pos-thank.you-slip.invoice")}
                    </h5>
                )}
                <div className="text-center d-block">
                    {parseInt(settings.attributes?.show_barcode_in_receipt) ==
                        1 && (
                        <Image
                            src={updateProducts && updateProducts?.barcode_url}
                            className=""
                            height={25}
                            width={100}
                        />
                    )}
                    <span className="d-block">
                        {updateProducts &&
                            updateProducts?.reference_code}
                    </span>
                </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-center pt-2">
                <button
                    className="btn btn-primary text-white"
                    onClick={printPaymentReceiptPdf}
                >
                    {getFormattedMessage("print.title")}
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        setModalShowPaymentSlip(false);
                        setIsShowPdf(false);
                    }}
                >
                    {getFormattedMessage("pos-close-btn.title")}
                </button>
            </Modal.Footer>
        </Modal>
    );
};
export default SalePaymentSlipModal;
