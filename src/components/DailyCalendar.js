import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  fetchTodosForToday,
  toggleComplete,
  updateTodoStartTime,
  updateTodoDuration,
} from "../utils/api";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Create a DnD Calendar
const DnDCalendar = withDragAndDrop(Calendar);

const DailyCalendar = () => {
  const [todos, setTodos] = useState([]);
  const [scrolledDate, setScrolledDate] = useState(new Date());

  useEffect(() => {
    loadTodosForToday();
  }); // Empty dependency array ensures this runs only once on mount

  const loadTodosForToday = async () => {
    const todayTodos = await fetchTodosForToday();
    const formattedTodos = formatTodosForCalendar(todayTodos);
    setTodos(formattedTodos);
  };

  const formatTodosForCalendar = (todos) => {
    return todos.map((todo) => {
      const start = new Date(`${todo.due_date}T${todo.start_time}`);
      const durationInMinutes = todo.duration || 30;
      const end = new Date(start.getTime() + durationInMinutes * 60000);

      return {
        id: todo.id,
        title: todo.name,
        start: start,
        end: end,
        resource: todo,
        duration: durationInMinutes,
      };
    });
  };

  const handleSelectEvent = async (event) => {
    const updatedTodo = {
      ...event.resource,
      completed: !event.resource.completed,
    };
    await toggleComplete("todos", updatedTodo.id, updatedTodo.completed);
    loadTodosForToday();
  };

  const handleEventResize = async ({ event, start, end }) => {
    const updatedTodo = { ...event.resource, start_time: start, end_time: end };
    const duration = moment
      .duration(moment(end).diff(moment(start)))
      .asMinutes();
    await updateTodoStartTime(updatedTodo.id, moment(start).format("HH:mm"));
    await updateTodoDuration(updatedTodo.id, duration);
    loadTodosForToday();
  };

  const handleEventDrop = async ({ event, start, end }) => {
    const updatedTodo = { ...event.resource, start_time: start, end_time: end };
    const duration = moment
      .duration(moment(end).diff(moment(start)))
      .asMinutes();
    await updateTodoStartTime(updatedTodo.id, moment(start).format("HH:mm"));
    await updateTodoDuration(updatedTodo.id, duration);
    loadTodosForToday();
  };

  const eventStyleGetter = (event) => {
    const isCompleted = event.resource.completed;
    const style = {
      backgroundColor: isCompleted ? "#F3F4F6" : "#EEF2FF",
      borderRadius: "8px",
      border: `2px solid ${isCompleted ? "#D1D5DB" : "#818CF8"}`,
      color: isCompleted ? "#6B7280" : "#1F2937",
      padding: "4px 8px 4px 4px", // Added more padding on the right
      fontSize: "12px",
      fontWeight: "500",
    };
    return { style, className: isCompleted ? "completed" : "" };
  };

  const handleScroll = useCallback((date) => {
    setScrolledDate(date);
  }, []);

  return (
    <div className="daily-calendar w-full" style={{ height: "600px" }}>
      <h2 className="text-xl font-semibold mb-4">Your day</h2>
      <div
        className="calendar-container bg-white rounded-lg shadow-sm"
        style={{ height: "calc(100% - 40px)" }}
      >
        <DnDCalendar
          localizer={localizer}
          events={todos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          view="day"
          views={["day"]}
          step={30}
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
            dayFormat: () => "", // This will remove the day format text
          }}
          toolbar={false} // This will remove the toolbar
        />
      </div>
    </div>
  );
};

export default DailyCalendar;
