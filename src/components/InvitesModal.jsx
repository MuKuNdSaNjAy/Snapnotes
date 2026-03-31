import { useContext } from "react";
import { NotesContext } from "../context/NotesContext";
import { useGroups } from "../context/GroupsContext";

export default function InvitesModal({ onClose }) {
  const { darkMode } = useContext(NotesContext);
  const { pendingInvites, respondToInvite } = useGroups();

  async function handle(id, accept) {
    await respondToInvite(id, accept);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`popup-enter relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 flex flex-col gap-4 ${
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
        <div className="flex items-center gap-3 pr-8">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${
            darkMode ? "bg-indigo-900/30" : "bg-indigo-50"
          }`}>
            🔔
          </div>
          <div>
            <h2 className="font-bold text-base">Group Invites</h2>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Invite list */}
        <div className="flex flex-col gap-3">
          {pendingInvites.length === 0 && (
            <div className={`text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-sm font-medium">No pending invites</p>
            </div>
          )}

          {pendingInvites.map(invite => (
            <div
              key={invite.id}
              className={`rounded-2xl p-4 border ${
                darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-100"
              }`}
            >
              {/* Group info */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  darkMode ? "bg-gray-600" : "bg-white shadow-sm"
                }`}>
                  {invite.group_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                    {invite.group_name}
                  </p>
                  <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Invited by {invite.invited_by_email ?? "someone"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handle(invite.id, false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                  }`}
                >
                  Decline
                </button>
                <button
                  onClick={() => handle(invite.id, true)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40 transition-all active:scale-95"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
