import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { URLSearchParams } from 'url';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'D:\\DEV\\profit-lost.com_BackEnd\\src\\backups\\token.json';
const CREDENTIALS_PATH = 'D:\\DEV\\profit-lost.com_BackEnd\\src\\backups\\credentials.json';

// Load client secrets from a local file.
fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), getNewToken);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    if (!credentials.web) {
        console.error('Invalid credentials format.');
        return;
    }

    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    callback(oAuth2Client);
}

/**
 * Get and store new token after prompting for user authorization.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        // Decode the authorization code
        const decodedCode = decodeURIComponent(code);
        console.log('Authorization code:', code);
        console.log('Decoded authorization code:', decodedCode);
        
        oAuth2Client.getToken(decodedCode, (err, token) => {
            if (err) {
                console.error('Error retrieving access token:', err);
                return;
            }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            console.log('Token generated and saved successfully.');
        });
    });
}
