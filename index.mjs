import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./src/routes/authRoutes.mjs";
import { DB_NAME, client } from "./src/config/database.mjs";
import { PORT } from "../src/config/constants.mjs";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(authRoutes);

// Start Express's server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Try a db connection
async function testDBConnection() {
  try {
    const usersCollection = client.db(DB_NAME).collection("users");
    const documents = await usersCollection.find({}).toArray();
    console.log("Documents in the Users collection:", documents);
  } catch (e) {
    console.error("Error retrieving documents:", e);
  }
}
testDBConnection();
