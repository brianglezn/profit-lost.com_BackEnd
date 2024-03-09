import { ObjectId } from 'mongodb';

import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const movementsCollection = client.db(DB_NAME).collection("movements");

export async function getAllMovements(req, res) {
    const userId = req.user.userId;

    try {
        const movements = await movementsCollection.aggregate([
            { $match: { "user_id": new ObjectId(userId) } },
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
        res.status(500).send(`Error adding new movement: ${error.message}`);
    }
}

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movements = await movementsCollection.aggregate([
            {
                $match: {
                    "user_id": new ObjectId(userId),
                    "date": { $regex: `^${year}` }
                }
            },
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
        console.error("Error retrieving movements by year:", error);
        res.status(500).send("Error retrieving movements data by year");
    }
}

export async function getMovementsByYearAndMonth(req, res) {
    const { year, month } = req.params;
    const userId = req.user.userId;

    const monthRegex = month ? `-${month}` : "";

    try {
        const movements = await movementsCollection.aggregate([
            {
                $match: {
                    "user_id": new ObjectId(userId),
                    "date": { $regex: `^${year}${monthRegex}` }
                }
            },
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
        console.error("Error retrieving movements by year and month:", error);
        res.status(500).send("Error retrieving movements data by year and month");
    }
}

export async function addMovement(req, res) {
    const userId = req.user.userId;
    const { date, description, amount, category } = req.body;

    if (!description || typeof amount !== 'number') {
        return res.status(400).send('Invalid data provided');
    }

    if (!ObjectId.isValid(category)) {
        return res.status(400).send('Invalid category ID');
    }

    const dateRegex = /^\d{4}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return res.status(400).send('Date must be in format YYYY-MM');
    }

    try {
        const newMovement = {
            user_id: new ObjectId(userId),
            date,
            description,
            amount,
            category: new ObjectId(category)
        };

        const result = await movementsCollection.insertOne(newMovement);
        const insertedMovement = await movementsCollection.findOne({ _id: result.insertedId });
        res.status(201).json(insertedMovement);
    } catch (error) {
        console.error("Error adding new movement:", error);
        res.status(500).send("Error adding new movement: " + error.message);
    }
}

export async function removeMovement(req, res) {
    const { id } = req.params;

    // Verifica si el ID es un ObjectId válido
    if (!ObjectId.isValid(id)) {
        console.log(`Invalid ID format: ${id}`);
        return res.status(400).send("Invalid ID format");
    }

    try {
        console.log(`Attempting to remove movement with ID: ${id}`);

        const result = await movementsCollection.deleteOne({ 
            _id: new ObjectId(id), 
            user_id: new ObjectId(req.user.userId) 
        });

        if (result.deletedCount === 0) {
            console.log("Movement not found or does not belong to the user:", id);
            return res.status(404).send("Movement not found or does not belong to the user");
        }

        console.log(`Movement with ID ${id} deleted successfully.`);
        res.status(200).send(`Movement with ID ${id} deleted`);
    } catch (error) {
        console.error("Error removing movement:", error);
        res.status(500).send("Error removing movement");
    }
}

export async function editMovement(req, res) {
    const { id } = req.params;
    const { date, description, amount, category } = req.body;

    try {
        const updatedMovement = {
            date,
            description,
            amount,
            category: new ObjectId(category)
        };

        const result = await movementsCollection.findOneAndUpdate(
            { _id: new ObjectId(id), user_id: new ObjectId(req.user.userId) },
            { $set: updatedMovement },
            { returnOriginal: false }
        );

        if (!result.value) {
            return res.status(404).send("Movement not found");
        }

        res.json(result.value);
    } catch (error) {
        console.error("Error updating movement:", error);
        res.status(500).send("Error updating movement");
    }
}