import React, { useState, useEffect } from "react";
import { fetchPrioritySummary } from "../utils/api";

const HomeView = ({ priorities, setSelectedPriority, setView }) => {
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    const loadSummaries = async () => {
      const summaryData = await fetchPrioritySummary();
      setSummaries(summaryData);
    };
    loadSummaries();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Priority Summary</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priorities.map((priority) => {
          const summary =
            summaries.find((s) => s.priorityId === priority.id) || {};
          return (
            <div
              key={priority.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedPriority(priority);
                setView("priority");
              }}
            >
              <h3 className="text-lg font-semibold mb-2">{priority.name}</h3>
              <div className="flex justify-between">
                <div className="text-red-500">
                  <span className="font-bold text-2xl">
                    {summary.overdueCount || 0}
                  </span>
                  <span className="text-sm ml-1">overdue</span>
                </div>
                <div className="text-orange-500">
                  <span className="font-bold text-2xl">
                    {summary.dueTodayCount || 0}
                  </span>
                  <span className="text-sm ml-1">due today</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeView;
