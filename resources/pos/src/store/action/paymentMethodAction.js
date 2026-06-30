import apiConfig from "../../config/apiConfig";
import { apiBaseURL, paymentMethodActionType, toastType } from "../../constants";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { setLoading } from "./loadingAction";
import { addToast } from "./toastAction";
import { addInToTotalRecord, removeFromTotalRecord, setTotalRecord } from "./totalRecordAction";

export const fetchPaymentMethods =
    (isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.PAYMENT_METHOD + "?page[size]=0";

            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: paymentMethodActionType.FETCH_PAYMENT_METHOD,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        setTotalRecord(
                            response.data.meta.total !== undefined &&
                                response.data.meta.total >= 0
                                ? response.data.meta.total
                                : response.data.data.total
                        )
                    );
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

export const addPaymentMethod = (data, handleClose, clearData) => (dispatch) => {
    apiConfig
        .post(apiBaseURL.PAYMENT_METHOD, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("payment.method.save.success.message"),
                })
            );
            dispatch({
                type: paymentMethodActionType.ADD_PAYMENT_METHOD,
                payload: response.data.data,
            });
            handleClose();
            clearData();
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

export const editPaymentMethod =
    (data, id, handleClose, clearData) => async (dispatch) => {
        apiConfig
            .post(apiBaseURL.PAYMENT_METHOD + "/" + id, data)
            .then((response) => {
                dispatch({
                    type: paymentMethodActionType.EDIT_PAYMENT_METHOD,
                    payload: response.data.data,
                });
                dispatch(
                    addToast({
                        text: getFormattedMessage("payment.method.edit.success.message"),
                    })
                );
                dispatch(addInToTotalRecord(1));
                handleClose();
                clearData();
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


export const deletePaymentMethod = (id) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.PAYMENT_METHOD + "/" + id)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("payment.method.deleted.success.message"),
                })
            );
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: paymentMethodActionType.DELETE_PAYMENT_METHOD,
                payload: id,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const changePaymentMethodStatus =
    (id) =>
        async (dispatch) => {
            apiConfig
                .post(apiBaseURL.PAYMENT_METHOD + "/status-change" + "/" + id)
                .then((response) => {
                    dispatch(fetchPaymentMethods());
                    dispatch(
                        addToast({
                            text: response.data.message,
                        })
                    );
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