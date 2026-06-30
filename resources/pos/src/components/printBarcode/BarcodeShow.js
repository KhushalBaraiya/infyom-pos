import React from "react";
import { Image } from "react-bootstrap-v5";
import { currencySymbolHandling } from "../../shared/sharedMethod";
import { getFormattedMessage } from "../../shared/sharedMethod";

const BarcodeShow = (props) => {
    const {
        updateProducts,
        paperSize,
        updated,
        frontSetting,
        allConfigData,
        barcodeOptions,
        customSize,
        priceFontSize
    } = props;

    const companyName = allConfigData && allConfigData.store_name;
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const loopBarcode = (product) => {
        let indents = [];
        for (let i = 0; i < product.quantity; i++) {
            // Custom size preview
            if (paperSize.value === 10) {
                const customWidth = customSize?.width ? `${customSize.width}mm` : '50mm';
                const customHeight = customSize?.height ? `${customSize.height}mm` : '25mm';

                indents.push(
                    <div
                        key={i}
                        className="thermal-barcode-item"
                        style={{
                            width: customWidth,
                            height: customHeight,
                            border: barcodeOptions.showBorder ? '1px solid #000' : 'none',
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
                            {barcodeOptions?.price && product.product_price && (
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
            }
            // Thermal printer preview
            else if (paperSize.value === 9) {
                indents.push(
                    <div
                        key={i}
                        className="thermal-barcode-item"
                        style={{
                            border: barcodeOptions.showBorder ? '1px solid #000' : 'none',
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
                            {barcodeOptions?.price && product.product_price && (
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
                // Regular A4 paper preview
                indents.push(
                    <div
                        key={i}
                        className={`${
                            paperSize.value === 1
                                ? "col-md-3"
                                : "" || paperSize.value === 2
                                ? "col-md-4 barcode-main__box-height2"
                                : "" || paperSize.value === 3
                                ? "col-md-4 barcode-main__box-height3"
                                : "" ||
                                  paperSize.value === 4 ||
                                  paperSize.value === 6
                                ? "col-md-6 barcode-main__box-height2 px-20"
                                : "" || paperSize.value === 5
                                ? "col-md-4 barcode-main__box-height3 px-13"
                                : "" || paperSize.value === 7
                                ? "col-md-4 barcode-main__box-height7 px-20"
                                : "" || paperSize.value === 8
                                ? "col-md-6 barcode-main__box-height7 px-20"
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
                        )}{" "}
                        <Image
                            src={product && product.barcode_url}
                            alt={product && product.name}
                            className="w-100"
                        />
                        <div className="fw-bolder">{product && product.code}</div>
                    </div>
                );
            }
        }
        return indents;
    };

    return (
        <>
            {
                <div className="col-md-12 d-flex d-wrap justify-content-between flex-column overflow-auto">
                    {updated
                        ? updateProducts
                            ? updateProducts.map((product, index) => {
                                  return (
                                      <div
                                          className={
                                              paperSize.value === 9 || paperSize.value === 10
                                                  ? "thermal-preview-container"
                                                  : "barcode-main"
                                          }
                                          style={
                                              paperSize.value === 10 ? {
                                                  position: 'relative'
                                              } : {}
                                          }
                                          id="demo"
                                          key={index}
                                      >
                                          {paperSize.value === 10 && (
                                              <div style={{
                                                  position: 'absolute',
                                                  top: '-25px',
                                                  left: '50%',
                                                  transform: 'translateX(-50%)',
                                                  fontSize: '12px',
                                                  fontWeight: 'bold',
                                                  color: '#666',
                                                  background: '#f8f9fa',
                                                  padding: '2px 8px',
                                                  borderRadius: '4px',
                                                  border: '1px solid #ddd'
                                              }}>
                                                  Custom Size Label Preview ({customSize?.width || 50}mm x {customSize?.height || 25}mm)
                                              </div>
                                          )}
                                          {loopBarcode(product)}
                                      </div>
                                  );
                              })
                            : ""
                        : ""}
                </div>
            }
        </>
    );
};
export default BarcodeShow;
