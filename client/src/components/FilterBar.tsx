import { IonIcon } from "@ionic/react";
import Avatar from "boring-avatars";
import { closeOutline, searchOutline, filterOutline } from "ionicons/icons";
import type { User, Label } from "../types/types";

export interface FilterState {
  search: string;
  assignees: number[];
  labels: Label[];
  dueBefore: string;
}

export const defaultFilter: FilterState = {
  search: "",
  assignees: [],
  labels: [],
  dueBefore: "",
};

export const isFilterActive = (f: FilterState) =>
  f.search !== "" ||
  f.assignees.length > 0 ||
  f.labels.length > 0 ||
  f.dueBefore !== "";

interface FilterBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  team: User[];
}

const LABELS: { value: Label; label: string; color: string }[] = [
  {
    value: "feature",
    label: "Feature",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    value: "bug",
    label: "Bug",
    color: "text-red-500 bg-red-50 border-red-200",
  },
  {
    value: "issue",
    label: "Issue",
    color: "text-orange-500 bg-orange-50 border-orange-200",
  },
];

const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter, team }) => {
  const active = isFilterActive(filter);

  const toggleAssignee = (id: number) =>
    setFilter((f) => ({
      ...f,
      assignees: f.assignees.includes(id)
        ? f.assignees.filter((a) => a !== id)
        : [...f.assignees, id],
    }));

  const toggleLabel = (l: Label) =>
    setFilter((f) => ({
      ...f,
      labels: f.labels.includes(l)
        ? f.labels.filter((x) => x !== l)
        : [...f.labels, l],
    }));

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-white">
      {/* searching */}
      <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 w-48 focus-within:border-blue-400 transition-colors">
        <IonIcon
          icon={searchOutline}
          className="text-zinc-400 text-sm shrink-0"
        />
        <input
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          placeholder="Search tasks..."
          className="text-xs bg-transparent outline-none text-zinc-700 placeholder:text-zinc-400 w-full"
        />
        {filter.search && (
          <button onClick={() => setFilter((f) => ({ ...f, search: "" }))}>
            <IonIcon icon={closeOutline} className="text-zinc-400 text-xs" />
          </button>
        )}
      </div>

      {/* assignees */}
      <div className="flex items-center gap-1">
        {team.map((user) => {
          const on = filter.assignees.includes(user.id);
          return (
            <button
              key={user.id}
              onClick={() => toggleAssignee(user.id)}
              title={user.name}
              className={`rounded-full border-2 transition-all ${
                on
                  ? "border-blue-400 scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Avatar
                size={26}
                name={user.name}
                variant={user.avatar ?? "beam"}
              />
            </button>
          );
        })}
      </div>

      {/* labels */}
      <div className="flex items-center gap-1">
        {LABELS.map(({ value, label, color }) => {
          const on = filter.labels.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleLabel(value)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                on
                  ? color + " ring-2 ring-offset-1 ring-blue-300"
                  : "text-zinc-400 bg-zinc-50 border-zinc-200 hover:opacity-80"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* duedate */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 font-medium">Due by</span>
        <input
          type="date"
          value={filter.dueBefore}
          onChange={(e) =>
            setFilter((f) => ({ ...f, dueBefore: e.target.value }))
          }
          className="text-xs border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400 bg-zinc-50 text-zinc-600"
        />
        {filter.dueBefore && (
          <button onClick={() => setFilter((f) => ({ ...f, dueBefore: "" }))}>
            <IonIcon icon={closeOutline} className="text-zinc-400 text-xs" />
          </button>
        )}
      </div>

      {/* clear */}
      {active && (
        <button
          onClick={() => setFilter(defaultFilter)}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors ml-auto"
        >
          <IonIcon icon={filterOutline} />
          Clear filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
