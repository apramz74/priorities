import React, { useState, useEffect, useCallback } from "react";
import {
  fetchWeeklyTodos,
  fetchCompletedTodos,
  fetchPriorities,
} from "../utils/api";
import { ReactComponent as LeftArrowIcon } from "./left_arrow.svg";
import { ReactComponent as RightArrowIcon } from "./right_arrow.svg";
import TodoItem from "./TodoItem";
import UpdatePreview from "./UpdatePreview";
import model from "./geminiService"; // Import the Gemini model

const WeeklyReportView = () => {
  const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const new_date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), diff))
      .toISOString()
      .split("T")[0];
    return new_date;
  };

  const getEndOfWeek = (startDate) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 4); // Add 4 days to get to Friday
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getStartOfWeek());
  const [endDate, setEndDate] = useState(getEndOfWeek(startDate));
  const [weeklyTodos, setWeeklyTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [selectedTodos, setSelectedTodos] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [generatedUpdate, setGeneratedUpdate] = useState("");

  const fetchTodosForWeek = useCallback(async () => {
    const dueTodos = await fetchWeeklyTodos(startDate, endDate);
    const completedTodos = await fetchCompletedTodos(startDate, endDate);

    // Combine and deduplicate todos
    const allTodos = [...dueTodos, ...completedTodos].reduce((acc, todo) => {
      acc[todo.id] = todo;
      return acc;
    }, {});

    setWeeklyTodos(Object.values(allTodos));
    setCompletedTodos(completedTodos);
  }, [startDate, endDate]);

  useEffect(() => {
    fetchTodosForWeek();
  }, [startDate, endDate, fetchTodosForWeek]);

  useEffect(() => {
    const loadPriorities = async () => {
      const fetchedPriorities = await fetchPriorities();
      setPriorities(fetchedPriorities);
    };
    loadPriorities();
  }, []);

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

  const groupTodosByPriority = (todos) => {
    return todos.reduce((acc, todo) => {
      if (!acc[todo.priority_name]) {
        acc[todo.priority_name] = [];
      }
      acc[todo.priority_name].push(todo);
      return acc;
    }, {});
  };

  const getRelevantPriorities = () => {
    const groupedTodos = groupTodosByPriority(weeklyTodos);
    return priorities.filter(
      (priority) =>
        groupedTodos[priority.name] && groupedTodos[priority.name].length > 0
    );
  };

  const isCompleted = (todo) => {
    return completedTodos.some((completedTodo) => completedTodo.id === todo.id);
  };

  const handleSelectTodo = (todo) => {
    if (todo.completed_at) {
      setSelectedTodos([...selectedTodos, todo]);
    }
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

  return (
    <div className="flex-grow relative">
      <div className="p-6">
        <h1 className="text-3xl font-black mb-2">Weekly Report</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <h2 className="text-sm  font-inter">
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
          <div className="w-2/5 ">
            <h3 className="text-xl font-bold mb-4">
              <span className="text-indigo-deep text-2xl">
                {completedTodos.length}{" "}
              </span>{" "}
              tasks completed this week
            </h3>
            <div className="space-y-4">
              {getRelevantPriorities().map((priority) => {
                const todos =
                  groupTodosByPriority(weeklyTodos)[priority.name] || [];
                return (
                  <div key={priority.id}>
                    <h4 className="font-semibold text-sm mb-2">
                      {priority.name} ({todos.length})
                    </h4>
                    <ul className="space-y-2">
                      {todos.map((todo) => (
                        <li key={todo.id}>
                          <TodoItem
                            todo={todo}
                            isCompleted={isCompleted(todo)}
                            isSelected={selectedTodos.some(
                              (t) => t.id === todo.id
                            )}
                            onSelect={() => handleSelectTodo(todo)}
                            onDeselect={() => handleDeselectTodo(todo)}
                          />
                        </li>
                      ))}
                    </ul>
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
