import { useState, useEffect, useCallback } from "react";
import { fetchTasks, createTask, updateTask, deleteTask } from "../services/taskService";
import { getTasks } from '/src/services/taskService.js';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (task) => {
    const newTask = await createTask(task);
    setTasks((prev) => [...prev, newTask]);
  };

  const editTask = async (id, updates) => {
    const updated = await updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const removeTask = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, error, addTask, editTask, removeTask, reload: loadTasks };
}