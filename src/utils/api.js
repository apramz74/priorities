import { supabase } from "../supabaseClient";

// Priority-related functions
// ===========================

// Fetches all non-deleted priorities, ordered by their order and creation date
export async function fetchPriorities() {
  const { data, error } = await supabase
    .from("priorities")
    .select("*")
    .is("deleted", false)
    .order("order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching priorities:", error);
    return [];
  }

  return data || [];
}

// Adds a new priority with the given name and slot
export async function addPriority(name, slot) {
  const { data, error } = await supabase
    .from("priorities")
    .insert([{ name, completed: false, deleted: false, order: slot }])
    .select();
  if (error) console.log("Error adding priority:", error);
  return data ? data[0] : null;
}

// Updates an existing priority, setting order to null if completed or deleted
export async function updatePriority(priority) {
  const updatedPriority = { ...priority };
  if (priority.completed || priority.deleted) {
    updatedPriority.order = null;
  }
  const { error } = await supabase
    .from("priorities")
    .update(updatedPriority)
    .eq("id", priority.id);
  if (error) console.log("Error updating priority:", error);
  return !error;
}

// Marks a priority as deleted and sets its order to null
export async function deletePriority(id) {
  const { error } = await supabase
    .from("priorities")
    .update({ deleted: true, order: null })
    .eq("id", id);
  if (error) console.log("Error deleting priority:", error);
  return !error;
}

// Toggles the completion status of a priority and updates its order accordingly
export async function togglePriorityCompletion(id, completed) {
  const { error } = await supabase
    .from("priorities")
    .update({
      completed,
      order: completed
        ? null
        : supabase.sql`(SELECT COALESCE(MAX(order), -1) + 1 FROM priorities WHERE NOT completed AND NOT deleted)`,
    })
    .eq("id", id);
  if (error) console.log("Error toggling priority completion:", error);
  return !error;
}

// Updates the order of multiple priorities
export async function updatePrioritiesOrder(priorities) {
  const { error } = await supabase.from("priorities").upsert(
    priorities.map(({ id, order }) => ({ id, order })),
    { onConflict: "id" }
  );

  if (error) console.log("Error updating priorities order:", error);
  return !error;
}

// Fetches a summary of priorities, including overdue and due today todo counts
export async function fetchPrioritySummary() {
  const priorities = await fetchPriorities();
  const summaries = [];

  const today = new Date(getTodayDate());

  for (const priority of priorities) {
    const todos = await fetchTodos(priority.id, true); // Fetch all todos for the priority

    const overdueTodos = todos.filter((todo) => {
      const dueDate = new Date(todo.due_date + "T00:00:00");
      if (!todo.completed && dueDate < today) {
        return true; // Include this todo in the overdue list
      }
      return false; // Exclude this todo
    });

    const dueTodayTodos = todos.filter((todo) => {
      const dueDate = new Date(todo.due_date + "T00:00:00");
      if (!todo.completed && dueDate.toDateString() === today.toDateString()) {
        return true; // Include this todo in the due today list
      }
      return false; // Exclude this todo
    });

    const overdueCount = overdueTodos.length;
    const dueTodayCount = dueTodayTodos.length;

    summaries.push({
      priorityId: priority.id,
      priorityName: priority.name,
      overdueCount,
      dueTodayCount,
    });
  }

  return summaries;
}

// Calculates a new order for a reopened priority
export async function getNewOrderForReopenedPriority() {
  const { data, error } = await supabase
    .from("priorities")
    .select("order")
    .is("completed", false)
    .is("deleted", false)
    .order("order", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error getting new order for reopened priority:", error);
    return null;
  }

  return data && data.length > 0 ? data[0].order + 1 : 0;
}

// Todo-related functions
// ======================

// Fetches todos for a specific priority, optionally including completed ones
export async function fetchTodos(priorityId, includeCompleted = false) {
  let query = supabase
    .from("todos")
    .select("*")
    .eq("priority_id", priorityId)
    .is("deleted", false);

  if (!includeCompleted) {
    query = query.is("completed", false);
  }

  const { data, error } = await query;
  if (error) console.log("Error fetching todos:", error);
  return data || [];
}

// Adds a new todo, handling the case of "misc" priority
export async function addTodo(todo) {
  let priorityId = todo.priority_id;
  if (priorityId === "misc") {
    priorityId = await ensureMiscellaneousPriority();
    if (!priorityId) {
      console.error("Failed to get or create Miscellaneous priority");
      return null;
    }
  }
  const { data, error } = await supabase
    .from("todos")
    .insert([
      { ...todo, priority_id: priorityId, completed: false, deleted: false },
    ])
    .select();
  if (error) console.log("Error adding todo:", error);
  return data ? data[0] : null;
}

