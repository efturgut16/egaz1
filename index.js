const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// CORS için yapılandırma
app.use(cors());

app.use(express.json());

app.post('/getPrices', async (req, res) => {
    const ilCode = req.body.ilCode;
    try {
        const dateResponse = await axios.post('https://kurumsal.aygaz.com.tr/otogaz/otogazapi.aspx/gecerlilikTarihleriGetir', {
            il: ilCode
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const dates = dateResponse.data.d ? JSON.parse(dateResponse.data.d) : [];

        const prices = await Promise.all(dates.map(async (date) => {
            const priceResponse = await axios.post('https://kurumsal.aygaz.com.tr/otogaz/otogazapi.aspx/fiyatGetir', {
                il: ilCode,
                tarih: date
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return {
                date: date,
                price: priceResponse.data.d ? JSON.parse(priceResponse.data.d) : undefined
            };
        }));

        res.json(prices);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log('Server running on http://localhost:3000');
});