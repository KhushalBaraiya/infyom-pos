import { getFormattedMessage, isPurchase } from "../shared/sharedMethod";

//API Base URL
export const apiBaseURL = {
    BRANDS: "/brands",
    CURRENCY: "/currencies",
    REGISTRATION: "/register",
    PRODUCTS_CATEGORIES: "/product-categories",
    VARIATIONS: "/variations",
    ROLES: "/roles",
    LANGUAGES: "/languages",
    ENABLED_LANGUAGES: "/enabled-languages",
    PERMISSION: "/permissions",
    WAREHOUSES: "/warehouses",
    UNITS: "/units",
    BASE_UNITS: "/base-units",
    SUPPLIERS: "/suppliers",
    SMS_SETTING: "/sms-settings",
    SUPPLIERS_REPORT: "/supplier-report",
    CUSTOMERS_REPORT: "/customer-report", 
    CUSTOMERS: "/customers",
    USERS: "/users",
    EXPENSES_CATEGORIES: "/expense-categories",
    EXPENSES: "/expenses",
    MAIN_PRODUCTS: "/main-products",
    PRODUCTS: "/products",
    IMPORT_PRODUCT: "/import-products", 
    IMPORT_SUPPLIER: "/import-suppliers", 
    IMPORT_CUSTOMERS: "/import-customers", 
    PURCHASES: "/purchases", 
    TRANSFERS: "/transfers", 
    SALES: '/sales',
    CUSTOMER_SALES: 'customer/purchases', 
    QUOTATIONS: "/quotations", 
    QUOTATIONS_DETAILS: "quotation-info", 
    ADJUSTMENTS: "/adjustments",
    SETTINGS: "/settings",
    CACHE_CLEAR: "/cache-clear",
    CHANGE_PASSWORD: "change-password",
    ADMIN_FORGOT_PASSWORD: "forgot-password",
    ADMIN_RESET_PASSWORD: "reset-password",
    EDIT_PROFILE: "edit-profile",
    UPDATE_PROFILE: "update-profile",
    FRONT_SETTING: "front-setting",
    PRODUCT_IMAGE_DELETE: "products-image-delete", 
    CASH_PAYMENT: "sales",
    CHANGE_LANGUAGE: "change-language",
    TODAY_SALE_COUNT: "today-sales-purchases-count",
    RECENT_SALES: "recent-sales",
    TOP_SELLING_PRODUCTS: "top-selling-products",
    WEEK_SALE_PURCHASES_API: "week-selling-purchases",
    YEAR_TOP_PRODUCT: "yearly-top-selling",
    TOP_CUSTOMERS: "top-customers",
    PURCHASE_DETAILS: "purchase-info", 
    SALE_DETAILS: `${isPurchase() ? 'customer/purchases' : 'sale-info'}`, 
    SALE_RETURN: `${isPurchase() ? 'customer/purchases-return' : 'sales-return'}`,
    SALE_PDF: `${isPurchase() ? 'customer/purchases-pdf-download' : 'sale-pdf-download'}`,
    CUSTOMER_SALE_PDF: 'customer/purchases-pdf-download', 
    QUOTATION_PDF: "quotation-pdf-download", 
    SALE_RETURN_PDF: `${isPurchase() ? 'customer/purchases-return-pdf-download' : 'sale-return-pdf-download'}`, 
    CUSTOMER_SALE_RETURN_PDF: 'customer/purchases-return-pdf-download', 
    PURCHASE_PDF: "purchase-pdf-download", 
    PURCHASES_RETURN: "purchases-return",
    SALE_RETURN_DETAILS: `${isPurchase() ? 'customer/purchases-return' : 'sale-return-info'}`, 
    PURCHASES_RETURN_DETAILS: "purchase-return-info", 
    PURCHASE_RETURN_PDF: "purchase-return-pdf-download", 
    WAREHOUSE_REPORT: "warehouse-report",
    WAREHOUSE_DETAILS: "warehouse-details", 
    STOCK_REPORT: "stock-report",
    PRODUCT_STOCK_REPORT: "product-stock-alerts",
    TOP_SELLING_REPORT: "top-selling-product-report",
    STOCK_SALE_TAB: "get-sale-product-report",
    STOCK_SALE_RETURN_TAB: "get-sale-return-product-report",
    STOCK_PURCHASE_TAB: "get-purchase-product-report",
    STOCK_PURCHASE_RETURN_TAB: "get-purchase-return-product-report",
    STOCK_DETAILS_WAREHOUSE: "get-product-count",
    TOP_SELLING_PRODUCT_REPORT: "top-selling-product-report",
    STOCK_ALERT: "stock-alerts",
    VALIDATE_AUTH_TOKEN: "validate-auth-token",
    CONFIG: "config",
    EMAIL_TEMPLATES: "mail-templates",
    SMS_TEMPLATES: "sms-templates",
    SMS_TEMPLATES_STATUS: "sms-template-status", 
    EMAIL_TEMPLATES_STATUS: "mail-template-status", 
    ALL_SALE_PURCHASE: "all-sales-purchases-count",
    CUSTOMERS_PURCHASE: "customer-all-sales-purchases-count",
    CUSTOMER_PURCHASE_PRODUCT: "customer/purchases",
    SUPPLIER_PURCHASE_REPORT: "supplier-purchases-report",
    SUPPLIER_PURCHASE_RETURN_REPORT: "supplier-purchases-return-report",
    SUPPLIER_REPORT_PDF: "supplier-pdf-download",
    SUPPLIER_PURCHASE_REPORT: "supplier-purchases-report", 
    SUPPLIER_PURCHASE_RETURN_REPORT: "supplier-purchases-return-report", 
    SUPPLIER_PURCHASE_REPORT_EXCEL: "purchases-report-excel",
    SUPPLIER_PURCHASE_RETURN_EXCEL: "purchases-return-report-excel",
    SUPPLIER_REPORT_WIDGET_DATA: "supplier-report-info", 
    BEST_CUSTOMERS_REPORT: "best-customers-report",
    BEST_CUSTOMERS_REPORT_PDF: "best-customers-pdf-download",
    PROFIT_AND_LOSS_REPORT: "profit-loss-report",
    CUSTOMER_REPORT_WIDGET_DATA: "customer-info", 
    CUSTOMER_REPORT_PDF: "customer-pdf-download", 
    CUSTOMER_QUOTATIONS_REPORT_PDF: "customer-quotations-pdf-download", 
    CUSTOMER_SALES_REPORT_PDF: "customer-sales-pdf-download", 
    CUSTOMER_SALES_RETURNS_REPORT_PDF: "customer-returns-pdf-download", 
    CUSTOMER_PAYMENT_REPORT: "customer-payments-report", 
    CUSTOMER_PAYMENT_REPORT_PDF: "customer-payments-pdf-download", 
    MAIL_SETTINGS: "mail-settings",
    MAIL_SETTINGS_UPDATE: "mail-settings/update",
    TODAY_SALE_OVERALL_REPORT: "today-sales-overall-report",
    EDIT_SALE_FROM_SALE: "sales-return-edit", 
    HOLDS_LIST: "holds",
    REGISTER_CASH_IN_HAND: "register-entry", 
    CLOSE_REGISTER: "register-close", 
    GET_REGISTER_DETAILS: "get-register-details", 
    GET_REGISTER_REPORT_DETAILS: "register-report",
    RECEIPT_SETTINGS:"receipt-settings",
    STORES: "stores",
    CHANGE_STORES: "change-store",
    CHANGE_STATUS: "change-status",
    TAXES:"taxes",
    POS_SETTINGS: "pos-settings",
    PURCHASE_RETURN_EDIT: "purchase-return-edit",
    PAYMENT_METHOD: "payment-methods",
    DUAL_SCREEN_SETTINGS: "dual-screen-settings",
    DUAL_SCREEN_SETTINGS_UPDATE: "dual-screen-settings/update",
    SEND_TEST_EMAIL: "send-test-email",
    FRONT_CMS: "front-cms",
    CHANGE_USER_PASSWORD: "change-user-password",
    FIELD_CONFIGURATION: "field-configuration",
    BACKUP_DATABASE: "backup-database",
    CUSTOMER_WALLET: "customer",
    ALL_CUSTOMER_WALLET: "all-customer-wallet",
    WALLET_TRANSACTIONS: "wallet-transactions",
    DASHBOARD_DATA: "customer/dashboard-data",
    FETCH_FISCAL_YEAR_CREATE: "fiscal-year",
    UPDATE_ACTIVE_FISCAL_YEAR: "fiscal-year/active",
};

