import apiConfig from '../../config/apiConfig';
import {setLoading} from './loadingAction';

export const totalPurchaseReportExcel = (dates, setIsWarehouseValue, filter = {}, isLoading = true, ) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true))
    }
    const fiscalYearId = filter?.fiscal_year_id ?? null;
    await apiConfig.get(`total-purchase-report-excel?start_date=${dates.start_date ? dates.start_date : null }&end_date=${dates.end_date ? dates.end_date : null}&fiscal_year_id=${fiscalYearId}`)
        .then((response) => {
            window.open(response.data.data.total_purchase_excel_url, '_blank');
            setIsWarehouseValue(false);
            if (isLoading) {
                dispatch(setLoading(false))
            }
        })
        .catch(() => {
        });
};
