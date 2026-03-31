import { createContext, useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useGroups } from "./GroupsContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const NotesContext = createContext(null);

const DEFAULT_COLOR = "yellow";

function rowToNote(row) {
  return {
    id:          row.id,
    content:     row.content,
    color:       row.color,
    category:    row.category,
    pinned:      row.pinned,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
    groupId:     row.group_id   ?? null,
    authorEmail: row.author_email ?? null,
  };
}

export function NotesProvider({ children }) {
  const { user } = useAuth();
  const { activeGroupId } = useGroups();

  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [darkMode, setDarkMode] = useLocalStorage("snapnotes_dark", false);

  const [searchQuery, setSearchQuery]       = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeColor, setActiveColor]       = useState(null);

  // ── Dark mode ──────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDarkMode = useCallback(() => {
    setDarkMode((v) => {
      document.documentElement.classList.toggle("dark", !v);
      return !v;
    });
  }, [setDarkMode]);

  // ── Load notes (re-runs when user or active group changes) ─
  useEffect(() => {
    setNotes([]);
    setLoading(true);

    if (!supabase) {
      try {
        const all = JSON.parse(localStorage.getItem("snapnotes_notes") || "[]");
        // Filter: personal = no groupId, group = matching groupId
        const filtered = activeGroupId
          ? all.filter(n => n.groupId === activeGroupId)
          : all.filter(n => !n.groupId);
        setNotes(filtered);
      } catch {}
      setLoading(false);
      return;
    }

    if (!user) { setLoading(false); return; }

    let query = supabase.from("notes").select("*");

    if (activeGroupId) {
      query = query.eq("group_id", activeGroupId);
    } else {
      query = query.eq("user_id", user.id).is("group_id", null);
    }

    query.order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data) setNotes(data.map(rowToNote));
      setLoading(false);
    });

    // Real-time subscription
    const channelName = activeGroupId ? `notes-group-${activeGroupId}` : `notes-${user.id}`;
    const filter = activeGroupId
      ? `group_id=eq.${activeGroupId}`
      : `user_id=eq.${user.id}`;

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "notes", filter }, (payload) => {
        if (payload.eventType === "INSERT") {
          setNotes((prev) => [rowToNote(payload.new), ...prev]);
        }
        if (payload.eventType === "UPDATE") {
          setNotes((prev) => prev.map(n => n.id === payload.new.id ? rowToNote(payload.new) : n));
        }
        if (payload.eventType === "DELETE") {
          setNotes((prev) => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, activeGroupId]);

  // localStorage fallback sync
  useEffect(() => {
    if (!supabase) {
      const all = JSON.parse(localStorage.getItem("snapnotes_notes") || "[]");
      // Merge: replace notes for current context, keep others
      const others = activeGroupId
        ? all.filter(n => n.groupId !== activeGroupId)
        : all.filter(n => n.groupId);
      localStorage.setItem("snapnotes_notes", JSON.stringify([...notes, ...others]));
    }
  }, [notes, activeGroupId]);

  // ── CRUD ───────────────────────────────────────────────────
  const addNote = useCallback(async (content, color = DEFAULT_COLOR, category = "Other") => {
    const now = Date.now();
    const newNote = {
      id:          uuidv4(),
      content,
      color,
      category,
      pinned:      false,
      createdAt:   now,
      updatedAt:   now,
      groupId:     activeGroupId ?? null,
      authorEmail: user?.email ?? null,
    };

    if (!supabase) {
      setNotes((prev) => [newNote, ...prev]);
      return;
    }

    setNotes((prev) => [newNote, ...prev]);

    const { error } = await supabase.from("notes").insert({
      id:           newNote.id,
      content:      newNote.content,
      color:        newNote.color,
      category:     newNote.category,
      pinned:       newNote.pinned,
      created_at:   newNote.createdAt,
      updated_at:   newNote.updatedAt,
      user_id:      user?.id,
      group_id:     newNote.groupId,
      author_email: newNote.authorEmail,
    });

    if (error) {
      console.error("addNote error:", error.message);
      setNotes((prev) => prev.filter((n) => n.id !== newNote.id));
    }
  }, [user, activeGroupId]);

  const updateNote = useCallback(async (id, changes) => {
    const updatedAt = Date.now();

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...changes, updatedAt } : n))
    );

    if (!supabase) return;

    const dbChanges = {};
    if (changes.content   !== undefined) dbChanges.content    = changes.content;
    if (changes.color     !== undefined) dbChanges.color      = changes.color;
    if (changes.category  !== undefined) dbChanges.category   = changes.category;
    if (changes.pinned    !== undefined) dbChanges.pinned     = changes.pinned;
    if (changes.createdAt !== undefined) dbChanges.created_at = changes.createdAt;
    dbChanges.updated_at = updatedAt;

    const { error } = await supabase.from("notes").update(dbChanges).eq("id", id);
    if (error) console.error("updateNote error:", error.message);
  }, []);

  const deleteNote = useCallback(async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));

    if (!supabase) return;

    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) console.error("deleteNote error:", error.message);
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        setNotes,
        loading,
        addNote,
        updateNote,
        deleteNote,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        activeColor,
        setActiveColor,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
