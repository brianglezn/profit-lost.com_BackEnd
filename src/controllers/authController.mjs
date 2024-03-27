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

        const resetToken = jwt.sign({ userId: user._id.toString() }, JWT_KEY, { expiresIn: '15m' });
        await usersCollection.updateOne({ _id: user._id }, { $set: { resetToken } });

        let transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true, // true para conexiones seguras
            auth: {
                user: "no-reply@profit-lost.com",
                pass: process.env.EMAIL_PASSWORD, // La contraseña real de tu correo
            },
        });

        let mailOptions = {
            from: '"Profit-Lost" <no-reply@profit-lost.com>',
            to: email,
            subject: "Restablecimiento de Contraseña",
            html: `
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña. Por favor, utiliza el siguiente enlace para establecer una nueva:</p>
                <a href="http://profit-lost.com/reset-password?token=${resetToken}">Restablecer Contraseña</a>
                <p>Este enlace solo es válido por 15 minutos.</p>
                <p>Si no has solicitado esto, por favor ignora este correo.</p>
            `,
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
        const decoded = jwt.verify(token, JWT_KEY);
        const usersCollection = client.db(DB_NAME).collection("users");
        const user = await usersCollection.findOne({ _id: ObjectId(decoded.userId), resetToken: token });

        if (!user) {
            return res.status(400).send("Invalid or expired reset token.");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await usersCollection.updateOne({ _id: user._id }, { $set: { password: hashedNewPassword }, $unset: { resetToken: "" } });

        res.send("Password has been reset successfully.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error resetting password.");
    }
}
