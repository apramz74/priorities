import React, { useState, useEffect, useCallback } from "react";
import {
  fetchTodosForToday,
  assignStartTimesAndDurations,
  calculateTodoCounts,
} from "../utils/api";
import DailyCalendar from "./DailyCalendar";
import TodoSelectionModal from "./TodoSelectionModal";

const DailyPlanView = ({ priorities, setSelectedPriority, setView }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodos, setSelectedTodos] = useState([]);
  const [totalDueToday, setTotalDueToday] = useState(0);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [allTodos, setAllTodos] = useState([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleTodoUpdate = useCallback(async () => {
    const todos = await fetchTodosForToday();
    setAllTodos(todos);

    const selectedTodosWithStartTimes = await assignStartTimesAndDurations(
      todos.filter((todo) => todo.selected_for_today)
    );
    setSelectedTodos(selectedTodosWithStartTimes);

    const { dueToday, overdue } = await calculateTodoCounts();
    setTotalDueToday(dueToday);
    setTotalOverdue(overdue);
  }, []);

  useEffect(() => {
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-8">Daily Plan</h1>
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

      <div className="">
        <DailyCalendar
          onTodoUpdate={handleTodoUpdate}
          selectedTodos={selectedTodos}
          totalDueToday={totalDueToday}
          totalOverdue={totalOverdue}
          handleOpenModal={handleOpenModal}
        />
      </div>

      <TodoSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedTodos={selectedTodos}
        setSelectedTodos={setSelectedTodos}
        priorities={priorities}
        allTodos={allTodos}
        onTodoUpdate={handleTodoUpdate}
      />
    </div>
  );
};

export default DailyPlanView;
