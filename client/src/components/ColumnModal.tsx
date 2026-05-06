import { IonIcon } from "@ionic/react";
import {
  closeOutline,
  trashOutline,
  checkmarkOutline,
  createOutline,
  listOutline,
  colorPaletteOutline,
} from "ionicons/icons";
import { useState } from "react";
import type { Column, Database, Task, Notification } from "../types/types";

interface ColumnModalProps {
  column: Column;
  tasks: Task[];
  onClose: () => void;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
  onNotify: (message: string, type?: Notification["type"]) => void;
}

const COLOR_OPTIONS = [
  { label: "Default", value: "", preview: "bg-slate-200" },
  {
    label: "Blue",
    value: "border-t-4 border-blue-400",
    preview: "bg-blue-400",
  },
  {
    label: "Emerald",
    value: "border-t-4 border-emerald-400",
    preview: "bg-emerald-400",
  },
  {
    label: "Violet",
    value: "border-t-4 border-violet-400",
    preview: "bg-violet-400",
  },
  {
    label: "Rose",
    value: "border-t-4 border-rose-400",
    preview: "bg-rose-400",
  },
  {
    label: "Amber",
    value: "border-t-4 border-amber-400",
    preview: "bg-amber-400",
  },
  {
    label: "Cyan",
    value: "border-t-4 border-cyan-400",
    preview: "bg-cyan-400",
  },
];

const labelColors: Record<string, string> = {
  feature: "bg-blue-50 text-blue-600 border-blue-200",
  bug: "bg-red-50 text-red-500 border-red-200",
  issue: "bg-orange-50 text-orange-500 border-orange-200",
};

const ColumnModal: React.FC<ColumnModalProps> = ({
  column,
  tasks,
  onClose,
  setDatabase,
  onNotify,
}) => {
  const [title, setTitle] = useState(column.title);
  const [desc, setDesc] = useState(column.desc ?? "");
  const [color, setColor] = useState(column.color ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "tasks">("details");

  const isDirty =
    title !== column.title ||
    desc !== (column.desc ?? "") ||
    color !== (column.color ?? "");

  const handleSave = () => {
    if (!title.trim()) return;
    setDatabase((db) => ({
      ...db,
      columns: db.columns.map((c) =>
        c.id === column.id
          ? { ...c, title: title.trim(), desc: desc.trim(), color }
          : c,
      ),
    }));
    onNotify(`Column "${title.trim()}" saved`);
    onClose();
  };

  const handleDelete = () => {
    setDatabase((db) => ({
      ...db,
      columns: db.columns.filter((c) => c.id !== column.id),
      tasks: db.tasks.filter((t) => t.column_id !== column.id),
    }));
    onNotify(`Column "${column.title}" deleted`, "info");
    onClose();
  };

  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            {color && (
              <div
                className={`w-3 h-3 rounded-full ${
                  COLOR_OPTIONS.find((c) => c.value === color)?.preview ?? ""
                }`}
              />
            )}
            <h2 className="text-base font-semibold text-zinc-800">
              {column.title}
            </h2>
            <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
              {tasks.length} tasks
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <IonIcon icon={closeOutline} className="text-xl" />
          </button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-zinc-100 px-5">
          {(["details", "tasks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-1 py-3 text-xs font-medium capitalize border-b-2 transition-colors mr-5 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <IonIcon
                icon={tab === "details" ? createOutline : listOutline}
                className="text-sm"
              />
              {tab}
            </button>
          ))}
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "details" && (
            <div className="flex flex-col gap-4">
              {/* title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Column name
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 bg-zinc-50"
                  placeholder="Column name..."
                />
              </div>

              {/* description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 bg-zinc-50 resize-none"
                  placeholder="What is this column for?"
                />
              </div>

              {/* color accent */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                  <IonIcon icon={colorPaletteOutline} />
                  Accent color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setColor(opt.value)}
                      title={opt.label}
                      className={`w-7 h-7 rounded-full transition-all ${opt.preview} ${
                        color === opt.value
                          ? "ring-2 ring-offset-2 ring-blue-400 scale-110"
                          : "hover:scale-105 opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* stats */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { label: "Total", value: tasks.length },
                  { label: "Done", value: completedTasks },
                  {
                    label: "Progress",
                    value:
                      tasks.length > 0
                        ? `${Math.round((completedTasks / tasks.length) * 100)}%`
                        : "—",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-zinc-50 rounded-xl px-3 py-3 text-center border border-zinc-100"
                  >
                    <p className="text-lg font-semibold text-zinc-700">
                      {s.value}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="flex flex-col gap-2">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-300">
                  <IonIcon icon={listOutline} className="text-4xl mb-2" />
                  <p className="text-sm">No tasks yet</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:border-zinc-200 transition-all"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        task.completed
                          ? "bg-emerald-400"
                          : task.label
                            ? {
                                feature: "bg-blue-400",
                                bug: "bg-red-400",
                                issue: "bg-orange-400",
                              }[task.label]
                            : "bg-zinc-300"
                      }`}
                    />
                    <span
                      className={`text-sm flex-1 ${task.completed ? "line-through text-zinc-400" : "text-zinc-700"}`}
                    >
                      {task.title}
                    </span>
                    {task.label && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${labelColors[task.label]}`}
                      >
                        {task.label}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-zinc-100 bg-white">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <IonIcon icon={trashOutline} />
              Delete column
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500 font-medium">
                Delete all {tasks.length} tasks too?
              </span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || !title.trim()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isDirty && title.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
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

export default ColumnModal;
