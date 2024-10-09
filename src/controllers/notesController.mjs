// notesController.mjs
import { v4 as uuidv4 } from 'uuid';

let notes = []; // This will store the notes in-memory for now

// Get all notes
export const getAllNotes = (req, res) => {
    res.status(200).json(notes);
};

// Create a new note
export const createNote = (req, res) => {
    const { title, content } = req.body;
    const newNote = {
        id: uuidv4(),
        title: title || 'Untitled Note',
        content: content || ''
    };
    notes.push(newNote);
    res.status(201).json(newNote);
};

// Edit a note
export const editNote = (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
        return res.status(404).json({ message: 'Note not found' });
    }

    notes[noteIndex] = {
        ...notes[noteIndex],
        title: title || notes[noteIndex].title,
        content: content || notes[noteIndex].content
    };

    res.status(200).json(notes[noteIndex]);
};

// Delete a note
export const deleteNote = (req, res) => {
    const { id } = req.params;
    const noteIndex = notes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
        return res.status(404).json({ message: 'Note not found' });
    }

    const deletedNote = notes.splice(noteIndex, 1);
    res.status(200).json({ message: 'Note deleted successfully', note: deletedNote[0] });
};