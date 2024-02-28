import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({ user_id: userId, date: { $regex: `^${year}-` } }).toArray();

        if (movements.length === 0) {
            return res.json([]);
        }

        let monthlyTotals = {};
        for (let i = 1; i <= 12; i++) {
            const monthKey = `${year}-${i.toString().padStart(2, '0')}`;
            monthlyTotals[monthKey] = { Income: 0, Expenses: 0 };
        }

        movements.forEach(movement => {
            const monthKey = movement.date;
            const amount = movement.amount;
            if (amount > 0) {
                monthlyTotals[monthKey].Income += amount;
            } else {
                monthlyTotals[monthKey].Expenses += Math.abs(amount);
            }
        });

        const response = Object.keys(monthlyTotals).map(key => {
            const monthIndex = parseInt(key.split('-')[1], 10) - 1;
            return {
                month: monthNames[monthIndex],
                Income: Number(monthlyTotals[key].Income.toFixed(2)),
                Expenses: Number(monthlyTotals[key].Expenses.toFixed(2)),
            };
        });

        res.json(response);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}

export async function getAllMovements(req, res) {
    const userId = req.user.userId;
    console.log("User ID:", userId); // Log para verificar el userId recibido

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({ user_id: userId }).toArray();
        console.log("Movements found:", movements.length); // Log para verificar la cantidad de movimientos encontrados

        const formattedMovements = movements.map(movement => ({
            date: movement.date.slice(0, 7),
            category: movement.category,
            description: movement.description,
            amount: movement.amount,
        }));
        console.log("Formatted Movements:", formattedMovements); // Log para verificar los movimientos formateados

        res.json(formattedMovements);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}

