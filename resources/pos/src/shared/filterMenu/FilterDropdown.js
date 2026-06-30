import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Dropdown } from "react-bootstrap";
import ReactSelect from "../select/reactSelect";
import { getFormattedMessage, getFormattedOptions } from "../sharedMethod";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    baseUnitOptions,
    paymentStatusOptions,
    paymentTypeOptions,
    statusOptions,
    transferStatusOptions,
} from "../../constants";
import { fetchAllBaseUnits } from "../../store/action/baseUnitsAction";
import { Button } from "react-bootstrap-v5";
import { fetchAllBrands } from "../../store/action/brandsAction";
import { fetchAllProductCategories } from "../../store/action/productCategoryAction";
import { setProductUnitId } from "../../store/action/productUnitIdAction";
import { fetchFiscalYear } from "../../store/action/FiscalYearAction";

const FilterDropdown = (props) => {
    const {
        onExcelClick,
        goToImport,
        setPaymentStatusData,
        setStatusData,
        isUnitFilter,
        isStatus,
        isPaymentStatus,
        setProductUnitData,
        title,
        onResetClick,
        setPaymentTypeData,
        isPaymentType,
        isWarehouseType,
        onWarehouseChange,
        warehouseOptions,
        tableWarehouseValue,
        isTransferStatus,
        setTransferStatusData,
        fetchAllBaseUnits,
        base,
        isExportDropdown,
        isImportDropdown,
        isProductCategoryFilter,
        isBrandFilter,
        brands,
        productCategories,
        setBrandData,
        setProductCategoryData,
        setFiscalYearData,
        brandFilterTitle,
        productCategoryFilterTitle,
        fetchAllBrands,
        fetchAllProductCategories,
        fetchFiscalYear,
        isactionFilter,
        isdirectionFilter,
        isFiscalYearFilter,
        setDirectionType,
        creditdirection,
        fiscalYears,
        fiscalYear: fiscalYearProp,
    } = props;

    const dispatch = useDispatch();
    const isReset = useSelector((state) => state.resetOption);
    const isShow = useSelector((state) => state.dropDownToggle);
    const paymentMethods = useSelector((state) => state.paymentMethods);
    const menuRef = useRef(null);
    const baseUnitFilterOptions = getFormattedOptions(baseUnitOptions);
    const statusFilterOptions = getFormattedOptions(statusOptions);
    const paymentFilterOptions = getFormattedOptions(paymentStatusOptions);
    const [productUnit, setProductUnit] = useState();
    const [brand, setBrand] = useState();
    const [productCategory, setProductCategory] = useState();
    const [fiscalYear, setFiscalYear] = useState();
    const [status, setStatus] = useState();
    const [transferStatus, setTransferStatus] = useState();
    const [paymentStatus, setPaymentStatus] = useState();
    const [paymentType, setPaymentType] = useState();
    const [actionfilter, setActionfilter] = useState();
    const [paymentDirection, setPaymentDirection] = useState();

    useEffect(() => {
        setFiscalYear(fiscalYearProp);
    }, [fiscalYearProp]);

    const formattedPaymentMethods = [
        { value: 0, label: getFormattedMessage("unit.filter.all.label") },
        ...(
            paymentMethods?.length > 0
                ? paymentMethods
                    .filter(p => p.attributes.status == 1)
                    .map(p => ({
                        value: p.id,
                        label: p.attributes.name
                    }))
                : []
        )
    ];

    useEffect(() => {
        if(isProductCategoryFilter || isUnitFilter || isProductCategoryFilter) {
            fetchAllBaseUnits();
            fetchAllBrands();
            fetchAllProductCategories();
        }
        if (isFiscalYearFilter) {
            fetchFiscalYear({ page: 1, pageSize: 100 });
        }
    }, [fetchAllBaseUnits, fetchAllBrands, fetchAllProductCategories, fetchFiscalYear, isFiscalYearFilter]);

    const transferStatusFilterOptions = getFormattedOptions(
        transferStatusOptions
    );

    let unitDefaultValue = baseUnitFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    let baseOptions = [{ value: "0", label: "All" }, ...base];

    const statusDefaultValue = statusFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const transferStatusDefaultValue = transferStatusFilterOptions.map(
        (option) => {
            return {
                value: option.id,
                label: option.name,
            };
        }
    );

    const paymentStatusDefaultValue = paymentFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const warehouseDefaultValue =
        warehouseOptions &&
        warehouseOptions.map((option) => {
            return {
                value: option.id,
                label: option.attributes.name,
            };
        });

    let brandDefaultValue =
        brands &&
        brands.map((option) => {
            return {
                value: option.id,
                label: option.attributes.name,
            };
        });

    brandDefaultValue = [{ value: "0", label: "All" }, ...brandDefaultValue];

    let productCategoryDefaultValue =
        productCategories &&
        productCategories.map((option) => {
            return {
                value: option.id,
                label: option.attributes.name,
            };
        });

    productCategoryDefaultValue = [
        { value: "0", label: "All" },
        ...productCategoryDefaultValue,
    ];

    const fiscalYearOptions = fiscalYears && Array.isArray(fiscalYears)
        ? fiscalYears.map((option) => {
            return {
                value: option.id,
                label: option.attributes.name,
            };
        })
        : [];

    const actionfilters = [
        { label: getFormattedMessage('All'), value: 3 },
        { label: getFormattedMessage('status.filter.pending.label'), value: 0 },
        { label: getFormattedMessage('wallet.approve.label'), value: 1 },
        { label: getFormattedMessage('wallet.reject.label'), value: 2 },
        ]

    const paymentDirections = [
        { label: getFormattedMessage('wallet.debit.label'), value: 1 },
        { label: getFormattedMessage('wallet.credit.label'), value: 2 },
    ]

    const onReset = () => {
        dispatch({ type: "RESET_OPTION", payload: true });
        dispatch(setProductUnitId(0));
        setProductUnit({ label: "All", value: "0" });
        setProductUnitData({ label: "All", value: "0" });
        setBrand({ label: "All", value: "0" });
        setFiscalYear(null);
        setStatus(creditdirection ? { label: "All", value: "3" } : { label: "All", value: "0" });
        setProductCategory({ label: "All", value: "0" });
        setTransferStatus({ label: "All", value: "0" });
        setPaymentStatus({ label: "All", value: "0" });
        setPaymentType({ label: "All", value: "0" });
        onResetClick();
    };

    const onToggle = () => {
        dispatch({ type: "ON_TOGGLE", payload: !isShow });
    };

    const escFunction = useCallback((event) => {
        if (event.keyCode === 27) {
            dispatch({ type: "ON_TOGGLE", payload: false });
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, []);

    useEffect(() => {
        const onClickOutside = (event) => {
            if (menuRef?.current?.contains(event.target)) {
                return;
            }
            dispatch({ type: "ON_TOGGLE", payload: false });
        };
        document.body.addEventListener("click", onClickOutside);
        return () => {
            document.body.removeEventListener("click", onClickOutside);
        };
    }, []);

    const onProductUnitChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        dispatch(setProductUnitId(obj.value));
        dispatch({ type: "ON_TOGGLE", payload: false });
        setProductUnit(obj);
        setProductUnitData(obj);
    };

    const onBrandChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setBrand(obj);
        setBrandData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onProductCategoryChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setProductCategory(obj);
        setProductCategoryData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onFiscalYearChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setFiscalYear(obj);
        setFiscalYearData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onStatusChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setStatus(obj);
        setStatusData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onTransferStatusChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setTransferStatus(obj);
        setTransferStatusData(obj);
        setStatus(obj);
        setStatusData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onPaymentTypeChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setPaymentType(obj);
        setPaymentTypeData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onPaymentStatusChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setPaymentStatus(obj);
        setPaymentStatusData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onActionfilterChange = (obj) => {
        if (obj.value == undefined) {
            setStatus({ label: "Pending", value: "0" });
            setStatusData({ label: "Pending", value: "0" });
            dispatch({ type: "ON_TOGGLE", payload: false });
            return
        }
        if(obj.value == 3){
            setStatus({ label: "All", value: "0" });
            setStatusData({ label: "All", value: "0" });
            dispatch({ type: "ON_TOGGLE", payload: false });
            return
        }
        dispatch({ type: "RESET_OPTION", payload: false }); 
        setStatusData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onPaymentDirectionChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setPaymentDirection(obj);
        setDirectionType(obj.value);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };
    return (
        <Dropdown
            className="me-3 mb-2 filter-dropdown order-1 order-sm-0"
            show={isShow}
            ref={menuRef}
        >
            <Dropdown.Toggle
                variant="primary"
                className="text-white btn-icon hide-arrow"
                id="filterDropdown"
                onClick={() => onToggle()}
            >
                <FontAwesomeIcon icon={faFilter} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="px-7 py-5">
                {isStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={statusFilterOptions}
                            onChange={onStatusChange}
                            name="status"
                            title={getFormattedMessage(
                                "purchase.select.status.label"
                            )}
                            value={isReset ? statusDefaultValue[0] : status}
                            isRequired
                            defaultValue={statusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "purchase.select.status.label"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isPaymentStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="2"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={paymentFilterOptions}
                            onChange={onPaymentStatusChange}
                            name="payment_status"
                            title={getFormattedMessage(
                                "dashboard.recentSales.paymentStatus.label"
                            )}
                            value={
                                isReset
                                    ? paymentStatusDefaultValue[0]
                                    : paymentStatus
                            }
                            isRequired
                            defaultValue={paymentStatusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "dashboard.recentSales.paymentStatus.label"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isUnitFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="3"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            onChange={onProductUnitChange}
                            name="product_unit"
                            title={title}
                            value={isReset ? unitDefaultValue[0] : productUnit}
                            isRequired
                            defaultValue={unitDefaultValue[0]}
                            placeholder={title}
                            data={baseOptions}
                        />
                    </Dropdown.Header>
                ) : null}
                {isPaymentType ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="4"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            title={getFormattedMessage('select.payment-type.label')}
                            data={formattedPaymentMethods}
                            name='payment_type'
                            value={paymentType}
                            placeholder={getFormattedMessage('select.payment-type.label')}
                            defaultValue={formattedPaymentMethods[0]}
                            onChange={onPaymentTypeChange}
                        />
                    </Dropdown.Header>
                ) : null}
                {isWarehouseType ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="4"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            data={warehouseOptions}
                            onChange={onWarehouseChange}
                            name="payment_type"
                            title={getFormattedMessage(
                                "dashboard.stockAlert.warehouse.label"
                            )}
                            value={
                                isReset
                                    ? warehouseDefaultValue[0]
                                    : tableWarehouseValue
                            }
                            isRequired
                            defaultValue={warehouseDefaultValue[0]}
                            // placeholder={getFormattedMessage('select.payment-type.label')}
                        />
                    </Dropdown.Header>
                ) : null}
                {isTransferStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={transferStatusFilterOptions}
                            onChange={onTransferStatusChange}
                            name="status"
                            title={getFormattedMessage(
                                "purchase.select.status.label"
                            )}
                            value={
                                isReset
                                    ? transferStatusDefaultValue[0]
                                    : transferStatus
                            }
                            isRequired
                            defaultValue={transferStatusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "purchase.select.status.label"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isBrandFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="3"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            onChange={onBrandChange}
                            name="brand"
                            title={brandFilterTitle}
                            value={isReset ? unitDefaultValue[0] : brand}
                            isRequired
                            defaultValue={unitDefaultValue[0]}
                            placeholder={brandFilterTitle}
                            data={brandDefaultValue}
                        />
                    </Dropdown.Header>
                ) : null}
                {isProductCategoryFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="3"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            onChange={onProductCategoryChange}
                            name="product_category"
                            title={productCategoryFilterTitle}
                            value={
                                isReset ? unitDefaultValue[0] : productCategory
                            }
                            isRequired
                            defaultValue={unitDefaultValue[0]}
                            placeholder={productCategoryFilterTitle}
                            data={productCategoryDefaultValue}
                        />
                    </Dropdown.Header>
                ) : null}
                {isFiscalYearFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="3"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            onChange={onFiscalYearChange}
                            name="fiscal_year"
                            title={getFormattedMessage("fiscal-year.title")}
                            value={fiscalYear}
                            placeholder={getFormattedMessage("fiscal-year.title")}
                            data={fiscalYearOptions}
                        />
                    </Dropdown.Header>
                ) : null}
                {isExportDropdown ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => onExcelClick()}
                            className="me-3 me-md-0 btn-light-primary  w-100"
                        >
                            {" "}
                            {getFormattedMessage("product.export.title")}
                        </Button>
                    </Dropdown.Header>
                ) : null}
                {isImportDropdown ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <Button
                            variant="primary"
                            className="me-3 me-md-0 btn-light-primary w-100"
                            onClick={goToImport}
                        >
                            {getFormattedMessage("product.import.title")}
                        </Button>
                    </Dropdown.Header>
                ) : null}
                {isactionFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            data={actionfilters}
                            name="actionfilter"
                            title={getFormattedMessage("select.action.label")}
                            value={actionfilter}
                            placeholder={getFormattedMessage("select.action.label")}
                            onChange={onActionfilterChange}
                        />
                    </Dropdown.Header>
                ) : null}
                {
                    isdirectionFilter ? (
                        <Dropdown.Header
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            eventkey="1"
                            className="mb-5 p-0"
                        >
                            <ReactSelect
                                data={paymentDirections}
                                name="payment_direction"
                                title={getFormattedMessage("payment.direction.title")}
                                value={paymentDirection}
                                placeholder={getFormattedMessage("payment.direction.tooltip.title")}
                                onChange={onPaymentDirectionChange}
                            />
                        </Dropdown.Header>
                    ) : null
                }
                <div className="btn btn-secondary me-5" onClick={onReset}>
                    {getFormattedMessage("date-picker.filter.reset.label")}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

const mapStateToProps = (state) => {
    const { base, brands, productCategories, fiscalYears } = state;
    return { base, brands, productCategories, fiscalYears };
};

export default connect(mapStateToProps, {
    fetchAllBaseUnits,
    fetchAllBrands,
    fetchAllProductCategories,
    fetchFiscalYear,
})(FilterDropdown);
