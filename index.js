const express = require('express');
const axios = require('axios');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

const API_KEY = 'YOUR_API_KEY';
const API_SECRET = 'YOUR_API_SECRET';
const URL = 'https://api.upstox.com';

const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer {your_access_token}',
};

const data = {
    quantity: 1,
    product: 'D',
    validity: 'DAY',
    price: 0,
    tag: 'string',
    instrument_token: 'NSE_EQ|INE669E01016',
    order_type: 'MARKET',
    transaction_type: 'BUY',
    disclosed_quantity: 0,
    trigger_price: 0,
    is_amo: false,
};

axios.post(`${URL}/v2/order/place`, data, { headers })
    .then(response => {
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });


app.get(`${URL}/holdings`, async (req, res) => {
    try {

        const response = await axios.get(`${URL}/holdings`, {
            headers: {
                'x-api-key': API_KEY,
                'Authorization': `Bearer ${API_SECRET}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch holdings' });
    }
});


app.post(`${URL}/buy`, async (req, res) => {
    try {
        const { symbol, quantity, price } = req.body;


        const response = await axios.post(`${URL}/order`, {
            symbol,
            quantity,
            transaction_type: 'BUY',
            order_type: 'LIMIT',
            product: 'MIS',
            price,
        }, {
            headers: {
                'x-api-key': API_KEY,
                'Authorization': `Bearer ${API_SECRET}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to place buy order' });
    }
});


app.post(`${URL}/sell`, async (req, res) => {
    try {
        const { symbol, quantity, price } = req.body;


        const response = await axios.post(`${URL}/order`, {
            symbol,
            quantity,
            transaction_type: 'SELL',
            order_type: 'LIMIT',
            product: 'MIS',
            price,
        }, {
            headers: {
                'x-api-key': API_KEY,
                'Authorization': `Bearer ${API_SECRET}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to place sell order' });
    }
});


const ws = new WebSocket('wss://api.upstox.com/ws/upstox');

ws.on('open', function open() {
    console.log('WebSocket connection opened');

    ws.send(JSON.stringify({ subscribe: ['nse_eq:SBIN', 'nse_eq:INFY'] }));
});

ws.on('message', function incoming(data) {
    console.log('Received message:', data);

});


app.post(`${URL}/postback`, (req, res) => {

    console.log('Received postback:', req.body);
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
