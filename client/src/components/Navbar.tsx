import { IonIcon } from "@ionic/react";
import Avatar from "boring-avatars";
import {
  chevronDown,
  closeOutline,
  filter,
  globe,
  lockClosedOutline,
  personAdd,
  search,
  searchOutline,
  optionsOutline,
} from "ionicons/icons";
import { useRef, useEffect, useState } from "react";
import type { Database, NavbarProps, Label } from "../types/types";
import type { FilterState } from "./FilterBar";
import { isFilterActive, defaultFilter } from "./FilterBar";
import InviteModal from "./InviteModal";
import type { Notification } from "../types/types";

interface ExtendedNavbarProps extends NavbarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
  onNotify: (message: string, type?: Notification["type"]) => void;
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

const Navbar: React.FC<ExtendedNavbarProps> = ({
  team,
  title = "Adhivasindo",
  filter: filterState,
  setFilter,
  setDatabase,
  onNotify,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const active = isFilterActive(filterState);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

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

  const FilterPanel = () => (
    <div className="flex flex-col gap-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          Filters
        </span>
        {active && (
          <button
            onClick={() => setFilter(defaultFilter)}
            className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
          >
            <IonIcon icon={closeOutline} />
            Clear all
          </button>
        )}
      </div>

      {/* assignees */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          Assignee
        </span>
        <div className="flex flex-wrap gap-2">
          {team.map((user) => {
            const on = filterState.assignees.includes(user.id);
            return (
              <button
                key={user.id}
                onClick={() => toggleAssignee(user.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  on
                    ? "border-blue-300 bg-blue-50 text-blue-700 ring-2 ring-offset-1 ring-blue-200"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <Avatar
                  size={16}
                  name={user.name}
                  variant={user.avatar ?? "beam"}
                />
                {user.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          Label
        </span>
        <div className="flex flex-wrap gap-1.5">
          {LABELS.map(({ value, label, color }) => {
            const on = filterState.labels.includes(value);
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
      </div>

      {/* Due by */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          Due by
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterState.dueBefore}
            onChange={(e) =>
              setFilter((f) => ({ ...f, dueBefore: e.target.value }))
            }
            className="flex-1 text-xs border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 bg-zinc-50 text-zinc-600"
          />
          {filterState.dueBefore && (
            <button onClick={() => setFilter((f) => ({ ...f, dueBefore: "" }))}>
              <IonIcon
                icon={closeOutline}
                className="text-zinc-400 text-base hover:text-zinc-600"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full border-b border-zinc-200 bg-white text-zinc-800 text-sm">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <IonIcon icon={lockClosedOutline} className="text-xl shrink-0" />

            <div className="flex items-center cursor-pointer hover:opacity-70 gap-1.5 duration-200 min-w-0">
              <span className="text-base sm:text-xl font-medium truncate max-w-25 sm:max-w-none">
                {title}
              </span>
              <IonIcon icon={chevronDown} className="text-base shrink-0" />
            </div>

            {/* Avatars*/}
            <div className="flex -space-x-2 sm:-space-x-3 items-center shrink-0">
              {team.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="border-2 border-white rounded-full"
                >
                  <Avatar
                    size={28}
                    name={user.name}
                    variant={user.avatar ?? "beam"}
                  />
                </div>
              ))}
              {team.length > 3 && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 text-white text-xs font-semibold flex items-center justify-center rounded-full border-2 border-white shrink-0">
                  +{team.length - 3}
                </div>
              )}
            </div>

            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg bg-gray-200 hover:opacity-70 duration-200 transition font-medium shrink-0"
            >
              <IonIcon icon={personAdd} className="text-base" />
              <span className="hidden sm:inline text-sm">Invite</span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* mobile search */}
            <div className="flex items-center sm:hidden">
              {searchOpen ? (
                <div className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-zinc-200 bg-zinc-100 focus-within:border-blue-400 focus-within:bg-white transition-colors w-40">
                  <IonIcon
                    icon={searchOutline}
                    className="text-zinc-400 text-sm shrink-0"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search…"
                    value={filterState.search}
                    onChange={(e) =>
                      setFilter((f) => ({ ...f, search: e.target.value }))
                    }
                    className="bg-transparent outline-none text-xs text-zinc-800 placeholder:text-zinc-400 w-full"
                  />
                  <button
                    onClick={() => {
                      setFilter((f) => ({ ...f, search: "" }));
                      setSearchOpen(false);
                    }}
                  >
                    <IonIcon
                      icon={closeOutline}
                      className="text-zinc-400 text-xs"
                    />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors ${filterState.search ? "text-blue-500" : "text-zinc-500"}`}
                >
                  <IonIcon icon={searchOutline} className="text-xl" />
                  {filterState.search && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              )}
            </div>

            {/* mobile filter icon */}
            <div className="sm:hidden" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors ${active ? "text-blue-500" : "text-zinc-500"}`}
              >
                <IonIcon icon={optionsOutline} className="text-xl" />
                {active && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            </div>

            <div className="hidden sm:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-70 duration-200 transition font-medium ${active ? "text-blue-600" : ""}`}
              >
                <IonIcon icon={filter} className="text-xl" />
                <span>Filter</span>
                {active && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>

              {/* desktop dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 p-4">
                  <FilterPanel />
                </div>
              )}
            </div>

            <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-70 duration-200 transition font-medium whitespace-nowrap">
              <IonIcon icon={globe} className="text-xl" />
              <span>Export / Import</span>
            </button>

            {/* desktop search bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-lg border border-zinc-200 bg-zinc-100 w-40 lg:w-56 focus-within:border-blue-400 focus-within:bg-white transition-colors">
              <IonIcon icon={search} className="text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Tasks"
                value={filterState.search}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, search: e.target.value }))
                }
                className="bg-transparent outline-none text-sm text-zinc-800 placeholder:text-zinc-400 w-full"
              />
              {filterState.search && (
                <button
                  onClick={() => setFilter((f) => ({ ...f, search: "" }))}
                >
                  <IonIcon
                    icon={closeOutline}
                    className="text-zinc-400 text-xs hover:text-zinc-600"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* mobile filtering */}
      {dropdownOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 pb-8 flex flex-col gap-1 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-zinc-200 rounded-full" />
            </div>
            <FilterPanel />
            <button
              onClick={() => setDropdownOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* invite modal */}
      {inviteOpen && (
        <InviteModal
          team={team}
          onClose={() => setInviteOpen(false)}
          setDatabase={setDatabase}
          onNotify={onNotify}
        />
      )}
    </>
  );
};

export default Navbar;
