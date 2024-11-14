import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoutes from "./src/routes/PLRoutes.mjs";
import "dotenv/config";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://profit-lost.com'],
    credentials: true,
  })
);
app.use(express.json());
const PORT = process.env.PORT;

app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
