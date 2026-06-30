import React from 'react';
import { Card } from 'react-bootstrap';
import moment from 'moment';
import { getDecimalPlaces, getFormattedMessage } from '../../shared/sharedMethod';
import ReactECharts from 'echarts-for-react';

const TopCustomersChart = ({ frontSetting, topCustomers, allConfigData, languageCode , settings }) => {
  const month = new Date();
  const currency = frontSetting?.value?.currency_symbol || '$';
  const decimalPlaces = getDecimalPlaces(settings)

  const allAopCustomersNames = topCustomers?.name || [];
  const allAopCustomers = topCustomers?.grand_total || [];

  const allData = allAopCustomers.map((value, i) => ({
    value: parseFloat(value).toFixed(decimalPlaces),
    name: allAopCustomersNames[i]
  }));

  const option = {
    title: {
      text: '',
      subtext: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: allConfigData?.is_currency_right === 'true'
        ? `{b} : {c} ${currency} ({d}%)`
        : `{b} : ${currency} {c} ({d}%)`,
    },
    legend: {
      orient: 'vertical',
      left: 'right'
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
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div className='col-xxl-4 col-12'>
      <Card>
        <Card.Header className='pb-0 px-0 justify-content-center'>
          <h5 className="mb-0">
            {getFormattedMessage('dashboard.top-customers.title')}
            ({moment(month).locale(languageCode).format('MMMM')})
          </h5>
        </Card.Header>
        <Card.Body className='p-3'>
          <ReactECharts
            key={JSON.stringify(allData)}
            option={option}
            style={{ height: 400 }}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default TopCustomersChart;
