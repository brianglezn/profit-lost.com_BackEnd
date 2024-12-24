import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.JWT_KEY;

export const encryptText = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptText = (encryptedText) => {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}; 