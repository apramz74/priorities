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

    // Ensure we're working with UTC dates
    const dueDateObj = new Date(dueDate + "T00:00:00Z");
    const todayUTC = new Date(today.toUTCString());

    // Compare year, month, and day in UTC
    const isToday =
      todayUTC.getUTCFullYear() === dueDateObj.getUTCFullYear() &&
      todayUTC.getUTCMonth() === dueDateObj.getUTCMonth() &&
      todayUTC.getUTCDate() === dueDateObj.getUTCDate();

    const isPast = dueDateObj < todayUTC;

    if (isToday) {
      return "#FFA800"; // Orange for today
    } else if (isPast) {
      return "#FF0000"; // Red for past due dates
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
          className="fixed bg-white border border-gray-200 rounded-lg shadow-md py-1" // Reduced vertical padding
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="context-menu-item text-red-600 font-semibold font-inter"
            onClick={handleDelete}
          >
            <TrashIcon className="w-3.5 h-3.5 mr-2" /> {/* Reduced icon size */}
            <span className="flex-grow">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemComponent;
