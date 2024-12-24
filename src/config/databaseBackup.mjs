import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

export const BACKUP_CONFIG = {
  DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID,
  BACKUP_FREQUENCY: process.env.BACKUP_FREQUENCY || '0 2 * * *',
  MAX_BACKUPS: parseInt(process.env.MAX_BACKUPS) || 30,
  SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT
};