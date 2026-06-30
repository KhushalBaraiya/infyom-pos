import apiConfig from "../../config/apiConfig";
import { apiBaseURL, storeActionType, toastType } from "../../constants";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { setLoading } from "./loadingAction";
import { addToast } from "./toastAction";
import { removeFromTotalRecord } from "./totalRecordAction";
import { fetchFrontSetting } from "./frontSettingAction";
import { callFetchDataApi } from "./updateBrand";

export const fetchStore =
    (isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.STORES + '?page[size]=0';

            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: storeActionType.FETCH_STORE,
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


export const addStore = (data, handleClose, clearData) => (dispatch) => {
    apiConfig
        .post(apiBaseURL.STORES, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("store.success.create.message"),
                })
            );
            dispatch({
                type: storeActionType.ADD_STORE,
                payload: response.data.data,
            });
            dispatch(fetchStore());
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

export const editStore =
    (storeId, store, handleClose) => async (dispatch) => {
        apiConfig
            .post(apiBaseURL.STORES + "/" + storeId, store)
            .then((response) => {
                dispatch(callFetchDataApi(true));
                handleClose(false);
                dispatch(
                    addToast({
                        text: getFormattedMessage("store.success.edit.message"),
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

export const deleteStore = (storeId) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.STORES + "/" + storeId)
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: storeActionType.DELETE_STORE,
                payload: storeId,
            });
            dispatch(callFetchDataApi(true));
            dispatch(
                addToast({
                    text: getFormattedMessage("store.success.delete.message"),
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

export const changeStore =
    (storeId, store, setSelectedStore, navigate) => async (dispatch) => {
        await apiConfig
            .post(apiBaseURL.CHANGE_STORES + "/" + storeId, store)
            .then((response) => {
                setSelectedStore(store);
                dispatch(
                    addToast({
                        text: getFormattedMessage("store.changed.message"),
                    })
                );
                navigate('/dashboard');
                dispatch(fetchFrontSetting())
                dispatch(fetchStore());
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

export const changeStoreStatus = (storeId) => async (dispatch) => {
    try {
        const response = await apiConfig.get(apiBaseURL.CHANGE_STATUS + "/" + storeId);
        dispatch(fetchStore());
        dispatch(
            addToast({
                text: response.data.message,
            })
        );
        return { success: true };
    } catch ({ response }) {
        dispatch(
            addToast({
                text: response.data.message,
                type: toastType.ERROR,
            })
        );
        return { success: false };
    }
};