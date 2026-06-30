import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Card, NavDropdown } from "react-bootstrap";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getPermission,
    getFormattedDate,
} from "../../shared/sharedMethod";
import { Row } from "react-bootstrap-v5";
import { connect } from "react-redux";
import { weekSalePurchases } from "../../store/action/weeksalePurchaseAction";
import { yearlyTopProduct } from "../../store/action/yearlyTopProductAction";
import moment from "moment";
import TopSellingProductChart from "./TopSellingProductChart";
import LineChart from "./LineChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Permissions } from "../../constants";

const ThisWeekSalePurchaseChart = (props) => {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    const {
        frontSetting,
        weekSalePurchases,
        weekSalePurchase,
        yearTopProduct,
        yearlyTopProduct,
        allConfigData,
    } = props;

    const [isLineChart, isSetLineChart] = useState(false);
    const year = new Date();

    useEffect(() => {
        weekSalePurchases();
        yearlyTopProduct();
    }, []);

    const currency = frontSetting
        ? frontSetting.value && frontSetting.value.currency_symbol
        : "$";

    const valueFormatter = (tooltipItems) => {
        const value = tooltipItems.dataset.data[tooltipItems.dataIndex];
        const label = tooltipItems.dataset.label;
        const currencySymbol = currency ? currency : "";
        return (
            label +
            " : " +
            currencySymbolHandling(allConfigData, currencySymbol, value, true)
        );
    };

    const yFormatter = (yValue) => {
        const value = yValue;
        const currencySymbol = currency ? currency : "";
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            value,
            true
        );
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItems) => valueFormatter(tooltipItems),
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value) => yFormatter(value),
                },
                title: {
                    display: true,
                    text: placeholderText("expense.input.amount.label"),
                    align: "center",
                },
            },
        },
    };

    const labels = weekSalePurchase ? weekSalePurchase.dates && weekSalePurchase.dates.length > 0 && weekSalePurchase.dates.map((date) => getFormattedDate(date, allConfigData)) : [];

    const data = {
        labels,
        datasets: [
            {
                label: placeholderText("sales.title"),
                data: weekSalePurchase ? weekSalePurchase.sales : "",
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "rgba(91, 134, 229, 0.6)";

                    const gradientNormal = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradientNormal.addColorStop(0, "rgba(54, 209, 220, 0.3)");
                    gradientNormal.addColorStop(1, "rgba(91, 134, 229, 0.9)");

                    const gradientHover = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradientHover.addColorStop(0, "rgba(255, 175, 189, 0.3)");
                    gradientHover.addColorStop(1, "rgba(255, 105, 180, 0.9)");

                    return context.active ? gradientHover : gradientNormal;
                },
                borderColor: (context) =>
                    context.active ? "rgba(255, 105, 180, 0.9)" : "rgba(91, 134, 229, 0.8)",
                borderWidth: 1,
                borderRadius: 5,
            },
            {
                label: placeholderText("purchases.title"),
                data: weekSalePurchase ? weekSalePurchase.purchases : "",
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "rgba(29, 209, 161, 0.6)";

                    const gradientNormal = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradientNormal.addColorStop(0, "rgba(129, 236, 236, 0.3)");
                    gradientNormal.addColorStop(1, "rgba(29, 209, 161, 0.9)");

                    const gradientHover = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradientHover.addColorStop(0, "rgba(255, 216, 155, 0.3)");
                    gradientHover.addColorStop(1, "rgba(255, 142, 83, 0.9)");

                    return context.active ? gradientHover : gradientNormal;
                },
                borderColor: (context) =>
                    context.active ? "rgba(255, 142, 83, 0.9)" : "rgba(29, 209, 161, 0.8)",
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    };

    return (
        <Row className="g-4">
            <div className={`${getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE) ? 'col-xxl-8' : 'col-xxl-12'} col-12`}>
                <Card>
                    <Card.Header className="pb-0 px-10">
                        <h5 className="mb-0">
                            {getFormattedMessage(
                                "dashboard.ThisWeekSales&Purchases.title"
                            )}
                        </h5>
                        <div className="mb-2 chart-dropdown">
                            <NavDropdown
                                title={<FontAwesomeIcon icon={faBars} />}
                            >
                                <NavDropdown.Item
                                    href="#/"
                                    onClick={() => isSetLineChart(false)}
                                    className={`${
                                        isLineChart === true
                                            ? ""
                                            : "text-primary"
                                    } fs-6`}
                                >
                                    {getFormattedMessage("bar.title")}
                                </NavDropdown.Item>
                                <NavDropdown.Item
                                    href="#"
                                    className={`${
                                        isLineChart === true
                                            ? "text-primary"
                                            : ""
                                    } fs-6`}
                                    onClick={() => isSetLineChart(true)}
                                >
                                    {getFormattedMessage("line.title")}
                                </NavDropdown.Item>
                            </NavDropdown>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div>
                            {data && currency && isLineChart === false && (
                                <Bar
                                    options={options}
                                    data={data}
                                    height={100}
                                />
                            )}
                            {data && currency && isLineChart === true && (
                                <LineChart
                                    allConfigData={allConfigData}
                                    weekSalePurchase={weekSalePurchase}
                                    frontSetting={frontSetting}
                                />
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>
            {getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE) &&
                <div className="col-xxl-4 col-12">
                    <Card>
                        <Card.Header className="pb-0 px-0 justify-content-center">
                            <h4 className="mb-3 me-1">
                                {getFormattedMessage(
                                    "dashboard.TopSellingProducts.title"
                                )}
                            </h4>
                            <h4>({moment(year).format("YYYY")})</h4>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {/*<div className='h-75 w-75 align-items-center'>*/}
                            <TopSellingProductChart
                                yearTopProduct={yearTopProduct}
                                frontSetting={frontSetting}
                            />
                            {/*</div>*/}
                        </Card.Body>
                    </Card>
                </div>}
        </Row>
    );
};

const mapStateToProps = (state) => {
    const { weekSalePurchase, yearTopProduct, allConfigData } = state;
    return { weekSalePurchase, yearTopProduct, allConfigData };
};

export default connect(mapStateToProps, {
    weekSalePurchases,
    yearlyTopProduct,
})(ThisWeekSalePurchaseChart);
