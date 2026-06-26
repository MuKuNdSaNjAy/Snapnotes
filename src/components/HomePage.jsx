import { useContext, useState } from "react";
import { NotesContext } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";

const QUOTES = [
  "Your ideas deserve to be remembered.",
  "Small notes, big breakthroughs.",
  "Clarity starts with writing it down.",
  "One note at a time.",
  "Capture it before it's gone.",
  "The faintest ink is stronger than the best memory.",
  "Write it down. Make it real.",
  "Every great idea starts as a small note.",
];

const COLOR_MAP = {
  yellow: "bg-yellow-100 border-yellow-200 text-yellow-800",
  pink:   "bg-pink-100   border-pink-200   text-pink-800",
  blue:   "bg-blue-100   border-blue-200   text-blue-800",
  green:  "bg-green-100  border-green-200  text-green-800",
  purple: "bg-purple-100 border-purple-200 text-purple-800",
};
const DARK_COLOR_MAP = {
  yellow: "bg-yellow-900/30 border-yellow-800/50 text-yellow-200",
  pink:   "bg-pink-900/30   border-pink-800/50   text-pink-200",
  blue:   "bg-blue-900/30   border-blue-800/50   text-blue-200",
  green:  "bg-green-900/30  border-green-800/50  text-green-200",
  purple: "bg-purple-900/30 border-purple-800/50 text-purple-200",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isToday(ts) {
  const d = new Date(ts);
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth()     === now.getMonth() &&
    d.getFullYear()  === now.getFullYear();
}

export default function HomePage({ onNavigate }) {
  const { notes, addNote, darkMode } = useContext(NotesContext);
  const { user } = useAuth();

  const [quickText, setQuickText] = useState("");

  const firstName = user?.email?.split("@")[0] ?? "there";
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  const pinned   = notes.filter(n => n.pinned);
  const todayNotes = notes.filter(n => isToday(n.createdAt));
  const recent   = [...notes]
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    .slice(0, 4);

  // Stats
  const categories = [...new Set(notes.map(n => n.category))];
  const mostUsed = categories
    .map(c => ({ c, count: notes.filter(n => n.category === c).length }))
    .sort((a, b) => b.count - a.count)[0];

  function handleQuickAdd(e) {
    e.preventDefault();
    const t = quickText.trim();
    if (!t) return;
    addNote(t);
    setQuickText("");
  }

  const base = darkMode ? "text-gray-100" : "text-gray-800";

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${
      darkMode ? "bg-gray-950" : "bg-gray-50"
    } ${base}`}>

      {/* ── Hero greeting ── */}
      <div className={`px-6 pt-10 pb-8 border-b ${
        darkMode ? "border-gray-800" : "border-gray-100"
      }`}>
        <div className="max-w-3xl mx-auto">
          <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {today}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            {getGreeting()},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 capitalize">
              {firstName}
            </span>{" "}
            👋
          </h1>
          <p className={`text-sm italic ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            "{quote}"
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-10">

        {/* ── Quick-add ── */}
        <form onSubmit={handleQuickAdd} className="flex gap-3">
          <input
            type="text"
            value={quickText}
            onChange={e => setQuickText(e.target.value)}
            maxLength={200}
            placeholder="Add a note for today..."
            className={`flex-1 px-4 py-3 rounded-2xl text-sm border outline-none transition-all ${
              darkMode
                ? "bg-gray-800 border-gray-700 placeholder-gray-500 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/40"
                : "bg-white border-gray-200 placeholder-gray-400 text-gray-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            }`}
          />
          <button
            type="submit"
            disabled={!quickText.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            Snap it
          </button>
        </form>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Notes",  value: notes.length,                      icon: "📝", color: "from-indigo-400 to-indigo-600"  },
            { label: "Pinned",       value: pinned.length,                     icon: "📌", color: "from-pink-400 to-pink-600"      },
            { label: "Added Today",  value: todayNotes.length,                 icon: "✨", color: "from-yellow-400 to-orange-500"  },
            { label: "Top Category", value: mostUsed?.c ?? "—",                icon: "🏷️", color: "from-green-400 to-green-600"    },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className={`rounded-2xl p-4 border ${
                darkMode ? "bg-gray-800/60 border-gray-700/60" : "bg-white border-gray-100"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg mb-3 shadow-sm`}>
                {icon}
              </div>
              <p className={`text-xl font-extrabold leading-none mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {value}
              </p>
              <p className={`text-xs font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Pinned notes ── */}
        {pinned.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base flex items-center gap-2">
                <span>📌</span> Pinned
              </h2>
              <button
                onClick={() => onNavigate("notes")}
                className={`text-xs font-medium transition-colors ${
                  darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-500 hover:text-indigo-600"
                }`}
              >
                See all →
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {pinned.slice(0, 3).map(note => (
                <MiniNoteCard key={note.id} note={note} darkMode={darkMode} />
              ))}
            </div>
          </section>
        )}

        {/* ── Today's notes ── */}
        {todayNotes.length > 0 && (
          <section>
            <h2 className="font-bold text-base flex items-center gap-2 mb-3">
              <span>✨</span> Added Today
            </h2>
            <div className="flex flex-col gap-2">
              {todayNotes.slice(0, 4).map(note => (
                <MiniNoteCard key={note.id} note={note} darkMode={darkMode} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recently edited ── */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base flex items-center gap-2">
                <span>🕐</span> Recently Edited
              </h2>
              <button
                onClick={() => onNavigate("notes")}
                className={`text-xs font-medium transition-colors ${
                  darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-500 hover:text-indigo-600"
                }`}
              >
                See all →
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {recent.map(note => (
                <MiniNoteCard key={note.id} note={note} darkMode={darkMode} showTime />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}>
              📝
            </div>
            <div>
              <p className={`font-semibold text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                No notes yet
              </p>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Use the box above or tap + to create your first note
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function MiniNoteCard({ note, darkMode, showTime = false }) {
  const colorClass = darkMode
    ? (DARK_COLOR_MAP[note.color] ?? "bg-gray-800 border-gray-700 text-gray-200")
    : (COLOR_MAP[note.color]      ?? "bg-white border-gray-200 text-gray-800");

  return (
    <div className={`flex items-start justify-between gap-3 px-4 py-3 rounded-2xl border transition-all hover:shadow-sm ${colorClass}`}>
      <p className="text-sm leading-relaxed line-clamp-2 flex-1">
        {note.content}
      </p>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold bg-black/10 dark:bg-white/10`}>
          {note.category ?? "Other"}
        </span>
        {showTime && (
          <span className="text-[11px] opacity-50">
            {timeAgo(note.updatedAt ?? note.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
