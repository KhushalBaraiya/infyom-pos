import React, { useEffect } from "react";
import MasterLayout from "../MasterLayout";
import Form from "react-bootstrap/Form";
import { connect } from "react-redux";
import { Col, Row, Table } from "react-bootstrap-v5";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faLocationDot,
    faMobileAlt,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import HeaderTitle from "../header/HeaderTitle";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    getPermission,
    isPurchase,
    placeholderText,
} from "../../shared/sharedMethod";
import { fetchCustomerSaleReturnDetails } from "../../store/action/salesReturnDetailAction";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../constants";

const CustomerSaleReturnDetails = (props) => {
    const {
        fetchCustomerSaleReturnDetails,
        saleReturnDetails,
        frontSetting,
        allConfigData,
    } = props;
    const { id } = useParams();
    const isPurchaseUrl = isPurchase();

    useEffect(() => {
        fetchCustomerSaleReturnDetails(id);
    }, []);
    return (
        <MasterLayout>
            <TopProgressBar />
            <HeaderTitle
                title={isPurchaseUrl ? getFormattedMessage("purchases.return.details.title") : getFormattedMessage("sale-return.details.title")}
                to={`${isPurchaseUrl ? '/app/purchase-return' : '/app/sale-return'}`}
                editLink={getPermission(allConfigData?.permissions, Permissions.EDIT_SALE_RETURN) && `/app/sale-return/edit/${id}`}
            />
            <TabTitle title={placeholderText(isPurchaseUrl ? "purchases.return.details.title" : "sale-return.details.title")} />
            <div className="card">
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-12">
                                <h4 className="font-weight-bold text-center mb-5">
                                    {isPurchaseUrl ? getFormattedMessage(
                                        "purchases.return.details.title"
                                    ) : getFormattedMessage("sale-return.details.title")}{" "}
                                    :{" "}
                                    {saleReturnDetails &&
                                        saleReturnDetails.reference_code || saleReturnDetails?.attributes?.reference_code}
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
                                        {(saleReturnDetails.customer || saleReturnDetails?.attributes?.customer_name)&&
                                            saleReturnDetails.customer.name || saleReturnDetails?.attributes?.customer_name}
                                    </div>
                                    {saleReturnDetails.customer &&
                                            saleReturnDetails.customer.email && <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleReturnDetails.customer &&
                                            saleReturnDetails.customer.email}
                                    </div>}
                                    {saleReturnDetails.customer &&
                                            saleReturnDetails.customer.phone && <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faMobileAlt}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleReturnDetails.customer &&
                                            saleReturnDetails.customer.phone}
                                    </div>}
                                    {saleReturnDetails.customer &&
                                            saleReturnDetails.customer.address && <div className="d-flex align-items-center">
                                        <FontAwesomeIcon
                                            icon={faLocationDot}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleReturnDetails.customer &&
                                            saleReturnDetails.customer.address}
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
                                        {saleReturnDetails.company_info &&
                                            (saleReturnDetails.company_info.company_name ?? "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleReturnDetails.company_info &&
                                            (saleReturnDetails.company_info.email ?? "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center pb-1">
                                        <FontAwesomeIcon
                                            icon={faMobileAlt}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleReturnDetails.company_info &&
                                            (saleReturnDetails.company_info.phone ?? "N/A")}
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon
                                            icon={faLocationDot}
                                            className="text-primary me-2 fs-5"
                                        />
                                        {saleReturnDetails.company_info &&
                                            (saleReturnDetails.company_info.address ?? "N/A")}
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
                                            {saleReturnDetails &&
                                                saleReturnDetails.reference_code || saleReturnDetails?.attributes?.reference_code}
                                        </span>
                                    </div>
                                    <div className="pb-1">
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.status"
                                            )}{" "}
                                            :
                                        </span>
                                        {(saleReturnDetails &&
                                            saleReturnDetails.status || saleReturnDetails?.attributes?.status === 1 && (
                                                <span className="badge bg-light-success">
                                                    {getFormattedMessage(
                                                        "status.filter.received.label"
                                                    )}
                                                </span>
                                            )) ||
                                            (saleReturnDetails.status || saleReturnDetails?.attributes?.status === 2 && (
                                                <span className="badge bg-light-primary">
                                                    {getFormattedMessage(
                                                        "status.filter.pending.label"
                                                    )}
                                                </span>
                                            )) ||
                                            (saleReturnDetails.status || saleReturnDetails?.attributes?.status === 3 && (
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
                                            {saleReturnDetails.warehouse && saleReturnDetails?.attributes?.warehouse_name &&
                                                saleReturnDetails.warehouse.name || saleReturnDetails?.attributes?.warehouse_name}
                                        </span>
                                    </div>
                                    {/* <div>
                                        <span className="me-2">
                                            {getFormattedMessage(
                                                "globally.detail.payment.status"
                                            )}{" "}
                                            :
                                        </span>
                                        <span className="badge bg-light-success">
                                            {getFormattedMessage(
                                                "payment-status.filter.unpaid.label"
                                            )}
                                        </span>
                                    </div> */}
                                </div>
                            </Col>
                        </Row>
                        <div className="mt-5">
                            <h5 className="font-weight-bold text-center mb-5">
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
                                    {(saleReturnDetails?.sale_return_items || saleReturnDetails?.attributes?.sale_return_items ) &&
                                        (saleReturnDetails?.attributes?.sale_return_items || saleReturnDetails?.sale_return_items).map(
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
                                                                details?.net_unit_price
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
                                                                details?.product_price
                                                            )}
                                                        </td>
                                                        <td>
                                                            {currencySymbolHandling(
                                                                allConfigData,
                                                                frontSetting.value &&
                                                                    frontSetting
                                                                        .value
                                                                        .currency_symbol,
                                                                details?.discount_amount
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
                                {(saleReturnDetails.note || saleReturnDetails?.attributes?.note)&& <div className="card pt-7 px-2">
                                    <label className="form-label mb-0">{getFormattedMessage("globally.input.note.label")}:</label>
                                    <p className="text-gray-600">{saleReturnDetails?.attributes?.note || saleReturnDetails?.note}</p>
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
                                                            saleReturnDetails &&
                                                                (saleReturnDetails.tax_amount > 0 || saleReturnDetails.tax_amount > 0)
                                                                ? (saleReturnDetails.tax_amount || saleReturnDetails?.attributes?.tax_amount)
                                                                : "0.00"
                                                        )}{" "}
                                                        (
                                                        {saleReturnDetails &&
                                                            parseFloat(
                                                                (saleReturnDetails.tax_rate || saleReturnDetails?.attributes?.tax_rate || 0)
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
                                                            saleReturnDetails &&
                                                                (saleReturnDetails.discount > 0 || saleReturnDetails?.attributes?.discount > 0)
                                                                ? (saleReturnDetails.discount || saleReturnDetails?.attributes?.discount) : "0.00"
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
                                                            saleReturnDetails &&
                                                                (saleReturnDetails.shipping > 0 || saleReturnDetails?.attributes?.shipping > 0)
                                                                ? (saleReturnDetails.shipping || saleReturnDetails?.attributes?.shipping) : "0.00"
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
                                                            saleReturnDetails &&
                                                                (saleReturnDetails.grand_total > 0 || saleReturnDetails?.attributes?.grand_total > 0)
                                                                ? (saleReturnDetails.grand_total || saleReturnDetails?.attributes?.grand_total) : "0.00"
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
    const { saleReturnDetails, frontSetting, allConfigData } = state;
    return { saleReturnDetails, frontSetting, allConfigData };
};

export default connect(mapStateToProps, { fetchCustomerSaleReturnDetails })(
    CustomerSaleReturnDetails
);
