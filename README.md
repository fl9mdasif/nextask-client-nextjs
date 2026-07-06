# NexTask — Task Management & Image Annotation Platform

🌐 **Live Demo:** [nextasks-annotate.vercel.app](https://nextasks-annotate.vercel.app/)

NexTask is a dark-themed, high-performance SaaS web application built with Next.js 16, TypeScript, Tailwind CSS v4, and Zustand. It serves as a unified workspace for Kanban-style task management and medical image/scan polygon annotation. 

The frontend connects to a secure Django REST API backend to persist tasks, scans, and vector annotations.

---

## 🚀 Key Features

* **Secure Authentication**: Protected page routing, cookie/localStorage sync, and Axios interceptors for automatic JWT access token refresh.
* **Kanban Task Board (`/tasks`)**: Dynamic task workflow containing columns for *To Do*, *In Progress*, and *Done*. Features an interactive 7-day date strip, drag-and-drop support, task cards, and warning indicators for overdue items.
* **Image Annotation Tool (`/annotate`)**: Advanced image overlay editor powered by HTML5 Canvas (`react-konva`). Supports scan uploads, custom drawing labels, color presets, active polygons listing, and canvas deletion controls.
* **Productivity Analytics (`/analytics`)**: Interactive dashboard visualizing workspace performance metrics, including:
  * Status distribution bar charts.
  * Task priority ratios (Pie Chart).
  * Task creation frequency over 7 days (Line Chart).
  * Detailed list of the 5 most recent overdue items.
* **Refined Aesthetics & Toggle**: Modern dark-theme design (`#0a0a0f`) with glassmorphism interfaces, Framer Motion animations, and a synchronized light mode configuration via `next-themes`.

---

## 🛠 Tech Stack

| Domain | Technology |
|---|---|
| **Core Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **State Management** | Zustand |
| **Animations** | Framer Motion |
| **API Client** | Axios |
| **Canvas Engine** | react-konva / konva |
| **Charts** | Recharts |
| **Date Utils** | date-fns |

---

## 📁 File Structure

```bash
nextask-client-nextjs/
├── app/                      # Next.js App Router (Layouts & Pages)
│   ├── analytics/            # Analytics dashboard view
│   ├── annotate/             # Scan annotation canvas page
│   ├── login/                # Sign-in page with validation
│   ├── tasks/                # Kanban task board page
│   ├── globals.css           # Global stylesheets, Tailwind imports, & light mode overrides
│   └── layout.tsx            # App root layout and providers injection
├── components/               # React components directory
│   ├── annotate/             # Canvas overlays, Gallery slider, and Uploader
│   ├── auth/                 # Sign-in forms and decorative visuals
│   ├── shared/               # Global shell, navigation bar, footer, and theme controllers
│   └── tasks/                # Kanban board columns, task cards, and date selectors
├── lib/                      # Infrastructure utilities
│   └── api.ts                # Axios instance, requests routing, and JWT interceptors
├── store/                    # Zustand store files
│   ├── annotateStore.ts      # Scans and overlay polygons store state
│   ├── taskStore.ts          # Active task date and Kanban list state
│   └── toastStore.ts         # Global dynamic push notification alerts
├── src/
│   └── interfaces/           # TypeScript interfaces and type definitions
├── next.config.ts            # Next.js compiler settings
└── package.json              # App scripts and core dependencies
```

---

## 💻 Local Installation Guide

### Prerequisites
* **Node.js** (v18.0 or higher recommended)
* **npm**, **yarn**, or **pnpm**

### 1. Clone & Install
```bash
# Clone the repository and enter the client directory
cd nextask-client-nextjs

# Install package dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of the `nextask-client-nextjs` folder:
```ini
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
*(Point this to `https://<your-username>.pythonanywhere.com` in production environments)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build & Lint Check
Validate TypeScript type integrity, ESLint static analysis rules, and generate an optimized production build:
```bash
# Run lint check
npm run lint

# Build standalone application bundle
npm run build
```

---

## 🌐 Production CORS & Deployment Configurations

When deploying the frontend to **Vercel** and the Django backend to **PythonAnywhere**, browser security policies may block Konva canvas images due to missing CORS headers. To resolve this:

1. **Django CORS Settings**: Ensure your Vercel URL is whitelisted in your backend `.env` file:
   ```ini
   CORS_ALLOWED_ORIGINS=https://nextasks-annotate.vercel.app
   ```
2. **Remove Static Mapping in PythonAnywhere**:
   * Open the **Web** tab in PythonAnywhere.
   * Scroll down to **Static Files** and **delete** the mapping for `/media/`.
   * Reload the web app.
   * *This forces requests through Django where `corsheaders` middleware dynamically adds CORS headers to user-uploaded scans.*
