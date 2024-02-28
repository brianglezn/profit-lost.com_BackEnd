import { ObjectId } from 'mongodb';

import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getAllMovements(req, res) {
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");

        const movements = await movementsCollection.aggregate([
            { $match: { "user_id": new ObjectId(userId) }},
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            {
                $unwind: "$categoryInfo"
            },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    description: 1,
                    amount: 1,
                    category: "$categoryInfo.name"
                }
            }
        ]).toArray();

        res.json(movements);
    } catch (error) {
        console.error("Error retrieving movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({
            "user_id": new ObjectId(userId),
            "date": { $regex: `^${year}` }
        }).toArray();

        const formattedMovements = movements.map(movement => ({
            "user_id": movement.user_id,
            "date": movement.date,
            "category": movement.category,
            "description": movement.description,
            "amount": movement.amount
        }));

        res.json(formattedMovements);
    } catch (error) {
        console.error("Error retrieving movements by year:", error);
        res.status(500).send("Error retrieving movements data by year");
    }
}

