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

export async function addCategory(req, res) {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
        return res.status(400).send("Name is required");
    }

    try {
        const newCategory = {
            name,
            user_id: new ObjectId(userId),
        };

        const result = await categoriesCollection.insertOne(newCategory);
        const insertedCategory = await categoriesCollection.findOne({ _id: result.insertedId });
        res.status(201).json(insertedCategory);
        
    } catch (error) {
        console.error("Error adding new category:", error);
        res.status(500).send("Error adding new category");
    }
}

export async function editCategory(req, res) {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid category ID format");
    }

    if (!name) {
        return res.status(400).send("Name is required");
    }

    try {
        const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(id), user_id: new ObjectId(userId) });

        if (!categoryExists) {
            return res.status(404).send("Category not found");
        }

        const result = await categoriesCollection.findOneAndUpdate(
            { _id: new ObjectId(id), user_id: new ObjectId(userId) },
            { $set: { name } },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).send("Category not found after update attempt");
        }

        res.json(result.value);
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send("Error updating category");
    }
}


export async function removeCategory(req, res) {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid category ID format");
    }

    try {
        const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id), user_id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).send("Category not found or does not belong to the user");
        }

        res.status(200).send(`Category with id ${id} deleted`);
    } catch (error) {
        console.error("Error removing category:", error);
        res.status(500).send("Error removing category");
    }
}
