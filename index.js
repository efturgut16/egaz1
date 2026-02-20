const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running');
});

app.post('/getPrice', async (req, res) => {
    const { cityId, validityDate } = req.body;

    if (!cityId) {
        return res.status(400).json({ error: "cityId is required" });
    }

    // Eğer tarih gönderilmezse bugünün tarihi
    const date = validityDate 
        ? new Date(validityDate).toISOString()
        : new Date().toISOString();

    try {
        const response = await axios.get(
            'https://mt-ecommerce-productapi.aygaz.com.tr/api/Price/GetOtogazPrice',
            {
                params: {
                    cityId: cityId,
                    validityDate: date
                },
                headers: {
                    "accept": "application/json",
                    "origin": "https://www.aygaz.com.tr",
                    "referer": "https://www.aygaz.com.tr/",
                    "x-appid": "8BC0A9EF-047A-4298-BFE2-942B5AF098CD",
                    "x-devicecode": "WEBCIHAZI-10",
                    "x-lang": "tr"
                }
            }
        );

        res.json(response.data);

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'API error' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});