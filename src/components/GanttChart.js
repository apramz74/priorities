import React, { useState, useEffect, useMemo } from "react";
import { fetchMilestones, fetchPriorities } from "../utils/api";

const GanttChart = () => {
  const [priorities, setPriorities] = useState([]);
  const [milestones, setMilestones] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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

  const { startDate, endDate, months } = useMemo(() => {
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

    const monthsArray = [];
    let current = new Date(start);
    while (current <= end) {
      monthsArray.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return { startDate: start, endDate: end, months: monthsArray };
  }, [milestones]);

  const calculateMilestonePosition = (milestoneDate) => {
    const date = new Date(milestoneDate);
    const monthIndex = months.findIndex(
      (m) =>
        m.getMonth() === date.getMonth() &&
        m.getFullYear() === date.getFullYear()
    );
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const dayOfMonth = date.getDate();

    return ((monthIndex + dayOfMonth / daysInMonth) / months.length) * 100;
  };

  const calculateBarPosition = (priorityMilestones) => {
    if (!priorityMilestones || priorityMilestones.length === 0) return null;

    const milestoneDates = priorityMilestones.map((m) => new Date(m.date));
    const firstMilestone = new Date(Math.min(...milestoneDates));
    const lastMilestone = new Date(Math.max(...milestoneDates));

    // Add a small buffer before the first milestone and after the last milestone
    const bufferDays = 5; // Adjust this value as needed
    const barStartDate = new Date(firstMilestone);
    barStartDate.setDate(barStartDate.getDate() - bufferDays);
    const barEndDate = new Date(lastMilestone);
    barEndDate.setDate(barEndDate.getDate() + bufferDays);

    const totalDuration = endDate - startDate;
    const left = ((barStartDate - startDate) / totalDuration) * 100;
    const width = ((barEndDate - barStartDate) / totalDuration) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const formatMilestoneDate = (date) => {
    return new Date(date).toLocaleDateString("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <div>Loading Gantt Chart...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-black mb-2">Gantt</h1>
      </div>
      <div className="gantt-chart">
        <div className="gantt-content">
          <div className="gantt-priorities">
            {priorities.map((priority) => {
              const barPosition = calculateBarPosition(milestones[priority.id]);
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
                          left: `${calculateMilestonePosition(
                            milestone.date
                          )}%`,
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
  );
};

export default GanttChart;
