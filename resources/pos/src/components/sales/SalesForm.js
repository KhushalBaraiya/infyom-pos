import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, InputGroup } from 'react-bootstrap-v5';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { fetchProductsByWarehouse } from '../../store/action/productAction';
import { editSale } from '../../store/action/salesAction';
import ProductSearch from '../../shared/components/product-cart/search/ProductSearch';
import ProductRowTable from '../../shared/components/sales/ProductRowTable';
import { placeholderText, getFormattedMessage, decimalValidate, onFocusInput, getDecimalPlaces, getFormattedOptions, calculateMainAmounts, currencySymbolHandling } from '../../shared/sharedMethod';
import ReactDatePicker from '../../shared/datepicker/ReactDatePicker';
import ProductMainCalculation from './ProductMainCalculation';
import { calculateCartTotalAmount, calculateCartTotalTaxAmount } from '../../shared/calculation/calculation';
import { prepareSaleProductArray } from '../../shared/prepareArray/prepareSaleArray';
import ModelFooter from '../../shared/components/modelFooter';
import { addToast } from '../../store/action/toastAction';
import { discountType, paymentMethodOptions, salePaymentStatusOptions, saleStatusOptions, statusOptions, toastType, apiBaseURL } from '../../constants';
import { fetchPaymentMethods } from '../../store/action/paymentMethodAction';
import ReactSelect from '../../shared/select/reactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import TabTitle from '../../shared/tab-title/TabTitle';
import axiosApi from '../../config/apiConfig';
import useFiscalYearValidation from '../../utils/useFiscalYearValidation';

