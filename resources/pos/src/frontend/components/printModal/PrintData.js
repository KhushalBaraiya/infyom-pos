import React from "react";
import { Table, Image } from "react-bootstrap-v5";
import { calculateProductCost } from "../../shared/SharedMethod";
import "../../../assets/scss/frontend/pdf.scss";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
} from "../../../shared/sharedMethod";
import moment from "moment";
import { Font_color, Font_size, Font_style, paymentStatusOptionsConstant, Tokens } from "../../../constants";
class PrintData extends React.PureComponent {
    render() {
        const paymentPrint = this.props.updateProducts;
        const allConfigData = this.props.allConfigData;
        const settings = this.props.settings;
        const paymentType = this.props.paymentType;
        const taxes = this.props.taxes;
        const currency =
            paymentPrint.settings &&
            paymentPrint.settings.attributes &&
            paymentPrint.settings.attributes.currency_symbol;
        
        const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);
        const isRTL = updatedLanguage === "ar";
        const isA4 = settings?.attributes?.receipt_paper_size == 0;
        const is58mm = settings?.attributes?.receipt_thermal_size == 0;

        const logoFontSize = settings?.attributes?.receipt_logo_font_size == 0 ? "18px" : settings?.attributes?.receipt_logo_font_size == 1 ? "24px" : "36px";
        const labelFontSize = Font_size.find(item => item.value == settings?.attributes?.receipt_label_font_size)?.type || 12;
        const otherFontSize = Font_size.find(item => item.value == settings?.attributes?.receipt_other_font_size)?.type || 12;
        
        const logoFontColor = Font_color.find(item => item.value == settings?.attributes?.receipt_logo_font_color)?.type || "black";
        const labelFontColor = Font_color.find(item => item.value == settings?.attributes?.receipt_label_font_color)?.type || "black";
        const otherFontColor = Font_color.find(item => item.value == settings?.attributes?.receipt_other_font_color)?.type || "black";
        
        const logoFontStyle = Font_style.find(item => item.value == settings?.attributes?.receipt_logo_font_style)?.type || "normal";
        const labelFontStyle = Font_style.find(item => item.value == settings?.attributes?.receipt_label_font_style)?.type || "normal";
        const otherFontStyle = Font_style.find(item => item.value == settings?.attributes?.receipt_other_font_style)?.type || "normal";

        const isPaid =
            paymentPrint?.payment_status?.value ==
            paymentStatusOptionsConstant.PAID &&
            paymentPrint.paid_amount >=
            parseFloat(paymentPrint.grandTotal);

        const isPartial =
            (paymentPrint?.payment_status?.value ==
                paymentStatusOptionsConstant.PARTIAL ||
                paymentPrint?.payment_status?.value ==
                paymentStatusOptionsConstant.PAID) &&
            paymentPrint.paid_amount > 0 &&
            paymentPrint.paid_amount <
            parseFloat(paymentPrint.grandTotal);

