import { useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import DataTable from "../../components/common/DataTable";
import SearchBar from "../../components/common/SearchBar";
import { Button } from "@mui/material";
import Modal from "../../components/common/Modal";
import FormInput from "../../components/common/FormInput";



const columns = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "status", label: "Status" },
];

export default function AllTasks() {
  const { tasks, loading, error, editTask, removeTask, reload } = useTasks();
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const filtered = tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setApiError(null);
    try {
      await editTask(editingTask.id, editingTask);
      setEditingTask(null);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await removeTask(id);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p style={{ color: "red" }}>Could not load tasks: {error}</p>
        <Button onClick={reload}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Tasks</h2>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title or assigned to"
        />
      </div>

      <div className="task-summary">
        <span>Total: <strong>{tasks.length}</strong></span>
        <span>Pending: <strong>{tasks.filter((t) => t.status === "Pending").length}</strong></span>
        <span>In Progress: <strong>{tasks.filter((t) => t.status === "In Progress").length}</strong></span>
        <span>Done: <strong>{tasks.filter((t) => t.status === "Done").length}</strong></span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        renderActions={(row) => (
          <>
            <Button variant="secondary" onClick={() => setEditingTask({ ...row })}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => handleDelete(row.id)}>
              Delete
            </Button>
          </>
        )}
      />

      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
          <form onSubmit={handleEdit} className="form">
            {apiError && <p style={{ color: "red" }}>{apiError}</p>}
            <FormInput
              label="Title"
              value={editingTask.title}
              onChange={(v) => setEditingTask({ ...editingTask, title: v })}
              required
            />
            <FormInput
              label="Description"
              value={editingTask.description}
              onChange={(v) => setEditingTask({ ...editingTask, description: v })}
            />
            <FormInput
              label="Assigned To"
              value={editingTask.assignedTo}
              onChange={(v) => setEditingTask({ ...editingTask, assignedTo: v })}
              required
            />
            <FormInput
              label="Status"
              type="select"
              value={editingTask.status}
              onChange={(v) => setEditingTask({ ...editingTask, status: v })}
              options={["Pending", "In Progress", "Done"]}
              required
            />
            <Button type="submit">
            {saving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
        </Modal>
    )}
    </div>
);
}
