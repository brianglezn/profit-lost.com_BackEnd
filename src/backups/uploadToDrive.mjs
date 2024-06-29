import { google } from 'googleapis';
import { Readable } from 'stream';
import { join } from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = join(__dirname, 'token.json');
const CREDENTIALS_PATH = join(__dirname, 'credentials.json');

async function authorize() {
    const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (existsSync(TOKEN_PATH)) {
        const token = readFileSync(TOKEN_PATH, 'utf8');
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } else {
        return getNewToken(oAuth2Client);
    }
}

async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const code = await new Promise(resolve => rl.question('Enter the code from that page here: ', resolve));
    rl.close();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token stored to', TOKEN_PATH);
    return oAuth2Client;
}

async function uploadFile(auth, fileName, fileContent, folderId) {
    const drive = google.drive({ version: 'v3', auth });
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };
    const media = {
        mimeType: 'application/json',
        body: Readable.from(fileContent),
    };
    const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });
    console.log('File uploaded successfully. File ID:', file.data.id);
}

async function main(fileName, fileContent, folderId) {
    const auth = await authorize();
    await uploadFile(auth, fileName, fileContent, folderId);
}

export default main;