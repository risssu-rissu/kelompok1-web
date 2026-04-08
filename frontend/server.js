const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5031;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// Proxy semua request /api/* ke backend server
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({ message: 'Backend tidak dapat dihubungi' });
    }
}));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// SPA fallback - semua route yang tidak dikenali akan diarahkan ke index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Frontend berjalan di http://localhost:${PORT}`);
    console.log(`🔗 API Proxy target: ${BACKEND_URL}`);
    console.log(`========================================\n`);
});