export const authActionType = {
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    CHANGE_PASSWORD: "CHANGE_PASSWORD",
    ADMIN_FORGOT_PASSWORD: "ADMIN_FORGOT_PASSWORD",
    ADMIN_RESET_PASSWORD: "ADMIN_RESET_PASSWORD",
};

export const configActionType = {
    FETCH_CONFIG: "FETCH_CONFIG",
    FETCH_ALL_CONFIG: "FETCH_ALL_CONFIG",
};

export const brandsActionType = {
    FETCH_BRANDS: "FETCH_BRANDS",
    FETCH_BRAND: "FETCH_BRAND",
    ADD_BRANDS: "ADD_BRANDS",
    EDIT_BRANDS: "EDIT_BRANDS",
    DELETE_BRANDS: "DELETE_BRANDS",
    FETCH_ALL_BRANDS: "FETCH_ALL_BRANDS",
};

export const bestCustomerActionType = {
    FETCH_BEST_CUSTOMER_REPORT: "FETCH_BEST_CUSTOMER_REPORT",
};

export const emailTemplatesActionType = {
    FETCH_EMAIL_TEMPLATES: "FETCH_EMAIL_TEMPLATES",
    FETCH_EMAIL_TEMPLATE: "FETCH_EMAIL_TEMPLATE",
    EDIT_EMAIL_TEMPLATE: "EDIT_EMAIL_TEMPLATE",
    SET_ACTIVE_DE_ACTIVE: "SET_ACTIVE_DE_ACTIVE",
};

export const smsTemplatesActionType = {
    FETCH_SMS_TEMPLATES: "FETCH_SMS_TEMPLATES",
    FETCH_SMS_TEMPLATE: "FETCH_SMS_TEMPLATE",
    EDIT_SMS_TEMPLATE: "EDIT_SMS_TEMPLATE",
    SET_ACTIVE_DE_ACTIVE: "SET_ACTIVE_DE_ACTIVE",
};

export const expenseActionType = {
    FETCH_EXPENSES: "FETCH_EXPENSES",
    FETCH_EXPENSE: "FETCH_EXPENSE",
    ADD_EXPENSE: "ADD_EXPENSE",
    EDIT_EXPENSE: "EDIT_EXPENSE",
    DELETE_EXPENSE: "DELETE_EXPENSE",
};

export const settingActionType = {
    FETCH_SETTING: "FETCH_SETTING",
    EDIT_SETTINGS: "EDIT_SETTINGS",
    FETCH_CACHE_CLEAR: "FETCH_CACHE_CLEAR",
    FETCH_MAIL_SETTINGS: "FETCH_MAIL_SETTINGS",
    EDIT_MAIL_SETTINGS: "EDIT_MAIL_SETTINGS",
    FETCH_RECEIPT_SETTINGS: "FETCH_RECEIPT_SETTINGS",
    EDIT_RECEIPT_SETTINGS: "EDIT_RECEIPT_SETTINGS",
    GET_FISCAL_YEAR: "FETCH_FISCAL_YEAR",
};

export const dualScreenSettingActionType = {
    FETCH_DUAL_SETTING: "FETCH_DUAL_SETTING",
};

export const storeActionType = {
    FETCH_STORE: "FETCH_STORE",
    ADD_STORE: "ADD_STORE",
    DELETE_STORE: "DELETE_STORE",
}

export const taxActionType = {
    FETCH_TAX: "FETCH_TAX",
    ADD_TAX: "ADD_TAX",
    EDIT_TAXES: "EDIT_TAXES",
    DELETE_TAXES: "DELETE_TAXES",
}

export const paymentMethodActionType = {
    FETCH_PAYMENT_METHOD: "FETCH_PAYMENT_METHOD",
    ADD_PAYMENT_METHOD: "ADD_PAYMENT_METHOD",
    EDIT_PAYMENT_METHOD: "EDIT_PAYMENT_METHOD",
    DELETE_PAYMENT_METHOD: "DELETE_PAYMENT_METHOD",
}

