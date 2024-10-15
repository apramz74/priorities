import React, { useState, useEffect, useMemo } from "react";
import { fetchMilestones, fetchPriorities } from "../utils/api";

const DAY_WIDTH = 3; // Pixels per day
const PRIORITY_NAME_WIDTH = 150; // Width of the priority name column

const TimeScale = ({ startDate, endDate, zoomFactor }) => {
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const months = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return (
    <div
      className="gantt-time-scale"
      style={{
        width: `${days * DAY_WIDTH * zoomFactor}px`,
        marginLeft: `${PRIORITY_NAME_WIDTH}px`, // Add left margin
      }}
    >
      {months.map((month, index) => {
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const monthWidth = Math.min(
          ((monthEnd - monthStart) / (1000 * 60 * 60 * 24)) *
            DAY_WIDTH *
            zoomFactor,
          ((endDate - monthStart) / (1000 * 60 * 60 * 24)) *
            DAY_WIDTH *
            zoomFactor
        );
        const monthLeft =
          ((monthStart - startDate) / (1000 * 60 * 60 * 24)) *
          DAY_WIDTH *
          zoomFactor;

        return (
          <div
            key={index}
            className="month-label"
            style={{
              left: `${monthLeft}px`,
              width: `${monthWidth}px`,
            }}
          >
            {month.toLocaleString("default", {
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      })}
    </div>
  );
};

// Add this new component
const TodayIndicator = ({ startDate, zoomFactor }) => {
  const today = new Date();
  const left =
    ((today - startDate) / (1000 * 60 * 60 * 24)) * DAY_WIDTH * zoomFactor;

  return (
    <div
      className="today-indicator"
      style={{
        position: "absolute",
        left: `${left + PRIORITY_NAME_WIDTH}px`,
        top: "0px", // Adjust this value to match the height of your time scale
        bottom: 0,
        width: "2px",
        backgroundColor: "red",
        zIndex: 10,
      }}
    />
  );
};

const GanttChart = () => {
  const [priorities, setPriorities] = useState([]);
  const [milestones, setMilestones] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [zoomFactor, setZoomFactor] = useState(2);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const fetchedPriorities = await fetchPriorities();
      const activePriorities = fetchedPriorities.filter((p) => !p.completed);
      setPriorities(activePriorities);

      const milestonesData = {};
      for (const priority of activePriorities) {
        const priorityMilestones = await fetchMilestones(priority.id);
        milestonesData[priority.id] = priorityMilestones;
      }
      setMilestones(milestonesData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const { startDate, endDate, days } = useMemo(() => {
    let start = new Date();
    let end = new Date();
    const allMilestones = Object.values(milestones).flat();

    if (allMilestones.length > 0) {
      start = new Date(Math.min(...allMilestones.map((m) => new Date(m.date))));
      end = new Date(Math.max(...allMilestones.map((m) => new Date(m.date))));
    }

    // Extend the range to full months
    start = new Date(start.getFullYear(), start.getMonth(), 1);
    end = new Date(end.getFullYear(), end.getMonth() + 1, 0);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return { startDate: start, endDate: end, days: totalDays };
  }, [milestones]);

  const calculatePosition = (date) => {
    const days = Math.floor(
      (new Date(date) - startDate) / (1000 * 60 * 60 * 24)
    );
    return days * DAY_WIDTH * zoomFactor;
  };

  const calculateBarPosition = (priorityMilestones) => {
    if (!priorityMilestones || priorityMilestones.length === 0) return null;

    const milestoneDates = priorityMilestones.map((m) => new Date(m.date));
    const firstMilestone = new Date(Math.min(...milestoneDates));
    const lastMilestone = new Date(Math.max(...milestoneDates));

    const bufferDays = 5;
    const barStartDate = new Date(firstMilestone);
    barStartDate.setDate(barStartDate.getDate() - bufferDays);
    const barEndDate = new Date(lastMilestone);
    barEndDate.setDate(barEndDate.getDate() + bufferDays);

    const left = calculatePosition(barStartDate);
    const width = calculatePosition(barEndDate) - left;

    return { left: `${left}px`, width: `${width}px` };
  };

  const formatMilestoneDate = (date) => {
    return new Date(date).toLocaleDateString("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const zoomIn = () => setZoomFactor((prev) => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoomFactor((prev) => Math.max(prev / 1.2, 0.5));

  if (isLoading) {
    return <div>Loading Gantt Chart...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-3 flex justify-between items-center">
        <h1 className="text-3xl font-black">Gantt</h1>
        <div className="zoom-controls">
          <button
            onClick={zoomOut}
            className="mr-2 px-2 py-1 bg-gray-200 rounded"
          >
            -
          </button>
          <button onClick={zoomIn} className="px-2 py-1 bg-gray-200 rounded">
            +
          </button>
        </div>
      </div>
      <div className="gantt-chart" style={{ position: "relative" }}>
        <TimeScale
          startDate={startDate}
          endDate={endDate}
          zoomFactor={zoomFactor}
        />
        <div className="gantt-content-wrapper" style={{ position: "relative" }}>
          <TodayIndicator startDate={startDate} zoomFactor={zoomFactor} />
          <div
            className="gantt-content"
            style={{
              width: `${days * DAY_WIDTH * zoomFactor + PRIORITY_NAME_WIDTH}px`,
            }}
          >
            <div className="gantt-priorities">
              {priorities.map((priority) => {
                const barPosition = calculateBarPosition(
                  milestones[priority.id]
                );
                return (
                  <div key={priority.id} className="gantt-priority-row">
                    <div className="priority-name">{priority.name}</div>
                    <div className="priority-bar-container">
                      {barPosition && (
                        <div
                          className="priority-bar"
                          style={{
                            left: barPosition.left,
                            width: barPosition.width,
                          }}
                        />
                      )}
                      {milestones[priority.id]?.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="milestone-marker"
                          style={{
                            left: `${calculatePosition(milestone.date)}px`,
                          }}
                          data-tooltip={`${
                            milestone.title
                          }: ${formatMilestoneDate(milestone.date)}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
