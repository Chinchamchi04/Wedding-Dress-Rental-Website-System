import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import appointmentRoutes from './routes/appointment.routes.js';
import orderRoutes from './routes/order.routes.js';
import contractTemplateRoutes from './routes/contractTemplate.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middlewares cơ bản
app.use(cors({
  origin(origin, callback) {
    const configured = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((value) => value.trim());
    const localDev = process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):(3000|5173|5174)$/.test(origin || '');
    callback(null, !origin || configured.includes(origin) || localDev);
  },
  credentials: true,
}));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
// Mount the OTP authentication endpoints before the legacy API router, which
// also defines /auth/login and /auth/register.
app.use('/api/auth', authRoutes);
app.use('/api', apiRouter);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contract-templates', contractTemplateRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Wedding Dress Rental API is running' });
});

app.use(errorHandler);

export default app;
