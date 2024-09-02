import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  toggleComplete,
  updateTodoDuration,
  updateTodoStartAt,
} from "../utils/api";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const DailyCalendar = ({
  onTodoUpdate,
  selectedTodos,
  totalDueToday,
  totalOverdue,
  handleOpenModal,
}) => {
  const [scrolledDate, setScrolledDate] = useState(new Date());

  const formatTodosForCalendar = useCallback((todos) => {
    return todos.map((todo) => {
      const start = new Date(todo.start_at);

      const end = new Date(start.getTime() + (todo.duration || 30) * 60000);

      return {
        id: todo.id,
        title: todo.name,
        start: start,
        end: end,
        resource: todo,
      };
    });
  }, []);

  const handleSelectEvent = async (event) => {
    const updatedTodo = {
      ...event.resource,
      completed: !event.resource.completed,
    };
    await toggleComplete("todos", updatedTodo.id, updatedTodo.completed);
    onTodoUpdate();
  };

  const handleEventResize = async ({ event, start, end }) => {
    const updatedTodo = { ...event.resource, start_at: start.toISOString() };
    const duration = moment
      .duration(moment(end).diff(moment(start)))
      .asMinutes();
    await updateTodoStartAt(updatedTodo.id, updatedTodo.start_at);
    await updateTodoDuration(updatedTodo.id, duration);
    onTodoUpdate();
  };

  const handleEventDrop = async ({ event, start, end }) => {
    const updatedTodo = { ...event.resource, start_at: start.toISOString() };

    const duration = moment
      .duration(moment(end).diff(moment(start)))
      .asMinutes();
    await updateTodoStartAt(updatedTodo.id, updatedTodo.start_at);
    await updateTodoDuration(updatedTodo.id, duration);
    onTodoUpdate();
  };

  const eventStyleGetter = (event) => {
    const isCompleted = event.resource.completed;
    const style = {
      backgroundColor: isCompleted ? "#F3F4F6" : "#EEF2FF",
      borderRadius: "8px",
      border: `2px solid ${isCompleted ? "#D1D5DB" : "#818CF8"}`,
      color: isCompleted ? "#6B7280" : "#1F2937",
      padding: "4px 8px 4px 4px",
      fontSize: "12px",
      fontWeight: "500",
    };
    return { style, className: isCompleted ? "completed" : "" };
  };

  const handleScroll = useCallback((date) => {
    setScrolledDate(date);
  }, []);

  return (
    <div className="daily-calendar w-full" style={{ height: "800px" }}>
      <h2 className="text-xl font-semibold mb-2">Your day</h2>
      <h2 className="text-md mt-1">
        You have{" "}
        <span className="text-indigo-deep font-bold">{totalDueToday}</span>{" "}
        {totalDueToday === 1 ? "todo" : "todos"} still due today and{" "}
        <span className="text-red-500 font-bold">{totalOverdue}</span>{" "}
        {totalOverdue === 1 ? "that is" : "that are"} overdue
      </h2>
      <button
        onClick={handleOpenModal}
        className="text-indigo-deep text-sm text-medium hover:text-indigo-700 mb-4"
      >
        Select todos for today →
      </button>
      <div
        className="calendar-container bg-white rounded-lg shadow-sm"
        style={{ height: "calc(100% - 40px)" }}
      >
        <DnDCalendar
          localizer={localizer}
          events={formatTodosForCalendar(selectedTodos)}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          view="day"
          views={["day"]}
          step={10}
          timeslots={1}
          onSelectEvent={handleSelectEvent}
          onEventResize={handleEventResize}
          onEventDrop={handleEventDrop}
          resizable
          selectable
          draggableAccessor={() => true}
          resizableAccessor={() => true}
          eventPropGetter={eventStyleGetter}
          scrollToTime={scrolledDate}
          onNavigate={handleScroll}
          formats={{
            timeGutterFormat: (date, culture, localizer) =>
              localizer.format(date, "HH:mm", culture),
            dayFormat: () => "",
          }}
          toolbar={false}
        />
      </div>
    </div>
  );
};

export default DailyCalendar;
