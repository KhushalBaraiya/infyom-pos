import React from "react";
import { Image } from "react-bootstrap-v5";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../shared/sharedMethod";
import ThermalPrintButton from "./ThermalPrintButton";

class PrintButton extends React.PureComponent {
    render() {
        const print = this.props.updateProducts;
        const paperSize = print.paperSize;
        const frontSetting = this.props.frontSetting;
        const allConfigData = this.props.allConfigData;
        const barcodeOptions = this.props.barcodeOptions;
        const customSize = this.props.customSize;
        const priceFontSize = this.props.priceFontSize;

        const companyName = allConfigData && allConfigData.store_name;
        const currencySymbol =
            frontSetting &&
            frontSetting.value &&
            frontSetting.value.currency_symbol;

        function printFunction(product, index) {
            let indents = [];
            for (let i = 0; i < product.quantity; i++) {
                // Custom size printing
                if (paperSize.value === 10) {
                    const widthInMm = customSize?.width || 50;
                    const heightInMm = customSize?.height || 25;
                    // Convert mm to inches for CSS (1mm = 0.0393701 inches)
                    const widthInInches = (widthInMm * 0.0393701).toFixed(3);
                    const heightInInches = (heightInMm * 0.0393701).toFixed(3);

                    indents.push(
                        <div
                            key={i}
                            className="thermal-barcode-item"
                            style={{
                                width: `${widthInInches}in`,
                                height: `${heightInInches}in`,
                            }}
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
                                {barcodeOptions?.price && (
                                    <div className="thermal-price" style={{ lineHeight: 1.3 }}>
                                        <span className="thermal-price-label" style={{ fontSize: `${priceFontSize <= 20  ? priceFontSize - 3  : priceFontSize / 2}px` }}>
                                            {getFormattedMessage(
                                                "product.table.price.column.label"
                                            )}
                                            :
                                        </span>{" "}
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
                } else {
                    // Regular A4 printing
                    indents.push(
                        <div
                            key={i}
                            className={`${
                                paperSize.value === 1
                                    ? "print-main__print1"
                                    : "" || paperSize.value === 2
                                    ? "print-main__print2"
                                    : "" || paperSize.value === 3
                                    ? "print-main__print3"
                                    : "" ||
                                      paperSize.value === 4 ||
                                      paperSize.value === 6
                                    ? "print-main__print4"
                                    : "" || paperSize.value === 5
                                    ? "print-main__print5"
                                    : "" || paperSize.value === 7
                                    ? "print-main__print7"
                                    : "" || paperSize.value === 8
                                    ? "print-main__print8"
                                    : ""
                            } barcode-main__barcode-item barcode-main__barcode-style`}
                            style={{
                                border: barcodeOptions.showBorder ? '1px solid #000' : 'none',
                            }}
                        >
                            <div className="fw-bolder lh-1">
                                {barcodeOptions.companyName && companyName}
                            </div>
                            <div className="text-capitalize">
                                {barcodeOptions.productName && product.name}
                            </div>
                            {barcodeOptions?.price && (
                                <div className="text-capitalize" style={{ lineHeight: 1.3 }}>
                                    <span className="fw-bolder" style={{ fontSize: `${priceFontSize <= 20  ? priceFontSize - 3  : priceFontSize / 2}px` }}>
                                        {getFormattedMessage(
                                            "product.table.price.column.label"
                                        )}
                                        :
                                    </span>{" "}
                                    <span style={{ fontSize: `${priceFontSize}px` }}>
                                        {currencySymbolHandling(
                                            allConfigData,
                                            currencySymbol,
                                            product.product_price
                                        )}
                                    </span>
                                </div>
                            )}
                            <Image
                                src={product && product.barcode_url}
                                alt={product && product.name}
                                className="w-100"
                            />
                            <div className="fw-bolder">
                                {product && product.code}
                            </div>
                        </div>
                    );
                }
            }
            return indents;
        }

        // Check if thermal printer is selected
        if (paperSize.value === 9) {
            return (
                <ThermalPrintButton
                    updateProducts={print}
                    frontSetting={frontSetting}
                    allConfigData={allConfigData}
                    barcodeOptions={barcodeOptions}
                    priceFontSize={priceFontSize}
                />
            );
        }

        // Check if custom size is selected
        if (paperSize.value === 10) {
            const widthInMm = customSize?.width || 50;
            const heightInMm = customSize?.height || 25;
            // Convert mm to inches for CSS (1mm = 0.0393701 inches)
            const widthInInches = (widthInMm * 0.0393701).toFixed(3);
            const heightInInches = (heightInMm * 0.0393701).toFixed(3);

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
                                    width: ${widthInInches}in !important;
                                    height: ${heightInInches}in !important;
                                    margin: 0 !important;
                                    padding: 0.05in !important;
                                    border: ${barcodeOptions.showBorder ? '1px solid #000' : 'none'} !important;
                                    background: white !important;
                                    page-break-inside: avoid;
                                    break-inside: avoid;
                                    display: block !important;
                                    float: none !important;
                                    page-break-after: always;
                                }
                                .thermal-barcode-item:last-child {
                                    page-break-after: auto !important;
                                }
                                .thermal-barcode-content {
                                    background: #ffffff !important;
                                }
                                .thermal-company-name {
                                    font-size: 8pt !important;
                                }
                                .thermal-product-name {
                                    font-size: 7pt !important;
                                }
                                .thermal-price {
                                    font-size: 6pt !important;
                                }
                                .thermal-barcode-img {
                                    max-width: ${(widthInMm * 0.0393701 * 0.9).toFixed(3)}in !important;
                                    max-height: ${(heightInMm * 0.0393701 * 0.4).toFixed(3)}in !important;
                                }
                                .thermal-barcode-code {
                                    font-size: 7pt !important;
                                }
                                @page {
                                    size: ${widthInInches}in ${heightInInches}in;
                                    margin: 0;
                                    background: white !important;
                                }
                                body, html {
                                    background: white !important;
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

        return (
            <div className="p-4">
                {print.products &&
                    print.products.map((product, index) => {
                        return printFunction(product, index);
                    })}
            </div>
        );
    }
}

export default PrintButton;
