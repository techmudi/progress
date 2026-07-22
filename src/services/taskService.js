const BASE_URL = "http://192.168.2.24:8014/api";

export { getTasks as fetchTasks };
export async function getTasks(){
  const response = await fetch('${BASE_URL}/tasks ');
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
}
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete task");

  return response.json();
}
export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) throw new Error("Failed to create task");

  return response.json();
}