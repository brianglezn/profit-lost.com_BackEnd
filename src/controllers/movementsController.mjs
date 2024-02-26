import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const movements = await movementsCollection.find({
            user_id: userId,
            date: {
                $gte: startDate.toISOString(),
                $lte: endDate.toISOString()
            }
        }).toArray();

        const processedData = movements.reduce((acc, movement) => {
            const month = new Date(movement.date).getMonth();
            const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month];
            if (!acc[monthName]) {
                acc[monthName] = { Income: 0, Expenses: 0 };
            }
            const amount = parseFloat(movement.amount.$numberDouble);
            if (amount > 0) {
                acc[monthName].Income += amount;
            } else {
                acc[monthName].Expenses += Math.abs(amount);
            }
            return acc;
        }, {});

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
