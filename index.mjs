import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/PLRoutes.mjs";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});