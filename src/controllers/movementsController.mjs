import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");

        const movements = await movementsCollection.find({
            user_id: userId,
            date: { $regex: `^${year}-` }
        }).toArray();

        const initialAcc = {};
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].forEach(month => {
            initialAcc[month] = { Income: 0, Expenses: 0 };
        });

        const processedData = movements.reduce((acc, movement) => {
            const monthIndex = parseInt(movement.date.split('-')[1], 10) - 1;
            const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
            const amount = parseFloat(movement.amount.$numberDouble);

            if (amount > 0) {
                acc[monthName].Income += amount;
            } else {
                acc[monthName].Expenses += Math.abs(amount);
            }

            return acc;
        }, initialAcc);

        const chartData = Object.entries(processedData).map(([month, { Income, Expenses }]) => ({
            month,
            Income: parseFloat(Income.toFixed(2)),
            Expenses: parseFloat(Expenses.toFixed(2)),
        }));

        res.json(chartData);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}
