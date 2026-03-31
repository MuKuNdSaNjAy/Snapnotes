import { useContext, useState, useRef, useEffect } from "react";
import { NotesContext } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";
import { useGroups } from "../context/GroupsContext";
import InvitesModal from "./InvitesModal";

const MENU_ITEMS = [
  {
    label: "Home",
    page: "home",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Notes",
    page: "notes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Past Notes",
    page: "past",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    page: "settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Navbar({ onNavigate, currentPage }) {
  const { searchQuery, setSearchQuery, darkMode, toggleDarkMode } =
    useContext(NotesContext);
  const { user, signOut } = useAuth();
  const { pendingInvites } = useGroups();

  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInvites,     setShowInvites]     = useState(false);
  const dropdownRef = useRef(null);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <>
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-5 py-2.5 border-b backdrop-blur-md transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900/90 border-gray-700/60 text-white"
          : "bg-white/90 border-gray-100 text-gray-800"
      }`}
    >
      {/* Logo + tagline */}
      <div className="flex items-center gap-3 select-none shrink-0">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900/50">
            <span className="text-lg">📌</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-gray-900" />
        </div>
        <div className="leading-none">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              SnapNotes
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide ${
              darkMode ? "bg-indigo-900/60 text-indigo-300" : "bg-indigo-100 text-indigo-500"
            }`}>
              Beta
            </span>
          </div>
          <p className={`text-[10px] font-medium mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Snap it. Pin it. Done.
          </p>
        </div>
      </div>

      {/* Centre spacer */}
      <div className="flex-1" />

      {/* Search — right side, expands on focus */}
      <div className="flex items-center gap-3 shrink-0 mr-3">
        <div className="relative group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-9 pr-8 py-2 rounded-xl text-sm border outline-none transition-all duration-300 w-40 focus:w-64 ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/40"
                : "bg-gray-100 border-transparent text-gray-800 placeholder-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Notification bell */}
      <button
        onClick={() => setShowInvites(true)}
        className={`relative shrink-0 w-9 h-9 flex items-center justify-center rounded-xl mr-1 transition-all active:scale-95 ${
          pendingInvites.length > 0
            ? darkMode ? "text-indigo-300 hover:bg-indigo-900/40" : "text-indigo-500 hover:bg-indigo-50"
            : darkMode ? "text-gray-500 hover:bg-gray-700/60" : "text-gray-400 hover:bg-gray-100"
        }`}
        title="Group invites"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {pendingInvites.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {pendingInvites.length}
          </span>
        )}
      </button>

      {/* Right — avatar + dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm select-none">
            {initials}
          </div>
          {/* Email — hidden on small screens */}
          {user && (
            <span className={`hidden md:block text-xs font-medium max-w-[120px] truncate ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>
              {user.email}
            </span>
          )}
          {/* Chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            } ${darkMode ? "text-gray-400" : "text-gray-400"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className={`popup-enter absolute right-0 top-12 w-52 rounded-2xl shadow-xl border overflow-hidden z-50 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            {/* User info header */}
            {user && (
              <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <p className={`text-xs font-semibold truncate ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                  {user.email}
                </p>
                <p className={`text-[11px] mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Free plan
                </p>
              </div>
            )}

            {/* Nav items */}
            <div className="py-1.5">
              {MENU_ITEMS.map(({ label, icon, page }) => {
                const isActive = currentPage === page;
                return (
                  <button
                    key={label}
                    onClick={() => { onNavigate(page); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className={isActive ? "text-indigo-500" : darkMode ? "text-gray-400" : "text-gray-400"}>
                      {icon}
                    </span>
                    {label}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dark mode toggle inside dropdown */}
            <div className={`border-t px-4 py-2.5 ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center justify-between text-sm font-medium transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={darkMode ? "text-gray-400" : "text-gray-400"}>
                    {darkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.02 0-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                      </svg>
                    )}
                  </span>
                  {darkMode ? "Light mode" : "Dark mode"}
                </div>
                {/* Toggle pill */}
                <div className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${
                  darkMode ? "bg-indigo-500" : "bg-gray-200"
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    darkMode ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </div>
              </button>
            </div>

            {/* Sign out */}
            <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <button
                onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        )}
      </div>

    </nav>

      {/* ── Logout confirmation modal ── (outside nav to avoid stacking context trap) */}
      {showInvites && <InvitesModal onClose={() => setShowInvites(false)} />}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          {/* Modal */}
          <div className={`popup-enter relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 flex flex-col gap-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-100 text-gray-800"
          }`}>
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                darkMode ? "bg-red-900/30" : "bg-red-50"
              }`}>
                👋
              </div>
            </div>
            {/* Text */}
            <div className="text-center">
              <h2 className="text-lg font-bold mb-1">Are you sure you want to leave?</h2>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                You'll be signed out of your SnapNotes session. Your notes are safely saved.
              </p>
            </div>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowLogoutModal(false); onNavigate("home"); }}
                className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutModal(false);
                  await signOut();
                }}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-red-900/40 active:scale-95 transition-all"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