const SalesForm = ( props ) => {
    const {
        addSaleData,
        editSale,
        id,
        customers,
        warehouses,
        singleSale,
        paymentMethods,
        customProducts,
        products,
        fetchProductsByWarehouse,
        frontSetting,
        isQuotation, allConfigData, 
        settings,
        isWalletUsed,
        isLoading,
    } = props;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ updateProducts, setUpdateProducts ] = useState( [] );
    const [ quantity, setQuantity ] = useState( 0 );
    const [ newCost, setNewCost ] = useState( '' );
    const [ newDiscount, setNewDiscount ] = useState( '' );
    const [ newTax, setNewTax ] = useState( '' );
    const [ subTotal, setSubTotal ] = useState( '' );
    const [ newSaleUnit, setNewSaleUnit ] = useState( '' );
    const [hasInitialized, setHasInitialized] = useState(false);
    const [isWalletBalance, setIsWalletBalance] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [WalletMethods, setWalletMethods] = useState([]);
    const [walletAmountBefore, setWalletAmountBefore] = useState(0);
    const [messageWalletAmount, setMessageWalletAmount] = useState(0);
    const [walletAmountAfter, setWalletAmountAfter] = useState(0);
    const [customerChangeMessage, setCustomerChangeMessage] = useState(false);
    
    const decimalPlaces = getDecimalPlaces(settings);
    const isFiscalYearEnabled = parseInt(settings.attributes?.enable_fiscal_year_filter) === 1;
    const { validateDate: validateFiscalDate } = useFiscalYearValidation();

    const [ saleValue, setSaleValue ] = useState( {
        date: new Date(),
        customer_id: '',
        warehouse_id: '',
        tax_rate: parseFloat(0).toFixed(decimalPlaces),
        tax_amount: parseFloat(0).toFixed(decimalPlaces),
        discount: parseFloat(0).toFixed(decimalPlaces),
        shipping: parseFloat(0).toFixed(decimalPlaces),
        grand_total: parseFloat(0).toFixed(decimalPlaces),
        notes: singleSale ? singleSale.notes : '',
        received_amount: 0,
        paid_amount: 0,
        status_id: { label: getFormattedMessage( "status.filter.complated.label" ), value: 1 },
        payment_status: { label: getFormattedMessage( "payment-status.filter.unpaid.label" ), value: 2 },
        payment_type: '',
        discount_type: 2,
        discount_value: parseFloat(0).toFixed(decimalPlaces),
        payment_details: []
    } );
    const [ errors, setErrors ] = useState( {
        date: '',
        customer_id: '',
        warehouse_id: '',
        status_id: '',
        payment_status: '',
        payment_type: '',
        payment_details: []
    } );

    useEffect( () => {
        setUpdateProducts( updateProducts )
    }, [ updateProducts, quantity, newCost, newDiscount, newTax, subTotal, newSaleUnit ] )

    useEffect( () => {
        updateProducts.length >= 1 ? dispatch( { type: 'DISABLE_OPTION', payload: true } ) : dispatch( { type: 'DISABLE_OPTION', payload: false } )
    }, [ updateProducts ] )
    
    useEffect(() => {
        dispatch(fetchPaymentMethods());
    }, [dispatch]);

    useEffect(()=>{
        if (isWalletUsed) {
            setIsWalletBalance(true);
        }
    }, [isWalletUsed])

    const walletpaymentMethod =  paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1 && item.attributes.type == 1));

    useEffect(() => {
        if (singleSale && !hasInitialized) {
            if (!isQuotation) {
                const mappedPaymentDetails = singleSale.payment_details?.map(item => ({
                    id: item.id,
                    date: item.payment_date ? moment(item.payment_date).toDate() : new Date(),
                    reference: item.reference || '',
                    amount: typeof item.amount === 'number' ? item.amount.toString() : (item.amount || ''),
                    payment_type: item.payment_method 
                        ? {label: item.payment_method.name, value: item.payment_method.id, type: item.payment_method.type}
                        : item.payment_type || ''
                })) || [];
                
                setSaleValue({
                    date: moment(singleSale.date).toDate(),
                    customer_id: singleSale.customer_id,
                    quotation_id: singleSale.quotation_id,
                    warehouse_id: singleSale.warehouse_id,
                    tax_rate: parseFloat(singleSale?.tax_rate)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    tax_amount: parseFloat(singleSale?.tax_amount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    discount: parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    shipping: parseFloat(singleSale?.shipping)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    grand_total: singleSale.grand_total,
                    status_id: singleSale.status_id,
                    payment_status: singleSale.is_Partial == 3
                        ? { label: getFormattedMessage('payment-status.filter.partial.label'), value: 3 }
                        : singleSale.payment_status,
                    payment_type: singleSale?.payment_type?.label ? singleSale?.payment_type : '',
                    discount_type: singleSale.discount_type,
                     discount_value: singleSale.discount_type == discountType.FIXED ? parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces) : parseFloat(singleSale?.discount_value)?.toFixed(decimalPlaces) ||parseFloat(0).toFixed(decimalPlaces),
                    notes: singleSale.notes,
                    payment_details: mappedPaymentDetails,
                });
                
                if (singleSale.customer_id && customers) {
                    const customerId = typeof singleSale.customer_id === 'object' ? singleSale.customer_id.value : singleSale.customer_id;
                    const selectedCustomer = customers.find(customer => customer.value === customerId);
                    if (selectedCustomer && selectedCustomer.attributes) {
                        setWalletBalance(selectedCustomer.attributes.wallet_amount || 0);
                        
                
                        const hasWalletPayment = singleSale.payment_details?.some(detail => 
                            detail.payment_type?.value === walletpaymentMethod?.attributes?.name || 
                            detail.payment_type === walletpaymentMethod?.attributes?.name ||
                            detail.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name || 
                            detail.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name?.toLowerCase() || 
                            detail.payment_type?.type === 1 ||
                            (detail.payment_type?.value && 
                             paymentMethods.some(pm => 
                                 pm.id === detail.payment_type.value && 
                                 pm.attributes?.type === 1 
                             )
                            )
                        ) || false;
                        
                        if (hasWalletPayment) {
                            setIsWalletBalance(true);
                        }
                    }
                }
            } else {
                setSaleValue({
                    date: moment(singleSale.date).toDate(),
                    quotation_id: singleSale.quotation_id,
                    customer_id: singleSale.customer_id,
                    warehouse_id: singleSale.warehouse_id,
                    tax_rate: parseFloat(singleSale?.tax_rate)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    tax_amount: parseFloat(singleSale?.tax_amount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    discount: parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    shipping: parseFloat(singleSale?.shipping)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    grand_total: singleSale.grand_total,
                    status_id: singleSale.status_id,
                    payment_status: saleValue.payment_status || '',
                    payment_type: '',
                    discount_type: singleSale.discount_type,
                    discount_value: parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    notes: singleSale.notes,
                });
                
                if (singleSale.customer_id && customers) {
                    const customerId = typeof singleSale.customer_id === 'object' ? singleSale.customer_id.value : singleSale.customer_id;
                    const selectedCustomer = customers.find(customer => customer.value === customerId);
                    if (selectedCustomer && selectedCustomer.attributes) {
                        setWalletBalance(selectedCustomer.attributes.wallet_amount || 0);
                    }
                }
            }
            setUpdateProducts( singleSale.sale_items );
            setHasInitialized(true);
            
            setWalletMethods(singleSale?.payment_details?.filter(detail => detail.payment_type?.type == 1).map((el)=> setWalletAmountBefore((prev) => prev + el.amount)));
            setWalletMethods(singleSale?.payment_details?.filter(detail => detail.payment_type?.type == 1).map((el)=> setMessageWalletAmount((prev) => prev + el.amount)));
        }
    }, [singleSale, isQuotation,  hasInitialized, customers, paymentMethods]);

    useEffect(()=>{
       setWalletAmountAfter(saleValue?.payment_details?.map((payment) => (payment.payment_type?.type === 1) ? payment.amount : 0).reduce((sum, amount) => sum + parseFloat(amount || 0), 0))
    }, [saleValue.payment_details])
    

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            if (saleValue.customer_id && saleValue?.customer_id?.value) {
                try {
                    const response = await axiosApi.get(`${apiBaseURL.CUSTOMERS}/${saleValue.customer_id.value}`);
                    const customer = response.data.data;
                    setWalletBalance(customer?.attributes?.wallet_amount || 0); 
                    
                   
                    if (isWalletBalance) {
                        setSaleValue(prev => ({
                            ...prev,
                            payment_details: saleValue.payment_details
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching customer details:', error);
                    setWalletBalance(0);
                }
            } else {
                setWalletBalance(0);
            }
        };
        
        fetchCustomerDetails();
    }, [saleValue.customer_id]);

    useEffect( () => {
        saleValue.warehouse_id.value && fetchProductsByWarehouse( saleValue?.warehouse_id?.value )
    }, [ saleValue.warehouse_id.value ] )

    const validatePaymentDetails = () => {
        const paymentErrors = [];
        let totalAmount = 0;

        saleValue.payment_details.forEach((item, index) => {
            const entryError = {};
            
            // Skip validation for wallet payments
            if (item.payment_type?.value === walletpaymentMethod?.attributes?.name || item.payment_type === walletpaymentMethod?.attributes?.name || 
                item.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name || 
                item.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name?.toLowerCase() || 
                item.payment_type?.type === 1) {
                paymentErrors.push({});
                return;
            }

            const amount = parseFloat(item.amount) || 0;
            if (amount > 0) {
                if (!item.payment_type || !item.payment_type.value) {
                    entryError.payment_type = getFormattedMessage('globally.payment.type.validate.label');
                } else {
                    totalAmount += amount;
                }
            }

            paymentErrors.push(entryError);
        });

        return {paymentErrors, totalAmount};
    };

    const handleValidation = () => {
        let error = {};
        let isValid = false;
        const qtyCart = updateProducts.filter( ( a ) => a.quantity === 0 );
        if ( !saleValue.date ) {
            error[ 'date' ] = getFormattedMessage( 'globally.date.validate.label' );
        } else if (validateFiscalDate(saleValue.date)) {
            error[ 'date' ] = validateFiscalDate(saleValue.date);
        } else if ( !saleValue.warehouse_id ) {
            error[ 'warehouse_id' ] = getFormattedMessage( 'product.input.warehouse.validate.label' );
        } else if ( !saleValue.customer_id ) {
            error[ 'customer_id' ] = getFormattedMessage( 'sale.select.customer.validate.label' );
        } else if ( qtyCart.length > 0 ) {
            dispatch( addToast( { text: getFormattedMessage( 'globally.product-quantity.validate.message' ), type: toastType.ERROR } ) )
        } else if ( updateProducts.length < 1 ) {
            dispatch( addToast( { text: getFormattedMessage( 'purchase.product-list.validate.message' ), type: toastType.ERROR } ) )
        } else if ( !saleValue.status_id ) {
            error[ 'status_id' ] = getFormattedMessage( "globally.status.validate.label" )
        } else if ( !saleValue.payment_status ) {
            error[ 'payment_status' ] = getFormattedMessage( "globally.payment.status.validate.label" )
        } else if (saleValue.payment_status.value !== 2) {
            const {paymentErrors, totalAmount} = validatePaymentDetails();
            const hasErrors = paymentErrors.some((entry) => Object.keys(entry).length > 0);
            

            const walletAmountUsed = saleValue.payment_details?.reduce((sum, payment) => {
                if (payment.payment_type?.value === walletpaymentMethod?.attributes?.name || payment.payment_type === walletpaymentMethod?.attributes?.name || 
                    payment.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name|| 
                    payment.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name?.toLowerCase() || 
                    payment.payment_type?.type === 1) {
                    return sum + (parseFloat(payment.amount) || 0);
                }
                return sum;
            }, 0) || 0;
            

            const totalAmountExcludingWallet = saleValue.payment_details?.reduce((sum, payment) => {
                if (payment.payment_type?.value === walletpaymentMethod?.attributes?.name || payment.payment_type === walletpaymentMethod?.attributes?.name|| 
                    payment.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name || 
                    payment.payment_type?.label?.toLowerCase() === walletpaymentMethod?.attributes?.name?.toLowerCase() || 
                    payment.payment_type?.type === 1) {
                    return sum;
                }
                const amount = parseFloat(payment.amount) || 0;
                return sum + Math.max(0, amount);
            }, 0) || 0;

            if (hasErrors) {
                error['payment_details'] = paymentErrors;
            } else {

                const grandTotal = parseFloat(calculateCartTotalAmount(updateProducts, saleValue));
                
                if (isWalletBalance) {

                    if ( walletAmountBefore > 0  && (walletAmountUsed - walletAmountBefore) > walletBalance) {
                        dispatch(
                            addToast({
                                text: getFormattedMessage("wallet.payment.amount.exceeds.balance.message"),
                                type: toastType.ERROR
                            })
                        );
                    } else {
                        if ((walletAmountUsed - grandTotal) > 0.99) {
                            dispatch(
                                addToast({
                                    text: getFormattedMessage("sale.payment.amount.not.equal.total.message"),
                                    type: toastType.ERROR
                                })
                            );
                        } else {
                            isValid = true;
                        }
                    }
                } else {
                    // Total payment amount (excluding wallet) + wallet amount used should not exceed grand total
                    if ( walletAmountUsed > grandTotal) {
                        dispatch(
                            addToast({
                                text: getFormattedMessage("sale.payment.total-exceed.validate.message"),
                                type: toastType.ERROR
                            })
                        );
                    } else {
                        isValid = true;
                    }
                }
            }
        } else {
            isValid = true;
        }
        setErrors( error );
        return isValid;
    };

    const onWarehouseChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, warehouse_id: obj } ) );
        setErrors( '' );
    };

    const onCustomerChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, customer_id: obj } ) );
        setErrors( '' );
        if(singleSale && singleSale.customer_id.value !== obj.value){
            setIsWalletBalance(false)
            const grandTotal = parseFloat(calculateCartTotalAmount(updateProducts, saleValue));
            (walletAmountBefore > 0) ? setCustomerChangeMessage(true) : setCustomerChangeMessage(false);
            setWalletAmountBefore(0)
            if(walletBalance > 0) setIsWalletBalance(true)
            setSaleValue(prev => ({
                ...prev,
                payment_details: [
                    {
                        amount: grandTotal.toString(),
                        date: new Date(),
                        reference: '',
                        payment_type: { value: walletPaymentMethod?.id, label: walletPaymentMethod?.attributes?.name, type: walletPaymentMethod?.attributes?.type }
                    }
                ]
            }))

        }else if(singleSale && singleSale.customer_id.value === obj.value){
            setCustomerChangeMessage(false);
            setIsWalletBalance(true)
            setWalletMethods(singleSale?.payment_details?.filter(detail => detail.payment_type?.type == 1).map((el)=> setWalletAmountBefore((prev) => prev + el.amount)));
            setSaleValue(prev => ({
                ...prev,
                payment_details: singleSale.payment_details
            }));
        }
    };

    const onChangeInput = ( e ) => {
        const { name, value } = e.target;

        if (value === '') {
            setSaleValue(inputs => ({ ...inputs, [name]: value }));
            return;
        }

        // Allow only digits with ONE decimal
        if (!/^\d*\.?\d*$/.test(value)) return;

        // Enforce decimal places
        const parts = value.split('.');
        if (parts[1]?.length > decimalPlaces) return;

        // Order tax must not exceed 100
        if (name === 'tax_rate' && parseFloat(value) > 100) return;

        // Discount % must not exceed 100
        if (
            name === 'discount_value' &&
            saleValue.discount_type == 1 &&
            parseFloat(value) > 100
        ) {
            return;
        }

        setSaleValue(inputs => ({
            ...inputs,
            [name]: value,
        }));
    };

    useEffect(() => {
        const { discountAmount } = calculateMainAmounts(updateProducts, saleValue);
        setSaleValue({...saleValue, discount: discountAmount});
    }, [saleValue.discount_type, saleValue.discount_value])
    
     const walletPaymentMethod = paymentMethods?.find(p => p?.attributes?.type === 1);

    useEffect(() => {
        if (isWalletBalance && saleValue.payment_status && (saleValue.payment_status.value === 1 || saleValue.payment_status.value === 3)) {

            
            const grandTotal = parseFloat(calculateCartTotalAmount(updateProducts, saleValue));
            
            if (walletBalance >= grandTotal) {
                setSaleValue(prev => ({
                    ...prev,
                    payment_details: [
                        {
                            amount: grandTotal.toString(),
                            date: new Date(),
                            reference: '',
                            payment_type: { value: walletPaymentMethod?.id, label:walletPaymentMethod?.attributes?.name , type: walletPaymentMethod?.attributes?.type }
                        }
                    ]
                }));
            } else {
                const remainingAmount = grandTotal - walletBalance;
                const nonWalletPaymentMethod = paymentMethods?.find(p => p?.attributes?.type !== 1);
                setSaleValue(prev => ({
                    ...prev,
                    payment_details: [
                        {
                            amount: remainingAmount.toString(),
                            date: new Date(),
                            reference: '',
                            payment_type: nonWalletPaymentMethod ? { value: nonWalletPaymentMethod.id, label: nonWalletPaymentMethod.attributes.name } : prev.payment_details[0]?.payment_type
                        },
                        {
                            amount: walletBalance.toString(),
                            date: new Date(),
                            reference: '',
                            payment_type: { value: walletPaymentMethod?.id, label:walletPaymentMethod?.attributes?.name, type: walletPaymentMethod?.attributes?.type }
                        }
                    ]
                }));
            }
        } else if (!isWalletBalance && saleValue.payment_status && (saleValue.payment_status.value === 1 || saleValue.payment_status.value === 3)) {
            const defaultPaymentMethod = paymentMethods.length > 0 ? { value: paymentMethods[0]?.id, label: paymentMethods[0]?.attributes?.name } : '';
            const grandTotal = parseFloat(calculateCartTotalAmount(updateProducts, saleValue));
            
            setSaleValue(prev => ({
                ...prev,
                payment_details: [
                    {
                        amount: grandTotal.toString(),
                        date: new Date(),
                        reference: '',
                        payment_type: defaultPaymentMethod || prev.payment_details[0]?.payment_type
                    }
                ]
            }));
        }
    }, [isWalletBalance, paymentMethods]);
    
   
    useEffect(() => {
        if (isWalletBalance && saleValue.payment_status && (saleValue.payment_status.value === 1 || saleValue.payment_status.value === 3)) {
            const walletPaymentMethod = paymentMethods?.find(p => p?.attributes?.type === 1);
            const grandTotal = parseFloat(calculateCartTotalAmount(updateProducts, saleValue));
            
            setSaleValue(prev => {
                const hasWalletPayment = prev.payment_details.some(pd => 
                    pd.payment_type?.value === walletPaymentMethod?.id || 
                    pd.payment_type?.type === 1
                );
                
                if (!hasWalletPayment) return prev; 
                
               
                if (walletBalance >= grandTotal) {
                    
                    return {
                        ...prev,
                        payment_details: [
                            {
                                amount: grandTotal.toString(),
                                date: new Date(),
                                reference: '',
                                payment_type: { value: walletPaymentMethod?.id, label: walletPaymentMethod?.attributes?.name, type: walletPaymentMethod?.attributes?.type }
                            }
                        ]
                    };
                } else {
                    
                    const remainingAmount = grandTotal - walletBalance;
                    const nonWalletPaymentMethod = paymentMethods?.find(p => p?.attributes?.type !== 1);
                    return {
                        ...prev,
                        payment_details: [
                            {
                                amount: remainingAmount.toString(),
                                date: new Date(),
                                reference: '',
                                payment_type: nonWalletPaymentMethod ? { value: nonWalletPaymentMethod.id, label: nonWalletPaymentMethod.attributes.name } : prev.payment_details[0]?.payment_type
                            },
                            {
                                amount: walletBalance.toString(),
                                date: new Date(),
                                reference: '',
                                payment_type: { value: walletPaymentMethod?.id, label: walletPaymentMethod?.attributes?.name, type: walletPaymentMethod?.attributes?.type }
                            }
                        ]
                    };
                }
            });
        }
    }, [updateProducts, saleValue.discount, saleValue.shipping, saleValue.tax_rate, isWalletBalance, paymentMethods]); // Include paymentMethods in dependency array

    const handleDiscountTypeChange = (event) => {
        setSaleValue({ ...saleValue, discount_type: parseInt(event.target.value) });
    };

    const onNotesChangeInput = ( e ) => {
        e.preventDefault();
        setSaleValue( inputs => ( { ...inputs, notes: e.target.value } ) );
    };

    const onStatusChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, status_id: obj } ) );
    };

    const onPaymentStatusChange = ( obj ) => {
        setSaleValue(inputs => ({
            ...inputs,
            payment_status: obj,
            payment_details: (obj.value === 1 || obj.value === 3) ? [getEmptyPaymentDetail()] : []
        }));
        
        
        setIsWalletBalance(false);
        
      
    };

    const getEmptyPaymentDetail = () => ({
        date: new Date(),
        reference: '',
        amount: '',
        payment_type: ''
    });

    const handlePaymentDetailChange = (index, name, value) => {

        const updatedDetails = [...saleValue.payment_details];
        updatedDetails[index][name] = value;
        setSaleValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
        setErrors( '' );
    };

    const handlePaymentDateChange = (index, date) => {
        const updatedDetails = [...saleValue.payment_details];
        updatedDetails[index].date = date;
        setSaleValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
    }

    const handleAddPayment = () => {
            setSaleValue(prev => ({
                ...prev,
                payment_details: [...prev.payment_details, getEmptyPaymentDetail()]
            }));
    };

    const handleRemovePayment = (index) => {
        const itemToRemove = saleValue.payment_details[index];
        
        
        if (itemToRemove?.payment_type?.value === walletPaymentMethod?.attributes?.name || itemToRemove?.payment_type?.label?.toLowerCase() === walletPaymentMethod?.attributes?.name?.toLowerCase() || 
            itemToRemove?.payment_type?.label?.toLowerCase() === walletPaymentMethod?.attributes?.name || itemToRemove?.payment_type?.type === 1) {
            setIsWalletBalance(false);
            return;
        }
        
        const updatedDetails = saleValue.payment_details.filter((_, i) => i !== index);
        setSaleValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
    };

    const onPaymentTypeChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, payment_type: obj } ) );
        setErrors( '' );
    };

    const updatedQty = ( qty ) => {
        setQuantity( qty );
    };

    const updateCost = ( cost ) => {
        setNewCost( cost );
    };

    const updateDiscount = ( discount ) => {
        setNewDiscount( discount );
    };

    const updateTax = ( tax ) => {
        setNewTax( tax );
    };

    const updateSubTotal = ( subTotal ) => {
        setSubTotal( subTotal );
    };

    const updateSaleUnit = ( saleUnit ) => {
        setNewSaleUnit( saleUnit );
    };

    const handleCallback = ( date ) => {
        setSaleValue( previousState => {
            return { ...previousState, date: date }
        } );
        const fiscalError = validateFiscalDate(date);
        if (fiscalError) {
            setErrors({ date: fiscalError });
        } else {
            setErrors( '' );
        }
    };

    const statusFilterOptions = getFormattedOptions( saleStatusOptions )
    const statusDefaultValue = statusFilterOptions.map( ( option ) => {
        return {
            value: option.id,
            label: option.name
        }
    } )

    const paymentStatusFilterOptions = getFormattedOptions( salePaymentStatusOptions )
    const paymentStatusDefaultValue = paymentStatusFilterOptions.map( ( option ) => {
        return {
            value: option.id,
            label: option.name
        }
    } )

    const prepareFormData = ( prepareData ) => {
        
        const processedPaymentDetails = prepareData.payment_details
            ?.filter(detail => {
                
                const isWalletPayment = detail.payment_type?.type === 1 || 
                    detail.payment_type?.label?.toLowerCase() === walletPaymentMethod?.attributes?.name || 
                    detail.payment_type?.label?.toLowerCase() === walletPaymentMethod?.attributes?.name?.toLowerCase() ||
                    detail.payment_type?.value === walletPaymentMethod?.attributes?.name;
                
                if (isWalletPayment && !isWalletBalance) {
                    return false;
                }
                
               
                const amount = parseFloat(detail.amount || 0);
                if (!isWalletPayment && isWalletBalance && amount === 0) {
                    return false;
                }
                
                return true;
            })
            ?.map(detail => ({
                amount: parseFloat(detail.amount || 0).toString(),
                payment_type: detail.payment_type,
                date: detail.date || new Date(),
                reference: detail.reference || ''
            })) || [];
        
        const grandTotal = calculateCartTotalAmount(updateProducts, saleValue);
        const paidAmount = prepareData.payment_status.value == 1 ? grandTotal : 0;
        
        const formValue = {
            date: moment( prepareData.date ).locale('en').toDate(),
            is_sale_created: "true",
            quotation_id: prepareData ? prepareData.quotation_id : '',
            customer_id: prepareData.customer_id.value ? prepareData.customer_id.value : prepareData.customer_id,
            warehouse_id: prepareData.warehouse_id.value ? prepareData.warehouse_id.value : prepareData.warehouse_id,
            discount: prepareData.discount,
            tax_rate: prepareData.tax_rate,
            tax_amount: calculateCartTotalTaxAmount( updateProducts, saleValue ),
            sale_items: updateProducts,
            shipping: prepareData.shipping,
            grand_total: grandTotal,
            received_amount: 0,
            paid_amount: paidAmount,
            note: prepareData.notes,
            status: prepareData.status_id.value ? prepareData.status_id.value : prepareData.status_id,
            payment_status: prepareData.payment_status.value ? prepareData.payment_status.value : prepareData.payment_status,
            payment_type: prepareData.payment_status.value == 2 ? null : prepareData.payment_type.value ? prepareData.payment_type.value : prepareData.payment_type,
            discount_type: prepareData.discount_type,
            discount_value: prepareData.discount_value,
            payment_details: processedPaymentDetails
        }
        return formValue
    };

    const onSubmit = ( event ) => {
        event.preventDefault();
        const valid = handleValidation();
        if ( valid ) {
            if ( singleSale && !isQuotation ) {
                editSale( id, prepareFormData( saleValue ), navigate );
                setIsWalletBalance(false);
                setWalletBalance(0);
            } else {
                addSaleData( prepareFormData( saleValue ) );
                setIsWalletBalance(false);
                setWalletBalance(0);
            }
        }
    };

    const onBlurInput = ( el ) => {
        if ( el.target.value === '' ) {
            if ( el.target.name === "shipping" ) {
                setSaleValue( { ...saleValue, shipping: parseFloat(0).toFixed(decimalPlaces) } );
            }
            if ( el.target.name === "discount_value" ) {
                setSaleValue( { ...saleValue, discount: parseFloat(0).toFixed(decimalPlaces) } );
            }
            if ( el.target.name === "tax_rate" ) {
               setSaleValue( { ...saleValue, tax_rate: parseFloat(0).toFixed(decimalPlaces) } );
            }
        }
    }


    return (
        <div className='card'>
            <TabTitle title={placeholderText(id && !isQuotation ? "sale.edit.title" : "sale.create.title")} />
            <div className='card-body'>
                {/*<Form>*/}
                <div className='row'>
                    <div className='col-md-4'>
                        <label className='form-label'>
                            {getFormattedMessage( 'react-data-table.date.column.label' )}:
                        </label>
                        <span className='required' />
                        <div className='position-relative'>
                            <ReactDatePicker onChangeDate={handleCallback} {...(!isFiscalYearEnabled && { newStartDate: saleValue.date })} FixedFiscalYearDate={true}/>
                        </div>
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'date' ] ? errors[ 'date' ] : null}</span>
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect name='warehouse_id' data={warehouses} onChange={onWarehouseChange}
                            title={getFormattedMessage( 'warehouse.title' )} errors={errors[ 'warehouse_id' ]}
                            defaultValue={saleValue.warehouse_id} value={saleValue.warehouse_id} addSearchItems={singleSale}
                            isWarehouseDisable={true}
                            placeholder={placeholderText( 'purchase.select.warehouse.placeholder.label' )} />
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect name='customer_id' data={customers} onChange={onCustomerChange}
                            title={getFormattedMessage( 'customer.title' )} errors={errors[ 'customer_id' ]}
                            defaultValue={saleValue.customer_id} value={saleValue.customer_id}
                            placeholder={placeholderText( 'sale.select.customer.placeholder.label' )} />
                    </div>
                    <div className='mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage( 'product.title' )}:
                        </label>
                        <ProductSearch values={saleValue} products={products} handleValidation={handleValidation}
                            updateProducts={updateProducts}
                            setUpdateProducts={setUpdateProducts} customProducts={customProducts} isLoading={isLoading} />
                    </div>
                    <div>
                        <label className='form-label'>
                            {getFormattedMessage( 'purchase.order-item.table.label' )}:
                        </label>
                        <span className='required' />
                        <ProductRowTable updateProducts={updateProducts} setUpdateProducts={setUpdateProducts}
                            updatedQty={updatedQty} frontSetting={frontSetting}
                            updateCost={updateCost} updateDiscount={updateDiscount}
                            updateTax={updateTax} updateSubTotal={updateSubTotal}
                            updateSaleUnit={updateSaleUnit}
                        />
                    </div>
                    <div className='col-12'>
                        <ProductMainCalculation inputValues={saleValue} allConfigData={allConfigData} updateProducts={updateProducts} frontSetting={frontSetting} />
                    </div>
                    {customerChangeMessage && <div className='col-12'>
                        <hr />
                        <div className='col-12 text-center'>{currencySymbolHandling(allConfigData,frontSetting.value && frontSetting.value.currency_symbol, messageWalletAmount)} {getFormattedMessage('will.be.credited.to.the.title')} {singleSale.customer_id.label}`s {getFormattedMessage('s.account.title')}</div>
                        <hr />
                    </div>}
                    <div className='col-md-4 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage( 'purchase.input.order-tax.label' )}: </label>
                        <InputGroup>
                            <input
                                className='form-control'
                                type='text' name='tax_rate' value={saleValue.tax_rate}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => {
                                    onChangeInput( e )
                                }} />
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <Form.Label
                            className='form-label'>{getFormattedMessage( 'purchase.order-item.table.discount.column.label' )}: </Form.Label>
                        <InputGroup>
                            <input
                                className='form-control'
                                type='text' name='discount_value' value={saleValue.discount_value}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => onChangeInput( e )}
                            />
                            <InputGroup.Text>
                                <select
                                    className='border-0 bg-transparent'
                                    value={saleValue.discount_type}
                                    onChange={handleDiscountTypeChange}
                                >
                                    <option value={1}>%</option>
                                    <option value={2}>{frontSetting.value && frontSetting.value.currency_symbol}</option>
                                </select>
                            </InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage( 'purchase.input.shipping.label' )}: </label>
                        <InputGroup>
                            <input aria-label='Dollar amount' type='text'
                                className='form-control'
                                name='shipping' value={saleValue.shipping}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => onChangeInput( e )}
                            />
                            <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <ReactSelect multiLanguageOption={statusFilterOptions} onChange={onStatusChange} name='status_id'
                            title={getFormattedMessage( 'purchase.select.status.label' )}
                            value={saleValue.status_id} errors={errors[ 'status_id' ]}
                            defaultValue={statusDefaultValue[ 0 ]}
                            placeholder={getFormattedMessage( 'purchase.select.status.label' )} />
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect multiLanguageOption={paymentStatusFilterOptions} onChange={onPaymentStatusChange} name='payment_status'
                            title={getFormattedMessage( 'globally.detail.payment.status' )}
                            value={saleValue.payment_status} errors={errors[ 'payment_status' ]}
                            defaultValue={paymentStatusDefaultValue[ 0 ]}
                            placeholder={placeholderText( 'sale.select.payment-status.placeholder' )} />
                    </div>

                    {(saleValue?.payment_status?.value == 1 || saleValue?.payment_status?.value == 3) && (
                        <div className='col-md-12'>
                            {/* Wallet Payment Checkbox */}
                            {saleValue.customer_id && walletBalance > 0 && (
                                <div className="col-12 mb-3">
                                    <div className="card border-0 shadow-sm p-3 rounded-3">

                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="useWalletCheckbox"
                                                    checked={isWalletBalance}
                                                    onChange={() => setIsWalletBalance(!isWalletBalance)}
                                                />
                                                <label className="form-check-label fw-semibold" htmlFor="useWalletCheckbox">
                                                    {getFormattedMessage('use.wallet.balance.title')}
                                                </label>
                                            </div>
                                            <span className="px-2 border rounded-3">
                                                {getFormattedMessage('current.wallet.balance.title')}:  { currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting.value && frontSetting.value.currency_symbol,
                                                    walletBalance.toFixed(2)
                                                )}
                                            </span>
                                        </div>

                                        {isWalletBalance  && <div className="mt-3 small">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{getFormattedMessage("previously.used.wallet.balance.title")} : </span>
                                            <span className={`fw-semibold text-primary`}>
                                               {currencySymbolHandling(allConfigData,
                                                 frontSetting.value && frontSetting.value.currency_symbol,
                                                 walletAmountBefore)}
                                            </span>
                                        </div>
                                        </div>}

                                        {isWalletBalance && <div className="d-flex justify-content-between mb-1">
                                            <span>{getFormattedMessage("wallet.used.title")}:</span>
                                            <span className="fw-semibold text-success">
                                                  {currencySymbolHandling(allConfigData,
                                                   frontSetting.value && frontSetting.value.currency_symbol,
                                                   walletAmountAfter)}
                                            </span>
                                        </div>}

                                        <hr className="my-2" />

                                        {isWalletBalance && <div className="d-flex justify-content-between mb-1">
                                            <span>{getFormattedMessage("updated.wallet.balance.title")}:</span>
                                            <span className="fw-semibold text-success">
                                              {currencySymbolHandling(allConfigData,
                                                frontSetting.value && frontSetting.value.currency_symbol,
                                                walletBalance - (walletAmountAfter - walletAmountBefore))}
                                            </span>
                                        </div>}
                                    </div>
                                </div>
                            )}
                            
                            <div className='row'>
                                <label className='form-label'>{getFormattedMessage('globally.react-table.column.payment-type.label')}:</label>
                            </div>
                            {saleValue?.payment_details?.map((item, index) => (
                                <div key={index} className='row'>
                                    <div className='row col-md-11'>
                                        <div className='col-md-3 mb-3'>
                                            <label className='form-label'>{getFormattedMessage('react-data-table.date.column.label')}:</label>
                                            <div className='position-relative'>
                                                <ReactDatePicker
                                                    onChangeDate={(date) => handlePaymentDateChange(index, date)}
                                                    newStartDate={item.date}
                                                    disableFuture={false}
                                                />
                                            </div>
                                        </div>
                                        <div className='col-md-3 mb-3'>
                                            <label className='form-label'>{getFormattedMessage('globally.detail.reference')}:</label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                name='reference'
                                                value={item.reference}
                                                placeholder={placeholderText('reference-placeholder-label')}
                                                onChange={(e) => handlePaymentDetailChange(index, 'reference', e.target.value)}
                                            />
                                        </div>
                                        <div className='col-md-3 mb-3'>
                                            <label className='form-label'>{getFormattedMessage('expense.input.amount.label')}:</label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                name='amount'
                                                value={item.amount}
                                                placeholder={placeholderText('expense.input.amount.placeholder.label')}
                                                onChange={(e) => handlePaymentDetailChange(index, 'amount', e.target.value)}
                                            />
                                            {errors.payment_details?.[index]?.amount && (
                                                <span className='text-danger'>{errors.payment_details[index].amount}</span>
                                            )}
                                        </div>
                                        <div className='col-md-3'>
                                            <ReactSelect
                                                data={paymentMethods.length > 0 && paymentMethods.filter(p => p.attributes.status == 1 && p.attributes.type !== 1)} 
                                                onChange={(value) => handlePaymentDetailChange(index, 'payment_type', value)}
                                                defaultValue={item.payment_type}
                                                value={item.payment_type}
                                                title={getFormattedMessage('select.payment-type.label')}
                                                errors={errors['payment_type']}
                                                placeholder={placeholderText('sale.select.payment-type.placeholder')}
                                                isDisabled={isWalletBalance} 
                                            />
                                            {errors.payment_details?.[index]?.payment_type && (
                                                <span className='text-danger'>{errors.payment_details[index].payment_type}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='col-md-1 d-flex align-items-center justify-content-center gap-2 pt-2'>
                                        {saleValue.payment_details.length > 1 && (
                                            <span
                                                className='btn btn-outline-danger rounded-2 py-2 px-3 m-0'
                                                onClick={() => handleRemovePayment(index)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </span>
                                        )}
                                        {index === saleValue.payment_details.length - 1 && (
                                            <span
                                                className='btn btn-outline-secondary text-dark rounded-2 py-2 px-3 m-0'
                                                onClick={handleAddPayment}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='mb-3'>
                        <label className='form-label'>
                            {getFormattedMessage( 'globally.input.notes.label' )}: </label>
                        <textarea name='notes' className='form-control' value={saleValue.notes}
                            placeholder={placeholderText( 'globally.input.notes.placeholder.label' )}
                            onChange={( e ) => onNotesChangeInput( e )}
                        />
                    </div>
                    <ModelFooter onEditRecord={singleSale} onSubmit={onSubmit} link='/app/sales' />
                </div>
                {/*</Form>*/}
            </div>
        </div>
    )
}

const mapStateToProps = ( state ) => {
    const { purchaseProducts, products, frontSetting, allConfigData, settings, paymentMethods, isLoading } = state;
    return { customProducts: prepareSaleProductArray( products ), purchaseProducts, products, frontSetting, allConfigData, settings, paymentMethods, isLoading }
}

export default connect( mapStateToProps, { editSale, fetchProductsByWarehouse, fetchPaymentMethods } )( SalesForm )

