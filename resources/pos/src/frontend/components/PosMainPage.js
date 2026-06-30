import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row, Table } from "react-bootstrap-v5";
import { connect, useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import Category from "./Category";
import Brands from "./Brand";
import Product from "./product/Product";
import ProductCartList from "./cart-product/ProductCartList";
import {
    posSearchNameProduct,
    posSearchCodeProduct,
} from "../../store/action/pos/posfetchProductAction";
import ProductSearchbar from "./product/ProductSearchbar";
import { prepareCartArray } from "../shared/PrepareCartArray";
import ProductDetailsModel from "../shared/ProductDetailsModel";
import CartItemMainCalculation from "./cart-product/CartItemMainCalculation";
import PosHeader from "./header/PosHeader";
import { posCashPaymentAction } from "../../store/action/pos/posCashPaymentAction";
import PaymentButton from "./cart-product/PaymentButton";
import CashPaymentModel from "./cart-product/paymentModel/CashPaymentModel";
import PrintData from "./printModal/PrintData";
import PaymentSlipModal from "./paymentSlipModal/PaymentSlipModal";
import { fetchSetting } from "../../store/action/settingAction";
import { calculateProductCost } from "../shared/SharedMethod";
import {
    fetchBrandClickable,
    posAllProduct,
} from "../../store/action/pos/posAllProductAction";
import TabTitle from "../../shared/tab-title/TabTitle";
import HeaderAllButton from "./header/HeaderAllButton";
import RegisterDetailsModel from "./register-detailsModal/RegisterDetailsModel";
import PrintRegisterDetailsData from "./printModal/PrintRegisterDetailsData";
import {
    closeRegisterAction,
    fetchTodaySaleOverAllReport,
    getAllRegisterDetailsAction,
} from "../../store/action/pos/posRegisterDetailsAction";
import {
    getDecimalPlaces,
    getFormattedMessage,
    getFormattedOptions,
} from "../../shared/sharedMethod";
import { apiBaseURL, discountType, paymentMethodOptions, productActionType, toastType } from "../../constants";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import CustomerForm from "./customerModel/CustomerForm";
import HoldListModal from "./holdListModal/HoldListModal";
import { fetchHoldLists, fetchHoldList, deleteHoldItem } from "../../store/action/pos/HoldListAction";
import { useNavigate } from "react-router";
import PosCloseRegisterDetailsModel from "../../components/posRegister/PosCloseRegisterDetailsModel.js";
import { addToast } from "../../store/action/toastAction";
import PosRegisterModel from "../../components/posRegister/PosRegisterModel.js";
import { fetchTax } from "../../store/action/taxAction.js";
import { fetchPaymentMethods } from "../../store/action/paymentMethodAction.js";
import { setCartProduct } from "../../store/action/cartAction.js";
import RecentSaleModal from "./recentSaleModal/RecentSaleModal.js";
import { fetchSales } from "../../store/action/salesAction.js";
import apiConfig from "../../config/apiConfig";
import { fetchCustomer, fetchSingleCustomer } from "../../store/action/customerAction.js";
import { Modal } from "react-bootstrap";
import QuickPaymentModal from "./QuickPaymentModal.js";
import ShortcutsInfoModel from "./ShortcutsInfoModel.js";

const PosMainPage = (props) => {
    const {
        onClickFullScreen,
        posAllProducts,
        customCart,
        posCashPaymentAction,
        frontSetting,
        settings,
        fetchSetting,
        paymentDetails,
        allConfigData,
        fetchBrandClickable,
        posAllTodaySaleOverAllReport,
        fetchHoldLists,
        holdListData,
        taxes,
        fetchPaymentMethods,
        paymentMethods,
        sales,
        singleCustomer,
        editholdListData,
        fetchHoldList,
        deleteHoldItem
    } = props;
    const componentRef = useRef();
    const registerDetailsRef = useRef();
    // const [play] = useSound('https://s3.amazonaws.com/freecodecamp/drums/Heater-4_1.mp3');
    const [openCalculator, setOpenCalculator] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [updateProducts, setUpdateProducts] = useState([]);
    const [isOpenCartItemUpdateModel, setIsOpenCartItemUpdateModel] =
        useState(false);
    const [product, setProduct] = useState(null);
    const [cartProductIds, setCartProductIds] = useState([]);
    const [newCost, setNewCost] = useState("");
    const [paymentPrint, setPaymentPrint] = useState({});
    const [cashPayment, setCashPayment] = useState(false);
    const [modalShowPaymentSlip, setModalShowPaymentSlip] = useState(false);
    const [modalShowCustomer, setModalShowCustomer] = useState(false);
    const [productMsg, setProductMsg] = useState(0);
    const [brandId, setBrandId] = useState();
    const [categoryId, setCategoryId] = useState();
    const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [updateHolList, setUpdateHoldList] = useState(false);
    const [hold_ref_no, setHold_ref_no] = useState("");
    const [page, setPage] = useState(1);
    const [salePage, setSalePage] = useState(1);
    const [isWalletBalance,setisWalletBalance] = useState(false)
    const [walletBalance,setWalletBalance] = useState(0)
    const [walletBalanceUsed,setWalletBalanceUsed] = useState(0)
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [quickSaleConfirm, setquickSaleConfirm] = useState(false);
    const [quickPayAmount, setQuickPayAmount] = useState(0);
    const [IsShortcutsModel,setIsShortcutsModel] = useState(false);
    const [cartItemValue, setCartItemValue] = useState({
        discount_type: discountType.FIXED,    // 0 = fixed, 1 = percentage
        discount_value: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
    });
    const [cashPaymentValue, setCashPaymentValue] = useState({
        notes: "",
        payment_status: {
            label: getFormattedMessage("dashboard.recentSales.paid.label"),
            value: 1,
        },
        payment_details: [{
            amount: '',
            payment_type: ''
        }]
    });
    const filteredQuickPaymentMethod = paymentMethods.find(p => p?.id == settings?.attributes?.quick_payment_method);
    const quick_payment_method = {
        value: filteredQuickPaymentMethod?.id,
        label: filteredQuickPaymentMethod?.attributes?.name || ''
    }

    useEffect(() => {
        if (isWalletBalance) {
            const walletPaymentMethod = paymentMethods.find(p => p?.attributes?.type === 1);
            

            if (walletBalance >= Number(grandTotal)) {
                const nonWalletPaymentMethod = paymentMethods.find(p => p?.attributes?.type !== 1);
                setCashPaymentValue(prev => ({
                    ...prev,
                    payment_details: [
                        {
                            amount: Number(grandTotal).toString(),
                           payment_type: { value: walletPaymentMethod?.id, label: walletPaymentMethod?.attributes?.name }
                        }   
                    ]
                }));
                setWalletBalanceUsed(Number(grandTotal));
            } else {
                const remainingAmount = Number(grandTotal) - Number(walletBalance);
                const nonWalletPaymentMethod = paymentMethods.find(p => p?.attributes?.type !== 1);
                setCashPaymentValue(prev => ({
                    ...prev,
                    payment_details: [
                       {
                            amount: Number(walletBalance).toString(),
                            payment_type: { value: walletPaymentMethod?.id, label: walletPaymentMethod?.attributes?.name, type: walletPaymentMethod?.attributes?.type }
                        },
                        {
                            amount: remainingAmount.toString(),
                            payment_type: nonWalletPaymentMethod ? { value: nonWalletPaymentMethod.id, label: nonWalletPaymentMethod.attributes.name } : prev.payment_details[0]?.payment_type
                        }
                    ]
                }));
                setWalletBalanceUsed(Number(walletBalance));
            }
        } else {
            // When wallet is disabled, reset to normal single payment
            const defaultPaymentMethod = paymentMethods.length > 0 ? { value: paymentMethods[0]?.id, label: paymentMethods[0]?.attributes?.name } : '';
            setCashPaymentValue(prev => ({
                ...prev,
                payment_details: [
                    {
                        amount: Number(grandTotal).toString(),
                        payment_type: defaultPaymentMethod || prev.payment_details[0]?.payment_type
                    }
                ]
            }));
            setWalletBalance(selectedCustomer?.attributes?.wallet_amount || 0);
            setWalletBalanceUsed(0);
        }
    }, [isWalletBalance, grandTotal, walletBalance, paymentMethods]);


useEffect(()=>{
},[paymentDetails,isWalletBalance])


    const [errors, setErrors] = useState({ notes: "" });
    // const [searchString, setSearchString] = useState('');
    const [changeReturn, setChangeReturn] = useState(0);
    const [showCloseDetailsModal, setShowCloseDetailsModal] = useState(false);
    const [showPosRegisterModel, setShowPosRegisterModel] = useState(false)
    const { closeRegisterDetails } = useSelector((state) => state);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //total Qty on cart item
    const localCart = updateProducts.map((updateQty) =>
        Number(updateQty.quantity)
    );
    const totalQty =
        localCart.length > 0 && Number(localCart?.reduce((cart, current) => cart + current, 0)).toFixed(settings?.attributes?.decimal_places || 2);

    //subtotal on cart item
    const localTotal = updateProducts.map(
        (updateQty) =>
            calculateProductCost(updateQty) * updateQty.quantity
    );
    const subTotal =
        localTotal.length > 0 &&
        localTotal.reduce((cart, current) => {
            const decimalPlaces = settings?.attributes?.decimal_places || 2;
            const roundedCart = parseFloat(cart.toFixed(decimalPlaces));
            const roundedCurrent = parseFloat(current.toFixed(decimalPlaces));
            return roundedCart + roundedCurrent;
        }, 0)

    const [holdListId, setHoldListValue] = useState({
        referenceNumber: "",
    });

    //grand total on cart item
    const discountTotal = subTotal - cartItemValue.discount;
    const taxTotal = (discountTotal * cartItemValue.tax) / 100;
    const mainTotal = discountTotal + taxTotal;
    const decimalPlaces = settings?.attributes?.decimal_places || 2;
    const grandTotal = (parseFloat(mainTotal) + parseFloat(cartItemValue.shipping)).toFixed(decimalPlaces);

    useEffect(() => {
        setPaymentPrint({
            ...paymentPrint,
            barcode_url:
                paymentDetails.attributes &&
                paymentDetails.attributes.barcode_url,
            reference_code:
                paymentDetails.attributes &&
                paymentDetails.attributes.reference_code,
            paid_amount:
                paymentDetails.attributes &&
                paymentDetails.attributes.paid_amount,
            payments: paymentDetails.attributes &&
                paymentDetails.attributes.payments,
        });
    }, [paymentDetails]);

    useEffect(() => {
        setSelectedCustomerOption(
            settings.attributes && {
                value: Number(settings?.attributes?.default_customer),
                label: settings.attributes.customer_name,
            }
        );
        setSelectedOption(
            settings.attributes && {
                value: Number(settings?.attributes?.default_warehouse),
                label: settings.attributes.warehouse_name,
            }
        );
    }, [settings]);

    useEffect(async() => {
        const customer = await apiConfig.get(`${apiBaseURL.CUSTOMERS}/${selectedCustomerOption?.value || settings.attributes?.default_customer}`).then(res => res?.data?.data).catch(err => err);
        setSelectedCustomer(customer);
        setWalletBalance(customer?.attributes?.wallet_amount || 0);
    }, [selectedCustomerOption,cashPayment])


    useEffect(() => {
        fetchSetting();
        fetchTodaySaleOverAllReport();
        fetchHoldLists({
            warehouse_id: selectedOption?.value || settings?.attributes?.default_warehouse,
            customer_id: selectedCustomerOption?.value || settings?.attributes?.default_customer,
        });
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        if(allConfigData){
            setShowPosRegisterModel(allConfigData?.open_register)
        }
    },[allConfigData])

    useEffect(() => {
        if (updateHolList === true) {
            fetchHoldLists();
            setUpdateHoldList(false);
        }
    }, [updateHolList]);
   
    const walletpaymentMethod =  paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1 && item.attributes.type == 1));
    const paymentTypeFilterOptions = paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1 && item.attributes.type !== 1));
    const paymentTypeDefaultValue = paymentTypeFilterOptions && paymentTypeFilterOptions?.map((option) => {
        return {
            value: option?.id,
            label: option?.attributes?.name,
            type: option?.attributes?.type,
        };
    });

    const [paymentValue, setPaymentValue] = useState({
        payment_type: paymentTypeDefaultValue && paymentTypeDefaultValue[0],
    });

    useEffect(() => {
        setUpdateProducts(updateProducts);
        setCashPaymentValue({
            ...cashPaymentValue,
            payment_details: [
                {
                    amount: grandTotal,
                    payment_type: paymentTypeDefaultValue[0],
                },
            ],
        })
        if(cashPayment){
            setErrors('');
        }
    }, [quantity, cashPayment]);



    const handleValidation = (dynamicWalletAmountUsed) => {
        let errors = {};
        let isValid = false;

        const totalAmounts = cashPaymentValue.payment_details?.reduce((sum, item) => {
                // Skip wallet payments from the total calculation
                if (item.payment_type?.value === walletpaymentMethod[0]?.attributes?.name || item.payment_type === walletpaymentMethod[0]?.attributes?.name) {
                    return sum;
                }
                const amount = Number(parseFloat(item.amount)?.toFixed(decimalPlaces));
                return !isNaN(amount) && amount > 0 ? sum + amount : sum;
            }, 0) || 0;

            
        if (
            cashPaymentValue["notes"] &&
            cashPaymentValue["notes"].length > 100
        ) {
            errors["notes"] =
                "The notes must not be greater than 100 characters";
        }
         

        if (
            cashPaymentValue?.payment_status?.value == 1 ||
            cashPaymentValue?.payment_status?.value == 3
        ) {
            const decimalPlaces = settings?.attributes?.decimal_places || 2;
            const paymentErrors = [];
            let totalAmount = 0;
            const isMultiplePayments = cashPaymentValue.payment_details?.filter(
                item => item.payment_type?.value !== walletpaymentMethod[0]?.attributes?.name && item.payment_type !== walletpaymentMethod[0]?.attributes?.name
            ).length > 1;
             
            if(isWalletBalance && dynamicWalletAmountUsed > walletBalance){
                const entryError = {};
                entryError.amount = "Not enough wallet balance";
                paymentErrors.push(entryError);

            }
            if (!cashPaymentValue.payment_details || cashPaymentValue.payment_details.length === 0) {
                errors["payment_details"] = "At least one payment method is required";
            } else {
                cashPaymentValue.payment_details.forEach((item, index) => {
                    // Skip wallet payment validation
                    if (item.payment_type?.value === walletpaymentMethod[0]?.attributes?.name || item.payment_type === walletpaymentMethod[0]?.attributes?.name) {
                        paymentErrors.push({});
                        return;
                    }
                                    
                    const entryError = {};
                    const decimalPlaces = settings?.attributes?.decimal_places || 2;
                    const amount = parseFloat(item.amount)?.toFixed(decimalPlaces);
                
                    // Allow zero amounts for non-wallet payment methods when wallet is enabled
                    // but only if there are other payment methods present
                    const nonWalletPaymentMethods = cashPaymentValue.payment_details?.filter(
                        p => p.payment_type?.value !== walletpaymentMethod[0]?.attributes?.name && p.payment_type !== walletpaymentMethod[0]?.attributes?.name
                    );
                    const isOnlyPaymentMethod = nonWalletPaymentMethods.length === 1;
                
                    if (isNaN(item.amount) || 
                        (!isWalletBalance && amount <= 0) || 
                        (isWalletBalance && isOnlyPaymentMethod && amount <= 0)) {
                        entryError.amount = getFormattedMessage('expense.input.amount.validate.label');
                    } 
                
                    if (!item.payment_type || !item.payment_type.value) {
                        entryError.payment_type = getFormattedMessage('globally.payment.type.validate.label');
                    } else {
                        totalAmount += parseFloat(amount);
                    }
                
                    paymentErrors.push(entryError);
                });

                errors["payment_details"] = paymentErrors;
            }
        }

        const hasErrors = Object.keys(errors).some(key => {
            if (key === "payment_details" && Array.isArray(errors[key])) {
                return errors[key].some(error => Object.keys(error).length > 0);
            }
            return errors[key];
        });

        isValid = !hasErrors;
        setErrors(errors);
        return isValid;
    };

    //filter on category id
    const setCategory = (item) => {
        setCategoryId(item);
    };

    const autoRefreshProducts = settings?.attributes?.auto_refresh_products === "true" || false;

    const refreshIntervalSeconds = settings?.attributes?.refresh_interval_seconds;

    const fetchProductInterval = () => {
        if (selectedOption) {
            dispatch({
                type:productActionType.RESET_PRODUCT
            })
            setPage(1);
            fetchBrandClickable(brandId, categoryId, selectedOption?.value);
        }
    };

    const onSearchProduct = (search) => {
        fetchBrandClickable(
            brandId,
            categoryId,
            selectedOption.value && selectedOption.value,
            1,
            search,
            true
        );
    };

    useEffect(() => {
        if (!selectedOption) return;

        // 🔥 Always call immediately when selectedOption or IDs change
        fetchProductInterval();

        fetchHoldLists({
            warehouse_id: selectedOption?.value || settings?.attributes?.default_warehouse,
            customer_id: selectedCustomerOption?.value || settings?.attributes?.default_customer,
        });

        if (!autoRefreshProducts || !refreshIntervalSeconds) return;

        // 🔄 Interval refresh
        const intervalId = setInterval(() => {
            fetchProductInterval();
        }, refreshIntervalSeconds * 1000);

        // 🧹 Cleanup
        return () => clearInterval(intervalId);

    }, [
        selectedOption,
        brandId,
        categoryId,
        autoRefreshProducts,
        refreshIntervalSeconds
    ]);

    //filter on brand id
    const setBrand = (item) => {
        setBrandId(item);
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setCashPaymentValue((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
    };

    const onPaymentStatusChange = (obj) => {
        setCashPaymentValue(inputs => ({
            ...inputs,
            payment_status: obj,
            payment_details: (obj.value === 1 || obj.value === 3) ? [getEmptyPaymentDetail()] : []
        }));
    };

    const onChangeReturnChange = (change) => {
        setChangeReturn(change);
    };

    const getEmptyPaymentDetail = () => ({
        amount: '',
        payment_type: ''
    });

const handlePaymentDetailChange = (index, name, value) => {
    const decimals = getDecimalPlaces(settings);

    // if (value.match(/\./g) && name === "amount") {
    //     const [, decimal] = value.split(".");
    //     if (decimal?.length > decimals) {
    //         value = value.slice(0, -1);
    //     }
    // }

    const updatedDetails = [...cashPaymentValue.payment_details];
    updatedDetails[index] = {
        ...updatedDetails[index],
        [name]: value
    };

    setCashPaymentValue(prev => ({
        ...prev,
        payment_details: updatedDetails
    }));

    setPaymentValue({
        ...paymentValue,
        payment_type: updatedDetails[index].payment_type
    });

    setErrors('');
};


    const handleAddPayment = () => {
        // Only add payment if we don't already have a wallet payment
        const hasWalletPayment = cashPaymentValue.payment_details?.some(
            item => item.payment_type?.value === walletpaymentMethod[0]?.attributes?.name || item.payment_type === walletpaymentMethod[0]?.attributes?.name
        );
        
        if (!hasWalletPayment) {
            setCashPaymentValue(prev => ({
                ...prev,
                payment_details: [...prev.payment_details, getEmptyPaymentDetail()]
            }));
        }
    };

    const handleRemovePayment = (index) => {
        const itemToRemove = cashPaymentValue.payment_details[index];
        if (itemToRemove?.payment_type?.label?.toLowerCase() == walletpaymentMethod[0]?.attributes?.name || itemToRemove?.payment_type?.label?.toLowerCase() == walletpaymentMethod[0]?.attributes?.name?.toLowerCase()) {
            setisWalletBalance(false);
            return;
        }
        
        const updatedDetails = cashPaymentValue.payment_details.filter((_, i) => i != index);
        setCashPaymentValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
    };

    // const paymentTypeFilterOptiosns = getFormattedOptions(paymentMethodOptions);

    const onPaymentTypeChange = (obj) => {
        setPaymentValue({ ...paymentValue, payment_type: obj });
    };
   
    useEffect(() => {
        let newDiscount = cartItemValue.discount;
        if (cartItemValue.discount_type == discountType.PERCENTAGE) {
            newDiscount = (Number(subTotal) * Number(cartItemValue.discount_value)) / 100;
        } else if (cartItemValue.discount_type == discountType.FIXED) {
            newDiscount = Math.min(cartItemValue.discount_value, Number(subTotal));
        }
        if (newDiscount !== cartItemValue.discount) {
            const updates = { discount: newDiscount };
            if (cartItemValue.discount_type == discountType.FIXED && newDiscount != cartItemValue.discount_value) {
                updates.discount_value = newDiscount;
            }
            setCartItemValue(prev => ({ ...prev, ...updates }));
        }
    }, [subTotal, cartItemValue.discount_type, cartItemValue.discount_value]);    

    useEffect(() => {
        const newCartData = {
            cartProduct: updateProducts,
            customer: selectedCustomerOption,
            cartItemValue: cartItemValue,
            subTotal: Number(subTotal),
            grandTotal: Number(grandTotal),
            paymentMethod: paymentValue?.payment_type !== false ? paymentValue?.payment_type : paymentTypeDefaultValue && paymentTypeDefaultValue[0],
        };
        dispatch(setCartProduct(newCartData));  
        localStorage.setItem('cart-sync', JSON.stringify(newCartData));
    }, [updateProducts, selectedCustomerOption, selectedOption, cartItemValue, subTotal, grandTotal, cashPaymentValue, paymentValue]);

    const onChangeCart = (event) => {
        if(updateProducts.length == 0){
            dispatch(addToast({text: getFormattedMessage("pos.cash-payment.product-error.message"), type: toastType.ERROR}))
            return;
        }
        const { value } = event.target;
        // check if value includes a decimal point
        const decimalPlaces = settings?.attributes?.decimal_places || 2;
        if (value.match(/\./g)) {
            const [, decimal] = value.split(".");
            // restrict value to only specified decimal places
            if (decimal?.length > decimalPlaces) {
                // do nothing
                return;
            }
        }

        let discount = cartItemValue.discount;
        if (event.target.name == 'discount_value') {
            if (cartItemValue.discount_type == discountType.FIXED) {
                if(value > subTotal) return;
                discount = value;
            } else {
                 if(value > 100) return;
                discount = (Number(subTotal) * Number(value)) / 100;
            }
        }
        if (event.target.name == 'discount_type') {
            if (value == discountType.FIXED) {
                discount = cartItemValue.discount_value > subTotal ? subTotal : cartItemValue.discount_value;
            } else {
                if( Number(cartItemValue.discount_value) > 100) setCartItemValue((prev)=> ({...prev, discount_value: 100}))
                discount = (Number(subTotal) * Number(cartItemValue.discount_value)) / 100;
            }
        }

        setCartItemValue((inputs) => ({
            ...inputs,
            discount: discount,
            [event.target.name]: value || 0,
        }));
    };

    const onChangeTaxCart = (event) => {
        if(updateProducts.length == 0){
            dispatch(addToast({text: getFormattedMessage("pos.cash-payment.product-error.message"), type: toastType.ERROR}))
            return;
        }
        const min = 0;
        const max = 100;
        const { value } = event.target;
        const values = Math.max(min, Math.min(max, Number(value)));
        // check if value includes a decimal point
          const decimalPlaces = settings?.attributes?.decimal_places || 2;
        if (value.match(/\./g)) {
            const [, decimal] = value.split(".");
           // restrict value to only specified decimal places
            if (decimal?.length > decimalPlaces) {
                // do nothing
                return;
            }
        }
        setCartItemValue((inputs) => ({
            ...inputs,
            [event.target.name]: values,
        }));
    };

    //payment slip model onchange
    const handleCashPayment = () => {
        setCashPaymentValue({
            notes: "",
            payment_status: {
                label: getFormattedMessage("dashboard.recentSales.paid.label"),
                value: 1,
            },
            payment_details: [{
                amount: '',
                payment_type: ''
            }]
        });
        // Reset wallet balance state when closing the payment modal
        if (cashPayment) {  // If closing the modal
            setisWalletBalance(false);
            setWalletBalanceUsed(0);
        }
        setCashPayment(!cashPayment);
    };

    const updateCost = (item) => {
        setNewCost(item);
    };

    //product details model onChange
    const openProductDetailModal = () => {
        setIsOpenCartItemUpdateModel(!isOpenCartItemUpdateModel);
    };

    //product details model updated value
    const onClickUpdateItemInCart = (item) => {
        setProduct(item);
        setIsOpenCartItemUpdateModel(true);
    };

    const onProductUpdateInCart = () => {
        const localCart = updateProducts.slice();
        updateCart(localCart);
    };

    //updated Qty function
    const updatedQty = (qty) => {
        setQuantity(qty);
    };

    const updateCart = (cartProducts) => {
        setUpdateProducts(cartProducts);
    };

    //cart item delete
    const onDeleteCartItem = (productId) => {
        const existingCart = updateProducts.filter((e) => e.id !== productId);
        if(existingCart.length == 0){
            setCartItemValue({
                discount_type: discountType.FIXED,
                discount_value: 0,
                discount: 0,
                tax: 0,
                shipping: 0,
            });
        }
        updateCart(existingCart);
        setisWalletBalance(false);
    };

    const onScrollCallAPI = (page) => {
        fetchBrandClickable(
            brandId,
            categoryId,
            selectedOption.value && selectedOption.value,
            page
        );
    };

    //product add to cart function
    const addToCarts = (items) => {
        updateCart(items);
    };

    // create customer model
    const customerModel = (val) => {
        setModalShowCustomer(val);
    };

    //prepare data for print Model
    const preparePrintData = () => {
        const formValue = {
            products: updateProducts,
            discount: cartItemValue.discount ? cartItemValue.discount : 0,
            tax: cartItemValue.tax ? cartItemValue.tax : 0,
            cartItemPrint: cartItemValue,
            taxTotal: taxTotal,
            grandTotal: grandTotal,
            shipping: cartItemValue.shipping,
            subTotal: subTotal,
            frontSetting: frontSetting,
            customer_name: selectedCustomerOption,
            settings: settings,
            note: cashPaymentValue.notes,
            changeReturn,
            payment_status: cashPaymentValue.payment_status,
        };
        return formValue;
    };

    const prepareData = (updateProducts) => {
        const saleItems = updateProducts.map(item => ({
            ...item,
            price_group: null,
        }));

        const formValue = {
            date: moment(new Date()).locale('en').format("YYYY-MM-DD"),
            customer_id:
                selectedCustomerOption && selectedCustomerOption[0]
                    ? selectedCustomerOption[0].value
                    : selectedCustomerOption && selectedCustomerOption.value,
            warehouse_id:
                selectedOption && selectedOption[0]
                    ? selectedOption[0].value
                    : selectedOption && selectedOption.value,
            sale_items: saleItems,
            grand_total: grandTotal,
            ...(cashPaymentValue?.payment_status?.value == 1
                ? { payment_type: paymentValue?.payment_type?.value || paymentTypeDefaultValue && paymentTypeDefaultValue[0].value }
                : {}),
            discount: cartItemValue.discount,
            discount_type: parseInt(cartItemValue.discount_type),
            discount_value: parseInt(cartItemValue.discount_value),
            shipping: cartItemValue.shipping,
            tax_rate: cartItemValue.tax,
            note: cashPaymentValue.notes,
            status: 1,
            hold_ref_no: hold_ref_no,
            payment_status: cashPaymentValue?.payment_status?.value,
            payment_details: (cashPaymentValue?.payment_status?.value == 1 || cashPaymentValue?.payment_status?.value == 3)
                ? cashPaymentValue.payment_details?.map(detail => ({
                    amount: parseFloat(detail.amount || 0).toString(),
                    payment_type:detail.payment_type
                })) || []
                : []
        };
        return formValue;
    };

    useEffect(() => {
      const handleKeyPress = (event) => {
        if (event.ctrlKey && event.key === ","){
            if(settings.attributes.enable_quick_payment == "true" && !quickSaleConfirm && !cashPayment && !holdShow && !recentSaleModal ){
                setIsShortcutsModel(true);
            }else{
                return;
            }
        }
        if (
          updateProducts.length === 0 ||
          settings.attributes.enable_quick_payment !== "true" ||
          quickSaleConfirm ||
          cashPayment
        ) {
          return;
        }
    
        const shortcutMap = {
          F1: settings.attributes.pos_shortcut_f1,
          F2: settings.attributes.pos_shortcut_f2,
          F3: settings.attributes.pos_shortcut_f3,
          F4: settings.attributes.pos_shortcut_f4,
          F5: settings.attributes.pos_shortcut_f5,
        };
    
        const shortcutAmount = Number(shortcutMap[event.key]);
    
        if (!shortcutAmount) return;
    
        setCashPaymentValue({
          notes: "",
          payment_status: {
            label: getFormattedMessage("dashboard.recentSales.paid.label"),
            value: 1,
          },
          payment_details: [
            {
              amount: shortcutAmount,
              payment_type: quick_payment_method,
            },
          ],
        });
    
        setQuickPayAmount(shortcutAmount);
        setChangeReturn(Math.max(0, shortcutAmount - grandTotal));
        setquickSaleConfirm(true);
      };
    
      window.addEventListener("keydown", handleKeyPress);
    
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }, [updateProducts, grandTotal, paymentTypeDefaultValue]);

    //cash payment method
    const onCashPayment = (event,printSlip=false,dynamicWalletAmountUsed) => {
        event.preventDefault();
        const valid = handleValidation(dynamicWalletAmountUsed);
        if (valid) {
            setPaymentPrint(preparePrintData);

            posCashPaymentAction(
                prepareData(updateProducts),
                setUpdateProducts,
                setModalShowPaymentSlip,
                posAllProduct,
                {
                    brandId,
                    categoryId,
                    selectedOption,
                },printSlip
            );
            // setModalShowPaymentSlip(true);
            setCashPayment(false);
            setHoldListValue((prevValue) => ({ ...prevValue, referenceNumber: "" }))
            setHold_ref_no("");
            setCartItemValue({
                discount_type: discountType.FIXED,
                discount_value: 0,
                discount: 0,
                tax: 0,
                shipping: 0,
            });
            setCashPaymentValue({
                notes: "",
                payment_status: {
                    label: getFormattedMessage(
                        "dashboard.recentSales.paid.label"
                    ),
                    value: 1,
                },
                payment_details: [{
                    amount: '',
                    payment_type: ''
                }]
            });
            dispatch(fetchTax());
            setCartProductIds("");
        }
    };

    const printPaymentReceiptPdf = () => {
        document.getElementById("printReceipt").click();
    };

    const printRegisterDetails = () => {
        document.getElementById("printRegisterDetailsId").click();
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleRegisterDetailsPrint = useReactToPrint({
        content: () => registerDetailsRef.current,
    });

    //payment print
    const loadPrintBlock = () => {
        return (
            <div className="d-none">
                <button id="printReceipt" onClick={handlePrint}>
                    Print this out!
                </button>
                <PrintData
                    ref={componentRef}
                    paymentType={paymentValue?.payment_type?.label || paymentTypeDefaultValue && paymentTypeDefaultValue[0]?.label}
                    allConfigData={allConfigData}
                    updateProducts={paymentPrint}
                    taxes={taxes}
                    settings={settings}
                />
            </div>
        );
    };

    //Register details  slip
    const loadRegisterDetailsPrint = () => {
        return (
            <div className="d-none">
                <button
                    id="printRegisterDetailsId"
                    onClick={handleRegisterDetailsPrint}
                >
                    Print this out!
                </button>
                <PrintRegisterDetailsData
                    ref={registerDetailsRef}
                    allConfigData={allConfigData}
                    frontSetting={frontSetting}
                    posAllTodaySaleOverAllReport={posAllTodaySaleOverAllReport}
                    updateProducts={paymentPrint}
                    closeRegisterDetails={closeRegisterDetails}
                />
            </div>
        );
    };

    //payment slip
    const loadPaymentSlip = () => {
        return (
            <div className="d-none">
                <PaymentSlipModal
                    printPaymentReceiptPdf={printPaymentReceiptPdf}
                    setPaymentValue={setPaymentValue}
                    setModalShowPaymentSlip={setModalShowPaymentSlip}
                    settings={settings}
                    frontSetting={frontSetting}
                    modalShowPaymentSlip={modalShowPaymentSlip}
                    allConfigData={allConfigData}
                    paymentDetails={paymentDetails}
                    updateProducts={paymentPrint}
                    paymentType={paymentValue.payment_type.label || paymentTypeDefaultValue && paymentTypeDefaultValue[0].label}
                    paymentTypeDefaultValue={paymentTypeDefaultValue}
                    taxes={taxes}
                    paymentStatus={paymentPrint?.payment_status?.value || cashPaymentValue.payment_status.value}
                    isWalletBalance={isWalletBalance}
                    walletBalance={walletBalanceUsed}
                    setisWalletBalance={setisWalletBalance}
                    walletBalanceUsed={walletBalanceUsed}
                />
            </div>
        );
    };
    const [isDetails, setIsDetails] = useState(null);
    const [lgShow, setLgShow] = useState(false);
    const [holdShow, setHoldShow] = useState(false);
    const [recentSaleModal, setRecentSaleModal] = useState(false);

    const onClickDetailsModel = (isDetails = null) => {
        setLgShow(true);
    };

    const onClickHoldModel = (isDetails = null) => {
        setHoldShow(true);
    };

    const filters = {
        order_By: "created_at",
        direction: "desc",
        page: salePage,
        pageSize: 10,
    }

    const onClickRecentSalesModal = () => {
        dispatch(fetchSales(filters));
        setRecentSaleModal(true);
    };

    const handleLoadMore = () => {
        setSalePage(salePage + 1);
        dispatch(fetchSales({ ...filters, page: salePage + 1 }, true, true));
    };

    const handleClickCloseRegister = () => {
        dispatch(getAllRegisterDetailsAction());
        setShowCloseDetailsModal(true);
    };

    const handleCloseRegisterDetails = (data) => {
        if (data.cash_in_hand_while_closing.toString().trim()?.length === 0) {
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "pos.cclose-register.enter-total-cash.message"
                    ),
                    type: toastType.ERROR,
                })
            );
        } else {
            setShowCloseDetailsModal(false);
            dispatch(closeRegisterAction(data, navigate));
        }
    };

    return (
        <Container className="pos-screen px-3" fluid>
            <TabTitle title="POS" />
            {loadPrintBlock()}
            {loadPaymentSlip()}
            {loadRegisterDetailsPrint()}
            <Row>
                <TopProgressBar />
                <Col lg={5} xxl={4} xs={6} className="pos-left-scs">
                    <div className="d-flex flex-column h-100">
                        <PosHeader
                            setSelectedCustomerOption={setSelectedCustomerOption}
                            selectedCustomerOption={selectedCustomerOption}
                            setSelectedOption={setSelectedOption}
                            selectedOption={selectedOption}
                            customerModel={customerModel}
                            updateCustomer={modalShowCustomer}
                        />
                        <div className="left-content custom-card mb-3 p-3 d-flex flex-column justify-content-between">
                            <div className="main-table overflow-auto">
                                <Table className="mb-0">
                                    <thead className="position-sticky top-0">
                                        <tr>
                                            <th>
                                                {getFormattedMessage(
                                                    "pos-product.title"
                                                )}
                                            </th>
                                            <th
                                                className={
                                                    updateProducts &&
                                                        updateProducts.length
                                                        ? "text-center"
                                                        : ""
                                                }
                                            >
                                                {getFormattedMessage(
                                                    "pos-qty.title"
                                                )}
                                            </th>
                                            <th>
                                                {getFormattedMessage(
                                                    "pos-price.title"
                                                )}
                                            </th>
                                            <th colSpan="2">
                                                {getFormattedMessage(
                                                    "pos-sub-total.title"
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-0">
                                        {updateProducts && updateProducts.length ? (
                                            updateProducts.map(
                                                (updateProduct, index) => {
                                                    return (
                                                        <ProductCartList
                                                            singleProduct={
                                                                updateProduct
                                                            }
                                                            key={index + 1}
                                                            index={index}
                                                            posAllProducts={
                                                                posAllProducts
                                                            }
                                                            onClickUpdateItemInCart={
                                                                onClickUpdateItemInCart
                                                            }
                                                            updatedQty={updatedQty}
                                                            updateCost={updateCost}
                                                            onDeleteCartItem={
                                                                onDeleteCartItem
                                                            }
                                                            quantity={quantity}
                                                            frontSetting={
                                                                frontSetting
                                                            }
                                                            newCost={newCost}
                                                            allConfigData={
                                                                allConfigData
                                                            }
                                                            setUpdateProducts={
                                                                setUpdateProducts
                                                            }
                                                            settings={settings}
                                                        />
                                                    );
                                                }
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="custom-text-center text-gray-900 fw-bold py-5"
                                                >
                                                    {getFormattedMessage(
                                                        "sale.product.table.no-data.label"
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            <div>
                                <CartItemMainCalculation
                                    totalQty={totalQty}
                                    subTotal={subTotal}
                                    grandTotal={grandTotal}
                                    cartItemValue={cartItemValue}
                                    onChangeCart={onChangeCart}
                                    allConfigData={allConfigData}
                                    frontSetting={frontSetting}
                                    onChangeTaxCart={onChangeTaxCart}
                                />
                                <PaymentButton
                                    updateProducts={updateProducts}
                                    updateCart={addToCarts}
                                    setUpdateProducts={setUpdateProducts}
                                    setCartItemValue={setCartItemValue}
                                    setCashPayment={setCashPayment}
                                    cartItemValue={cartItemValue}
                                    grandTotal={grandTotal}
                                    subTotal={subTotal}
                                    selectedOption={selectedOption}
                                    cashPaymentValue={cashPaymentValue}
                                    holdListId={holdListId}
                                    setHoldListValue={setHoldListValue}
                                    selectedCustomerOption={selectedCustomerOption}
                                    setUpdateHoldList={setUpdateHoldList}
                                    hold_ref_no={hold_ref_no}
                                    holdListData={holdListData}
                                />
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={7} xxl={8} xs={6} className="ps-lg-0 pos-right-scs">
                    <div className="right-content mb-3 d-flex flex-column h-100">
                        <div className="d-sm-flex align-items-center flex-xxl-nowrap flex-wrap">
                            <ProductSearchbar
                                customCart={customCart}
                                setUpdateProducts={setUpdateProducts}
                                updateProducts={updateProducts}
                                selectedOption={selectedOption}
                                settings={settings}
                                onSearchProduct={onSearchProduct}
                            />
                            <HeaderAllButton
                                holdListData={holdListData}
                                goToHoldScreen={onClickHoldModel}
                                goToDetailScreen={onClickDetailsModel}
                                onClickFullScreen={onClickFullScreen}
                                opneCalculator={openCalculator}
                                setOpneCalculator={setOpenCalculator}
                                handleClickCloseRegister={
                                    handleClickCloseRegister
                                }
                                goToRecentSales={onClickRecentSalesModal}
                            />
                        </div>
                        <div className="custom-card h-100 mb-3">
                            <div className="p-3">
                                <Category
                                    setCategory={setCategory}
                                    brandId={brandId}
                                    selectedOption={selectedOption}
                                />
                                <Brands
                                    categoryId={categoryId}
                                    setBrand={setBrand}
                                    selectedOption={selectedOption}
                                />
                            </div>
                            <Product
                                cartProducts={updateProducts}
                                updateCart={addToCarts}
                                customCart={customCart}
                                setCartProductIds={setCartProductIds}
                                cartProductIds={cartProductIds}
                                settings={settings}
                                productMsg={productMsg}
                                selectedOption={selectedOption}
                                brandId={brandId}
                                categoryId={categoryId}
                                onScrollCallAPI={onScrollCallAPI}
                                page={page}
                                setPage={setPage}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
            {isOpenCartItemUpdateModel && (
                <ProductDetailsModel
                    openProductDetailModal={openProductDetailModal}
                    productModelId={product.id}
                    onProductUpdateInCart={onProductUpdateInCart}
                    updateCost={updateCost}
                    cartProduct={product}
                    isOpenCartItemUpdateModel={isOpenCartItemUpdateModel}
                    frontSetting={frontSetting}
                    settings={settings}
                />
            )}

        {quickSaleConfirm &&
           <QuickPaymentModal
           grandTotal={grandTotal}
           quickPayAmount={quickPayAmount}
           quickSaleConfirm={quickSaleConfirm}
           setquickSaleConfirm={setquickSaleConfirm}
           onCashPayment={onCashPayment}
           allConfigData={allConfigData}
           frontSetting={frontSetting}
           />
            }

        {IsShortcutsModel &&
          <ShortcutsInfoModel
            settings={settings}
            IsShortcutsModel={IsShortcutsModel}
            setIsShortcutsModel={setIsShortcutsModel}
          />
        }

            {cashPayment && (
                <CashPaymentModel
                    cashPayment={cashPayment}
                    isWalletBalance={isWalletBalance}
                    setisWalletBalance={setisWalletBalance}
                    walletBalance={walletBalance}
                    walletBalanceUsed={walletBalanceUsed}
                    totalQty={totalQty}
                    cartItemValue={cartItemValue}
                    onChangeInput={onChangeInput}
                    onPaymentStatusChange={onPaymentStatusChange}
                    cashPaymentValue={cashPaymentValue}
                    allConfigData={allConfigData}
                    subTotal={subTotal}
                    onPaymentTypeChange={onPaymentTypeChange}
                    grandTotal={grandTotal}
                    onCashPayment={onCashPayment}
                    taxTotal={taxTotal}
                    handleCashPayment={handleCashPayment}
                    settings={settings}
                    errors={errors}
                    paymentTypeDefaultValue={paymentTypeDefaultValue}
                    paymentTypeFilterOptions={paymentTypeFilterOptions}
                    onChangeReturnChange={onChangeReturnChange}
                    setPaymentValue={setPaymentValue}
                    handlePaymentDetailChange={handlePaymentDetailChange}
                    handleAddPayment={handleAddPayment}
                    handleRemovePayment={handleRemovePayment}
                    selectedCustomer={selectedCustomer}
                    walletpaymentMethod={walletpaymentMethod}
                    setWalletBalanceUsed={setWalletBalanceUsed}
                />
            )}
            {lgShow && (
                <RegisterDetailsModel
                    printRegisterDetails={printRegisterDetails}
                    frontSetting={frontSetting}
                    lgShow={lgShow}
                    setLgShow={setLgShow}
                />
            )}
            {holdShow && (
                <HoldListModal
                    setUpdateHoldList={setUpdateHoldList}
                    setCartItemValue={setCartItemValue}
                    setUpdateProducts={setUpdateProducts}
                    updateProduct={updateProducts}
                    printRegisterDetails={printRegisterDetails}
                    frontSetting={frontSetting}
                    holdListData={holdListData}
                    setHold_ref_no={setHold_ref_no}
                    holdShow={holdShow}
                    setHoldShow={setHoldShow}
                    addCart={addToCarts}
                    updateCart={updateCart}
                    setSelectedCustomerOption={setSelectedCustomerOption}
                    setSelectedOption={setSelectedOption}
                    editholdListData={editholdListData}
                    fetchHoldList={fetchHoldList}
                    deleteHoldItem={deleteHoldItem}
                />
            )}
            {recentSaleModal && (
                <RecentSaleModal
                    recentSaleModal={recentSaleModal}
                    setRecentSaleModal={setRecentSaleModal}
                    sales={sales}
                    handleLoadMore={handleLoadMore}
                    setSalePage={setSalePage}
                />
            )}
            {modalShowCustomer && (
                <CustomerForm
                    show={modalShowCustomer}
                    hide={setModalShowCustomer}
                />
            )}
            <PosCloseRegisterDetailsModel
                showCloseDetailsModal={showCloseDetailsModal}
                handleCloseRegisterDetails={handleCloseRegisterDetails}
                setShowCloseDetailsModal={setShowCloseDetailsModal}
            />
            {allConfigData?.permissions?.length === 1 && <PosRegisterModel showPosRegisterModel={showPosRegisterModel} isCloseButton={false} onClickshowPosRegisterModel={() => setShowPosRegisterModel(false)} />}
        </Container>
    );
};

const mapStateToProps = (state) => {
    const {
        posAllProducts,
        frontSetting,
        settings,
        cashPayment,
        allConfigData,
        posAllTodaySaleOverAllReport,
        holdListData,
        taxes,
        paymentMethods,
        sales,
        editholdListData,
    } = state;
    return {
        holdListData,
        posAllProducts,
        frontSetting,
        settings,
        paymentDetails: cashPayment,
        customCart: prepareCartArray(posAllProducts),
        allConfigData,
        posAllTodaySaleOverAllReport,
        taxes,
        paymentMethods,
        sales,
        editholdListData,
        singleCustomer: state.customers.singleCustomer || state.customers,
    };
};

export default connect(mapStateToProps, {
    fetchSetting,
    posSearchNameProduct,
    posCashPaymentAction,
    posSearchCodeProduct,
    posAllProduct,
    fetchBrandClickable,
    fetchHoldLists,
    fetchHoldList,
    deleteHoldItem,
    fetchPaymentMethods,
})(PosMainPage);