export const posSettingActionType = {
    FETCH_POS_SETTING: "FETCH_POS_SETTING",
    EDIT_POS_SETTINGS: "EDIT_POS_SETTINGS",
};

export const warehouseActionType = {
    FETCH_WAREHOUSES: "FETCH_WAREHOUSES",
    FETCH_WAREHOUSE: "WAREHOUSE",
    ADD_WAREHOUSE: "ADD_WAREHOUSE",
    EDIT_WAREHOUSE: "EDIT_WAREHOUSE",
    DELETE_WAREHOUSE: "DELETE_WAREHOUSE",
    FETCH_ALL_WAREHOUSES: "FETCH_ALL_WAREHOUSES",
    FETCH_WAREHOUSE_REPORT: "FETCH_WAREHOUSE_REPORT",
    FETCH_WAREHOUSE_DETAILS: "FETCH_WAREHOUSE_DETAILS",
};

export const supplierActionType = {
    FETCH_SUPPLIERS: "FETCH_SUPPLIERS",
    FETCH_SUPPLIER: "FETCH_SUPPLIER",
    ADD_SUPPLIER: "ADD_SUPPLIER",
    EDIT_SUPPLIER: "EDIT_SUPPLIER",
    DELETE_SUPPLIER: "DELETE_SUPPLIER",
    FETCH_ALL_SUPPLIERS: "FETCH_ALL_SUPPLIERS",
    FETCH_SUPPLIERS_REPORT: "FETCH_SUPPLIERS_REPORT",
};

export const smsApiActionType = {
    FETCH_SMS_SETTINGS: "FETCH_SMS_SETTINGS",
    EDIT_SMS_SETTING: "EDIT_SMS_SETTING",
};

export const unitsActionType = {
    FETCH_UNITS: "FETCH_UNITS",
    FETCH_UNIT: "FETCH_UNIT",
    ADD_UNIT: "ADD_UNIT",
    EDIT_UNIT: "EDIT_UNIT",
    DELETE_UNIT: "DELETE_UNIT",
};

export const baseUnitsActionType = {
    FETCH_UNITS: "FETCH_UNITS",
    FETCH_UNIT: "FETCH_UNIT",
    ADD_UNIT: "ADD_UNIT",
    EDIT_UNIT: "EDIT_UNIT",
    DELETE_UNIT: "DELETE_UNIT",
    FETCH_ALL_BASE_UNITS: "FETCH_ALL_BASE_UNITS",
};

export const productUnitActionType = {
    PRODUCT_UNITS: "PRODUCT_UNITS",
};

export const rolesActionType = {
    FETCH_ROLES: "FETCH_ROLES",
    FETCH_ROLE: "FETCH_ROLE",
    ADD_ROLES: "ADD_ROLES",
    EDIT_ROLES: "EDIT_ROLES",
    DELETE_ROLES: "DELETE_ROLES",
    FETCH_ALL_ROLES: "FETCH_ALL_ROLES",
};

export const languagesActionType = {
    FETCH_LANGUAGES: "FETCH_LANGUAGES",
    FETCH_LANGUAGE: "FETCH_LANGUAGE",
    ADD_LANGUAGE: "ADD_LANGUAGE",
    EDIT_LANGUAGE: "EDIT_LANGUAGE",
    DELETE_LANGUAGE: "DELETE_LANGUAGE",
    FETCH_ALL_LANGUAGES: "FETCH_ALL_LANGUAGES",
    EDIT_LANGUAGE_DATA: "EDIT_LANGUAGE_DATA",
    FETCH_LANGUAGE_DATA: "FETCH_LANGUAGE_DATA",
};

export const productImageActionType = {
    DELETE_PRODUCT_IMAGE: "DELETE_PRODUCT_IMAGE",
};

export const purchaseActionType = {
    FETCH_PURCHASES: "FETCH_PURCHASES",
    FETCH_CUSTOMER_PURCHASES: "FETCH_CUSTOMER_PURCHASES",
    FETCH_PURCHASE: "FETCH_PURCHASE",
    ADD_PURCHASE: "ADD_PURCHASE",
    EDIT_PURCHASE: "EDIT_PURCHASE",
    DELETE_PURCHASE: "DELETE_PURCHASE",
    PURCHASE_DETAILS: "PURCHASE_DETAILS",
    PURCHASE_PDF_ACTION: "PURCHASE_PDF_ACTION",
};

export const transferActionType = {
    FETCH_TRANSFERS: "FETCH_TRANSFERS",
    FETCH_TRANSFER: "FETCH_TRANSFER",
    ADD_TRANSFER: "ADD_TRANSFER",
    EDIT_TRANSFER: "EDIT_TRANSFER",
    DELETE_TRANSFER: "DELETE_TRANSFER",
    TRANSFER_DETAILS: "TRANSFER_DETAILS",
    TRANSFER_PDF_ACTION: "TRANSFER_PDF_ACTION",
};

export const purchaseReturnActionType = {
    FETCH_PURCHASES_RETURN: "FETCH_PURCHASES_RETURN",
    FETCH_PURCHASE_RETURN: "FETCH_PURCHASE_RETURN",
    ADD_PURCHASE_RETURN: "ADD_PURCHASE_RETURN",
    EDIT_PURCHASE_RETURN: "EDIT_PURCHASE_RETURN",
    DELETE_PURCHASE_RETURN: "DELETE_PURCHASE_RETURN",
    PURCHASES_RETURN_DETAILS: "PURCHASES_RETURN_DETAILS",
};

export const purchaseProductActionType = {
    SEARCH_PURCHASE_PRODUCTS: "SEARCH_PURCHASE_PRODUCTS",
};

export const permissionActionType = {
    FETCH_PERMISSIONS: "FETCH_PERMISSIONS",
};

export const currencyActionType = {
    FETCH_CURRENCIES: "FETCH_CURRENCIES",
    FETCH_CURRENCY: "FETCH_CURRENCY",
    ADD_CURRENCY: "ADD_CURRENCY",
    EDIT_CURRENCY: "EDIT_CURRENCY",
    DELETE_CURRENCY: "DELETE_CURRENCY",
};

