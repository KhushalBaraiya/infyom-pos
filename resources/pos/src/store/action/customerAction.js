import apiConfig from "../../config/apiConfig";
import { apiBaseURL, toastType, customerActionType } from "../../constants";
import requestParam from "../../shared/requestParam";
import { addToast } from "./toastAction";
import {
    addInToTotalRecord,
    removeFromTotalRecord,
    setTotalRecord,
} from "./totalRecordAction";
import { setLoading } from "./loadingAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { setSavingButton } from "./saveButtonAction";
import { callImportProductApi } from "./importProductApiAction";
import moment from "moment";
import { addUser } from "./userAction";
import { callFetchDataApi } from "./updateBrand";

export const fetchCustomers =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = apiBaseURL.CUSTOMERS;
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
        apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: customerActionType.FETCH_CUSTOMERS,
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

export const fetchCustomer =
    (customerId, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        apiConfig
            .get(apiBaseURL.CUSTOMERS + "/" + customerId)
            .then((response) => {
                dispatch({
                    type: customerActionType.FETCH_CUSTOMER,
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
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            });
    };

export const addCustomer = (formValue, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(apiBaseURL.CUSTOMERS, formValue)
        .then((response) => {
            dispatch({
                type: customerActionType.ADD_CUSTOMER,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "customer.success.create.message"
                    ),
                })
            );

            if (formValue.createUser) {
                const name = formValue.name.split(' ');
                formValue.first_name = formValue.first_name ? formValue.first_name : name[0];
                formValue.last_name = formValue.last_name ? formValue.last_name : name.slice(1).join(' ');
                formValue = { ...formValue, id : response.data.data.id};
                dispatch(addUser(formValue, navigate, false))
            }
            dispatch(setSavingButton(false));
            navigate("/app/customers");
            dispatch(addInToTotalRecord(1));
            
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            response &&
                dispatch(
                    addToast({
                        text: response.data.message,
                        type: toastType.ERROR,
                    })
                );
        });
};

export const createCustomerAsUser = (formValue, navigate) => (dispatch) => {

    const name = formValue.name.split(' ');
    formValue.first_name = formValue.first_name ? formValue.first_name : name[0];
    formValue.last_name = formValue.last_name ? formValue.last_name : name.slice(1).join(' ');
    dispatch(addUser(formValue, navigate, false))
}

export const editCustomer =
    (customerId, customer, navigate) => async (dispatch) => {
        dispatch(setSavingButton(true));
        const { name, dob, email, phone, country, city, address } = customer;
        const data = {
            name,
            dob: dob === null ? null : moment(dob).format("YYYY-MM-DD"),
            email,
            phone,
            country,
            city,
            address,
        };
        apiConfig
            .patch(apiBaseURL.CUSTOMERS + "/" + customerId, data)
            .then((response) => {
                dispatch({
                    type: customerActionType.EDIT_CUSTOMER,
                    payload: response.data.data,
                });
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "customer.success.edit.message"
                        ),
                    })
                );
                dispatch(setSavingButton(false));
                navigate("/app/customers");
            })
            .catch(({ response }) => {
                dispatch(setSavingButton(false));
                dispatch(
                    addToast({
                        text: response.data.message,
                        type: toastType.ERROR,
                    })
                );
            });
    };

export const deleteCustomer = (customerId, setNotDeletedItemModal, clearSelectedDeleteItem) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.CUSTOMERS, { data: customerId })
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: customerActionType.DELETE_CUSTOMER,
                payload: customerId,
            });
            dispatch(callFetchDataApi(true));
            setNotDeletedItemModal(response?.data?.data);
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "customer.success.delete.message"
                    ),
                })
            );
        })
        .catch(({ response }) => {
            response &&
                dispatch(
                    addToast({
                        text: response.data.message,
                        type: toastType.ERROR,
                    })
                );
        })
        .finally(() => {
            clearSelectedDeleteItem();
        });
};

export const fetchAllCustomer = () => async (dispatch) => {
    apiConfig
        .get(`customers?page[size]=0`)
        .then((response) => {
            dispatch({
                type: customerActionType.FETCH_ALL_CUSTOMER,
                payload: response.data.data,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const addImportCustomers = (importData) => async (dispatch) => {
    await apiConfig
        .post(apiBaseURL.IMPORT_CUSTOMERS, importData)
        .then((response) => {
            dispatch(setLoading(false));
            dispatch(callFetchDataApi(true));
            // dispatch({type: productActionType.ADD_IMPORT_PRODUCT, payload: response.data.data});
            dispatch(addToast({ text: response?.data?.message }));
            dispatch(addInToTotalRecord(1));
        })
        .catch(({ response }) => {
            dispatch(fetchCustomers());
            response &&
                dispatch(
                    addToast({
                        text: response.data.message,
                        type: toastType.ERROR,
                    })
                );
        });
};
