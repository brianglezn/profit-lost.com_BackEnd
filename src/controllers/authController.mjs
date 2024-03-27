import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import { ObjectId } from 'mongodb';

import { client } from "../config/database.mjs";
import { DB_NAME, JWT_KEY } from "../config/constants.mjs";

export async function register(req, res) {
    try {
        const { username, name, surname, email, password } = req.body;
        if (!username || !name || !surname || !email || !password) {
            return res.status(400).send("Username, name, surname, email, and password are required");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const usersCollection = client.db(DB_NAME).collection("users");
        const result = await usersCollection.insertOne({
            username,
            name,
            surname,
            email,
            password: hashedPassword,
        });
        res.status(201).send(`User created with id ${result.insertedId}`);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error creating user: " + e.message);
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const usersCollection = client.db(DB_NAME).collection("users");
        const user = await usersCollection.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ userId: user._id }, JWT_KEY, {
                expiresIn: "1h",
            });
            res.json({ token });
        } else {
            res.status(401).send("Invalid email or password");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error during login");
    }
}

export async function requestPasswordReset(req, res) {
    const { email } = req.body;
    try {
        const usersCollection = client.db(DB_NAME).collection("users");
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        await usersCollection.updateOne({ _id: user._id }, {
            $set: {
                resetToken,
                resetTokenExpiry: new Date(Date.now() + 15 * 60000)
            }
        });

        let transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: "no-reply@profit-lost.com",
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let mailOptions = {
            from: '"Profit-Lost" <no-reply@profit-lost.com>',
            to: email,
            subject: "Restablecimiento de Contraseña",
            html: `
                <div style="font-family: 'Arial', sans-serif; color: #212529;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:logo_profit_lost" alt="Profit-Lost Logo" style="max-width: 150px;">
                    </div>
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ffd5a8; border-radius: 15px; background-color: #fff7ed;">
                        <h2 style="color: #fe6f14;">Código de Verificación</h2>
                        <p style="font-size: 16px;">Aquí está tu código de verificación de acceso:</p>
                        <div style="background-color: #ffecd4; padding: 10px; text-align: center; margin-bottom: 20px; font-size: 24px; border-radius: 5px; color: #7e2a10;">
                            ${resetToken}
                        </div>
                        <p style="font-size: 14px;">Por favor, asegúrate de no compartir nunca este código con nadie.</p>
                        <p style="font-size: 14px; color: #9d300f;">Nota: el código expirará en 15 minutos.</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: #441206; font-size: 12px;">
                        <p>Has recibido este email porque estás registrado en Profit-Lost.</p>
                    </div>
                </div>
            `,
            attachments: [{
                filename: 'logo_profit-lost.svg',
                path: 'https://res.cloudinary.com/dz0mwxb0v/image/upload/v1697122157/profit-lost.com/logo/logo_profit-lost.svg',
                cid: 'logo_profit_lost'
            }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('SendMail Error:', error);
                return res.status(500).send("Error sending password reset email.");
            }
            console.log("Password reset email sent:", info.messageId);
            res.send("Reset password link has been sent to your email.");
        });

    } catch (error) {
        console.error('RequestPasswordReset Error:', error);
        res.status(500).send("Error requesting password reset.");
    }
}


export async function resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
        const usersCollection = client.db(DB_NAME).collection("users");
        const user = await usersCollection.findOne({ resetToken: token });

        if (!user) {
            return res.status(400).send("Invalid reset token.");
        }

        if (new Date() > user.resetTokenExpiry) {
            return res.status(400).send("Reset token has expired.");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await usersCollection.updateOne({ _id: user._id }, {
            $set: { password: hashedNewPassword },
            $unset: { resetToken: "", resetTokenExpiry: "" }
        });

        res.send("Password has been reset successfully.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error resetting password.");
    }
}
