# 📌 SnapNotes

A real-time collaborative sticky notes app built with React and Supabase. Create personal notes, form groups with friends or family, and share notes together — all with a 24-hour expiry system to keep things fresh.

---

## Features

- **Sticky Notes** — Create handwritten-style notes with color themes and categories
- **24-Hour Expiry** — Notes auto-expire after 24 hours; expiring notes show a live countdown and progress bar
- **Past Notes** — Expired notes are archived and can be restored or deleted permanently
- **Groups** — Create or join groups (up to 6 members) to share notes with others
- **Email Invites** — Invite members to your group by email via EmailJS
- **Dark Mode** — Full dark/light mode toggle
- **Search & Filter** — Search notes by content, filter by category
- **Auth** — Google OAuth + email/password sign-in via Supabase

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS v3 |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Email | EmailJS |
| Font | Google Fonts — Inter + Caveat |
| Auth | Supabase Auth (Google OAuth, Email/Password) |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/snapnotes.git
cd snapnotes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

> The app works without Supabase keys — it falls back to localStorage automatically.

### 4. Run the app

```bash
npm start
```

---

## Supabase Setup

Run the following SQL in your Supabase **SQL Editor** to create the required tables:

```sql
-- Notes table
create table notes (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  content text,
  color text default 'yellow',
  category text default 'general',
  pinned boolean default false,
  created_at timestamptz default now(),
  group_id uuid references groups(id) on delete set null,
  author_email text
);

-- Groups table
create table groups (
  id uuid primary key,
  name text not null,
  emoji text default '👥',
  invite_code text unique not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Group members table
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Group invites table
create table group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  group_name text,
  group_emoji text default '👥',
  invited_email text not null,
  invited_by uuid references auth.users(id),
  invited_by_email text,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(group_id, invited_email)
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
alter table notes enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_invites enable row level security;

-- Notes policies
create policy "Users can manage their own notes"
  on notes for all using (auth.uid() = user_id);

create policy "Group members can view group notes"
  on notes for select using (
    group_id is null or
    exists (
      select 1 from group_members
      where group_id = notes.group_id and user_id = auth.uid()
    )
  );

-- Groups policies
create policy "Anyone can read groups"
  on groups for select using (true);

create policy "Authenticated users can create groups"
  on groups for insert with check (auth.uid() = created_by);

-- Group members policies
create policy "Members can view group members"
  on group_members for select using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );

create policy "Authenticated users can join groups"
  on group_members for insert with check (auth.uid() = user_id);

create policy "Members can leave groups"
  on group_members for delete using (auth.uid() = user_id);

-- Group invites policies
create policy "Users can see their invites"
  on group_invites for select using (invited_email = auth.email());

create policy "Authenticated users can insert invites"
  on group_invites for insert
  with check (
    auth.uid() = invited_by
    and exists (
      select 1 from group_members gm
      where gm.group_id = group_id and gm.user_id = auth.uid()
    )
  );

create policy "Invitee can respond to their invite"
  on group_invites for update using (invited_email = auth.email());
```

---

## EmailJS Setup

1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Connect an email service (Gmail, Outlook, etc.)
3. Create a template using these variables:

| Variable | Description |
|---|---|
| `{{to_email}}` | Recipient's email address |
| `{{group_name}}` | Name of the group |
| `{{group_emoji}}` | Group emoji |
| `{{invited_by}}` | Sender's email |
| `{{invite_code}}` | 6-character invite code |

4. Set the **To Email** field in the template to `{{to_email}}`
5. Copy your Service ID, Template ID, and Public Key into `.env`

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── HomePage.jsx
│   ├── NotesGrid.jsx
│   ├── NoteCard.jsx
│   ├── AddNoteButton.jsx
│   ├── FilterBar.jsx
│   ├── GroupSwitcher.jsx
│   ├── CreateGroupModal.jsx
│   ├── JoinGroupModal.jsx
│   ├── GroupMembersModal.jsx
│   ├── InvitesModal.jsx
│   ├── PastNotesPage.jsx
│   ├── SettingsPage.jsx
│   ├── WelcomePage.jsx
│   ├── SignInPage.jsx
│   ├── LoginPage.jsx
│   └── SignupPage.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── NotesContext.jsx
│   └── GroupsContext.jsx
├── lib/
│   └── supabase.js
└── App.jsx
```

---

## License

MIT
