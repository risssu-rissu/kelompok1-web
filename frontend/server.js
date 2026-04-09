const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5031;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5041';

// Proxy semua request /api/* ke backend server
// Menggunakan syntax http-proxy-middleware v3: path filter sebagai argument pertama
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/'  // Express strips '/api' prefix, so we add it back
    },
    on: {
        error: (err, req, res) => {
            console.error('Proxy error:', err.message);
            res.status(502).json({ message: 'Backend tidak dapat dihubungi' });
        }
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
