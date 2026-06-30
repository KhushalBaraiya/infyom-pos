import React from "react";
import { Image } from "react-bootstrap-v5";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../shared/sharedMethod";

class ThermalPrintButton extends React.PureComponent {
    render() {
        const print = this.props.updateProducts;
        const frontSetting = this.props.frontSetting;
        const allConfigData = this.props.allConfigData;
        const barcodeOptions = this.props.barcodeOptions;
        const priceFontSize = this.props.priceFontSize;

        const companyName = allConfigData && allConfigData.store_name;
        const currencySymbol =
            frontSetting &&
            frontSetting.value &&
            frontSetting.value.currency_symbol;

        function printFunction(product) {
            let indents = [];
            for (let i = 0; i < product.quantity; i++) {
                indents.push(
                    <div
                        key={i}
                        className="thermal-barcode-item"
                    >
                        <div className="thermal-barcode-content">
                            {barcodeOptions.companyName && companyName && (
                                <div className="thermal-company-name">
                                    {companyName}
                                </div>
                            )}
                            {barcodeOptions.productName && product.name && (
                                <div className="thermal-product-name">
                                    {product.name}
                                </div>
                            )}
                            {barcodeOptions?.price && product.product_price && (
                                <div className="thermal-price">
                                    <span className="thermal-price-label" style={{ fontSize: `${priceFontSize / 2}px` }}>
                                        {getFormattedMessage(
                                            "product.table.price.column.label"
                                        )}
                                        :
                                    </span>
                                    <span style={{ fontSize: `${priceFontSize}px` }}>
                                        {currencySymbolHandling(
                                            allConfigData,
                                            currencySymbol,
                                            product.product_price
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="thermal-barcode-image">
                                <Image
                                    src={product && product.barcode_url}
                                    alt={product && product.name}
                                    className="thermal-barcode-img"
                                />
                            </div>
                            <div className="thermal-barcode-code">
                                {product && product.code}
                            </div>
                        </div>
                    </div>
                );
            }
            return indents;
        }

        return (
            <div className="thermal-print-container">
                <style>
                    {`
                        @media print {
                            .thermal-print-container {
                                margin: 0 !important;
                                padding: 0 !important;
                                background: white !important;
                            }
                            .thermal-barcode-item {
                                width: 2in !important;
                                height: 1in !important;
                                margin: 0 !important;
                                padding: 0.05in !important;
                                border: ${barcodeOptions.showBorder ? '1px solid #000' : 'none'} !important;
                                background: white !important;
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                                display: block !important;
                                float: none !important;
                                page-break-after: always !important;
                                box-sizing: border-box !important;
                                overflow: hidden !important;
                            }
                            .thermal-barcode-item:last-child {
                                page-break-after: auto !important;
                            }
                            .thermal-barcode-content {
                                background: #ffffff !important;
                                display: flex !important;
                                flex-direction: column !important;
                                justify-content: space-between !important;
                                align-items: center !important;
                                height: 100% !important;
                                width: 100% !important;
                                box-sizing: border-box !important;
                                padding: 0.02in !important;
                                overflow: hidden !important;
                            }
                            .thermal-company-name {
                                font-size: 8pt !important;
                                line-height: 1 !important;
                                margin: 0 !important;
                                text-align: center !important;
                                font-weight: bold !important;
                                white-space: nowrap !important;
                                overflow: hidden !important;
                                text-overflow: ellipsis !important;
                                width: 100% !important;
                                flex-shrink: 0 !important;
                            }
                            .thermal-product-name {
                                font-size: 7pt !important;
                                line-height: 1 !important;
                                margin: 0 !important;
                                text-align: center !important;
                                white-space: nowrap !important;
                                overflow: hidden !important;
                                text-overflow: ellipsis !important;
                                width: 100% !important;
                                flex-shrink: 0 !important;
                            }
                            .thermal-price {
                                font-size: 6pt !important;
                                line-height: 1 !important;
                                margin: 0 !important;
                                text-align: center !important;
                                white-space: nowrap !important;
                                overflow: hidden !important;
                                text-overflow: ellipsis !important;
                                width: 100% !important;
                                flex-shrink: 0 !important;
                            }
                            .thermal-barcode-image {
                                flex: 1 !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                margin: 0 !important;
                                width: 100% !important;
                                min-height: 0 !important;
                                max-height: 0.4in !important;
                                overflow: hidden !important;
                            }
                            .thermal-barcode-img {
                                max-width: 1.8in !important;
                                max-height: 0.3in !important;
                                width: auto !important;
                                height: auto !important;
                                object-fit: contain !important;
                                display: block !important;
                            }
                            .thermal-barcode-code {
                                font-size: 7pt !important;
                                line-height: 1 !important;
                                margin: 0 !important;
                                text-align: center !important;
                                font-weight: bold !important;
                                white-space: nowrap !important;
                                overflow: hidden !important;
                                text-overflow: ellipsis !important;
                                width: 100% !important;
                                flex-shrink: 0 !important;
                            }
                            @page {
                                size: 2in 1in;
                                margin: 0 !important;
                                background: white !important;
                            }
                            body, html {
                                background: white !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                        }
                    `}
                </style>
                {print.products &&
                    print.products.map((product, index) => {
                        return printFunction(product, index);
                    })}
            </div>
        );
    }
}

export default ThermalPrintButton;
