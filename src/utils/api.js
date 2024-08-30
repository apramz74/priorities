import { supabase } from "../supabaseClient";

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
export async function addPriority(name, slot) {
  const { data, error } = await supabase
    .from("priorities")
    .insert([{ name, completed: false, deleted: false, order: slot }])
    .select();
  if (error) console.log("Error adding priority:", error);
  return data ? data[0] : null;
}

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

export async function deletePriority(id) {
  const { error } = await supabase
    .from("priorities")
    .update({ deleted: true, order: null })
    .eq("id", id);
  if (error) console.log("Error deleting priority:", error);
  return !error;
}

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

export async function toggleComplete(type, id, completed) {
  const updateData = completed
    ? { completed, completed_at: new Date().toISOString() }
    : { completed, completed_at: null };

  const { error } = await supabase.from(type).update(updateData).eq("id", id);

  if (error) console.log(`Error toggling ${type} completion:`, error);
  return !error;
}

export async function toggleDeleted(type, id, deleted) {
  const { error } = await supabase.from(type).update({ deleted }).eq("id", id);
  if (error) console.log(`Error toggling ${type} deletion:`, error);
  return !error;
}

export async function fetchMilestones(priorityId) {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("priority_id", priorityId)
    .is("deleted", false);
  if (error) console.log("Error fetching milestones:", error);
  return data || [];
}

export async function addMilestone(milestone) {
  const { data, error } = await supabase
    .from("milestones")
    .insert([{ ...milestone, deleted: false }])
    .select();
  if (error) console.log("Error adding milestone:", error);
  return data ? data[0] : null;
}

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

export async function addDependency(dependency) {
  const { data, error } = await supabase
    .from("dependencies")
    .insert([{ ...dependency, completed: false, deleted: false }])
    .select();
  if (error) console.log("Error adding dependency:", error);
  return data ? data[0] : null;
}

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

export async function deleteMilestone(id) {
  return toggleDeleted("milestones", id, true);
}

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

export async function deleteDependency(id) {
  return toggleDeleted("dependencies", id, true);
}

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

export async function deleteTodo(id) {
  return toggleDeleted("todos", id, true);
}

export async function updatePrioritiesOrder(priorities) {
  const { error } = await supabase.from("priorities").upsert(
    priorities.map(({ id, order }) => ({ id, order })),
    { onConflict: "id" }
  );

  if (error) console.log("Error updating priorities order:", error);
  return !error;
}

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

export async function fetchPrioritySummary() {
  const priorities = await fetchPriorities();
  const summaries = [];

  // Set today's date to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight

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

export async function fetchTodosForToday() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("due_date", today)
    .is("deleted", false)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching today's todos:", error);
    return [];
  }

  // Ensure unique start times before returning the data
  return await ensureUniqueStartTimes(data || []);
}

export async function updateTodoStartTime(id, start_time) {
  const { error } = await supabase
    .from("todos")
    .update({ start_time: start_time })
    .eq("id", id);

  if (error) console.error("Error updating todo start time:", error);
  return !error;
}

export async function updateTodoDuration(id, duration) {
  const { error } = await supabase
    .from("todos")
    .update({ duration: duration })
    .eq("id", id);

  if (error) console.error("Error updating todo duration:", error);
  return !error;
}

// Add this new function
export async function ensureUniqueStartTimes(todos) {
  const sortedTodos = todos.sort((a, b) => {
    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time);
    }
    return a.start_time ? -1 : 1;
  });

  let lastEndTime = null;
  const updatedTodos = [];

  for (const todo of sortedTodos) {
    let needsUpdate = false;

    if (!todo.start_time) {
      // Only set start time if it's not already set
      todo.start_time = lastEndTime || "09:00";
      needsUpdate = true;
    }

    const duration = todo.duration || 30; // Use existing duration or default to 30
    const [hours, minutes] = todo.start_time.split(":").map(Number);
    const endTime = new Date(2000, 0, 1, hours, minutes + duration);
    lastEndTime = `${String(endTime.getHours()).padStart(2, "0")}:${String(
      endTime.getMinutes()
    ).padStart(2, "0")}`;

    updatedTodos.push(todo);

    // Only update in the database if changes were made
    if (needsUpdate) {
      await updateTodoStartTime(todo.id, todo.start_time);
    }
    if (!todo.duration) {
      await updateTodoDuration(todo.id, duration);
    }
  }

  return updatedTodos;
}
