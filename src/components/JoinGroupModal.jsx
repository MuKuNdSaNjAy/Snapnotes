import { useState, useContext } from "react";
import { NotesContext } from "../context/NotesContext";
import { useGroups } from "../context/GroupsContext";

export default function JoinGroupModal({ onClose, onJoined }) {
  const { darkMode } = useContext(NotesContext);
  const { joinGroup } = useGroups();

  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleJoin() {
    if (code.trim().length < 6) return;
    setLoading(true);
    setError("");
    const result = await joinGroup(code);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onJoined?.(result.group);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`popup-enter relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 flex flex-col gap-4 ${
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

        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
            darkMode ? "bg-indigo-900/30" : "bg-indigo-50"
          }`}>
            🔑
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold">Join a Group</h2>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Ask the group owner for their 6-character invite code
          </p>
        </div>

        {/* Code input */}
        <input
          autoFocus
          type="text"
          maxLength={6}
          placeholder="e.g. X4KP2Z"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleJoin()}
          className={`w-full rounded-xl px-4 py-3 text-center text-xl font-bold tracking-[0.3em] border outline-none transition-all ${
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/40"
              : darkMode
              ? "bg-gray-700 border-gray-600 placeholder-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900/40"
              : "bg-gray-50 border-gray-200 placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          }`}
        />

        {error && (
          <p className="text-sm text-red-400 text-center -mt-2">{error}</p>
        )}

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
            onClick={handleJoin}
            disabled={code.trim().length < 6 || loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-40 transition-all active:scale-95"
          >
            {loading ? "Joining…" : "Join Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
