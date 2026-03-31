import { useContext } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { NotesContext } from "../context/NotesContext";
import NoteCard from "./NoteCard";

const EXPIRY = 24 * 60 * 60 * 1000;
const WARN   =  2 * 60 * 60 * 1000;

export default function NotesGrid() {
  const { notes, setNotes, searchQuery, activeCategory, activeColor, darkMode } =
    useContext(NotesContext);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Only show active (non-expired) notes; pinned first
  const active = notes.filter(n => Date.now() - n.createdAt < EXPIRY);
  const sorted = [
    ...active.filter((n) => n.pinned),
    ...active.filter((n) => !n.pinned),
  ];

  // Apply search + category + color filters
  const filtered = sorted.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !activeCategory || activeCategory === "All" || note.category === activeCategory;
    const matchesColor =
      !activeColor || note.color === activeColor;
    return matchesSearch && matchesCategory && matchesColor;
  });

  // Split into expiring soon (<2h) and normal
  const expiringSoon = filtered.filter(n => (EXPIRY - (Date.now() - n.createdAt)) <= WARN);
  const normal       = filtered.filter(n => (EXPIRY - (Date.now() - n.createdAt)) >  WARN);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setNotes((prev) => {
      const oldIndex = prev.findIndex((n) => n.id === active.id);
      const newIndex = prev.findIndex((n) => n.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  if (filtered.length === 0) {
    const isFiltered = searchQuery || activeCategory !== "All" || activeColor;
    return (
      <div className="flex flex-col items-center justify-center mt-28 gap-4 select-none px-4 text-center">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl ${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        }`}>
          {isFiltered ? "🔍" : "📝"}
        </div>
        <div>
          <p className={`text-base font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {isFiltered ? "No matching notes" : "No notes yet"}
          </p>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {searchQuery
              ? `Nothing matches "${searchQuery}"`
              : isFiltered
              ? "Try a different filter"
              : "Tap + to create your first note"}
          </p>
        </div>
      </div>
    );
  }

  const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-start";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={filtered.map((n) => n.id)} strategy={rectSortingStrategy}>
        <div className="px-5 pt-5 pb-24 flex flex-col gap-8">
          {/* Expiring Soon section */}
          {expiringSoon.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Expiring Soon
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-400 font-semibold">
                  {expiringSoon.length}
                </span>
              </div>
              <div className={gridClass}>
                {expiringSoon.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Normal notes */}
          {normal.length > 0 && (
            <div>
              {expiringSoon.length > 0 && (
                <p className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  All Notes
                </p>
              )}
              <div className={gridClass}>
                {normal.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
