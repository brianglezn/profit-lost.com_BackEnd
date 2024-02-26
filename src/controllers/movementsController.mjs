import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

export async function getMovementsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const movementsCollection = client.db(DB_NAME).collection("movements");
        const movements = await movementsCollection.find({ user_id: userId, date: { $regex: `^${year}-` } }).toArray();

        // Inicializar monthlyTotals para cada mes del año solicitado
        let monthlyTotals = {};
        for (let i = 1; i <= 12; i++) {
            const monthKey = `${year}-${i.toString().padStart(2, '0')}`;
            monthlyTotals[monthKey] = { Income: 0, Expenses: 0 };
        }

        // Procesar movimientos para calcular totales de ingresos y gastos por mes
        movements.forEach(movement => {
            const monthKey = movement.date;
            const amount = movement.amount;
            if (amount > 0) {
                monthlyTotals[monthKey].Income += amount;
            } else {
                monthlyTotals[monthKey].Expenses += Math.abs(amount);
            }
        });

        // Preparar la respuesta
        const response = Object.keys(monthlyTotals).map(key => {
            const month = key.split('-')[1];
            return {
                month: monthNames[parseInt(month, 10) - 1], // Convertir "01", "02", etc. a "Jan", "Feb", etc.
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
