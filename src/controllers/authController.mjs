import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { client } from "../config/database.mjs";
import { DB_NAME, JWT_KEY } from "../config/constants.mjs";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).send("Username, email, and password are required");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const usersCollection = client.db(DB_NAME).collection("users");
        const result = await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).send(`User created with id ${result.insertedId}`);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error creating user: " + e.message);
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const usersCollection = client.db(DB_NAME).collection("users");
        const user = await usersCollection.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ userId: user._id }, JWT_KEY, {
                expiresIn: "1h",
            });
            res.json({ token });
        } else {
            res.status(401).send("Invalid email or password");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error during login");
    }
}
