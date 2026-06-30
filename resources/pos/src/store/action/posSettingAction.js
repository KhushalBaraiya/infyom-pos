import apiConfig from "../../config/apiConfig";
import { apiBaseURL, posSettingActionType, toastType } from "../../constants";
import { setLoading } from "./loadingAction";
import { addToast } from "./toastAction";


export const fetchPosSetting =
    (isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.POS_SETTINGS;

            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: posSettingActionType.FETCH_POS_SETTING,
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


export const editPosSetting = (data) => (dispatch) => {
    apiConfig
        .post(apiBaseURL.POS_SETTINGS + '/update', data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response.data.message,
                    type: toastType.ADD_TOAST,
                })
            );
            // dispatch({
            //     type: posSettingActionType.EDIT_POS_SETTINGS,
            //     payload: response.data.data,
            // });
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