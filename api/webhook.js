const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metoda nieobsługiwana, użyj POST' });
    }

    const secretFromHeader = req.headers['x-formspark-secret'];
    if (!secretFromHeader || secretFromHeader !== process.env.FORMSPARK_SECRET) {
        return res.status(401).json({ error: 'Nieautoryzowane żądanie' });
    }

    const { email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ error: 'Brak wymaganych pól: email lub name' });
    }

    const sendyData = {
        api_key: process.env.SENDY_API_KEY,
        list: process.env.SENDY_LIST_ID,
        email: email,
        name: name,
        boolean: 'true'
    };

    try {
        const response = await axios.post(
            process.env.SENDY_URL,
            new URLSearchParams(sendyData),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data === 'true') {
            return res.status(200).json({ message: `Dodano ${name} (${email}) do Sendy` });
        } else {
            return res.status(400).json({ error: `Błąd Sendy: ${response.data}` });
        }
    } catch (error) {
        console.error('Błąd:', error.message);
        return res.status(500).json({ error: 'Wystąpił błąd serwera' });
    }
};
