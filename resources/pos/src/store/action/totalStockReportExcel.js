import apiConfig from '../../config/apiConfig';
import {setLoading} from './loadingAction';

export const totalStockReportExcel = (warehouse, setIsWarehouseValue, filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true))
    }
    const fiscalYearId = filter?.fiscal_year_id ?? null;
    await apiConfig.get(`stock-report-excel?warehouse_id=${warehouse}&fiscal_year_id=${fiscalYearId}`)
        .then((response) => {
            window.open(response.data.data.stock_report_excel_url, '_blank');
            setIsWarehouseValue(false);
            if (isLoading) {
                dispatch(setLoading(false))
            }
        })
        .catch(() => {
        });
};
