import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../../hooks/useTasks";
import FormInput from "../../components/common/FormInput";
import Button from "../../components/common/Button";

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
        <FormInput label="Title" value={form.title} onChange={update("title")} required />
        <FormInput label="Description" value={form.description} onChange={update("description")} />
        <FormInput label="Assigned To" value={form.assignedTo} onChange={update("assignedTo")} required />
        <FormInput
          label="Status"
          type="select"
          value={form.status}
          onChange={update("status")}
          options={["Pending", "In Progress", "Done"]}
          required
        />
        <Button type="submit">{saving ? "Saving..." : "Create Task"}</Button>
      </form>
    </div>
  );
}