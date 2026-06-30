import apiConfig from "../../config/apiConfig";
import { apiBaseURL, dualScreenSettingActionType, toastType } from "../../constants";
import { setLoading } from "./loadingAction";
import { addToast } from "./toastAction";


export const fetchDualScreenSetting =
    (isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(apiBaseURL.DUAL_SCREEN_SETTINGS)
                .then((response) => {
                    dispatch({
                        type: dualScreenSettingActionType.FETCH_DUAL_SETTING,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    dispatch(
                        addToast({
                            text: response.data.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const editDualScreenSetting = (data) => (dispatch) => {
    apiConfig
        .post(apiBaseURL.DUAL_SCREEN_SETTINGS_UPDATE, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
        })
        .catch(({ response }) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                    type: toastType.ERROR,
                })
            );
        });
};