import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/PLRoutes.mjs';
import 'dotenv/config';
import { authStatus } from './src/controllers/authController.mjs';

const app = express();
const PORT = process.env.PORT;

// Middleware para analizar cookies
app.use(cookieParser());

// Middleware para CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://profit-lost.com'],
    credentials: true,
  })
);

// Middleware para manejar JSON en el cuerpo de las solicitudes
app.use(express.json());

// Rutas de autenticación y otras rutas
app.use(authRoutes);

// Endpoint para verificar el estado de autenticación
app.get('/auth-status', authStatus, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
