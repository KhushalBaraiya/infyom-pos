import axiosApi from "../../config/apiConfig";
import {  toastType, walletActionType } from "../../constants";
import { addToast } from "./toastAction";

export const fetchSingleWalletTransaction = (id) => async (dispatch) => {
    await axiosApi.get(`wallet/transactions/${id}`)
        .then((response) => {
            dispatch({
                type: walletActionType.FETCH_SINGLE_WALLET_TRANSACTION,
                payload: response.data.data 
            });
        })
        .catch(({ response }) => {
            dispatch(addToast({ 
                text: response?.data?.message || "Failed to fetch wallet transaction", 
                type: toastType.ERROR 
            }));
        });
};