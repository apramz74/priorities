import React, { useState, useRef, useEffect } from "react";
import { FaExclamationTriangle, FaHourglass, FaTrash } from "react-icons/fa";

const TruncatedCell = ({
  content,
  maxLength = 50,
  className = "",
  style = {},
  editable = false,
  onUpdate,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const cellRef = useRef(null);
  const tooltipRef = useRef(null);
  const inputRef = useRef(null);

  const truncatedContent =
    content.length > maxLength ? content.slice(0, maxLength) + "..." : content;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsTooltipVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateTooltipPosition = () => {
    if (cellRef.current && tooltipRef.current) {
      const cellRect = cellRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = cellRect.left;
      let top = cellRect.bottom + window.scrollY + 5;

      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 10;
      }

      if (top + tooltipRect.height > viewportHeight + window.scrollY) {
        top = cellRect.top + window.scrollY - tooltipRect.height - 5;
      }

      setTooltipStyle({
        left: `${left}px`,
        top: `${top}px`,
      });
    }
  };

  useEffect(() => {
    if (isTooltipVisible) {
      updateTooltipPosition();
      window.addEventListener("scroll", updateTooltipPosition);
      window.addEventListener("resize", updateTooltipPosition);
    }
    return () => {
      window.removeEventListener("scroll", updateTooltipPosition);
      window.removeEventListener("resize", updateTooltipPosition);
    };
  }, [isTooltipVisible]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onUpdate(editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(content);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing && editable) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          setIsEditing(false);
          onUpdate(editValue);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full border rounded px-2 py-1 ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      ref={cellRef}
      className={`relative ${className}`}
      style={style}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onClick={() => editable && setIsEditing(true)}
    >
      <span className="whitespace-nowrap overflow-hidden text-ellipsis block">
        {truncatedContent}
      </span>
      {isTooltipVisible && content.length > maxLength && (
        <div
          ref={tooltipRef}
          className="fixed z-50 p-3 bg-gray-800 text-white rounded shadow-lg max-w-lg break-words"
          style={tooltipStyle}
        >
          {content}
        </div>
      )}
    </div>
  );
};

const EditableCell = ({
  value,
  onUpdate,
  type = "text",
  className = "",
  style = {},
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
        className={`w-full border rounded px-2 py-1 ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer ${className}`}
      style={style}
    >
      {value}
    </div>
  );
};

const Table = ({ data, columns, onUpdate, onDelete, onToggleComplete }) => {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    rowId: null,
  });

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      return dateA - dateB;
    });
  }, [data]);

  const handleContextMenu = (e, rowId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, rowId });
  };

  const handleDelete = () => {
    if (contextMenu.rowId) {
      onDelete(contextMenu.rowId);
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  useEffect(() => {
    const handleClickOutside = () =>
      setContextMenu({ ...contextMenu, visible: false });
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  const getDateStatus = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dueDate.split("-").map(Number);
    const itemDate = new Date(year, month - 1, day);

    if (itemDate < today) {
      return "overdue";
    } else if (itemDate.getTime() === today.getTime()) {
      return "sameDay";
    }
    return "normal";
  };

  const getDateStyles = (status) => {
    switch (status) {
      case "overdue":
        return {
          textColor: "#FF0000",
          icon: <FaExclamationTriangle className="text-red-500 mr-1" />,
        };
      case "sameDay":
        return {
          textColor: "#FFA500",
          icon: <FaHourglass className="text-orange-500 mr-1" />,
        };
      default:
        return {
          textColor: "inherit",
          icon: null,
        };
    }
  };

  return (
    <div className="space-y-4">
      {sortedData.map((item) => {
        const dateStatus = getDateStatus(item[columns[1].field]);
        const { textColor, icon } = getDateStyles(dateStatus);

        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-lg shadow bg-white"
            onContextMenu={(e) => handleContextMenu(e, item.id)}
          >
            <div className="flex items-center space-x-4 flex-grow">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleComplete(item.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-grow">
                <TruncatedCell
                  content={item[columns[0].field]}
                  maxLength={50}
                  className="font-semibold text-base"
                  style={{ color: textColor }}
                  editable={true}
                  onUpdate={(value) =>
                    onUpdate(item.id, columns[0].field, value)
                  }
                />
                {columns.length > 2 && (
                  <TruncatedCell
                    content={item[columns[2].field]}
                    maxLength={50}
                    className="text-gray-600 text-sm"
                    editable={true}
                    onUpdate={(value) =>
                      onUpdate(item.id, columns[2].field, value)
                    }
                  />
                )}
              </div>
            </div>
            <div className="text-right flex items-center">
              {icon}
              <EditableCell
                value={item[columns[1].field]}
                onUpdate={(value) => onUpdate(item.id, columns[1].field, value)}
                type="date"
                className="font-medium text-sm"
                style={{ color: textColor }}
              />
            </div>
          </div>
        );
      })}
      {contextMenu.visible && (
        <div
          className="absolute bg-white border border-gray-200 rounded shadow-md py-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            onClick={handleDelete}
          >
            <FaTrash className="mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
