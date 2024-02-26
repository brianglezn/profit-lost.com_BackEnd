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

        // Inicializa el acumulador con todos los meses en 0 para Income y Expenses
        const accumulator = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        monthNames.forEach(month => {
            accumulator[month] = { Income: 0, Expenses: 0 };
        });

        movements.forEach(movement => {
            const monthIndex = parseInt(movement.date.split('-')[1], 10) - 1;
            const monthName = monthNames[monthIndex];
            const amountValue = parseFloat(movement.amount.$numberDouble);

            if (amountValue > 0) {
                accumulator[monthName].Income += amountValue;
            } else {
                accumulator[monthName].Expenses += Math.abs(amountValue);
            }
        });

        // Transforma el acumulador en un array para la respuesta
        const chartData = monthNames.map(month => ({
            month: month,
            Income: accumulator[month].Income,
            Expenses: accumulator[month].Expenses
        }));

        res.json(chartData);
    } catch (error) {
        console.error("Failed to retrieve movements:", error);
        res.status(500).send("Error retrieving movements data");
    }
}

