// src/BTCChart.js
import { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { initializeWebSocket } from './BinanceWebSocket';
import { fetchHistoricalData } from './fetchHistoricalData';

const CryptoChart = () => {
    const chartComponentRef = useRef(null); // Reference to Highcharts instance
    const [interval, setInterval] = useState('1m'); // Interval for WebSocket and historical data

    const [chartOptions, setChartOptions] = useState({
        title: { text: 'BTC/USDT Real-Time Candlestick Chart' },
        chart: {
            width: 1800,
            height: 1000
        },
        rangeSelector: {
            enabled: false
        },
        series: [{
            type: 'candlestick',
            name: 'BTC/USDT',
            data: [],
        }],
        xAxis: { type: 'datetime' },
        yAxis: {
            title: { text: 'Price (USDT)' },
            opposite: false,
        },
    });

  useEffect(() => {
    const loadChartData = async () => {
        // Step 1: Fetch historical data
        const historicalData = await fetchHistoricalData('BTCUSDT', interval, 500);

        // Step 2: Set historical data to chart
        setChartOptions((prevOptions) => ({
            ...prevOptions,
            series: [{ ...prevOptions.series[0], data: historicalData }],
        }));

        // Step 3: Connect to WebSocket for real-time updates
        const processMessage = (message) => {
            const { t, o, h, l, c, x } = message.k;
            const timestamp = t;
            const newPoint = [timestamp, parseFloat(o), parseFloat(h), parseFloat(l), parseFloat(c)];

            // Update chart with new point if WebSocket data represents a closed candlestick
            if (x && chartComponentRef.current) {
                const chart = chartComponentRef.current.chart;
                const series = chart.series[0];
                
                // Add point and shift old data
                series.addPoint(newPoint, true, series.data.length >= 500);
            }
        };

        const ws = initializeWebSocket(processMessage, interval);
        return () => ws.close(); // Cleanup on unmount
    };

    loadChartData();
  }, [interval]); // Reload data and WebSocket on interval change

    return (
        <div>
            <div>
                <select onChange={(e) => setInterval(e.target.value)} value={interval}>
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="1h">1 Hour</option>
                </select>
            </div>
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={chartOptions}
                ref={chartComponentRef}
            />
        </div>
    );
};

export default CryptoChart;