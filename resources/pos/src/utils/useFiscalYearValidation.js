import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getFormattedMessage } from "../shared/sharedMethod";

/**
 * Custom hook to validate dates against the active fiscal year.
 * Only active when BOTH Nepali datepicker AND fiscal year filter are enabled.
 *
 * @returns {{
 *   shouldValidateFiscalYear: boolean,
 *   validateDate: (date: Date|null) => string,
 *   fiscalYearStart: Date|null,
 *   fiscalYearEnd: Date|null,
 * }}
 *   - shouldValidateFiscalYear: true when nepali + fiscal year are both enabled
 *   - validateDate: returns an error string if the date is outside the fiscal year, or "" if valid
 *   - fiscalYearStart / fiscalYearEnd: the active fiscal year boundaries (null if not applicable)
 */
const useFiscalYearValidation = () => {
    const { settings, fiscalYears, allConfigData } = useSelector((state) => state);

    const isFiscalYearEnabled =
        parseInt(settings?.attributes?.enable_fiscal_year_filter) === 1;
    const isNepaliEnabled =
        allConfigData?.enable_nepali_datepicker == 1 ||
        allConfigData?.enable_nepali_datepicker == "true";

    const activeFiscalYear = useMemo(() => {
        return (
            fiscalYears &&
            fiscalYears.length > 0 &&
            fiscalYears.find(
                (fy) => fy.attributes?.is_active || fy.is_active
            )
        );
    }, [fiscalYears]);

    const shouldValidateFiscalYear = isNepaliEnabled && isFiscalYearEnabled && !!activeFiscalYear;

    const { fiscalYearStart, fiscalYearEnd } = useMemo(() => {
        if (!shouldValidateFiscalYear) return { fiscalYearStart: null, fiscalYearEnd: null };
        const start = new Date(
            activeFiscalYear.attributes?.start_date || activeFiscalYear.start_date
        );
        const end = new Date(
            activeFiscalYear.attributes?.end_date || activeFiscalYear.end_date
        );
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return { fiscalYearStart: start, fiscalYearEnd: end };
    }, [shouldValidateFiscalYear, activeFiscalYear]);

    /**
     * Validate a date against the active fiscal year.
     * @param {Date|null} date
     * @returns {string} error message or empty string
     */
    const validateDate = (date) => {
        if (!shouldValidateFiscalYear) return "";
        if (!date) return "";

        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);

        if (dateObj < fiscalYearStart || dateObj > fiscalYearEnd) {
            return getFormattedMessage("globally.fiscal.year.date.validate.label");
        }
        return "";
    };

    return {
        shouldValidateFiscalYear,
        validateDate,
        fiscalYearStart,
        fiscalYearEnd,
    };
};

export default useFiscalYearValidation;
