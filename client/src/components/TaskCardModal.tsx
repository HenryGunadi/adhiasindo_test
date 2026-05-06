import { IonIcon } from "@ionic/react";
import Avatar from "boring-avatars";
import {
  closeOutline,
  calendarOutline,
  checkboxOutline,
  addOutline,
  trashOutline,
  checkmarkOutline,
  flagOutline,
  personAddOutline,
  imageOutline,
  cloudUploadOutline,
} from "ionicons/icons";
import { useState, useRef, useCallback } from "react";
import type {
  Database,
  Task,
  User,
  Subtask,
  Label,
  Notification,
} from "../types/types";

interface TaskCardModalProps {
  task: Task;
  team: User[];
  onClose: () => void;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
  onNotify: (message: string, type?: Notification["type"]) => void;
}

const labelConfig = {
  feature: {
    label: "Feature",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
  },
  bug: {
    label: "Bug",
    color: "text-red-500 bg-red-50 border-red-200",
    dot: "bg-red-400",
  },
  issue: {
    label: "Issue",
    color: "text-orange-500 bg-orange-50 border-orange-200",
    dot: "bg-orange-400",
  },
  undefined: {
    label: "Undefined",
    color: "text-zinc-500 bg-zinc-100 border-zinc-200",
    dot: "bg-zinc-300",
  },
};

const priorityConfig = {
  high: { label: "High", color: "text-red-500 bg-red-50 border-red-200" },
  normal: {
    label: "Normal",
    color: "text-blue-500 bg-blue-50 border-blue-200",
  },
  low: { label: "Low", color: "text-zinc-500 bg-zinc-100 border-zinc-200" },
};

