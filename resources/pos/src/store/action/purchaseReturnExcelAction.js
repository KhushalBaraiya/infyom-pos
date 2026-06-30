import apiConfig from '../../config/apiConfig';
import {toastType} from '../../constants';
import {addToast} from './toastAction';
import {setLoading} from './loadingAction';

export const purchaseReturnExcelAction = (warehouse, setIsWarehouseValue, filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true))
    }
    const fiscalYearId = filter?.fiscal_year_id ?? null;
    await apiConfig.get(`purchases-return-report-excel?warehouse_id=${warehouse}&fiscal_year_id=${fiscalYearId}`)
        .then((response) => {
            window.open(response.data.data.purchase_return_excel_url, '_blank');
            setIsWarehouseValue(false);
            if (isLoading) {
                dispatch(setLoading(false))
            }
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
        });
};