export const userActionType = {
    FETCH_USERS: "FETCH_USERS",
    FETCH_USER: "FETCH_USER",
    ADD_USER: "ADD_USER",
    EDIT_USER: "EDIT_USER",
    DELETE_USER: "DELETE_USER",
};

export const languageActionType = {
    UPDATE_LANGUAGE: "UPDATE_LANGUAGE",
    UPDATED_LANGUAGE: "UPDATED_LANGUAGE",
};

export const profileActionType = {
    FETCH_PROFILE: "FETCH_PROFILE",
    UPDATE_PROFILE: "UPDATE_PROFILE",
};

export const productCategoriesActionType = {
    FETCH_PRODUCTS_CATEGORIES: "FETCH_PRODUCTS_CATEGORIES",
    FETCH_PRODUCT_CATEGORIES: "FETCH_PRODUCT_CATEGORIES",
    ADD_PRODUCT_CATEGORIES: "ADD_PRODUCT_CATEGORIES",
    EDIT_PRODUCT_CATEGORIES: "EDIT_PRODUCT_CATEGORIES",
    DELETE_PRODUCT_CATEGORIES: "DELETE_PRODUCT_CATEGORIES",
    FETCH_ALL_PRODUCTS_CATEGORIES: "FETCH_ALL_PRODUCTS_CATEGORIES",
};

export const variationActionType = {
    FETCH_VARIATIONS: "FETCH_VARIATIONS",
    FETCH_VARIATION: "FETCH_VARIATION",
    ADD_VARIATION: "ADD_VARIATION",
    EDIT_VARIATION: "EDIT_VARIATION",
    DELETE_VARIATION: "DELETE_VARIATION",
    FETCH_ALL_VARIATIONS: "FETCH_ALL_VARIATIONS",
};

export const expenseCategoriesActionType = {
    FETCH_EXPENSES_CATEGORIES: "FETCH_EXPENSES_CATEGORIES",
    FETCH_EXPENSE_CATEGORIES: "FETCH_EXPENSE_CATEGORIES",
    ADD_EXPENSE_CATEGORIES: "ADD_EXPENSE_CATEGORIES",
    EDIT_EXPENSE_CATEGORIES: "EDIT_EXPENSE_CATEGORIES",
    DELETE_EXPENSE_CATEGORIES: "DELETE_EXPENSE_CATEGORIES",
    FETCH_ALL_EXPENSES_CATEGORIES: "FETCH_ALL_EXPENSES_CATEGORIES",
};

export const frontSettingActionType = {
    FETCH_FRONT_SETTING: "FETCH_FRONT_SETTING",
};

export const tokenValidationActionType = {
    FETCH_VALIDATION: "FETCH_VALIDATION",
};

export const customerActionType = {
    FETCH_CUSTOMERS: "FETCH_CUSTOMERS",
    FETCH_CUSTOMER: "FETCH_CUSTOMER",
    ADD_CUSTOMER: "ADD_CUSTOMER",
    EDIT_CUSTOMER: "EDIT_CUSTOMER",
    DELETE_CUSTOMER: "DELETE_CUSTOMER",
    FETCH_ALL_CUSTOMER: "FETCH_ALL_CUSTOMER",
    FETCH_CUSTOMERS_REPORT: "FETCH_CUSTOMERS_REPORT",
    FETCH_CUSTOMERS_PAYMENT_REPORT: "FETCH_CUSTOMERS_PAYMENT_REPORT",
};

export const todaySalePurchaseCountActionType = {
    TODAY_SALE_COUNT: "TODAY_SALE_COUNT",
};

export const dashboardActionType = {
    FETCH_ALL_SALE_PURCHASE: "FETCH_ALL_SALE_PURCHASE",
    CUSTOMERS_PURCHASE:"CUSTOMERS_PURCHASE"
};

export const saleActionType = {
    FETCH_SALES: "FETCH_SALES",
    FETCH_SALE: "FETCH_SALE",
    ADD_SALE: "ADD_SALE",
    EDIT_SALE: "EDIT_SALE",
    DELETE_SALE: "DELETE_SALE",
    SEARCH_SALE_PRODUCTS: "SEARCH_SALE_PRODUCTS",
    PRODUCT_SALES_UNIT: "PRODUCT_SALES_UNIT",
    SALE_DETAILS: "SALE_DETAILS",
    SALE_PDF: "SALE_PDF",
    FILTER_STATUS_FILED: "FILTER_STATUS_FILED",
    FILTER_PAYMENT_STATUS_FILED: "FILTER_PAYMENT_STATUS_FILED",
    CREATE_SALE_PAYMENT: "CREATE_SALE_PAYMENT",
    FETCH_SALE_PAYMENT: `${isPurchase() ? 'FETCH_CUSTOMER_PURCHASE_PAYMENT' : 'FETCH_SALE_PAYMENT'}`,
    EDIT_SALE_PAYMENT: "EDIT_SALE_PAYMENT",
    DELETE_SALE_PAYMENT: "DELETE_SALE_PAYMENT",
};

export const holdListActionType = {
    FETCH_HOLDS: "FETCH_HOLDS",
    ADD_HOLD: "ADD_HOLD",
    FETCH_HOLD: "FETCH_HOLD",
    DELETE_HOLD: "DELETE_HOLD",

    EDIT_SALE: "EDIT_SALE",
    DELETE_SALE: "DELETE_SALE",
    SEARCH_SALE_PRODUCTS: "SEARCH_SALE_PRODUCTS",
    PRODUCT_SALES_UNIT: "PRODUCT_SALES_UNIT",
    SALE_DETAILS: "SALE_DETAILS",
    SALE_PDF: "SALE_PDF",
    FILTER_STATUS_FILED: "FILTER_STATUS_FILED",
    FILTER_PAYMENT_STATUS_FILED: "FILTER_PAYMENT_STATUS_FILED",
    CREATE_SALE_PAYMENT: "CREATE_SALE_PAYMENT",
    FETCH_SALE_PAYMENT: "FETCH_SALE_PAYMENT",
    EDIT_SALE_PAYMENT: "EDIT_SALE_PAYMENT",
    DELETE_SALE_PAYMENT: "DELETE_SALE_PAYMENT",
};

