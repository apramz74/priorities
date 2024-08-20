import React, { useState } from "react";
import { ReactComponent as RefreshIcon } from "./refresh_icon.svg";
import { ReactComponent as UpdateIcon } from "./update_icon.svg";
import { ReactComponent as AlertIcon } from "./alert_icon.svg";
import { ReactComponent as CopyIcon } from "./copy_icon.svg";

const UpdatePreview = ({ selectedTasks }) => {
  const [update, setUpdate] = useState("");

  const generateUpdate = () => {
    if (selectedTasks.length < 3) {
      return "Select at least 3 completed tasks to generate an update";
    }

    // This is a simple update generation. You might want to make this more sophisticated.
    const updateText = selectedTasks.map((task) => `- ${task.name}`).join("\n");
    setUpdate(`This week, I completed the following tasks:\n${updateText}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(update);
  };

  const showButtons = selectedTasks.length >= 3;

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <UpdateIcon className="w-5 h-5 mr-2" />
          Your update
        </h3>
        {showButtons && (
          <div className="flex items-center">
            <button
              onClick={generateUpdate}
              className="text-xs text-indigo-500 hover:text-indigo-700 mr-6 flex items-center"
            >
              <RefreshIcon className="w-4 h-4 mr-1 fill: blue" />
              Refresh preview
            </button>
            <button
              onClick={copyToClipboard}
              className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center"
            >
              <CopyIcon className="w-4 h-4 mr-1" />
              Copy to clipboard
            </button>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 my-5"></div>
      {selectedTasks.length < 3 ? (
        <div className="flex flex-col">
          <div className="flex items-center">
            <AlertIcon className="w-5 h-5 mr-2" />
            <span className="text-sm">No completed tasks included</span>
          </div>
          <p className="text-xs mt-1 ml-7">
            Select at least 3 completed tasks to generate an update
          </p>
        </div>
      ) : (
        <textarea
          value={update}
          onChange={(e) => setUpdate(e.target.value)}
          className="w-full h-32 p-2 border rounded"
          placeholder="Your update will appear here..."
        />
      )}
    </div>
  );
};

export default UpdatePreview;
