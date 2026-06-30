import React, { useState, useEffect } from "react";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import moment from "moment";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const NepaliDatePickerComponent = (props) => {
    const { onChangeDate, newStartDate, placeholder } = props;

    // Always initialize with an empty string to avoid issues with Date objects
    const [date, setDate] = useState(ADToBS(moment().format("YYYY-MM-DD")));

    useEffect(() => {
        if (!newStartDate) return;
    
        const m = moment(newStartDate);
        if (!m.isValid()) return;
    
        const year = m.year();
        if (year < 1913 || year > 2043) {
            console.warn("Date out of supported range");
            return;
        }
        
        const dateParams = m.format("YYYY-MM-DD");
        if (date) {
            const currentAdDate = BSToAD(date);
            if (currentAdDate === dateParams) return;
        }
    
        const bsDate = ADToBS(dateParams);
        setDate(bsDate);
    }, [newStartDate]);

    const handleDateChange = (value) => {
        setDate(value);
        if (value) {
            const adDate = BSToAD(value);
            const dateObj = new Date(adDate);
            onChangeDate(dateObj);
        } else {
            onChangeDate(null);
        }
    };

    return (
        <div className="position-relative datepicker nepali-datepicker p-0">
            <NepaliDatePicker
                inputClassName="datepicker__custom-datepicker px-4"
                value={date}
                onChange={handleDateChange}
                options={{
                    calenderLocale: "ne",
                    valueLocale: "en",
                }}
                placeholder={placeholder}
            />
            <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
        </div>
    );
};

export default NepaliDatePickerComponent;
