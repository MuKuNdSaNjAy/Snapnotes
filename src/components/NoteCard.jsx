import { useContext, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NotesContext } from "../context/NotesContext";
import { useGroups } from "../context/GroupsContext";
import ColorPicker from "./ColorPicker";

const CATEGORIES = ["Work", "Personal", "Ideas", "Todo", "Study", "Other"];

const COLORS = [
  { value: "yellow", bg: "bg-yellow-300" },
  { value: "pink",   bg: "bg-pink-300"   },
  { value: "orange", bg: "bg-orange-300" },
  { value: "blue",   bg: "bg-blue-300"   },
  { value: "green",  bg: "bg-green-300"  },
  { value: "purple", bg: "bg-purple-300" },
];

const COLOR_MAP = {
  yellow: { card: "bg-yellow-50  border-yellow-200",  badge: "bg-yellow-100 text-yellow-700" },
  pink:   { card: "bg-pink-50    border-pink-200",    badge: "bg-pink-100   text-pink-700"   },
  orange: { card: "bg-orange-50  border-orange-200",  badge: "bg-orange-100 text-orange-700" },
  blue:   { card: "bg-blue-50    border-blue-200",    badge: "bg-blue-100   text-blue-700"   },
  green:  { card: "bg-green-50   border-green-200",   badge: "bg-green-100  text-green-700"  },
  purple: { card: "bg-purple-50  border-purple-200",  badge: "bg-purple-100 text-purple-700" },
};

const DARK_COLOR_MAP = {
  yellow: { card: "bg-yellow-900/25 border-yellow-800/60", badge: "bg-yellow-900/40 text-yellow-300" },
  pink:   { card: "bg-pink-900/25   border-pink-800/60",   badge: "bg-pink-900/40   text-pink-300"   },
  orange: { card: "bg-orange-900/25 border-orange-800/60", badge: "bg-orange-900/40 text-orange-300" },
  blue:   { card: "bg-blue-900/25   border-blue-800/60",   badge: "bg-blue-900/40   text-blue-300"   },
  green:  { card: "bg-green-900/25  border-green-800/60",  badge: "bg-green-900/40  text-green-300"  },
  purple: { card: "bg-purple-900/25 border-purple-800/60", badge: "bg-purple-900/40 text-purple-300" },
};

const FALLBACK      = { card: "bg-gray-50  border-gray-200", badge: "bg-gray-100  text-gray-600" };
const FALLBACK_DARK = { card: "bg-gray-800 border-gray-700", badge: "bg-gray-700  text-gray-300" };

const EXPIRY = 24 * 60 * 60 * 1000;

