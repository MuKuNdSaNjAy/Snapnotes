const FEATURES = [
  {
    icon: "📌",
    title: "Pin What Matters",
    desc: "Keep your most important notes pinned to the top, always in sight.",
  },
  {
    icon: "🎨",
    title: "Color Your Thoughts",
    desc: "Organize notes with colors and categories that make sense to you.",
  },
  {
    icon: "🔍",
    title: "Find Anything Fast",
    desc: "Instant search across all your notes. No more digging around.",
  },
  {
    icon: "🔄",
    title: "Sync Everywhere",
    desc: "Your notes follow you. Access them from any device, any time.",
  },
  {
    icon: "🌙",
    title: "Easy on the Eyes",
    desc: "Dark and light mode so you're always comfortable, day or night.",
  },
  {
    icon: "✋",
    title: "Drag & Drop",
    desc: "Rearrange your board exactly the way you want with smooth drag and drop.",
  },
];

const DEMO_NOTES = [
  { color: "bg-yellow-200",  text: "Buy groceries 🛒",         rotate: "-rotate-2", top: "top-4",  left: "left-4"  },
  { color: "bg-pink-200",    text: "Call mom 💛",               rotate: "rotate-1",  top: "top-2",  left: "left-48" },
  { color: "bg-blue-200",    text: "Finish project report 📊",  rotate: "-rotate-1", top: "top-20", left: "left-24" },
  { color: "bg-green-200",   text: "Morning run 🏃",            rotate: "rotate-2",  top: "top-6",  left: "left-80" },
  { color: "bg-purple-200",  text: "Read 30 mins 📚",           rotate: "-rotate-1", top: "top-24", left: "left-64" },
];

export default function WelcomePage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Background blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-[-40px] right-[-60px] w-80 h-80 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 mb-6 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Now with real-time sync
        </div>

        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-300/50 dark:shadow-indigo-900/60 mx-auto">
            <span className="text-4xl">📌</span>
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-30 scale-110 -z-10" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight max-w-2xl">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
            SnapNotes
          </span>
        </h1>

        <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
          The beautiful sticky notes app that keeps your thoughts organized,
          colorful, and always within reach.
        </p>

        {/* Single CTA */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            Get Started — it's free
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            No credit card required · Free forever
          </p>
        </div>
      </section>

      {/* ── Floating notes demo ── */}
      <section className="relative max-w-4xl mx-auto px-6 mb-8">
        <div className="relative h-44 select-none pointer-events-none">
          {DEMO_NOTES.map((note, i) => (
            <div
              key={i}
              className={`absolute ${note.color} ${note.rotate} ${note.top} ${note.left} rounded-2xl shadow-md px-4 py-3 text-sm font-medium text-gray-700 w-36 sm:w-40`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-full h-1 rounded bg-black/5 mb-2" />
              {note.text}
            </div>
          ))}
          {/* Fade out at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 via-transparent to-transparent" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-lg mx-auto">
            Designed to be fast, simple, and delightful to use every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group relative bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-900/20 dark:to-purple-900/20 -z-10 rounded-3xl" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Ready to snap your ideas?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-md mx-auto">
            Join and start organizing your thoughts in seconds.
          </p>
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2 mx-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            Get Started — it's free
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
        Built with ❤️ · SnapNotes © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