export const quotationActionType = {
    FETCH_QUOTATIONS: "FETCH_QUOTATIONS",
    FETCH_QUOTATION: "FETCH_QUOTATION",
    ADD_QUOTATION: "ADD_QUOTATION",
    EDIT_QUOTATION: "EDIT_QUOTATION",
    DELETE_QUOTATION: "DELETE_QUOTATION",
    SEARCH_SALE_PRODUCTS: "SEARCH_SALE_PRODUCTS",
    PRODUCT_SALES_UNIT: "PRODUCT_SALES_UNIT",
    QUOTATION_DETAILS: "QUOTATION_DETAILS",
    QUOTATION_PDF: "QUOTATION_PDF",
    FILTER_STATUS_FILED: "FILTER_STATUS_FILED",
    FILTER_PAYMENT_STATUS_FILED: "FILTER_PAYMENT_STATUS_FILED",
    CREATE_SALE_PAYMENT: "CREATE_SALE_PAYMENT",
    FETCH_SALE_PAYMENT: "FETCH_SALE_PAYMENT",
    EDIT_SALE_PAYMENT: "EDIT_SALE_PAYMENT",
    DELETE_SALE_PAYMENT: "DELETE_SALE_PAYMENT",
};

export const adjustMentActionType = {
    FETCH_ADJUSTMENTS: "FETCH_ADJUSTMENTS",
    FETCH_ADJUSTMENT: "FETCH_ADJUSTMENT",
    ADD_ADJUSTMENTS: "ADD_ADJUSTMENTS",
    EDIT_ADJUSTMENTS: "EDIT_ADJUSTMENTS",
    DELETE_ADJUSTMENT: "DELETE_ADJUSTMENT",
    ADJUSTMENT_DETAILS: "ADJUSTMENT_DETAILS",
};

export const saleReturnActionType = {
    FETCH_SALES_RETURN: "FETCH_SALES_RETURN",
    FETCH_SALE_RETURN: "FETCH_SALE_RETURN",
    ADD_SALE_RETURN: "ADD_SALE_RETURN",
    EDIT_SALE_RETURN: "EDIT_SALE",
    DELETE_SALE_RETURN: "DELETE_SALE_RETURN",
    SEARCH_SALE_PRODUCTS: "SEARCH_SALE_PRODUCTS",
    PRODUCT_SALES_UNIT: "PRODUCT_SALES_UNIT",
    SALE_DETAILS: "SALE_DETAILS",
    FETCH_SALE_RETURN_DETAILS: "FETCH_SALE_RETURN_DETAILS",
};

export const recentSaleActionType = {
    RECENT_SALES: "RECENT_SALES",
};

export const stockReportActionType = {
    STOCK_REPORT: "STOCK_REPORT",
    STOCK_DETAILS_SALE_TAB: "STOCK_DETAILS_SALE_TAB",
    STOCK_DETAILS_SALE_RETURN_TAB: "STOCK_DETAILS_SALE_RETURN_TAB",
    STOCK_DETAILS_PURCHASE_TAB: "STOCK_DETAILS_PURCHASE_TAB",
    STOCK_DETAILS_PURCHASE_RETURN_TAB: "STOCK_DETAILS_PURCHASE_RETURN_TAB",
    STOCK_DETAILS_WAREHOUSE: "STOCK_DETAILS_WAREHOUSE",
};

export const supplierReportActionType = {
    FETCH_SUPPLIER_PURCHASE_REPORT: "FETCH_SUPPLIER_PURCHASE_REPORT",
    FETCH_SUPPLIER_PURCHASE_RETURN: "FETCH_SUPPLIER_PURCHASE_RETURN",
    FETCH_SUPPLIER_WIDGET_DATA: "FETCH_SUPPLIER_WIDGET_DATA",
};

export const customerReportActionType = {
    FETCH_CUSTOMER_WIDGET_DATA: "FETCH_CUSTOMER_WIDGET_DATA",
};

export const productQuantityReportActionType = {
    QUANTITY_REPORT: "QUANTITY_REPORT",
};

export const profitAndLossReportActionType = {
    FETCH_PROFIT_AND_LOSS: "FETCH_PROFIT_AND_LOSS",
};

export const topSellingActionType = {
    TOP_SELLING: "TOP_SELLING",
    TOP_SELLING_REPORT: "TOP_SELLING_REPORT",
};

export const topCustomersActionType = {
    TOP_CUSTOMERS: "TOP_CUSTOMERS",
    FETCH_STOCK_ALERT: "FETCH_STOCK_ALERT",
};

export const weekSalePurchasesActionType = {
    WEEK_SALE_PURCHASES: "WEEK_SALE_PURCHASES",
};

export const yearTopProductActionType = {
    YEAR_TOP_PRODUCT: "YEAR_TOP_PRODUCT",
};

export const frontCmsActionType = {
    FETCH_FRONT_CMS: "FETCH_FRONT_CMS",
};

export const fieldConfigurationActionType = {
    FETCH_FIELD_CONFIGURATION: "FETCH_FIELD_CONFIGURATION",
    UPDATE_FIELD_CONFIGURATION: "UPDATE_FIELD_CONFIGURATION",
};
export const walletActionType = {
    FETCH_WALLET_TRANSACTIONS: 'FETCH_WALLET_TRANSACTIONS',
    FETCH_SINGLE_WALLET_TRANSACTION: 'FETCH_SINGLE_WALLET_TRANSACTION',
};


export const Filters = {
    PAGE: 1,
    OBJ: {
        order_By: "",
        page: 1,
        pageSize: 10,
        direction: "asc",
        search: "",
        adminName: "admin",
        categoryId: "",
        created_at: "created_at",
        status: "",
        payment_status: "",
        payment_type: "",
        product_unit: "",
        base_unit: "",
        brand_id:"",
        product_category_id:''
    },
};

