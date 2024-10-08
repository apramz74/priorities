import React, { useState } from "react";
import StandardModal from "./StandardModal";
import {
  addTodo,
  updateTodo,
  toggleDeleted,
  toggleComplete,
  fetchTodos,
} from "../utils/api";
import { ReactComponent as PlusIcon } from "./plus_icon.svg";
import { ReactComponent as EmptyStateIcon } from "./empty_state.svg";
import ItemComponent from "./ItemComponent";

const TodoSection = ({ priorityId, todos, setTodos }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAddTodo = async (data) => {
    const newTodo = await addTodo({
      ...data,
      priority_id: priorityId,
    });
    if (newTodo) {
      setTodos([...todos, newTodo]);
      setIsModalOpen(false);
    }
  };

  const handleToggleComplete = async (id) => {
    const item = todos.find((todo) => todo.id === id);
    if (item) {
      const newCompletedStatus = !item.completed;
      const success = await toggleComplete("todos", id, newCompletedStatus);
      if (success) {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: newCompletedStatus } : todo
          )
        );
      }
    }
  };

  const handleUpdateTodo = async (id, field, value) => {
    const updatedTodo = { ...todos.find((t) => t.id === id), [field]: value };
    const result = await updateTodo(updatedTodo);
    if (result) {
      setTodos(todos.map((t) => (t.id === result.id ? result : t)));
    }
  };

  const handleToggleDeleted = async (id) => {
    const success = await toggleDeleted("todos", id, true);
    if (success) {
      const updatedTodos = await fetchTodos(priorityId);
      setTodos(updatedTodos);
    }
  };

  const handleToggleShowCompleted = async () => {
    setShowCompleted((prev) => !prev);
    const updatedTodos = await fetchTodos(priorityId, !showCompleted);
    setTodos(updatedTodos);
  };

  const filteredTodos = showCompleted
    ? todos
    : todos.filter((todo) => !todo.completed);

  const sortedTodos = filteredTodos.sort(
    (a, b) => new Date(a.due_date) - new Date(b.due_date)
  );

  const todoFields = [
    {
      name: "name",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Enter todo title",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      required: false,
      placeholder: "Enter any additional notes",
    },
    { name: "due_date", label: "Due Date", type: "date", required: true },
  ];

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-bold mr-2">To Do</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-purple-600 hover:text-purple-800 focus:outline-none"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">Show completed</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              showCompleted ? "bg-indigo-600" : "bg-gray-300"
            }`}
            onClick={handleToggleShowCompleted}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                showCompleted ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>
      </div>
      {sortedTodos.length > 0 ? (
        <div className="space-y-2">
          {sortedTodos.map((todo) => (
            <ItemComponent
              key={todo.id}
              item={todo}
              onToggleComplete={handleToggleComplete}
              onUpdate={handleUpdateTodo}
              onDelete={handleToggleDeleted}
              borderColor="border-indigo-800 border-2"
              itemType="todo"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2">
          <EmptyStateIcon className="w-32 h-32" />
          <p className="text-gray-500 font-inter text-sm">No todos yet</p>
        </div>
      )}
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTodo}
        title="Add New Todo"
        fields={todoFields}
      />
    </div>
  );
};

export default TodoSection;