function getTimeLeft(createdAt) {
  const left = EXPIRY - (Date.now() - createdAt);
  if (left <= 0) return null;
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function NoteCard({ note }) {
  const { updateNote, deleteNote, darkMode } = useContext(NotesContext);
  const { activeGroupId } = useGroups();

  const [showColors, setShowColors]       = useState(false);
  const [showCategory, setShowCategory]   = useState(false);
  const [justDeleted, setJustDeleted]     = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every minute so countdown stays live
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Edit modal state
  const [editText, setEditText]         = useState(note.content);
  const [editColor, setEditColor]       = useState(note.color);
  const [editCategory, setEditCategory] = useState(note.category ?? "Other");

  const cardRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : justDeleted ? 0 : 1,
    scale: isDragging ? "1.03" : "1",
    zIndex: isDragging ? 50 : "auto",
  };

  useEffect(() => {
    if (!showColors && !showCategory) return;
    function onOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowColors(false);
        setShowCategory(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [showColors, showCategory]);

  function openEditModal() {
    setEditText(note.content);
    setEditColor(note.color);
    setEditCategory(note.category ?? "Other");
    setShowEditModal(true);
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed) {
      updateNote(note.id, {
        content: trimmed,
        color: editColor,
        category: editCategory,
        updatedAt: Date.now(),
      });
    }
    setShowEditModal(false);
  }

  function handleDelete() {
    setJustDeleted(true);
    setTimeout(() => deleteNote(note.id), 200);
  }

  const theme = darkMode
    ? (DARK_COLOR_MAP[note.color] ?? FALLBACK_DARK)
    : (COLOR_MAP[note.color]      ?? FALLBACK);

  const EXPIRY = 24 * 60 * 60 * 1000;
  const WARN   =  2 * 60 * 60 * 1000;
  const elapsed  = Date.now() - note.createdAt;
  const timeLeft = EXPIRY - elapsed;
  const isUrgent = timeLeft > 0 && timeLeft <= WARN;
  const progressPct = Math.max(0, Math.min(100, (timeLeft / EXPIRY) * 100));

  return (
    <>
    <div
      ref={(el) => { setNodeRef(el); cardRef.current = el; }}
      style={style}
      className={`note-card relative flex flex-col aspect-square rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 group ${theme.card} ${
        darkMode ? "text-gray-100" : "text-gray-800"
      } ${isUrgent ? "border-red-400 dark:border-red-500 animate-pulse-border" : ""}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute top-0 left-0 right-0 h-4 cursor-grab active:cursor-grabbing rounded-t-2xl opacity-0 group-hover:opacity-100"
      >
        <div className="flex justify-center pt-1">
          <div className={`flex gap-0.5 ${darkMode ? "opacity-30" : "opacity-25"}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-current" />
            ))}
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5 mt-0.5">
        {/* Category badge — clickable */}
        <div className="relative">
          <button
            onClick={() => { setShowCategory((v) => !v); setShowColors(false); }}
            className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all active:scale-95 ${theme.badge} hover:opacity-80`}
          >
            {note.category ?? "Other"}
          </button>

          {showCategory && (
            <div className={`popup-enter absolute top-7 left-0 z-20 rounded-xl shadow-xl border overflow-hidden min-w-[120px] ${
              darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-100"
            }`}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { updateNote(note.id, { category: cat }); setShowCategory(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                    note.category === cat
                      ? "bg-indigo-500 text-white"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions — show on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <ActionBtn
            onClick={() => updateNote(note.id, { pinned: !note.pinned })}
            title={note.pinned ? "Unpin" : "Pin"}
            active={note.pinned}
            darkMode={darkMode}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={note.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </ActionBtn>

          <ActionBtn
            onClick={openEditModal}
            title="Edit"
            darkMode={darkMode}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </ActionBtn>

          <ActionBtn
            onClick={() => { setShowColors((v) => !v); setShowCategory(false); }}
            title="Change color"
            darkMode={darkMode}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </ActionBtn>

          <ActionBtn
            onClick={handleDelete}
            title="Delete"
            danger
            darkMode={darkMode}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </ActionBtn>
        </div>
      </div>

      {/* Color picker */}
      {showColors && (
        <div className="absolute top-10 right-2 z-20 popup-enter">
          <ColorPicker
            current={note.color}
            onSelect={(color) => { updateNote(note.id, { color }); setShowColors(false); }}
          />
        </div>
      )}

      {/* Content */}
      <p
        className="break-words cursor-default select-text flex-1 w-full"
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
          lineHeight: "1.35",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {note.content}
      </p>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-1">
          {note.pinned && (
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide shrink-0">Pinned</span>
          )}
          {/* Author chip — shown in group mode */}
          {activeGroupId && note.authorEmail && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold truncate max-w-[80px] ${
              darkMode ? "bg-gray-700 text-gray-400" : "bg-black/8 text-gray-500"
            }`}>
              {note.authorEmail.split("@")[0]}
            </span>
          )}
          <span className={`text-[10px] font-medium ml-auto flex items-center gap-0.5 shrink-0 ${
            isUrgent ? "text-red-400" : darkMode ? "text-gray-600" : "text-gray-400"
          }`}>
            {isUrgent ? "⚠" : "⏱"} {getTimeLeft(note.createdAt) ?? "expired"}
          </span>
        </div>
        {/* Time-remaining progress bar */}
        <div className={`w-full h-1 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-black/8"}`}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUrgent ? "bg-red-400" : progressPct > 50 ? "bg-indigo-400" : "bg-amber-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>

    {/* ── Edit Modal ── */}
    {showEditModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}
        />
        {/* Modal */}
        <div
          className={`popup-enter relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 flex flex-col gap-4 ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-800"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base">Edit Note</h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}>Ctrl+Enter to save</span>
              <button
                onClick={() => setShowEditModal(false)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-400"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              autoFocus
              rows={4}
              value={editText}
              onChange={(e) => setEditText(e.target.value.slice(0, 200))}
              onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) saveEdit(); if (e.key === "Escape") setShowEditModal(false); }}
              className={`w-full rounded-xl p-3 text-sm outline-none border transition-all ${
                darkMode
                  ? "bg-gray-700 border-gray-600 placeholder-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900/40"
                  : "bg-gray-50 border-gray-200 placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              }`}
            />
            <span className={`absolute bottom-2 right-3 text-[11px] font-medium ${
              editText.length >= 200 ? "text-red-400" : darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
              {editText.trim() ? `${editText.trim().split(/\s+/).length}w · ` : ""}{editText.length}/200
            </span>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Color</span>
            <div className="flex gap-1.5">
              {COLORS.map(({ value, bg }) => (
                <button
                  key={value}
                  onClick={() => setEditColor(value)}
                  className={`w-5 h-5 rounded-full ${bg} transition-all active:scale-90 ${
                    editColor === value
                      ? "ring-2 ring-offset-1 ring-indigo-400 scale-110"
                      : "hover:scale-110 opacity-75 hover:opacity-100"
                  } ${darkMode ? "ring-offset-gray-800" : "ring-offset-white"}`}
                />
              ))}
            </div>
          </div>

          {/* Category picker */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Category</span>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEditCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    editCategory === cat
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
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowEditModal(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={!editText.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function ActionBtn({ onClick, title, children, active, danger, darkMode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
        danger
          ? "hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          : active
          ? "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
          : darkMode
          ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          : "text-gray-400 hover:bg-black/10 hover:text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
