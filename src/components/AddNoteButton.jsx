import { useContext, useState, useRef, useEffect } from "react";
import { NotesContext } from "../context/NotesContext";

const COLORS = [
  { value: "yellow", bg: "bg-yellow-300" },
  { value: "pink",   bg: "bg-pink-300"   },
  { value: "blue",   bg: "bg-blue-300"   },
  { value: "green",  bg: "bg-green-300"  },
  { value: "purple", bg: "bg-purple-300" },
];

const CATEGORIES = ["Work", "Personal", "Ideas", "Todo", "Other"];

export default function AddNoteButton() {
  const { addNote, darkMode } = useContext(NotesContext);
  const [isOpen, setIsOpen]       = useState(false);
  const [text, setText]           = useState("");
  const [color, setColor]         = useState("yellow");
  const [category, setCategory]   = useState("Other");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) textareaRef.current.focus();
  }, [isOpen]);

  function handleAdd() {
    const trimmed = text.trim();
    if (trimmed) {
      addNote(trimmed, color, category);
      setText("");
      setColor("yellow");
      setCategory("Other");
    }
    setIsOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && e.ctrlKey) handleAdd();
    if (e.key === "Escape") { setText(""); setIsOpen(false); }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={handleAdd} />
      )}

      {/* Popup */}
      {isOpen && (
        <div
          className={`popup-enter fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl border flex flex-col gap-4 p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-100 text-gray-800"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">New Note</p>
            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
              Ctrl+Enter to save
            </span>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 100))}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className={`w-full rounded-xl p-3 text-sm outline-none border transition-all ${
                darkMode
                  ? "bg-gray-700 border-gray-600 placeholder-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900/40"
                  : "bg-gray-50 border-gray-200 placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              }`}
            />
            <span className={`absolute bottom-2 right-3 text-[11px] font-medium ${
              text.length >= 100
                ? "text-red-400"
                : darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
              {text.length}/100
            </span>
          </div>

          {/* Color picker row */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Color</span>
            <div className="flex gap-1.5">
              {COLORS.map(({ value, bg }) => (
                <button
                  key={value}
                  onClick={() => setColor(value)}
                  className={`w-5 h-5 rounded-full ${bg} transition-all active:scale-90 ${
                    color === value ? "ring-2 ring-offset-1 ring-indigo-400 scale-110" : "hover:scale-110 opacity-75 hover:opacity-100"
                  } ${darkMode ? "ring-offset-gray-800" : "ring-offset-white"}`}
                />
              ))}
            </div>
          </div>

          {/* Category row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Category</span>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    category === cat
                      ? "bg-indigo-500 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { setText(""); setIsOpen(false); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!text.trim()}
              className="flex-1 py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 disabled:scale-100"
            >
              Add Note
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Add note"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/100 flex items-center justify-center text-white text-2xl font-light transition-all duration-200 active:scale-90 ${
          isOpen
            ? "bg-gray-500 hover:bg-gray-600 rotate-45"
            : "bg-indigo-500 hover:bg-indigo-600 hover:shadow-xl hover:-translate-y-0.5"
        }`}
      >
        +
      </button>
    </>
  );
}
