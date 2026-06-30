import { apiBaseURL, fieldConfigurationActionType, toastType } from '../../constants';
import apiConfig from '../../config/apiConfig';
import { addToast } from './toastAction';

export const fetchFieldConfiguration = () => async (dispatch) => {
    apiConfig.get(apiBaseURL.FIELD_CONFIGURATION)
        .then((response) => {
            dispatch({ 
                type: fieldConfigurationActionType.FETCH_FIELD_CONFIGURATION, 
                payload: response.data.data?.value || response.data.data 
            });
        })
        .catch((response) => {
            dispatch(addToast(
                { text: response.response?.data?.message, type: toastType.ERROR }
            ));
        });
};

export const updateFieldConfiguration = (fieldConfigData) => async (dispatch) => {
    apiConfig.post(apiBaseURL.FIELD_CONFIGURATION, fieldConfigData)
        .then((response) => {
            dispatch(addToast(
                { text: response.data.message, type: toastType.SUCCESS }
            ));
        })
        .catch((response) => {
            dispatch(addToast(
                { text: response.response?.data?.message, type: toastType.ERROR }
            ));
        });
};