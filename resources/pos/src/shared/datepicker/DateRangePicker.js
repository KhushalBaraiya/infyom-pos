import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Col, ListGroup, ListGroupItem, Popover, PopoverBody, Row} from 'reactstrap';
import {dateLabelSelector, Tokens} from '../../constants';
import DatePicker, {registerLocale} from 'react-datepicker';
import moment from 'moment';
import {dateFormat} from '../../constants';
import Form from 'react-bootstrap/Form';
import {getFormattedMessage, placeholderText} from '../sharedMethod';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalendarAlt} from '@fortawesome/free-solid-svg-icons';
import {ar, de, enGB, es, fr, tr, vi, zhCN} from "date-fns/locale";
import { isNepaliDatePickerEnabled } from '../../utils/nepaliDatePickerUtils';
import NepaliDatePickerComponent from './NepaliDatePicker';
import {useDispatch, useSelector} from "react-redux";
import { ADToBS } from 'bikram-sambat-js';
import { fetchFiscalYear } from '../../store/action/FiscalYearAction';

const DateRangePicker = ( props ) => {
    const {onDateSelector, isProfitReport, isFiscalYearFilter, selectDate} = props;
    const [date, setDate] = useState();
    const [selectedMinDate, setSelectedMinDate] = useState( moment().startOf( 'month' ).toDate() );
    const [selectedMaxDate, setSelectedMaxDate] = useState( moment().endOf( 'month' ).toDate() );
    const [popoverOpen, setPopoverOpen] = useState( false );
    const [applyButton, setApplyButton] = useState( false );
    const [childPopoverOpen, setChildPopoverOpen] = useState( false );
    const [fiscalPopoverOpen, setFiscalPopoverOpen] = useState( false );
    const toggle = () => setPopoverOpen( true );
    const toggleChild = () => setChildPopoverOpen( !childPopoverOpen );
    const toggleFiscal = () => setFiscalPopoverOpen( !fiscalPopoverOpen );
    const today = moment().format( dateFormat.NATIVE );
    const nextWeek = moment().startOf( 'week' ).format( dateFormat.NATIVE );
    const lastWeek = moment().subtract( 1, 'week' ).startOf( 'isoWeek' ).format( dateFormat.NATIVE );
    const startMonth = moment().startOf( 'month' ).format( dateFormat.NATIVE );
    const nextMonth = moment().endOf( 'month' ).format( dateFormat.NATIVE );
    const startOfLastMonth = moment().subtract( 1, 'months' ).startOf( 'month' ).format( dateFormat.NATIVE );
    const endOfLastMonth = moment().subtract( 1, 'months' ).endOf( 'month' ).format( dateFormat.NATIVE );
    const interStartMediateDate = moment( selectedMinDate ).format( dateFormat.NATIVE );
    const interMediateEndDate = moment( selectedMaxDate ).format( dateFormat.NATIVE );
    const inputToady = moment().format( dateFormat.CHART_DATE );
    const inputNextWeek = moment().startOf( 'week' ).format( dateFormat.CHART_DATE );
    const inputLastWeek = moment().subtract( 1, 'week' ).startOf( 'isoWeek' ).format( dateFormat.CHART_DATE );
    const inputStartMonth = moment().startOf( 'month' ).format( dateFormat.CHART_DATE );
    const inputNextMonth = moment().endOf( 'month' ).format( dateFormat.CHART_DATE );
    const inputStartOfLastMonth = moment().subtract( 1, 'months' ).startOf( 'month' ).format( dateFormat.CHART_DATE );
    const inputEndOfLastMonth = moment().subtract( 1, 'months' ).endOf( 'month' ).format( dateFormat.CHART_DATE );
    const inputInterStartMediateDate = moment( selectedMinDate ).format( dateFormat.CHART_DATE );
    const inputInterMediateEndDate = moment( selectedMaxDate ).format( dateFormat.CHART_DATE );
    
    const [language, setLanguage] = useState( enGB );
    const [languageCode, setLanguageCode] = useState( "enGB" );
    const isNepaliDate = isNepaliDatePickerEnabled(props.allConfigData);

    const updatedLanguage = localStorage.getItem( Tokens.UPDATED_LANGUAGE )
    const {selectedLanguage} = useSelector( state => state )
    const messages = updatedLanguage ? updatedLanguage : selectedLanguage;

    const dispatch = useDispatch();
    const fiscalYears = useSelector(state => state.fiscalYears);
    const [selectedFiscalYearId, setSelectedFiscalYearId] = useState(null);

    useEffect( () => {
        if ( messages === "en" ) {
            setLanguage( enGB )
            setLanguageCode( "enGB" )
        } else if ( messages === "sp" ) {
            setLanguage( es )
            setLanguageCode( "es" )
        } else if ( messages === "gr" ) {
            setLanguage( de )
            setLanguageCode( "de" )
        } else if ( messages === "fr" ) {
            setLanguage( fr )
            setLanguageCode( "fr" )
        } else if ( messages === "ar" ) {
            setLanguage( ar )
            setLanguageCode( "ar" )
        } else if ( messages === "tr" ) {
            setLanguage( tr )
            setLanguageCode( "tr" )
        } else if ( messages === "vi" ) {
            setLanguage( vi )
            setLanguageCode( "vi" )
        } else if ( messages === "cn" ) {
            setLanguage( zhCN )
            setLanguageCode( "zhCN" )
        }
    }, [messages] )


    useEffect(() => {
        if (isFiscalYearFilter) {
            dispatch(fetchFiscalYear({ page: 1, pageSize: 100 }));
        }
    }, [dispatch, isFiscalYearFilter]);

    registerLocale( language, languageCode );

    const cleanParams = {
        type: dateLabelSelector.CLEAN,
        params: ''
    };

    const getFormattedDateString = (date) => {
        if (isNepaliDate) {
             return ADToBS(moment(date).format('YYYY-MM-DD'));
        }
        return moment(date).format(dateFormat.CHART_DATE);
    }

    const todayParams = {
        type: dateLabelSelector.TODAY,
        params: {start_date: today, end_date: today}
    };

    const currentWeekParams = {
        type: dateLabelSelector.THIS_WEEK,
        params: {start_date: nextWeek, end_date: today}
    };

    const lastWeekParams = {
        type: dateLabelSelector.LAST_WEEK,
        params: {start_date: lastWeek, end_date: nextWeek}
    };

    const currentMonthParams = {
        type: dateLabelSelector.THIS_MONTH,
        params: {start_date: startMonth, end_date: nextMonth}
    };

    const lastMonthParams = {
        type: dateLabelSelector.LAST_MONTH,
        params: {start_date: startOfLastMonth, end_date: endOfLastMonth}
    };

    const interMediateParams = {
        type: dateLabelSelector.CUSTOM,
        params: {start_date: interStartMediateDate, end_date: interMediateEndDate}
    };

    const [dateColor, setDateColor] = useState( {
        clear: '', today: '', this_week: '', last_week: '', this_month: '', last_month: '', custom: ''
    } );

    useEffect( () => {
        const close = ( e ) => {
            if ( e.keyCode === 27 ) {
                setPopoverOpen( false );
                setChildPopoverOpen( false );
                setFiscalPopoverOpen( false );
                return;
            }
            window.removeEventListener( 'keydown', close )
        }
        if ( popoverOpen === true ) {
            window.addEventListener( 'keydown', close )
        }
    }, [popoverOpen] );

    useEffect( () => {
        const handleClick = ( e ) => {
            if ( e.target && e.target.className === 'custom-overlay' ) {
                setPopoverOpen( false );
                setChildPopoverOpen( false );
                setFiscalPopoverOpen( false );
                return;
            }
        }
        if ( popoverOpen === true ) {
            window.addEventListener( 'click', handleClick );
        }
    }, [popoverOpen] );

    const onClickCustomRange = () => {
        setApplyButton( true );
        setDateColor( 'custom' )
    };

    const onSelectDate = ( type ) => {
        switch ( type ) {
            case dateLabelSelector.CLEAN:
                setDate( '' );
                onDateSelector( cleanParams );
                setDateColor( 'clear' );
                setPopoverOpen( false );
                setSelectedMinDate( moment().startOf( 'month' ).toDate() );
                setSelectedMaxDate( moment().endOf( 'month' ).toDate() )
                setApplyButton( false )
                setSelectedFiscalYearId(null);
                break;
            case dateLabelSelector.TODAY:
                setDate( getFormattedDateString(today) + '-' + getFormattedDateString(today) );
                onDateSelector( todayParams );
                setDateColor( 'today' );
                setPopoverOpen( false )
                setSelectedFiscalYearId(null);
                break;
            case dateLabelSelector.THIS_WEEK:
                setDate( getFormattedDateString(nextWeek) + '-' + getFormattedDateString(today) );
                onDateSelector( currentWeekParams );
                setDateColor( 'this_week' )
                setPopoverOpen( false )
                setSelectedFiscalYearId(null);
                break;
            case dateLabelSelector.LAST_WEEK:
                setDate( getFormattedDateString(lastWeek) + '-' + getFormattedDateString(nextWeek) );
                onDateSelector( lastWeekParams );
                setDateColor( 'last_week' )
                setPopoverOpen( false )
                setSelectedFiscalYearId(null);
                break;
            case dateLabelSelector.THIS_MONTH:
                setDate( getFormattedDateString(startMonth) + '-' + getFormattedDateString(nextMonth) );
                onDateSelector( currentMonthParams );
                setDateColor( 'this_month' )
                setPopoverOpen( false )
                setSelectedFiscalYearId(null);
                break;
            case dateLabelSelector.LAST_MONTH:
                setDate( getFormattedDateString(startOfLastMonth) + '-' + getFormattedDateString(endOfLastMonth) );
                onDateSelector( lastMonthParams );
                setDateColor( 'last_month' )
                setPopoverOpen( false )
                setSelectedFiscalYearId(null);
                break;
            case dateLabelSelector.CUSTOM:
                setDate( getFormattedDateString(interStartMediateDate) + '-' + getFormattedDateString(interMediateEndDate) );
                onDateSelector( interMediateParams );
                setPopoverOpen( false )
                setSelectedFiscalYearId(null);
                break;
            default:
                onDateSelector();
                setSelectedFiscalYearId(null);
                break;
        }
    };

    const onSelectMinDate = ( date ) => {
        setSelectedMinDate( date );
    };

    const onSelectMaxDate = ( date ) => {
        setSelectedMaxDate( date );
    };

    useEffect( () => {
        if ( isProfitReport ) {
            setDate( getFormattedDateString(startMonth) + '-' + getFormattedDateString(nextMonth) );
            setDateColor( 'this_month' )
        }
    }, [isProfitReport, isNepaliDate] )

    useEffect(() => {
        if (!selectDate) {
            setDate('');
            setSelectedFiscalYearId(null);
        }
    }, [selectDate]);

    const onDatepickerRef = ( el ) => {if ( el && el.input ) {el.input.readOnly = true; el.input.cursor = 'pointer'} }

    return (
        <div className='text-end me-sm-3 custom-dateRange-picker mb-md-2 mb-0 w-100 mb-sm-0 order-0 order-sm-1 mb-3 mb-sm-0'>
            <div id='Popover1'>
                <Form.Group className='position-relative' controlId='formBasicDate'>
                    <Form.Control type='search' name='date'
                        className='form-control pe-10 date-input font-weight-normal'
                        placeholder={placeholderText( 'date-picker.filter.placeholder.label' )} readOnly={true}
                        onFocus={dateColor === 'custom' ? () => setPopoverOpen( true ) : null}
                        value={date}
                    />
                    <FontAwesomeIcon icon={faCalendarAlt} className='input-icon' />
                </Form.Group>
            </div>
            <div className={`${popoverOpen === true ? 'custom-overlay' : ''}`}>
                <Popover trigger='click' placement='bottom' isOpen={popoverOpen}
                    target='Popover1' toggle={toggle} >
                    <PopoverBody className='date-picker-popover'>
                        <ListGroup>
                            <ListGroupItem className={`${dateColor === 'today' ? 'bg-primary text-white' : null} border-0 rounded`}
                                onClick={() => onSelectDate( dateLabelSelector.TODAY )}>
                                {getFormattedMessage( 'date-picker.filter.today.label' )}
                            </ListGroupItem>
                            <ListGroupItem className={`${dateColor === 'this_week' ? 'bg-primary text-white' : null} border-0 rounded`}
                                onClick={() => onSelectDate( dateLabelSelector.THIS_WEEK )}>
                                {getFormattedMessage( 'date-picker.filter.this-week.label' )}
                            </ListGroupItem>
                            <ListGroupItem className={`${dateColor === 'last_week' ? 'bg-primary text-white' : null} border-0 rounded`}
                                onClick={() => onSelectDate( dateLabelSelector.LAST_WEEK )}>
                                {getFormattedMessage( 'date-picker.filter.last-week.label' )}
                            </ListGroupItem>
                            <ListGroupItem className={`${dateColor === 'this_month' ? 'bg-primary text-white' : null} border-0 rounded`}
                                onClick={() => onSelectDate( dateLabelSelector.THIS_MONTH )}>
                                {getFormattedMessage( 'date-picker.filter.this-month.label' )}
                            </ListGroupItem>
                            <ListGroupItem className={`${dateColor === 'last_month' ? 'bg-primary text-white' : null} border-0 rounded`}
                                onClick={() => onSelectDate( dateLabelSelector.LAST_MONTH )}>
                                {getFormattedMessage( 'date-picker.filter.last-month.label' )}
                            </ListGroupItem>

                            {isFiscalYearFilter && fiscalYears && Array.isArray(fiscalYears) && fiscalYears.length > 0 && (
                                <ListGroupItem className={`${selectedFiscalYearId !== null ? 'bg-primary text-white' : null} border-0 rounded`}>
                                    <span id='PopoverFiscal'>
                                        {getFormattedMessage('fiscal-year.title')}
                                    </span>
                                    <Popover trigger='legacy' placement='left' className={`date-picker__child-popover`}
                                        isOpen={fiscalPopoverOpen} target='PopoverFiscal' toggle={toggleFiscal}>
                                        <PopoverBody>
                                            <ListGroup>
                                                {fiscalYears.map((fy) => {
                                                    const isSelected = selectedFiscalYearId === fy.id;
                                                    return (
                                                        <ListGroupItem
                                                            key={fy.id}
                                                            className={`${isSelected ? 'bg-primary text-white' : ''} border-0 rounded cursor-pointer`}
                                                            onClick={() => {
                                                                const start = fy.attributes.start_date;
                                                                const end = fy.attributes.end_date;
                                                                setDate(
                                                                    getFormattedDateString(start) + '-' + getFormattedDateString(end)
                                                                );
                                                                onDateSelector({
                                                                    type: 'fiscal_year',
                                                                    fiscalYearId: fy.id,
                                                                    params: { start_date: start, end_date: end }
                                                                });
                                                                setDateColor('fiscal_year');
                                                                setSelectedFiscalYearId(fy.id);
                                                                setPopoverOpen(false);
                                                                setFiscalPopoverOpen(false);
                                                            }}
                                                        >
                                                            {fy.attributes.name}
                                                            {fy.attributes.is_active ? ' (Active)' : ''}
                                                        </ListGroupItem>
                                                    );
                                                })}
                                            </ListGroup>
                                        </PopoverBody>
                                    </Popover>
                                </ListGroupItem>
                            )}

                            <ListGroupItem className={`${dateColor === 'custom' ? 'bg-primary text-white' : null} border-0 rounded`}    >
                                <span id='Popover2' onClick={() => onClickCustomRange()}>
                                    {getFormattedMessage( 'date-picker.filter.Custom-Range.label' )}
                                </span>
                                <Popover trigger='legacy' placement='left' className={`date-picker__child-popover date-picker__child-popover ${isNepaliDatePickerEnabled() ? 'nepali-datepicker' : ''}`}
                                    isOpen={childPopoverOpen} target='Popover2' toggle={toggleChild} >
                                    <PopoverBody>
                                        <Row>
                                            <Col md={6} xs={12}>
                                                <div className='datepicker mb-4 mb-lg-0 p-0'>
                                                    {isNepaliDatePickerEnabled() ? (
                                                        <NepaliDatePickerComponent 
                                                            onChangeDate={onSelectMinDate}
                                                            newStartDate={selectedMinDate}
                                                        />
                                                    ) : (
                                                    <DatePicker locale={language} wrapperClassName='w-100' className='datepicker__custom-datepicker px-3' name='date'
                                                        selected={selectedMinDate} dateFormat='yyyy/MM/dd' startOpen={false}
                                                        onChange={( date ) => onSelectMinDate( date )} ref={el => onDatepickerRef( el )}
                                                    />
                                                    )}
                                                </div>

                                            </Col>
                                            <Col md={6} xs={12}>
                                                <div className='datepicker p-0'>
                                                    {isNepaliDatePickerEnabled() ? (
                                                       <NepaliDatePickerComponent 
                                                           onChangeDate={onSelectMaxDate}
                                                           newStartDate={selectedMaxDate}
                                                       />
                                                    ) : (
                                                    <DatePicker locale={language} wrapperClassName='w-100' className='datepicker__custom-datepicker px-3' name='date'
                                                        selected={selectedMaxDate} dateFormat='yyyy/MM/dd' startOpen={false}
                                                        onChange={( date ) => onSelectMaxDate( date )} minDate={selectedMinDate} ref={el => onDatepickerRef( el )}
                                                    />
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </PopoverBody>
                                </Popover>
                            </ListGroupItem>
                            <div className='mt-3 text-center d-flex flex-row pl-4 align-items-center'>
                                {
                                    applyButton ?
                                        <button className='btn btn-primary text-white me-3' disabled={!childPopoverOpen}
                                            onClick={() => onSelectDate( dateLabelSelector.CUSTOM )}>
                                            {getFormattedMessage( 'date-picker.filter.apply.label' )}
                                        </button> : null
                                }
                                <button className={`${applyButton ? 'ml-3' : '' || dateColor === 'clear' ? 'btn-secondary' : null} btn btn-secondary`}
                                    onClick={() => onSelectDate( dateLabelSelector.CLEAN )}>
                                    {getFormattedMessage( 'date-picker.filter.reset.label' )}
                                </button>
                            </div>
                        </ListGroup>
                    </PopoverBody>
                </Popover>
            </div>
        </div>
    )
};

DateRangePicker.propTypes = {
    filterKey: PropTypes.object,
    options: PropTypes.array,
    filterKeyName: PropTypes.string,
    initialize: PropTypes.func,
    handleFilter: PropTypes.func,
    change: PropTypes.func,
};

export default DateRangePicker;
