export const initializeWebSocket = (onMessage, interval = '5m') => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`);

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.k && message.k.x) { // Check if it's a complete candlestick
        onMessage(message);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket closed. Reconnecting...');
        setTimeout(() => initializeWebSocket(onMessage), 1000);
    };

    return ws;
};  