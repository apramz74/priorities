import React, { useState, useEffect, useCallback } from "react";
import { fetchWeeklyTodos } from "../utils/api";
import TodoItem from "./TodoItem";
import UpdatePreview from "./UpdatePreview";
import { ReactComponent as LeftArrowIcon } from "./left_arrow.svg";
import { ReactComponent as RightArrowIcon } from "./right_arrow.svg";
import model from "./geminiService"; // Import the Gemini model

const WeeklyReportView = ({ priorities }) => {
  const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };

  const getEndOfWeek = (startDate) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getStartOfWeek());
  const [endDate, setEndDate] = useState(getEndOfWeek(startDate));
  const [weeklyTodos, setWeeklyTodos] = useState([]);
  const [selectedTodos, setSelectedTodos] = useState([]);
  const [generatedUpdate, setGeneratedUpdate] = useState("");

  const fetchTodosForWeek = useCallback(async () => {
    const todos = await fetchWeeklyTodos(startDate, endDate);
    setWeeklyTodos(todos);
  }, [startDate, endDate]);

  useEffect(() => {
    fetchTodosForWeek();
  }, [startDate, endDate, fetchTodosForWeek]);

  const handleDateChange = (direction) => {
    const addDays = (dateString, days) => {
      const date = new Date(dateString);
      date.setDate(date.getDate() + days);
      return date.toISOString().split("T")[0];
    };

    const newStart = addDays(startDate, direction === "next" ? 7 : -7);
    setStartDate(newStart);
    setEndDate(getEndOfWeek(newStart));
  };

  const formatDateRange = (start, end) => {
    const formatDate = (dateString) => {
      const [year, month, day] = dateString.split("-");
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleSelectTodo = (todo) => {
    setSelectedTodos([...selectedTodos, todo]);
  };

  const handleDeselectTodo = (todo) => {
    setSelectedTodos(selectedTodos.filter((t) => t.id !== todo.id));
  };

  const generateUpdate = async (selectedTasks) => {
    if (selectedTasks.length < 3) {
      setGeneratedUpdate(
        "Select at least 3 completed tasks to generate an update"
      );
      return;
    }

    const taskDescriptions = selectedTasks
      .map(
        (task) =>
          `- ${task.name}: ${task.description || "No description provided"}`
      )
      .join("\n");
    const prompt = `Review this context on my completed tasks for the week:\n${taskDescriptions}\n\n For each task, utilize the context provided to generate a descriptive summary. You're a seasoned product manager with 10+ YOE so make assumptions to fill any gaps you may have from the provided context, based on your experience. Write from the 1st person perspective. Each item should start with a bolded 4 word max summary and then a more detailed description of what I did. Also, the whole thing should start with a header "What I did this week". No formatting like "**" and no need for a subject line`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();
      setGeneratedUpdate(generatedText);
    } catch (error) {
      console.error("Error generating update:", error);
      setGeneratedUpdate(
        "An error occurred while generating the update. Please try again."
      );
    }
  };

  const groupTodosByPriority = (todos) => {
    return todos.reduce((acc, todo) => {
      const priorityName = todo.priority?.name || "No Priority";
      if (!acc[priorityName]) {
        acc[priorityName] = [];
      }
      acc[priorityName].push(todo);
      return acc;
    }, {});
  };

  const groupedTodos = groupTodosByPriority(weeklyTodos);

  return (
    <div className="flex-grow relative">
      <div className="p-6">
        <h1 className="text-3xl font-black mb-2">Weekly Report</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <h2 className="text-sm font-inter">
            Report for {formatDateRange(startDate, endDate)}
          </h2>
          <button
            onClick={() => handleDateChange("prev")}
            className="hover:text-gray-800"
          >
            <LeftArrowIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDateChange("next")}
            className="hover:text-gray-800"
          >
            <RightArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex">
          <div className="w-2/5">
            <h3 className="text-xl font-bold mb-4">
              <span className="text-indigo-deep text-2xl">
                {weeklyTodos.filter((todo) => todo.completed).length}
              </span>{" "}
              tasks completed this week
            </h3>
            <div className="space-y-4">
              {priorities.map((priority) => {
                const priorityName = priority.name;
                const todos = groupedTodos[priorityName] || [];
                if (todos.length === 0) return null;
                return (
                  <div key={priority.id}>
                    <h5 className="font-semibold mb-2">{priorityName}</h5>
                    <div className="space-y-2">
                      {todos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          isSelected={selectedTodos.some(
                            (t) => t.id === todo.id
                          )}
                          onSelect={() => handleSelectTodo(todo)}
                          onDeselect={() => handleDeselectTodo(todo)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-3/5 pl-20">
            <UpdatePreview
              selectedTasks={selectedTodos}
              generatedUpdate={generatedUpdate}
              onGenerateUpdate={() => generateUpdate(selectedTodos)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportView;
