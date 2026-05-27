import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { Agentation } from "agentation";
import {
  Eye, EyeOff, Loader2, AlertCircle
} from "lucide-react";
import {
  signup, login, logout, verifySession, getStoredUser, checkApiStatus,
  type AuthUser,
} from "./lib/auth";

type AuthTab = "login" | "signup";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Auth form state
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirm, setFormConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  // Sync state with popstate browser events
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  }, []);

  // Redirect auth / access control checks
  useEffect(() => {
    if (isInitializing) return;

    if (currentPath === "/builder" && !currentUser) {
      navigate("/login");
    }
    if (currentPath === "/login" && currentUser) {
      navigate("/builder");
    }
  }, [currentPath, currentUser, isInitializing, navigate]);

  // On mount: restore session + check API status
  useEffect(() => {
    const init = async () => {
      // Check if API server is running
      const status = await checkApiStatus();

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
    navigate("/");
    setFormEmail("");
    setFormPassword("");
    setFormConfirm("");
    setFormName("");
    setAuthError("");
  }, [navigate]);

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
      navigate("/builder");
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
            <span style={{ color: "var(--accent)" }}>First</span>Step
          </span>
        </div>
        <Loader2 size={22} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {currentPath !== "/login" && (
        <>
          <div className="grid-overlay no-print" />
          <div className="glow-sphere sphere-red no-print" />
          <div className="glow-sphere sphere-dark no-print" />
        </>
      )}

      <Header currentPath={currentPath} onNavigate={navigate} currentUser={currentUser} onLogout={handleLogout} />

      <main className="main-content-layout">
        {currentPath === "/login" ? (
          /* ── White Two-Column Login Page ─────────────────────────────────── */
          <div className="login-page-container">
            {/* Left Column: 3D model video */}
            <div className="login-left-panel">
              <div className="login-video-overlay" />
              <div className="login-video-badge">
                <span className="login-badge-dot"></span>
                Interactive 3D Preview
              </div>
              <video
                src="/Resume_3d_Model.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="login-video-model"
              />
            </div>

            {/* Right Column: Clean Form */}
            <div className="login-right-panel">
              <div className="login-card">
                <h2 className="login-form-title">
                  {authTab === "login" ? "Sign In" : "Create Account"}
                </h2>
                <p className="login-form-subtitle">
                  {authTab === "login"
                    ? "Welcome back! Access your tailored resumes & ATS compatibility audits."
                    : "Create your free account to access customized templates and AI features."}
                </p>

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

                {/* Bottom switcher trigger inside login card footer */}
                <div className="login-toggle-footer">
                  {authTab === "login" ? (
                    <p className="toggle-text">
                      Don't have an account?{" "}
                      <span
                        className="toggle-link-red"
                        onClick={() => { setAuthTab("signup"); resetForm(); }}
                      >
                        Create an account
                      </span>
                    </p>
                  ) : (
                    <p className="toggle-text">
                      Already have an account?{" "}
                      <span
                        className="toggle-link-red"
                        onClick={() => { setAuthTab("login"); resetForm(); }}
                      >
                        Sign in
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Custom styles for the brand new white 3D video login page layout */}
            <style>{`
              .login-page-container {
                display: flex;
                min-height: calc(100vh - 80px);
                margin-top: 80px;
                background-color: #ffffff;
                width: 100%;
                z-index: 10;
              }
              
              .login-left-panel {
                flex: 1.25;
                position: relative;
                background-color: #fafafa;
                border-right: 1px solid var(--border);
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .login-video-overlay {
                position: absolute;
                inset: 0;
                background: radial-gradient(circle, rgba(255,255,255,0) 40%, rgba(0,0,0,0.06) 100%),
                            linear-gradient(to top, rgba(0,0,0,0.08) 0%, transparent 40%);
                pointer-events: none;
                z-index: 2;
              }

              .login-video-model {
                width: 88%;
                height: 88%;
                object-fit: contain;
                border-radius: 16px;
                box-shadow: 
                  0 20px 45px rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(255, 49, 49, 0.06);
                transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s;
                z-index: 1;
              }

              .login-left-panel:hover .login-video-model {
                transform: scale(1.025) translateY(-4px) rotateY(-2deg);
                box-shadow: 
                  0 30px 60px rgba(255, 49, 49, 0.08),
                  0 0 20px rgba(255, 49, 49, 0.04),
                  0 0 0 1px rgba(255, 49, 49, 0.15);
              }

              .login-video-badge {
                position: absolute;
                top: 24px;
                left: 24px;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                color: var(--foreground);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.78rem;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 3;
              }

              .login-badge-dot {
                width: 6px;
                height: 6px;
                background-color: var(--accent);
                border-radius: 50%;
                animation: pulse-dot-css 2s infinite;
              }
              
              .login-right-panel {
                flex: 0.75;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 60px 40px;
                background-color: #ffffff;
              }
              
              .login-card {
                width: 100%;
                max-width: 380px;
                display: flex;
                flex-direction: column;
              }

              .login-form-title {
                font-size: 2.25rem;
                font-weight: 800;
                color: var(--foreground);
                margin-bottom: 8px;
                letter-spacing: -0.04em;
              }

              .login-form-subtitle {
                font-size: 0.95rem;
                color: var(--secondary-foreground);
                margin-bottom: 36px;
                line-height: 1.5;
              }

              .auth-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }

              .auth-field {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }

              .auth-label {
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--secondary-foreground);
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }

              .auth-input {
                width: 100%;
                padding: 12px 16px;
                border-radius: var(--radius);
                background: #fafafa;
                border: 1px solid var(--border);
                color: var(--foreground);
                font-size: 0.95rem;
                outline: none;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                box-sizing: border-box;
              }

              .auth-input::placeholder { color: #a1a1aa; }
              
              .auth-input:focus {
                border-color: var(--accent);
                background: #ffffff;
                box-shadow: 0 0 0 4px var(--accent-light);
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
                color: #a1a1aa;
                cursor: pointer;
                padding: 4px;
                display: flex;
                transition: color 0.15s;
              }

              .auth-pw-toggle:hover { color: var(--foreground); }

              .auth-error {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                border-radius: var(--radius);
                background: rgba(239, 68, 68, 0.05);
                border: 1px solid rgba(239, 68, 68, 0.15);
                color: #ef4444;
                font-size: 0.88rem;
              }

              .auth-submit-btn {
                height: 48px;
                border-radius: var(--radius);
                background: var(--accent);
                border: none;
                color: #fff;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s ease;
                margin-top: 8px;
                box-shadow: 0 4px 14px var(--accent-shadow);
              }

              .auth-submit-btn:hover:not(:disabled) {
                background: var(--accent-hover);
                transform: translateY(-1px);
                box-shadow: 0 6px 20px var(--accent-shadow);
              }

              .auth-submit-btn:disabled {
                opacity: 0.55;
                cursor: not-allowed;
              }
              .spin-icon { animation: spin 0.8s linear infinite; }

              .login-toggle-footer {
                margin-top: 28px;
                text-align: center;
              }

              .toggle-text {
                font-size: 0.92rem;
                color: var(--secondary-foreground);
                line-height: 1.5;
              }

              .toggle-link-red {
                color: var(--accent);
                font-weight: 600;
                cursor: pointer;
                transition: color 0.15s;
                margin-left: 4px;
              }

              .toggle-link-red:hover {
                color: var(--accent-hover);
                text-decoration: underline;
              }
            `}</style>
          </div>
        ) : currentPath === "/builder" && currentUser ? (
          <Dashboard currentUser={currentUser} />
        ) : (
          <LandingPage onStart={() => navigate("/login")} />
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
