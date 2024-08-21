import React, { useState } from "react";
import { ReactComponent as RefreshIcon } from "./refresh_icon.svg";
import { ReactComponent as UpdateIcon } from "./update_icon.svg";
import { ReactComponent as AlertIcon } from "./alert_icon.svg";
import { ReactComponent as CopyIcon } from "./copy_icon.svg";
import { ReactComponent as ReadyStateIcon } from "./ready_state_icon.svg";

const UpdatePreview = ({
  selectedTasks,
  generatedUpdate,
  onGenerateUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUpdate);
  };

  const handleGenerateUpdate = async () => {
    setIsLoading(true);
    await onGenerateUpdate();
    setIsLoading(false);
  };

  const showButtons = selectedTasks.length >= 3;

  const renderUpdate = () => {
    if (!generatedUpdate) return null;

    return (
      <div className="text-sm">
        {generatedUpdate.split("\n").map((sentence, index) => {
          const boldPattern = /\*\*(.*?)\*\*/g;
          const parts = sentence.split(boldPattern);

          return (
            <li key={index} className="flex items-start mb-2">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 0 ? (
                  <span key={partIndex}>{part}</span>
                ) : (
                  <strong key={partIndex}>{part}</strong>
                )
              )}
            </li>
          );
        })}
      </div>
    );
  };

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
              onClick={handleGenerateUpdate}
              className="text-xs text-indigo-500 hover:text-indigo-700 mr-6 flex items-center"
              disabled={isLoading}
            >
              <RefreshIcon
                className={`w-4 h-4 mr-1 fill ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              {isLoading ? "Generating..." : "Generate update"}
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
      ) : !generatedUpdate ? (
        <div className="flex flex-col items-center justify-center py-8">
          <ReadyStateIcon className="w-32 h-32 " />
          <p className="text-sm text-gray-600">Ready to create your update</p>
        </div>
      ) : (
        <div className="mt-4">{renderUpdate()}</div>
      )}
    </div>
  );
};

export default UpdatePreview;
