import apiConfig from '../../config/apiConfig';
import {toastType} from '../../constants';
import {addToast} from './toastAction';
import {setLoading} from './loadingAction';

export const totalSaleReportExcel = (dates, setIsWarehouseValue, filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true))
    }
    const fiscalYearId = filter?.fiscal_year_id ?? null;
    await apiConfig.get(`total-sale-report-excel?start_date=${dates.start_date ? dates.start_date : null}&end_date=${dates.end_date ? dates.end_date : null}&user_id=${dates.user ? dates.user : null}&fiscal_year_id=${fiscalYearId}`)
        .then((response) => {
            window.open(response.data.data.total_sale_excel_url, '_blank');
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
