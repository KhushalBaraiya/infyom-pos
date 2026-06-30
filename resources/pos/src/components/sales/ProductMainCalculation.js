import React from "react";
import {
    calculateCartTotalAmount,
    calculateSubTotal,
} from "../../shared/calculation/calculation";
import {
    calculateMainAmounts,
    currencySymbolHandling,
    getFormattedMessage,
} from "../../shared/sharedMethod";
import { discountType } from "../../constants";

const ProductMainCalculation = (props) => {
   const { inputValues, updateProducts, frontSetting, allConfigData, decimalPlaces = 2 } = props;

    const {
        discountAmount,
        taxCal,
    } = calculateMainAmounts(updateProducts, inputValues);

    // const subTotal = calculateSubTotal(updateProducts);

    // const discountRaw = parseFloat(inputValues.discount_value) || 0;

    // const discountAmount =
    //     inputValues.discount_type === discountType.PERCENTAGE
    //         ? (subTotal * discountRaw) / 100
    //         : discountRaw;

    // const totalAmountAfterDiscount = subTotal - discountAmount;

    // const taxRate = parseFloat(inputValues.tax_rate) || 0;
    // const taxCal = ((totalAmountAfterDiscount * taxRate) / 100).toFixed(2);

    return (
        <div className="col-xxl-5 col-lg-6 col-md-6 col-12 float-end">
            <div className="card">
                <div className="card-body pt-7 pb-2">
                    <div className="table-responsive">
                        <table className="table border">
                            <tbody>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage(
                                            "purchase.input.order-tax.label"
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol,
                                            taxCal
                                        )}{" "}
                                        (
                                        {parseFloat(
                                            inputValues.tax_rate
                                                ? inputValues.tax_rate
                                                : 0
                                        ).toFixed(decimalPlaces)}
                                        ) %
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage(
                                            "purchase.order-item.table.discount.column.label"
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                            frontSetting.value
                                                .currency_symbol,
                                             parseFloat(discountAmount).toFixed(decimalPlaces)
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage(
                                            "purchase.input.shipping.label"
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol,
                                            inputValues.shipping
                                                ? inputValues.shipping
                                                : 0
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-primary">
                                        {getFormattedMessage(
                                            "purchase.grant-total.label"
                                        )}
                                    </td>
                                    <td className="py-3 text-primary">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol,
                                            calculateCartTotalAmount(
                                                updateProducts,
                                                inputValues
                                            )
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductMainCalculation;
