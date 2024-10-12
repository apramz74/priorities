import React, { useState, useEffect, useMemo } from "react";
import { fetchMilestones } from "../utils/api";

const GanttChart = ({ priorities }) => {
  const [milestones, setMilestones] = useState({});
  const [timeScale, setTimeScale] = useState("months");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllMilestones = async () => {
      setIsLoading(true);
      const milestonesData = {};
      for (const priority of priorities) {
        const priorityMilestones = await fetchMilestones(priority.id);
        milestonesData[priority.id] = priorityMilestones;
      }
      setMilestones(milestonesData);
      setIsLoading(false);
    };

    fetchAllMilestones();
  }, [priorities]);

  const handleTimeScaleChange = (event) => {
    setTimeScale(event.target.value);
  };

  const { startDate, endDate, timeLabels } = useMemo(() => {
    let start = new Date();
    let end = new Date();
    const allMilestones = Object.values(milestones).flat();

    if (allMilestones.length > 0) {
      start = new Date(Math.min(...allMilestones.map((m) => new Date(m.date))));
      end = new Date(Math.max(...allMilestones.map((m) => new Date(m.date))));
    }

    // Extend the range by one unit on each side
    start.setMonth(start.getMonth() - 1);
    end.setMonth(end.getMonth() + 1);

    const labels = [];
    let current = new Date(start);

    while (current <= end) {
      switch (timeScale) {
        case "weeks":
          labels.push(new Date(current));
          current.setDate(current.getDate() + 7);
          break;
        case "months":
          labels.push(new Date(current));
          current.setMonth(current.getMonth() + 1);
          break;
        case "quarters":
          labels.push(new Date(current));
          current.setMonth(current.getMonth() + 3);
          break;
      }
    }

    return { startDate: start, endDate: end, timeLabels: labels };
  }, [milestones, timeScale]);

  const formatTimeLabel = (date) => {
    switch (timeScale) {
      case "weeks":
        return `Week ${date.getWeek()}`;
      case "months":
        return date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      case "quarters":
        return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    }
  };

  const calculateBarPosition = (priorityMilestones) => {
    if (!priorityMilestones || priorityMilestones.length === 0) return null;

    const firstMilestone = new Date(priorityMilestones[0].date);
    const lastMilestone = new Date(
      priorityMilestones[priorityMilestones.length - 1].date
    );

    const left = ((firstMilestone - startDate) / (endDate - startDate)) * 100;
    const width =
      ((lastMilestone - firstMilestone) / (endDate - startDate)) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  if (isLoading) {
    return <div>Loading Gantt Chart...</div>;
  }

  return (
    <div className="gantt-chart">
      <div className="gantt-header">
        <h2>Gantt Chart</h2>
        <select value={timeScale} onChange={handleTimeScaleChange}>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
          <option value="quarters">Quarters</option>
        </select>
      </div>
      <div className="gantt-content">
        <div className="gantt-time-scale">
          {timeLabels.map((label, index) => (
            <div key={index} className="time-label">
              {formatTimeLabel(label)}
            </div>
          ))}
        </div>
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
                    >
                      {milestones[priority.id]?.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="milestone-marker"
                          style={{
                            left: `${
                              ((new Date(milestone.date) -
                                new Date(milestones[priority.id][0].date)) /
                                (new Date(
                                  milestones[priority.id][
                                    milestones[priority.id].length - 1
                                  ].date
                                ) -
                                  new Date(milestones[priority.id][0].date))) *
                              100
                            }%`,
                          }}
                          title={`${milestone.title}: ${milestone.date}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper function to get the week number
Date.prototype.getWeek = function () {
  var d = new Date(
    Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())
  );
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

export default GanttChart;
