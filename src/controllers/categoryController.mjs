import { ObjectId } from 'mongodb';

import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const categoriesCollection = client.db(DB_NAME).collection("categories");

export async function getAllCategories(req, res) {
    const userId = req.user.userId;

    try {
        const categories = await categoriesCollection.find({ "user_id": new ObjectId(userId) }).toArray();

        res.json(categories);
    } catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).send("Error retrieving categories");
    }
}
