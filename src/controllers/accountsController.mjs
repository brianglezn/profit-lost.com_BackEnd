import { ObjectId } from 'mongodb';
import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const accountsCollection = client.db(DB_NAME).collection("accounts");

export async function getAllAccounts(req, res) {
    const userId = req.user.userId;

    try {
        const accounts = await accountsCollection.aggregate([
            { $match: { "user_id": new ObjectId(userId) } },
            {
                $project: {
                    _id: 1,
                    accountName: 1,
                    records: 1,
                    configuration: 1
                }
            }
        ]).toArray();

        res.json(accounts);
    } catch (error) {
        console.error("Error retrieving all accounts:", error);
        res.status(500).send("Error retrieving all accounts data");
    }
}

export async function getAccountsByYear(req, res) {
    const { year } = req.params;
    const userId = req.user.userId;

    try {
        const accounts = await accountsCollection.aggregate([
            { $match: { "user_id": new ObjectId(userId) } },
            {
                $project: {
                    _id: 1,
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

export async function createAccount(req, res) {
    const userId = req.user.userId;
    const { accountName } = req.body;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    try {
        const records = [];

        for (let year = startYear; year <= currentYear; year++) {
            for (const month of months) {
                records.push({ year, month, value: 0 });
            }
        }

        const configuration = {
            backgroundColor: "#7e2a10",
            color: "#fff"
        };

        const newAccount = {
            user_id: new ObjectId(userId),
            accountName,
            records,
            configuration
        };

        await accountsCollection.insertOne(newAccount);
        res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).send("Error creating account");
    }
}

export async function editAccount(req, res) {
    const { id } = req.params;
    const { accountName, records, configuration } = req.body;

    try {
        const updateData = {
            ...(accountName && { accountName }),
            ...(records && { records }),
            ...(configuration && { configuration }),
        };

        await accountsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({ message: 'Account updated successfully' });
    } catch (error) {
        console.error("Error updating account:", error);
        res.status(500).send("Error updating account");
    }
}

export async function removeAccount(req, res) {
    const { id } = req.params;

    try {
        await accountsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).send("Error deleting account");
    }
}
