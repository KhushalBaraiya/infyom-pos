import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import MasterLayout from "../MasterLayout";
import { fetchSmsApiSetting, updateSmsApiSetting } from '../../store/action/SmsApiAction';
import TabTitle from "../../shared/tab-title/TabTitle";
import { Button, Col, Form, Row } from 'react-bootstrap-v5';
import HeaderTitle from '../header/HeaderTitle';

const SmsApi = (props) => {
    const { smsApiData, fetchSmsApiSetting, updateSmsApiSetting } = props;
    const [isTwilioEnabled, setIsTwilioEnabled] = useState(false);
    const [isVonageEnabled, setIsVonageEnabled] = useState(false);
    const [formValues, setFormValues] = useState({
        twilio_sid: "",
        twilio_token: "",
        twilio_from: "",
        vonage_api_key: "",
        vonage_api_secret: "",
    })

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchSmsApiSetting();
    }, [fetchSmsApiSetting]);

    useEffect(() => {
        if (smsApiData && smsApiData.attributes) {
            // Convert the attributes array to an object for easier access
            const attributesObj = {};
            smsApiData.attributes.forEach(attr => {
                attributesObj[attr.key] = attr.value;
            });
            
            setFormValues({
                twilio_sid: attributesObj.twilio_sid || "",
                twilio_token: attributesObj.twilio_token || "",
                twilio_from: attributesObj.twilio_from || "",
                vonage_api_key: attributesObj.vonage_api_key || "",
                vonage_api_secret: attributesObj.vonage_api_secret || "",
            });
            setIsTwilioEnabled(attributesObj.is_twilio == "1" || attributesObj.is_twilio == true);
            // setIsVonageEnabled(attributesObj.is_vonage == "1" || attributesObj.is_vonage == true);
        }
    }, [smsApiData]);

    const handleToggle = (value) => {
        if (value === 'twilio') {
            setIsTwilioEnabled(!isTwilioEnabled);
            // Disable Vomage when Twilio is enabled
            if (!isTwilioEnabled) {
                setIsVonageEnabled(false);
            }
        } else if (value === 'vonage') {
            setIsVonageEnabled(!isVonageEnabled);
            // Disable Twilio when Vonage is enabled
            if (!isVonageEnabled) {
                setIsTwilioEnabled(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;

        if (isTwilioEnabled) {
            if (!formValues.twilio_sid) {
                errorss["twilio_sid"] = getFormattedMessage(
                    "twilio.sid.validate.title"
                );
                isValid = false;
            }
            if (!formValues.twilio_token) {
                errorss["twilio_token"] = getFormattedMessage(
                    "twilio.token.validate.title"
                );
                isValid = false;
            }
            if (!formValues.twilio_from) {
                errorss["twilio_from"] = getFormattedMessage(
                    "twilio.from.validate.title"
                );
                isValid = false;
            }
        }

        if (isVonageEnabled) {
            if (!formValues.vonage_api_key) {
                errorss["vonage_api_key"] = getFormattedMessage(
                    "vonage.api.key.validate.title"
                );
                isValid = false;
            }
            if (!formValues.vonage_api_secret) {
                errorss["vonage_api_secret"] = getFormattedMessage(
                    "vonage.api.secret.validate.title"
                );
                isValid = false;
            }
        }

        setErrors(errorss);
        return isValid;
    };

    const prepareFormData = (data) => {
        const smsData = [
            { key: "is_twilio", value: isTwilioEnabled ? "1" : "0" },
            { key: "twilio_sid", value: data.twilio_sid },
            { key: "twilio_token", value: data.twilio_token },
            { key: "twilio_from", value: data.twilio_from },
            { key: "is_vonage", value: isVonageEnabled ? "1" : "0" },
            { key: "vonage_api_key", value: data.vonage_api_key },
            { key: "vonage_api_secret", value: data.vonage_api_secret },
        ];

        const formData = new FormData();
        formData.append("sms_data", JSON.stringify(smsData)); // backend expects sms_data array

        return formData;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = handleValidation();
        if (isValid) {
            updateSmsApiSetting(prepareFormData(formValues));
        }
    };

    return (
        <MasterLayout>
            <TabTitle title={placeholderText('sms-api.title')} />
            <HeaderTitle
                title={getFormattedMessage("sms-api.configuration.title")}
            />
            <div className='card'>
                <div className='card-body'>
                    <div className="w-100">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group
                                className="mb-3"
                                controlId="twilioToggle"
                            >
                                <Form.Check
                                    type="switch"
                                    label={getFormattedMessage("twilio.title")}
                                    checked={isTwilioEnabled}
                                    onChange={() => handleToggle('twilio')}
                                />
                            </Form.Group>
                            
                            {/* <Form.Group
                                className="mb-3"
                                controlId="vonageToggle"
                            >
                                <Form.Check
                                    type="switch"
                                    label={getFormattedMessage("vonage.title")}
                                    checked={isVonageEnabled}
                                    onChange={() => handleToggle('vonage')}
                                />
                            </Form.Group> */}
                            
                            {isTwilioEnabled && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="twilio_sid">
                                            <label className="form-label">
                                                {getFormattedMessage("twilio.sid.title")}:
                                            </label>
                                            <span className="required" />
                                            <Form.Control
                                                type="text"
                                                name="twilio_sid"
                                                value={formValues.twilio_sid}
                                                onChange={handleInputChange}
                                                placeholder={placeholderText("twilio.sid.title")}
                                            />
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {
                                                    errors["twilio_sid"]
                                                }
                                            </span>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="twilio_token">
                                            <label className="form-label">
                                                {getFormattedMessage("twilio.token.title")}:
                                            </label>
                                            <span className="required" />
                                            <Form.Control
                                                type="text"
                                                name="twilio_token"
                                                value={formValues.twilio_token}
                                                onChange={handleInputChange}
                                                placeholder={placeholderText("twilio.token.title")}
                                            />
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {
                                                    errors["twilio_token"]
                                                }
                                            </span>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="twilio_from">
                                            <label className="form-label">
                                                {getFormattedMessage("twilio.from.title")}:
                                            </label>
                                            <span className="required" />
                                            <Form.Control
                                                type="text"
                                                name="twilio_from"
                                                value={formValues.twilio_from}
                                                onChange={handleInputChange}
                                                placeholder={placeholderText("twilio.from.title")}
                                            />
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {
                                                    errors["twilio_from"]
                                                }
                                            </span>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            {isVonageEnabled && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="vonage_api_key">
                                            <label className="form-label">
                                                {getFormattedMessage("vonage.api.key.title")}:
                                            </label>
                                            <span className="required" />
                                            <Form.Control
                                                type="text"
                                                name="vonage_api_key"
                                                value={formValues.vonage_api_key}
                                                onChange={handleInputChange}
                                                placeholder={placeholderText("vonage.api.key.title")}
                                            />
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {
                                                    errors["vonage_api_key"]
                                                }
                                            </span>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="vonage_api_secret">
                                            <label className="form-label">
                                                {getFormattedMessage("vonage.api.secret.title")}:
                                            </label>
                                            <span className="required" />
                                            <Form.Control
                                                type="text"
                                                name="vonage_api_secret"
                                                value={formValues.vonage_api_secret}
                                                onChange={handleInputChange}
                                                placeholder={placeholderText("vonage.api.secret.title")}
                                            />
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {
                                                    errors["vonage_api_secret"]
                                                }
                                            </span>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            <Button
                                variant="primary"
                                className="mt-4"
                                type="submit"
                            >
                                {getFormattedMessage(
                                    "globally.save-btn"
                                )}
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </MasterLayout>
    )
};


const mapStateToProps = (state) => {
    const { isLoading, smsApiData } = state;
    return { isLoading, smsApiData }
};


export default connect(mapStateToProps, { fetchSmsApiSetting, updateSmsApiSetting })(SmsApi);