import { useContext, useCallback } from "react";
import { NotesContext } from "../context/NotesContext";

const EXPIRY = 24 * 60 * 60 * 1000;

const COLOR_MAP = {
  yellow: "bg-yellow-50  border-yellow-200 text-yellow-800",
  pink:   "bg-pink-50    border-pink-200   text-pink-800",
  orange: "bg-orange-50  border-orange-200 text-orange-800",
  blue:   "bg-blue-50    border-blue-200   text-blue-800",
  green:  "bg-green-50   border-green-200  text-green-800",
  purple: "bg-purple-50  border-purple-200 text-purple-800",
};
const DARK_COLOR_MAP = {
  yellow: "bg-yellow-900/25 border-yellow-800/50 text-yellow-200",
  pink:   "bg-pink-900/25   border-pink-800/50   text-pink-200",
  orange: "bg-orange-900/25 border-orange-800/50 text-orange-200",
  blue:   "bg-blue-900/25   border-blue-800/50   text-blue-200",
  green:  "bg-green-900/25  border-green-800/50  text-green-200",
  purple: "bg-purple-900/25 border-purple-800/50 text-purple-200",
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PastNotesPage({ onNavigate }) {
  const { notes, deleteNote, updateNote, darkMode } = useContext(NotesContext);

  const restoreNote = useCallback((id) => {
    updateNote(id, { createdAt: Date.now() });
  }, [updateNote]);

  const expired = notes.filter(n => Date.now() - n.createdAt >= EXPIRY);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-800"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-md ${
        darkMode ? "bg-gray-900/90 border-gray-700/60" : "bg-white/90 border-gray-100"
      }`}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => onNavigate("home")}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              🕐 Past Notes
            </h1>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Notes older than 24 hours
            </p>
          </div>
          {expired.length > 0 && (
            <span className="ml-auto text-xs px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 font-semibold">
              {expired.length} note{expired.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {expired.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}>
              🕐
            </div>
            <div>
              <p className={`font-semibold text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                No past notes
              </p>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Notes older than 24 hours will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {expired
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(note => {
                const colorClass = darkMode
                  ? (DARK_COLOR_MAP[note.color] ?? "bg-gray-800 border-gray-700 text-gray-200")
                  : (COLOR_MAP[note.color]      ?? "bg-white border-gray-200 text-gray-800");
                return (
                  <div
                    key={note.id}
                    className={`flex items-start justify-between gap-4 px-5 py-4 rounded-2xl border ${colorClass}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="leading-relaxed break-words"
                        style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem" }}
                      >
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold bg-black/10 dark:bg-white/10`}>
                          {note.category ?? "Other"}
                        </span>
                        <span className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {timeAgo(note.createdAt)} · {new Date(note.createdAt).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Restore */}
                      <button
                        onClick={() => restoreNote(note.id)}
                        title="Restore note"
                        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                          darkMode
                            ? "text-gray-400 hover:bg-indigo-900/30 hover:text-indigo-400"
                            : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-500"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteNote(note.id)}
                        title="Delete permanently"
                        className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                          darkMode
                            ? "text-gray-500 hover:bg-red-900/30 hover:text-red-400"
                            : "text-gray-400 hover:bg-red-50 hover:text-red-500"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