        return (
            <div
                className="print-data"
                dir={isRTL ? "rtl" : "ltr"}
                style={{
                    padding: "none !important",
                    textAlign: isRTL ? "right" : "left",
                    fontWeight: otherFontStyle,
                }}
            >
                <style>
                    {`
            @media print {
              body, html {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                 display: flex;
                justify-content: center;
                align-items: center;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
             ${
                isA4 ?`@page { size: A4 !important; margin: ${settings?.attributes?.receipt_margin}mm;}` 
                :
                is58mm ?
                `@page { size: 58mm auto !important; margin: 0mm ${settings?.attributes?.receipt_margin}mm !important;}
                 .print-data {
                   width: 100% !important;
                 }
                ` :
                `@page { size: 80mm auto !important; margin: 0mm ${settings?.attributes?.receipt_margin}mm !important;}
                .print-data {
                   width: 100% !important;
                 }
                `
             }
              [dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
              }
              [dir="rtl"] table {
                direction: rtl !important;
              }
              [dir="rtl"] th, [dir="rtl"] td {
                text-align: right !important;
              }
            }
          `}
                </style>

                {/* Logo */}
                <div className="mt-4 mb-4 text-center" style={{ color: logoFontColor }}>
                    {paymentPrint.settings &&
                    parseInt(
                        paymentPrint.settings.attributes.show_logo_in_receipt
                    ) == 1 ? (
                        <img
                            src={
                                paymentPrint.settings &&
                                paymentPrint.settings.attributes.logo
                            }
                            alt=""
                            width="100px"
                            style={{ maxHeight: "60px", maxWidth: "100%"}}
                        />
                    ) : (
                        ""
                    )}
                </div>
                <div
                    className="mt-4 mb-4 text-center"
                    style={{
                        fontSize: `${logoFontSize}`,
                        fontWeight: logoFontStyle,
                        color: logoFontColor,
                        marginBottom: "15px !important",
                    }}
                >
                    {paymentPrint.settings &&
                        paymentPrint.settings?.attributes?.store_name}
                </div>
                <div
                    className="mb-2"
                    style={{
                        textAlign: "center",
                        direction: isRTL ? "rtl" : "ltr",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {taxes?.length > 0 &&
                        taxes
                            ?.filter((tax) => tax.attributes.status == 1)
                            ?.map((tax, index) => (
                                <div
                                    key={index}
                                    style={{
                                        textAlign: "center",
                                        width: "100%",
                                    }}
                                >
                                    <p
                                        className="mb-0"
                                        style={{
                                            margin: 0,
                                            textAlign: "center",
                                            direction: isRTL ? "rtl" : "ltr",
                                            display: "inline-block",
                                        }}
                                    >
                                        {tax.attributes.name && (
                                            <>
                                                <span style={{fontSize: labelFontSize, color:labelFontColor, fontWeight: labelFontStyle}}>{tax.attributes.name}</span>
                                                <span>
                                                    {isRTL ? "\u061B" : ":"}
                                                </span>
                                            </>
                                        )}
                                        {tax.attributes.number && (
                                            <span style={{fontSize:otherFontSize, color:otherFontSize, fontWeight:otherFontStyle}}>{" "}{tax.attributes.number}</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                </div>

                {/* Store Info */}
                <section className="product-border">
                    <div style={{ marginBottom: "4px", fontSize: `${labelFontSize}px` }}>
                        <span className="me-2" style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                            {getFormattedMessage(
                                "react-data-table.date.column.label"
                            )}
                            :
                        </span>
                        <span style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                            {getFormattedDate(new Date(), allConfigData)}{" "}
                            {moment().format("hh:mm A")}
                        </span>
                    </div>

                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_address
                        ) == 1 && (
                            <div style={{ marginBottom: "4px", fontSize: `${labelFontSize}px` }}>
                                <span className="me-2" style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                                    {getFormattedMessage(
                                        "supplier.table.address.column.title"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                    {paymentPrint.frontSetting?.value
                                        ?.address || ""}
                                </span>
                            </div>
                        )}

                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_email
                        ) == 1 && (
                            <div style={{ marginBottom: "4px", fontSize: `${labelFontSize}px` }}>
                                <span className="me-2" style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                                    {getFormattedMessage(
                                        "globally.input.email.label"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                    {paymentPrint.frontSetting?.value?.email ||
                                        ""}
                                </span>
                            </div>
                        )}

                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_phone
                        ) == 1 && (
                            <div style={{ marginBottom: "4px", fontSize: `${labelFontSize}px` }}>
                                <span className="me-2" style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                                    {getFormattedMessage(
                                        "pos-sale.detail.Phone.info"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                    {paymentPrint.frontSetting?.value?.phone ||
                                        ""}
                                </span>
                            </div>
                        )}

                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_customer
                        ) == 1 && (
                            <div style={{ fontSize: `${labelFontSize}px` }}>
                                <span className="me-2" style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                                    {getFormattedMessage(
                                        "dashboard.recentSales.customer.label"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                    {paymentPrint.customer_name &&
                                    paymentPrint.customer_name[0]
                                        ? paymentPrint.customer_name[0].label
                                        : paymentPrint.customer_name?.label}
                                </span>
                            </div>
                        )}
                </section>

                {/* Product List */}
                {isRTL ? <section className="mt-3">
                    {paymentPrint.products &&
                        paymentPrint.products.map((productName, index) => (
                            <div key={index + 1} style={{ fontSize: `${labelFontSize}px` }}>
                                <div className="p-0">
                                    <span style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                                        {productName.name}{" "}
                                        {paymentPrint.settings &&
                                        parseInt(
                                            paymentPrint.settings.attributes
                                                .show_product_code
                                        ) == 1 ? (
                                            <span>({productName.code})</span>
                                        ) : (
                                            ""
                                        )}
                                    </span>
                                </div>

                                {paymentPrint?.settings?.attributes
                                    ?.show_tax == "1" && (
                                    <div
                                        className="d-flex justify-content-between"
                                        style={{
                                            flexDirection: isRTL
                                                ? "row-reverse"
                                                : "row",
                                        }}
                                    >
                                        <p className="m-0 ws-6" style={{ fontWeight: labelFontStyle, color: labelFontColor, fontSize: `${labelFontSize}px` }}>
                                            {getFormattedMessage(
                                                "globally.detail.tax"
                                            )}
                                            :{" "}
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName.tax_amount
                                            )}{" "}
                                            ({productName.tax_value}%)
                                        </p>
                                        <p className="m-0 ws-6" style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                            {getFormattedMessage(
                                                "product.table.price.column.label"
                                            )}
                                            :{" "}
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName.product_price
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="product-border">
                                    <div
                                        className="border-0 d-flex justify-content-between"
                                        style={{
                                            flexDirection: "row",
                                        }}
                                    >

                                        <span dir="rtl" style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                             <span dir="ltr">
                                                    {currencySymbolHandling(
                                                    allConfigData,
                                                    currency,
                                                    parseFloat(calculateProductCost(productName))?.toFixed(2))}&nbsp;X&nbsp;{parseFloat(productName.quantity).toFixed(2)} {productName.sale_unit_name}
                                                </span>
                                        </span>
                                        <span dir="rtl" style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName.quantity * calculateProductCost(productName)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </section> : 
                <section className="mt-3">
                    {paymentPrint.products &&
                        paymentPrint.products.map((productName, index) => (
                            <div key={index + 1} style={{ fontSize: `${labelFontSize}px` }}>
                                <div className="p-0">
                                    <span style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                                        {productName.name}{" "}
                                        {paymentPrint.settings &&
                                        parseInt(
                                            paymentPrint.settings.attributes
                                                .show_product_code
                                        ) == 1 ? (
                                            <span>({productName.code})</span>
                                        ) : (
                                            ""
                                        )}
                                    </span>
                                </div>

                                {paymentPrint?.settings?.attributes
                                    ?.show_tax == "1" && (
                                    <div
                                        className="d-flex justify-content-between"
                                        style={{
                                            flexDirection: isRTL
                                                ? "row-reverse"
                                                : "row",
                                        }}
                                    >
                                        <p className="m-0 ws-6" style={{ fontWeight: labelFontStyle, color: labelFontColor, fontSize: `${labelFontSize}px` }}>
                                            {getFormattedMessage(
                                                "product.table.price.column.label"
                                            )}
                                            :{" "}
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName.product_price
                                            )}
                                        </p>
                                        <p className="m-0 ws-6" style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                            {getFormattedMessage(
                                                "globally.detail.tax"
                                            )}
                                            :{" "}
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName.tax_amount
                                            )}{" "}
                                            ({productName.tax_value}%)
                                        </p>
                                    </div>
                                )}

                                <div className="product-border">
                                    <div
                                        className="border-0 d-flex justify-content-between"
                                        style={{
                                            flexDirection: isRTL ? "row-reverse" : "row",
                                        }}
                                    >

                                        <span style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                            {isRTL ? (
                                                <span>
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        currency,
                                                        parseFloat(calculateProductCost(productName))?.toFixed(2))} X {" "}
                                                    {parseFloat(productName.quantity).toFixed(2)} {productName.sale_unit_name}
                                                </span>
                                            ) : (
                                                <span>
                                                    {parseFloat(productName.quantity).toFixed(2)} {productName.sale_unit_name} X {" "}
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        currency,
                                                        parseFloat(calculateProductCost(productName))?.toFixed(2))}
                                                </span>
                                            )}
                                        </span>
                                        <span dir="auto" style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName.quantity * calculateProductCost(productName)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </section>
                }
                
                {/* Totals */}
                <section
                    className="mt-3 product-border"
                    style={{
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                    }}
                >
                    {[
                        { label: "pos-total-amount.title", value: paymentPrint.subTotal || "0.00" },
                        paymentPrint.settings &&
                        parseInt(paymentPrint.settings.attributes.show_tax) === 1 && {
                            label: "globally.detail.order.tax",
                            suffix: Number(paymentPrint.tax) > 0 ? `(${Number(paymentPrint.tax).toFixed(2)}%)` : "",
                            value: paymentPrint.taxTotal || "0.00",
                        },
                        paymentPrint.settings &&
                        parseInt(paymentPrint.settings.attributes.show_tax_discount_shipping) === 1 && {
                            label: "globally.detail.discount",
                            value: paymentPrint.discount || "0.00",
                        },
                        paymentPrint.settings &&
                        parseInt(paymentPrint.settings.attributes.show_tax_discount_shipping) === 1 &&
                        parseFloat(paymentPrint.shipping) !== 0.0 && {
                            label: "globally.detail.shipping",
                            value: paymentPrint.shipping || "0.00",
                        },
                        { label: "globally.detail.grand.total", value: paymentPrint.grandTotal },
                        {
                            label: "sale-paid.total.amount.title",
                            value: parseFloat(paymentPrint.grandTotal || 0) + (paymentPrint.changeReturn || 0),
                        },
                        ...(isPaid && paymentPrint.changeReturn && parseFloat(paymentPrint.changeReturn) > 0 ? [{
                            label: "pos.change-return.label",
                            value:  paymentPrint.changeReturn
                        }] : []),
                        ...(isPartial ? [{
                            label: "globally.detail.due",
                            value:
                                (parseFloat(
                                    paymentPrint.grandTotal
                                ) -
                                parseFloat(
                                    paymentPrint.paid_amount
                                ))
                        }] : []),
                    ]
                        .filter(Boolean)
                        .map((item, i) => {
                            const labelElement = (
                                <span style={{ display: "inline-flex", gap: "4px", alignItems: "center", fontWeight: labelFontStyle, color: labelFontColor, fontSize: `${labelFontSize}px` }}>
                                    <>
                                        {getFormattedMessage(item.label)}
                                        {item.suffix ? ` ${item.suffix}` : ""} :
                                    </>
                                </span>
                            );

                            const valueElement = (
                                <div style={{ fontWeight: otherFontStyle, color: otherFontColor, fontSize: `${otherFontSize}px` }}>
                                    {currencySymbolHandling(allConfigData, currency, item.value)}
                                </div>
                            );

                            return (
                                <div
                                    key={i}
                                    className="d-flex align-items-center justify-content-between"
                                    style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: "10px", marginBottom: "2px" }}
                                >
                                    {isRTL ? (
                                        <>
                                            {valueElement}
                                            {labelElement}
                                        </>
                                    ) : (
                                        <>
                                            {labelElement}
                                            {valueElement}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                </section>

                {/* Payment Info */}
                {(() => {
                    return (
                        <>
                            {(isPaid || isPartial) && (
                                <Table
                                    style={{
                                        padding: "none !important",
                                        marginTop: "20px !important",
                                        direction: isRTL ? "rtl" : "ltr",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    textAlign: isRTL
                                                        ? "right"
                                                        : "start",
                                                    color: labelFontColor,
                                                    fontWeight: labelFontStyle,
                                                }}
                                            >
                                                <span style={{ fontSize: `${labelFontSize}px` }}>
                                                {getFormattedMessage(
                                                    "pos-sale.detail.paid-by.title"
                                                )}
                                                </span>
                                            </th>
                                            <th style={{ textAlign: "center", color: labelFontColor, fontWeight: labelFontStyle }}>
                                                <span style={{ fontSize: `${labelFontSize}px` }}>
                                                {getFormattedMessage(
                                                    "expense.input.amount.label"
                                                )}
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentPrint && paymentPrint?.payments?.length > 0 ? (
                                            paymentPrint?.payments.map((payment, index) => (
                                                <tr key={index}>
                                                    <td style={{ color: otherFontColor, fontWeight: otherFontStyle}}><span style={{fontSize: `${otherFontSize}px` }}>{payment?.payment_method?.name}</span></td>
                                                    <td style={{ textAlign: "center"}}>
                                                        <span style={{color: otherFontColor, fontWeight: otherFontStyle, fontSize: `${otherFontSize}px`}}>{currencySymbolHandling(
                                                            allConfigData,
                                                            currency,
                                                            payment?.amount
                                                        )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td style={{ color: otherFontColor, fontWeight: otherFontStyle, fontSize: `${otherFontSize}px` }}>{paymentType}</td>
                                                <td style={{ textAlign: "center", color: otherFontColor, fontWeight: otherFontStyle, fontSize: `${otherFontSize}px` }}>
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        currency,
                                                        paymentPrint.grandTotal
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </>
                    );
                })()}

                {/* Unpaid Notice */}
                {paymentPrint?.payment_status?.value ==
                    paymentStatusOptionsConstant.UNPAID && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "20px 0",
                            marginBottom: "15px",
                        }}
                    >
                        <h3
                            style={{
                                color: "#dc3545",
                                fontWeight: "bold",
                                marginBottom: "10px",
                                fontSize: `${labelFontSize}px`
                            }}
                        >
                            {getFormattedMessage(
                                "payment-status.filter.unpaid.label"
                            )}
                        </h3>
                        <div style={{ color: otherFontColor, fontWeight: otherFontStyle, fontSize: `${otherFontSize}px` }}>
                            {getFormattedMessage("sale-Due.total.amount.title")}
                            :{" "}
                            {currencySymbolHandling(
                                allConfigData,
                                currency,
                                paymentPrint.grandTotal
                            )}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {paymentPrint?.note && (
                    <Table>
                        <tbody>
                            <tr style={{ border: "0" }}>
                                <td
                                    scope="row"
                                    style={{
                                        padding: "none !important",
                                        fontSize: `${labelFontSize}px`,
                                        color: labelFontColor,
                                    }}
                                >
                                    <span className="me-2" style={{ fontWeight: labelFontStyle, color: labelFontColor }}>
                                        {getFormattedMessage(
                                            "globally.input.notes.label"
                                        )}
                                        :
                                    </span>
                                    <p
                                        style={{
                                            fontSize: `${otherFontSize}px`,
                                            display: "inline-block",
                                            margin: "0",
                                            fontWeight: otherFontStyle,
                                            color: otherFontColor,
                                        }}
                                    >
                                        {paymentPrint.note}
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                )}

                {paymentPrint.settings &&
                    parseInt(paymentPrint.settings.attributes.show_note) ==
                        1 && (
                        <h3
                            style={{
                                textAlign: "center",
                                color: labelFontColor,
                                fontSize: `${labelFontSize}px`,
                                fontWeight: labelFontStyle,
                            }}
                        >
                            {paymentPrint.settings.attributes.notes || ""}
                        </h3>
                    )}

                {/* Barcode */}
                <div className="text-center d-block">
                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes
                                ?.show_barcode_in_receipt
                        ) == 1 && (
                            <Image
                                src={paymentPrint.barcode_url}
                                alt={paymentPrint.reference_code}
                                height={25}
                                width={100}
                                style={{ maxWidth: "100%", height: "auto" }}
                            />
                        )}
                        <span
                            className="d-block d-flex justify-content-center"
                            style={{
                                color: otherFontColor,
                                fontWeight: otherFontStyle,
                                fontSize: `${otherFontSize}px`,
                            }}
                        >
                            {paymentPrint.reference_code}
                        </span>
                </div>
            </div>
        );
    }
}

export default PrintData;
