import {setLoading} from './loadingAction';
import apiConfig from '../../config/apiConfig';
import {apiBaseURL, purchaseActionType, toastType} from '../../constants';
import {addToast} from './toastAction';

export const purchaseDetailsAction = (purchaseId, type, singlePurchase, isLoading = true) => async (dispatch) => {
    const apiUrl =  apiBaseURL.PURCHASE_DETAILS
    if (isLoading) {
        dispatch(setLoading(true))
    }
    apiConfig.get(apiUrl + '/' + purchaseId, singlePurchase)
        .then((response) => {
            dispatch({type: purchaseActionType.PURCHASE_DETAILS, payload: response.data.data})
            if (isLoading) {
                dispatch(setLoading(false))
            }
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
        });
};
