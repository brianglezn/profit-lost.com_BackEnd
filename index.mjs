import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./src/routes/auth.routes.mjs";
import accountsRoutes from "./src/routes/accounts.routes.mjs";
import categoriesRoutes from "./src/routes/categories.routes.mjs";
import movementsRoutes from "./src/routes/movements.routes.mjs";
import notesRoutes from "./src/routes/notes.routes.mjs";
import userRoutes from "./src/routes/users.routes.mjs";

import BackupService from "./src/services/backupService.mjs";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

// Health check route
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Pong' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/movements', movementsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/user', userRoutes);


// Inicializar servicio de backup
const backupService = new BackupService();
backupService.startScheduledBackups();

// Endpoint de backup
app.post('/backup', async (req, res) => {
  try {
    const result = await backupService.executeBackup();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});