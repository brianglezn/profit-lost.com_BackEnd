import express from "express";
import cors from "cors";

import authRoutes from "./src/routes/PLRoutes.mjs";
import { PORT } from "./src/config/constants.mjs";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
