import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import uploadToDrive from './uploadToDrive.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@profit-lost.dojlby3.mongodb.net/?retryWrites=true&w=majority&ssl=true`;

async function backupDatabase() {
    const client = new MongoClient(DB_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        const collections = await db.listCollections().toArray();
        const backupData = {};

        for (const collection of collections) {
            const collectionName = collection.name;
            const collectionData = await db.collection(collectionName).find({}).toArray();
            backupData[collectionName] = collectionData;
        }

        const currentDate = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const backupFileName = `${DB_NAME}-backup-${currentDate}.json`;
        const backupFileContent = JSON.stringify(backupData, null, 2);

        console.log(`Backup completed successfully. Uploading to Google Drive...`);

        const folderId = '1zgljhSKRRp3u9aJ2Js5K3PHx6OUUsxr7';

        await uploadToDrive(backupFileName, backupFileContent, folderId);

    } catch (error) {
        console.error('Error creating backup:', error);
    } finally {
        await client.close();
    }
}

backupDatabase();