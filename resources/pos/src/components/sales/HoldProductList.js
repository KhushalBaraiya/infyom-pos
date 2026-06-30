import { Col, Form, InputGroup, Row, Table } from "react-bootstrap-v5";
import ProductSearch from "../../shared/components/product-cart/search/ProductSearch";
import { getFormattedMessage, currencySymbolHandling } from "../../shared/sharedMethod";
import HoldProductListTable from "./HoldProductListTable";
import { calculateSubTotal } from "../../shared/calculation/calculation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { addToast } from "../../store/action/toastAction";
import { toastType } from "../../constants";
import ProductDetailsModel from "../../frontend/shared/ProductDetailsModel";
import { productUnitDropdown } from "../../store/action/productUnitAction";
import { useState } from "react";

export default function HoldProductList({warehouses, HoldValue, setHoldValue, products, updateProducts, setUpdateProducts, customProducts, handleValidation, setCustomProducts, allConfigData, frontSetting, onBlurInput, onChangeInput, settings, handleCreateHold, handleOrderDiscountTypeChange, decimalPlaces, navigate, isEdit, isLoading}) {
  const subTotal = calculateSubTotal(updateProducts);
  const totalQuantity = updateProducts.reduce((sum, p) => sum + parseFloat(p.quantity || 0), 0);
  const dispatch = useDispatch();
  const { productUnits } = useSelector(state => state);
  const [isOpenCartItemUpdateModel, setIsOpenCartItemUpdateModel] = useState(false);
  const [cartProduct, setCartProduct] = useState(null);
  const [productModelId, setProductModelId] = useState(null);

  const discountRaw = parseFloat(HoldValue.discount_value) || 0;
  const discountAmount =
    HoldValue.discount_type == 1
      ? (subTotal * discountRaw) / 100
      : discountRaw;
  const totalAmountAfterDiscount = subTotal - discountAmount;
  const taxRate = parseFloat(HoldValue.tax_rate) || 0;
  const taxCal = ((totalAmountAfterDiscount * taxRate) / 100).toFixed(decimalPlaces);
  const grandTotal = (totalAmountAfterDiscount + parseFloat(taxCal) + parseFloat(HoldValue.shipping)).toFixed(decimalPlaces);

  const calculateProductTotals = (product) => {
    let basePrice = product.product_price * product.quantity;
    let discountAmount = 0;
    if (product.discount_type === 1) {
      discountAmount = (basePrice * product.discount_value) / 100;
    } else {
      discountAmount = product.discount_value;
    }
    let subtotalAfterDiscount = basePrice - discountAmount;
    let taxAmount = 0;
    if (product.tax_type === 1) {
      taxAmount = (subtotalAfterDiscount * product.tax_value) / 100;
    } else if (product.tax_type === 2) {
      taxAmount = subtotalAfterDiscount - (subtotalAfterDiscount / (1 + product.tax_value / 100));
    }
    let total = subtotalAfterDiscount + taxAmount;
    return {
      sub_total: total.toFixed(decimalPlaces),
      discount_amount: discountAmount.toFixed(decimalPlaces),
      tax_amount: taxAmount.toFixed(decimalPlaces)
    };
  };

  const handleQuantityChange = (index, quantity) => {
    const product = updateProducts[index];
    const maxQuantity = product.stock ? parseInt(product.stock) : Infinity;
    if (quantity > product.stock) {
      dispatch(
          addToast({
              text: getFormattedMessage("pos.quantity.exceeds.quantity.available.in.stock.message"),
              type: toastType.ERROR,
          })
      );
    }
    const validatedQuantity = Math.min(Math.max(0, quantity), maxQuantity);

    const updatedProducts = [...updateProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: validatedQuantity
    };
    const totals = calculateProductTotals(updatedProducts[index]);
    updatedProducts[index] = { ...updatedProducts[index], ...totals };
    setUpdateProducts(updatedProducts);
  };

  const handleDiscountChange = (index, value) => {
    const product = updateProducts[index];
    const basePrice = parseFloat(product.product_price) * parseFloat(product.quantity);
    let validatedValue = value;

    if (product.discount_type == 1 && value > 100) {
      validatedValue = 100;
    }
    if (product.discount_type == 2 && value > basePrice) {
      validatedValue = basePrice;
    }

    const updatedProducts = [...updateProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      discount_value: validatedValue
    };
    setUpdateProducts(updatedProducts);
  };

  const handleTaxChange = (index, value) => {
    const validatedValue = Math.min(value, 100);
    const updatedProducts = [...updateProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      tax_value: validatedValue
    };
    setUpdateProducts(updatedProducts);
  };

  const handleDiscountTypeChange = (index, type, validatedDiscountValue) => {
    const updatedProducts = [...updateProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      discount_type: type,
      discount_value: validatedDiscountValue
    };
    const totals = calculateProductTotals(updatedProducts[index]);
    updatedProducts[index] = { ...updatedProducts[index], ...totals };
    setUpdateProducts(updatedProducts);
  };

  const handleEditProduct = (index) => {
    const product = updateProducts[index];
    setCartProduct(product);
    setProductModelId(product.id);
    setIsOpenCartItemUpdateModel(true);
  };

  const onProductUpdateInCart = (updatedProduct) => {
    const index = updateProducts.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      const updatedProducts = [...updateProducts];
      updatedProducts[index] = { ...updatedProduct };
      const totals = calculateProductTotals(updatedProducts[index]);
      updatedProducts[index] = { ...updatedProducts[index], ...totals };
      setUpdateProducts(updatedProducts);
    }
  };

  const updateCost = (cost) => {
    // Not sure what this does in original, perhaps no-op
  };

  return (
    <div>
      <Row className="p-2">
        <Col xxl={9} sm={12} className="p-2" >
         <div className="p-2 bg-white rounded">
              <div className="d-flex px-3 justify-content-between align-items-center">
                <h3 className="text-lg fw-bold">{getFormattedMessage("product.list.title")}</h3>
              <div className="flex-grow-1 d-flex justify-content-end">
                <div className="col-8">
                <ProductSearch
                    values={HoldValue}
                    products={products}
                    handleValidation={handleValidation}
                    updateProducts={updateProducts}
                    isAllProducts={false}
                    setUpdateProducts={setUpdateProducts}
                    customProducts={customProducts}
                    isLoading={isLoading}
                />
                </div>
              </div>
            </div>
            <div className="bg-white rounded">
            <Table responsive className="w-100 mt-5" minWidth="fit-content">
               <thead>
                <tr>
                  <th className="text-center">{getFormattedMessage("product.name.label")}</th>
                  <th className="text-center">{getFormattedMessage('product.sku.label')}</th>
                  <th className="text-center">{getFormattedMessage('globally.detail.unit-price')}</th>
                  <th className="text-center">{getFormattedMessage('purchase.order-item.table.qty.column.label')}</th>
                  <th className="text-center">{getFormattedMessage('pos-total.title')}</th>
                  <th className="text-center">{getFormattedMessage('react-data-table.action.column.label')}</th>
                </tr>
               </thead>
              <tbody>
                {
                  updateProducts && updateProducts?.length > 0 ? updateProducts.map((product, index) => (
                <HoldProductListTable
                  key={index}
                  index={index}
                  singleProduct={product}
                  setUpdateProducts={setUpdateProducts}
                  updateProducts={updateProducts}
                  allConfigData={allConfigData}
                  frontSetting={frontSetting}
                  onQuantityChange={handleQuantityChange}
                  onDiscountChange={handleDiscountChange} 
                  onTaxChange={handleTaxChange}
                  onDiscountTypeChange={handleDiscountTypeChange}
                  settings={settings}
                  decimalPlaces={decimalPlaces}
                  onEdit={handleEditProduct}
                />
                   )) : <tr>
                    <td colSpan={6} className='fs-5 px-3 py-6 custom-text-center'>
                      {getFormattedMessage('sale.product.table.no-data.label')}
                    </td>
                  </tr>
                }
              </tbody>
            </Table>
           { updateProducts?.length > 0 && 
            <div className="w-100 px-2 d-flex justify-content-between align-items-center border-top pt-3">
               <button className="btn px-2 py-2 border-danger rounded d-flex justify-content-center align-items-center gap-2 bg-transparent text-danger" onClick={() => setUpdateProducts([])}>
                 <FontAwesomeIcon icon={faTrash}/> {getFormattedMessage("globally.clear.all.btn")}
               </button>
               <span className="bg-light rounded px-3 py-2">
                 {getFormattedMessage("dashboard.recentSales.total-product.label")} : {updateProducts?.length}
               </span>
           </div>
            }
          </div>

         </div>
        </Col>

        <Col xxl={3} sm={12} className="p-1">
        <div className="card">
        <div className="card-body pt-7 pb-2">
        <Row>
          <Col md={12} className="mt-2">
            <Form.Label className="fw-bold small">
                {getFormattedMessage("purchase.input.order-tax.label")}: 
                </Form.Label>
                <InputGroup>
                    <input
                        className="form-control"
                        type="text" 
                        name="tax_rate" 
                        value={HoldValue.tax_rate}
                        onBlur={(event) => onBlurInput(event)}
                        onKeyPress={(event) => {
                            if (!/[0-9.]/.test(event.key)) {
                                event.preventDefault();
                            }
                        }}
                        onChange={(e) => onChangeInput(e)}
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
            </Col>
            <Col md={12} className="mt-2">
                <Form.Label className="fw-bold small">
                    {getFormattedMessage("purchase.input.shipping.label")}: 
                </Form.Label>
                <InputGroup>
                  <input
                      className="form-control"
                      type="text" 
                      name="shipping" 
                      value={HoldValue.shipping}
                      onBlur={(event) => onBlurInput(event)}
                      onKeyPress={(event) => {
                          if (!/[0-9.]/.test(event.key)) {
                              event.preventDefault();
                          }
                      }}
                      onChange={(e) => onChangeInput(e)}
                  />
                  <InputGroup.Text>{frontSetting?.value?.currency_symbol}</InputGroup.Text>
                </InputGroup>
            </Col>
            <Col md={12} className="mt-2">
               <Form.Label className="fw-bold small">
                   {getFormattedMessage("purchase.order-item.table.discount.column.label")}: 
               </Form.Label>
               <InputGroup>
                   <input
                       className="form-control"
                       type="text" 
                       name="discount_value"
                       style={{ height: "45px" }} 
                       value={HoldValue.discount_value}
                       onBlur={(event) => onBlurInput(event)}
                       onKeyPress={(event) => {
                           if (!/[0-9.]/.test(event.key)) {
                               event.preventDefault();
                           }
                       }}
                       onChange={(e) => onChangeInput(e)}
                   />
                    <InputGroup.Text className="px-1"  style={{ height: "45px" }} >
                        <Form.Select
                            className="border-0 bg-transparent"
                            value={HoldValue.discount_type}
                            onChange={handleOrderDiscountTypeChange}
                        >
                            <option value={1}>%</option>
                            <option value={2}>{frontSetting?.value?.currency_symbol}</option>
                        </Form.Select>
                    </InputGroup.Text>
               </InputGroup>
            </Col>
         </Row>
         <div className="table-responsive mt-5">
           <table className="table border">
             <tbody style={{minWidth:'1000px'}}>
                <tr>
                   <td className="py-3">
                     Total Quantity
                   </td>
                   <td className="py-3">
                     {totalQuantity.toFixed(decimalPlaces)}
                   </td>
                </tr>
                <tr>
                  <td className="py-3">
                    {getFormattedMessage(
                      "purchase.input.order-tax.label"
                    )}
                  </td>
                  <td className="py-3">
                    {currencySymbolHandling(
                      allConfigData,
                      frontSetting?.value?.currency_symbol,
                      taxCal,
                      false
                    )}{' '}
                    (
                    {parseFloat(
                      HoldValue.tax_rate
                        ? HoldValue.tax_rate
                        : 0
                    ).toFixed(2)}
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
                      frontSetting?.value?.currency_symbol,
                      discountAmount.toFixed(decimalPlaces),
                      false
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
                       frontSetting?.value?.currency_symbol,
                       HoldValue.shipping
                         ? HoldValue.shipping
                         : 0,
                       false
                     )}
                   </td>
                 </tr>
                 <tr>
                   <td className="py-3">
                     {getFormattedMessage("globally.detail.subtotal")}
                   </td>
                   <td className="py-3">
                     {currencySymbolHandling(
                       allConfigData,
                       frontSetting?.value?.currency_symbol,
                       subTotal.toFixed(decimalPlaces),
                       false
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
                       frontSetting?.value?.currency_symbol,
                       grandTotal,
                       false
                     )}
                   </td>
                 </tr>
             </tbody>
           </table>
         </div>
          <div className="gap-2 px-1">
             <button className="btn btn-primary w-100 px-2 py-2 d-flex justify-content-center align-items-center gap-2" onClick={handleCreateHold}>
                <FontAwesomeIcon icon={faPlus}/>  {getFormattedMessage(isEdit ? "globally.update.title" : "globally.create.title")}
             </button>
             <button className="btn btn-secondary text-white w-100 px-2 py-2 d-flex justify-content-center align-items-center gap-2 mt-2" onClick={() => navigate('/app/holds')}>
                <FontAwesomeIcon icon={faTrash}/>  {getFormattedMessage("globally.cancel-btn")}
             </button>
          </div>
        </div>
      </div>
    </Col>
  </Row>
  {cartProduct && (
    <ProductDetailsModel
      openProductDetailModal={setIsOpenCartItemUpdateModel}
      isOpenCartItemUpdateModel={isOpenCartItemUpdateModel}
      cartProduct={cartProduct}
      onProductUpdateInCart={onProductUpdateInCart}
      productModelId={productModelId}
      updateCost={updateCost}
      productUnitDropdown={productUnitDropdown}
      productUnits={productUnits}
      frontSetting={frontSetting}
      settings={settings}
      saleunitDisalbed={true}
    />
  )}
</div>
  )
}