// Updates an existing todo
export async function updateTodo(todo) {
  const { data, error } = await supabase
    .from("todos")
    .update({
      ...todo,
      completed: todo.completed || false,
      deleted: todo.deleted || false,
    })
    .eq("id", todo.id)
    .select();
  if (error) console.log("Error updating todo:", error);
  return data ? data[0] : null;
}

// Marks a todo as deleted
export async function deleteTodo(id) {
  return toggleDeleted("todos", id, true);
}

// Fetches todos for the miscellaneous priority
export async function fetchMiscTodos(includeCompleted = false) {
  const miscPriorityId = await ensureMiscellaneousPriority();
  if (!miscPriorityId) {
    console.error("Failed to get or create Miscellaneous priority");
    return [];
  }

  let query = supabase
    .from("todos")
    .select("*")
    .eq("priority_id", miscPriorityId)
    .is("deleted", false);

  if (!includeCompleted) {
    query = query.is("completed", false);
  }

  const { data, error } = await query;
  if (error) console.log("Error fetching misc todos:", error);
  return data || [];
}

// Fetches todos for a specific week
export async function fetchWeeklyTodos(startDate, endDate) {
  const { data, error } = await supabase
    .from("todos")
    .select("*, priority:priorities(name)")
    .or(
      `and(due_date.gte.${startDate},due_date.lte.${endDate}),and(completed.eq.true,completed_at.gte.${startDate},completed_at.lte.${endDate})`
    )
    .order("completed", { ascending: false })
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching weekly todos:", error);
    return [];
  }

  return data;
}

// Updates the start time of a todo
export async function updateTodoStartAt(id, start_at) {
  const { error } = await supabase
    .from("todos")
    .update({ start_at })
    .eq("id", id);

  if (error) console.error("Error updating todo start_at:", error);
  return !error;
}

// Updates the duration of a todo
export async function updateTodoDuration(id, duration) {
  const { error } = await supabase
    .from("todos")
    .update({ duration: duration })
    .eq("id", id);

  if (error) console.error("Error updating todo duration:", error);
  return !error;
}

// Fetches todos for today
export async function fetchAllTodosWithPriorities() {
  const today = getTodayDate();
  const todayStart = `${today}T00:00:00`;
  const todayEnd = `${today}T23:59:59`;

  const { data, error } = await supabase
    .from("todos")
    .select("*, priority:priorities(id, name, order)")
    .or(
      `completed.eq.false,and(completed.eq.true,completed_at.gte.${todayStart},completed_at.lt.${todayEnd})`
    )
    .eq("deleted", false)
    .order("priority(order)", { ascending: true })
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching all todos with priorities:", error);
    return [];
  }
  return data;
}

// New function to calculate due today and overdue todos
export async function calculateTodoCounts() {
  const today = getTodayDate();

  const { data, error } = await supabase
    .from("todos")
    .select("due_date")
    .eq("completed", false)
    .eq("deleted", false)
    .lte("due_date", today);

  if (error) {
    console.error("Error fetching todos for count calculation:", error);
    return { dueToday: 0, overdue: 0 };
  }

  const dueToday = data.filter((todo) => todo.due_date === today).length;
  const overdue = data.filter((todo) => todo.due_date < today).length;

  return { dueToday, overdue };
}

// Assigns start times and durations to selected todos
export async function assignStartTimesAndDurations(todosInput) {
  const todos = Array.isArray(todosInput) ? todosInput : [todosInput];
  const today = getTodayDate();
  let lastEndTime = null;
  const updatedTodos = [];

  for (const todo of todos) {
    if (
      todo.selected_for_today &&
      (!todo.start_at || todo.start_at.split("T")[0] !== today)
    ) {
      let [year, month, day] = today.split("-").map(Number);
      let startDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0)); // Create a date in UTC at midnight

      startDate.setHours(
        lastEndTime ? parseInt(lastEndTime.split(":")[0]) : 9,
        lastEndTime ? parseInt(lastEndTime.split(":")[1]) : 0,
        0,
        0
      );

      const duration = todo.duration || 30;
      const endDate = new Date(startDate.getTime() + duration * 60000);
      lastEndTime = endDate.toTimeString().substring(0, 5);

      todo.start_at = startDate.toISOString();
      todo.end_time = lastEndTime;

      updatedTodos.push(todo);

      // Update the todo in the database
      await updateTodoStartAt(todo.id, todo.start_at);
      if (!todo.duration) {
        await updateTodoDuration(todo.id, duration);
      }
    }
  }

  const result = todos.map((todo) => {
    const updatedTodo = updatedTodos.find((t) => t.id === todo.id);

    return updatedTodo ? { ...updatedTodo, selected_for_today: true } : todo;
  });

  return Array.isArray(todosInput) ? result : result[0];
}

// Updates the selected_for_today status of a todo
export async function updateTodoSelectedForToday(id, selected) {
  const { data, error } = await supabase
    .from("todos")
    .update({ selected_for_today: selected })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating todo selected for today:", error);
    return false;
  }

  return data ? data[0] : null;
}

