import { useContext, useState } from "react";
import { NotesContext } from "../context/NotesContext";
import { useGroups } from "../context/GroupsContext";
import CreateGroupModal from "./CreateGroupModal";
import JoinGroupModal from "./JoinGroupModal";
import GroupMembersModal from "./GroupMembersModal";

// Centered popup shown when "+ Group" is clicked
function GroupActionPopup({ darkMode, onClose, onCreate, onJoin }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`popup-enter relative w-full max-w-xs rounded-3xl shadow-2xl border p-6 flex flex-col gap-3 ${
        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-800"
      }`}>
        {/* Close */}
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

        {/* Header */}
        <div className="flex items-center gap-3 pr-8 mb-1">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${
            darkMode ? "bg-indigo-900/30" : "bg-indigo-50"
          }`}>
            👥
          </div>
          <div>
            <h2 className="font-bold text-base">Groups</h2>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Create or join a group</p>
          </div>
        </div>

        {/* Create */}
        <button
          onClick={onCreate}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all active:scale-95 ${
            darkMode
              ? "border-indigo-700/50 bg-indigo-900/20 hover:bg-indigo-900/40 text-gray-100"
              : "border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-gray-800"
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            darkMode ? "bg-indigo-500/20" : "bg-indigo-100"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Create a Group</p>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Start a new group and invite members</p>
          </div>
        </button>

        {/* Join */}
        <button
          onClick={onJoin}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all active:scale-95 ${
            darkMode
              ? "border-green-700/50 bg-green-900/20 hover:bg-green-900/40 text-gray-100"
              : "border-green-100 bg-green-50 hover:bg-green-100 text-gray-800"
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            darkMode ? "bg-green-500/20" : "bg-green-100"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Join a Group</p>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Enter an invite code to join</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function GroupSwitcher() {
  const { darkMode } = useContext(NotesContext);
  const { myGroups, activeGroupId, setActiveGroupId, loadingGroups } = useGroups();

  const [showActionPopup, setShowActionPopup] = useState(false);
  const [showCreate,      setShowCreate]      = useState(false);
  const [showJoin,        setShowJoin]        = useState(false);
  const [showMembers,     setShowMembers]     = useState(null);

  if (loadingGroups) return null;

  function pill(label, id, emoji = null) {
    const isActive = activeGroupId === id;
    return (
      <button
        key={id ?? "personal"}
        onClick={() => setActiveGroupId(id)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
          isActive
            ? "bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
            : darkMode
            ? "bg-gray-700/60 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-sm"
        }`}
      >
        {emoji && <span className="text-base leading-none">{emoji}</span>}
        {label}
      </button>
    );
  }

  return (
    <>
      <div className={`px-5 py-2.5 border-b flex items-center gap-2 overflow-x-auto scrollbar-none ${
        darkMode ? "bg-gray-900/80 border-gray-700/50" : "bg-gray-50/80 border-gray-100"
      }`}>
        {/* Personal pill */}
        {pill("Personal", null)}

        {/* Group pills */}
        {myGroups.map(g => (
          <div key={g.id} className="flex items-center gap-1 shrink-0">
            {pill(g.name, g.id, g.emoji)}
            {activeGroupId === g.id && (
              <button
                onClick={() => setShowMembers(g)}
                title="Group info"
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                  darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {myGroups.length > 0 && (
          <div className={`w-px h-5 shrink-0 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
        )}

        {/* + Group button → opens centered popup */}
        <button
          onClick={() => setShowActionPopup(true)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
            darkMode
              ? "bg-gray-700/60 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-sm"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Group
        </button>

        <p className={`ml-auto text-[11px] shrink-0 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
          max 6 per group
        </p>
      </div>

      {showActionPopup && (
        <GroupActionPopup
          darkMode={darkMode}
          onClose={() => setShowActionPopup(false)}
          onCreate={() => { setShowActionPopup(false); setShowCreate(true); }}
          onJoin={() => { setShowActionPopup(false); setShowJoin(true); }}
        />
      )}
      {showCreate  && <CreateGroupModal  onClose={() => setShowCreate(false)}  onCreated={g => setActiveGroupId(g.id)} />}
      {showJoin    && <JoinGroupModal    onClose={() => setShowJoin(false)}    onJoined={g  => setActiveGroupId(g.id)} />}
      {showMembers && <GroupMembersModal group={showMembers} onClose={() => setShowMembers(null)} />}
    </>
  );
}
