const express = require('express');
const path = require('path');

const app = express();

const PORT = process.env.FRONTEND_PORT || 3000;

// Serve the static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// SPA fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Minimal SPA fallback without path-to-regexp wildcard issues
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});



app.listen(PORT, () => {
  console.log(`Frontend Server Running at http://localhost:${PORT}`);
});

