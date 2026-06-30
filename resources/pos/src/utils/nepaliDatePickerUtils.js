import { useSelector } from "react-redux";

/**
 * Utility function to check if Nepali datepicker should be enabled
 * @returns {boolean} True if Nepali datepicker is enabled, false otherwise
 */
export const isNepaliDatePickerEnabled = () => {
    const { allConfigData } = useSelector((state) => state);
    // Check if the setting exists and is enabled
    if (allConfigData) {
        return allConfigData?.enable_nepali_datepicker == 1 || 
               allConfigData?.enable_nepali_datepicker == "true";
    }
    
    return false;
};

/**
 * Utility function to get the appropriate datepicker component based on settings
 * @returns {Component} Either ReactDatePicker or NepaliDatePickerComponent
 */
export const getDatePickerComponent = () => {
    const isEnabled = isNepaliDatePickerEnabled();
    
    if (isEnabled) {
        // Return the Nepali datepicker component
        const NepaliDatePickerComponent = require("../shared/datepicker/NepaliDatePicker").default;
        return NepaliDatePickerComponent;
    } else {
        // Return the regular React datepicker component
        const ReactDatePicker = require("../shared/datepicker/ReactDatePicker").default;
        return ReactDatePicker;
    }
};