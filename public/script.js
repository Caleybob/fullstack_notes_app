const noteInput = document.getElementById('noteInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notes-list');

let editId = null; // Track which note is being edited

// Load all notes from the server
async function loadNotes() {
  const res = await fetch('/api/notes');
  const notes = await res.json();
  renderNotes(notes);
}

// Render notes to the list
function renderNotes(notes) {
  notesList.innerHTML = '';
  if (notes.length === 0) {
    notesList.innerHTML = '<li><span>No notes yet!</span></li>';
    return;
  }

  notes.forEach(note => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${note.text}</span>
      <div class="note-buttons">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    // Edit note
    li.querySelector('.edit-btn').addEventListener('click', () => {
      noteInput.value = note.text;
      addNoteBtn.textContent = 'Save';
      addNoteBtn.style.backgroundColor = '#28a745';
      editId = note.id;
    });

    // Delete note
    li.querySelector('.delete-btn').addEventListener('click', async () => {
      await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      loadNotes();
    });

    notesList.appendChild(li);
  });
}

// Add or update a note
async function addOrUpdateNote() {
  const text = noteInput.value.trim();
  if (!text) return alert('Please enter a note!');

  const payload = { text };

  if (editId) {
    await fetch(`/api/notes/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  // Reset input and reload
  noteInput.value = '';
  addNoteBtn.textContent = 'Add';
  addNoteBtn.style.backgroundColor = '#007bff';
  editId = null;
  loadNotes();
}

// Event listeners
addNoteBtn.addEventListener('click', addOrUpdateNote);
window.addEventListener('load', loadNotes);