import React from "react";
import { Table, Image } from "react-bootstrap-v5";
import "../../assets/scss/frontend/pdf.scss";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    paymentMethodName,
} from "../../shared/sharedMethod";
import { calculateProductCost } from "../../frontend/shared/SharedMethod";
import { paymentStatusOptionsConstant, Tokens } from "../../constants";
class PrintDataSales extends React.PureComponent {
    render() {
        const paymentPrint = this.props.updateProducts;
        const settings = this.props.settings;
        const allConfigData = this.props.allConfigData;
        const taxes = this.props.taxes;
        const paymentMethods = this.props.paymentMethods;
        const currency =
            settings &&
            settings.attributes &&
            settings.attributes.currency_symbol;
        
        const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);
        const isRTL = updatedLanguage === "ar";

        return (
            <div
                className="print-data"
                dir={isRTL ? "rtl" : "ltr"}
                style={{
                    padding: "none !important",
                    textAlign: isRTL ? "right" : "left",
                }}
            >
                <style>
                    {`
                        @media print {
                            body, html {
                                background: white !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                        }
                    `}
                </style>
                <div className="mt-4 mb-4 text-black text-center">
                    {settings &&
                        parseInt(settings.attributes.show_logo_in_receipt) == 1 ? (
                        <img
                            src={
                                settings.attributes && settings.attributes.logo
                            }
                            alt=""
                            width="100px"
                        />
                    ) : (
                        ""
                    )}
                </div>
                <div
                    className="mt-4 mb-4 text-black text-center"
                    style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "15px !important",
                    }}
                >
                    {paymentPrint && paymentPrint?.receipt_no}
                </div>
                <div
                    className="mt-4 mb-4 text-black text-center"
                    style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        marginBottom: "15px !important",
                    }}
                >
                    {settings && settings?.attributes?.store_name}
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
                <section className="product-border">
                    <div
                        style={{
                            marginBottom: "4px",
                            textAlign: isRTL ? "right" : "left",
                            display: "flex",
                            justifyContent: isRTL ? "flex-end" : "flex-start",
                            gap: "4px",
                        }}
                    >
                        {isRTL ? (
                            <>
                                <span>{getFormattedDate(paymentPrint?.created_at, allConfigData)}</span>
                                <span className="fw-bold">
                                    : {getFormattedMessage("react-data-table.date.column.label")}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="fw-bold">
                                    {getFormattedMessage("react-data-table.date.column.label")} :
                                </span>
                                <span>{getFormattedDate(paymentPrint?.created_at, allConfigData)}</span>
                            </>
                        )}
                    </div>

                    {settings && parseInt(settings.attributes.show_address) === 1 && (
                        <div
                            style={{
                                marginBottom: "4px",
                                textAlign: isRTL ? "right" : "left",
                                display: "flex",
                                justifyContent: isRTL ? "flex-end" : "flex-start",
                                gap: "4px",
                            }}
                        >
                            {isRTL ? (
                                <>
                                    <span>{settings.attributes.address}</span>
                                    <span className="fw-bold">
                                        : {getFormattedMessage("supplier.table.address.column.title")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="fw-bold">
                                        {getFormattedMessage("supplier.table.address.column.title")} :
                                    </span>
                                    <span>{settings.attributes.address}</span>
                                </>
                            )}
                        </div>
                    )}

                    {settings.attributes && parseInt(settings.attributes.show_email) === 1 && (
                        <div
                            style={{
                                marginBottom: "4px",
                                textAlign: isRTL ? "right" : "left",
                                display: "flex",
                                justifyContent: isRTL ? "flex-end" : "flex-start",
                                gap: "4px",
                            }}
                        >
                            {isRTL ? (
                                <>
                                    <span>{settings.attributes.email}</span>
                                    <span className="fw-bold">
                                        : {getFormattedMessage("globally.input.email.label")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="fw-bold">
                                        {getFormattedMessage("globally.input.email.label")} :
                                    </span>
                                    <span>{settings.attributes.email}</span>
                                </>
                            )}
                        </div>
                    )}

                    {settings.attributes && parseInt(settings.attributes.show_phone) === 1 && (
                        <div
                            style={{
                                marginBottom: "4px",
                                textAlign: isRTL ? "right" : "left",
                                display: "flex",
                                justifyContent: isRTL ? "flex-end" : "flex-start",
                                gap: "4px",
                            }}
                        >
                            {isRTL ? (
                                <>
                                    <span>{settings.attributes.phone}</span>
                                    <span className="fw-bold">
                                        : {getFormattedMessage("pos-sale.detail.Phone.info")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="fw-bold">
                                        {getFormattedMessage("pos-sale.detail.Phone.info")} :
                                    </span>
                                    <span>{settings.attributes.phone}</span>
                                </>
                            )}
                        </div>
                    )}

                    {settings.attributes && parseInt(settings.attributes.show_customer) === 1 && (
                        <div
                            style={{
                                textAlign: isRTL ? "right" : "left",
                                display: "flex",
                                justifyContent: isRTL ? "flex-end" : "flex-start",
                                gap: "4px",
                            }}
                        >
                            {isRTL ? (
                                <>
                                    <span>{paymentPrint?.customer?.name}</span>
                                    <span className="fw-bold">
                                        : {getFormattedMessage("dashboard.recentSales.customer.label")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="fw-bold">
                                        {getFormattedMessage("dashboard.recentSales.customer.label")} :
                                    </span>
                                    <span>{paymentPrint?.customer?.name}</span>
                                </>
                            )}
                        </div>
                    )}
                </section>

                {/* Product List */}
                <section className="mt-3">
                    {paymentPrint.sale_items &&
                        paymentPrint.sale_items.map((item, index) => {
                            const productCost = calculateProductCost(item).toFixed(2);
                            const quantity = parseFloat(item.quantity).toFixed(2);
                            const unit = item?.sale_unit?.short_name || "";
                            const total = parseFloat(item.quantity * calculateProductCost(item)).toFixed(2);

                            return (
                                <div key={index} className="mb-2">
                                    <div className="fw-bold">
                                        {item?.product?.name} <span>({item?.product?.code})</span>
                                    </div>

                                    {settings?.attributes?.show_tax === "1" && (
                                        <div className="d-flex justify-content-between fs-6">
                                            <span>
                                                {getFormattedMessage("product.table.price.column.label")}:{" "}
                                                {/* <span>{currencySymbolHandling(allConfigData, currency, item.product_price)}</span> */}
                                                <span>{item.product_price}</span>
                                            </span>
                                            <span>
                                                {getFormattedMessage("globally.detail.tax")}:{" "}
                                                {currencySymbolHandling(allConfigData, currency, item.tax_amount)} ({item.tax_value}%)
                                            </span>
                                        </div>
                                    )}

                                    <div
                                        className="product-border d-flex justify-content-between"
                                        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
                                    >
                                        <span>
                                            {isRTL
                                                ? `${currencySymbolHandling(allConfigData, currency, productCost)} X ${quantity} ${unit}`
                                                : `${quantity} ${unit} X ${currencySymbolHandling(allConfigData, currency, productCost)}`}
                                        </span>
                                        <span>
                                            {currencySymbolHandling(allConfigData, currency, total)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </section>

                {/* Total section */}
                <section className="mt-3 product-border">
                    <div className="d-flex">
                        <div
                            style={{
                                fontWeight: "500",
                                color: "#000",
                            }}
                        >
                            {isRTL
                                ? <> : {getFormattedMessage("pos-total-amount.title")} </>
                                : <> {getFormattedMessage("pos-total-amount.title")} : </>}
                        </div>
                        <div className="text-end ms-auto">
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                paymentPrint
                                    ? parseFloat(
                                        paymentPrint.grand_total -
                                        (paymentPrint.tax_amount -
                                            paymentPrint.discount) -
                                        paymentPrint.shipping
                                    )?.toFixed(2)
                                    : "0.00"
                            )}
                        </div>
                    </div>
                    {settings &&
                        parseInt(
                            settings.attributes.show_tax_discount_shipping
                        ) == 1 && (
                            <div className="d-flex">
                                <div
                                    style={{
                                        fontWeight: "500",
                                        color: "#000",
                                    }}
                                >
                                    {isRTL
                                        ? <> : {getFormattedMessage("globally.detail.order.tax")} </>
                                        : <> {getFormattedMessage("globally.detail.order.tax")} : </>}
                                    ({Number(paymentPrint.tax_rate).toFixed(2)}
                                    %)
                                </div>
                                <div className="text-end ms-auto">
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        paymentPrint
                                            ? paymentPrint?.tax_amount
                                            : "0.00"
                                    )}
                                </div>
                            </div>
                        )}
                    {settings &&
                        parseInt(
                            settings.attributes.show_tax_discount_shipping
                        ) == 1 && (
                            <div className="d-flex">
                                <div
                                    style={{
                                        fontWeight: "500",
                                        color: "#000",
                                    }}
                                >
                                    {isRTL
                                        ? <> : {getFormattedMessage("globally.detail.discount")} </>
                                        : <> {getFormattedMessage("globally.detail.discount")} : </>}
                                </div>
                                <div className="text-end ms-auto">
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        paymentPrint
                                            ? paymentPrint.discount
                                            : "0.00"
                                    )}
                                </div>
                            </div>
                        )}
                    {settings &&
                        parseInt(
                            settings.attributes.show_tax_discount_shipping
                        ) == 1 &&
                        parseFloat(paymentPrint.shipping) !== 0.0 && (
                            <div className="d-flex">
                                <div
                                    style={{
                                        fontWeight: "500",
                                        color: "#000",
                                    }}
                                >
                                    {isRTL
                                        ? <> : {getFormattedMessage("globally.detail.shipping")} </>
                                        : <> {getFormattedMessage("globally.detail.shipping")} : </>}
                                </div>
                                <div className="text-end ms-auto">
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        paymentPrint
                                            ? paymentPrint.shipping
                                            : "0.00"
                                    )}
                                </div>
                            </div>
                        )}
                    <div className="d-flex">
                        <div
                            style={{
                                fontWeight: "500",
                                color: "#000",
                            }}
                        >
                            {isRTL
                                ? <> : {getFormattedMessage("globally.detail.grand.total")} </>
                                : <> {getFormattedMessage("globally.detail.grand.total")} : </>}
                        </div>
                        <div className="text-end ms-auto">
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                paymentPrint.grand_total
                            )}
                        </div>
                    </div>
                    {paymentPrint.payment_status == paymentStatusOptionsConstant.PAID &&
                        <div className="d-flex">
                            <div
                                style={{
                                    fontWeight: "500",
                                    color: "#000",
                                }}
                            >
                                {isRTL
                                    ? <> : {getFormattedMessage("pos.change-return.label")} </>
                                    : <> {getFormattedMessage("pos.change-return.label")} : </>}
                            </div>
                            <div className="text-end ms-auto">
                                {currencySymbolHandling(
                                    allConfigData,
                                    currency,
                                    paymentPrint.changeReturn || 0
                                )}
                            </div>
                        </div>}
                    {paymentPrint.payment_status == paymentStatusOptionsConstant.PARTIAL &&
                        <div className="d-flex">
                            <div
                                style={{
                                    fontWeight: "500",
                                    color: "#000",
                                }}
                            >
                                {isRTL
                                    ? <> : {getFormattedMessage("globally.detail.due")} </>
                                    : <> {getFormattedMessage("globally.detail.due")} : </>}
                            </div>
                            <div className="text-end ms-auto">
                                {currencySymbolHandling(
                                    allConfigData,
                                    currency,
                                    (parseFloat(paymentPrint.grand_total) - parseFloat(paymentPrint.paid_amount) || 0)
                                )}
                            </div>
                        </div>}
                </section>

                {paymentPrint.payment_status == paymentStatusOptionsConstant.PAID ? <Table
                    dir={isRTL ? "rtl" : "ltr"}
                    style={{
                        padding: "none !important",
                        marginTop: "20px !important",
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                padding: "none !important",
                            }}
                        >
                            <th
                                className="fw-bold"
                                style={{
                                    textAlign: "start",
                                    padding: "8px 15px",

                                    color: "#000",
                                }}
                            >
                                {getFormattedMessage(
                                    "pos-sale.detail.paid-by.title"
                                )}
                            </th>
                            <th
                                className="fw-bold"
                                style={{
                                    textAlign: "center",
                                    padding: "8px 15px",

                                    color: "#000",
                                }}
                            >
                                {getFormattedMessage(
                                    "expense.input.amount.label"
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentPrint?.payments && paymentPrint?.payments?.length > 0 ? (
                            paymentPrint?.payments.map((payment, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        padding: "none !important",
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "8px 15px",
                                            color: "#000",
                                        }}
                                    >
                                        {payment?.payment_method?.name ?? '-'}
                                    </td>
                                    <td
                                        style={{
                                            textAlign: "center",
                                            padding: "8px 15px",
                                            color: "#000",
                                        }}
                                    >
                                        {currencySymbolHandling(
                                            allConfigData,
                                            currency,
                                            payment?.amount
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr
                                style={{
                                    padding: "none !important",
                                }}
                            >
                                <td
                                    style={{
                                        padding: "8px 15px",
                                        color: "#000",
                                    }}
                                >
                                    {paymentMethodName(paymentMethods, paymentPrint) ?? '-'}
                                </td>
                                <td
                                    style={{
                                        textAlign: "center",
                                        padding: "8px 15px",
                                        color: "#000",
                                    }}
                                >
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        paymentPrint.grand_total
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table> : ''}

                {paymentPrint.payment_status == paymentStatusOptionsConstant.PARTIAL ? <Table
                    dir={isRTL ? "rtl" : "ltr"}
                    style={{
                        padding: "none !important",
                        marginTop: "20px !important",
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                padding: "none !important",
                            }}
                        >
                            <th
                                className="fw-bold"
                                style={{
                                    textAlign: "start",
                                    padding: "8px 15px",

                                    color: "#000",
                                }}
                            >
                                {getFormattedMessage(
                                    "pos-sale.detail.paid-by.title"
                                )}
                            </th>
                            <th
                                className="fw-bold"
                                style={{
                                    textAlign: "center",
                                    padding: "8px 15px",

                                    color: "#000",
                                }}
                            >
                                {getFormattedMessage(
                                    "globally.detail.paid"
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentPrint?.payments && paymentPrint?.payments?.length > 0 ? (
                            paymentPrint?.payments.map((payment, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        padding: "none !important",
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "8px 15px",
                                            color: "#000",
                                        }}
                                    >
                                        {payment?.payment_method?.name ?? '-'}
                                    </td>
                                    <td
                                        style={{
                                            textAlign: "center",
                                            padding: "8px 15px",
                                            color: "#000",
                                        }}
                                    >
                                        {currencySymbolHandling(
                                            allConfigData,
                                            currency,
                                            payment?.amount
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr
                                style={{
                                    padding: "none !important",
                                }}
                            >
                                <td
                                    style={{
                                        padding: "8px 15px",
                                        color: "#000",
                                    }}
                                >
                                    {paymentMethodName(paymentMethods, paymentPrint) ?? '-'}
                                </td>
                                <td
                                    style={{
                                        textAlign: "center",
                                        padding: "8px 15px",
                                        color: "#000",
                                    }}
                                >
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        paymentPrint.paid_amount
                                    )}
                                </td>
                                <td
                                    style={{
                                        textAlign: "end",
                                        padding: "8px 15px",
                                        color: "#000",
                                    }}
                                >
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        (paymentPrint.grand_total - paymentPrint.paid_amount)
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table> : ''}

                {paymentPrint?.payment_status == paymentStatusOptionsConstant.UNPAID ?
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
                                paymentPrint?.grand_total
                            )}
                        </div>
                    </div> : ''}

                {/*note section*/}
                {paymentPrint && paymentPrint.note ? (
                    <Table>
                        <tbody>
                            <tr
                                style={{
                                    border: "0",
                                }}
                            >
                                <td
                                    scope="row"
                                    style={{
                                        padding: "none !important",
                                        fontSize: "15px",
                                    }}
                                >
                                    <span
                                        style={{
                                            padding: "none !important",
                                            fontSize: "15px",
                                            verticalAlign: "top",
                                            display: "inline-block",
                                            color: "#000",
                                        }}
                                        className="fw-bolder"
                                    >
                                        {getFormattedMessage(
                                            "globally.input.notes.label"
                                        )}
                                        :{" "}
                                    </span>
                                    <p
                                        style={{
                                            fontSize: "15px",
                                            verticalAlign: "top",
                                            display: "inline-block",
                                            padding: "none !important",
                                            color: "#000",
                                        }}
                                        className="ms-2"
                                    >
                                        {paymentPrint && paymentPrint.note}
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                ) : (
                    ""
                )}
                {settings && parseInt(settings.attributes.show_note) === 1 && (
                    <h3
                        style={{
                            direction: isRTL ? "rtl" : "ltr",
                            textAlign: "center",
                            color: "#000",
                            padding: "none !important",
                        }}
                        className="notes-text"
                    >
                        {settings?.attributes?.notes || ""}
                    </h3>
                )}

                <div className="text-center d-block">
                    {settings &&
                        parseInt(
                            settings.attributes?.show_barcode_in_receipt
                        ) == 1 && (
                            <Image
                                src={paymentPrint && paymentPrint?.barcode_url}
                                alt={
                                    paymentPrint && paymentPrint?.reference_code
                                }
                                height={25}
                                width={100}
                            />
                        )}
                    <span
                        className="d-block d-flex justify-content-center"
                        style={{
                            color: "#000",
                            padding: "none !important",
                        }}
                    >
                        {paymentPrint && paymentPrint?.reference_code}
                    </span>
                </div>
            </div>
        );
    }
}

export default PrintDataSales;