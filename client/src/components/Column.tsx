import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IonIcon } from "@ionic/react";
import {
  add,
  checkmarkOutline,
  closeOutline,
  ellipsisHorizontalOutline,
  reorderThreeOutline,
} from "ionicons/icons";
import { useState, useRef, useEffect } from "react";
import type { ColumnProps } from "../types/types";

const Column: React.FC<ColumnProps> = ({
  column,
  children,
  taskIds,
  onAddTask,
  onOpenColumn,
}) => {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `col-drop-${column.id}`,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col-${column.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingTask) inputRef.current?.focus();
  }, [addingTask]);

  const handleAdd = () => {
    const t = newTaskTitle.trim();
    if (t) onAddTask(column.id, t);
    setNewTaskTitle("");
    setAddingTask(false);
  };

  return (
    <div
      ref={setSortRef}
      style={style}
      className="shrink-0 w-[88vw] sm:w-72 lg:w-76 flex flex-col gap-2 sm:gap-3 my-3 sm:my-6 lg:my-8"
    >
      {/* column header */}
      <div
        className={`rounded-2xl bg-white border border-zinc-100 shadow-sm overflow-hidden ${column.color ?? ""}`}
      >
        <div className="px-3 py-2.5 flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="touch-none text-zinc-300 hover:text-zinc-500 transition-colors cursor-grab active:cursor-grabbing p-0.5 shrink-0"
          >
            <IonIcon icon={reorderThreeOutline} className="text-lg" />
          </button>

          <span className="font-semibold text-zinc-700 text-sm flex-1 truncate">
            {column.title}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
              {taskIds.length}
            </span>
            <button
              onClick={() => setAddingTask(true)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-100 hover:text-blue-600 text-zinc-400 transition-colors"
            >
              <IonIcon icon={add} className="text-base" />
            </button>
            <button
              onClick={() => onOpenColumn(column)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <IonIcon icon={ellipsisHorizontalOutline} className="text-base" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={setDropRef}
        className={`flex flex-col gap-2 rounded-2xl transition-colors duration-200 p-2 ${
          isOver ? "bg-blue-50 ring-2 ring-blue-200" : "bg-slate-100"
        }`}
        style={{ minHeight: "8rem" }}
      >
        <SortableContext
          items={taskIds.map(String)}
          strategy={verticalListSortingStrategy}
        >
          {children}

          {taskIds.length === 0 && !addingTask && (
            <div
              className={`flex-1 flex items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200 h-24 ${
                isOver
                  ? "border-blue-300 text-blue-400"
                  : "border-zinc-300 text-zinc-400"
              }`}
            >
              <span className="text-xs">Drop here</span>
            </div>
          )}
        </SortableContext>

        {addingTask && (
          <div className="flex flex-col gap-2 pt-1">
            <input
              ref={inputRef}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAddingTask(false);
                  setNewTaskTitle("");
                }
              }}
              placeholder="Task title..."
              className="w-full text-sm bg-white border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 text-zinc-700 placeholder:text-zinc-400 shadow-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
              >
                <IonIcon icon={checkmarkOutline} />
                Add
              </button>
              <button
                onClick={() => {
                  setAddingTask(false);
                  setNewTaskTitle("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-200 text-zinc-600 rounded-lg text-xs font-medium hover:bg-zinc-300 transition-colors"
              >
                <IonIcon icon={closeOutline} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* add task link */}
      {!addingTask && (
        <button
          onClick={() => setAddingTask(true)}
          className="flex items-center gap-1.5 px-2 py-2 text-zinc-400 hover:text-blue-500 text-xs font-medium transition-colors rounded-lg hover:bg-blue-50 w-fit"
        >
          <IonIcon icon={add} className="text-sm" />
          Add task
        </button>
      )}
    </div>
  );
};

export default Column;
