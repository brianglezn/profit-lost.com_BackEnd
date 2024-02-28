import { ObjectId } from 'mongodb';

import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getAllMovements(req, res) {
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({ "user_id": new ObjectId(userId) }).toArray();

        const formattedMovements = movements.map(movement => ({
            "user_id": movement.user_id,
            "date": movement.date,
            "category": movement.category,
            "description": movement.description,
            "amount": movement.amount
        }));

        res.json(formattedMovements);
    } catch (error) {
        console.error("Error retrieving movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}




export async function getMovementsByYear(req, res) {

}

