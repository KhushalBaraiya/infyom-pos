import apiConfig from '../../config/apiConfig';
import {
    apiBaseURL,
    settingActionType,
    toastType,
} from '../../constants';
import {addToast} from './toastAction';
import {setLoading} from "./loadingAction";
import {getFormattedMessage} from "../../shared/sharedMethod";
import requestParam from '../../shared/requestParam';
import { setTotalRecord } from './totalRecordAction';

export const fetchFiscalYear = (filter={}) => async (dispatch) => {
    dispatch(setLoading(true));
    let url = apiBaseURL.FETCH_FISCAL_YEAR_CREATE;
    if (
        !_.isEmpty(filter) &&
        (filter.page ||
            filter.pageSize ||
            filter.search ||
            filter.order_By ||
            filter.created_at)
    ) {
        url += requestParam(filter, null, null, null, url);
    }
    apiConfig.get(`${url}`)
        .then((response) => {
            dispatch({type: settingActionType.GET_FISCAL_YEAR, payload: response.data});
            dispatch(
                setTotalRecord(
                    response.data.meta.total !== undefined &&
                        response.data.meta.total >= 0
                        ? response.data.meta.total
                        : response.data.data.total
                )
            );
            dispatch(setLoading(false));
        })
        .catch(({response}) => {
            dispatch(setLoading(false));
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
        });
};

export const createFiscalYear = (fiscalYear, handleClose = null) => async (dispatch) => {
    dispatch(setLoading(true))
    apiConfig.post(`${apiBaseURL.FETCH_FISCAL_YEAR_CREATE}`, fiscalYear)
        .then((response) => {
            dispatch(addToast({text: getFormattedMessage("fiscal-year.created.title")}));
            dispatch(fetchFiscalYear());
            dispatch(setLoading(false));
            if (typeof handleClose === 'function') {
                handleClose();
            }
        })
        .catch(({response}) => {
            dispatch(setLoading(false))
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
        });
};

export const updateFiscalYear = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig.post(`${apiBaseURL.UPDATE_ACTIVE_FISCAL_YEAR}`, data)
        .then((response) => {
            dispatch(addToast({text: getFormattedMessage('fiscal-year.updated.title')}));
            dispatch(fetchFiscalYear());
            dispatch(setLoading(false))
        }).catch(({response}) => {
            dispatch(setLoading(false))
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
        });
};


