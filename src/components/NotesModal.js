import React, { useState, useEffect } from "react";
import StandardModal from "./StandardModal";

const NotesModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialContent = "",
  noteId = null,
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const fields = [
    {
      name: "content",
      label: "Note Content",
      type: "textarea",
      required: true,
      placeholder: "Enter your note here",
      value: content,
      onChange: (e) => setContent(e.target.value),
    },
  ];

  const handleSubmit = (data) => {
    if (noteId) {
      onSubmit(noteId, data.content);
    } else {
      onSubmit(data.content);
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={noteId ? "Edit Note" : "Add New Note"}
      fields={fields}
    />
  );
};

export default NotesModal;
