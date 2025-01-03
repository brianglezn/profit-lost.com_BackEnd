import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";
import { cloudinary } from "../config/cloudinary.mjs";

const usersCollection = client.db(DB_NAME).collection("users");

export async function getUserByToken(req, res) {
  try {
    const userId = req.user.userId;
    const usersCollection = client.db(DB_NAME).collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        surname: user.surname,
        profileImage: user.profileImage,
        accountsOrder: user.accountsOrder,
        language: user.language,
        currency: user.currency,
        dateFormat: user.dateFormat || 'DD/MM/YYYY',
        timeFormat: user.timeFormat || '24h',
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Error fetching user");
  }
}

export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, surname, language, currency, dateFormat, timeFormat } = req.body;

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).send("User not found");
    }

    let profileImageUrl = null;
    let newPublicId = null;

    if (req.file) {
      if (user.profileImagePublicId) {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: `ProfilePhotos/${userId}`,
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      profileImageUrl = result.secure_url;
      newPublicId = result.public_id;
    }

    const updateData = {
      name,
      surname,
      language,
      currency,
      dateFormat,
      timeFormat
    };

    if (profileImageUrl && newPublicId) {
      updateData.profileImage = profileImageUrl;
      updateData.profileImagePublicId = newPublicId;
    }

    const updatedUser = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (updatedUser.modifiedCount === 1) {
      res.json({ message: "User settings updated successfully" });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Error updating user profile");
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    );

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
      to: user.email,
      subject: "Password Changed Successfully",
      html: `
                <div style="font-family: 'Arial', sans-serif; color: #212529;">
                    <h2>Password Changed</h2>
                    <p>Your password has been successfully changed.</p>
                    <p>If you did not make this change, please contact support immediately.</p>
                </div>
            `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Confirmation email sent:', info.messageId);
      }
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password" });
  }
}

export async function deleteProfileImage(req, res) {
  try {
    const userId = req.user.userId;

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $unset: { profileImage: "", profileImagePublicId: "" } }
    );

    res.json({ message: "Profile image deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({ message: "Error deleting profile image" });
  }
}

export async function deleteUserAccount(req, res) {
  try {
    const userId = req.user.userId;

    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 1) {
      res.json({ message: "User account deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Error deleting user account" });
  }
}

export async function updateAccountsOrder(req, res) {
  try {
    const userId = req.user.userId;
    const { accountsOrder } = req.body;

    if (!Array.isArray(accountsOrder)) {
      return res.status(400).send("Invalid accounts order");
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { accountsOrder } }
    );

    res.json({ message: "Accounts order updated successfully" });
  } catch (error) {
    console.error("Error updating accounts order:", error);
    res.status(500).send("Error updating accounts order");
  }
}
