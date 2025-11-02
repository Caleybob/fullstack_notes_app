// Import the required modules
const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Import uuid

// Create an instance of an Express application
const app = express();

// Define the port the server will listen on
const PORT = 3001;

// Middleware for parsing application/json (for POST/PUT requests)
app.use(express.json());
// Middleware for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));



const NOTES_FILE = path.join(__dirname, "data.json");

// Reads notes from the JSON file 
const getNotes = () => {
    try {
        const data = fs.readFileSync(NOTES_FILE, "utf8");
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or is invalid, return empty array
        return [];
    }
};

// Writes notes array to the JSON file 
const saveNotes = (notes) => {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 4));
};

// GET /api/notes (READ all notes)
app.get("/api/notes", (req, res) => {
    const notes = getNotes();
    res.json(notes);
});

// POST /api/notes (CREATE a new note)
app.post("/api/notes", (req, res) => {
    const newNote = req.body;
    
    // Check if the request body is valid
    if (!newNote || !newNote.text) { 
      return res.status(400).json({ error: "Note text is required." });
    }
    
    // Assign a unique ID using uuid
    newNote.id = uuidv4(); 
    
    const notes = getNotes();
    notes.push(newNote);
    saveNotes(notes);
    
    // Respond with the created note
    res.json(newNote); 
});

// PUT /api/notes/:id (UPDATE an existing note)
app.put("/api/notes/:id", (req, res) => {
    const noteId = req.params.id;
    const updatedNoteData = req.body;
    
    const notes = getNotes();
    const index = notes.findIndex(note => note.id === noteId);

    if (index !== -1) {
        // Update the note data, ensuring the ID is not changed
        notes[index] = { ...notes[index], ...updatedNoteData };
        saveNotes(notes);
        res.json(notes[index]);
    } else {
        res.status(404).json({ error: "Note not found." });
    }
});

// DELETE /api/notes/:id (DELETE a note)
app.delete("/api/notes/:id", (req, res) => {
    const noteId = req.params.id;
    let notes = getNotes();
    
    const initialLength = notes.length;
    
    // Filter out the note with the given ID
    notes = notes.filter(note => note.id !== noteId);

    if (notes.length < initialLength) {
        saveNotes(notes);
        res.json({ message: `Note with id ${noteId} deleted successfully.` });
    } else {
        res.status(404).json({ error: "Note not found." });
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle GET request at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Wildcard route to handle undefined routes
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});