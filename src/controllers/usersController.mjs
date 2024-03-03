import { ObjectId } from 'mongodb';
import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const usersCollection = client.db(DB_NAME).collection("users");

export async function getUserByToken(req, res) {
    const userId = req.user.userId; 

    try {
        const user = await usersCollection.findOne({ "_id": new ObjectId(userId) });
        if (user) {
            res.json(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error retrieving user by token:", error);
        res.status(500).send("Error retrieving user data");
    }
}
