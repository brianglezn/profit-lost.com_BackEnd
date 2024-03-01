import { ObjectId } from 'mongodb';

import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const accountsCollection = client.db(DB_NAME).collection("accounts");

export async function getAccountsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const accounts = await accountsCollection.aggregate([
            { $match: { "user_id": new ObjectId(userId) } },
            {
                $project: {
                    _id: 0,
                    accountName: 1,
                    records: {
                        $filter: {
                            input: "$records",
                            as: "record",
                            cond: { $eq: ["$$record.year", parseInt(year)] }
                        }
                    },
                    configuration: 1
                }
            }
        ]).toArray();

        res.json(accounts);
    } catch (error) {
        console.error("Error retrieving accounts by year:", error);
        res.status(500).send("Error retrieving accounts data by year");
    }
}
