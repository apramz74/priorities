import React from "react";

const MilestoneProgress = ({ milestones }) => {
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const lastMilestone = sortedMilestones[sortedMilestones.length - 1];

  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = lastMilestone ? calculateDaysLeft(lastMilestone.date) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <div className="text-3xl font-black text-gray-800 mr-2">{daysLeft}</div>
        <div className="text-gray-600">days left for this project</div>
      </div>
      <div className="flex">
        {sortedMilestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className={`flex-grow h-12 ${
              milestone.status === "completed" ? "bg-gray-800" : "bg-gray-200"
            } flex items-center justify-center border-gray-800 border-2`}
          >
            <div
              className={`font-semibold flex items-center ${
                milestone.status === "completed"
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              {milestone.status === "completed" && (
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              M{index + 1}
            </div>
          </div>
        ))}
      </div>
      <div className="text-sm text-indigo-700 mt-1 cursor-pointer">
        view milestone details →
      </div>
    </div>
  );
};

export default MilestoneProgress;