const TaskCardModal: React.FC<TaskCardModalProps> = ({
  task,
  team,
  onClose,
  setDatabase,
  onNotify,
}) => {
  const [draft, setDraft] = useState<Task>({ ...task });
  const [newSubtask, setNewSubtask] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(task);

  const patch = (partial: Partial<Task>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  const handleSave = () => {
    setDatabase((db) => ({
      ...db,
      tasks: db.tasks.map((t) => (t.id === draft.id ? draft : t)),
    }));
    onNotify(`"${draft.title}" saved`);
    onClose();
  };

  const handleDelete = () => {
    setDatabase((db) => ({
      ...db,
      tasks: db.tasks.filter((t) => t.id !== task.id),
    }));
    onNotify(`Task deleted`, "info");
    onClose();
  };

  const toggleAssignee = (user: User) => {
    const exists = draft.assignee.find((u) => u.id === user.id);
    const assignee = exists
      ? draft.assignee.filter((u) => u.id !== user.id)
      : [...draft.assignee, user];
    patch({ assignee });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask: Subtask = {
      id: Date.now(),
      title: newSubtask.trim(),
      completed: false,
    };
    patch({ checklist: [...draft.checklist, subtask] });
    setNewSubtask("");
  };

  const toggleSubtask = (id: number) => {
    patch({
      checklist: draft.checklist.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s,
      ),
    });
  };

  const deleteSubtask = (id: number) => {
    patch({ checklist: draft.checklist.filter((s) => s.id !== id) });
  };

  const addImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setDraft((prev) => ({
          ...prev,
          attachments: [...prev.attachments, dataUrl],
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    Array.from(e.dataTransfer.files).forEach(addImageFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(addImageFile);
    e.target.value = "";
  };

  const removeAttachment = (url: string) => {
    patch({ attachments: draft.attachments.filter((a) => a !== url) });
  };

  const completedCount = draft.checklist.filter((s) => s.completed).length;
  const progress =
    draft.checklist.length > 0
      ? (completedCount / draft.checklist.length) * 100
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        {/* cover image */}
        {draft.attachments.length > 0 && (
          <div className="relative w-full h-40 sm:h-48 overflow-hidden shrink-0">
            <img
              src={draft.attachments[0]}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
          </div>
        )}

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
            {/* header */}
            <div className="flex items-start justify-between gap-4">
              <textarea
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                rows={2}
                className="flex-1 text-lg sm:text-xl font-semibold text-zinc-800 outline-none bg-transparent resize-none leading-snug placeholder:text-zinc-300"
                placeholder="Task title..."
              />
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 mt-1"
              >
                <IonIcon icon={closeOutline} className="text-xl sm:text-2xl" />
              </button>
            </div>

            {/* label + priority */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["feature", "bug", "issue"] as Label[]).map((l) => (
                <button
                  key={l}
                  onClick={() =>
                    patch({ label: draft.label === l ? undefined : l })
                  }
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                    draft.label === l
                      ? labelConfig[l!].color +
                        " ring-2 ring-offset-1 ring-blue-300"
                      : "text-zinc-400 bg-zinc-50 border-zinc-200 hover:opacity-70"
                  }`}
                >
                  {labelConfig[l!].label}
                </button>
              ))}
              <div className="w-px h-4 bg-zinc-200 mx-1" />
              {(["high", "normal", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => patch({ priority: p })}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                    draft.priority === p
                      ? priorityConfig[p].color +
                        " ring-2 ring-offset-1 ring-blue-300"
                      : "text-zinc-400 bg-zinc-50 border-zinc-200 hover:opacity-70"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <IonIcon icon={flagOutline} />
                    {priorityConfig[p].label}
                  </span>
                </button>
              ))}
            </div>

            {/* due date */}
            <div className="flex items-center gap-2 flex-wrap">
              <IonIcon icon={calendarOutline} className="text-zinc-400" />
              <span className="text-xs text-zinc-500 font-medium">
                Due date
              </span>
              <input
                type="date"
                value={draft.due_date ? draft.due_date.slice(0, 10) : ""}
                onChange={(e) =>
                  patch({
                    due_date: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
                className="text-xs text-zinc-600 border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400"
              />
            </div>

            {/* description */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                Description
              </span>
              <textarea
                value={draft.desc}
                onChange={(e) => patch({ desc: e.target.value })}
                rows={3}
                placeholder="Add a description..."
                className={`text-sm outline-none border rounded-lg p-2 resize-none bg-zinc-50 focus:border-blue-300 transition-colors ${
                  draft.desc ? "text-zinc-700" : "text-zinc-400"
                } border-zinc-200`}
              />
            </div>

            {/* assignees */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <IonIcon icon={personAddOutline} /> Assignees
              </span>
              <div className="flex flex-wrap gap-2">
                {team.map((user) => {
                  const assigned = draft.assignee.some((u) => u.id === user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleAssignee(user)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        assigned
                          ? "border-blue-300 bg-blue-50 text-blue-700 ring-2 ring-offset-1 ring-blue-200"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <Avatar
                        size={18}
                        name={user.name}
                        variant={user.avatar ?? "beam"}
                      />
                      {user.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* checklist */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                  <IonIcon icon={checkboxOutline} /> Checklist
                </span>
                {draft.checklist.length > 0 && (
                  <span className="text-xs text-zinc-400">
                    {completedCount}/{draft.checklist.length}
                  </span>
                )}
              </div>

              {draft.checklist.length > 0 && (
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {draft.checklist.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 group/item"
                  >
                    <button
                      onClick={() => toggleSubtask(subtask.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        subtask.completed
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-zinc-300 hover:border-blue-400"
                      }`}
                    >
                      {subtask.completed && (
                        <IonIcon icon={checkmarkOutline} className="text-xs" />
                      )}
                    </button>
                    <span
                      className={`text-sm flex-1 ${subtask.completed ? "line-through text-zinc-400" : "text-zinc-700"}`}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => deleteSubtask(subtask.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-zinc-300 hover:text-red-400 transition-all"
                    >
                      <IonIcon icon={trashOutline} className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Add subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  className="flex-1 text-sm border border-zinc-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 bg-zinc-50"
                />
                <button
                  onClick={addSubtask}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  <IonIcon icon={addOutline} />
                </button>
              </div>
            </div>

            {/* attachments */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <IonIcon icon={imageOutline} /> Attachments
              </span>

              {draft.attachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {draft.attachments.map((url, i) => (
                    <div
                      key={i}
                      className="relative group/img rounded-lg overflow-hidden h-20"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeAttachment(url)}
                        className="absolute top-1 right-1 opacity-0 group-hover/img:opacity-100 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center transition-all"
                      >
                        <IonIcon icon={closeOutline} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-5 sm:py-6 px-4 ${
                  isDragOver
                    ? "border-blue-400 bg-blue-50 scale-[1.01]"
                    : "border-zinc-200 bg-zinc-50 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <IonIcon
                  icon={cloudUploadOutline}
                  className={`text-2xl transition-colors ${isDragOver ? "text-blue-500" : "text-zinc-400"}`}
                />
                <div className="text-center">
                  <p
                    className={`text-xs font-medium transition-colors ${isDragOver ? "text-blue-600" : "text-zinc-500"}`}
                  >
                    {isDragOver ? "Drop to upload" : "Drag & drop images here"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    or{" "}
                    <span className="text-blue-500 underline underline-offset-2">
                      browse files
                    </span>
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-zinc-100 bg-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <IonIcon icon={trashOutline} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500 font-medium hidden sm:inline">
                Sure?
              </span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium"
              >
                No
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => patch({ completed: !draft.completed })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                draft.completed
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <IonIcon icon={checkmarkOutline} />
              <span className="hidden sm:inline">
                {draft.completed ? "Completed" : "Mark done"}
              </span>
            </button>

            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isDirty
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-200"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <IonIcon icon={checkmarkOutline} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCardModal;
