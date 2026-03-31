import { useContext, useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GroupsProvider } from "./context/GroupsContext";
import { NotesProvider, NotesContext } from "./context/NotesContext";

import Navbar from "./components/Navbar";
import FilterBar from "./components/Filterbar";
import NotesGrid from "./components/Notesgrid";
import AddNoteButton from "./components/AddNoteButton";
import WelcomePage from "./components/WelcomePage";
import SignInPage from "./components/SignInPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import SettingsPage from "./components/SettingsPage";
import HomePage from "./components/HomePage";
import PastNotesPage from "./components/PastNotesPage";
import GroupSwitcher from "./components/GroupSwitcher";

function AppShell() {
  const { darkMode, loading } = useContext(NotesContext);
  const { user, authLoading } = useAuth();

  // Pre-login flow: "welcome" | "signin" | "login" | "signup"
  // "signin"  = OAuth-only page (shown after Get Started)
  // "login"   = email+password page
  // "signup"  = email signup page
  const [authPage, setAuthPage] = useState("welcome");

  // Post-login routing: "home" | "notes" | "settings"
  const [appPage, setAppPage] = useState("home");

  // On logout → back to welcome
  useEffect(() => {
    if (!user) setAuthPage("welcome");
  }, [user]);

  // ── Loading spinner ──────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Logged in ────────────────────────────────────────────
  if (user) {
    if (appPage === "settings") {
      return <SettingsPage onNavigate={setAppPage} />;
    }

    if (appPage === "past") {
      return <PastNotesPage onNavigate={setAppPage} />;
    }

    if (appPage === "home") {
      return (
        <div className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-gray-950" : "bg-gray-50"
        }`}>
          <Navbar onNavigate={setAppPage} currentPage={appPage} />
          <HomePage onNavigate={setAppPage} />
        </div>
      );
    }

    // "notes" page
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-950" : "bg-gray-50"
      }`}>
        <Navbar onNavigate={setAppPage} currentPage={appPage} />
        <GroupSwitcher />
        <FilterBar />
        {loading ? (
          <div className="flex items-center justify-center mt-32">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <NotesGrid />
        )}
        <AddNoteButton />
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────

  // 1. Welcome — always first
  if (authPage === "welcome") {
    return (
      <WelcomePage
        onGetStarted={() => setAuthPage("signin")}
      />
    );
  }

  // 2. OAuth sign-in page (Google / GitHub)
  //    "Sign in with Email →" goes to full login
  if (authPage === "signin") {
    return (
      <SignInPage
        onBack={() => setAuthPage("login")}  // email fallback
        onBackToWelcome={() => setAuthPage("welcome")}
      />
    );
  }

  // 3. Email login
  if (authPage === "login") {
    return (
      <LoginPage
        onSignup={() => setAuthPage("signup")}
        onBack={() => setAuthPage("signin")}
      />
    );
  }

  // 4. Email signup
  if (authPage === "signup") {
    return (
      <SignupPage
        onLogin={() => setAuthPage("login")}
        onBack={() => setAuthPage("signin")}
      />
    );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <GroupsProvider>
        <NotesProvider>
          <AppShell />
        </NotesProvider>
      </GroupsProvider>
    </AuthProvider>
  );
}
