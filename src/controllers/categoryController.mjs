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

    // Verificar que se ha proporcionado un nombre
    if (!name) {
        console.log("Name is required");
        return res.status(400).send("Name is required");
    }

    try {
        // Convertir id y userId a ObjectId para la consulta
        const categoryId = new ObjectId(id);
        const userObjectId = new ObjectId(userId);

        console.log("Attempting to edit category:", { categoryId, userObjectId, name });

        // Buscar y actualizar la categoría
        const result = await categoriesCollection.findOneAndUpdate(
            { _id: categoryId, user_id: userObjectId },
            { $set: { name } },
            { returnDocument: 'after' } // Para MongoDB Driver versión 4.x
        );

        // Verificar si la categoría fue encontrada y actualizada
        if (!result.value) {
            console.log("Category not found or not updated", { categoryId, userObjectId });
            return res.status(404).send("Category not found after update attempt");
        }

        // Categoría actualizada con éxito
        console.log("Category updated successfully:", result.value);
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
