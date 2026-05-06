import { IonIcon } from "@ionic/react";
import Avatar from "boring-avatars";
import {
  closeOutline,
  personAddOutline,
  trashOutline,
  checkmarkOutline,
} from "ionicons/icons";
import { useState } from "react";
import type { Database, User, Notification } from "../types/types";

interface InviteModalProps {
  onClose: () => void;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
  team: User[];
  onNotify: (message: string, type?: Notification["type"]) => void;
}

type Role = User["role"];
type AvatarVariant = NonNullable<User["avatar"]>;

const ROLES: { value: Role; label: string; color: string }[] = [
  {
    value: "lead",
    label: "Lead",
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
  {
    value: "senior",
    label: "Senior",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "mid",
    label: "Mid",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    value: "junior",
    label: "Junior",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    value: "intern",
    label: "Intern",
    color: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
];

const AVATARS: AvatarVariant[] = ["beam", "marble", "pixel", "ring", "sunset"];

const InviteModal: React.FC<InviteModalProps> = ({
  onClose,
  setDatabase,
  team,
  onNotify,
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("junior");
  const [avatar, setAvatar] = useState<AvatarVariant>("beam");
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);

  const nameValid = name.trim().length >= 2;
  const nameTaken = team.some(
    (u) => u.name.toLowerCase() === name.trim().toLowerCase(),
  );

  const handleInvite = () => {
    if (!nameValid || nameTaken) return;
    const newUser: User = {
      id: Math.max(0, ...team.map((u) => u.id)) + 1,
      name: name.trim(),
      role,
      avatar,
    };
    setDatabase((db) => ({ ...db, team: [...db.team, newUser] }));
    onNotify(`${newUser.name} joined the board!`);
    setName("");
    setRole("junior");
    setAvatar("beam");
  };

  const handleRemove = (userId: number) => {
    const user = team.find((u) => u.id === userId);
    setDatabase((db) => ({
      ...db,
      team: db.team.filter((u) => u.id !== userId),
      tasks: db.tasks.map((t) => ({
        ...t,
        assignee: t.assignee.filter((u) => u.id !== userId),
      })),
    }));
    if (user) onNotify(`${user.name} removed from board`, "info");
    setConfirmRemove(null);
  };

  const roleConfig = (r: Role) => ROLES.find((x) => x.value === r) ?? ROLES[3];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <IonIcon
                icon={personAddOutline}
                className="text-blue-500 text-base"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">
                Invite to board
              </h2>
              <p className="text-xs text-zinc-400">
                {team.length} member{team.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <IonIcon icon={closeOutline} className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* add member */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              New member
            </span>

            {/* input name */}
            <div className="flex flex-col gap-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="Full name..."
                className={`w-full text-sm border rounded-xl px-3 py-2.5 outline-none transition-colors bg-white text-zinc-700 placeholder:text-zinc-400 ${
                  nameTaken
                    ? "border-red-300 focus:border-red-400"
                    : "border-zinc-200 focus:border-blue-400"
                }`}
              />
              {nameTaken && (
                <p className="text-xs text-red-400 px-1">
                  Name already on board
                </p>
              )}
            </div>

            {/* pick roles */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Role</span>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                      role === r.value
                        ? r.color + " ring-2 ring-offset-1 ring-blue-300"
                        : "text-zinc-400 bg-white border-zinc-200 hover:opacity-80"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* avatars */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">
                Avatar style
              </span>
              <div className="flex items-center gap-3">
                {AVATARS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setAvatar(v)}
                    title={v}
                    className={`rounded-full transition-all ${
                      avatar === v
                        ? "ring-2 ring-offset-2 ring-blue-400 scale-110"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <Avatar size={32} name={name || v} variant={v} />
                  </button>
                ))}
              </div>
            </div>

            {/* previw */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar size={28} name={name || "?"} variant={avatar} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-700 truncate">
                    {name.trim() || (
                      <span className="text-zinc-400 italic">Preview</span>
                    )}
                  </p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${roleConfig(role).color}`}
                  >
                    {roleConfig(role).label}
                  </span>
                </div>
              </div>

              <button
                onClick={handleInvite}
                disabled={!nameValid || nameTaken}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                  nameValid && !nameTaken
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-200"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                }`}
              >
                <IonIcon icon={personAddOutline} />
                Invite
              </button>
            </div>
          </div>

          {/* members */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Current members
            </span>

            {team.map((user) => {
              const rc = roleConfig(user.role);
              const isConfirming = confirmRemove === user.id;

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all group"
                >
                  <Avatar
                    size={32}
                    name={user.name}
                    variant={user.avatar ?? "beam"}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 truncate">
                      {user.name}
                    </p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${rc.color}`}
                    >
                      {rc.label}
                    </span>
                  </div>

                  {/* remove */}
                  {!isConfirming ? (
                    <button
                      onClick={() => setConfirmRemove(user.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-50"
                    >
                      <IonIcon icon={trashOutline} className="text-sm" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-red-400 font-medium">
                        Remove?
                      </span>
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
          >
            <IonIcon icon={checkmarkOutline} />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
