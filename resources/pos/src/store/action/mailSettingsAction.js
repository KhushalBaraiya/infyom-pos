import apiConfig from '../../config/apiConfig';
import {
    apiBaseURL,
    settingActionType,
    toastType,
} from '../../constants';
import {addToast} from './toastAction';
import {setLoading} from "./loadingAction";
import {setSavingButton} from "./saveButtonAction";
import {getFormattedMessage} from "../../shared/sharedMethod";

export const fetchMailSettings = () => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig.get(apiBaseURL.MAIL_SETTINGS)
        .then((response) => {
            dispatch({type: settingActionType.FETCH_MAIL_SETTINGS, payload: response.data.data})
            dispatch(setLoading(false));
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
            dispatch(setLoading(false));
        });
};

export const editMailSettings = (mailSettings) => async (dispatch) => {
    dispatch(setSavingButton(true))
    apiConfig.post(apiBaseURL.MAIL_SETTINGS_UPDATE, mailSettings)
        .then((response) => {
            dispatch(addToast({text: getFormattedMessage('mail-settings.success.edit.message')}));
            dispatch({type: settingActionType.EDIT_MAIL_SETTINGS, payload: response.data.data});
            dispatch(setSavingButton(false))
        })
        .catch(({response}) => {
            dispatch(setSavingButton(false))
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
        });
};

export const fetchSendTestEmail = (setIsTestEmailDisabled) => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig.post(apiBaseURL.SEND_TEST_EMAIL)
        .then((response) => {
            dispatch(addToast({text: getFormattedMessage('send.test.email.success.message')}));
            dispatch(setLoading(false));
            setIsTestEmailDisabled(false);
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
            dispatch(setLoading(false));
        });
};
