import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, MenuItem, TextField } from "@mui/material";
import { useTasks } from "../../hooks/useTasks";

const emptyTask = { title: "", description: "", assignedTo: "", status: "Pending" };

export default function CreateTask() {
  const { addTask } = useTasks();
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const update = (field) => (value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addTask(form);
      setSaved(true);
      setForm(emptyTask);
      setTimeout(() => navigate("/tasks"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h2>Create Task</h2>
      {saved && <p className="success-message">Task created! Redirecting...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <TextField
          label="Title"
          value={form.title}
          onChange={(e) => update("title")(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => update("description")(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Assigned To"
          value={form.assignedTo}
          onChange={(e) => update("assignedTo")(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Status"
          select
          value={form.status}
          onChange={(e) => update("status")(e.target.value)}
          required
          fullWidth
          margin="normal"
        >
          {["Pending", "In Progress", "Done"].map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Create Task"}
        </Button>
      </form>
    </div>
  );
}
