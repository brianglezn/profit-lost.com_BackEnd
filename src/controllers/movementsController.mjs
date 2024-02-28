import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getAllMovements(req, res) {
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.aggregate([
            { $match: { "user_id": userId }},
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    description: 1,
                    amount: 1,
                    category: "$categoryInfo.name",
                }
            }
        ]).toArray();

        res.json(movements);
    } catch (error) {
        console.error("Failed to retrieve all movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}



export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.aggregate([
            { $match: { "user_id": userId, date: { $regex: `^${year}` } }},
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    description: 1,
                    amount: 1,
                    category: "$categoryInfo.name",
                }
            }
        ]).toArray();

        res.json(movements);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}
