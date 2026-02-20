const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS
app.use(cors());

// JSON parse
app.use(express.json());

// Health check (Render için iyi olur)
app.get('/', (req, res) => {
    res.send('API is running');
});

app.post('/getPrices', async (req, res) => {
    const ilCode = req.body.ilCode;

    if (!ilCode) {
        return res.status(400).json({ error: "ilCode is required" });
    }

    try {
        const dateResponse = await axios.post(
            'https://kurumsal.aygaz.com.tr/otogaz/otogazapi.aspx/gecerlilikTarihleriGetir',
            { il: ilCode },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const dates = dateResponse.data.d ? JSON.parse(dateResponse.data.d) : [];

        const prices = await Promise.all(
            dates.map(async (date) => {
                const priceResponse = await axios.post(
                    'https://kurumsal.aygaz.com.tr/otogaz/otogazapi.aspx/fiyatGetir',
                    { il: ilCode, tarih: date },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                return {
                    date: date,
                    price: priceResponse.data.d
                        ? JSON.parse(priceResponse.data.d)
                        : null
                };
            })
        );

        res.json(prices);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});