// Updates the due date of a todo
export async function updateTodoDueDate(id, due_date) {
  const { error } = await supabase
    .from("todos")
    .update({ due_date: due_date })
    .eq("id", id);

  if (error) console.error("Error updating todo due date:", error);
  return !error;
}

// Milestone-related functions
// ===========================

// Fetches milestones for a specific priority
export async function fetchMilestones(priorityId) {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("priority_id", priorityId)
    .is("deleted", false);
  if (error) console.log("Error fetching milestones:", error);
  return data || [];
}

// Adds a new milestone
export async function addMilestone(milestone) {
  const { data, error } = await supabase
    .from("milestones")
    .insert([{ ...milestone, deleted: false }])
    .select();
  if (error) console.log("Error adding milestone:", error);
  return data ? data[0] : null;
}

// Updates an existing milestone
export async function updateMilestone(milestone) {
  const { error } = await supabase
    .from("milestones")
    .update({
      title: milestone.title,
      date: milestone.date,
      status: milestone.status,
      deleted: milestone.deleted || false,
    })
    .eq("id", milestone.id);
  if (error) console.log("Error updating milestone:", error);
  return !error;
}

// Marks a milestone as deleted
export async function deleteMilestone(id) {
  return toggleDeleted("milestones", id, true);
}

// Dependency-related functions
// ============================

// Fetches dependencies for a specific priority
export async function fetchDependencies(priorityId, includeCompleted = false) {
  let query = supabase
    .from("dependencies")
    .select("*")
    .eq("priority_id", priorityId)
    .is("deleted", false);

  if (!includeCompleted) {
    query = query.is("completed", false);
  }

  const { data, error } = await query;
  if (error) console.log("Error fetching dependencies:", error);
  return data || [];
}

// Adds a new dependency
export async function addDependency(dependency) {
  const { data, error } = await supabase
    .from("dependencies")
    .insert([{ ...dependency, completed: false, deleted: false }])
    .select();
  if (error) console.log("Error adding dependency:", error);
  return data ? data[0] : null;
}

// Updates an existing dependency
export async function updateDependency(dependency) {
  const { data, error } = await supabase
    .from("dependencies")
    .update({
      ...dependency,
      completed: dependency.completed || false,
      deleted: dependency.deleted || false,
    })
    .eq("id", dependency.id)
    .select();
  if (error) console.log("Error updating dependency:", error);
  return data ? data[0] : null;
}

// Marks a dependency as deleted
export async function deleteDependency(id) {
  return toggleDeleted("dependencies", id, true);
}

// Utility functions
// =================

// Toggles the completion status of a todo or dependency
export async function toggleComplete(type, id, completed) {
  const updateData = completed
    ? { completed, completed_at: new Date().toISOString() }
    : { completed, completed_at: null };

  const { error } = await supabase.from(type).update(updateData).eq("id", id);

  if (error) console.log(`Error toggling ${type} completion:`, error);
  return !error;
}

// Toggles the deleted status of a todo, dependency, or milestone
export async function toggleDeleted(type, id, deleted) {
  const { error } = await supabase.from(type).update({ deleted }).eq("id", id);
  if (error) console.log(`Error toggling ${type} deletion:`, error);
  return !error;
}

// Ensures the existence of a miscellaneous priority
export async function ensureMiscellaneousPriority() {
  const { data, error } = await supabase
    .from("priorities")
    .select("*")
    .eq("name", "Miscellaneous")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking for Miscellaneous priority:", error);
    return null;
  }

  if (data) {
    return data.id;
  }

  const { data: newPriority, error: insertError } = await supabase
    .from("priorities")
    .insert({ name: "Miscellaneous", completed: false, deleted: false })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating Miscellaneous priority:", insertError);
    return null;
  }

  return newPriority.id;
}

// Returns today's date in 'YYYY-MM-DD' format
export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// Clears all todos selected for today
export async function clearAllSelectedForToday() {
  const { error } = await supabase
    .from("todos")
    .update({ selected_for_today: false, start_at: null })
    .eq("selected_for_today", true);

  if (error) {
    console.error("Error clearing todos selected for today:", error);
    return false;
  }

  return true;
}

export const fetchNotes = async (priorityId) => {
  const { data, error } = await supabase
    .from("priority_notes")
    .select("*")
    .eq("priority_id", priorityId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const addNote = async (priorityId, content) => {
  const { data, error } = await supabase
    .from("priority_notes")
    .insert({ priority_id: priorityId, content })
    .single();

  if (error) throw error;
  return data;
};

export const updateNote = async (id, content) => {
  const { data, error } = await supabase
    .from("priority_notes")
    .update({ content, updated_at: new Date() })
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const deleteNote = async (id) => {
  const { error } = await supabase.from("priority_notes").delete().eq("id", id);

  if (error) throw error;
};
