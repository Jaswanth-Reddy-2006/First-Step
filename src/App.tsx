import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { Agentation } from "agentation";
import {
  Eye, EyeOff, Loader2, AlertCircle, UserPlus, LogIn
} from "lucide-react";
import {
  signup, login, logout, verifySession, getStoredUser, checkApiStatus,
  type AuthUser,
} from "./lib/auth";

type ViewMode = "landing" | "builder";
type AuthTab = "login" | "signup";

export default function App() {
  const [view, setView] = useState<ViewMode>("landing");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Auth modal state
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirm, setFormConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [dbConnected, setDbConnected] = useState(false);

  // On mount: restore session + check API status
  useEffect(() => {
    const init = async () => {
      // Check if API server is running
      const status = await checkApiStatus();
      setDbConnected(status.dbConnected);

      // Try to restore session
      const stored = getStoredUser();
      if (stored) {
        if (status.available) {
          // Verify with server
          const user = await verifySession();
          setCurrentUser(user);
        } else {
          // Server offline — trust localStorage
          setCurrentUser(stored);
        }
      }

      setIsInitializing(false);
    };
    init();
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setCurrentUser(null);
    setView("landing");
    setFormEmail("");
    setFormPassword("");
    setFormConfirm("");
    setFormName("");
    setAuthError("");
  }, []);

  const resetForm = () => {
    setAuthError("");
    setFormPassword("");
    setFormConfirm("");
  };

  // ── Auth submission ────────────────────────────────────────────────────────
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!formEmail.trim()) return setAuthError("Email is required.");
    if (!formPassword) return setAuthError("Password is required.");

    if (authTab === "signup") {
      if (!formName.trim()) return setAuthError("Full name is required.");
      if (formPassword.length < 6) return setAuthError("Password must be at least 6 characters.");
      if (formPassword !== formConfirm) return setAuthError("Passwords do not match.");
    }

    setIsSubmitting(true);
    try {
      let user: AuthUser;
      if (authTab === "signup") {
        user = await signup(formName, formEmail, formPassword);
      } else {
        user = await login(formEmail, formPassword);
      }
      setCurrentUser(user);
      setView("builder");
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0a0a0a", flexDirection: "column", gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff" }}>
          <img src="/favicon.png" alt="FirstStep Logo" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px" }} />
          <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>
            <span style={{ color: "#6366f1" }}>First</span>Step
          </span>
        </div>
        <Loader2 size={22} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="grid-overlay no-print" />
      <div className="glow-sphere sphere-red no-print" />
      <div className="glow-sphere sphere-dark no-print" />

      <Header currentView={view} setView={setView} currentUser={currentUser} onLogout={handleLogout} />

      <main className="main-content-layout">
        {view === "landing" ? (
          <LandingPage onStart={() => setView("builder")} />
        ) : currentUser ? (
          <Dashboard currentUser={currentUser} />
        ) : (
          /* ── Auth Modal ──────────────────────────────────────────────────── */
          <div className="auth-overlay">
            {/* Animated 3D Background Elements */}
            <div className="auth-3d-container">
              <div className="floating-shape shape-1" />
              <div className="floating-shape shape-2" />
              <div className="floating-shape shape-3" />
              <div className="floating-wireframe-card wire-1" />
              <div className="floating-wireframe-card wire-2" />
            </div>

            <div className="auth-card">
              {/* Logo */}
              <div className="auth-logo" style={{ gap: 12 }}>
                <img src="/favicon.png" alt="FirstStep Logo" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px" }} />
                <h1 className="auth-title">
                  <span style={{ color: "var(--accent)" }}>First</span>Step
                </h1>
              </div>
              <p className="auth-subtitle">
                AI-powered resume builder for your career journey
              </p>

              {/* DB Status Badge */}
              <div className={`auth-status-badge ${dbConnected ? "connected" : "offline"}`}>
                <span className="auth-status-dot" />
                {dbConnected
                  ? "Database Connected — profile sync active"
                  : "Offline Mode — local database server unreachable"}
              </div>

              {/* Tab switcher */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`}
                  onClick={() => { setAuthTab("login"); resetForm(); }}
                  type="button"
                >
                  <LogIn size={14} /> Sign In
                </button>
                <button
                  className={`auth-tab-btn ${authTab === "signup" ? "active" : ""}`}
                  onClick={() => { setAuthTab("signup"); resetForm(); }}
                  type="button"
                >
                  <UserPlus size={14} /> Create Account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="auth-form" noValidate>
                {authTab === "signup" && (
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Jaswanth Reddy"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-pw-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      className="auth-input"
                      placeholder={authTab === "signup" ? "At least 6 characters" : "Your password"}
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      autoComplete={authTab === "signup" ? "new-password" : "current-password"}
                    />
                    <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {authTab === "signup" && (
                  <div className="auth-field">
                    <label className="auth-label">Confirm Password</label>
                    <input
                      type={showPw ? "text" : "password"}
                      className="auth-input"
                      placeholder="Repeat your password"
                      value={formConfirm}
                      onChange={e => setFormConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {authError && (
                  <div className="auth-error">
                    <AlertCircle size={14} />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <><Loader2 size={16} className="spin-icon" /> {authTab === "signup" ? "Creating account…" : "Signing in…"}</>
                    : authTab === "signup" ? "Create Account" : "Sign In"}
                </button>
              </form>
            </div>

            {/* ── Styles ─────────────────────────────────────────────────── */}
            <style>{`
              .auth-overlay {
                position: fixed;
                inset: 0;
                background: radial-gradient(ellipse at 50% 30%, rgba(255,49,49,0.09), transparent 60%),
                            radial-gradient(ellipse at 80% 80%, rgba(255,49,49,0.05), transparent 50%),
                            #06060c;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                overflow: hidden;
              }
              
              /* 3D Visual elements styling */
              .auth-3d-container {
                position: absolute;
                inset: 0;
                overflow: hidden;
                pointer-events: none;
                z-index: 1;
              }

              .floating-shape {
                position: absolute;
                border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
                filter: blur(50px);
                opacity: 0.12;
                background: linear-gradient(135deg, var(--accent) 0%, #111111 100%);
                animation: blob-float 12s infinite ease-in-out;
              }

              .shape-1 {
                width: 250px;
                height: 250px;
                top: 15%;
                left: 10%;
                animation-duration: 14s;
              }

              .shape-2 {
                width: 300px;
                height: 300px;
                bottom: 10%;
                right: 10%;
                background: linear-gradient(135deg, #ff5e5e 0%, var(--accent) 100%);
                animation-duration: 18s;
                animation-delay: -3s;
              }

              .shape-3 {
                width: 150px;
                height: 150px;
                top: 60%;
                left: 20%;
                background: linear-gradient(135deg, var(--accent) 0%, #ff8787 100%);
                animation-duration: 10s;
                animation-delay: -5s;
              }

              .floating-wireframe-card {
                position: absolute;
                width: 160px;
                height: 220px;
                background: rgba(255, 255, 255, 0.015);
                border: 1.5px solid rgba(255, 49, 49, 0.15);
                border-radius: 12px;
                transform: perspective(600px) rotateX(45deg) rotateY(-15deg) rotateZ(10deg);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(255, 49, 49, 0.05);
                animation: float-3d-card 8s infinite alternate ease-in-out;
              }

              .wire-1 {
                top: 20%;
                right: 15%;
                animation-duration: 8s;
              }

              .wire-2 {
                bottom: 25%;
                left: 15%;
                animation-duration: 10s;
                animation-delay: -2s;
                width: 140px;
                height: 190px;
                border-color: rgba(255, 255, 255, 0.07);
                transform: perspective(600px) rotateX(30deg) rotateY(25deg) rotateZ(-15deg);
              }

              @keyframes blob-float {
                0% { transform: translateY(0px) rotate(0deg) scale(1); }
                50% { transform: translateY(-30px) rotate(180deg) scale(1.08); }
                100% { transform: translateY(0px) rotate(360deg) scale(1); }
              }

              @keyframes float-3d-card {
                0% { transform: perspective(600px) rotateX(45deg) rotateY(-15deg) rotateZ(10deg) translateY(0); }
                100% { transform: perspective(600px) rotateX(47deg) rotateY(-12deg) rotateZ(8deg) translateY(-20px); }
              }

              .auth-card {
                background: rgba(255, 255, 255, 0.025);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 20px;
                padding: 40px 36px;
                width: 100%;
                max-width: 440px;
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 49, 49, 0.12);
                display: flex;
                flex-direction: column;
                gap: 0;
                position: relative;
                z-index: 10;
                transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
              }
              .auth-card:hover {
                border-color: rgba(255, 49, 49, 0.25);
                box-shadow: 0 40px 80px rgba(0, 0, 0, 0.55), 0 0 20px rgba(255, 49, 49, 0.08);
                transform: translateY(-2px);
              }
              .auth-logo {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 6px;
              }
              .auth-title {
                font-size: 1.7rem;
                font-weight: 800;
                color: #fff;
                margin: 0;
                letter-spacing: -0.03em;
              }
              .auth-subtitle {
                text-align: center;
                color: #71717a;
                font-size: 0.83rem;
                margin: 0 0 16px;
              }
              .auth-status-badge {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.75rem;
                font-weight: 500;
                margin-bottom: 20px;
              }
              .auth-status-badge.connected {
                background: rgba(16,185,129,0.08);
                color: #10b981;
                border: 1px solid rgba(16,185,129,0.2);
              }
              .auth-status-badge.offline {
                background: rgba(239,68,68,0.08);
                color: #f87171;
                border: 1px solid rgba(239,68,68,0.15);
              }
              .auth-status-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: currentColor;
                flex-shrink: 0;
              }
              .auth-tabs {
                display: flex;
                background: rgba(255,255,255,0.04);
                border-radius: 10px;
                padding: 4px;
                margin-bottom: 20px;
                border: 1px solid rgba(255,255,255,0.06);
              }
              .auth-tab-btn {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 9px 14px;
                border: none;
                border-radius: 7px;
                background: transparent;
                color: #71717a;
                font-size: 0.88rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
              }
              .auth-tab-btn.active {
                background: rgba(255, 49, 49, 0.15);
                color: #ff8787;
                box-shadow: 0 2px 8px rgba(255, 49, 49, 0.15);
              }
              .auth-form {
                display: flex;
                flex-direction: column;
                gap: 14px;
              }
              .auth-field {
                display: flex;
                flex-direction: column;
              }
              .auth-label {
                font-size: 0.75rem;
                font-weight: 600;
                color: #a1a1aa;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 6px;
              }
              .auth-input {
                width: 100%;
                padding: 11px 14px;
                border-radius: 9px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.09);
                color: #fff;
                font-size: 0.9rem;
                outline: none;
                transition: border-color 0.2s, background 0.2s;
                box-sizing: border-box;
              }
              .auth-input::placeholder { color: #52525b; }
              .auth-input:focus {
                border-color: rgba(255, 49, 49, 0.4);
                background: rgba(255, 255, 255, 0.07);
              }
              .auth-pw-wrap {
                position: relative;
              }
              .auth-pw-wrap .auth-input {
                padding-right: 44px;
              }
              .auth-pw-toggle {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #52525b;
                cursor: pointer;
                padding: 4px;
                display: flex;
                transition: color 0.15s;
              }
              .auth-pw-toggle:hover { color: #a1a1aa; }
              .auth-error {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                border-radius: 8px;
                background: rgba(239,68,68,0.08);
                border: 1px solid rgba(239,68,68,0.2);
                color: #f87171;
                font-size: 0.83rem;
              }
              .auth-submit-btn {
                height: 44px;
                border-radius: 10px;
                background: linear-gradient(135deg, var(--accent), #b30000);
                border: none;
                color: #fff;
                font-size: 0.92rem;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
                margin-top: 4px;
                box-shadow: 0 4px 15px rgba(255, 49, 49, 0.3);
              }
              .auth-submit-btn:hover:not(:disabled) {
                opacity: 0.95;
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(255, 49, 49, 0.45);
              }
              .auth-submit-btn:disabled {
                opacity: 0.55;
                cursor: not-allowed;
              }
              .spin-icon { animation: spin 0.8s linear infinite; }
            `}</style>
          </div>
        )}
      </main>

      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}

      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          background-color: var(--background);
        }
        .main-content-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }
        @media print {
          .app-container, .main-content-layout {
            display: block !important;
            background: transparent !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
