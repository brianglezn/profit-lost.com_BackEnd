import { ObjectId } from 'mongodb';
import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const usersCollection = client.db(DB_NAME).collection("users");

export async function getUserByToken(req, res) {
    console.log("Getting user by ID...");
    const userId = req.user.id; // Asegúrate de que esto coincide con cómo almacenaste el id en el token
    console.log(`UserID from token: ${userId}`);

    try {
        const user = await usersCollection.findOne({ "_id": new ObjectId(userId) });
        if (user) {
            console.log("User found:", user);
            res.json(user);
        } else {
            console.log("User not found");
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error retrieving user by token:", error);
        res.status(500).send("Error retrieving user data by token");
    }
}
