import React, { useState, useRef, useEffect } from "react";
import TrashIcon from "./TrashIcon";
import { ReactComponent as CalendarIcon } from "../components/calendar_icon.svg";

// Update this helper function at the top of the file
const formatDate = (dateString) => {
  const options = { month: "long", day: "numeric", timeZone: "UTC" };
  return new Date(dateString + "T00:00:00Z").toLocaleDateString(
    "en-US",
    options
  );
};

const EditableField = ({
  value,
  onUpdate,
  type = "text",
  className = "",
  isDate = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onUpdate(editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          setIsEditing(false);
          onUpdate(editValue);
        }}
        onKeyDown={handleKeyDown}
        className={`border rounded px-2 py-1 ${className} ${
          type === "date" ? "w-auto" : "w-full"
        }`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer ${className}`}
    >
      {isDate ? formatDate(value) : value}
    </div>
  );
};

const ItemComponent = ({
  item,
  onToggleComplete,
  borderColor,
  onUpdate,
  itemType,
  onDelete,
}) => {
  const isDependency = itemType === "dependency";
  const [contextMenu, setContextMenu] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const getDueDateColor = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("Due Date: " + dueDate);
    const [year, month, day] = dueDate.split("-").map(Number);
    const dueDateObj = new Date(year, month - 1, day);
    dueDateObj.setHours(0, 0, 0, 0);
    // Compare year, month, and day
    const isToday =
      today.getFullYear() === dueDateObj.getFullYear() &&
      today.getMonth() === dueDateObj.getMonth() &&
      today.getDate() === dueDateObj.getDate();

    const isPast = dueDateObj < today;
    console.log(item.name);
    console.log("dueDateObj: " + dueDateObj);
    console.log("today: " + today);
    if (isPast && !isToday) {
      return "#FF0000"; // Red for past due dates
    } else if (isToday) {
      return "#FFA800"; // Orange for today
    }
    return "currentColor"; // Default color for future dates
  };

  const dueDateColor = getDueDateColor(item.due_date);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDelete = () => {
    onDelete(item.id);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className={`flex items-center p-3 bg-white border ${borderColor} rounded-lg
                  hover:bg-[#E5E5FF] hover:shadow-[0_0_10px_rgba(0,0,209,0.3)] transition-all duration-300 min-h-[65px] relative overflow-hidden`}
      onContextMenu={handleContextMenu}
    >
      <input
        type="checkbox"
        checked={item.completed || isCompleting}
        onChange={(e) => {
          const newCompletedStatus = !item.completed;
          setIsCompleting(newCompletedStatus);
          onToggleComplete(item.id);
          e.target.blur();
        }}
        className="indigo-checkbox mr-3"
      />
      <div className="flex-grow min-w-0 pr-32">
        <EditableField
          value={isDependency ? item.title : item.name}
          onUpdate={(value) =>
            onUpdate(item.id, isDependency ? "title" : "name", value)
          }
          className="text-sm font-medium truncate flex-shrink-0"
        />
        <EditableField
          value={isDependency ? item.person : item.notes}
          onUpdate={(value) =>
            onUpdate(item.id, isDependency ? "person" : "notes", value)
          }
          className="text-xs text-gray-500 truncate flex-shrink-0"
        />
      </div>
      <div
        className="flex items-center absolute right-3 top-1/2 transform -translate-y-1/2 w-28"
        style={{ color: dueDateColor }}
      >
        <CalendarIcon className="w-4 h-4 absolute left-0" />
        <EditableField
          value={item.due_date}
          onUpdate={(value) => {
            onUpdate(item.id, "due_date", value);
          }}
          type="date"
          className="text-xs w-full pl-6"
          isDate={true}
        />
      </div>
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-md py-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold font-inter"
            onClick={handleDelete}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemComponent;
