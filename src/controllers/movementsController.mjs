import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");

        // Encuentra todos los movimientos para el usuario y año dados
        const movements = await movementsCollection.find({
            user_id: userId,
            date: { $regex: `^${year}-` },
        }).toArray();

        // Inicializa el acumulador para asegurar que todos los meses empiecen con Income y Expenses en 0
        const accumulator = {};
        for (let i = 1; i <= 12; i++) {
            const monthKey = `${year}-${i.toString().padStart(2, '0')}`;
            accumulator[monthKey] = { Income: 0, Expenses: 0 };
        }

        // Procesa cada movimiento
        movements.forEach(movement => {
            const monthKey = movement.date;
            const amountValue = parseFloat(movement.amount.$numberDouble);

            if (amountValue > 0) {
                accumulator[monthKey].Income += amountValue;
            } else {
                accumulator[monthKey].Expenses += Math.abs(amountValue);
            }
        });

        // Convierte el acumulador a un array ordenado por mes
        const chartData = Object.entries(accumulator).map(([date, values]) => {
            const monthIndex = parseInt(date.split('-')[1], 10) - 1;
            const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
            return {
                month: monthName,
                Income: values.Income,
                Expenses: values.Expenses,
            };
        });

        res.json(chartData);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}
