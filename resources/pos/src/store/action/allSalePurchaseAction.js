import apiConfig from "../../config/apiConfig";
import { apiBaseURL, dashboardActionType, toastType } from "../../constants";
import { addToast } from "./toastAction";
import { setLoading } from "./loadingAction";
import requestParam from "../../shared/requestParam";

export const fetchAllSalePurchaseCount = (filter) => async (dispatch) => {

    dispatch(setLoading(true));
    let url = apiBaseURL.ALL_SALE_PURCHASE
    if (
        !_.isEmpty(filter)
    ) {
        url += requestParam(filter, null, null, null, url);
    }
    apiConfig
        .get(url)
        .then((response) => {
            dispatch({
                type: dashboardActionType.FETCH_ALL_SALE_PURCHASE,
                payload: response.data.data,
            });
            dispatch(setLoading(false));
        })
        .catch((response) => {
            dispatch(
                addToast({
                    text: response.response.data.message,
                    type: toastType.ERROR,
                })
            );
            dispatch(setLoading(false));
        });
};

export const fetchCustomerPurchaseCount = () => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig
        .get(apiBaseURL.CUSTOMERS_PURCHASE)
        .then((response) => {
            dispatch({
                type: dashboardActionType.CUSTOMERS_PURCHASE,
                payload: response.data.data,
            });
            dispatch(setLoading(false));
        })
        .catch((response) => {
            dispatch(
                addToast({
                    text: response.response.data.message,
                    type: toastType.ERROR,
                })
            );
            dispatch(setLoading(false));
        });
};
