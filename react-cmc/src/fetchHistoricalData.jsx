import axios from 'axios';

export const fetchHistoricalData = async (symbol, interval, limit = 500) => {
    const endpoint = `https://api.binance.com/api/v3/klines`;
    const params = {
        symbol,
        interval,
        limit,
    };

    const response = await axios.get(endpoint, { params });
    return response.data.map(candle => [
        candle[0],           // Open time (timestamp)
        parseFloat(candle[1]), // Open price
        parseFloat(candle[2]), // High price
        parseFloat(candle[3]), // Low price
        parseFloat(candle[4]), // Close price
    ]);
};
