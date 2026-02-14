import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './api';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve Frontend (Dashboard)
// We assume the frontend is built to /dist/dashboard
const dashboardPath = path.join(__dirname, '../../dist/dashboard');
app.use(express.static(dashboardPath));

app.get(/^(.*)$/, (req, res) => {
    res.sendFile(path.join(dashboardPath, 'index.html'));
});

export const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Dashboard running on http://localhost:${PORT}`);
    });
};
