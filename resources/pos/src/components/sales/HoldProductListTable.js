import { faTrash, faPlus, faMinus, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputGroup, Form, Button } from "react-bootstrap-v5";
import { currencySymbolHandling, decimalValidate } from "../../shared/sharedMethod";

export default function HoldProductListTable({key, index, singleProduct, setUpdateProducts, updateProducts, allConfigData, frontSetting, onQuantityChange, onDiscountChange, onTaxChange, onDiscountTypeChange, settings, decimalPlaces, onEdit}) {

    const CalculateTotals = (singleProduct)=> {
        // Calculate total based on quantity, price, discount, and tax
        let basePrice = singleProduct.product_price;
        let discountAmount = 0;
        if (singleProduct.discount_type === 1) {
            discountAmount = ((basePrice * singleProduct.discount_value) / 100);
        } else {
            discountAmount = singleProduct.discount_value;
        }
        let subtotalAfterDiscount = (basePrice - discountAmount) * singleProduct.quantity;
        let taxAmount = 0;
        if (singleProduct.tax_type == 1) {
            taxAmount = (subtotalAfterDiscount * singleProduct.tax_value) / 100;
        } 
        return parseFloat(subtotalAfterDiscount + taxAmount).toFixed(decimalPlaces);
    }

const handleQuantityChange = (newQuantity) => {
      if (onQuantityChange) {
        onQuantityChange(index, newQuantity);
      }
    };



    return (
     <tr key={index} className="align-middle mt-2">
         
         <td className="text-wrap text-center" style={{ minWidth: "140px" }}>
             <h4 className="fs-6 mb-0">{singleProduct.name}</h4>
         </td>
     
         <td className="text-center">
             <span>{singleProduct.code}</span>
         </td>
     
        <td className="text-center">
               <span>
                   {currencySymbolHandling(
                       allConfigData,
                       frontSetting?.value?.currency_symbol,
                       singleProduct.product_price,
                       false
                   )}
               </span>
          </td>
     
          <td className="text-center">
             <div className="custom-qty">
               <InputGroup className="flex-nowrap">
                   <InputGroup.Text
                       className="btn btn-light btn-sm px-4 px-4 pt-2"
                       onClick={() => handleQuantityChange(Math.max(0, singleProduct.quantity - 1))}
                   >
                       -
                   </InputGroup.Text>
                   <Form.Control
                       aria-label="Product Quantity"
                       onKeyPress={(event) => decimalValidate(event)}
                       className="text-center px-0 py-2 rounded-0 border-light hide-arrow"
                       value={singleProduct.quantity || 0}
                       onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
                       type="number"
                       step={0.01}
                       min={0.0}
                   />
                    <InputGroup.Text
                        className="btn btn-light btn-sm px-4 px-4 pt-2"
                        onClick={() => {
                          handleQuantityChange(singleProduct.quantity + 1);
                        }}
                    >
                        +
                    </InputGroup.Text>
               </InputGroup>
             </div>
          </td>
     


          <td className="text-center text-nowrap">
              <div>
                   {currencySymbolHandling(
                       allConfigData,
                       frontSetting?.value?.currency_symbol,
                       CalculateTotals(singleProduct),
                       false
                   )}
              </div>
          </td>
     
          <td className="text-center">
              <div className="d-flex justify-content-center gap-2">
                  <div
                      className="text-primary cursor-pointer"
                      onClick={() => onEdit(index)}
                  >
                      <FontAwesomeIcon icon={faEdit} />
                  </div>
                  <div
                      className="text-danger cursor-pointer"
                      onClick={() =>
                          setUpdateProducts(
                              updateProducts.filter(
                                  (product) => product.id !== singleProduct.id
                              )
                          )
                      }
                  >
                      <FontAwesomeIcon icon={faTrash} />
                  </div>
              </div>
          </td>
     </tr>
    )
}
