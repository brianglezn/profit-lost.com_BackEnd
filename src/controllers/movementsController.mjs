import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

import { ObjectId } from 'mongodb'; // Importar ObjectId desde el módulo mongodb

export async function getAllMovements(req, res) {
    const userId = req.user.userId; // Obtener el ID del usuario de la solicitud

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({ "user_id": ObjectId(userId) }).toArray();

        // Formatear los datos según el requisito
        const formattedMovements = movements.map(movement => ({
            "user_id": movement.user_id,
            "date": movement.date,
            "category": movement.category,
            "description": movement.description,
            "amount": movement.amount
        }));

        res.json(formattedMovements); // Devolver los datos formateados como respuesta
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}



export async function getMovementsByYear(req, res) {

}

