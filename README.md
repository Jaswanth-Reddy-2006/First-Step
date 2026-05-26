# 🚀 FirstStep — Professional AI-Powered Resume & CV Builder

FirstStep is an elite, modern, full-stack web application designed for professionals to craft high-fidelity, ATS-optimized resumes and CVs. Built with a premium, responsive glassmorphism UI, a secure Express + Neon PostgreSQL database, and deep Google Gemini AI integrations, FirstStep gives job seekers the ultimate toolkit to stand out and land their dream jobs.

---

## ✨ Features

### 🔐 Full Authentication & Secure Database
- **JWT Authentication**: Secure user signup, login, and robust session management.
- **Neon PostgreSQL DB**: Seamless backend data persistence hosted on the cloud.
- **Hybrid Storage Strategy**: Updates are saved instantly in local storage and synchronized with the PostgreSQL database in the background (non-blocking). Works offline and online!
- **Private Guest Mode**: Don't want to create an account? Use Guest Mode to keep all your data strictly in your local browser cache.

### 🤖 Gemini AI Optimizations
- **ATS Match Score & Keyword Audit**: Scan your resume against any target job description. The AI calculates a compatibility percentage, scores your structure, and lists missing keywords.
- **AI Job Role Tailoring**: Instantly rewrite and align your professional summary and experience points to optimize relevance for a target role.
- **AI Experience Bullet Enhancer**: Transform generic duty descriptions into high-impact, results-driven professional sentences with active verbs and optional metrics.
- **AI Resume Import**: Simply paste plain text or upload a document; Gemini AI parses, structures, and auto-populates all detail fields.

### 🎨 Premium UI/UX & Responsive Layouts
- **Collapsible Accordion Sidebar**: Beautiful, unified accordion menu that auto-collapses unused sections and keeps active states in perfect sync.
- **Spacious Workspace**: Responsive flex-grid layouts stretch to fill the screen, making the platform feel expansive and comfortable at all screen resolutions.
- **GPU-Accelerated 3D Marquee**: A stunning, infinitely scrolling 3D template gallery on the landing page utilizing smooth, high-performance CSS keyframe animations.
- **Interactive Forms & Custom Sections**: 
  - Dynamic Month/Year pickers and custom section templates.
  - "Currently work here" toggles to hide end dates dynamically.
  - Bullet-by-bullet list editors.
  - Custom fields to add any custom data to personal details or work history.

### 📄 Premium Exports
- **High-Fidelity PDF**: One-click printing optimized with custom font overrides, spacing, and outer margin density dials.
- **PowerPoint Widescreen Presentation**: Download your profile as structured, beautifully aligned slides (using `pptxgenjs`), ideal for technical review interviews.

---

## 🛠️ Technology Stack

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Next-generation build tool)
- **Framer Motion** & **Lucide Icons**
- **Vanilla CSS** (Curated HSL dark/light modes, premium glassmorphism, responsive grid systems)

### Backend
- **Node.js** & **Express**
- **Neon Serverless PostgreSQL** database client
- **JSONB** relational store for secure and flexible data representation
- **JSON Web Tokens (JWT)** for session validation

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- A [Neon PostgreSQL](https://neon.tech) account (optional, for cloud database features)
- A [Google Gemini API Key](https://ai.google.dev/) (optional, for AI features)

---

## 💻 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Jaswanth-Reddy-2006/First-Step.git
   cd First-Step
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and populate the variables:
   ```env
   # Neon PostgreSQL Connection String (starts with postgresql://)
   NEON_DATABASE_URL=your_neon_connection_string

   # JWT Secret key (choose any secure random string)
   JWT_SECRET=your_jwt_secret_key

   # API Port (default is 3001)
   PORT=3001
   ```

---

## 🏃‍♂️ Running the Application

### Concurrent Full-Stack Mode (Vite Dev Server + Node.js API Server)
Runs both the frontend (port `5173` or `5174`) and backend (port `3001`) simultaneously:
```bash
npm run dev
```

### Frontend-Only Mode (Local / Offline Cache)
Runs just the Vite frontend dev server. Data will be persisted in your browser's local storage:
```bash
npm run dev:vite
```

### API Server-Only Mode
```bash
npm run dev:server
```

---

## 🐳 Production Deployment

1. **Build the Production Bundle**
   ```bash
   npm run build
   ```
2. **Start the Production API & Frontend Proxy**
   Ensure your hosting provider points to `server/index.js` or runs `node server/index.js` with your environment configuration.

---

## 📜 License
This project is open-source and available under the MIT License.
