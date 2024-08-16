import React, { useEffect, useRef } from "react";

const StandardModal = ({ isOpen, onClose, onSubmit, title, fields }) => {
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="gradient-background rounded-lg shadow-xl w-full max-w-md">
        <div className="modal-content bg-white m-2 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <div key={field.name} className="mb-4">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    rows={4}
                    ref={index === 0 ? firstInputRef : null}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    ref={index === 0 ? firstInputRef : null}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                className="bg-indigo-deep text-white px-4 py-2 rounded font-semibold text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StandardModal;