export const constants = {
    SET_TOTAL_RECORD: "SET_TOTAL_RECORD",
    UPDATE_TOTAL_RECORD_AFTER_DELETE: "UPDATE_TOTAL_RECORD_AFTER_DELETE",
    UPDATE_TOTAL_RECORD_AFTER_ADD: "UPDATE_TOTAL_RECORD_AFTER_ADD",
    IS_LOADING: "IS_LOADING",
    SET_LANGUAGE: "SET_LANGUAGE",
    DATE_ACTION: "DATE_ACTION",
    CALL_SALE_API: "CALL_SALE_API",
    CALL_IMPORT_PRODUCT_API: "CALL_IMPORT_PRODUCT_API",
    SET_PRODUCT_UNIT_ID: "SET_PRODUCT_UNIT_ID",
    SET_DATE_FORMAT: "SET_DATE_FORMAT",
    CALL_UPDATE_BRAND_API: "CALL_UPDATE_BRAND_API",
    SET_SAVING: "SET_SAVING",
    SET_DEFAULT_COUNTRY: "SET_DEFAULT_COUNTRY",
};

export const dateLabelSelector = {
    CLEAN: "clean",
    TODAY: "today",
    THIS_WEEK: "this_week",
    LAST_WEEK: "last_week",
    THIS_MONTH: "this_month",
    LAST_MONTH: "last_month",
    THIS_FISCAL_YEAR: "this_fiscal_year",
    LAST_FISCAL_YEAR: "last_fiscal_year",
    CUSTOM: "custom",
};

export const dateFormat = {
    DEFAULT_MOMENT: "YYYY-MM-DD hh:mm:ss",
    NATIVE: "YYYY-MM-DD",
    CHART_DATE: "YYYY/MM/DD",
    CHART_CUSTOM_DATE: "MMM_YYYY",
};

export const toastType = {
    ADD_TOAST: "ADD_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
    ERROR: "error",
};

export const Tokens = {
    ADMIN: "auth_token",
    USER: "user",
    FIRST_NAME: "first_name",
    LAST_NAME: "last_name",
    IMAGE: "image",
    REGISTER_USER: "register_user",
    GET_PERMISSIONS: "get_permissions",
    USER_IMAGE_URL: "user_image_url",
    UPDATED_EMAIL: "updated_email",
    UPDATED_FIRST_NAME: "updated_first_name",
    UPDATED_LAST_NAME: "updated_last_name",
    LANGUAGE: "language",
    UPDATED_LANGUAGE: "updated_language",
};

export const errorMessage = {
    TOKEN_NOT_PROVIDED: "Token not provided",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_INVALID:
        "Could not decode token: Error while decoding to JSON: Syntax error",
    TOKEN_INVALID_SIGNATURE: "Token Signature could not be verified.",
};

export const Permissions = {
    MANAGE_DASHBOARD: "manage_dashboard",
    MANAGE_CUSTOMER_DASHBOARD:"manage_customer_dashboard",
    MANAGE_CUSTOMERS_PURCHASE: "manage_customer_purchases",
    MANAGE_ROLES: "manage_roles",
    MANAGE_BRANDS: "manage_brands",
    MANAGE_CURRENCY: "manage_currency",
    MANAGE_WAREHOUSES: "manage_warehouses",
    MANAGE_UNITS: "manage_units",
    MANAGE_PRODUCT_CATEGORIES: "manage_product_categories",
    MANAGE_VARIATIONS: "manage_variations",
    MANAGE_PRODUCTS: "manage_products",
    MANAGE_SUPPLIERS: "manage_suppliers",
    MANAGE_CUSTOMERS: "manage_customer_wallets",
    MANAGE_USER: "manage_users",
    MANAGE_EXPENSES_CATEGORIES: "manage_expense_categories",
    MANAGE_EXPENSES: "manage_expenses",
    MANAGE_SETTING: "manage_setting",
    MANAGE_PURCHASE: "manage_purchase",
    MANAGE_PURCHASE_RETURN: "manage_purchase_return",
    MANAGE_POS_SCREEN: "manage_pos_screen",
    MANAGE_SALE: "manage_sale",
    MANAGE_SALE_RETURN: "manage_sale_return",
    MANAGE_REPORT: "manage_report",
    MANAGE_PRINT_BARCODE: "manage_print_barcode",
    MANAGE_ADJUSTMENTS: "manage_adjustments",
    MANAGE_TRANSFERS: "manage_transfers",
    MANAGE_REPORTS: "manage_reports",
    MANAGE_EMAIL_TEMPLATES: "manage_email_templates",
    MANAGE_QUOTATION: "manage_quotations",
    MANAGE_SMS_API: "manage_sms_apis",
    MANAGE_SMS_TEMPLATES: "manage_sms_templates",
    MANAGE_LANGUAGES: "manage_language",
    CREATE_ADJUSTMENTS: "create_adjustments",
    VIEW_ADJUSTMENTS: "view_adjustments",
    EDIT_ADJUSTMENTS: "edit_adjustments",
    DELETE_ADJUSTMENTS: "delete_adjustments",
    CREATE_BRANDS: "create_brands",
    VIEW_BRANDS: "view_brands",
    EDIT_BRANDS: "edit_brands",
    DELETE_BRANDS: "delete_brands",
    CREATE_CURRENCY: "create_currency",
    VIEW_CURRENCY: "view_currency",
    EDIT_CURRENCY: "edit_currency",
    DELETE_CURRENCY: "delete_currency",
    CREATE_CUSTOMERS: "create_customers",
    VIEW_CUSTOMERS: "view_customers",
    EDIT_CUSTOMERS: "edit_customers",
    DELETE_CUSTOMERS: "delete_customers",
    CREATE_EXPENSE_CATEGORIES: "create_expense_categories",
    VIEW_EXPENSE_CATEGORIES: "view_expense_categories",
    EDIT_EXPENSE_CATEGORIES: "edit_expense_categories",
    DELETE_EXPENSE_CATEGORIES: "delete_expense_categories",
    CREATE_EXPENSES: "create_expenses",
    VIEW_EXPENSES: "view_expenses",
    EDIT_EXPENSES: "edit_expenses",
    DELETE_EXPENSES: "delete_expenses",
    CREATE_LANGUAGE: "create_language",
    VIEW_LANGUAGE: "view_language",
    EDIT_LANGUAGE: "edit_language",
    DELETE_LANGUAGE: "delete_language",
    CREATE_PRODUCT_CAREGORIES: "create_product_categories",
    VIEW_PRODUCT_CAREGORIES: "view_product_categories",
    EDIT_PRODUCT_CAREGORIES: "edit_product_categories",
    DELETE_PRODUCT_CAREGORIES: "delete_product_categories",
    CREATE_PRODUCTS: "create_products",
    VIEW_PRODUCTS: "view_products",
    EDIT_PRODUCTS: "edit_products",
    DELETE_PRODUCTS: "delete_products",
    CREATE_PURCHASE: "create_purchase",
    VIEW_PURCHASE: "view_purchase",
    EDIT_PURCHASE: "edit_purchase",
    DELETE_PURCHASE: "delete_purchase",
    CREATE_PURCHASE_RETURN: "create_purchase_return",
    VIEW_PURCHASE_RETURN: "view_purchase_return",
    EDIT_PURCHASE_RETURN: "edit_purchase_return",
    DELETE_PURCHASE_RETURN: "delete_purchase_return",
    CREATE_QUOTATIONS: "create_quotations",
    VIEW_QUOTATIONS: "view_quotations",
    EDIT_QUOTATIONS: "edit_quotations",
    DELETE_QUOTATIONS: "delete_quotations",
    CREATE_ROLES: "create_roles",
    VIEW_ROLES: "view_roles",
    EDIT_ROLES: "edit_roles",
    DELETE_ROLES: "delete_roles",
    CREATE_SALE: "create_sale",
    VIEW_SALE: "view_sale",
    EDIT_SALE: "edit_sale",
    DELETE_SALE: "delete_sale",
    CREATE_SALE_RETURN: "create_sale_return",
    VIEW_SALE_RETURN: "view_sale_return",
    EDIT_SALE_RETURN: "edit_sale_return",
    DELETE_SALE_RETURN: "delete_sale_return",
    CREATE_SUPPLIERS: "create_suppliers",
    VIEW_SUPPLIERS: "view_suppliers",
    EDIT_SUPPLIERS: "edit_suppliers",
    DELETE_SUPPLIERS: "delete_suppliers",
    CREATE_TRANSFERS: "create_transfers",
    VIEW_TRANSFERS: "view_transfers",
    EDIT_TRANSFERS: "edit_transfers",
    DELETE_TRANSFERS: "delete_transfers",
    CREATE_UNITS: "create_units",
    VIEW_UNITS: "view_units",
    EDIT_UNITS: "edit_units",
    DELETE_UNITS: "delete_units",
    CREATE_VARIATIONS: "create_variations",
    VIEW_VARIATIONS: "view_variations",
    EDIT_VARIATIONS: "edit_variations",
    DELETE_VARIATIONS: "delete_variations",
    CREATE_WAREHOUSES: "create_warehouses",
    VIEW_WAREHOUSES: "view_warehouses",
    EDIT_WAREHOUSES: "edit_warehouses",
    DELETE_WAREHOUSES: "delete_warehouses",
    CREATE_USERS: "create_users",
    VIEW_USERS: "view_users",
    EDIT_USERS: "edit_users",
    DELETE_USERS: "delete_users",
};

