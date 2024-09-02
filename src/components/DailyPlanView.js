import React, { useState, useEffect, useCallback } from "react";
import {
  fetchPrioritySummary,
  fetchTodosForToday,
  assignStartTimesAndDurations,
} from "../utils/api";
import DailyCalendar from "./DailyCalendar";
import TodoSelectionModal from "./TodoSelectionModal";

const DailyPlanView = ({ priorities, setSelectedPriority, setView }) => {
  const [summaries, setSummaries] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodos, setSelectedTodos] = useState([]);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleTodoUpdate = useCallback(async () => {
    const summaryData = await fetchPrioritySummary();
    setSummaries(summaryData);
    const todosForToday = await fetchTodosForToday();
    const selectedTodosWithStartTimes = await assignStartTimesAndDurations(
      todosForToday.filter((todo) => todo.selected_for_today)
    );
    setSelectedTodos(selectedTodosWithStartTimes);
  }, []);

  useEffect(() => {
    const loadSummaries = async () => {
      const summaryData = await fetchPrioritySummary();
      setSummaries(summaryData);
    };
    loadSummaries();
    handleTodoUpdate();

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
  }, [handleTodoUpdate]);

  const totalDueToday = summaries.reduce((sum, s) => sum + s.dueTodayCount, 0);
  const totalOverdue = summaries.reduce(
    (sum, s) => sum + (s.overdueCount || 0),
    0
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-8">Home</h1>
        <h2 className="text-xl font-medium mb-2">
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
      </div>

      <div className="mt-8">
        <DailyCalendar
          onTodoUpdate={handleTodoUpdate}
          selectedTodos={selectedTodos}
          totalDueToday={totalDueToday} // Pass totalDueToday
          totalOverdue={totalOverdue} // Pass totalOverdue
          handleOpenModal={handleOpenModal}
        />
      </div>

      <TodoSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedTodos={selectedTodos}
        setSelectedTodos={setSelectedTodos}
      />
    </div>
  );
};

export default DailyPlanView;
