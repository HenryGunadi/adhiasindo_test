import type { Column, Task, User } from "../types/types";

export const teamInit: User[] = [
  { id: 1, name: "Henry", role: "lead", avatar: "beam" },
  { id: 2, name: "Adam", role: "senior", avatar: "marble" },
  { id: 3, name: "Giselle", role: "mid", avatar: "pixel" },
  { id: 4, name: "Anna", role: "junior", avatar: "ring" },
  { id: 5, name: "Thomas", role: "intern", avatar: "sunset" },
];

export const teamTasks: Task[] = [
  {
    id: 1,
    column_id: 1,
    title: "Setup project structure",
    desc: "Initialize React + Ionic + Tailwind setup",
    assignee: [teamInit[0], teamInit[1]],
    due_date: new Date("2026-05-10").toISOString(),
    label: "feature",
    priority: "high",
    checklist: [
      { id: 1, title: "Create project", completed: true },
      { id: 2, title: "Install dependencies", completed: true },
      { id: 3, title: "Setup routing", completed: false },
    ],
    attachments: [],
    completed: false,
  },
  {
    id: 2,
    column_id: 2,
    title: "Design navbar UI",
    desc: "Create responsive navbar with avatars",
    assignee: [teamInit[1], teamInit[2], teamInit[3]],
    due_date: new Date("2026-05-12").toISOString(),
    label: "feature",
    priority: "normal",
    checklist: [
      { id: 1, title: "Layout structure", completed: true },
      { id: 2, title: "Add icons", completed: false },
    ],
    attachments: [],
    completed: false,
  },
  {
    id: 3,
    column_id: 5,
    title: "Fix avatar overlap bug",
    desc: "Avatars not stacking correctly",
    assignee: [teamInit[2], teamInit[4]],
    due_date: new Date("2026-05-08").toISOString(),
    label: "bug",
    priority: "high",
    checklist: [
      { id: 1, title: "Reproduce issue", completed: true },
      { id: 2, title: "Fix spacing", completed: false },
    ],
    attachments: [],
    completed: false,
  },
  {
    id: 4,
    column_id: 3,
    title: "Implement drag and drop",
    desc: "Enable task movement between columns",
    assignee: [teamInit[0], teamInit[3]],
    due_date: new Date("2026-05-15").toISOString(),
    label: "feature",
    priority: "high",
    checklist: [
      { id: 1, title: "Install dnd library", completed: true },
      { id: 2, title: "Create draggable cards", completed: false },
      { id: 3, title: "Persist column state", completed: false },
    ],
    attachments: [],
    completed: false,
  },
  {
    id: 5,
    column_id: 4,
    title: "Setup authentication",
    desc: "Implement login and protected routes",
    assignee: [teamInit[2]],
    due_date: new Date("2026-05-20").toISOString(),
    label: "issue",
    priority: "normal",
    checklist: [
      { id: 1, title: "Create auth context", completed: true },
      { id: 2, title: "Protect dashboard route", completed: true },
    ],
    attachments: [],
    completed: true,
  },
];

export const columnsInit: Column[] = [
  {
    id: 1,
    title: "To Do",
    team_id: 1,
    tasks: teamTasks.filter((t) => t.column_id === 1),
  },
  {
    id: 2,
    title: "Doing",
    team_id: 1,
    tasks: teamTasks.filter((t) => t.column_id === 2),
  },
  {
    id: 3,
    title: "Review",
    team_id: 1,
    tasks: teamTasks.filter((t) => t.column_id === 3),
  },
  {
    id: 4,
    title: "Done",
    team_id: 1,
    tasks: teamTasks.filter((t) => t.column_id === 4),
  },
  {
    id: 5,
    title: "Rework",
    team_id: 1,
    tasks: teamTasks.filter((t) => t.column_id === 5),
  },
];