//POS Screen Constants
export const productActionType = {
    FETCH_PRODUCTS: "FETCH_PRODUCTS",
    FETCH_PRODUCT: "FETCH_PRODUCT",
    ADD_PRODUCT: "ADD_PRODUCT",
    EDIT_PRODUCT: "EDIT_PRODUCT",
    DELETE_PRODUCT: "DELETE_PRODUCT",
    FETCH_BRAND_CLICKABLE: "FETCH_BRAND_CLICKABLE",
    FETCH_ALL_PRODUCTS: "FETCH_ALL_PRODUCTS",
    FETCH_PRODUCTS_BY_WAREHOUSE: "FETCH_PRODUCTS_BY_WAREHOUSE",
    REMOVE_ALL_PRODUCTS: "REMOVE_ALL_PRODUCTS",
    ADD_IMPORT_PRODUCT: "ADD_IMPORT_PRODUCT",
    FETCH_ALL_MAIN_PRODUCTS: "FETCH_ALL_MAIN_PRODUCTS",
    FETCH_MAIN_PRODUCT: "FETCH_MAIN_PRODUCT",
    ADD_MAIN_PRODUCT: "ADD_MAIN_PRODUCT",
    EDIT_MAIN_PRODUCT: "EDIT_MAIN_PRODUCT",
    DELETE_MAIN_PRODUCT: "DELETE_MAIN_PRODUCT",
    RESET_PRODUCT: "RESET_PRODUCT",
};

export const posProductActionType = {
    FETCH_PRODUCT: "FETCH_PRODUCT",
    POS_ALL_PRODUCT: "POS_ALL_PRODUCT",
    POS_ALL_PRODUCTS: "POS_ALL_PRODUCTS",
    POS_SEARCH_NAME_PRODUCT: "POS_SEARCH_NAME_PRODUCT",
    POS_SEARCH_CODE_PRODUCT: "POS_SEARCH_CODE_PRODUCT",
    POS_SEARCH_PRODUCT: "POS_SEARCH_PRODUCT",
    FETCH_TODAY_SALE_OVERALL_REPORT: "FETCH_TODAY_SALE_OVERALL_REPORT",
};

export const posRegisterDetailsAction = {
    GET_REGISTER_DETAILS: "GET_REGISTER_DETAILS",
};

export const posRegisterReportDetailsAction = {
    GET_REGISTER_REPORT_DETAILS: "GET_REGISTER_REPORT_DETAILS",
};

export const posCashPaymentActionType = {
    POS_CASH_PAYMENT: "POS_CASH_PAYMENT",
};

export const settingsKey = {
    LANGUAGE: "language",
    DEFAULT_LOCALE: "en",
    LOCALE_ARABIC: "ar",
    LOCALE_PERSIAN: "pe",
    LOCAL_GERMAN: "gr",
};

export const baseUnitOptions = [
    { id: 0, name: "unit.filter.all.label" },
    { id: 1, name: "unit.filter.piece.label" },
    { id: 2, name: "unit.filter.meter.label" },
    { id: 3, name: "unit.filter.kilogram.label" },
];

export const statusOptions = [
    { id: 0, name: "unit.filter.all.label" },
    { id: 1, name: "status.filter.received.label" },
    { id: 2, name: "status.filter.pending.label" },
    { id: 3, name: "status.filter.ordered.label" },
];

export const saleStatusOptions = [
    { id: 1, name: "status.filter.complated.label" },
    { id: 2, name: "status.filter.pending.label" },
    { id: 3, name: "status.filter.ordered.label" },
];

