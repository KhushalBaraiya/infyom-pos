import React, { useEffect, useState } from 'react'
import { currencySymbolHandling, getFormattedMessage } from '../../shared/sharedMethod';
import { Carousel, Table } from 'react-bootstrap';
import { setCartProduct } from '../../store/action/cartAction';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../footer/Footer';
import { fetchDualScreenSetting } from '../../store/action/dualScreenAction';
import { calculateProductCost } from '../../frontend/shared/SharedMethod';
import { fetchSetting } from '../../store/action/settingAction';
import LiveClock from './LiveClock';

const CustomerDisplay = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dispatch = useDispatch();
    const { cartProduct, customer, cartItemValue, subTotal, grandTotal, paymentMethod } = useSelector((state) => state.cart.cartData);
    const { allConfigData, frontSetting, dualScreenSetting, settings } = useSelector((state) => state);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'cart-sync') {
                const cartData = JSON.parse(e.newValue);
                dispatch(setCartProduct(cartData));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const savedCart = localStorage.getItem('cart-sync');
        if (savedCart) {
            dispatch(setCartProduct(JSON.parse(savedCart)));
        }

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        dispatch(fetchDualScreenSetting());
        dispatch(fetchSetting());
    }, [])

    const currencyAmountHandling = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            frontSetting.value && frontSetting.value.currency_symbol,
            amount
        );
    };

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

    return (
        <div className='container-fluid p-3'>
            <div className='row'>
                <div className='col-12 mb-3'>
                    <div className='card p-5'>
                        <div className='row'>
                            <p className='col-lg-7 col-md-7 col-sm-12 text-end m-0 fw-bold fs-2'>
                                {dualScreenSetting?.attributes?.dual_screen_header_text || settings?.attributes?.store_name}
                            </p>
                            <p className='col-lg-5 col-md-5 col-sm-12 text-end m-0 fw-bold fs-4 text-primary'><LiveClock /></p>
                        </div>
                    </div>
                </div>

                <div className={`col-12 ${dualScreenSetting?.attributes?.dual_screen_images?.length > 0 ? 'col-lg-8' : 'col-lg-12'} mb-3`}>
                    <div className='card h-100 p-4'>

                        <div className='d-flex align-items-center justify-content-between mb-3'>
                            <p className='fw-bold fs-3 m-0'>
                                {customer?.label ? customer.label : getFormattedMessage("no.customer.selected.title")} {customer?.phoneNumber ? `(${customer.phoneNumber})` : ''}
                            </p>
                            <button
                                className='btn border-primary rounded px-2 py-1 text-primary'
                                onClick={() => fullScreen()}
                            >
                                {isFullscreen ? (
                                    <i className="bi bi-fullscreen-exit fs-6" />
                                ) : (
                                    <i className="bi bi-arrows-fullscreen fs-6" />
                                )}
                            </button>
                        </div>

                        <div className="main-table overflow-auto customer-display-table">
                            <Table className="mb-0">
                                <thead className="position-sticky top-0">
                                    <tr>
                                        <th>
                                            {getFormattedMessage("pos-product.title")}
                                        </th>
                                        <th>
                                            {getFormattedMessage("pos-qty.title")}
                                        </th>
                                        <th>
                                            {getFormattedMessage("pos-price.title")}
                                        </th>
                                        {settings?.attributes?.show_tax === '1' && <th>
                                            {getFormattedMessage("tax.title")}
                                        </th>}
                                        <th colSpan="2">
                                            {getFormattedMessage("pos-sub-total.title")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartProduct?.length > 0 ? (
                                        cartProduct.reverse().map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <img
                                                        src={item.image}
                                                        alt="Product"
                                                        className="me-3"
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                                    />
                                                    <span>{item.name}</span>
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>{settings?.attributes?.show_tax === '1' 
                                                    ? currencyAmountHandling(item.product_price)
                                                    : currencySymbolHandling(
                                                        allConfigData,
                                                        frontSetting.value && frontSetting.value.currency_symbol,
                                                        calculateProductCost(item)
                                                    )}
                                                </td>
                                                {settings?.attributes?.show_tax === '1' &&
                                                    <td>
                                                        {currencySymbolHandling(
                                                            allConfigData,
                                                            frontSetting.value && frontSetting.value.currency_symbol,
                                                            item.tax_amount
                                                        )} {`( ${item.tax_value}% )`}
                                                    </td>}
                                                <td>
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        frontSetting.value && frontSetting.value.currency_symbol,
                                                        calculateProductCost(item) * item.quantity
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">{getFormattedMessage("react-data-table.no-record-found.label")}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        <div className='row g-3 mt-4 mx-2 border-top border-secondary'>
                            <div className='col-12 col-sm-6 col-lg-3'>
                                <p className='m-0 fw-bold fs-3 text-gray-600'>
                                    {getFormattedMessage("product-items.label")} : {cartProduct?.length}
                                </p>
                            </div>
                            <div className='col-12 col-sm-6 col-lg-3'>
                                <p className='m-0 fw-bold fs-3 text-gray-600'>
                                    {getFormattedMessage("pos.subtotal.small.title")} : {currencyAmountHandling(subTotal)}
                                </p>
                            </div>
                        </div>

                        <div className='row g-3 mx-2 mt-1'>
                            <div className='col-12 col-sm-6 col-lg-3'>
                                <p className='m-0 fw-bold fs-3 text-gray-600'>
                                    {getFormattedMessage("globally.detail.discount")} :{" "}
                                    {currencyAmountHandling(cartItemValue?.discount)}
                                </p>
                            </div>
                            <div className='col-12 col-sm-6 col-lg-3'>
                                <p className='m-0 fw-bold fs-3 text-gray-600'>
                                    {getFormattedMessage("globally.detail.order.tax")} : {cartItemValue?.tax + '%'}
                                </p>
                            </div>
                            <div className='col-12 col-sm-6 col-lg-3'>
                                <p className='m-0 fw-bold fs-3 text-gray-600'>
                                    {getFormattedMessage("globally.detail.shipping")} : {currencyAmountHandling(Number(cartItemValue?.shipping) || 0)}
                                </p>
                            </div>
                            <div className='col-12 col-sm-6 col-lg-3'>
                                <p className='m-0 fw-bold fs-3 text-success'>
                                    {getFormattedMessage("pos-total-amount.title")} : {currencyAmountHandling(grandTotal)}
                                </p>
                            </div>
                        </div>

                        <div className='row mx-2 mt-4 bg-secondary text-white rounded p-3'>
                            <div className='col-6 col-md-3'>
                                <p className='fw-bold fs-3 text-white m-0'>{getFormattedMessage("pos-total-amount.title")} :</p>
                                <p className='fs-4 m-0'>{currencyAmountHandling(grandTotal)}</p>
                            </div>
                            <div className='col-6 col-md-3'>
                                <p className='fw-bold fs-3 text-white m-0'>{getFormattedMessage("payment.method.title")} :</p>
                                <p className='fs-4 m-0'>{paymentMethod?.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {dualScreenSetting?.attributes?.dual_screen_images?.length > 0 && <div className='col-12 col-lg-4 mb-3'>
                    <div className='h-100 text-center'>
                        <Carousel className="card customer-display-carousel" controls={false} indicators={false} interval={2000} pause={false}>
                            {dualScreenSetting.attributes.dual_screen_images.map((imgObj, idx) => (
                                <Carousel.Item key={idx}>
                                    <div className='carousel-img'>
                                        <img
                                            className="d-block w-100"
                                            src={imgObj}
                                            alt={`Slide ${idx + 1}`}
                                            style={{ height: '100%', objectFit: 'contain', borderRadius: '10px' }}
                                        />
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>
                </div>}
            </div>

            <div className="container-fluid">
                <Footer
                    allConfigData={allConfigData}
                    frontSetting={frontSetting}
                />
            </div>
        </div>
    )
}

export default CustomerDisplay