import { MongoClient, ObjectId } from 'mongodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = 'PruebaDeBCKP';
const DB_RESTORE_FILE = 'ProfitAndLostDB-backup-2024-06-29T18-45-28.json';
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@profit-lost.dojlby3.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&ssl=true`;

async function restoreDatabase() {
    const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        const backupFilePath = join(__dirname, DB_RESTORE_FILE);
        const backupData = JSON.parse(readFileSync(backupFilePath, 'utf8'));

        for (const collectionName in backupData) {
            if (backupData.hasOwnProperty(collectionName)) {
                const collection = db.collection(collectionName);

                const convertedData = backupData[collectionName].map(doc => {
                    if (doc._id && typeof doc._id === 'object' && doc._id.$oid) {
                        doc._id = new ObjectId(doc._id.$oid);
                    } else if (doc._id && typeof doc._id === 'string') {
                        doc._id = new ObjectId(doc._id);
                    }
                    if (doc.user_id && typeof doc.user_id === 'object' && doc.user_id.$oid) {
                        doc.user_id = new ObjectId(doc.user_id.$oid);
                    } else if (doc.user_id && typeof doc.user_id === 'string') {
                        doc.user_id = new ObjectId(doc.user_id);
                    }
                    if (doc.category && typeof doc.category === 'object' && doc.category.$oid) {
                        doc.category = new ObjectId(doc.category.$oid);
                    } else if (doc.category && typeof doc.category === 'string') {
                        doc.category = new ObjectId(doc.category);
                    }
                    return doc;
                });

                await collection.deleteMany({});
                await collection.insertMany(convertedData);
                console.log(`Restored collection: ${collectionName}`);
            }
        }

        console.log('Database restoration completed successfully.');
    } catch (error) {
        console.error('Error restoring database:', error);
    } finally {
        await client.close();
    }
}

restoreDatabase();