export const purchaseStatusOptions = [
    { id: 1, name: "status.filter.received.label" },
    { id: 2, name: "status.filter.pending.label" },
    { id: 3, name: "status.filter.ordered.label" },
];

export const salePaymentStatusOptions = [
    { id: 1, name: "payment-status.filter.paid.label" },
    { id: 2, name: "payment-status.filter.unpaid.label" },
    { id: 3, name: "payment-status.filter.partial.label" },
];

export const purchasePaymentStatusOptions = [
    { id: 1, name: "payment-status.filter.paid.label" },
    { id: 2, name: "payment-status.filter.unpaid.label" },
    { id: 3, name: "payment-status.filter.partial.label" },
];

export const paymentStatusOptions = [
    { id: 0, name: "unit.filter.all.label" },
    { id: 1, name: "payment-status.filter.paid.label" },
    { id: 2, name: "payment-status.filter.unpaid.label" },
    { id: 3, name: "payment-status.filter.partial.label" },
];

export const unitOptions = [
    { id: 1, name: "unit.filter.piece.label" },
    { id: 2, name: "unit.filter.meter.label" },
    { id: 3, name: "unit.filter.kilogram.label" },
];

export const paymentMethodOptions = [
    { id: 1, name: "cash.label" },
    { id: 2, name: "payment-type.filter.cheque.label" },
    { id: 3, name: "payment-type.filter.bank-transfer.label" },
    { id: 4, name: "payment-type.filter.other.label" },
];

export const paymentTypeOptions = [
    { id: 0, name: "unit.filter.all.label" },
    { id: 1, name: "cash.label" },
    { id: 2, name: "payment-type.filter.cheque.label" },
    { id: 3, name: "payment-type.filter.bank-transfer.label" },
    { id: 4, name: "payment-type.filter.other.label" },
];

export const taxMethodOptions = [
    { id: 1, name: "tax-type.filter.exclusive.label" },
    { id: 2, name: "tax-type.filter.inclusive.label" },
];

export const productTypesOptions = [
    { id: 1, name: "products.type.single-type.label" },
    { id: 2, name: "variation.title" },
];

export const discountMethodOptions = [
    { id: 1, name: "discount-type.filter.percentage.label" },
    { id: 2, name: "discount-type.filter.fixed.label" },
];

export const discountType = {
    PERCENTAGE: 1,
    FIXED: 2,
}

export const quotationStatusOptions = [
    { id: 1, name: "status.filter.sent.label" },
    { id: 2, name: "status.filter.pending.label" },
];

export const transferStatusOptions = [
    { id: 0, name: "unit.filter.all.label" },
    { id: 1, name: "status.filter.complated.label" },
    { id: 2, name: "status.filter.sent.label" },
    { id: 3, name: "status.filter.pending.label" },
];

export const transferCreatStatusOptions = [
    { id: 1, name: "status.filter.complated.label" },
    { id: 2, name: "status.filter.sent.label" },
    { id: 3, name: "status.filter.pending.label" },
];

export const smsStatusOptions = [
    { id: 1, name: "active.status.lable" },
    { id: 2, name: "in-active.status.lable" },
];

export const saleReturnStatusOptions = [
    { id: 1, name: "status.filter.received.label" },
    { id: 2, name: "status.filter.pending.label" },
];

export const languageFileOptions = [
    { id: 1, name: "Language.json" },
    { id: 2, name: "Messages.php" },
    { id: 3, name: "Error Messages" },
    { id: 4, name: "Success Messages" },
    { id: 5, name: "Pdf Messages" },
];

export const paymentStatusOptionsConstant = {
    PAID: 1,
    UNPAID: 2,
    PARTIAL: 3
} 

export const decimalPlacesOptions = [
    { value: 0, label: "0 (1234)", id:  0 },
    { value: 1, label: "1 (1234.0)", id:  1 },
    { value: 2, label: "2 (1234.00)", id: 2 },
    { value: 3, label: "3 (1234.000)", id:  3 },
    { value: 4, label: "4 (1234.0000)", id: 4 },
];


export const thousandsSeparatorOptions = [
    { value: 1, label: "Dot (1.234.00)" },
    { value: 2, label: "Comma (1,234.00)" },
    { value: 3, label: "Space (1 234.00)" },
    { value: 4, label: "None (1234.00)" },
];

export const decimalSeparatorOptions = [
    { value: 1, label: "Dot (1234.00)" },
    { value: 2, label: "Comma (1234,00)" },
];

export const Font_style = [
    { value: 0, label: getFormattedMessage("globally.normal.title"), type: 400 },
    { value: 1, label: getFormattedMessage("globally.bold.title"), type: 600 },
    { value: 2, label: getFormattedMessage("globally.bolder.title"), type: 800 },
]

export const Font_color = [
    { value: 0, label: getFormattedMessage("font.color.black.title"), type: "black" },
    { value: 1, label: getFormattedMessage("font.color.gray.title"), type: "#555555" },
]

export const Font_size = [
    { value: 0, label: getFormattedMessage("font.style.small.title"), type: 14 },
    { value: 1, label: getFormattedMessage("font.style.medium.title"), type: 18 },
    { value: 2, label: getFormattedMessage("font.style.large.title"), type: 20},
]

export const Paper_size = [
    { value: 0, label: "A4", type: "A4" },
    { value: 1, label: "Thermal", type: "58mm" },
]

export const Thermal_sizes = [
    { value: 0, label: "58mm", type: "58mm" },
    { value: 1, label: "80mm", type: "80mm" },
]


export const ROLES = {
    ADMIN: "admin",
};

export const pos_shortcuts = [
    {value:'pos_shortcut_f1', name: "F1"},
    {value:'pos_shortcut_f2', name: "F2"},
    {value:'pos_shortcut_f3', name: "F3"},
    {value:'pos_shortcut_f4', name: "F4"},
    {value:'pos_shortcut_f5', name: "F5"},
]

export const Product_Price_Types = [
    { id: 1, name: getFormattedMessage("price.group.retail.title") },
    { id: 2, name: getFormattedMessage("price.group.wholesale.title") },
    { id: 3, name: getFormattedMessage("price.group.special.title") },
    { id: 4, name: getFormattedMessage("price.group.custom.title") },
]


