import React, { useEffect, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import { isNepaliDatePickerEnabled } from "../../utils/nepaliDatePickerUtils";
import NepaliDatePickerComponent from "./NepaliDatePicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { registerLocale } from "react-datepicker";
import { enGB, es, de, tr, fr, ar, vi, zhCN } from "date-fns/locale";
import { useSelector } from "react-redux";
import { Tokens } from "../../constants";

const ReactDatePicker = (props) => {
    const { onChangeDate, newStartDate, readOnlyref, placeholder, disablePast, disableFuture = true, FixedFiscalYearDate } = props;
    const [startDate, setStartDate] = useState(null);
    const [language, setLanguage] = useState(enGB);
    const { allConfigData, fiscalYears, settings } = useSelector((state) => state);
    const isFiscalYearEnabled = parseInt(settings?.attributes?.enable_fiscal_year_filter) === 1;
    const activeFiscalYear = useMemo(() => {
        return fiscalYears && fiscalYears.length > 0 && fiscalYears.find(fy => fy.attributes?.is_active || fy.is_active);
    }, [fiscalYears]);
    const [languageCode, setLanguageCode] = useState("enGB");

    const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);
    const { selectedLanguage } = useSelector((state) => state);
    const messages = updatedLanguage ? updatedLanguage : selectedLanguage;

    useEffect(() => {
        if (messages === "en") {
            setLanguage(enGB);
            setLanguageCode("enGB");
        } else if (messages === "sp") {
            setLanguage(es);
            setLanguageCode("es");
        } else if (messages === "gr") {
            setLanguage(de);
            setLanguageCode("de");
        } else if (messages === "fr") {
            setLanguage(fr);
            setLanguageCode("fr");
        } else if (messages === "ar") {
            setLanguage(ar);
            setLanguageCode("ar");
        } else if (messages === "tr") {
            setLanguage(tr);
            setLanguageCode("tr");
        } else if (messages === "vi") {
            setLanguage(vi);
            setLanguageCode("vi");
        } else if (messages === "cn") {
            setLanguage(zhCN);
            setLanguageCode("cn");
        } else if (messages === "ne") {
            setLanguage(enGB);
            setLanguageCode("enGB");
        }
    }, [messages]);

    useEffect(() => {
        if (FixedFiscalYearDate && isFiscalYearEnabled && activeFiscalYear) {
            const fiscalYearStart = new Date(activeFiscalYear.attributes?.start_date || activeFiscalYear.start_date);
            const fiscalYearEnd = new Date(activeFiscalYear.attributes?.end_date || activeFiscalYear.end_date);
            const today = new Date();
            const todayCopy = new Date(today);
            fiscalYearStart.setHours(0, 0, 0, 0);
            fiscalYearEnd.setHours(0, 0, 0, 0);
            todayCopy.setHours(0, 0, 0, 0);
            if (!newStartDate) {
                if (todayCopy >= fiscalYearStart && todayCopy <= fiscalYearEnd) {
                    setStartDate(todayCopy);
                    onChangeDate(todayCopy);
                } else {
                    setStartDate(fiscalYearStart);
                    onChangeDate(fiscalYearStart);
                }
            }
        }
    }, [FixedFiscalYearDate, isFiscalYearEnabled, activeFiscalYear, newStartDate]);

    registerLocale(language, languageCode);

    const handleCallback = (date) => {
        setStartDate(date);
        onChangeDate(date);
    };

    const onDatepickerRef = (el, readOnlyref) => {
        if (el && el.input) {
            el.input.readOnly = readOnlyref !== undefined ? readOnlyref : true;
        }
    };

    const format = (allConfigData) => {
        const format = allConfigData && allConfigData.date_format;
        if (format === "d-m-y") {
            return "dd-MM-yyyy";
        } else if (format === "m-d-y") {
            return "MM-dd-yyyy";
        } else if (format === "y-m-d") {
            return "yyyy-MM-dd";
        } else if (format === "m/d/y") {
            return "MM/dd/yyyy";
        } else if (format === "d/m/y") {
            return "dd/MM/yyyy";
        } else if (format === "y/m/d") {
            return "yyyy/MM/dd";
        } else if (format === "m.d.y") {
            return "MM.dd.yyyy";
        } else if (format === "d.m.y") {
            return "dd.MM.yyyy";
        } else if (format === "y.m.d") {
            return "yyyy.MM.dd";
        } else "yyyy-mm-dd";
    };

    const isNepaliEnabled = isNepaliDatePickerEnabled(allConfigData);

    let minDate = null;
    let maxDate = null;

    if (FixedFiscalYearDate && isFiscalYearEnabled && activeFiscalYear) {
        minDate = new Date(activeFiscalYear.attributes?.start_date || activeFiscalYear.start_date);
        maxDate = new Date(activeFiscalYear.attributes?.end_date || activeFiscalYear.end_date);
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);
    }

    if (isNepaliEnabled) {
        return (
            <NepaliDatePickerComponent
                onChangeDate={onChangeDate}
                newStartDate={newStartDate}
                placeholder={placeholder}
                FixedFiscalYearDate={FixedFiscalYearDate}
                disablePast={disablePast}
                disableFuture={disableFuture}
            />
        );
    }

    return (
        <div className="position-relative datepicker p-0">
            <DatePicker
                wrapperClassName="w-100"
                locale={language}
                className="datepicker__custom-datepicker px-4"
                name="date"
                selected={newStartDate || startDate}
                dateFormat={format(allConfigData)}
                onChange={(date) => handleCallback(date)}
                {...(FixedFiscalYearDate && isFiscalYearEnabled && activeFiscalYear && { minDate: minDate, maxDate: maxDate })}
                {...(!(FixedFiscalYearDate && isFiscalYearEnabled && activeFiscalYear) && disableFuture && { maxDate: new Date() })}
                {...(!(FixedFiscalYearDate && isFiscalYearEnabled && activeFiscalYear) && disablePast && { minDate: new Date() })}
                ref={(el) => onDatepickerRef(el, readOnlyref)}
                autoComplete="off"
                placeholderText = {placeholder}
            />
            <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
        </div>
    );
};

export default ReactDatePicker;
