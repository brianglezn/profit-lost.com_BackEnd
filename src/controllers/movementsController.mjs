import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({
            user_id: userId,
            date: { $regex: `^${year}` }
        }).toArray();

        const formattedMovements = movements.map(movement => ({
            date: movement.date,
            category: movement.category,
            description: movement.description,
            amount: movement.amount,
        }));

        res.json(formattedMovements);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}


export async function getAllMovements(req, res) {
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({ user_id: userId }).toArray();

        const formattedMovements = movements.map(movement => ({
            date: movement.date,
            category: movement.category,
            description: movement.description,
            amount: movement.amount,
        }));

        res.json(formattedMovements);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}


