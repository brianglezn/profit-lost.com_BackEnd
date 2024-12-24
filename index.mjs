import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./src/routes/auth.routes.mjs";
import accountsRoutes from "./src/routes/accounts.routes.mjs";
import categoriesRoutes from "./src/routes/categories.routes.mjs";
import movementsRoutes from "./src/routes/movements.routes.mjs";
import notesRoutes from "./src/routes/notes.routes.mjs";
import userRoutes from "./src/routes/users.routes.mjs";

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});