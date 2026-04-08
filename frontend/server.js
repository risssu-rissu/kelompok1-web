require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve public static files statically
app.use(express.static(path.join(__dirname, '/')));

// Base route fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Frontend berjalan di http://localhost:${PORT}`);
    console.log(`🔗 Terhubung dengan Backend di port: ${process.env.BACKEND_API_PORT || 5000}`);
    console.log(`========================================\n`);
});
