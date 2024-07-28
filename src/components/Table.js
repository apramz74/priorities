import React, { useState, useRef, useEffect } from "react";

const TruncatedCell = ({ content, maxLength = 20 }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const cellRef = useRef(null);
  const tooltipRef = useRef(null);

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

  return (
    <div
      ref={cellRef}
      className="relative"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
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

const EditableCell = ({ value, onUpdate, type = "text" }) => {
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
        className="w-full border rounded px-2 py-1"
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer">
      <TruncatedCell content={value} />
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
  }, []);

  const getRowClass = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse the due date, assuming it's in 'YYYY-MM-DD' format
    const [year, month, day] = dueDate.split("-").map(Number);
    const itemDate = new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date

    const isToday = itemDate.getTime() === today.getTime();
    const isPast = itemDate < today;

    if (isPast) {
      return "bg-red-100";
    } else if (isToday) {
      return "bg-yellow-100";
    } else {
      return itemDate.getTime() % 2 === 0 ? "bg-white" : "bg-gray-50";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto text-sm border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left text-gray-600">
            <th className="px-2 py-2 border border-gray-300">Status</th>
            {columns.map((column) => (
              <th
                key={column.field}
                className="px-2 py-2 border border-gray-300"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={item.id}
              className={getRowClass(item.due_date)}
              onContextMenu={(e) => handleContextMenu(e, item.id)}
            >
              <td className="px-2 py-2 border border-gray-200">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggleComplete(item.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              {columns.map((column) => (
                <td
                  key={column.field}
                  className="px-2 py-2 border border-gray-200"
                >
                  {column.editable ? (
                    <EditableCell
                      value={item[column.field]}
                      type={column.type || "text"}
                      onUpdate={(value) =>
                        onUpdate(item.id, column.field, value)
                      }
                    />
                  ) : (
                    <TruncatedCell content={item[column.field].toString()} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {contextMenu.visible && (
        <div
          className="absolute bg-white border border-gray-200 rounded shadow-md py-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
