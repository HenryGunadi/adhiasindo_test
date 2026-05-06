import { IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  rectIntersection,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import Column from "../components/Column";
import TaskCard from "../components/TaskCard";
import ColumnModal from "../components/ColumnModal";
import NotificationToast from "../components/NotificationToast";
import {
  defaultFilter,
  isFilterActive,
  type FilterState,
} from "../components/FilterBar";
import type {
  BoardPageProps,
  Column as ColumnType,
  Task,
} from "../types/types";
import { add, checkmarkOutline, closeOutline } from "ionicons/icons";
import { useNotification } from "../hooks/NotifHook";

const BoardPage: React.FC<BoardPageProps> = ({ database, setDatabase }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<ColumnType | null>(null);
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const columnInputRef = useRef<HTMLInputElement>(null);

  const { notifications, notify, dismiss } = useNotification();

  useEffect(() => {
    if (addingColumn) columnInputRef.current?.focus();
  }, [addingColumn]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const filterActive = isFilterActive(filter);

  const matchesFilter = (task: Task): boolean => {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.desc.toLowerCase().includes(q)
      )
        return false;
    }
    if (filter.assignees.length > 0) {
      if (!task.assignee.some((u) => filter.assignees.includes(u.id)))
        return false;
    }
    if (filter.labels.length > 0) {
      if (!task.label || !filter.labels.includes(task.label)) return false;
    }
    if (filter.dueBefore) {
      if (!task.due_date) return false;
      if (task.due_date.slice(0, 10) > filter.dueBefore) return false;
    }
    return true;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith("col-")) {
      const colId = Number(id.replace("col-", ""));
      const col = database.columns.find((c) => c.id === colId);
      if (col) setActiveColumn(col);
      return;
    }
    const task = database.tasks.find((t) => String(t.id) === id);
    if (task) setActiveTask(task);
  };

  const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) return pointerHits;
    return rectIntersection(args);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("col-")) {
      const fromId = Number(activeId.replace("col-", ""));
      const toId = Number(
        overId.startsWith("col-drop-")
          ? overId.replace("col-drop-", "")
          : overId.replace("col-", ""),
      );
      if (fromId === toId) return;
      setDatabase((db) => {
        const oldIndex = db.columns.findIndex((c) => c.id === fromId);
        const newIndex = db.columns.findIndex((c) => c.id === toId);
        if (oldIndex === -1 || newIndex === -1) return db;
        return { ...db, columns: arrayMove(db.columns, oldIndex, newIndex) };
      });
      return;
    }

    const activeTaskId = Number(activeId);
    const draggedTask = database.tasks.find((t) => t.id === activeTaskId);
    if (!draggedTask) return;

    let targetColumnId: number | undefined;
    if (overId.startsWith("col-drop-")) {
      targetColumnId = Number(overId.replace("col-drop-", ""));
    } else {
      const overTask = database.tasks.find((t) => String(t.id) === overId);
      targetColumnId = overTask?.column_id;
    }
    if (!targetColumnId) return;

    setDatabase((db) => {
      let tasks = db.tasks.map((t) =>
        t.id === activeTaskId ? { ...t, column_id: targetColumnId! } : t,
      );
      const overTask = db.tasks.find((t) => String(t.id) === overId);
      if (
        overTask &&
        overTask.column_id === targetColumnId &&
        draggedTask.column_id === targetColumnId
      ) {
        const oldIndex = tasks.findIndex((t) => t.id === activeTaskId);
        const newIndex = tasks.findIndex((t) => t.id === overTask.id);
        tasks = arrayMove(tasks, oldIndex, newIndex);
      }
      return { ...db, tasks };
    });
  };

  const handleAddColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) {
      setAddingColumn(false);
      setNewColumnTitle("");
      return;
    }
    const newId = Math.max(0, ...database.columns.map((c) => c.id)) + 1;
    setDatabase((db) => ({
      ...db,
      columns: [
        ...db.columns,
        { id: newId, title, desc: "", color: "", team_id: 1, tasks: [] },
      ],
    }));
    setNewColumnTitle("");
    setAddingColumn(false);
    notify(`Column "${title}" created`);
  };

  const handleAddTask = (columnId: number, title: string) => {
    const newId = Math.max(0, ...database.tasks.map((t) => t.id)) + 1;
    const newTask: Task = {
      id: newId,
      column_id: columnId,
      title,
      desc: "",
      assignee: [],
      due_date: "",
      label: undefined,
      priority: undefined,
      checklist: [],
      attachments: [],
      completed: false,
    };
    setDatabase((db) => ({ ...db, tasks: [...db.tasks, newTask] }));
    notify(`Task "${title}" added`);
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className="flex flex-col h-full">
          <Navbar
            team={database.team}
            filter={filter}
            setFilter={setFilter}
            setDatabase={setDatabase}
            onNotify={notify}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <div className="flex gap-3 sm:gap-4 lg:gap-6 min-w-max px-3 sm:px-6 lg:px-8 pb-8 pt-1">
                <SortableContext
                  items={database.columns.map((c) => `col-${c.id}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {database.columns.map((column) => {
                    const allColumnTasks = database.tasks.filter(
                      (t) => t.column_id === column.id,
                    );
                    const visibleTasks = filterActive
                      ? allColumnTasks.filter(matchesFilter)
                      : allColumnTasks;

                    return (
                      <Column
                        key={column.id}
                        column={column}
                        taskIds={allColumnTasks.map((t) => t.id)}
                        onAddTask={handleAddTask}
                        onOpenColumn={(col) => setSelectedColumn(col)}
                      >
                        {visibleTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            team={database.team}
                            setDatabase={setDatabase}
                            onNotify={notify}
                          />
                        ))}
                      </Column>
                    );
                  })}
                </SortableContext>

                {/* add new column */}
                <div className="shrink-0 my-3 sm:my-6 lg:my-8 self-start">
                  {addingColumn ? (
                    <div className="w-[88vw] sm:w-72 bg-zinc-100 rounded-2xl p-3 flex flex-col gap-2">
                      <input
                        ref={columnInputRef}
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddColumn();
                          if (e.key === "Escape") {
                            setAddingColumn(false);
                            setNewColumnTitle("");
                          }
                        }}
                        placeholder="Column name..."
                        className="w-full text-sm font-medium bg-white border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 text-zinc-700 placeholder:text-zinc-400"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddColumn}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                          <IonIcon icon={checkmarkOutline} />
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingColumn(false);
                            setNewColumnTitle("");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 text-zinc-600 rounded-lg text-xs font-medium hover:bg-zinc-300 transition-colors"
                        >
                          <IonIcon icon={closeOutline} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingColumn(true)}
                      className="w-[88vw] sm:w-72 flex gap-2 py-5 sm:py-6 items-center bg-zinc-100 justify-center cursor-pointer hover:opacity-70 duration-200 rounded-2xl"
                    >
                      <IonIcon icon={add} className="text-lg" />
                      <span className="text-sm font-medium">Add new List</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="rotate-2 scale-105 opacity-90 shadow-xl w-[88vw] sm:w-72">
                  <TaskCard
                    task={activeTask}
                    team={database.team}
                    setDatabase={setDatabase}
                    onNotify={notify}
                  />
                </div>
              )}
              {activeColumn && (
                <div className="rotate-1 scale-105 opacity-80 shadow-xl">
                  <div className="w-[88vw] sm:w-72 bg-white rounded-2xl border border-zinc-200 shadow p-3">
                    <span className="font-semibold text-zinc-700 text-sm">
                      {activeColumn.title}
                    </span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        {selectedColumn && (
          <ColumnModal
            column={selectedColumn}
            tasks={database.tasks.filter(
              (t) => t.column_id === selectedColumn.id,
            )}
            onClose={() => setSelectedColumn(null)}
            setDatabase={setDatabase}
            onNotify={notify}
          />
        )}

        <NotificationToast notifications={notifications} onDismiss={dismiss} />
      </IonContent>
    </IonPage>
  );
};

export default BoardPage;
