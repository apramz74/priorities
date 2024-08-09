import React, { useState } from "react";

const AddPriorityModal = ({ onClose, onAdd, slot }) => {
  const [priorityName, setPriorityName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (priorityName.trim()) {
      onAdd(priorityName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Add Priority P{slot}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={priorityName}
            onChange={(e) => setPriorityName(e.target.value)}
            placeholder="Enter priority name"
            className="w-full border rounded px-3 py-2 mb-4"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0000D1] text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPriorityModal;
