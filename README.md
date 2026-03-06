# Mission Control - AI Command Center

A beautiful Kanban-style project management dashboard. Dark theme, drag-and-drop, real-time activity feed.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## Features

- 🎯 **Kanban Board** - 5-column workflow (Inbox → Up Next → In Progress → In Review → Done)
- 🖱️ **Drag & Drop** - Smooth task movement between columns
- ⚡ **Live Activity** - Real-time feed showing all task changes
- 🎨 **Dark Theme** - Premium look with magenta (#E91E8C) and cyan (#00D9FF) accents
- 📱 **Responsive** - Works on desktop and tablet
- 🚀 **Fast** - SQLite/Turso database

---

## 🚀 Deploy to Vercel (Recommended)

### Step 1: Fork this repo
Click the "Fork" button at the top right of this page.

### Step 2: Create a Turso Database (Free)

1. Go to [turso.tech](https://turso.tech) and sign up (free tier available)
2. Create a new database (name it `mission-control`)
3. Click on your database and get:
   - **Database URL** (looks like `libsql://mission-control-yourname.turso.io`)
   - **Auth Token** (click "Create Token")

### Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your forked repository
3. Add these **Environment Variables**:
   | Name | Value |
   |------|-------|
   | `TURSO_DATABASE_URL` | Your Turso database URL |
   | `TURSO_AUTH_TOKEN` | Your Turso auth token |
4. Click **Deploy**

### Step 4: Initialize Database

After deployment, run the seed script to create tables:

```bash
# Clone your fork locally
git clone https://github.com/YOUR-USERNAME/Mission-control-template.git
cd Mission-control-template

# Install dependencies
npm install

# Create .env.local with your Turso credentials
cp .env.example .env.local
# Edit .env.local with your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN

# Run the seed script
node scripts/seed-turso.js
```

Your dashboard is now live! 🎉

---

## 💻 Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/Mission-control-template.git
cd Mission-control-template

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Tech Stack

- **Next.js 14** - App Router with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **dnd-kit** - Drag and drop functionality
- **Turso/LibSQL** - SQLite database (edge-compatible)
- **Lucide Icons** - Clean icon set

---

## Project Structure

```
mission-control/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Theme + custom styles
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── KanbanBoard.tsx   # Main board with DnD
│   │   ├── KanbanColumn.tsx  # Individual column
│   │   ├── TaskCard.tsx      # Draggable task card
│   │   ├── TaskModal.tsx     # Create/edit modal
│   │   ├── LiveActivity.tsx  # Activity panel
│   │   └── Header.tsx        # Top navigation
│   └── lib/
│       ├── db.ts             # Database setup
│       ├── types.ts          # TypeScript types
│       └── utils.ts          # Utilities
└── scripts/
    └── seed-turso.js         # Database initialization
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/activity` | Get activity feed |

---

## Color Palette

```css
/* Brand Colors */
--magenta: #E91E8C;    /* Primary accent */
--cyan: #00D9FF;       /* Secondary accent */

/* Dark Theme */
--background: #0A0A0F;  /* Main background */
--card: #12121A;        /* Card backgrounds */
--border: #2A2A3E;      /* Borders */

/* Status Colors */
--success: #34D399;     /* Done, Online */
--warning: #FBBF24;     /* In Review */
--error: #F87171;       /* Urgent */
```

---

## Need Help?

If you get stuck, paste this into Claude or ChatGPT:

> I'm trying to deploy Mission Control from this repo: https://github.com/alex-giglietti/Mission-control-template
> 
> Help me: [describe your issue]

---

Built with ⚡ by AIM
