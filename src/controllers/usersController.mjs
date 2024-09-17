import { ObjectId } from 'mongodb';
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
                language: user.language,
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
        const { name, surname, language } = req.body;

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
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: `ProfilePhotos/${userId}`
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(result);
                    }
                ).end(req.file.buffer);
            });

            profileImageUrl = result.secure_url;
            newPublicId = result.public_id;
        }

        const updateData = {
            name,
            surname,
            language,
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