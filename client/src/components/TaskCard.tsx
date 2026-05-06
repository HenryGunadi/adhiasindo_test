import { IonIcon } from "@ionic/react";
import Avatar from "boring-avatars";
import {
  chatbubbleOutline,
  calendarOutline,
  checkboxOutline,
} from "ionicons/icons";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskCardProps } from "../types/types";
import { formatDate } from "../utils/utils";
import TaskCardModal from "./TaskCardModal";

const labelConfig = {
  feature: {
    label: "Feature",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  bug: { label: "Bug", color: "text-red-500 bg-red-50 border-red-200" },
  issue: {
    label: "Issue",
    color: "text-orange-500 bg-orange-50 border-orange-200",
  },
  undefined: {
    label: "Undefined",
    color: "text-zinc-500 bg-zinc-100 border-zinc-200",
  },
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  team,
  setDatabase,
  onNotify,
}) => {
  const config = labelConfig[task.label ?? "undefined"];
  const completedSubtasks = task.checklist.filter((s) => s.completed).length;
  const totalSubtasks = task.checklist.length;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const hasImage = task.attachments.length > 0;
  const [open, setOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(task.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && setOpen(true)}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-grab active:cursor-grabbing group w-full"
      >
        {/* cover image */}
        {hasImage && (
          <div className="w-full h-36 sm:h-40 overflow-hidden">
            <img
              src={task.attachments[0]}
              alt="attachment"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="p-3 sm:p-3.5 flex flex-col gap-2 sm:gap-2.5">
          {/* labels */}
          <div className="flex flex-col gap-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border w-fit ${config.color}`}
            >
              {config.label}
            </span>
            <div
              className={`h-0.5 w-6 rounded-full ${
                task.label === "feature"
                  ? "bg-blue-400"
                  : task.label === "bug"
                    ? "bg-red-400"
                    : task.label === "issue"
                      ? "bg-orange-400"
                      : "bg-zinc-300"
              }`}
            />
          </div>

          {/* title */}
          <p className="text-sm font-medium text-zinc-700 leading-snug">
            {task.title}
          </p>

          {/* checklists progress bar */}
          {totalSubtasks > 0 && (
            <div className="flex flex-col gap-1">
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress === 100 ? "bg-emerald-400" : "bg-blue-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* bottom metadata row */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2 sm:gap-2.5 text-zinc-500 text-xs">
              {task.due_date && (
                <span className="flex items-center gap-1">
                  <IonIcon icon={calendarOutline} />
                  {formatDate(task.due_date)}
                </span>
              )}
              {totalSubtasks > 0 && (
                <span
                  className={`flex items-center gap-1 ${
                    progress === 100 ? "text-emerald-500" : ""
                  }`}
                >
                  <IonIcon icon={checkboxOutline} />
                  {completedSubtasks}/{totalSubtasks}
                </span>
              )}
              {task.attachments.length > 0 && (
                <span className="flex items-center gap-1">
                  <IonIcon icon={chatbubbleOutline} />
                  {task.attachments.length}
                </span>
              )}
            </div>

            {task.assignee.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignee.slice(0, 3).map((user) => (
                  <div
                    key={user.id}
                    className="border-2 border-white rounded-full"
                  >
                    <Avatar
                      size={20}
                      name={user.name}
                      variant={user.avatar ?? "beam"}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {open && (
        <TaskCardModal
          task={task}
          team={team}
          onClose={() => setOpen(false)}
          setDatabase={setDatabase}
          onNotify={onNotify}
        />
      )}
    </>
  );
};

export default TaskCard;
