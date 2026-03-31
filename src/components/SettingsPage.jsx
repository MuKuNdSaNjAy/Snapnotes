import { useContext } from "react";
import { NotesContext } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 px-1">
        {title}
      </h2>
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-100 dark:divide-gray-700/60">
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white dark:bg-gray-800/60">
      <div className="flex items-center gap-3">
        <span className="text-xl w-7 text-center">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
        value ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-600"
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        value ? "translate-x-5" : "translate-x-1"
      }`} />
    </button>
  );
}

export default function SettingsPage({ onNavigate }) {
  const { darkMode, toggleDarkMode, notes, setNotes } = useContext(NotesContext);
  const { user, signOut } = useAuth();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";

  function handleClearNotes() {
    if (window.confirm("Delete all notes? This cannot be undone.")) {
      setNotes([]);
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-800"
    }`}>

      {/* Header */}
      <div className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-md ${
        darkMode ? "bg-gray-900/90 border-gray-700/60" : "bg-white/90 border-gray-100"
      }`}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
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
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Profile card */}
        <div className={`flex items-center gap-4 p-5 rounded-2xl mb-8 border ${
          darkMode ? "bg-gray-800/60 border-gray-700/60" : "bg-white border-gray-100"
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 select-none shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.email ?? "Local user"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Free plan · {notes.length} note{notes.length !== 1 ? "s" : ""}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 font-semibold shrink-0">
            Free
          </span>
        </div>

        {/* Appearance */}
        <Section title="Appearance">
          <Row
            icon="🌙"
            label="Dark mode"
            description="Easy on the eyes at night"
          >
            <Toggle value={darkMode} onChange={toggleDarkMode} />
          </Row>
        </Section>

        {/* Notes */}
        <Section title="Notes">
          <Row
            icon="📊"
            label="Total notes"
            description="Notes saved in your account"
          >
            <span className="text-sm font-bold text-indigo-500">{notes.length}</span>
          </Row>
          <Row
            icon="📌"
            label="Pinned notes"
            description="Notes pinned to the top"
          >
            <span className="text-sm font-bold text-indigo-500">
              {notes.filter(n => n.pinned).length}
            </span>
          </Row>
        </Section>

        {/* Data */}
        <Section title="Data">
          <Row
            icon="💾"
            label="Export notes"
            description="Download all notes as JSON"
          >
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "snapnotes-export.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors active:scale-95"
            >
              Export
            </button>
          </Row>
          <Row
            icon="🗑️"
            label="Clear all notes"
            description="Permanently delete every note"
          >
            <button
              onClick={handleClearNotes}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors active:scale-95"
            >
              Clear
            </button>
          </Row>
        </Section>

        {/* Account */}
        {user && (
          <Section title="Account">
            <Row
              icon="📧"
              label="Email"
              description={user.email}
            >
              <span className="text-xs text-gray-400">Verified</span>
            </Row>
            <Row
              icon="🚪"
              label="Sign out"
              description="Sign out of your account"
            >
              <button
                onClick={signOut}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors active:scale-95"
              >
                Sign out
              </button>
            </Row>
          </Section>
        )}

        {/* About */}
        <Section title="About">
          <Row icon="📌" label="SnapNotes" description="Version 1.0.0 · Beta">
            <span className="text-xs text-gray-400">Built with ❤️</span>
          </Row>
        </Section>

      </div>
    </div>
  );
}
