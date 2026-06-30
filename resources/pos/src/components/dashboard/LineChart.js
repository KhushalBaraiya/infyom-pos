import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {Line} from 'react-chartjs-2';
import {connect} from 'react-redux';
import {weekSalePurchases} from '../../store/action/weeksalePurchaseAction';
import {yearlyTopProduct} from '../../store/action/yearlyTopProductAction';
import {getFormattedDate, placeholderText} from "../../shared/sharedMethod";

const LineChart = (props) => {
    const {weekSalePurchase, frontSetting, allConfigData} = props

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    );

    const currency = frontSetting ? frontSetting.value && frontSetting.value.currency_symbol : ' $';
    const valueFormatter = (tooltipItems) => {
        const value = (tooltipItems.dataset.data[tooltipItems.dataIndex])
        const label = tooltipItems.dataset.label
        return label + ' : ' + `${currency ? currency : ''} ` + parseFloat(value).toFixed(2)
    };

    const yFormatter = (yValue) => {
        const value = yValue
        return `${currency ? currency : ''} ` + parseFloat(value).toFixed(2)
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItems, data) => valueFormatter(tooltipItems)
                }
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value, index, values) => yFormatter(value)
                },
                title: {
                    display: true,
                    text: placeholderText("expense.input.amount.label"),
                    align: 'center'
                }
            }
        },
    };

    const labels = weekSalePurchase ? weekSalePurchase.dates && weekSalePurchase.dates.length > 0 && weekSalePurchase.dates.map((date) => getFormattedDate(date, allConfigData)) : [];

    const data = {
        labels,
        datasets: [
            {
                label: placeholderText("sales.title"),
                data: weekSalePurchase ? weekSalePurchase.sales : '',
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
                data: weekSalePurchase ? weekSalePurchase.purchases : '',
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
    return <Line options={options} data={data} height={100} />
}

const mapStateToProps = (state) => {
    const { weekSalePurchase, yearTopProduct } = state;
    return { weekSalePurchase, yearTopProduct }
};

export default connect(mapStateToProps, { weekSalePurchases, yearlyTopProduct })(LineChart);

