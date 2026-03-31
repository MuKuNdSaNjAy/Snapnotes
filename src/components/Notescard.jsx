import { useContext, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NotesContext } from "../context/NotesContext";
import ColorPicker from "./ColorPicker";

const COLOR_MAP = {
  yellow: "bg-yellow-100 border-yellow-300",
  pink:   "bg-pink-100   border-pink-300",
  blue:   "bg-blue-100   border-blue-300",
  green:  "bg-green-100  border-green-300",
  purple: "bg-purple-100 border-purple-300",
};

const DARK_COLOR_MAP = {
  yellow: "bg-yellow-900/40 border-yellow-700",
  pink:   "bg-pink-900/40   border-pink-700",
  blue:   "bg-blue-900/40   border-blue-700",
  green:  "bg-green-900/40  border-green-700",
  purple: "bg-purple-900/40 border-purple-700",
};

export default function NoteCard({ note }) {
  const { updateNote, deleteNote, darkMode } = useContext(NotesContext);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]         = useState(note.content);
  const [showColors, setShowColors] = useState(false);
  const textareaRef = useRef(null);
  const cardRef     = useRef(null);

  // dnd-kit sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex:  isDragging ? 50 : "auto",
  };

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Close color picker on outside click
  useEffect(() => {
    if (!showColors) return;
    function handleClick(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowColors(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showColors]);

  function saveEdit() {
    const trimmed = draft.trim();
    if (trimmed) updateNote(note.id, { content: trimmed });
    else setDraft(note.content); // revert if empty
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setDraft(note.content);
      setIsEditing(false);
    }
    if (e.key === "Enter" && e.ctrlKey) saveEdit();
  }

  const colorLight = COLOR_MAP[note.color]      ?? "bg-gray-50 border-gray-200";
  const colorDark  = DARK_COLOR_MAP[note.color] ?? "bg-gray-800 border-gray-600";
  const cardColor  = darkMode ? colorDark : colorLight;

  return (
    <div
      ref={(el) => { setNodeRef(el); cardRef.current = el; }}
      style={style}
      className={`relative flex flex-col rounded-2xl border-2 p-3 shadow-sm transition-shadow duration-200 hover:shadow-md group ${cardColor} ${
        darkMode ? "text-gray-100" : "text-gray-800"
      }`}
    >
      {/* Drag handle — top strip */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 left-0 right-0 h-5 cursor-grab active:cursor-grabbing rounded-t-2xl"
        title="Drag to reorder"
      />

      {/* Top row: category badge + pin + color + delete */}
      <div className="flex items-center justify-between mb-2 mt-1">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            darkMode ? "bg-black/20 text-gray-300" : "bg-black/10 text-gray-500"
          }`}
        >
          {note.category ?? "General"}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {/* Pin */}
          <button
            onClick={() => updateNote(note.id, { pinned: !note.pinned })}
            title={note.pinned ? "Unpin" : "Pin"}
            className={`p-1 rounded-full hover:bg-black/10 transition-colors text-sm leading-none ${
              note.pinned ? "text-indigo-500" : darkMode ? "text-gray-400" : "text-gray-400"
            }`}
          >
            📌
          </button>

          {/* Color */}
          <button
            onClick={() => setShowColors((v) => !v)}
            title="Change color"
            className="p-1 rounded-full hover:bg-black/10 transition-colors text-sm leading-none"
          >
            🎨
          </button>

          {/* Delete */}
          <button
            onClick={() => deleteNote(note.id)}
            title="Delete note"
            className="p-1 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors text-sm leading-none"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Color picker */}
      {showColors && (
        <div className="absolute top-10 right-2 z-20">
          <ColorPicker
            current={note.color}
            onSelect={(color) => {
              updateNote(note.id, { color });
              setShowColors(false);
            }}
          />
        </div>
      )}

      {/* Note content */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          rows={4}
          className={`w-full resize-none rounded-lg p-1 text-sm outline-none bg-transparent border border-dashed ${
            darkMode ? "border-gray-500 text-gray-100" : "border-gray-400 text-gray-800"
          }`}
        />
      ) : (
        <p
          onDoubleClick={() => { setDraft(note.content); setIsEditing(true); }}
          className="text-sm leading-relaxed whitespace-pre-wrap break-words cursor-text min-h-[3rem] select-text"
          title="Double-click to edit"
        >
          {note.content}
        </p>
      )}

      {/* Footer: timestamp */}
      <p
        className={`mt-2 text-xs text-right ${
          darkMode ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {new Date(note.updatedAt ?? note.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day:   "numeric",
        })}
      </p>
    </div>
  );
}
