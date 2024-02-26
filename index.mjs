import express from "express";
import cors from "cors";

import authRoutes from "./src/routes/authRoutes.mjs";
import { DB_NAME, client } from "./src/config/database.mjs";
import { PORT } from "./src/config/constants.mjs";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);

// Start Express's server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
