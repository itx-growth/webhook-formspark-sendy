const express = require('express');
const axios = require('axios');
const app = express();

// Middleware do parsowania JSON
app.use(express.json());

// Dane Sendy z zmiennych środowiskowych
const SENDY_URL = process.env.SENDY_URL || 'https://sendy.555.com/subscribe';
const SENDY_API_KEY = process.env.SENDY_API_KEY;
const SENDY_LIST_ID = process.env.SENDY_LIST_ID;
const FORMSPARK_SECRET = process.env.FORMSPARK_SECRET; // Tajny klucz do weryfikacji Formspark

// Webhook nasłuchujący na POST
app.post('/webhook', async (req, res) => {
    try {
        // Weryfikacja źródła (np. tajny klucz w nagłówku X-Formspark-Secret)
        const secretFromHeader = req.headers['x-formspark-secret'];
        if (!secretFromHeader || secretFromHeader !== FORMSPARK_SECRET) {
            return res.status(401).json({ error: 'Nieautoryzowane żądanie' });
        }

        // Pobierz e-mail i imię z danych Formspark
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Brak wymaganych pól: email lub name' });
        }

        // Przygotuj dane do API Sendy
        const sendyData = {
            api_key: SENDY_API_KEY,
            list: SENDY_LIST_ID,
            email: email,
            name: name, // Dodajemy imię
            boolean: 'true' // Zwraca true/false
        };

        // Wyślij żądanie do Sendy API
        const response = await axios.post(SENDY_URL, new URLSearchParams(sendyData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data === 'true') {
            return res.status(200).json({ message: `Dodano ${name} (${email}) do Sendy` });
        } else {
            return res.status(400).json({ error: `Błąd Sendy: ${response.data}` });
        }
    } catch (error) {
        console.error('Błąd:', error.message);
        return res.status(500).json({ error: 'Wystąpił błąd serwera' });
    }
});

// Uruchom serwer
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook działa na porcie ${PORT}`);
});
