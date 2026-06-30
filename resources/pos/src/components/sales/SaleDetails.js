import React, { useEffect } from "react";
import Form from "react-bootstrap/Form";
import { connect } from "react-redux";
import { Col, Row, Table } from "react-bootstrap-v5";
import { useParams } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    getPermission,
    isPurchase,
    placeholderText,
} from "../../shared/sharedMethod";
import { saleDetailsAction } from "../../store/action/saleDetailsAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faLocationDot,
    faMobileAlt,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../constants";
import CustomerSalesDetails from "./customerSalesDetails";


const SaleDetails = (props) => {
    const {
        saleDetailsAction,
        saleDetails,
        frontSetting,
        allConfigData,
    } = props;
    const { id } = useParams();

    useEffect(() => {
        saleDetailsAction(id);
    }, []);
    const isPurchaseUrl = isPurchase();

    if(isPurchaseUrl) return <CustomerSalesDetails/>
    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={ isPurchaseUrl ? getFormattedMessage("purchase.title") : getFormattedMessage("sale.details.title")}
                to={`/app/${isPurchaseUrl ? "purchases" : "sales"}`}
                editLink={getPermission(allConfigData?.permissions, Permissions.EDIT_SALE) && `/app/sales/edit/${id}`}
            />
            <TabTitle title={placeholderText(isPurchaseUrl ? "purchase.title" : "sale.details.title")} />
            <div className="card">
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-12">
                                <h4 className="font-weight-bold text-center mb-5">
                                    {isPurchaseUrl ? getFormattedMessage("purchase.title") : getFormattedMessage("sale.details.title")}{" "}
                                    :{" "}
                                    {saleDetails && saleDetails.reference_code || saleDetails?.attributes?.reference_code}
                                </h4>
                            </div>
                        </div>
                        <Row className="custom-line-height">
                            <Col md={4}>
                                <h5 className="text-gray-600 bg-light p-4 mb-0 text-uppercase">
                                    {getFormattedMessage(
                                        "sale.detail.customer.info"
                                    )}
                                </h5>
                                <div className="p-4">
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleDetails.customer &&
                                            saleDetails.customer.name || saleDetails?.attributes?.customer_name}
                                    </div>
                                    {saleDetails.customer && saleDetails.customer.phone && <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faMobileAlt}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleDetails.customer &&
                                            saleDetails.customer.phone}
                                    </div>}
                                    {saleDetails.customer && saleDetails.customer.address && <div className="d-flex align-items-center">
                                        <FontAwesomeIcon
                                            icon={faLocationDot}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleDetails.customer &&
                                            saleDetails.customer.address}
                                    </div>}
                                </div>
                            </Col>
                            <Col md={4}>
                                <h5 className="text-gray-600 bg-light p-4 mb-0 text-uppercase">
                                    {getFormattedMessage(
                                        "globally.detail.company.info"
                                    )}
                                </h5>
                                <div className="p-4">
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleDetails.company_info &&
                                            (saleDetails.company_info
                                                .company_name ??
                                                "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faMobileAlt}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleDetails.company_info &&
                                            (saleDetails.company_info.phone ??
                                                "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon
                                            icon={faLocationDot}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleDetails.company_info &&
                                            (saleDetails.company_info.address ??
                                                "N/A")}
                                    </div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <h5 className="text-gray-600 bg-light p-4 mb-0 text-uppercase">
                                    {getFormattedMessage(
                                        "sale.detail.invoice.info"
                                    )}
                                </h5>
                                <div className="p-4">
                                    <div className="pb-1">
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.reference"
                                            )}{" "}
                                            :
                                        </span>
                                        <span>
                                            {saleDetails &&
                                                saleDetails?.attributes?.reference_code || saleDetails.reference_code}
                                        </span>
                                    </div>
                                    <div className="pb-1">
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.status"
                                            )}{" "}
                                            :
                                        </span>
                                        {(saleDetails &&
                                           ( saleDetails.status === 1 || saleDetails.attributes?.status === 1) && (
                                                <span className="badge bg-light-success">
                                                    {getFormattedMessage(
                                                        "status.filter.received.label"
                                                    )}
                                                </span>
                                            )) ||
                                            ((saleDetails.status === 2 || saleDetails.attributes?.status === 2) && (
                                                <span className="badge bg-light-primary">
                                                    {getFormattedMessage(
                                                        "status.filter.pending.label"
                                                    )}
                                                </span>
                                            )) ||
                                            ((saleDetails.status === 3 || saleDetails.attributes?.status === 3) && (
                                                <span className="badge bg-light-warning">
                                                    {getFormattedMessage(
                                                        "status.filter.ordered.label"
                                                    )}
                                                </span>
                                            ))}
                                    </div>
                                    <div className="pb-1">
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.warehouse"
                                            )}{" "}
                                            :
                                        </span>
                                        <span>
                                            {(saleDetails.warehouse || saleDetails?.attributes?.warehouse_name)&&
                                                (saleDetails?.warehouse?.name || saleDetails?.attributes?.warehouse_name)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.payment.status"
                                            )}{" "}
                                            :
                                        </span>
                                        {(saleDetails &&
                                            (saleDetails.payment_status || saleDetails?.attributes?.payment_status) ===
                                                1 && (
                                                <span className="badge bg-light-success">
                                                    {getFormattedMessage(
                                                        "payment-status.filter.paid.label"
                                                    )}
                                                </span>
                                            )) ||
                                            ((saleDetails.payment_status || saleDetails?.attributes?.payment_status) ===
                                                2 && (
                                                <span className="badge bg-light-warning">
                                                    {getFormattedMessage(
                                                        "payment-status.filter.unpaid.label"
                                                    )}
                                                </span>
                                            )) ||
                                            ((saleDetails.payment_status || saleDetails?.attributes?.payment_status) ===
                                                3 && (
                                                <span className="badge bg-light-warning">
                                                    {getFormattedMessage(
                                                        "payment-status.filter.partial.label"
                                                    )}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <div className="mt-5">
                            <h5 className="text-gray-600 bg-light p-4 mb-5 text-uppercase">
                                {getFormattedMessage(
                                    "globally.detail.order.summary"
                                )}
                            </h5>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.product"
                                            )}
                                        </th>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.net-unit-price"
                                            )}
                                        </th>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.quantity"
                                            )}
                                        </th>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.unit-price"
                                            )}
                                        </th>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.discount"
                                            )}
                                        </th>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.tax"
                                            )}
                                        </th>
                                        <th colSpan={2}>
                                            {getFormattedMessage(
                                                "globally.detail.subtotal"
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(saleDetails.sale_items || saleDetails?.attributes?.sale_items) &&
                                        (saleDetails.sale_items || saleDetails?.attributes?.sale_items).map(
                                            (details, index) => {
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="align-middle"
                                                    >
                                                        <td className="ps-3">
                                                            {details.product &&
                                                                details.product
                                                                    .name || details?.attributes?.product_name }{" "}
                                                            (
                                                            {details.product &&
                                                                details.product
                                                                    .code}
                                                            )
                                                        </td>
                                                        <td>
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                details.net_unit_price
                                                            )}
                                                        </td>
                                                        <td>
                                                            {details.quantity}
                                                        </td>
                                                        <td>
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                details.product_price
                                                            )}
                                                        </td>
                                                        <td>
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                details.discount_amount
                                                            )}
                                                        </td>
                                                        <td>
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                details.tax_amount
                                                            )}
                                                        </td>
                                                        <td>
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                details.sub_total
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                </tbody>
                            </Table>
                        </div>
                        <div className="row">
                            <div className="col-xxl-7 col-lg-6 col-md-6 col-12">
                                {(saleDetails.payments || saleDetails?.attributes?.payments)&&
                                    (saleDetails.payments || saleDetails?.attributes?.payments).length > 0 && (
                                        <div className="mt-5">
                                            <h5 className="text-gray-600 bg-light p-4 mb-5 text-uppercase">
                                                {getFormattedMessage(
                                                    "globally.detail.payment.details"
                                                )}
                                            </h5>
                                            <Table responsive>
                                                <thead>
                                                    <tr>
                                                        <th className="ps-3">
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
                                                                "globally.react-table.column.payment-type.label"
                                                            )}
                                                        </th>
                                                        <th className="ps-3">
                                                            {getFormattedMessage(
                                                                "expense.input.amount.label"
                                                            )}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(saleDetails.payments || saleDetails?.attributes?.payments).map(
                                                        (payment, index) => (
                                                            <tr
                                                                key={index}
                                                                className="align-middle"
                                                            >
                                                                <td className="ps-3">
                                                                    {payment.payment_date
                                                                        ? new Date(
                                                                              payment.payment_date
                                                                          ).toLocaleDateString()
                                                                        : "N/A"}
                                                                </td>
                                                                <td className="ps-3">
                                                                    {payment.reference ||
                                                                        "N/A"}
                                                                </td>
                                                                <td className="ps-3">
                                                                    {payment.payment_method
                                                                        ? payment
                                                                              .payment_method
                                                                              .name
                                                                        : "N/A"}
                                                                </td>
                                                                <td className="ps-3">
                                                                    {currencySymbolHandling(
                                                                        allConfigData,
                                                                        frontSetting.value &&
                                                                            frontSetting
                                                                                .value
                                                                                .currency_symbol,
                                                                        payment.amount
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                {(saleDetails.note || saleDetails?.attributes?.note)  && (
                                    <div className="card pt-7 px-2">
                                        <label className="form-label mb-0">
                                            {getFormattedMessage(
                                                "globally.input.note.label"
                                            )}
                                            :
                                        </label>
                                        <p className="text-gray-600">
                                            {saleDetails.note || saleDetails?.attributes?.note}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="col-xxl-5 col-lg-6 col-md-6 col-12 float-end">
                                <div className="card">
                                    <div className="card-body pt-7 pb-2">
                                        <div className="table-responsive">
                                            <table className="table border">
                                                <tbody>
                                                    <tr>
                                                        <td className="py-3">
                                                            {getFormattedMessage(
                                                                "globally.detail.order.tax"
                                                            )}
                                                        </td>
                                                        <td className="py-3">
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                saleDetails &&
                                                                    saleDetails.tax_amount  >
                                                                        0
                                                                    ? saleDetails.tax_amount
                                                                    : "0.00"
                                                            )}{" "}
                                                            (
                                                            {saleDetails &&
                                                                parseFloat(
                                                                    saleDetails.tax_rate 
                                                                ).toFixed(2)}
                                                            %)
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-3">
                                                            {getFormattedMessage(
                                                                "globally.detail.discount"
                                                            )}
                                                        </td>
                                                        <td className="py-3">
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                saleDetails &&
                                                                    saleDetails.discount
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-3">
                                                            {getFormattedMessage(
                                                                "globally.detail.shipping"
                                                            )}
                                                        </td>
                                                        <td className="py-3">
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                saleDetails &&
                                                                    saleDetails.shipping 
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-3 text-primary">
                                                            {getFormattedMessage(
                                                                "globally.detail.grand.total"
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-primary">
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                saleDetails &&
                                                                    saleDetails.grand_total
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { saleDetails, frontSetting, allConfigData } = state;
    return { saleDetails, frontSetting, allConfigData };
};

export default connect(mapStateToProps, {
    saleDetailsAction,
})(SaleDetails);
