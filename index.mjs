import { DB_NAME, client } from "./src/database.mjs";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

import 'dotenv/config'; // para las variables de entorno en local

const app = express();
const PORT = process.env.PORT;
app.use(cors());
app.use(bodyParser.json());

const JWT_KEY = process.env.JWT_KEY;

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).send("Username, email, and password are required");
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in MongoDB
    const usersCollection = client.db(DB_NAME).collection("users");
    const result = await usersCollection.insertOne({
      _id: new ObjectId(),
      username,
      email,
      password: hashedPassword,
      categories: [],
      accounts: [],
      movements: [],
    });

    res.status(201).send(`User created with id ${result.insertedId}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error creating user: " + e.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersCollection = client.db(DB_NAME).collection("users");
    const user = await usersCollection.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate a JWT token
      const token = jwt.sign({ userId: user._id }, JWT_KEY, {
        expiresIn: "1h",
      });

      res.json({ token }); // Send the token to the client
    } else {
      res.status(401).send("Invalid email or password");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Error during login");
  }
});

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
