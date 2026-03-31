import { useContext, useEffect, useState } from "react";
import { NotesContext } from "../context/NotesContext";
import { useGroups } from "../context/GroupsContext";

function initials(email) {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "from-indigo-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-green-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-blue-400 to-cyan-500",
  "from-fuchsia-400 to-violet-500",
];

export default function GroupMembersModal({ group, onClose }) {
  const { darkMode } = useContext(NotesContext);
  const { fetchMembers, groupMembers, leaveGroup, sendInvite } = useGroups();

  const [copied,       setCopied]       = useState(false);
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [inviteStatus, setInviteStatus] = useState(null); // { ok: bool, msg: string }
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => { fetchMembers(group.id); }, [group.id]); // eslint-disable-line

  const members  = groupMembers[group.id] ?? [];
  const isOwner  = group.role === "owner";
  const isFull   = members.length >= 6;

  function copyCode() {
    navigator.clipboard.writeText(group.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSendInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    setSendingInvite(true);
    setInviteStatus(null);
    const result = await sendInvite(group.id, email);
    setSendingInvite(false);
    if (result.error) {
      setInviteStatus({ ok: false, msg: result.error });
    } else {
      setInviteStatus({ ok: true, msg: `Invite sent to ${email}` });
      setInviteEmail("");
    }
  }

  async function handleLeave() {
    await leaveGroup(group.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`popup-enter relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto ${
        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-800"
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
            darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-400"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
            darkMode ? "bg-indigo-900/30" : "bg-indigo-50"
          }`}>
            {group.emoji}
          </div>
          <div>
            <h2 className="font-bold text-base">{group.name}</h2>
            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {members.length} / 6 members · {isOwner ? "Owner" : "Member"}
            </p>
          </div>
        </div>

        {/* ── Invite by email (owner only) ── */}
        {isOwner && (
          <div className={`rounded-2xl p-4 border ${
            darkMode ? "border-indigo-700/60 bg-indigo-900/20" : "border-indigo-100 bg-indigo-50/60"
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
              darkMode ? "text-indigo-400" : "text-indigo-500"
            }`}>
              Invite a member
            </p>

            {isFull ? (
              <p className={`text-xs font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Group is full (6/6 members)
              </p>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="friend@email.com"
                    value={inviteEmail}
                    onChange={e => { setInviteEmail(e.target.value); setInviteStatus(null); }}
                    onKeyDown={e => e.key === "Enter" && handleSendInvite()}
                    className={`flex-1 min-w-0 rounded-xl px-3 py-2 text-sm border outline-none transition-all ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900/40"
                        : "bg-white border-gray-200 placeholder-gray-400 text-gray-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                  <button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail.includes("@") || sendingInvite}
                    className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 transition-all active:scale-95 shadow-sm"
                  >
                    {sendingInvite ? (
                      <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : "Send"}
                  </button>
                </div>

                {inviteStatus && (
                  <p className={`text-xs mt-2 font-medium ${inviteStatus.ok ? "text-green-500" : "text-red-400"}`}>
                    {inviteStatus.ok ? "✓ " : "✗ "}{inviteStatus.msg}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Invite code (fallback) ── */}
        {group.invite_code && (
          <div className={`rounded-2xl p-4 border-2 border-dashed ${
            darkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>Backup Code</p>
                <p className={`text-xl font-black tracking-[0.25em] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {group.invite_code}
                </p>
              </div>
              <button
                onClick={copyCode}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  copied
                    ? "bg-green-500 text-white"
                    : darkMode
                    ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                }`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Members list ── */}
        <div>
          <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Members
          </p>
          <div className="flex flex-col gap-2">
            {members.length === 0 && (
              <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Loading…</p>
            )}
            {members.map((m, i) => (
              <div key={m.user_id ?? i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                darkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {initials(m.email ?? m.user_id)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                    {m.email ?? m.user_id?.slice(0, 8) + "…"}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${
                  m.role === "owner"
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500"
                    : darkMode ? "bg-gray-600 text-gray-400" : "bg-gray-200 text-gray-500"
                }`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Leave / Delete ── */}
        <button
          onClick={handleLeave}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            darkMode
              ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
              : "bg-red-50 text-red-500 hover:bg-red-100"
          }`}
        >
          {isOwner ? "Delete Group" : "Leave Group"}
        </button>
      </div>
    </div>
  );
}
