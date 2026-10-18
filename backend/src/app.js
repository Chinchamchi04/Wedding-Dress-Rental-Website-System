import express from 'express';
import cors from 'cors';
import dressRoutes from './routes/dress.routes.js';

const app = express();

// Middlewares cơ bản
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Wedding Dress Rental API is running' });
});

// API Routes
app.use('/api/dresses', dressRoutes);

export default app;
