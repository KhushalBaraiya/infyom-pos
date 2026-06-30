import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { Permissions } from "../../constants";
import { useResponsiveLimit } from "../../utils/useResponsiveLimit";

const AsideTopSubMenuItem = (props) => {
    const { asideConfig, isMenuCollapse } = props;
    const config = useSelector((state) => state.config);
    const location = useLocation();
    const id = useParams();
    const { limit, lessThanLimit } = useResponsiveLimit();       

    const allowedMobilePaths = [
        "/app/report",
        "/app/settings",
        "/app/prefixes",
        "/app/mail-settings",
        "/app/receipt-settings",
        "/app/pos-settings",
        "/app/taxes",
        "/app/dual-screen-settings",
        "/app/currency-settings",
        "/app/fiscal-year-settings",
    ];

    const isMobileDropdownVisible = allowedMobilePaths.some((path) =>
        location.pathname.includes(path)
    );

    const renderedTitles = new Set();
    const renderedRoutes = new Set();
    
    const activeSection = asideConfig?.find((section) =>
        location.pathname.includes(section.to) ||
        location.pathname.includes(section.path) ||
        location.pathname.includes(section.stockPath) ||
        location.pathname.includes(section.purchasePath) ||
        location.pathname.includes(section.topSellingPath) ||
        location.pathname.includes(section.stockDetailPath) ||
        location.pathname.includes(section.productQuantityAlertPath) ||
        location.pathname.includes(section.supplierReportPath) ||
        location.pathname.includes(section.profitLossReportPath) ||
        location.pathname.includes(section.supplierReportDetailsPath) ||
        location.pathname.includes(section.bestCustomerReportPath) ||
        location.pathname.includes(section.customerReportPath) ||
        location.pathname.includes(section.customerReportDetailsPath) ||
        location.pathname.includes(section.registerReportPath) ||
        location.pathname.includes(section.fiscalYearSettingsPath) ||
        location.pathname.includes(section.prefixesPath) ||
        location.pathname.includes(section.mailSettingsPath) ||
        location.pathname.includes(section.receiptSettingsPath) ||
        location.pathname.includes(section.taxesPath) ||
        location.pathname.includes(section.posSettingsPath) ||
        location.pathname.includes(section.dualScreenSettingsPath) ||
        location.pathname.includes(section.currencySettingsPath)
    );

    return (
        <>
            {(isMobileDropdownVisible) &&
                <Dropdown className="d-flex md-w-100 w-50 md-ms-2 ms-1 justify-content-start align-items-center me-2 d-xxl-none">
                    <Dropdown.Toggle variant="primary" id="dropdown-basic" className="report-more-btn px-2 px-sm-3">
                        {activeSection
                            ? getFormattedMessage(activeSection.title)
                            : "More..."}
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="report-more-btn-menu">
                        {asideConfig &&
                            asideConfig.map((section, idx) => {
                                const isActiveSection =
                                    location.pathname.includes(section.to) ||
                                    location.pathname.includes(section.path) ||
                                    location.pathname.includes(section.stockPath) ||
                                    location.pathname.includes(section.purchasePath) ||
                                    location.pathname.includes(section.topSellingPath) ||
                                    location.pathname.includes(section.stockDetailPath) ||
                                    location.pathname.includes(section.productQuantityAlertPath) ||
                                    location.pathname.includes(section.supplierReportPath) ||
                                    location.pathname.includes(section.profitLossReportPath) ||
                                    location.pathname.includes(section.supplierReportDetailsPath) ||
                                    location.pathname.includes(section.bestCustomerReportPath) ||
                                    location.pathname.includes(section.customerReportPath) ||
                                    location.pathname.includes(section.customerReportDetailsPath) ||
                                    location.pathname.includes(section.registerReportPath) ||

                                    location.pathname.includes(section.prefixesPath) ||
                                    location.pathname.includes(section.mailSettingsPath) ||
                                    location.pathname.includes(section.receiptSettingsPath) ||
                                    location.pathname.includes(section.taxesPath) ||
                                    location.pathname.includes(section.posSettingsPath) ||
                                    location.pathname.includes(section.dualScreenSettingsPath) ||
                                    location.pathname.includes(section.currencySettingsPath) ||
                                    location.pathname.includes(section.fiscalYearSettingsPath)

                                if (!isActiveSection) return null;

                                return (
                                    <React.Fragment key={idx}>
                                        {section.items?.map((item, i) => (
                                            <Dropdown.Item
                                                key={i}
                                                as={Link}
                                                to={item.to}
                                                active={
                                                    location.pathname === item.to ||
                                                    location.pathname.includes(item.to)
                                                }
                                            >
                                                {item.title}
                                            </Dropdown.Item>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                    </Dropdown.Menu>
                </Dropdown>}
                

            <nav
                className={`navbar navbar-expand-lg ${isMenuCollapse === true ? "top-navbar" : "top-nav-heding"
                    } navbar-light  ${(isMobileDropdownVisible) ? 'd-none d-xxl-flex' : 'd-flex'} align-items-center gap-3  px-0 py-0  md-mx-3`}
            >
                <div className="navbar-collapse">
                    {(config?.includes(Permissions.MANAGE_SALE) || config?.includes(Permissions.MANAGE_PURCHASE) || config?.includes(Permissions.MANAGE_CUSTOMERS) || config?.includes(Permissions.MANAGE_PRODUCTS) || config?.includes(Permissions.MANAGE_SUPPLIERS) || config?.includes(Permissions.MANAGE_EXPENSES)) ? <Dropdown className="d-flex align-items-stretch me-3 report_dropdown">
                        <Dropdown.Toggle
                            className="hide-arrow bg-transparent border-0 p-0 d-flex align-items-center"
                            id="dropdown-basic"
                        >
                            <FontAwesomeIcon
                                icon={faPlusSquare}
                                className="shortcut-btn px-sm-3 px-2 d-flex text-decoration-none pos-button pos-button-highlight"
                            />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shortcut-menu">
                            {config?.includes(Permissions.MANAGE_SALE) && (
                                <Dropdown.Item className="py-0 fs-4">
                                    <Link
                                        to={"/app/sales/create"}
                                        className="nav-link px-4"
                                    >
                                        <span className="dropdown-icon me-4 text-green-600">
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </span>
                                        <span>
                                            {getFormattedMessage("sales.title")}
                                        </span>
                                    </Link>
                                </Dropdown.Item>
                            )}
                            {config?.includes(Permissions.MANAGE_PURCHASE) && (
                                <Dropdown.Item className="py-0 fs-6">
                                    <Link
                                        to={"/app/purchases/create"}
                                        className="nav-link px-4"
                                    >
                                        <span className="dropdown-icon me-4 text-green-600">
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </span>
                                        <span>
                                            {getFormattedMessage("purchase.title")}
                                        </span>
                                    </Link>
                                </Dropdown.Item>
                            )}
                            {config?.includes(Permissions.MANAGE_CUSTOMERS) && (
                                <Dropdown.Item className="py-0 fs-6">
                                    <Link
                                        to={"/app/customers/create"}
                                        className="nav-link px-4"
                                    >
                                        <span className="dropdown-icon me-4 text-green-600">
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </span>
                                        <span>
                                            {getFormattedMessage(
                                                "dashboard.recentSales.customer.label"
                                            )}
                                        </span>
                                    </Link>
                                </Dropdown.Item>
                            )}
                            {config?.includes(Permissions.MANAGE_SUPPLIERS) && (
                                <Dropdown.Item className="py-0 fs-6">
                                    <Link
                                        to={"/app/suppliers/create"}
                                        className="nav-link px-4"
                                    >
                                        <span className="dropdown-icon me-4 text-green-600">
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </span>
                                        <span>
                                            {getFormattedMessage("supplier.title")}
                                        </span>
                                    </Link>
                                </Dropdown.Item>
                            )}
                            {config?.includes(Permissions.MANAGE_PRODUCTS) && (
                                <Dropdown.Item className="py-0 fs-6">
                                    <Link
                                        to={"/app/products/create"}
                                        className="nav-link px-4"
                                    >
                                        <span className="dropdown-icon me-4 text-green-600">
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </span>
                                        <span>
                                            {getFormattedMessage(
                                                "dashboard.stockAlert.product.label"
                                            )}
                                        </span>
                                    </Link>
                                </Dropdown.Item>
                            )}
                            {config?.includes(Permissions.MANAGE_EXPENSES) && (
                                <Dropdown.Item className="py-0 fs-6">
                                    <Link
                                        to={"/app/expenses/create"}
                                        className="nav-link px-4"
                                    >
                                        <span className="dropdown-icon me-4 text-green-600">
                                            <FontAwesomeIcon icon={faPlusSquare} />
                                        </span>
                                        <span>
                                            {getFormattedMessage("expense.title")}
                                        </span>
                                    </Link>
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown> : ''}
                    <div className="navbar-nav me-auto mb-2 mb-lg-0 pb-1">
                        {location.pathname === "/app/profile/edit" ? (
                            <div className="nav-item position-relative mx-xl-3">
                                <Link
                                    to="/app/profile/edit"
                                    className={`${location.pathname === "/app/profile/edit"
                                        ? "active"
                                        : ""
                                        } nav-link p-0`}
                                >
                                    <span>
                                        {getFormattedMessage(
                                            "update-profile.title"
                                        )}
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            
                            asideConfig &&
                            asideConfig.map((mainItems, index) => {
                                if (renderedTitles.has(mainItems.title)) {
                                    return null;
                                }

                                renderedTitles.add(mainItems.title);
                                return (
                                    <div
                                        key={index}
                                        className={`${location.pathname === mainItems.to ||
                                            location.pathname === mainItems.path ||
                                            location.pathname ===
                                            mainItems.stockPath ||
                                            location.pathname ===
                                            mainItems.productPath ||
                                            location.pathname ===
                                            mainItems.purchasePath ||
                                            location.pathname ===
                                            mainItems.topSellingPath ||
                                            location.pathname ===
                                            mainItems.productQuantityAlertPath ||
                                            location.pathname ===
                                            mainItems.prefixesPath ||
                                            location.pathname ===
                                            mainItems.supplierReportPath ||
                                            location.pathname ===
                                            mainItems.customerReportPath ||
                                            location.pathname ===
                                            mainItems.bestCustomerReportPath ||
                                            location.pathname ===
                                            mainItems.registerReportPath ||
                                            location.pathname ===
                                            mainItems.mailSettingsPath ||
                                            location.pathname ===
                                            mainItems.receiptSettingsPath ||
                                            location.pathname ===
                                            mainItems.taxesPath ||
                                            location.pathname ===
                                            mainItems.posSettingsPath ||
                                            location.pathname ===
                                            mainItems.dualScreenSettingsPath ||
                                            location.pathname ===
                                            mainItems.currencySettingsPath ||
                                            location.pathname ===
                                            mainItems.fiscalYearSettingsPath ||
                                            location.pathname ===
                                            mainItems.profitLossReportPath ||
                                            location.pathname.includes(
                                                mainItems.to
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.userSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.customerSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.suppliareSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.productsSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.categoriesSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.variationsSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.brandsSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.unitsSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.baseUnitsSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.barcodeSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.purchasesSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.purchaseReturnSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.salesSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.salesReturnSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.holdsSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.expensesSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.expenseCategoriesSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.emailTemplateSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath
                                                    ?.smsTemplateSubPath
                                            ) ||
                                            location.pathname.includes(
                                                mainItems?.subPath?.smsApiSubPath
                                            ) ||
                                            location.pathname ===
                                            mainItems.stockDetailPath +
                                            "/" +
                                            id.id ||
                                            location.pathname ===
                                            mainItems.customerReportDetailsPath +
                                            "/" +
                                            id.id ||
                                            location.pathname ===
                                            mainItems.supplierReportDetailsPath +
                                            "/" +
                                            id.id
                                            ? "d-flex align-items-center"
                                            : "d-none"
                                            }`}
                                    >
                                        {mainItems.items
                                            ? mainItems.items.map((item, index) => {
                                                if (renderedRoutes.has(item.to)) {
                                                    return null;
                                                }

                                                renderedRoutes.add(item.to);
                                                if (index <= (location.pathname.includes("report") ? lessThanLimit : mainItems.items.length)) {
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`nav-item ${location.pathname.includes(
                                                                "report"
                                                            )
                                                                ? "report-nav-item"
                                                                : ""
                                                                } position-relative margin-big-screen`}
                                                        >
                                                            <Link
                                                                to={item.to}
                                                                className={`nav-link p-0 ${location.pathname ===
                                                                    item.to ||
                                                                    (mainItems.isSamePrefix
                                                                        ? null
                                                                        : location.pathname.includes(
                                                                            mainItems.to
                                                                        )) ||
                                                                    location.pathname ===
                                                                    item.detail +
                                                                    "/" +
                                                                    id.id ||
                                                                    location.pathname ===
                                                                    "/app/profile/edit"
                                                                    ? " active"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                {location.pathname ===
                                                                    "/app/profile/edit" ? (
                                                                    <span>
                                                                        {getFormattedMessage(
                                                                            "update-profile.title"
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span>
                                                                        {
                                                                            item.title
                                                                        }
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        </div>
                                                    );
                                                }
                                            })
                                            : mainItems?.subMenu?.map(
                                                (item, index) => {
                                                    if (renderedRoutes.has(item.to)) {
                                                        return null;
                                                    }

                                                    renderedRoutes.add(item.to);
                                                    return location.pathname ===
                                                        item.to ||
                                                        location.pathname.includes(
                                                            item.to
                                                        ) ? (
                                                        <div
                                                            key={index}
                                                            className="nav-item position-relative mx-xl-3 mb-3 mb-xl-0 mx-1"
                                                        >
                                                            <Link
                                                                to={item.to}
                                                                className={`nav-link p-0 ${location.pathname ===
                                                                    item.to ||
                                                                    location.pathname.includes(
                                                                        item.to
                                                                    ) ||
                                                                    (mainItems.isSamePrefix
                                                                        ? null
                                                                        : location.pathname.includes(
                                                                            mainItems.to
                                                                        )) ||
                                                                    location.pathname ===
                                                                    item.detail +
                                                                    "/" +
                                                                    id.id ||
                                                                    location.pathname ===
                                                                    "/app/profile/edit"
                                                                    ? " active"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                <span>
                                                                    {getFormattedMessage(
                                                                        item.title
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </div>
                                                    ) : null;
                                                }
                                            )}
                                        {/* Report Dropdown  */}
                                        {location.pathname.includes("report") && (
                                            <Dropdown className="d-flex align-items-stretch">
                                                <Dropdown.Toggle
                                                    className="hide-arrow bg-transparent border-0 p-0 d-flex align-items-center"
                                                    id="dropdown-basic"
                                                >
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <span className="ms-2 text-gray-600 d-none d-sm-block">
                                                            {getFormattedMessage(
                                                                "more-report.option.title"
                                                            )}
                                                        </span>
                                                    </div>
                                                    <FontAwesomeIcon
                                                        icon={faAngleDown}
                                                        className="text-gray-600 ms-2 d-none d-sm-block"
                                                    />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="mt-6">
                                                    {mainItems.items &&
                                                        mainItems.items.map(
                                                            (item, index) => {
                                                                if (index >= limit) {
                                                                    return (
                                                                        <Dropdown.Item
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="px-0 py-0 fs-6"
                                                                            active={
                                                                                location.pathname ===
                                                                                    item.to ||
                                                                                    location.pathname.includes(
                                                                                        item.to
                                                                                    )
                                                                                    ? true
                                                                                    : false
                                                                            }
                                                                        >
                                                                            <div className="position-relative mx-xxl-3 mb-3 mb-xl-0 ">
                                                                                <Link
                                                                                    to={
                                                                                        item.to
                                                                                    }
                                                                                    className={`nav-link px-3 py-2 ${location.pathname ===
                                                                                        item.to ||
                                                                                        (mainItems.isSamePrefix
                                                                                            ? null
                                                                                            : location.pathname.includes(
                                                                                                mainItems.to
                                                                                            )) ||
                                                                                        location.pathname ===
                                                                                        item.detail +
                                                                                        "/" +
                                                                                        id.id ||
                                                                                        location.pathname ===
                                                                                        "/app/profile/edit"
                                                                                        ? "text-white"
                                                                                        : ""
                                                                                        }`}
                                                                                >
                                                                                    <span>
                                                                                        {
                                                                                            item.title
                                                                                        }
                                                                                    </span>
                                                                                </Link>
                                                                            </div>
                                                                        </Dropdown.Item>
                                                                    );
                                                                }
                                                            }
                                                        )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default AsideTopSubMenuItem;
