import apiConfig from '../../config/apiConfig';
import {toastType} from '../../constants';
import {addToast} from './toastAction';

export const fetchTopSellingExcel = (dates, setIsWarehouseValue, filter={}) => async (dispatch) => {
    const fiscalYearId = filter?.fiscal_year_id ?? null;
    await apiConfig.get(`top-selling-product-report-excel?start_date=${dates.start_date ? dates.start_date : null }&end_date=${dates.end_date ? dates.end_date : null}&fiscal_year_id=${fiscalYearId}`)
        .then((response) => {
            window.open(response.data.data.top_selling_product_excel_url, '_blank');
            setIsWarehouseValue(false);
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
        });
};

