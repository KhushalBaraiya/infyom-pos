import React from 'react';
import ReactECharts from 'echarts-for-react';

const TopSellingProductChart = ({ yearTopProduct }) => {
  const allQuantity = yearTopProduct?.total_quantity || [];
  const allName = yearTopProduct?.name || [];

  const allData = allQuantity.map((value, i) => ({
    value: value,
    name: allName[i],
  }));

  const option = {
    title: {
      text: '',
      subtext: '',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: allData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
};

export default TopSellingProductChart;
