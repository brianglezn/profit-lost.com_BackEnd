import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({ user_id: userId }).toArray();

        if (movements.length === 0) {
            return res.status(404).json({ message: "No movements found for the user." });
        }
        const groupedMovements = movements.reduce((acc, movement) => {
            const [year, month] = movement.date.split("-");
            const key = `${year}-${month}`;
            if (!acc[key]) {
                acc[key] = { Income: 0, Expenses: 0 };
            }
            if (movement.amount > 0) {
                acc[key].Income += movement.amount;
            } else {
                acc[key].Expenses += Math.abs(movement.amount);
            }
            return acc;
        }, {});
        const response = Object.entries(groupedMovements).map(([key, values]) => {
            const [year, month] = key.split("-");
            return {
                year,
                month,
                Income: Number(values.Income.toFixed(2)),
                Expenses: Number(values.Expenses.toFixed(2))
            };
        }).sort((a, b) => a.year.localeCompare(b.year) || a.month.localeCompare(b.month));

        res.json(response);
    } catch (error) {
        console.error("Failed to retrieve all movements:", error);
        res.status(500).send("Error retrieving all movements data");
    }
}
