import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Col, Row, Table } from "react-bootstrap-v5";
import Form from "react-bootstrap/Form";
import { connect, useSelector } from "react-redux";
import {
    faUser,
    faEnvelope,
    faLocationDot,
    faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    getPermission,
    isPurchase,
    paymentMethodName,
    placeholderText,
} from "../../shared/sharedMethod";
import { purchaseDetailsAction } from "../../store/action/purchaseDetailsAction";
import { fetchFrontSetting } from "../../store/action/frontSettingAction";
import { fetchPaymentMethods } from "../../store/action/paymentMethodAction";
import { Permissions } from "../../constants";
import CustomerSalesDetails from "../sales/customerSalesDetails";

const PurchaseDetails = (props) => {
    const {
        purchaseDetailsAction,
        purchaseDetails,
        frontSetting,
        allConfigData,
        paymentMethods,
        fetchPaymentMethods
    } = props;
    const { id } = useParams();
    const {config} = useSelector(state=>state)

    useEffect(() => {
        fetchPaymentMethods();
    }, []);
    
    const ispurchaseUrl = isPurchase();
    if(!ispurchaseUrl) return <CustomerSalesDetails/>

    useEffect(() => {
        const type = config.includes(Permissions.MANAGE_CUSTOMERS_PURCHASE);
        purchaseDetailsAction(id, type ? true : false);
    }, []);

    return (
        <MasterLayout>
            <HeaderTitle
                title={getFormattedMessage("purchases.details.title")}
                to="/app/purchases"
                editLink={getPermission(allConfigData?.permissions, Permissions.EDIT_PURCHASE) && `/app/purchases/edit/${id}`}
            />
            <TabTitle title={placeholderText("purchases.details.title")} />
            <div className="card">
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-12">
                                <h4 className="font-weight-bold text-center mb-5">
                                    {getFormattedMessage(
                                        "purchases.details.title"
                                    )}{" "}
                                    :{" "}
                                    {purchaseDetails &&
                                        purchaseDetails.reference_code}
                                </h4>
                            </div>
                        </div>
                        <Row className="custom-line-height">
                            <Col md={4}>
                                <h5 className="text-gray-600 bg-light p-4 mb-0 text-uppercase">
                                    {getFormattedMessage(
                                        "purchase.detail.supplier.info"
                                    )}
                                </h5>
                                <div className="p-4">
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {purchaseDetails.supplier &&
                                            purchaseDetails.supplier.name}
                                    </div>
                                    {purchaseDetails.supplier &&
                                            purchaseDetails.supplier.email && <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {purchaseDetails.supplier &&
                                            purchaseDetails.supplier.email}
                                    </div>}
                                    {purchaseDetails.supplier && purchaseDetails.supplier.phone && <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faMobileAlt}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {purchaseDetails.supplier &&
                                            purchaseDetails.supplier.phone}
                                    </div>}
                                    {purchaseDetails.supplier && purchaseDetails.supplier.address && <div className="d-flex align-items-center">
                                        <FontAwesomeIcon
                                            icon={faLocationDot}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {purchaseDetails.supplier &&
                                            purchaseDetails.supplier.address}
                                    </div>}
                                </div>
                            </Col>
                            <Col md={4} className="m-md-0 m-4">
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
                                        {purchaseDetails.company_info && 
                                            (purchaseDetails.company_info.company_name ?? "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {purchaseDetails.company_info &&
                                            (purchaseDetails.company_info.email ?? "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faMobileAlt}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {purchaseDetails.company_info &&
                                            (purchaseDetails.company_info.phone ?? "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon
                                            icon={faLocationDot}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {purchaseDetails.company_info &&
                                            (purchaseDetails.company_info.address ?? "N/A")}
                                    </div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <h5 className="text-gray-600 bg-light p-4 mb-0 text-uppercase">
                                    {getFormattedMessage(
                                        "purchase.detail.purchase.info"
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
                                            {purchaseDetails &&
                                                purchaseDetails.reference_code}
                                        </span>
                                    </div>
                                    <div className="pb-1">
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.status"
                                            )}{" "}
                                            :
                                        </span>
                                        {(purchaseDetails &&
                                            purchaseDetails.status == 1 && (
                                                <span className="badge bg-light-success">
                                                    {getFormattedMessage(
                                                        "status.filter.received.label"
                                                    )}
                                                </span>
                                            )) ||
                                            (purchaseDetails.status == 2 && (
                                                <span className="badge bg-light-primary">
                                                    {getFormattedMessage(
                                                        "status.filter.pending.label"
                                                    )}
                                                </span>
                                            )) ||
                                            (purchaseDetails.status == 3 && (
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
                                            {purchaseDetails.warehouse &&
                                                purchaseDetails.warehouse.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.payment.status"
                                            )}{" "}
                                            :
                                        </span>
                                        {(purchaseDetails &&
                                            purchaseDetails.payment_status ==
                                            1 && (
                                                <span className="badge bg-light-success">
                                                    {getFormattedMessage(
                                                        "payment-status.filter.paid.label"
                                                    )}
                                                </span>
                                            )) ||
                                            ((purchaseDetails.payment_status == null || purchaseDetails.payment_status == 2) && (
                                                    <span className="badge bg-light-danger">
                                                        {getFormattedMessage(
                                                            "payment-status.filter.unpaid.label"
                                                        )}
                                                    </span>
                                            )) ||
                                            (purchaseDetails.payment_status ==
                                            3 && (
                                                    <span className="badge bg-light-warning">
                                                        {getFormattedMessage(
                                                            "payment-status.filter.partial.label"
                                                        )}
                                                    </span>
                                            ))}
                                    </div>
                                    {!(purchaseDetails.payment_status == null || purchaseDetails.payment_status == 2) && <div>
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.react-table.column.payment-type.label"
                                            )}{" "}
                                            :
                                        </span>
                                        {(purchaseDetails && (
                                            <span className="badge bg-light-primary mt-1">
                                                {paymentMethodName(paymentMethods, purchaseDetails)}
                                            </span>
                                        ))}
                                    </div>}
                                </div>
                            </Col>
                        </Row>
                        <div className="mt-5">
                            <h5 className="text-gray-600 bg-light p-4 mb-4 text-uppercase">
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
                                                "globally.detail.net-unit-cost"
                                            )}
                                        </th>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.quantity"
                                            )}
                                        </th>
                                        <th className="ps-3">
                                            {getFormattedMessage(
                                                "globally.detail.unit-cost"
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
                                    {purchaseDetails.purchase_items &&
                                        purchaseDetails.purchase_items.map(
                                            (details, index) => {
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="align-middle"
                                                    >
                                                        <td className="ps-3">
                                                            {details.product &&
                                                                details.product
                                                                    .name}{" "}
                                                            (
                                                            {details.product &&
                                                                details.product
                                                                    .code}{" "}
                                                            )
                                                        </td>
                                                        <td>
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                details.net_unit_cost
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
                                                                details.product
                                                                    .product_cost
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
                            {purchaseDetails.notes && <div className="card pt-7 px-2">
                                    <label className="form-label mb-0">{getFormattedMessage("globally.input.note.label")}:</label>
                                    <p className="text-gray-600">{purchaseDetails.notes}</p>
                                </div>}
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
                                                            purchaseDetails &&
                                                                purchaseDetails.tax_amount >
                                                                    0
                                                                ? purchaseDetails.tax_amount
                                                                : "0.00"
                                                        )}{" "}
                                                        (
                                                        {purchaseDetails &&
                                                            parseFloat(
                                                                purchaseDetails.tax_rate
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
                                                            purchaseDetails &&
                                                                purchaseDetails.discount
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
                                                            purchaseDetails &&
                                                                purchaseDetails.shipping
                                                        )}
                                                    </td>
                                                </tr>
                                                {purchaseDetails.payment_status != null && purchaseDetails.payment_status != 2 && <tr>
                                                    <td className="py-3">
                                                        {getFormattedMessage("paid.amount.title")}
                                                    </td>
                                                    <td className="py-3">
                                                        {currencySymbolHandling(
                                                            allConfigData,
                                                            frontSetting.value &&
                                                                frontSetting
                                                                    .value
                                                                    .currency_symbol,
                                                            purchaseDetails && 
                                                            (purchaseDetails.payment_status == 1 ? purchaseDetails.grand_total : purchaseDetails.partial_amount)    
                                                        )}
                                                    </td>
                                                </tr>}
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
                                                            purchaseDetails &&
                                                                purchaseDetails.grand_total
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
    const { purchaseDetails, frontSetting, allConfigData, paymentMethods } = state;
    return { purchaseDetails, frontSetting, allConfigData, paymentMethods };
};

export default connect(mapStateToProps, {
    purchaseDetailsAction,
    fetchPaymentMethods
})(PurchaseDetails);
