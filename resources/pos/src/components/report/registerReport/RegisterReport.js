import React, { useEffect, useRef, useState } from "react";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getAvatarName,
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { useDispatch, useSelector } from "react-redux";
import { getAllRegisterReportDetailsAction } from "../../../store/action/pos/posRegisterDetailsAction";
import moment from "moment";
import ReactSelect from "../../../shared/select/reactSelect";
import { fetchUsers } from "../../../store/action/userAction";
import RegisterDetailsModel from "../../../frontend/components/register-detailsModal/RegisterDetailsModel";
import { useReactToPrint } from "react-to-print";
import PrintRegisterDetailsData from "../../../frontend/components/printModal/PrintRegisterDetailsData";

const RegisterReport = () => {
    const dispatch = useDispatch();
    const {
        isLoading,
        totalRecord,
        registerReportDetails,
        frontSetting,
        allConfigData,
        dates,
        users,
        posAllTodaySaleOverAllReport,
        closeRegisterDetails,
        settings
    } = useSelector((state) => state);

    const registerDetailsRef = useRef();
    const [userData, setUserData] = useState({});
    const [usersData, setUsersData] = useState({
        usersDataOptions: [],
        userDataOptiosType: [],
    });
    const [tableFilter, setTableFilter] = useState({});
    const [lgShow, setLgShow] = useState(false);
    const [report, setReport] = useState();

    useEffect(() => {
        dispatch(fetchUsers({}, true, "?page[size]=0&returnAll=true"));
    }, []);

    useEffect(() => {
        if (users?.length > 0) {
            setUsersData((data) => ({
                ...data,
                usersDataOptions: users?.map((user) => ({
                    id: user?.id,
                    name: `${user?.attributes?.first_name} ${
                        user?.attributes?.last_name !== "" &&
                        user?.attributes?.last_name !== null &&
                        user?.attributes?.last_name !== undefined
                            ? user?.attributes?.last_name
                            : ""
                    }`,
                })),
            }));
        }
    }, [users]);

    useEffect(() => {
        if (usersData?.usersDataOptions?.length > 0) {
            setUsersData((data) => ({
                ...data,
                userDataOptiosType: usersData?.usersDataOptions?.map(
                    (user) => ({
                        value: user.id,
                        label: user?.name,
                    })
                ),
            }));
        }
    }, [usersData?.usersDataOptions]);

    useEffect(() => {
        if (dates?.end_date === undefined && dates?.start_date === undefined) {
            if (userData?.value !== undefined) {
                dispatch(
                    getAllRegisterReportDetailsAction({
                        query: `?user_id=${userData?.value}`,
                    })
                );
            }
        } else {
            if (userData?.value !== undefined) {
                dispatch(
                    getAllRegisterReportDetailsAction({
                        query: `?user_id=${userData?.value}&start_date=${dates?.start_date}&end_date=${dates?.end_date}`,
                    })
                );
            } else {
                dispatch(
                    getAllRegisterReportDetailsAction({
                        query: `?start_date=${dates?.start_date}&end_date=${dates?.end_date}`,
                    })
                );
            }
        }
    }, [dates, userData]);

    const itemsValue =
        registerReportDetails?.length > 0 &&
        registerReportDetails?.map((registerReport) => ({
            id: registerReport?.id,
            open_date: getFormattedDate(registerReport?.attributes?.created_at, allConfigData),
            open_time: moment(registerReport?.attributes?.created_at).format(
                "LT"
            ),
            created_at: registerReport?.attributes?.created_at,
            close_date: getFormattedDate(registerReport?.attributes?.closed_at, allConfigData),
            close_time: moment(registerReport?.attributes?.closed_at).format(
                "LT"
            ),
            user_first_name: registerReport?.attributes?.user?.first_name,
            user_last_name: registerReport?.attributes?.user?.last_namez,
            user_email: registerReport?.attributes?.user?.email,
            user_image: registerReport?.attributes?.user?.image_url,
            cash_in_hand: registerReport?.attributes?.cash_in_hand,
            cash_in_hand_while_closing:
                registerReport?.attributes?.cash_in_hand_while_closing,
            currency: frontSetting?.value?.currency_symbol,
            notes: registerReport?.attributes?.notes ? registerReport?.attributes?.notes : '-',
        }));

    const checkForDifferences = (filter) => {
        for (const key in filter) {
            if (filter[key] !== tableFilter[key]) {
                return true;
            }
        }
        return false;
    };

    const onChange = (filter) => {
        setTableFilter(filter);
        const hasDifferences = checkForDifferences(filter);
        if (userData?.value === undefined) {
            dispatch(getAllRegisterReportDetailsAction({ filter }));
        } else if (hasDifferences) {
            if (
                dates?.end_date === undefined &&
                dates?.start_date === undefined
            ) {
                if (userData?.value !== undefined) {
                    dispatch(
                        getAllRegisterReportDetailsAction({
                            query: `?user_id=${userData?.value}`,
                            filter,
                        })
                    );
                }
            } else {
                if (userData?.value !== undefined) {
                    dispatch(
                        getAllRegisterReportDetailsAction({
                            query: `?user_id=${userData?.value}&start_date=${dates?.start_date}&end_date=${dates?.end_date}`,
                            filter,
                        })
                    );
                } else {
                    dispatch(
                        getAllRegisterReportDetailsAction({
                            query: `?start_date=${dates?.start_date}&end_date=${dates?.end_date}`,
                            filter,
                        })
                    );
                }
            }
        }
    };

    const onReportsClick = (data) => {
        setReport(data);
        setLgShow(true);
    }

    const handleRegisterDetailsPrint = useReactToPrint({
        content: () => registerDetailsRef.current,
    });

    const printRegisterDetails = () => {
        document.getElementById("printRegisterDetailsId").click();
    };

    const columns = [
        {
            name: getFormattedMessage("user-details.table.opened-on.row.label"),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.open_date}</div>
                        {row.open_time}
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("user-details.table.closde-on.row.label"),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.close_date}</div>
                        {row.close_time}
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("users.table.user.column.title"),
            selector: (row) => row.user_first_name,
            sortField: "first_name",
            sortable: false,
            cell: (row) => {
                const imageUrl = row.user_image ? row.user_image : null;
                const lastName =
                    row.user_last_name !== "" &&
                    row.user_last_name !== null &&
                    row.user_last_name !== undefined
                        ? row.user_last_name
                        : "";
                return (
                    <div className="d-flex align-items-center">
                        <div className="me-2">
                            <div>
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        height="50"
                                        width="50"
                                        alt="User Image"
                                        className="image image-circle image-mini"
                                    />
                                ) : (
                                    <span className="custom-user-avatar fs-5">
                                        {getAvatarName(
                                            row.user_first_name + " " + lastName
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="d-flex flex-column">
                            <div>{row.user_first_name + " " + lastName}</div>
                            <span>{row.user_email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("globally.input.cash-in-hand.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.cash_in_hand
                ),
            sortField: "cash_in_hand",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "globally.input.cash-in-hand-while-closing.label"
            ),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.cash_in_hand_while_closing
                ),
            sortField: "cash_in_hand_while_closing",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.input.notes.label"),
            selector: (row) => row.notes,
            sortField: "notes",
            sortable: false,
            cell: (row) => {
                return (
                    <div>
                        {row.notes?.length > 30
                            ? row.notes?.substring(0, 29) + "..."
                            : row.notes}
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "115px",
            cell: (row) => (
                <button
                    className="btn btn-sm btn-primary"
                    variant="primary"
                onClick={() => onReportsClick(row)}
                >
                    {getFormattedMessage("reports.title")}
                </button>
            ),
        },
    ];

    const loadRegisterDetailsPrint = () => {
        return (
            <div className="d-none">
                <button
                    id="printRegisterDetailsId"
                    onClick={handleRegisterDetailsPrint}
                >
                    Print this out!
                </button>
                <PrintRegisterDetailsData
                    ref={registerDetailsRef}
                    allConfigData={allConfigData}
                    frontSetting={frontSetting}
                    posAllTodaySaleOverAllReport={posAllTodaySaleOverAllReport}
                    closeRegisterDetails={closeRegisterDetails}
                    report={report}
                />
            </div>
        );
    };

    const onUserChange = (data) => {
        setUserData(data);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("register.report.title")} />
            {loadRegisterDetailsPrint()}
            <div className="mx-auto col-12 col-md-4">
                <ReactSelect
                    multiLanguageOption={usersData?.usersDataOptions}
                    onChange={onUserChange}
                    defaultValue={usersData?.userDataOptiosType[0]}
                    title={getFormattedMessage("users.title")}
                    errors={""}
                    placeholder={placeholderText("select.user.label")}
                    isRequired
                />
            </div>
            <div>
                <ReactDataTable
                    columns={columns}
                    isShowSearch
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isLoading}
                    totalRows={totalRecord}
                    isShowDateRangeField
                    isShowFilterField={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
                    isFiscalYearFilter={settings?.attributes?.enable_fiscal_year_filter == 0 ? false : true}
                />
            </div>
            {lgShow && (
                <RegisterDetailsModel
                    printRegisterDetails={printRegisterDetails}
                    frontSetting={frontSetting}
                    lgShow={lgShow}
                    setLgShow={setLgShow}
                    report={report}
                />
            )}
        </MasterLayout>
    );
};

export default RegisterReport;
