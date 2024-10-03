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
    }
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    setNotes(notes.filter((note) => note.id !== id));
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getDateDescriptor = (note) => {
    if (note.updated_at && note.updated_at !== note.created_at) {
      return `Updated ${formatDate(note.updated_at)}`;
    }
    return `Added ${formatDate(note.created_at)}`;
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-indigo-deep text-sm font-medium hover:text-indigo-700 flex items-center mb-4"
      >
        Add note →
      </button>
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            No notes yet. Add your first note!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-4">
                <p className="mb-1 text-gray-800">{note.content}</p>
              </div>
              <div className="border-t border-gray-200">
                <div className="flex justify-between items-center text-sm p-4">
                  <span className="text-gray-500">
                    {getDateDescriptor(note)}
                  </span>
                  <div>
                    <button
                      onClick={() => {
                        setEditingNote(note);
                        setIsModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <NotesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSubmit={editingNote ? handleEditNote : handleAddNote}
        initialContent={editingNote?.content || ""}
        noteId={editingNote?.id}
      />
    </div>
  );
};

export default NotesView;
