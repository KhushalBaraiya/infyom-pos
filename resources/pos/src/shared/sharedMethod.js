import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Navigate } from "react-router-dom";
import { discountType, Tokens } from "../constants";
import moment from "moment";
import { calculateSubTotal } from "./calculation/calculation";
import { ADToBS } from "bikram-sambat-js";

export const getAvatarName = (name) => {
    if (name) {
        return name
            .toLowerCase()
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase())
            .join("").slice(0, 2);
    }
};

export const numValidate = (event) => {
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
};

export const numWithSpaceValidate = (event) => {
        if (!/[0-9]/.test(event.key) && event.key !== ' ') {
            event.preventDefault();
        }
};


export const numFloatValidate = (event) => {
    const key = event.key;
    const value = event.target.value;
    if (/[0-9]/.test(key)) {
        return;
    }
    if (key === '.' && !value.includes('.')) {
        return;
    }
    event.preventDefault();
};


export const getFormattedMessage = (id) => {
    if (!id) return "";
    return <FormattedMessage id={id} defaultMessgae={id} />;
};

export const getFormattedOptions = (options) => {
    const intl = useIntl();
    const copyOptions = _.cloneDeep(options);
    copyOptions.map(
        (option) =>
            (option.name = intl.formatMessage({
                id: option.name,
                defaultMessage: option.name,
            }))
    );
    return copyOptions;
};

// Get decimal places from settings with fallback to 2
export const getDecimalPlaces = (settings) => {
    return settings?.attributes?.decimal_places >= 0 ? settings?.attributes?.decimal_places : 2;
};

export const placeholderText = (label) => {
    if (!label) return "";
    const intl = useIntl();
    const placeholderLabel = intl.formatMessage({ id: label });
    return placeholderLabel;
};

export const decimalValidate = (event) => {
    if (!/^\d*\.?\d*$/.test(event.key)) {
        event.preventDefault();
    }
};

export const addRTLSupport = (rtlLang) => {
    const html = document.getElementsByTagName("html")[0];
    const att = document.createAttribute("dir");
    att.value = "rtl";
    if (rtlLang === "ar") {
        html.setAttributeNode(att);
    } else {
        html.removeAttribute("dir");
    }
};

export const onFocusInput = (el, decimalPlaces = 2) => {
    if (el.target.value === parseFloat(0).toFixed(decimalPlaces)) {
        el.target.value = "";
    }
};

export const ProtectedRoute = (props) => {
    const { children, allConfigData, route } = props;
    const token = localStorage.getItem(Tokens.ADMIN);
    if (!token || token === null) {
        return <Navigate to="/login" replace={true} />;
    } else {
        // if (allConfigData?.open_register) {
        //     if (route === "pos") {
        //         return <Navigate to="/app/dashboard" replace={true} />;
        //     } else {
        //         return children;
        //     }
        // } else {
        //     return children;
        // }
        return children;
    }
};

export const formatAmount = (num, config) => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return formatCurrency(num, config);
};

export const currencySymbolHandling = (
    isRightside,
    currency,
    value,
    is_forment
) => {
    if (isRightside?.is_currency_right === "true" || isRightside?.is_currency_right == "1") {
        if (is_forment) {
            return formatAmount(value, isRightside) + " " + currency;
        } else {
            return formatCurrency(value, isRightside) + " " + currency;
        }
    } else {
        if (is_forment) {
            return currency + " " + formatAmount(value, isRightside);
        } else {
            return currency + " " + formatCurrency(value, isRightside);
        }
    }
};

