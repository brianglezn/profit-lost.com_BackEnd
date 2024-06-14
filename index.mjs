import express from "express";
import cors from "cors";
import cron from "node-cron";
import { exec } from "child_process";
import { join } from 'path';
import { fileURLToPath } from "url";
import authRoutes from "./src/routes/PLRoutes.mjs";
import path from 'path';
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

app.use(authRoutes);

app.get('/api/check-backups', async (req, res) => {
  try {
    const backupPath = join(__dirname, 'src/db_backups');
    const files = await readdir(backupPath);
    res.json({ backups: files });
  } catch (error) {
    res.status(500).send('Error reading backup directory');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupScriptPath = join(__dirname, 'src/config/db_bckp.mjs');

cron.schedule('* * * * *', () => {
  console.log('Executing backup job...');
  exec(`node ${backupScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing backup: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Backup stderr: ${stderr}`);
      return;
    }
    console.log(`Backup completed successfully: ${stdout}`);
  });
});

