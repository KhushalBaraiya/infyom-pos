import apiConfig from "../../config/apiConfig";
import { apiBaseURL, toastType } from "../../constants";
import { addToast } from "./toastAction";



export const changePasswordAdmin = (data, handleClose) => async (dispatch) => {
    await apiConfig
        .post( apiBaseURL.CHANGE_USER_PASSWORD, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response.data.message,
                })
            );
            handleClose();
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};