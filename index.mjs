import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoutes from "./src/routes/PLRoutes.mjs";
import "dotenv/config";

import { authStatus } from "./src/controllers/authController.mjs";

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/auth-status', authStatus, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});