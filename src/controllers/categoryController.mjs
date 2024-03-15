import { ObjectId } from 'mongodb';

import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const categoriesCollection = client.db(DB_NAME).collection("categories");
const movementsCollection = client.db(DB_NAME).collection("movements");

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
        const existingCategory = await categoriesCollection.findOne({
            name: name,
            user_id: new ObjectId(userId)
        });

        if (existingCategory) {
            return res.status(409).send("Category with the same name already exists");
        }

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
        console.log("Invalid category ID format:", id);
        return res.status(400).send("Invalid category ID format");
    }

    if (!name) {
        console.log("Name is required");
        return res.status(400).send("Name is required");
    }

    try {
        const categoryId = new ObjectId(id);
        const userObjectId = new ObjectId(userId);

        console.log("Attempting to edit category:", { categoryId: categoryId.toString(), userObjectId: userObjectId.toString(), name });

        const updateResult = await categoriesCollection.updateOne(
            { _id: categoryId, user_id: userObjectId },
            { $set: { name: name } }
        );

        if (updateResult.matchedCount === 0) {
            console.log("Category not found", { categoryId: categoryId.toString(), userObjectId: userObjectId.toString() });
            return res.status(404).send("Category not found");
        }

        if (updateResult.modifiedCount === 0) {
            console.log("Category not updated", { categoryId: categoryId.toString(), userObjectId: userObjectId.toString() });
            return res.status(200).send("Category not updated, no changes made.");
        }

        console.log("Category updated successfully", { categoryId: categoryId.toString(), userObjectId: userObjectId.toString(), name });
        res.status(200).send("Category updated successfully");
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
        const movementsAssociated = await movementsCollection.countDocuments({
            user_id: new ObjectId(userId),
            category: new ObjectId(id)
        });

        if (movementsAssociated > 0) {
            return res.status(400).send("Cannot delete category because there are movements associated with it.");
        }

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
