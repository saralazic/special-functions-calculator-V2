import express from 'express';
import cors from 'cors';
import path from 'path';
let calculateRouter;
try {
  // Try to require, fallback to empty router if not found to prevent crash on missing module during dev/test
  calculateRouter = require('./routes/calculate').calculateRouter || (() => { const r = require('express').Router(); return r; })();
} catch (e) {
  console.warn("Warning: './routes/calculate' not found, continuing without calculate routes.");
  calculateRouter = require('express').Router();
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', calculateRouter);

const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