export const getFormattedDate = (date, config) => {
    const format = config?.date_format;

    if (!date) return "";

    // STEP 1: Normalize input → extract probable date (YYYY-MM-DD)
    const extracted = String(date).match(/\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}\/\d{2}|\d{4}\-\d{2}\-\d{2}/);

    let cleanDate = extracted ? extracted[0] : String(date);

    // Convert "/" to "-" for consistency
    cleanDate = cleanDate.replace(/\//g, "-");

    // Extract year
    const year = parseInt(cleanDate.split("-")[0], 10);

    const isBS = year >= 2070; // BS year detection

    // Nepali Date enabled
    if (config?.enable_nepali_datepicker == "1" || config?.enable_nepali_datepicker === true) {

        let bsDate;

        try {
            // Convert only AD → BS, skip if already BS
            if (!isBS) {
                bsDate = ADToBS(moment(cleanDate).format("YYYY-MM-DD"));
            } else {
                bsDate = cleanDate; 
            }
        } catch (error) {
            // fallback — treat original as BS
            bsDate = cleanDate;
        }

        const [y, m, d] = bsDate.split("-");

        const map = {
            "d-m-y": `${d}-${m}-${y}`,
            "m-d-y": `${m}-${d}-${y}`,
            "y-m-d": `${y}-${m}-${d}`,
            "m/d/y": `${m}/${d}/${y}`,
            "d/m/y": `${d}/${m}/${y}`,
            "y/m/d": `${y}/${m}/${d}`,
            "m.d.y": `${m}.${d}.${y}`,
            "d.m.y": `${d}.${m}.${y}`,
            "y.m.d": `${y}.${m}.${d}`,
        };

        return map[format] ?? bsDate;
    }

    // Otherwise normal AD formatting
    return moment(cleanDate).format(
        {
            "d-m-y": "DD-MM-YYYY",
            "m-d-y": "MM-DD-YYYY",
            "y-m-d": "YYYY-MM-DD",
            "m/d/y": "MM/DD/YYYY",
            "d/m/y": "DD/MM/YYYY",
            "y/m/d": "YYYY/MM/DD",
            "m.d.y": "MM.DD.YYYY",
            "d.m.y": "DD.MM.YYYY",
            "y.m.d": "YYYY.MM.DD",
        }[format] || "YYYY-MM-DD"
    );
};

export const generateBarCode = () => {
    const randomPart = Math.random().toString(36).slice(2).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const finalLength = Math.floor(Math.random() * 5) + 8;
    const finalCode = randomPart.slice(0, finalLength);
    return finalCode;
};

export const calculateMainAmounts = (updateProducts, inputValues) => {
    const subTotal = calculateSubTotal(updateProducts);
    const discountRaw = parseFloat(inputValues.discount_value) || 0;

    const discountAmount =
        inputValues.discount_type === discountType.PERCENTAGE
            ? (subTotal * discountRaw) / 100
            : discountRaw;

    const totalAmountAfterDiscount = subTotal - discountAmount;

    const taxRate = parseFloat(inputValues.tax_rate) || 0;
    const taxCal = (parseFloat(totalAmountAfterDiscount * taxRate) / 100).toFixed(2);

    return {
        subTotal,
        discountRaw,
        discountAmount,
        totalAmountAfterDiscount,
        taxRate,
        taxCal,
    };
};

export const paymentMethodName = (paymentMethods, updateProducts) => {
    const paymentMethodType = paymentMethods.length > 0 && paymentMethods?.filter((payment_type) => payment_type.id == updateProducts.payment_type);
    const paymentMethodTypeName = paymentMethodType[0] && paymentMethodType[0].attributes && paymentMethodType[0].attributes.name;
    return paymentMethodTypeName;
}

export const getPermission = (allPermissions, permission) => {
    const getPermission = allPermissions && allPermissions.find((item) => item === permission);
    return getPermission ? true : false;
};

export const phoneValidate = (event) => {
    // Allow digits, +, -, (, ), and space for international phone numbers
    if (!/[0-9+\-\(\) ]/.test(event.key)) {
        event.preventDefault();
    }
};

const thousandsMap = {
    1: ".",
    2: ",",
    3: " ",
    4: "", // none
};

const decimalMap = {
    1: ".",
    2: ",",
};

export const formatCurrency = (value, config = {}) => {
    if (value === null || value === undefined || value === "") return "";

    let {
        decimal_places,
        decimal_separator,
        thousands_separator,
    } = config;

    // Ensure decimal_places is a NUMBER
    decimal_places =
        decimal_places !== null && decimal_places !== undefined
            ? Number(decimal_places)
            : 2; // default

    const decimalSep = decimalMap[decimal_separator ?? 1];
    const thousandSep = thousandsMap[thousands_separator ?? 2];

    // Use toFixed for rounding
    const roundedValue = Number(value).toFixed(decimal_places);
    let [intPart, decimalPart = ""] = roundedValue.split(".");

    // Thousands separator grouping
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);

    if (decimal_places > 0) {
        return `${intPart}${decimalSep}${decimalPart}`;
    } else {
        // As per requirement, if decimal_places is 0, append separator and hyphen
        return `${intPart}`;
    }
};

export const isPurchase = () =>{
    const isPurchase = (window.location.href.includes("purchases") || window.location.href.includes("purchase") || window.location.href.includes("purchase-return"));
    return isPurchase;
}

export const isEditHold = (ref,currentValue) =>{
    if(!ref && !currentValue) return false;
    return ref == currentValue;
} 
