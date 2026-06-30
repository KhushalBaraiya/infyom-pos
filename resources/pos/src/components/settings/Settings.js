import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Form } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    fetchSetting,
    editSetting,
    fetchCacheClear,
    fetchState,
    backupDatabase,
} from "../../store/action/settingAction";
import { fetchAllCustomer } from "../../store/action/customerAction";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import ImagePicker from "../../shared/image-picker/ImagePicker";
import {
    getFormattedMessage,
    numValidate,
    numWithSpaceValidate,
    placeholderText,
} from "../../shared/sharedMethod";
import languages from "../../shared/option-lists/Language.json";
import sms from "../../shared/option-lists/Sms.json";
import ReactSelect from "../../shared/select/reactSelect";
import HeaderTitle from "../header/HeaderTitle";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import dateFormatOptions from "./dateFormatOptions.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDatabase,
    faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const Settings = (props) => {
    const {
        fetchSetting,
        fetchCacheClear,
        fetchAllCustomer,
        customers,
        fetchAllWarehouses,
        warehouses,
        editSetting,
        settings,
        fetchState,
        countryState,
        dateFormat,
        defaultCountry,
        backupDatabase
    } = props;

    const [settingValue, setSettingValue] = useState({
        email: "",
        logo: "",
        phone: "",
        developed: "",
        footer: "",
        default_language: "",
        default_customer: "",
        default_warehouse: "",
        warehouse_name: "",
        address: "",
        dateFormat: "",
        show_version_on_footer: "",
        add_stock_while_product_creation: "",
        show_app_name_in_sidebar: "",
        country: "",
        countries: "",
        state: "",
        postCode: "",
        date_format: "",
        enable_nepali_datepicker: false,
    });

    const [defaultDate, setDefaultDate] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState();
    const [byDefaultCountry, setByDefaultCountry] = useState(null);
    const [selectImg, setSelectImg] = useState(null);
    const [errors, setErrors] = useState({
        email: "",
        phone: "",
        developed: "",
        footer: "",
        default_language: "",
        default_customer: "",
        default_warehouse: "",
        warehouse_name: "",
        address: "",
        show_version_on_footer: "",
        add_stock_while_product_creation: "",
        show_app_name_in_sidebar: "",
        city: "",
        // postCode: '',
        country: "",
        date_format: "",
    });

    const [disable, setDisable] = React.useState(true);
    const [checked, setChecked] = useState(false);
    const [addStockChecked, setAddStockChecked] = useState(false);
    const [showAppName, setShowAppName] = useState(false);

    const newLanguages = languages.filter((language) => language.value);
    // const settings = useSelector((state) => state.settings)
    const [selectedLanguage] = useState(
        newLanguages
            ? [
                  {
                      label: newLanguages[0].label,
                      value: newLanguages[0].value,
                  },
              ]
            : null
    );

    const newSms = sms.filter((item) => item.value);
    const [selectedSms] = useState(
        newSms
            ? [
                  {
                      label: newSms[0].label,
                      value: newSms[0].values,
                  },
              ]
            : null
    );

    useEffect(() => {
        fetchSetting();
        fetchAllCustomer();
        fetchAllWarehouses();
    }, []);

    useEffect(() => {
        if (settings) {
            setSettingValue({
                email:
                    settings.attributes && settings.attributes.email
                        ? settings.attributes.email
                        : "",
                logo:
                    settings.attributes && settings.attributes.logo
                        ? settings.attributes.logo
                        : "",
                phone:
                    settings.attributes && settings.attributes.phone
                        ? settings.attributes.phone
                        : "",
                developed:
                    settings.attributes && settings.attributes.developed
                        ? settings.attributes.developed
                        : "",
                footer:
                    settings.attributes && settings.attributes.footer
                        ? settings.attributes.footer
                        : "",
                default_language:
                    settings.attributes && settings.attributes.default_language
                        ? settings.attributes.default_language
                        : "",
                default_customer:
                    settings.attributes && settings.attributes.default_customer
                        ? {
                              value: Number(
                                  settings.attributes.default_customer
                              ),
                              label: settings.attributes.customer_name,
                          }
                        : "",
                default_warehouse:
                    settings.attributes && settings.attributes.default_warehouse
                        ? {
                              value: Number(
                                  settings.attributes.default_warehouse
                              ),
                              label: settings.attributes.warehouse_name,
                          }
                        : "",
                warehouse_name:
                    settings.attributes && settings.attributes.warehouse_name
                        ? settings.attributes.warehouse_name
                        : "",
                address:
                    settings.attributes && settings.attributes.address
                        ? settings.attributes.address
                        : "",
                show_version_on_footer:
                    settings.attributes &&
                    settings.attributes.show_version_on_footer !== "1"
                        ? false
                        : true,
                add_stock_while_product_creation:
                    settings.attributes &&
                    settings.attributes.add_stock_while_product_creation !== "1"
                        ? false
                        : true,
                show_app_name_in_sidebar:
                    settings.attributes &&
                    settings.attributes.show_app_name_in_sidebar !== "1"
                        ? false
                        : true,
                city:
                    settings.attributes && settings.attributes.city
                        ? settings.attributes.city
                        : "",
                postCode:
                    settings.attributes && settings.attributes.postcode
                        ? settings.attributes.postcode
                        : "",
                countries:
                    settings.attributes &&
                    settings.attributes.countries &&
                    byDefaultCountry
                        ? {
                              value: byDefaultCountry.id,
                              label: byDefaultCountry.name,
                          }
                        : "",
                country:
                    settings.attributes && settings.attributes.country
                        ? {
                              value: settings.attributes.country,
                              label: settings.attributes.country,
                          }
                        : "",
                state:
                    settings.attributes && settings.attributes.country
                        ? {
                              value: settings.attributes.state,
                              label: settings.attributes.state,
                          }
                        : "",
                date_format:
                    settings.attributes &&
                    settings.attributes.date_format &&
                    defaultDate
                        ? { value: defaultDate.value, label: defaultDate.label }
                        : "",
                enable_nepali_datepicker:
                    settings.attributes &&
                    settings.attributes.enable_nepali_datepicker === "1"
                        ? true
                        : false,
            });
            if (
                settings.attributes &&
                settings.attributes.show_version_on_footer === "1"
            ) {
                setChecked(true);
            } else {
                setChecked(false);
            }
            if (
                settings.attributes &&
                settings.attributes.add_stock_while_product_creation === "1"
            ) {
                setAddStockChecked(true);
            } else {
                setAddStockChecked(false);
            }

            if (
                settings.attributes &&
                settings.attributes.show_app_name_in_sidebar === "1"
            ) {
                setShowAppName(true);
            } else {
                setShowAppName(false);
            }
        }
    }, [settings, defaultDate]);

    useEffect(() => {
        if (dateFormat) {
            const defaultDateFormat = dateFormat
                ? dateFormatOptions.filter((date) => date.value === dateFormat)
                : null;
            defaultDateFormat && setDefaultDate(defaultDateFormat[0]);
        }
    }, [dateFormat]);

    useEffect(() => {
        if (defaultCountry) {
            const countries =
                defaultCountry &&
                defaultCountry.countries &&
                defaultCountry.countries.filter(
                    (country) => country.name === defaultCountry.country
                );
            countries && setByDefaultCountry(countries[0]);
        }
    }, [defaultCountry]);

    useEffect(() => {
        byDefaultCountry && fetchState(byDefaultCountry && byDefaultCountry.id);
    }, [byDefaultCountry]);

    const [checkState, setCheckState] = useState(false);
    const [allState, setAllState] = useState(null);

    useEffect(() => {
        if (countryState.value) {
            setCheckState(true);
            setAllState(countryState);
        }
    }, [settings, countryState]);

    const stateOptions =
        checkState &&
        allState &&
        allState.value &&
        allState.value.map((item) => {
            return {
                id: item,
                name: item,
            };
        });

    const onLanguagesChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            default_language: obj,
        }));
    };

    const onSmsChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            sms_gateway: obj,
        }));
    };

    const onCustomerChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            default_customer: obj,
        }));
        setErrors("");
    };

    const onWarehouseChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            default_warehouse: obj,
        }));
        setErrors("");
    };

    const onCountryChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({ ...settingValue, country: obj }));
        setSettingValue((settingValue) => ({ ...settingValue, state: null }));
        fetchState(obj.value);
        setErrors("");
    };

    const onStateChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({ ...settingValue, state: obj }));
        setErrors("");
    };

    const handleImageChange = (e) => {
        e.preventDefault();
        setDisable(false);
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (
                file.type === "image/jpeg" ||
                file.type === "image/png" ||
                file.type === "image/svg+xml"
            ) {
                setSelectImg(file);
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    setImagePreviewUrl(fileReader.result);
                };
                if (file) {
                    fileReader.readAsDataURL(file);
                }
                setErrors("");
            }
        }
    };

    const handleChanged = (event, checkboxType) => {
        let checked = event.target.checked;
        setDisable(false);
        if (checkboxType === "version") {
            setChecked(checked);
            setSettingValue((settingValue) => ({
                ...settingValue,
                show_version_on_footer: checked,
            }));
        } else if (checkboxType === "add_stock") {
            setAddStockChecked(checked);
            setSettingValue((settingValue) => ({
                ...settingValue,
                add_stock_while_product_creation: checked,
            }));
        } else if (checkboxType === "appname") {
            setShowAppName(checked);
            setSettingValue((settingValue) => ({
                ...settingValue,
                show_app_name_in_sidebar: checked,
            }));
        }else if (checkboxType === "enable_nepali_datepicker") {
            setSettingValue((settingValue) => ({
                ...settingValue,
                enable_nepali_datepicker: checked,
            }));
        }
    };

    const onChangeInput = (event) => {
        event.preventDefault();
        setDisable(false);
        setSettingValue((inputs) => ({
            ...inputs,
            [event.target.name]: event.target.value,
        }));
        setErrors("");
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append("email", data.email);
        if (selectImg) {
            formData.append("logo", data.logo);
        }
        formData.append("phone", data.phone);
        formData.append("developed", data.developed);
        formData.append("footer", data.footer);
        if (data.default_language.value) {
            formData.append("default_language", data.default_language.value);
        } else {
            formData.append("default_language", data.default_language);
        }
        formData.append(
            "default_customer",
            data.default_customer.value
                ? data.default_customer.value
                : data.default_customer
        );
        formData.append(
            "default_warehouse",
            data.default_warehouse.value
                ? data.default_warehouse.value
                : data.default_warehouse
        );
        formData.append("address", data.address);
        formData.append(
            "show_version_on_footer",
            data.show_version_on_footer === true ? "1" : "0"
        );
        formData.append(
            "add_stock_while_product_creation",
            data.add_stock_while_product_creation === true ? "1" : "0"
        );
        formData.append(
            "show_app_name_in_sidebar",
            data.show_app_name_in_sidebar === true ? "1" : "0"
        );
        formData.append("city", data.city);
        formData.append("postcode", data.postCode);
        formData.append("country", data.country.label);
        formData.append("state", data.state.label);
        formData.append("date_format", data.date_format.value);
        formData.append(
            "enable_nepali_datepicker",
            data.enable_nepali_datepicker === true ? "1" : "0"
        );
        return formData;
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!settingValue["email"]) {
            errorss["email"] = getFormattedMessage(
                "globally.input.email.validate.label"
            );
        } else if (!settingValue["phone"]) {
            errorss["phone"] = getFormattedMessage(
                "settings.system-settings.input.company-phone.validate.label"
            );
        } else if (!settingValue["developed"]) {
            errorss["developed"] = getFormattedMessage(
                "settings.system-settings.input.developed-by.validate.label"
            );
        } else if (!settingValue["footer"]) {
            errorss["footer"] = getFormattedMessage(
                "settings.system-settings.input.footer.validate.label"
            );
        } else if (!settingValue["default_language"]) {
            errorss["default_language"] = getFormattedMessage(
                "settings.system-settings.select.default-language.validate.label"
            );
        } else if (!settingValue["default_customer"]) {
            errorss["default_customer"] = getFormattedMessage(
                "settings.system-settings.select.default-customer.validate.label"
            );
        } else if (!settingValue["default_warehouse"]) {
            errorss["default_warehouse"] = getFormattedMessage(
                "settings.system-settings.select.default-warehouse.validate.label"
            );
        } else if (!settingValue["address"]) {
            errorss["address"] = getFormattedMessage(
                "settings.system-settings.select.address.validate.label"
            );
        } else if (
            settingValue["address"] &&
            settingValue["address"].length > 150
        ) {
            errorss["address"] = getFormattedMessage(
                "settings.system-settings.select.address.valid.validate.label"
            );
        } else if (!settingValue["city"]) {
            errorss["city"] = getFormattedMessage(
                "settings.system-settings.input.footer.validate.label"
            );
        } else if (!settingValue["postCode"]) {
            errorss["postCode"] = getFormattedMessage(
                "settings.system-settings.select.postcode.validate.label"
            );
        }
        // else if (settingValue['postCode'].length > 8) {
        //     errorss['postCode'] = getFormattedMessage("settings.system-settings.select.postcode.validate.length.label");
        // }
        else if (!settingValue["country"]) {
            errorss["country"] = getFormattedMessage(
                "settings.system-settings.select.country.validate.label"
            );
        } else if (!settingValue["state"]) {
            errorss["state"] = getFormattedMessage(
                "settings.system-settings.select.state.validate.label"
            );
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onEdit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        settingValue.logo = selectImg;
        if (valid) {
            editSetting(prepareFormData(settingValue), true, setDefaultDate);
            setDisable(true);
        }
    };

    const onCacheClear = (event) => {
        event.preventDefault();
        fetchCacheClear();
    };

    const onDateFormatChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            date_format: obj,
        }));
        setDefaultDate(obj);
        setErrors("");
    };

    const renderBackupTooltip = (props) => (
        <Tooltip id="backup-tooltip" {...props}>
            {getFormattedMessage("globally.backup.database.info.message")}
        </Tooltip>
    );

    const onBackupDatabase = () => {
        backupDatabase();
    }

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("settings.title")} />
            <HeaderTitle
                title={getFormattedMessage("settings.system-settings.title")}
            />
            <>
                <div className="card">
                    <div className="card-body">
                        <Form>
                            <div className="row">
                                 <div className="col-lg-6 mb-3">
                                    <ImagePicker
                                        imageTitle={placeholderText(
                                            "globally.input.change-logo.tooltip"
                                        )}
                                        imagePreviewUrl={
                                            imagePreviewUrl
                                                ? imagePreviewUrl
                                                : settings.attributes &&
                                                  settings.attributes.logo
                                        }
                                        handleImageChange={handleImageChange}
                                    />
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "settings.system-settings.input.default-email.label"
                                        )}
                                        :
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "settings.system-settings.input.default-email.placeholder.label"
                                        )}
                                        name="email"
                                        value={settingValue.email}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["email"]
                                            ? errors["email"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "settings.system-settings.input.company-phone.label"
                                        )}
                                        :
                                    </label>
                                    <Form.Control
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "settings.system-settings.input.company-phone.placeholder.label"
                                        )}
                                        name="phone"
                                        min={0}
                                        value={settingValue.phone}
                                        onKeyPress={(event) =>
                                            numWithSpaceValidate(event)
                                        }
                                        onChange={onChangeInput}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["phone"]
                                            ? errors["phone"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "settings.system-settings.input.developed-by.label"
                                        )}
                                        :
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "settings.system-settings.input.developed-by.placeholder.label"
                                        )}
                                        name="developed"
                                        value={settingValue.developed}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["developed"]
                                            ? errors["developed"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "settings.system-settings.input.footer.label"
                                        )}
                                        :
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "settings.system-settings.input.footer.placeholder.label"
                                        )}
                                        name="footer"
                                        value={settingValue.footer}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["footer"]
                                            ? errors["footer"]
                                            : null}
                                    </span>
                                </div>
                                {/*<div className='col-lg-6'>*/}
                                {/*    <ReactSelect title={getFormattedMessage("settings.system-settings.select.default-language.label")} placeholder={placeholderText("settings.system-settings.select.default-language.placeholder.label")} defaultValue={selectedLanguage}*/}
                                {/*                 data={languages} onChange={onLanguagesChange} errors={errors['default_language']}/>*/}
                                {/*</div>*/}
                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        settingValue.default_customer && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "settings.system-settings.select.default-customer.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "settings.system-settings.select.default-customer.placeholder.label"
                                                )}
                                                defaultValue={
                                                    settings
                                                        ? settings.attributes &&
                                                          settingValue.default_customer
                                                        : ""
                                                }
                                                data={customers}
                                                onChange={onCustomerChange}
                                                errors={
                                                    errors["default_customer"]
                                                }
                                            />
                                        )}
                                </div>
                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        settingValue.default_warehouse && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "settings.system-settings.select.default-warehouse.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "settings.system-settings.select.default-warehouse.label"
                                                )}
                                                defaultValue={
                                                    settings
                                                        ? settings.attributes &&
                                                          settingValue.default_warehouse
                                                        : ""
                                                }
                                                data={warehouses}
                                                onChange={onWarehouseChange}
                                                errors={
                                                    errors["default_warehouse"]
                                                }
                                            />
                                        )}
                                </div>

                                {/* Country  */}
                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        byDefaultCountry && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "globally.input.country.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "globally.input.country.label"
                                                )}
                                                defaultValue={
                                                    settings &&
                                                    settings.attributes &&
                                                    byDefaultCountry
                                                        ? {
                                                              label: settingValue
                                                                  .country
                                                                  .label,
                                                              value: settingValue
                                                                  .country
                                                                  .value,
                                                          }
                                                        : ""
                                                }
                                                name="country"
                                                multiLanguageOption={
                                                    defaultCountry.countries
                                                        ? defaultCountry.countries
                                                        : []
                                                }
                                                onChange={onCountryChange}
                                                errors={errors["country"]}
                                            />
                                        )}
                                </div>
                                {/* state  */}
                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        stateOptions.length && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "setting.state.lable"
                                                )}
                                                placeholder={placeholderText(
                                                    "setting.state.lable"
                                                )}
                                                name="state"
                                                value={
                                                    settingValue &&
                                                    settingValue.state !== null
                                                        ? settingValue.state
                                                        : ""
                                                }
                                                multiLanguageOption={
                                                    stateOptions
                                                }
                                                onChange={onStateChange}
                                                errors={errors["state"]}
                                            />
                                        )}
                                </div>
                                {/* City  */}
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "globally.input.city.label"
                                        )}
                                        :
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "globally.input.city.label"
                                        )}
                                        name="city"
                                        value={settingValue.city}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["city"] ? errors["city"] : null}
                                    </span>
                                </div>
                                {/* POST code */}
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "setting.postCode.lable"
                                        )}
                                        :
                                    </label>
                                    <Form.Control
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "setting.postCode.lable"
                                        )}
                                        name="postCode"
                                        min={0}
                                        value={settingValue.postCode}
                                        onKeyPress={(event) => event}
                                        onChange={onChangeInput}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {/* {errors['postCode'] ? errors['postCode'] : null} */}
                                    </span>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        settings.attributes.date_format &&
                                        defaultDate &&
                                        settingValue.date_format && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "settings.system-settings.select.date-format.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "settings.system-settings.select.default-warehouse.label"
                                                )}
                                                value={defaultDate}
                                                defaultValue={
                                                    settings
                                                        ? settings.attributes &&
                                                          settingValue.date_format
                                                        : ""
                                                }
                                                data={dateFormatOptions}
                                                onChange={onDateFormatChange}
                                                errors={errors["date_format"]}
                                            />
                                        )}
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "globally.input.address.label"
                                        )}
                                        :
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder={placeholderText(
                                            "globally.input.address.placeholder.label"
                                        )}
                                        name="address"
                                        value={settingValue.address}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["address"]
                                            ? errors["address"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-lg-3 sm-col-6 d-flex align-items-center mb-3">
                                 <label className="form-check form-switch form-switch-lg flex-grow-1 ">
                                     <input
                                         type="checkbox"
                                         checked={
                                             settingValue.enable_nepali_datepicker
                                         }
                                         name="enable_nepali_datepicker"
                                         onChange={(event) =>
                                             handleChanged(
                                                 event,
                                                 "enable_nepali_datepicker"
                                             )
                                         }
                                         className="me-3 form-check-input cursor-pointer"
                                     />
                                     <div className="control__indicator" />{" "}
                                     {getFormattedMessage(
                                         "enable.nepali.title"
                                     )}
                                     </label>
                                 </div>
                                <div className="col-lg-3 mb-3">
                                    <div className="col-md-10 col-12">
                                        <label className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label">
                                            <input
                                                type="checkbox"
                                                name="show_version_on_footer"
                                                value={checked}
                                                checked={checked}
                                                onChange={(event) =>
                                                    handleChanged(
                                                        event,
                                                        "version"
                                                    )
                                                }
                                                className="me-3 form-check-input cursor-pointer"
                                            />
                                            <div className="control__indicator" />{" "}
                                            {getFormattedMessage(
                                                "settings.system-settings.select.default-version-footer.placeholder.label"
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="col-lg-3 mb-3">
                                    <div className="col-md-10 col-12">
                                        <label className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label">
                                            <input
                                                type="checkbox"
                                                name="add_stock_while_product_creation"
                                                value={addStockChecked}
                                                checked={addStockChecked}
                                                onChange={(event) =>
                                                    handleChanged(
                                                        event,
                                                        "add_stock"
                                                    )
                                                }
                                                className="me-3 form-check-input cursor-pointer"
                                            />
                                            <div className="control__indicator" />{" "}
                                            {getFormattedMessage(
                                                "add.stock.while.product.creation.title"
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* show app name inside bar */}
                                <div className="col-lg-3 mb-3">
                                    <div className="col-md-10 col-12">
                                        <label className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label">
                                            <input
                                                type="checkbox"
                                                name="show_app_name_in_sidebar"
                                                value={showAppName}
                                                checked={showAppName}
                                                onChange={(event) =>
                                                    handleChanged(
                                                        event,
                                                        "appname"
                                                    )
                                                }
                                                className="me-3 form-check-input cursor-pointer"
                                            />
                                            <div className="control__indicator" />{" "}
                                            {getFormattedMessage(
                                                "settings.system-settings.select.appname-sidebar.placeholder.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-warning me-2"
                                            type="button"
                                            onClick={onBackupDatabase}
                                        >
                                            <span className="me-2">
                                                <FontAwesomeIcon
                                                    icon={faDatabase}
                                                />
                                            </span>
                                            {getFormattedMessage(
                                                "globally.backup.database.title"
                                            )}
                                        </button>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={renderBackupTooltip}
                                        >
                                            <span className="cursor-pointer">
                                                <FontAwesomeIcon
                                                    icon={faQuestionCircle}
                                                />
                                            </span>
                                        </OverlayTrigger>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        disabled={disable}
                                        className="btn btn-primary mt-4"
                                        onClick={(event) => onEdit(event)}
                                    >
                                        {getFormattedMessage(
                                            "globally.save-btn"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>

                <div className="w-100 mx-auto pt-lg-10 pt-5">
                    <h4 className="mb-5">
                        {getFormattedMessage("settings.clear-cache.title")}
                    </h4>
                    <Form className="card card-body">
                        <div className="row">
                            <div>
                                <button
                                    className="btn btn-primary"
                                    onClick={(event) => onCacheClear(event)}
                                >
                                    {getFormattedMessage(
                                        "settings.clear-cache.title"
                                    )}
                                </button>
                            </div>
                        </div>
                    </Form>
                </div>
            </>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        customers,
        warehouses,
        settings,
        countryState,
        dateFormat,
        defaultCountry,
    } = state;
    return {
        customers,
        warehouses,
        settings,
        countryState,
        dateFormat,
        defaultCountry,
    };
};

export default connect(mapStateToProps, {
    fetchSetting,
    fetchCacheClear,
    fetchAllCustomer,
    fetchAllWarehouses,
    editSetting,
    fetchState,
    backupDatabase
})(Settings);
