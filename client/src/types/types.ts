import type { ReactNode } from "react";
import type React from "react";
import type { FilterState } from "../components/FilterBar";

type Role = "intern" | "junior" | "mid" | "senior" | "lead";

export type User = {
  id: number;
  name: string;
  role: Role;
  avatar:
    | "beam"
    | "pixel"
    | "bauhaus"
    | "ring"
    | "sunset"
    | "marble"
    | "geometric"
    | "abstract"
    | undefined;
};

export type Label = "feature" | "bug" | "issue" | undefined;

export type Task = {
  id: number;
  column_id: number;
  title: string;
  desc: string;
  assignee: User[];
  due_date: string;
  label: Label;
  priority?: "high" | "normal" | "low";
  checklist: Subtask[];
  attachments: string[];
  completed: boolean;
};

export type Subtask = {
  id: number;
  title: string;
  completed: boolean;
};

export type Column = {
  id: number;
  title: string;
  desc?: string;
  color?: string;
  team_id: number;
  tasks: Task[];
};

export type Database = {
  team: User[];
  columns: Column[];
  tasks: Task[];
};

export type Notification = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

// interfaces
export interface NavbarProps {
  team: User[];
  title?: string;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
  onNotify: (message: string, type?: Notification["type"]) => void;
}

export interface BoardPageProps {
  database: Database;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
}

export interface ColumnProps {
  column: Column;
  taskIds: number[];
  children: ReactNode;
  onAddTask: (columnId: number, title: string) => void;
  onOpenColumn: (column: Column) => void;
  isDraggingColumn?: boolean;
}

export interface TaskCardProps {
  task: Task;
  team: User[];
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
  onNotify: (message: string, type?: Notification["type"]) => void;
}
