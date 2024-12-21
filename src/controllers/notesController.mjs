import { ObjectId } from 'mongodb';
import { client } from "../config/database.mjs";
import { DB_NAME } from "../config/constants.mjs";

const notesCollection = client.db(DB_NAME).collection("notes");

export async function getAllNotes(req, res) {
    const userId = req.user.userId;

    try {
        const notes = await notesCollection.find({ "user_id": new ObjectId(userId) }).toArray();
        res.json(notes);
    } catch (error) {
        console.error("Error retrieving notes:", error);
        res.status(500).send("Error retrieving notes");
    }
}

export async function createNote(req, res) {
    const { title, content } = req.body;
    const userId = req.user.userId;

    try {
        const newNote = {
            title: title || 'Untitled Note',
            content: content || '',
            user_id: new ObjectId(userId),
            created_at: new Date(),
            updated_at: new Date(),
        };

        const result = await notesCollection.insertOne(newNote);
        const insertedNote = await notesCollection.findOne({ _id: result.insertedId });
        res.status(201).json(insertedNote);
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).send("Error creating note");
    }
}

export async function editNote(req, res) {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid note ID format");
    }

    try {
        const noteId = new ObjectId(id);
        const userObjectId = new ObjectId(userId);

        const updateResult = await notesCollection.updateOne(
            { _id: noteId, user_id: userObjectId },
            {
                $set: {
                    title: title || 'Untitled Note',
                    content: content || '',
                    updated_at: new Date(),
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).send("Note not found");
        }

        const updatedNote = await notesCollection.findOne({ _id: noteId });
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).send("Error updating note");
    }
}

export async function deleteNote(req, res) {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid note ID format");
    }

    try {
        const result = await notesCollection.deleteOne({ _id: new ObjectId(id), user_id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).send("Note not found or does not belong to the user");
        }

        res.status(200).send(`Note with id ${id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).send("Error deleting note");
    }
}
