import { useEffect, useState } from "react";
import { Form } from "react-bootstrap-v5";
import { connect } from "react-redux";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import ReactSelect from "../../shared/select/reactSelect";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchCurrencies } from "../../store/action/currencyAction";
import { editSetting, fetchSetting } from "../../store/action/settingAction";
import HeaderTitle from "../header/HeaderTitle";
import MasterLayout from "../MasterLayout";
import {
    decimalPlacesOptions,
    decimalSeparatorOptions,
    thousandsSeparatorOptions,
} from "../../constants";

const CurrencySettings = ({
    fetchSetting,
    fetchCurrencies,
    editSetting,
    currencies,
    settings,
}) => {
    const [settingValue, setSettingValue] = useState({
        currency: null,
        decimal_places: null,
        thousands_separator: null,
        decimal_separator: null,
        currency_icon_right_side: false,
    });
    const [errors, setErrors] = useState({});
    const [disable, setDisable] = useState(true);

    // Load settings and currencies on mount
    useEffect(() => {
        fetchSetting();
        fetchCurrencies();
    }, []);

    // Set default values once settings load
    useEffect(() => {
        if (!settings?.attributes) return;

        const { attributes } = settings;

        setSettingValue({
            currency: attributes.currency
                ? {
                      value: Number(attributes.currency),
                      label: attributes.currency_symbol,
                  }
                : null,
            decimal_places:
                decimalPlacesOptions.find(
                    (item) => item.value === Number(attributes.decimal_places)
                ) || (Number(attributes.decimal_places) == 0 ? decimalPlacesOptions.find(item => item.value === 0) : null),
            thousands_separator:
                thousandsSeparatorOptions.find(
                    (item) =>
                        item.value === Number(attributes.thousands_separator)
                ) || (Number(attributes.thousands_separator) == 0 ? thousandsSeparatorOptions.find(item => item.value === 0) : null),
            decimal_separator:
                decimalSeparatorOptions.find(
                    (item) =>
                        item.value === Number(attributes.decimal_separator)
                ) || (Number(attributes.decimal_separator) === 0 ? decimalSeparatorOptions.find(item => item.value === 0) : null),
            currency_icon_right_side: attributes.is_currency_right === "true" || attributes.is_currency_right == "1",
        });
    }, [settings]);

    const updateField = (name, value) => {
        setDisable(false);
        setSettingValue((prev) => ({ ...prev, [name]: value !== undefined ? value : null }));
        setErrors({});
    };

    const renderSelect = (title, name, options) => (
        <div className="mb-3">
            <ReactSelect
                title={getFormattedMessage(title)}
                placeholder={placeholderText(title)}
                defaultValue={settingValue[name]}
                data={options}
                onChange={(obj) => updateField(name, obj)}
                errors={errors[name]}
                value={settingValue[name] !== null && settingValue[name] !== undefined ? settingValue[name] : null}
            />
        </div>
    );

    const prepareFormData = () => {
        const data = {
            currency: settingValue.currency?.value || "",
            decimal_places: settingValue.decimal_places?.value || 0,
            thousands_separator: settingValue.thousands_separator?.value || "",
            decimal_separator: settingValue.decimal_separator?.value || "",
            is_currency_right: settingValue.currency_icon_right_side
        };
        return data;
    };

    const handleValidation = () => {
        const newErrors = {};
        if (!settingValue.currency || !settingValue.currency.value) newErrors.currency = "Currency is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onEdit = (event) => {
        event.preventDefault();
        if (!handleValidation()) return;
        editSetting(prepareFormData(), true);
        setDisable(true);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("currency-settings.title")} />
            <HeaderTitle
                title={getFormattedMessage("currency-settings.title")}
            />

            <div className="card">
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-lg-6">
                                {/* LEFT COLUMN */}
                                {settings &&
                                    renderSelect(
                                        "settings.system-settings.select.default-currency.label",
                                        "currency",
                                        currencies
                                    )}

                                {renderSelect(
                                    "thousands-separator.title",
                                    "thousands_separator",
                                    thousandsSeparatorOptions
                                )}
                            </div>

                            <div className="col-lg-6">
                                {/* RIGHT COLUMN */}
                                {renderSelect(
                                    "decimal-places.title",
                                    "decimal_places",
                                    decimalPlacesOptions
                                )}

                                {renderSelect(
                                    "decimal-separator.title",
                                    "decimal_separator",
                                    decimalSeparatorOptions
                                )}
                            </div>
                        </div>

                        {/* CURRENCY ICON RIGHT SIDE SWITCH */}
                        <div className="mt-3">
                            <div>
                                {getFormattedMessage(
                                    "currency.icon.right.side.lable"
                                )}
                            </div>
                            <div className="d-flex align-items-center mt-2">
                                <label className="form-check form-switch form-switch-sm">
                                    <input
                                        type="checkbox"
                                        checked={
                                            settingValue.currency_icon_right_side
                                        }
                                        name="currency_icon_right_side"
                                        onChange={(event) =>
                                            updateField(
                                                "currency_icon_right_side",
                                                event.target.checked
                                            )
                                        }
                                        className="me-3 form-check-input cursor-pointer"
                                    />
                                    <div className="control__indicator" />
                                </label>
                                <span
                                    className="switch-slider"
                                    data-checked="✓"
                                    data-unchecked="✕"
                                >
                                    {errors["currency_icon_right_side"]
                                        ? errors["currency_icon_right_side"]
                                        : null}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h6 className="mb-2">
                                {getFormattedMessage(
                                    "currency.preview.label"
                                ) || "Preview"}
                            </h6>

                            <div className="border rounded p-3 bg-light fw-bold fs-5">
                                {(() => {
                                    // Static sample number for preview
                                    const sample = 12345.67;

                                    const config = {
                                        decimal_places:
                                            settingValue.decimal_places?.value,
                                        decimal_separator:
                                            settingValue.decimal_separator
                                                ?.value,
                                        thousands_separator:
                                            settingValue.thousands_separator
                                                ?.value,
                                        is_currency_right:
                                            settingValue.currency_icon_right_side == "1"
                                                ? "true"
                                                : "false",
                                    };

                                    const currency =
                                        settingValue.currency?.label || "";

                                    return currencySymbolHandling(
                                        config,
                                        currency,
                                        sample,
                                        false
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="row mt-4">
                            <div className="col-lg-12">
                                <button
                                    disabled={disable}
                                    className="btn btn-primary"
                                    onClick={onEdit}
                                >
                                    {getFormattedMessage("globally.save-btn")}
                                </button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => ({
    settings: state.settings,
    currencies: state.currencies,
});

export default connect(mapStateToProps, {
    fetchSetting,
    fetchCurrencies,
    editSetting,
})(CurrencySettings);
