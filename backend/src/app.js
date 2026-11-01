import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import orderRoutes from './routes/order.routes.js';
import contractTemplateRoutes from './routes/contractTemplate.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Cấu hình CORS cho phép cả cổng 5173 (Vite), 3000 và các origin cấu hình
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Trong môi trường dev cho phép pass
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Wedding Dress Rental API is running' });
});

// Gắn các Routers API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contract-templates', contractTemplateRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', apiRouter);

// Bắt lỗi tập trung
app.use(errorHandler);

export default app;
