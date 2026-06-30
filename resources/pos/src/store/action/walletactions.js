
import { apiBaseURL, toastType, walletActionType } from '../../constants';
import axiosApi from '../../config/apiConfig';
import { setSavingButton } from './saveButtonAction';
import { addToast } from './toastAction';
import requestParam from '../../shared/requestParam';
import { setTotalRecord } from './totalRecordAction';

export const addWalletBalance = (data) => async ( dispatch ) => {
    dispatch( setSavingButton( true ) )
    await axiosApi.post( apiBaseURL.CUSTOMER_WALLET + `/wallet/add-amount-request`, data )
        .then( ( response ) => {
            dispatch( addToast( { text: "rupees credited" } ) );
            dispatch( setSavingButton( false ) )
            dispatch(fetchWalletTransactions(null, {}))
        } )
        .catch( ( { response } ) => {
            dispatch( setSavingButton( false ) )
            dispatch( addToast(
                { text: response.data.message, type: toastType.ERROR } ) );
        } );
};

export const fetchWalletTransactions = (id = null, filter = {}) => async (dispatch) => {
    await axiosApi.get(apiBaseURL.CUSTOMER_WALLET + `/wallet/transactions` + ((id !== null) ? `/${id}` : '') + requestParam(filter,null, null, null, apiBaseURL.CUSTOMER_WALLET))
        .then((response) => {
            dispatch({
                type: walletActionType.FETCH_WALLET_TRANSACTIONS,
                payload: response.data.data 
            });
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
            dispatch(addToast({ 
                text: response?.data?.message || "Failed to fetch transactions", 
                type: toastType.ERROR 
            }));
        });
};

export const fetchAllWalletTransactions = (filter = {}) => async (dispatch) => {
    await axiosApi.get(apiBaseURL.ALL_CUSTOMER_WALLET + `/transactions` + requestParam(filter,null, null, null, apiBaseURL.CUSTOMER_WALLET))
        .then((response) => {
            dispatch({
                type: walletActionType.FETCH_WALLET_TRANSACTIONS,
                payload: response.data.data 
            });
        })
        .catch(({ response }) => {
            dispatch(addToast({ 
                text: response?.data?.message || "Failed to fetch transactions", 
                type: toastType.ERROR 
            }));
        });
};

export const WalletStatusChange = (data, statusValue) => async(dispatch) => {
    dispatch( setSavingButton( true ) )
    await axiosApi.post( apiBaseURL.WALLET_TRANSACTIONS + `/status/${data}`, { status: statusValue } )
        .then( ( response ) => {
            dispatch( addToast( { text: "Status Changed Successfully" } ) );
            dispatch( setSavingButton( false ) )
            dispatch(fetchAllWalletTransactions({direction_type: 2}))
        } )
        .catch( ( { response } ) => {
            dispatch( setSavingButton( false ) )
            dispatch( addToast(
                { text: response.data.message, type: toastType.ERROR } ) );
        } );
}

export const  fetchDashboardData= () => async(dispatch) => {
    try {
        const response = await axiosApi.get(apiBaseURL.DASHBOARD_DATA);

        dispatch(addToast({ text: "Data Loaded" }));
        dispatch(setSavingButton(false));

        return response.data; 

    } catch (error) {
        dispatch(setSavingButton(false));
        dispatch(addToast({
            text: error.response?.data?.message || "Something went wrong",
            type: toastType.ERROR
        }));

        throw error;
    }
}
