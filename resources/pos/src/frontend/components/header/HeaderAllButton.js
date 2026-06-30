import { faBagShopping, faCalculator, faDisplay, faList, faListCheck, faMaximize, faMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { Nav } from "react-bootstrap-v5";
import PosCalculator from "./PosCalculator";
import Dropdown from "react-bootstrap/Dropdown";
import { getFormattedMessage } from "../../../shared/sharedMethod";
import PosRegisterOpenAlertModel from "../../../components/posRegister/PosRegisterOpenAlertModel";
import { useSelector } from "react-redux";
import { Permissions } from "../../../constants";
import ShowLogoutModal from "../../ShowLogoutModal";

const HeaderAllButton = (props) => {
    const {
        setOpneCalculator,
        opneCalculator,
        goToDetailScreen,
        goToHoldScreen,
        holdListData,
        handleClickCloseRegister,
        goToRecentSales
    } = props;
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showROAlertModel, setShowROAlertModel] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { config } = useSelector((state) => state);
    const fullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const permissionMappings = {
        manage_dashboard: "/app/dashboard",
        manage_roles: "/app/roles",
        manage_brands: "/app/brands",
        manage_warehouses: "/app/warehouses",
        manage_units: "/app/units",
        manage_product_categories: "/app/product-categories",
        manage_products: "/app/products",
        manage_suppliers: "/app/suppliers",
        manage_customers: "/app/customers",
        manage_users: "/app/users",
        manage_purchase: "/app/purchases",
        manage_pos_screen: "/app/pos",
        manage_sale: "/app/sales",
        manage_print_barcode: "/app/print/barcode",
        manage_adjustments: "/app/adjustments",
        manage_quotations: "/app/quotations",
        manage_transfers: "/app/transfers",
        manage_expenses: "/app/expenses",
        manage_currency: "/app/currencies",
        manage_variations: "/app/variations",
        manage_expense_categories: "/app/expense-categories",
        manage_setting: "/app/settings",
        manage_purchase_return: "/app/purchase-return",
        manage_sale_return: "/app/sale-return",
        manage_report: "/app/report/report-warehouse",
        manage_language: "/app/languages",
    };

    const mapPermissionToRoute = (permission) => {
        const permissionKey = permission.toLowerCase();
        if (permissionMappings.hasOwnProperty(permissionKey)) {
            return permissionMappings[permissionKey];
        } else {
            const entity = permissionKey.split("_").slice(1).join("-");
            return `/app/${entity}`;
        }
    };

    const [mappedRoutes, setMappedRoutes] = useState([]);
    const customerWindowRef = useRef(null);
    const cartProduct = useSelector((state) => state.cart.cartProduct);
    const [redirectTo, setRedirectTo] = useState("");
    useEffect(() => {
        setMappedRoutes(config.map(mapPermissionToRoute));
    }, [config]);

    useEffect(() => {
        if (mappedRoutes && mappedRoutes.length > 0) {
            if (config.includes(Permissions.MANAGE_DASHBOARD) || config.includes(Permissions.MANAGE_CUSTOMER_DASHBOARD)) {
                setRedirectTo("/app/dashboard");
            } else {
                const currentPath = window.location.hash;
                const targetPath = mappedRoutes[0];

                if (currentPath === `#${targetPath}`) {
                    setRedirectTo(mappedRoutes[1]);
                } else {
                    setRedirectTo(mappedRoutes[0]);
                }
            }
        } else {
            setRedirectTo("/app/dashboard");
        }
    }, [mappedRoutes]);

    const openCustomerWindow = () => {
        const width = window.screen.availWidth;
        const height = window.screen.availHeight;
        customerWindowRef.current = window.open(
            '#/app/customer-display',
            'newwindow',
            `width=${width},height=${height},left=0,top=0`
        );
        customerWindowRef.current.postMessage({ cartProduct }, '*');
    };

    const opneCalculatorModel = () => {
        if (opneCalculator) {
            setOpneCalculator(false);
        } else {
            setOpneCalculator(true);
        }
    };

    return (
        <>
            <Nav className="align-items-center header-btn-grp justify-xxl-content-end justify-lg-content-center justify-content-start flex-nowrap pb-xxl-0 pb-lg-2 pb-2">
                {/* Dual screen */}
                <Nav.Item className="d-flex align-items-center position-relative justify-content-center ms-3">
                    <Nav.Link
                        className="d-flex align-items-center justify-content-center w-100 h-100 text-white"
                        onClick={(e) => {
                            e.preventDefault();
                            openCustomerWindow();
                        }}
                    >
                        <FontAwesomeIcon icon={faDisplay} className="fa-2x pos-icon" />
                    </Nav.Link>
                </Nav.Item>

                {/* Hold List */}
                <Nav.Item className="d-flex align-items-center position-relative justify-content-center ms-3 nav-pink">
                    <Nav.Link
                        className="d-flex align-items-center justify-content-center w-100 h-100 text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToHoldScreen();
                        }}
                    >
                        <FontAwesomeIcon icon={faList} className="fa-2x pos-icon" />
                        <div className="hold-list-badge">
                            {holdListData.length ? holdListData.length : 0}
                        </div>
                    </Nav.Link>
                </Nav.Item>

                {/* Recent Sales */}
                <Nav.Item className="d-flex align-items-center position-relative justify-content-center ms-3">
                    <Nav.Link
                        className="d-flex align-items-center justify-content-center w-100 h-100 text-white"
                        onClick={(e) => {
                            e.preventDefault();
                            goToRecentSales();
                        }}
                    >
                        <FontAwesomeIcon icon={faListCheck} className="fa-2x pos-icon" />
                    </Nav.Link>
                </Nav.Item>

                {/* Register Dropdown */}
                <Nav.Item className="d-flex align-items-center justify-content-center ms-3 nav-green register_dropdown">
                    <Dropdown>
                        <div className="pe-0 text-white">
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-basic"
                            >
                                <FontAwesomeIcon icon={faBagShopping} className="fa-2x pos-icon" />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToDetailScreen();
                                    }}
                                >
                                    {getFormattedMessage(
                                        "register.details.title"
                                    )}
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => handleClickCloseRegister()}
                                >
                                    {getFormattedMessage(
                                        "globally.close-register.title"
                                    )}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </div>
                    </Dropdown>
                </Nav.Item>

                {/* Fullscreen Icon */}
                <Nav.Item className="ms-3 d-flex align-items-center justify-content-center">
                    <Nav.Link
                        className="d-flex align-items-center justify-content-center w-100 h-100 text-white"
                        onClick={() => fullScreen()}
                    >
                        {isFullscreen ? (
                            <FontAwesomeIcon icon={faMinimize} className="fa-2x pos-icon" />
                        ) : (
                            <FontAwesomeIcon icon={faMaximize} className="fa-2x pos-icon" />
                        )}
                    </Nav.Link>
                </Nav.Item>

                {/* Calculator */}
                <Nav.Item className="d-flex align-items-center justify-content-center ms-3">
                    <Nav.Link
                        className="d-flex align-items-center justify-content-center w-100 h-100 text-white"
                        onClick={opneCalculatorModel}
                    >
                        <FontAwesomeIcon icon={faCalculator} className="fa-2x pos-icon" />
                    </Nav.Link>
                </Nav.Item>

                {/* Dashboard Redirect */}
                {mappedRoutes.length !== 1 && (
                    <Nav.Item className="d-flex align-items-center justify-content-center ms-3">
                        <Nav.Link
                            className="d-flex align-items-center justify-content-center w-100 h-100 text-white"
                            onClick={() => setShowROAlertModel(true)}
                        >
                            <i className="bi bi-speedometer2 cursor-pointer fa-2x" />
                        </Nav.Link>
                    </Nav.Item>
                )}
                {mappedRoutes.length === 1 &&
                    config.includes("manage_pos_screen") && (
                        <Nav.Item className="d-flex align-items-center justify-content-center ms-3 nav-red">
                            <Nav.Link
                                className="d-flex align-items-center justify-content-center w-100 h-100 text-white"
                                onClick={() => setShowLogoutModal(true)}
                            >
                                <i className="bi bi-box-arrow-right cursor-pointer fa-2x"></i>
                            </Nav.Link>
                        </Nav.Item>
                    )}
            </Nav>

            {opneCalculator && (
                <PosCalculator opneCalculatorModel={opneCalculatorModel} />
            )}
            <PosRegisterOpenAlertModel
                redirectTo={redirectTo}
                showROAlertModel={showROAlertModel}
                setShowROAlertModel={setShowROAlertModel}
            />
            <ShowLogoutModal
                showLogoutModal={showLogoutModal}
                setShowLogoutModal={setShowLogoutModal}
            />
        </>
    );
};

export default HeaderAllButton;
