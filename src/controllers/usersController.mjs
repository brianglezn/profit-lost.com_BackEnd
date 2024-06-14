import { ObjectId } from 'mongodb';
import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const usersCollection = client.db(DB_NAME).collection("users");

export async function getUserByToken(req, res) {
    try {
        const userId = req.user.userId;
        const usersCollection = client.db(DB_NAME).collection("users");
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (user) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                surname: user.surname,
                // Añade cualquier otro campo necesario
            });
        } else {
            res.status(404).send("User not found");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching user");
    }
}