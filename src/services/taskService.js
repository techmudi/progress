const BASE_URL = "http://192.168.2.24:8014/api";


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
