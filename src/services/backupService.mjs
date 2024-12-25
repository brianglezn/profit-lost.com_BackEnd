import { MongoClient } from 'mongodb';
import { google } from 'googleapis';
import cron from 'node-cron';
import { Readable } from 'stream';
import { BACKUP_CONFIG } from '../config/databaseBackup.mjs';
import { DB_URI, DB_NAME } from '../config/database.mjs';

class BackupService {
  constructor() {
    this.drive = null;
    this.initializeGoogleDrive();
    this.verifyFolderAccess().then(isAccessible => {
      if (!isAccessible) {
        console.error('No se puede acceder a la carpeta de Drive');
      } else {
        console.log('Acceso a la carpeta de Drive verificado');
      }
    });
  }

  initializeGoogleDrive() {
    try {
      const credentials = JSON.parse(BACKUP_CONFIG.SERVICE_ACCOUNT);
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });
      
      this.drive = google.drive({ version: 'v3', auth });
      console.log('Google Drive service initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
    }
  }

  async createBackup() {
    const hasAccess = await this.verifyFolderAccess();
    if (!hasAccess) {
      console.error('No hay acceso a la carpeta de Drive');
      return false;
    }
    
    const client = new MongoClient(DB_URI);
    const currentDate = new Date();

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

      const fileName = `${DB_NAME}-backup-${currentDate.toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      await this.uploadToDrive(fileName, JSON.stringify(backupData, null, 2));
      await this.cleanOldBackups();

      console.log(`Backup completed successfully: ${fileName}`);
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    } finally {
      await client.close();
    }
  }

  async uploadToDrive(fileName, fileContent) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [BACKUP_CONFIG.DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: 'application/json',
        body: Readable.from(fileContent)
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,createdTime'
      });

      console.log(`File uploaded successfully: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error('Error uploading to Drive:', error);
      throw error;
    }
  }

  async cleanOldBackups() {
    try {
      const response = await this.drive.files.list({
        q: `'${BACKUP_CONFIG.DRIVE_FOLDER_ID}' in parents`,
        orderBy: 'createdTime desc',
        fields: 'files(id,name,createdTime)',
        pageSize: 100
      });

      const files = response.data.files;
      if (files.length > BACKUP_CONFIG.MAX_BACKUPS) {
        const filesToDelete = files.slice(BACKUP_CONFIG.MAX_BACKUPS);
        for (const file of filesToDelete) {
          await this.drive.files.delete({ fileId: file.id });
          console.log(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  startScheduledBackups() {
    if (!cron.validate(BACKUP_CONFIG.BACKUP_FREQUENCY)) {
      console.error('Invalid backup frequency format');
      return;
    }

    cron.schedule(BACKUP_CONFIG.BACKUP_FREQUENCY, async () => {
      console.log('Starting scheduled backup...');
      await this.createBackup();
    });

    console.log(`Scheduled backups initialized with frequency: ${BACKUP_CONFIG.BACKUP_FREQUENCY}`);
  }

  async verifyFolderAccess() {
    try {
      const response = await this.drive.files.list({
        q: `'${BACKUP_CONFIG.DRIVE_FOLDER_ID}' in parents`,
        orderBy: 'createdTime desc',
        fields: 'files(id,name,createdTime)',
        pageSize: 100
      });

      const files = response.data.files;
      if (files.length > BACKUP_CONFIG.MAX_BACKUPS) {
        const filesToDelete = files.slice(BACKUP_CONFIG.MAX_BACKUPS);
        for (const file of filesToDelete) {
          await this.drive.files.delete({ fileId: file.id });
          console.log(`Deleted old backup: ${file.name}`);
        }
      }
      return true;
    } catch (error) {
      console.error('Error verifying folder access:', error);
      return false;
    }
  }

  async executeBackup() {
    try {
      const result = await this.createBackup();
      return {
        success: result,
        message: result ? 'Backup completado con éxito' : 'Error al realizar el backup'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al ejecutar el backup',
        error: error.message
      };
    }
  }
}

export default BackupService; 