import React, { useState, useEffect } from "react";
import MasterLayout from "../MasterLayout";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import TabTitle from "../../shared/tab-title/TabTitle";
import HeaderTitle from "../header/HeaderTitle";
import { Table } from "react-bootstrap-v5";
import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faUser } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchFieldConfiguration,
    updateFieldConfiguration,
} from "../../store/action/fieldConfigurationAction";

export default function FieldConfiguration() {
    const dispatch = useDispatch();
    const fieldConfiguration = useSelector((state) => state.fieldConfiguration);

    const [fields, setFields] = useState({
        Customer: {
            inputFields: [
                {
                    name: "customer_email_required",
                    label: placeholderText("globally.input.email.label"),
                    value: true,
                },
                {
                    name: "customer_phone_number_required",
                    label: placeholderText("globally.input.phone-number.label"),
                    value: true,
                },
                {
                    name: "customer_country_required",
                    label: placeholderText("globally.input.country.label"),
                    value: true,
                },
                {
                    name: "customer_city_required",
                    label: placeholderText("globally.input.city.label"),
                    value: true,
                },
                {
                    name: "customer_dob_required",
                    label: placeholderText("DOB.input.label"),
                    value: true,
                },
                {
                    name: "customer_address_required",
                    label: placeholderText("globally.input.address.label"),
                    value: true,
                },
            ],
            description: placeholderText(
                "field-configration-description-customer"
            ),
            icon: faUser,
        },
        Supplier: {
            inputFields: [
                {
                    name: "supplier_email_required",
                    label: placeholderText("globally.input.email.label"),
                    value: true,
                },
                {
                    name: "supplier_phone_number_required",
                    label: placeholderText("globally.input.phone-number.label"),
                    value: true,
                },
                {
                    name: "supplier_country_required",
                    label: placeholderText("globally.input.country.label"),
                    value: true,
                },
                {
                    name: "supplier_city_required",
                    label: placeholderText("globally.input.city.label"),
                    value: true,
                },
                {
                    name: "supplier_address_required",
                    label: placeholderText("globally.input.address.label"),
                    value: true,
                },
            ],
            description: placeholderText(
                "field-configration-description-supplier"
            ),
            icon: faTruck,
        },
    });

    useEffect(() => {
        dispatch(fetchFieldConfiguration());
    }, [dispatch]);

    useEffect(() => {
        if (fieldConfiguration && Object.keys(fieldConfiguration).length > 0) {
            setFields((prev) => {
                const updatedFields = { ...prev };

                // Update Customer fields
                updatedFields.Customer.inputFields =
                    updatedFields.Customer.inputFields.map((field) => ({
                        ...field,
                        value:
                            fieldConfiguration[field.name] == 1 ||
                            fieldConfiguration[field.name] === true,
                    }));

                // Update Supplier fields
                updatedFields.Supplier.inputFields =
                    updatedFields.Supplier.inputFields.map((field) => ({
                        ...field,
                        value:
                            fieldConfiguration[field.name] == 1 ||
                            fieldConfiguration[field.name] === true,
                    }));

                return updatedFields;
            });
        }
    }, [fieldConfiguration]);

    const handleCheckboxChange = (currentValue, role, i) => {
        setFields((prev) => ({
            ...prev,
            [role]: {
                ...prev[role],
                inputFields: prev[role].inputFields.map((item, index) =>
                    index === i ? { ...item, value: !currentValue } : item
                ),
            },
        }));
    };

    const handleSubmit = () => {
        const payload = {};

        // Prepare payload for Customer fields
        fields.Customer.inputFields.forEach((field) => {
            payload[field.name] = field.value ? 1 : 0;
        });

        // Prepare payload for Supplier fields
        fields.Supplier.inputFields.forEach((field) => {
            payload[field.name] = field.value ? 1 : 0;
        });

        dispatch(updateFieldConfiguration(payload));
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("field-configration.title")} />
            <HeaderTitle
                title={getFormattedMessage("field-configration.title")}
            />
            <p className="page-description text-secondary fs-6">
                {getFormattedMessage("field-configration-description")}
            </p>

            <div className="container-fluid p-0 mt-4">
                <div className="d-flex flex-md-row flex-column  gap-2 position-relative">
                    {Object.keys(fields).map((field) => {
                        return (
                            <div className="FielSet bg-white col rounded-3 p-4 py-5 pb-18">
                                <div className="FieldSet-details gap-2 d-flex align-items-center">
                                    <div
                                        className="p-3 rounded-3"
                                        style={{
                                            backgroundColor: "#eef2ff",
                                            color: "#6366f1",
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={fields[field].icon}
                                            size="2xl"
                                        />
                                    </div>
                                    <div className="d-flex flex-column">
                                        <div className="fs-3 fw-900">
                                            {field == "Customer"
                                                ? placeholderText(
                                                      "customer.title"
                                                  )
                                                : placeholderText(
                                                      "supplier.title"
                                                  )}
                                        </div>
                                        <div className="text-secondary">
                                            {fields[field]?.description}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Table className="mt-5 border border-1 rounded-3">
                                        <thead className="rounded-t-3">
                                            <tr>
                                                <th className="fw-bold border px-3 text-start border-e-1 rounded-t-3">
                                                    {getFormattedMessage(
                                                        "field-configration-field-type"
                                                    )}
                                                </th>
                                                <th className="fw-bold border text-center border-e-1">
                                                    {getFormattedMessage(
                                                        "field-configration-required.title"
                                                    )}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="p-0">
                                            {fields[field]?.inputFields?.map(
                                                (element, i) => {
                                                    return (
                                                        <tr className="p-0">
                                                            <td
                                                                className="px-3 py-2 text-start fw-bold border border-e-1"
                                                                style={{
                                                                    width: "85%",
                                                                }}
                                                            >
                                                                {element.label}
                                                            </td>
                                                            <td className="d-flex align-items-center">
                                                                <label
                                                                    className="form-check form-switch form-switch-sm d-flex justify-content-center"
                                                                    style={{
                                                                        width: "100px",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        name="Currency_icon_Right_side"
                                                                        checked={
                                                                            element.value
                                                                        }
                                                                        className=" form-check-input cursor-pointer"
                                                                        style={{
                                                                            width: "85%",
                                                                        }}
                                                                        onChange={() => {
                                                                            handleCheckboxChange(
                                                                                element.value,
                                                                                field,
                                                                                i
                                                                            );
                                                                        }}
                                                                    />
                                                                </label>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        );
                    })}
                    <div
                        className="py-3 bg-white position-absolute text-center bottom-0 rounded-3"
                        style={{ width: "100%" }}
                    >
                        <button
                            className="px-9 py-2 bg-primary text-white border-0 rounded-2"
                            onClick={handleSubmit}
                        >
                            {placeholderText("globally.save-btn")}
                        </button>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
}
