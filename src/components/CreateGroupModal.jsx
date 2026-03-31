import { useState, useContext } from "react";
import { NotesContext } from "../context/NotesContext";
import { useGroups } from "../context/GroupsContext";

const EMOJIS = ["👨‍👩‍👧","👨‍👩‍👧‍👦","👩‍👧","👨‍👧","🏠","🎓","💼","🎮","🌱","🏋️","🎵","✈️","📚","🍕","🐾","🌟"];

export default function CreateGroupModal({ onClose, onCreated }) {
  const { darkMode } = useContext(NotesContext);
  const { createGroup } = useGroups();

  const [name, setName]       = useState("");
  const [emoji, setEmoji]     = useState("👨‍👩‍👧");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(null); // created group with invite code

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    const group = await createGroup(name.trim(), emoji);
    setLoading(false);
    if (group) setDone(group);
  }

  const base = darkMode
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-100 text-gray-800";

  if (done) {
    return (
      <ModalShell darkMode={darkMode} onClose={onClose}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-indigo-50 dark:bg-indigo-900/30">
            {done.emoji}
          </div>
          <div>
            <h2 className="text-lg font-bold">{done.name}</h2>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Share this invite code with up to 5 others
            </p>
          </div>
          {/* Invite code display */}
          <div className={`w-full rounded-2xl p-4 border-2 border-dashed ${
            darkMode ? "border-indigo-700 bg-indigo-900/20" : "border-indigo-300 bg-indigo-50"
          }`}>
            <p className={`text-xs font-semibold mb-1 ${darkMode ? "text-indigo-400" : "text-indigo-500"}`}>
              INVITE CODE
            </p>
            <p className="text-3xl font-black tracking-[0.3em] text-indigo-500">
              {done.invite_code}
            </p>
          </div>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Members enter this code in "Join Group"
          </p>
          <button
            onClick={() => { onCreated?.(done); onClose(); }}
            className="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all active:scale-95"
          >
            Let's go!
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell darkMode={darkMode} onClose={onClose}>
      <h2 className="font-bold text-base mb-4">Create a Group</h2>

      {/* Emoji picker */}
      <p className={`text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Choose an icon</p>
      <div className="grid grid-cols-8 gap-1.5 mb-4">
        {EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90 ${
              emoji === e
                ? "bg-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700 scale-110"
                : darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Name input */}
      <p className={`text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Group name</p>
      <input
        autoFocus
        type="text"
        maxLength={30}
        placeholder="e.g. Family, Study Crew…"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleCreate()}
        className={`w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all mb-5 ${
          darkMode
            ? "bg-gray-700 border-gray-600 placeholder-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900/40"
            : "bg-gray-50 border-gray-200 placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        }`}
      />

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-40 transition-all active:scale-95"
        >
          {loading ? "Creating…" : "Create Group"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ darkMode, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`popup-enter relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 ${
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
        {children}
      </div>
    </div>
  );
}
