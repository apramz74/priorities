import React, { useState, useEffect } from "react";
import { fetchNotes, addNote, updateNote, deleteNote } from "../utils/api";
import NotesModal from "./NotesModal";

const NotesView = ({ priorityId }) => {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    loadNotes();
  });

  const loadNotes = async () => {
    const fetchedNotes = await fetchNotes(priorityId);
    setNotes(fetchedNotes);
  };

  const handleAddNote = async (content) => {
    try {
      const newNote = await addNote(priorityId, content);
      if (newNote) {
        setNotes((prevNotes) => [...prevNotes, newNote]);
      }
    } catch (error) {
      console.error("Failed to add note:", error);
      // Optionally, show an error message to the user
    }
    setIsModalOpen(false);
  };

  const handleEditNote = async (id, content) => {
    try {
      const updatedNote = await updateNote(id, content);
      if (updatedNote) {
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === id ? updatedNote : note))
        );
      }
    } catch (error) {
      console.error("Failed to update note:", error);
      // Optionally, show an error message to the user
    }
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div>
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            No notes yet. Add your first note!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Note
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-gray-100 p-4 rounded">
                <p className="mb-2">{note.content}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingNote(note);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Note
          </button>
        </>
      )}
      <NotesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSubmit={editingNote ? handleEditNote : handleAddNote}
        initialContent={"test" || ""}
        noteId={editingNote?.id}
      />
    </div>
  );
};

export default NotesView;
