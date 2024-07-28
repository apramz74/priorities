import { supabase } from "../supabaseClient";

export async function fetchPriorities() {
  const { data, error } = await supabase
    .from("priorities")
    .select("*")
    .is("deleted", false) // Only fetch non-deleted priorities
    .order("order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching priorities:", error);
    return [];
  }

  return data || [];
}
export async function addPriority(name) {
  const { data, error } = await supabase
    .from("priorities")
    .insert([{ name, completed: false, deleted: false }])
    .select();
  if (error) console.log("Error adding priority:", error);
  return data ? data[0] : null;
}

export async function updatePriority(priority) {
  const { error } = await supabase
    .from("priorities")
    .update(priority)
    .eq("id", priority.id);
  if (error) console.log("Error updating priority:", error);
  return !error;
}

export async function deletePriority(id) {
  const { error } = await supabase
    .from("priorities")
    .update({ deleted: true })
    .eq("id", id);
  if (error) console.log("Error deleting priority:", error);
  return !error;
}

export async function togglePriorityCompletion(id, completed) {
  const { error } = await supabase
    .from("priorities")
    .update({ completed })
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
  const { data, error } = await supabase
    .from("todos")
    .insert([{ ...todo, completed: false, deleted: false }])
    .select();
  if (error) console.log("Error adding todo:", error);
  return data ? data[0] : null;
}

export async function toggleComplete(type, id, completed) {
  const { error } = await supabase
    .from(type)
    .update({ completed })
    .eq("id", id);
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

export async function updatePriorityOrder(id, newOrder) {
  const { error } = await supabase
    .from("priorities")
    .update({ order: newOrder })
    .eq("id", id);
  if (error) console.log("Error updating priority order:", error);
  return !error;
}
