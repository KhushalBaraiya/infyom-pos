import React, { useEffect, useState } from 'react'
import MasterLayout from '../MasterLayout'
import TopProgressBar from '../../shared/components/loaders/TopProgressBar'
import TabTitle from '../../shared/tab-title/TabTitle'
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod'
import HeaderTitle from '../header/HeaderTitle'
import { useDispatch, useSelector } from 'react-redux'
import { editDualScreenSetting, fetchDualScreenSetting } from '../../store/action/dualScreenAction'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle, faTrash } from '@fortawesome/free-solid-svg-icons'
import { addToast } from '../../store/action/toastAction'
import { toastType } from '../../constants'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

const DualScreenSetting = () => {
    const dispatch = useDispatch();
    const { dualScreenSetting } = useSelector((state) => state);
    const [disable, setDisable] = useState(true);
    const [dualSettingValue, setDualSettingValue] = useState({
        display_header: "",
        image: []
    });

    const [errors, setErrors] = useState({
        display_header: "",
    });

    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

    useEffect(() => {
        setDualSettingValue({
            display_header: dualScreenSetting?.attributes?.dual_screen_header_text || "",
            images: dualScreenSetting?.attributes?.dual_screen_images ? dualScreenSetting?.attributes?.dual_screen_images : []
        });
        setImagePreviewUrls(dualScreenSetting?.attributes?.dual_screen_images ? dualScreenSetting?.attributes?.dual_screen_images : []);
    }, [dualScreenSetting]);

    useEffect(() => {
        dispatch(fetchDualScreenSetting());
    }, []);

    const onChangeInput = (event) => {
        event.preventDefault();
        setDisable(false);
        setDualSettingValue((inputs) => ({
            ...inputs,
            [event.target.name]: event.target.value,
        }));
        setErrors("");
    };

    const handleMultipleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = [];
        const validFiles = [];

        files.forEach((file) => {
            if (["image/jpeg", "image/webp", "image/png", "image/svg+xml"].includes(file.type)) {
                validFiles.push(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviewUrls((prev) => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            }
        });

        setDualSettingValue((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...validFiles],
        }));

        setDisable(false);
        setErrors("");
    };

    const handleDeleteImage = (index) => {
        const updatedPreviews = [...imagePreviewUrls];
        const updatedFiles = [...dualSettingValue.images];
        updatedPreviews.splice(index, 1);
        updatedFiles.splice(index, 1);

        setImagePreviewUrls(updatedPreviews && updatedPreviews);
        setDualSettingValue((prev) => ({
            ...prev,
            images: updatedFiles && updatedFiles
        }));
        setDisable(false);
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append("dual_screen_header_text", data.display_header);
        data.images.forEach((file, index) => {
            formData.append(`image${index + 1}`, file);
        });

        return formData;
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!dualSettingValue["display_header"]) {
            errorss["display_header"] = getFormattedMessage(
                "please.enter.display.header.title"
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
        if (valid) {
            if(imagePreviewUrls?.length > 5){
                dispatch(
                    addToast({
                        text: getFormattedMessage("validation.you.can.upload.maximum.images"),
                        type: toastType.ERROR,
                    })
                );
            } else {
                dispatch(editDualScreenSetting(prepareFormData(dualSettingValue)));
                setDisable(true);
            }
        }
    };

    const renderTooltip = () => (
        <Tooltip id="button-tooltip" >
            {getFormattedMessage("upload.maximum.images")}
        </Tooltip>
    );

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("dual.screen.settings.title")} />
            <TopProgressBar />
            <HeaderTitle
                title={getFormattedMessage("dual.screen.settings.title")}
            />
            <div className='card'>
                <div className='card-body'>
                    <div className='row'>
                        <div className="col-lg-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("dual.screen.display.header.title")} :
                            </label>
                            <span className="required" />
                            <input
                                type="text"
                                className="form-control"
                                placeholder={placeholderText("dual.screen.display.header.placeholder.title")}
                                name="display_header"
                                value={dualSettingValue.display_header}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["display_header"]
                                    ? errors["display_header"]
                                    : null}
                            </span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6 mb-3">
                            <label className="form-label">
                                {placeholderText("carousel.image.title")} :
                                <OverlayTrigger
                                    placement="top"
                                    overlay={renderTooltip()}
                                >
                                    <span>
                                        <FontAwesomeIcon
                                            className="ms-1"
                                            icon={faQuestionCircle}
                                        />
                                    </span>
                                </OverlayTrigger>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleMultipleImageChange}
                                className="form-control"
                                disabled={imagePreviewUrls?.length >= 5}
                            />
                        </div>

                        <div className="d-flex gap-10">
                            <div className="row row-cols-auto gx-10">
                                {imagePreviewUrls?.map((url, index) => (
                                    <div className="col mb-3" key={index}> 
                                        <div className="position-relative">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="img-thumbnail"
                                                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-sm text-danger position-absolute top-0 end-2"
                                                onClick={() => handleDeleteImage(index)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                    <div>
                        <button
                            disabled={disable}
                            className="btn btn-primary mt-4"
                            onClick={(event) => onEdit(event)}
                        >
                            {getFormattedMessage("globally.save-btn")}
                        </button>
                    </div>
                </div>
            </div>
        </MasterLayout>
    )
}

export default DualScreenSetting