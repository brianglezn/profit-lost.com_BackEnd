import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const regex = new RegExp(`^${year}-`);
        const movements = await movementsCollection.find({
            user_id: userId,
            date: { $regex: regex }
        }).toArray();

        let monthlyTotals = {};

        movements.forEach(movement => {
            let month = movement.date.split('-')[1];
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = { Income: 0, Expenses: 0 };
            }
            if (movement.amount > 0) {
                monthlyTotals[month].Income += movement.amount;
            } else {
                monthlyTotals[month].Expenses += Math.abs(movement.amount);
            }
        });

        const response = Object.keys(monthlyTotals).map(month => ({
            month,
            Income: monthlyTotals[month].Income,
            Expenses: monthlyTotals[month].Expenses
        }));

        res.json(response);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}
