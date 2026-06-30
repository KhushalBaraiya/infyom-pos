import apiConfig from "../../../config/apiConfig";
import { apiBaseURL, holdListActionType, toastType } from "../../../constants";
import { addToast } from "./../toastAction";
import { removeFromTotalRecord, setTotalRecord } from "./../totalRecordAction";
import { setLoading } from "./../loadingAction";
import requestParam from "../../../shared/requestParam";
import { getFormattedMessage } from "../../../shared/sharedMethod";

export const fetchHoldLists =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        const admin = true;
        let url = apiBaseURL.HOLDS_LIST;
        if (
            !_.isEmpty(filter) &&
            (filter.page ||
                filter.pageSize ||
                filter.search ||
                filter.order_By ||
                filter.start_date ||
                filter.customer_id)
        ) {
            url += requestParam(filter, admin, null, null, url);
        }
        await apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: holdListActionType.FETCH_HOLDS,
                    payload: response.data.data,
                });
                dispatch(
                    setTotalRecord(
                        response.data.meta.total !== undefined &&
                            response.data.meta.total >= 0
                            ? response.data.meta.total
                            : response.data.data.total
                    )
                );
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
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            });
    };

export const fetchHoldList =
    (HoldId, singleSale, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        await apiConfig
            .get(apiBaseURL.HOLDS_LIST + "/" + HoldId + "/edit", singleSale)
            .then((response) => {
                dispatch({
                    type: holdListActionType.FETCH_HOLD,
                    payload: response.data.data,
                });
                if (isLoading) {
                    // dispatch(setLoading(false));
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

export const addHoldList = (holdlist, isEdit, navigate) => async (dispatch) => {
    await apiConfig
        .post(apiBaseURL.HOLDS_LIST, holdlist)
        .then((response) => {
            dispatch({
                type: holdListActionType.ADD_HOLD,
                payload: response.data.data,
            }); 
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        isEdit ? "Hold edited successfully" : "hold-list.success.create.message"
                    ),
                })
            );
            navigate("/app/holds");
            
            dispatch(fetchHoldLists(response.data.data.id, true));
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const deleteHoldItem = (hold_id) => async (dispatch) => {
    await apiConfig
        .delete(apiBaseURL.HOLDS_LIST + "/" + hold_id)
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch(
                addToast({ text: response.data.message })
            );
            dispatch({ type: holdListActionType.DELETE_HOLD, payload: hold_id });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};
