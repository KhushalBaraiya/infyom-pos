import { apiBaseURL, taxActionType, toastType } from "../../constants";
import { setLoading } from "./loadingAction";
import apiConfig from "../../config/apiConfig";
import { addInToTotalRecord, removeFromTotalRecord, setTotalRecord } from "./totalRecordAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { addToast } from "./toastAction";
import { callFetchDataApi } from "./updateBrand";

export const fetchTax =
    (isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.TAXES + "?page[size]=0";

            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: taxActionType.FETCH_TAX,
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

export const addTax = (data, handleClose, clearData) => (dispatch) => {
    apiConfig
        .post(apiBaseURL.TAXES, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("tax.save.success.message"),
                })
            );
            dispatch({
                type: taxActionType.ADD_TAX,
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

export const editTax =
    (taxes, taxId, handleClose) => async (dispatch) => {
        apiConfig
            .post(apiBaseURL.TAXES + "/" + taxId, taxes)
            .then((response) => {
                handleClose(false);
                dispatch({
                    type: taxActionType.EDIT_TAXES,
                    payload: response.data.data,
                });
                dispatch(
                    addToast({
                        text: getFormattedMessage("tax.edit.success.message"),
                    })
                );
                dispatch(addInToTotalRecord(1));
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


export const deleteTax = (taxId, setNotDeletedItemModal, clearSelectedDeleteItem) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.TAXES, { data: taxId })
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("tax.deleted.success.message"),
                })
            );
            dispatch(removeFromTotalRecord(1));
            dispatch(callFetchDataApi(true));
            setNotDeletedItemModal(response?.data?.data);
            dispatch({
                type: taxActionType.DELETE_TAXES,
                payload: taxId,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        })
        .finally(() => {
            clearSelectedDeleteItem();
        });
};

export const changeTaxStatus =
    (storeId) =>
        async (dispatch) => {
            apiConfig
                .get(apiBaseURL.TAXES + "/status-change" + "/" + storeId)
                .then((response) => {
                    dispatch(fetchTax());
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