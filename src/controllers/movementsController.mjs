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
                Income: monthlyTotals[key].Income,
                Expenses: monthlyTotals[key].Expenses,
            };
        });

        res.json(response);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}
