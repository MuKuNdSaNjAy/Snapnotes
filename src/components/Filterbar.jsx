import { useContext } from "react";
import { NotesContext } from "../context/NotesContext";

const CATEGORIES = [
  { label: "All",      icon: "◈" },
  { label: "Work",     icon: "💼" },
  { label: "Personal", icon: "🙂" },
  { label: "Ideas",    icon: "💡" },
  { label: "Todo",     icon: "✅" },
  { label: "Study",    icon: "📚" },
  { label: "Other",    icon: "📎" },
];

const COLOR_FILTERS = [
  { label: "All",    value: null,     bg: "bg-gray-300 dark:bg-gray-500" },
  { label: "Yellow", value: "yellow", bg: "bg-yellow-300" },
  { label: "Pink",   value: "pink",   bg: "bg-pink-300" },
  { label: "Blue",   value: "blue",   bg: "bg-blue-300" },
  { label: "Green",  value: "green",  bg: "bg-green-300" },
  { label: "Purple", value: "purple", bg: "bg-purple-300" },
];

export default function FilterBar() {
  const { activeCategory, setActiveCategory, activeColor, setActiveColor, darkMode, notes } =
    useContext(NotesContext);

  // Count notes per category
  const counts = notes.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 border-b transition-colors duration-300 ${
        darkMode ? "bg-gray-900/90 border-gray-700/60" : "bg-white/90 border-gray-100"
      }`}
    >
      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(({ label, icon }) => {
          const isActive = activeCategory === label;
          const count = label === "All" ? notes.length : (counts[label] ?? 0);
          return (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 ${
                isActive
                  ? "bg-indigo-500 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
                  : darkMode
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className={`hidden sm:block h-5 w-px ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />

      {/* Color filter dots */}
      <div className="flex items-center gap-1.5">
        {COLOR_FILTERS.map(({ label, value, bg }) => {
          const isActive = activeColor === value;
          return (
            <button
              key={label}
              onClick={() => setActiveColor(value)}
              title={label}
              aria-label={`Filter by ${label}`}
              className={`w-5 h-5 rounded-full transition-all duration-150 active:scale-90 ${bg} ${
                isActive
                  ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                  : "hover:scale-110 opacity-70 hover:opacity-100"
              } ${darkMode ? "ring-offset-gray-900" : "ring-offset-white"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
