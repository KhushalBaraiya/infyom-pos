import TopBarProgress from "react-topbar-progress-indicator";
import MasterLayout from "../MasterLayout";
import { getFormattedMessage, placeholderText, getDecimalPlaces } from "../../shared/sharedMethod";
import TabTitle from "../../shared/tab-title/TabTitle";
import HeaderTitle from "../header/HeaderTitle";
import { Col, Form, InputGroup, Row } from "react-bootstrap-v5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import HoldProductList from "./HoldProductList";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import { useEffect, useState, useCallback } from "react";
import ReactSelect from "../../shared/select/reactSelect";
import { fetchProductsByWarehouse } from "../../store/action/productAction";
import { addToast } from "../../store/action/toastAction";
import { toastType } from "../../constants";
import { prepareSaleProductArray } from "../../shared/prepareArray/prepareSaleArray";
import { calculateSubTotal } from "../../shared/calculation/calculation";
import { discountType } from "../../constants";
import { fetchFrontSetting } from "../../store/action/frontSettingAction";
import { addHoldList, fetchHoldLists } from "../../store/action/pos/HoldListAction";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";

const CreateHold = (props) => {
  const {customProducts, products, warehouses,fetchAllWarehouses, frontSetting, fetchProductsByWarehouse, fetchFrontSetting, allConfigData, isLoading, fetchHoldLists, holdListData} = props;
  const decimalPlaces = getDecimalPlaces(allConfigData);
  const navigate = useNavigate();

  const [updateProducts, setUpdateProducts] = useState([]);
  const [HoldValue,setHoldValue] = useState({
    unique_reference_id: "",
    hold_list_date: new Date().toISOString().split('T')[0],
    notes: "",
    warehouse_id: "",
    tax_rate: parseFloat(0).toFixed(decimalPlaces),
    tax_amount: parseFloat(0).toFixed(decimalPlaces),
    discount: parseFloat(0).toFixed(decimalPlaces),
    shipping: parseFloat(0).toFixed(decimalPlaces),
    grand_total: parseFloat(0).toFixed(decimalPlaces),
    discount_type: 2,
    discount_value: parseFloat(0).toFixed(decimalPlaces),
  });
  const [errors, setErrors] = useState({
    warehouse_id: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    fetchAllWarehouses();
    fetchFrontSetting();
    fetchHoldLists();
  }, []);

  useEffect(() => {
    HoldValue.warehouse_id &&
      fetchProductsByWarehouse(HoldValue.warehouse_id?.value);
  }, [HoldValue.warehouse_id]);

  const handleValidation = () => {
    let error = {};
    let isValid = false;

    if(!HoldValue.warehouse_id){
        error["warehouse_id"] = getFormattedMessage(
            "product.input.warehouse.validate.label"
        );
    }

    const qtyCart = updateProducts.filter((a) => a.quantity == 0);
    if (!HoldValue.hold_list_date) {
        error["date"] = getFormattedMessage("globally.date.validate.label");
    } else if (!HoldValue.warehouse_id) {
        error["warehouse_id"] = getFormattedMessage(
            "product.input.warehouse.validate.label"
        );
    } else if (qtyCart.length > 0) {
        dispatch(
            addToast({
                text: getFormattedMessage(
                    "globally.product-quantity.validate.message"
                ),
                type: toastType.ERROR,
            })
        );
    } else if (updateProducts.length < 1) {
        dispatch(
            addToast({
                text: getFormattedMessage(
                    "purchase.product-list.validate.message"
                ),
                type: toastType.ERROR,
            })
        );
    } else {
        isValid = true;
        setErrors({});
    }
    setErrors(error);
    return isValid;
  }; 

  const handleOrderDiscountTypeChange = (event) => {
      const newType = parseInt(event.target.value);
      const discountRaw = parseFloat(HoldValue.discount_value) || 0;
      const subTotal = calculateSubTotal(updateProducts);
      let validatedDiscount = discountRaw;

      if (newType === 1 && discountRaw > 100) {
        validatedDiscount = 100;
      } else if (newType === 2 && discountRaw > subTotal) {
        validatedDiscount = subTotal;
      }

      setHoldValue({ ...HoldValue, discount_type: newType, discount_value: validatedDiscount.toFixed(decimalPlaces) });
    };

  const onChangeInput = (e) => {
      const { name, value } = e.target;

      if (value === '') {
        setHoldValue(inputs => ({ ...inputs, [name]: value || 0 }));
        return;
      }

      if (!/^\d*\.?\d*$/.test(value)) return;
      const parts = value.split('.');
      if (parts[1]?.length > 2) return;

      const subTotal = calculateSubTotal(updateProducts);
      if (name === 'tax_rate' && parseFloat(value) > 100) return;
      if (
        name === 'discount_value' &&
        HoldValue.discount_type == 1 &&
        parseFloat(value) > 100
      ) {
        return;
      }
      if (
        name === 'discount_value' &&
        HoldValue.discount_type == 2 &&
        parseFloat(value) > subTotal
      ) {
        return;
      }

      setHoldValue(inputs => ({
        ...inputs,
        [name]: value,
      }));
    };

  const onBlurInput = (el) => {
      if (el.target.value === '') {
        if (el.target.name === "shipping") {
          setHoldValue({ ...HoldValue, shipping: parseFloat(0).toFixed(2) });
        }
        if (el.target.name === "discount_value") {
          setHoldValue({ ...HoldValue, discount: parseFloat(0).toFixed(decimalPlaces) });
        }
        if (el.target.name === "tax_rate") {
          setHoldValue({ ...HoldValue, tax_rate: parseFloat(0).toFixed(decimalPlaces) });
        }
      }
    };

  const onWarehouseChange = (obj) => {
      setHoldValue({ ...HoldValue, warehouse_id: obj });
      setErrors({});
    };

  const calculateHoldSummary = useCallback(() => {
      const subTotal = calculateSubTotal(updateProducts);
      const discountRaw = parseFloat(HoldValue.discount_value) || 0;
      const discountAmount =
        HoldValue.discount_type === discountType.PERCENTAGE
          ? (subTotal * discountRaw) / 100
          : discountRaw;
      const totalAmountAfterDiscount = subTotal - discountAmount;
      const taxRate = parseFloat(HoldValue.tax_rate) || 0;
      const taxCal = ((totalAmountAfterDiscount * taxRate) / 100).toFixed(decimalPlaces);
      const grandTotal = (totalAmountAfterDiscount + parseFloat(taxCal) + parseFloat(HoldValue.shipping)).toFixed(decimalPlaces);

      setHoldValue(prev => ({
        ...prev,
        discount: discountAmount.toFixed(decimalPlaces),
        tax_amount: taxCal,
        grand_total: grandTotal
      }));
    }, [updateProducts, HoldValue.discount_type, HoldValue.discount_value, HoldValue.tax_rate, HoldValue.shipping]);

  useEffect(() => {
      calculateHoldSummary();
    }, [calculateHoldSummary]);

  const handleCreateHold = () => {
    if(!HoldValue.unique_reference_id){
      dispatch(
        addToast({
          text: getFormattedMessage("hold-list.reference-code.error"),
          type: toastType.ERROR,
        })
      );
      return;
    }
    const existingHold = holdListData.find(hold => hold.attributes.reference_code === HoldValue.unique_reference_id);
    if (existingHold) {
      dispatch(
        addToast({
          text: getFormattedMessage("reference.id.already.exist"),
          type: toastType.ERROR,
        })
      );
      return;
    }
    const isValid = handleValidation();
    if (isValid) {
      const formValue = {
        reference_code: HoldValue.unique_reference_id,
        date: HoldValue.hold_list_date instanceof Date 
          ? HoldValue.hold_list_date.toISOString().split('T')[0] 
          : HoldValue.hold_list_date,
        customer_id: frontSetting?.value?.default_customer || 1,
        warehouse_id: HoldValue.warehouse_id ? HoldValue.warehouse_id.value : '',
        hold_items: updateProducts.map(p => ({
          product_id: p.product_id,
          quantity: parseFloat(p.quantity) || 0,
          discount_type: p.discount_type,
          discount_value: parseFloat(p.discount_value) || 0,
          tax_type: parseInt(p.tax_type) || 2,
          tax_value: parseFloat(p.tax_value) || 0,
          sub_total: parseFloat(p.sub_total) || 0,
          discount_amount: parseFloat(p.discount_amount) || 0,
          tax_amount: parseFloat(p.tax_amount) || 0,
          net_unit_price: parseFloat(p.net_unit_price) || 0,
          product_price: parseFloat(p.product_price) || 0,
          code: p.code,
          name: p.name,
          product_unit: p.product_unit,
          sale_unit: p.sale_unit,
          short_name: p.short_name,
          stock: parseInt(p.stock) || 0,
          id: p.id,
          warehouse_id: p.warehouse_id || HoldValue.warehouse_id.value
        })),
        tax_rate: HoldValue.tax_rate,
        discount: HoldValue.discount,
        shipping: HoldValue.shipping,
        note: HoldValue.notes || '',
        discount_type: HoldValue.discount_type,
        discount_value: HoldValue.discount_value
      };
      
      dispatch(addHoldList(formValue, false));
      navigate('/app/holds');
    }
  };

  return (
    <MasterLayout>
       {isLoading && <TopBarProgress/>}
        <TabTitle title={placeholderText("create.hold.list.title")} />
        <HeaderTitle title={getFormattedMessage("create.hold.list.title")} to="/app/holds"  />

        <Form.Group className="text-start mb-2 p-5 rounded bg-white">

          <Row className="mt-4">
            <Col md={4}>
            <Form.Label className="fw-bold small">
                {getFormattedMessage("hold.unique.reference.id.label")} <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup className="mb-1">
                <InputGroup.Text className="bg-light border-end-0">
                    <FontAwesomeIcon icon={faHashtag} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                    className="border-start-0 ps-2"
                    placeholder={placeholderText("enter.unique.reference.id.placeholder")}
                    value={HoldValue.unique_reference_id}
                    onChange={(e) => setHoldValue({...HoldValue, unique_reference_id: e.target.value})}
                />
                <InputGroup.Text className="bg-transparent border-start-0" onClick={() => setHoldValue({...HoldValue, unique_reference_id: Math.random().toString(36).substring(2, 8).toUpperCase()})} style={{cursor: 'pointer'}}>
                    <FontAwesomeIcon icon={faArrowsRotate} className="text-muted" />
                </InputGroup.Text>
            </InputGroup>
            <span className="text-muted small">
                {getFormattedMessage("hold.unique.reference.id.description")}
            </span>
            </Col>
            <Col md={4}>
                <ReactSelect
                    name="warehouse_id"
                    data={warehouses}
                    onChange={onWarehouseChange}
                    title={getFormattedMessage("warehouse.title")}
                    errors={errors["warehouse_id"]}
                    defaultValue={HoldValue.warehouse_id}
                    value={HoldValue.warehouse_id}
                    isdisabled={updateProducts.length > 0}
                    placeholder={placeholderText(
                        "purchase.select.warehouse.placeholder.label"
                    )}
                />
                </Col>
              <Col md={4} className="col-md-4">
              <label className="fw-bold fs-6 small">
                  {getFormattedMessage("hold.list.date.label")} <span className="text-danger">*</span>
              </label>
              <div className="position-relative mt-2">
              <ReactDatePicker
                       placeholder={placeholderText("enter.hold.list.date.placeholder")}
                       onChangeDate={(date) => setHoldValue({...HoldValue, hold_list_date: date})}
                       dateFormat={allConfigData?.date_format}
                       newStartDate={HoldValue.hold_list_date ? new Date(HoldValue.hold_list_date) : null}
                       enableNepaliDate={allConfigData?.enable_nepali_datepicker}
                   />
                </div> 
              </Col>
            </Row>

            <Row className="mt-5">
                
            </Row>
        </Form.Group>
       
        <HoldProductList
          warehouses={warehouses}
          HoldValue={HoldValue}
          setHoldValue={setHoldValue}
          products={products}
          updateProducts={updateProducts}
          setUpdateProducts={setUpdateProducts}
          handleValidation={handleValidation}
          customProducts={customProducts}
          allConfigData={allConfigData}
          frontSetting={frontSetting}
          settings={allConfigData}
          onBlurInput={onBlurInput}
          onChangeInput={onChangeInput}
          handleCreateHold={handleCreateHold}
          handleOrderDiscountTypeChange={handleOrderDiscountTypeChange}
          decimalPlaces={decimalPlaces}
          navigate={navigate}
          isLoading={isLoading}
        />
    </MasterLayout>
  )
}
const mapStateToProps = (state) => {
    const {warehouses, totalRecord, products, frontSetting, allConfigData, holdListData , isLoading} = state;
    return {customProducts: prepareSaleProductArray(products),warehouses, totalRecord, products, frontSetting, allConfigData, holdListData, isLoading}
};

export default connect(mapStateToProps, {fetchAllWarehouses,fetchProductsByWarehouse, fetchFrontSetting, addHoldList, fetchHoldLists})(CreateHold);