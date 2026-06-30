import apiConfig from '../../config/apiConfig';
import { apiBaseURL, frontCmsActionType, toastType } from '../../constants';
import { addToast } from './toastAction';

export const fetchFrontCms = () => async (dispatch) => {
    apiConfig.get(apiBaseURL.FRONT_CMS)
        .then((response) => {
            dispatch({ type: frontCmsActionType.FETCH_FRONT_CMS, payload: response.data.data });
        })
        .catch(({ response }) => {
            dispatch(addToast(
                { text: response?.data?.message, type: toastType.ERROR }));
        });
}
