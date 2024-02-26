import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        
        const movements = await movementsCollection.find({
            user_id: userId,
            date: { $regex: `^${year}-` },
        }).toArray();

        const accumulator = {};
        for (let i = 1; i <= 12; i++) {
            const month = i.toString().padStart(2, '0');
            accumulator[`${year}-${month}`] = { Income: 0, Expenses: 0 };
        }

        movements.forEach(movement => {
            const { date, amount } = movement;
            const amountValue = parseFloat(amount.$numberDouble);
            if (amountValue > 0) {
                accumulator[date].Income += amountValue;
            } else {
                accumulator[date].Expenses += Math.abs(amountValue);
            }
        });

        // Convertir el acumulador a la estructura de respuesta deseada
        const chartData = Object.keys(accumulator).map(date => {
            const monthIndex = parseInt(date.split('-')[1], 10) - 1;
            const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
            return {
                month: monthName,
                Income: accumulator[date].Income,
                Expenses: accumulator[date].Expenses,
            };
        });

        res.json(chartData);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}
