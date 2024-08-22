import React, { useState, useEffect } from "react";
import { fetchPrioritySummary } from "../utils/api";

const HomeView = ({ priorities, setSelectedPriority, setView }) => {
  const [summaries, setSummaries] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    const loadSummaries = async () => {
      const summaryData = await fetchPrioritySummary();
      setSummaries(summaryData);
    };
    loadSummaries();

    const updateTime = () => {
      const now = new Date();
      const startTime = new Date(now).setHours(9, 0, 0, 0);
      const endTime = new Date(now).setHours(17, 0, 0, 0);

      if (now < startTime) {
        setTimeLeft("Workday hasn't started yet");
        setProgressPercentage(0);
      } else if (now > endTime) {
        setTimeLeft("Workday is over");
        setProgressPercentage(100);
      } else {
        const totalMinutes = (endTime - startTime) / 60000;
        const elapsedMinutes = (now - startTime) / 60000;
        const remainingMinutes = totalMinutes - elapsedMinutes;

        const hours = Math.floor(remainingMinutes / 60);
        const minutes = Math.floor(remainingMinutes % 60);

        setTimeLeft(`${hours}h ${minutes}m  left in the workday`);
        setProgressPercentage((elapsedMinutes / totalMinutes) * 100);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const totalDueToday = summaries.reduce(
    (sum, s) => sum + (s.dueTodayCount && !s.completed ? 1 : 0), // Count only if not completed
    0
  );
  const totalOverdue = summaries.reduce(
    (sum, s) => sum + (s.overdueCount || 0),
    0
  );

  return (
    <div className="flex-grow relative">
      <div className="p-6">
        <h1 className="text-3xl font-black mb-6">Home</h1>

        <div className="my-8">
          <h2 className="text-3xl font-medium mb-2">
            <span className="text-indigo-deep font-bold">
              {timeLeft.split(" ")[0]} {timeLeft.split(" ")[1]}
            </span>
            <span className="text-base">
              {timeLeft.split(" ").slice(2).join(" ")}
            </span>
          </h2>
          <div className="w-full bg-white border-2 border-indigo-deep rounded-lg h-10 mb-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-10 rounded-l-md flex items-center justify-center"
              style={{ width: `${progressPercentage}%`, opacity: 0.8 }}
            >
              <span className="text-white text-xs font-medium">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
          </div>
          <h2 className="text-xl font-medium my-3">
            You have{" "}
            <span className="text-indigo-deep font-bold">{totalDueToday}</span>{" "}
            todos still due today and{" "}
            <span className="text-red-500 font-bold">{totalOverdue}</span> that
            are overdue
          </h2>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
