import { columnsInit, teamInit, teamTasks } from "../data/data";
import type { Database } from "../types/types";

const STORAGE_KEY = "database";
const VERSION_KEY = "database_version";
const VERSION = "v200";

export const persistDatabase = (db: Database): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    localStorage.setItem(VERSION_KEY, VERSION);
  } catch (e) {
    console.warn("Failed to persist database:", e);
  }
};

export const initializeDatabase = (): Database => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const databaseStr = localStorage.getItem(STORAGE_KEY);

  const fresh: Database = {
    team: teamInit,
    tasks: teamTasks,
    columns: columnsInit,
  };

  if (storedVersion !== VERSION || !databaseStr) {
    persistDatabase(fresh);
    return fresh;
  }

  try {
    const parsed = JSON.parse(databaseStr) as Database;
    return {
      team: parsed.team ?? teamInit,
      tasks: parsed.tasks ?? teamTasks,
      columns: parsed.columns ?? columnsInit,
    };
  } catch {
    persistDatabase(fresh);
    return fresh;
  }
};

export function getRandomItems<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getDate()} ${date.toLocaleString("en", { month: "short" })}`;
};
